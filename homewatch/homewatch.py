#!/usr/bin/env python3
"""Redirect LG webOS Home to OmarchyTV from a LAN-side watcher."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import ssl
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import websockets

FOREGROUND_URI = "ssap://com.webos.applicationManager/getForegroundAppInfo"
POWER_URI = "ssap://com.webos.service.tvpower/power/getPowerState"
LAUNCH_URI = "ssap://system.launcher/launch"
DEFAULT_HOME_APP_IDS = frozenset({"com.webos.app.home", "com.webos.launcher"})
DEFAULT_SCREENSAVER_APP_IDS = frozenset({"com.webos.app.screensaver", "com.webos.screensaver"})
REDIRECT_DEBOUNCE_SEC = 1.0
LOG = logging.getLogger("homewatch")


@dataclass(frozen=True)
class WatchConfig:
    tv_ip: str
    target_app_id: str = "com.omarchytv.home"
    home_app_ids: frozenset[str] = DEFAULT_HOME_APP_IDS
    screensaver_app_ids: frozenset[str] = DEFAULT_SCREENSAVER_APP_IDS
    state_file: Path = Path("/data/client-key.json")
    uri: str | None = None
    reconnect_initial_sec: float = 2.0
    reconnect_max_sec: float = 30.0
    pairing_timeout_sec: float = 120.0

    @property
    def websocket_uris(self) -> tuple[str, ...]:
        if self.uri:
            return (self.uri,)
        # LG moved newer TV firmware (including webOS 23/24 models) to TLS SSAP.
        # Fall back to the legacy endpoint for older sets.
        return (f"wss://{self.tv_ip}:3001", f"ws://{self.tv_ip}:3000")


class HomeWatcher:
    """Maintain one SSAP session and redirect LG Home to the target app."""

    def __init__(self, config: WatchConfig) -> None:
        self.config = config
        self.client_key: str | None = self._load_client_key()
        self.current_app_id: str | None = None
        self.power_state: str | None = None
        self.pending_home = False
        self.last_redirect_at: float | None = None
        self._request_id = 0

    def _load_client_key(self) -> str | None:
        try:
            data = json.loads(self.config.state_file.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                value = data.get("client-key")
                return value if isinstance(value, str) and value else None
            return None
        except (OSError, json.JSONDecodeError):
            return None

    def _save_client_key(self, key: str) -> None:
        path = self.config.state_file
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as stream:
                json.dump({"client-key": key}, stream)
                stream.write("\n")
                stream.flush()
                os.fsync(stream.fileno())
            os.chmod(temp_name, 0o600)
            os.replace(temp_name, path)
        finally:
            try:
                os.unlink(temp_name)
            except FileNotFoundError:
                pass
        self.client_key = key

    def _registration_payload(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "forcePairing": False,
            "pairingType": "PROMPT",
            "manifest": {
                "manifestVersion": 1,
                "appVersion": "1.0",
                "permissions": ["READ_RUNNING_APPS", "READ_POWER_STATE", "CONTROL_POWER", "LAUNCH"],
            },
        }
        if self.client_key:
            payload["client-key"] = self.client_key
        return payload

    async def _register(self, websocket: Any) -> None:
        await websocket.send(json.dumps({
            "type": "register", "id": "homewatch-register", "payload": self._registration_payload(),
        }))
        deadline = asyncio.get_running_loop().time() + self.config.pairing_timeout_sec
        pairing_notice_sent = False
        while True:
            remaining = deadline - asyncio.get_running_loop().time()
            if remaining <= 0:
                raise TimeoutError("timed out waiting for SSAP pairing; accept the prompt on the TV")
            raw = await asyncio.wait_for(websocket.recv(), timeout=remaining)
            message = self._decode_message(raw)
            if message.get("type") == "response" and (message.get("payload") or {}).get("pairingType"):
                if not pairing_notice_sent:
                    LOG.info("event=pairing_pending tv=%s action=accept_prompt_on_tv", self.config.tv_ip)
                    pairing_notice_sent = True
            elif message.get("type") == "registered":
                key = (message.get("payload") or {}).get("client-key") or self.client_key
                if not isinstance(key, str) or not key:
                    raise RuntimeError("TV registered the client without returning a client-key")
                if key != self.client_key:
                    self._save_client_key(key)
                return
            elif message.get("type") == "error":
                raise RuntimeError(f"SSAP registration rejected: {message.get('error', 'unknown error')}")

    async def run_connection(self) -> None:
        last_error: Exception | None = None
        for index, uri in enumerate(self.config.websocket_uris):
            connect_options: dict[str, Any] = {
                "open_timeout": 5,
                "ping_interval": 20,
                "ping_timeout": 20,
                "max_size": 1024 * 1024,
            }
            if uri.startswith("wss://"):
                context = ssl.create_default_context()
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                connect_options["ssl"] = context
            try:
                websocket = await websockets.connect(uri, **connect_options)
            except (OSError, TimeoutError, websockets.exceptions.WebSocketException) as exc:
                last_error = exc
                if index + 1 < len(self.config.websocket_uris):
                    continue
                raise
            async with websocket:
                await self._run_session(websocket, uri)
            return
        if last_error:
            raise last_error

    async def _run_session(self, websocket: Any, uri: str) -> None:
        await self._register(websocket)
        LOG.info("event=connected tv=%s transport=%s", self.config.tv_ip, uri.split(":")[0])
        # A fresh session must obtain power state before the foreground snapshot.
        self.current_app_id = None
        self.power_state = None
        self.pending_home = False
        self.last_redirect_at = None
        await websocket.send(json.dumps({
            "type": "subscribe", "id": "power", "uri": POWER_URI, "payload": {},
        }))
        await websocket.send(json.dumps({
            "type": "subscribe", "id": "foreground", "uri": FOREGROUND_URI, "payload": {},
        }))
        async for raw in websocket:
            message = self._decode_message(raw)
            message_id = message.get("id")
            payload = message.get("payload") or {}
            if message.get("type") == "error" and message_id in {"power", "foreground"}:
                LOG.warning(
                    "event=subscription_error tv=%s subscription=%s error=%s",
                    self.config.tv_ip, message_id, message.get("error", "unknown error"),
                )
            elif message_id == "power":
                self.power_state = self._power_value(payload)
                if self.pending_home and not self._tv_is_not_active() and self.current_app_id:
                    self.pending_home = False
                    await self._on_foreground(websocket, self.current_app_id, force=True)
            elif message_id == "foreground":
                app_id = self._app_id(payload)
                if app_id:
                    await self._on_foreground(websocket, app_id)

    async def _on_foreground(self, websocket: Any, app_id: str, force: bool = False) -> None:
        # Subscriptions may repeat a snapshot; count app transitions, not duplicate frames.
        if app_id == self.current_app_id and not force:
            return
        self.current_app_id = app_id

        if app_id not in self.config.home_app_ids:
            self.pending_home = False
            return

        if app_id == self.config.target_app_id or self._is_screensaver(app_id):
            self.pending_home = False
            return
        if self._tv_is_not_active():
            self.pending_home = True
            return
        self.pending_home = False

        now = time.monotonic()
        if self.last_redirect_at is not None and now - self.last_redirect_at < REDIRECT_DEBOUNCE_SEC:
            return
        self._request_id += 1
        request_id = f"homewatch-launch-{self._request_id}"
        await websocket.send(json.dumps({
            "type": "request",
            "id": request_id,
            "uri": LAUNCH_URI,
            "payload": {"id": self.config.target_app_id},
        }))
        self.last_redirect_at = now
        LOG.info("event=redirect tv=%s from=%s target=%s", self.config.tv_ip, app_id, self.config.target_app_id)

    def _is_screensaver(self, app_id: str) -> bool:
        return app_id in self.config.screensaver_app_ids or self._power_is_screensaver()

    def _power_is_screensaver(self) -> bool:
        state = (self.power_state or "").strip().lower().replace("_", " ")
        return "screen saver" in state or "screensaver" in state

    def _tv_is_not_active(self) -> bool:
        state = (self.power_state or "").strip().lower()
        return state not in {"active", "on", "awake"}

    @staticmethod
    def _decode_message(raw: str | bytes) -> dict[str, Any]:
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")
        decoded = json.loads(raw)
        return decoded if isinstance(decoded, dict) else {}

    @staticmethod
    def _power_value(payload: dict[str, Any]) -> str | None:
        value = payload.get("state") or payload.get("powerState") or payload.get("power")
        return str(value) if value is not None else None

    @staticmethod
    def _app_id(payload: dict[str, Any]) -> str | None:
        value = payload.get("appId")
        if isinstance(value, str):
            return value
        info = payload.get("appInfo")
        if isinstance(info, dict) and isinstance(info.get("appId"), str):
            return info["appId"]
        foreground = payload.get("foregroundAppInfo")
        if isinstance(foreground, dict) and isinstance(foreground.get("appId"), str):
            return foreground["appId"]
        if isinstance(foreground, list) and foreground and isinstance(foreground[0], dict):
            value = foreground[0].get("appId")
            return value if isinstance(value, str) else None
        return None

    async def run_forever(self) -> None:
        delay = self.config.reconnect_initial_sec
        while True:
            try:
                await self.run_connection()
                reason = "socket_closed"
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                reason = f"{type(exc).__name__}:{exc}".replace("\\n", " ")
            LOG.info("event=reconnect tv=%s reason=%s delay_sec=%.1f", self.config.tv_ip, reason, delay)
            await asyncio.sleep(delay)
            delay = min(max(delay * 2, self.config.reconnect_initial_sec), self.config.reconnect_max_sec)


def _csv_set(value: str | None, default: frozenset[str]) -> frozenset[str]:
    if not value:
        return default
    return frozenset(part.strip() for part in value.split(",") if part.strip())


def config_from_env() -> WatchConfig:
    tv_ip = os.environ.get("TV_IP", "").strip()
    if not tv_ip:
        raise SystemExit("TV_IP is required (set it in the environment or .env file)")
    return WatchConfig(
        tv_ip=tv_ip,
        target_app_id=os.environ.get("TARGET_APP_ID", "com.omarchytv.home").strip(),
        home_app_ids=_csv_set(os.environ.get("HOME_APP_IDS"), DEFAULT_HOME_APP_IDS),
        screensaver_app_ids=_csv_set(os.environ.get("SCREENSAVER_APP_IDS"), DEFAULT_SCREENSAVER_APP_IDS),
        state_file=Path(os.environ.get("STATE_FILE", "/data/client-key.json")),
        uri=os.environ.get("SSAP_URL", "").strip() or None,
    )


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%Y-%m-%dT%H:%M:%S%z")
    config = config_from_env()
    try:
        asyncio.run(HomeWatcher(config).run_forever())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
