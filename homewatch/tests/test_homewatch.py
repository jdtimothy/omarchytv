import asyncio
import json
import tempfile
import unittest
from pathlib import Path

from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosed

from homewatch import HomeWatcher, WatchConfig


class FakeSsapServer:
    def __init__(self):
        self.connections = []
        self.registrations = []
        self.launches = []
        self.connection_events = asyncio.Queue()
        self.power_subscriptions = asyncio.Queue()
        self.launch_events = asyncio.Queue()
        self.subscribed = asyncio.Event()
        self.drop_first = False

    async def handler(self, websocket):
        try:
            await self._handle(websocket)
        except ConnectionClosed:
            pass

    async def _handle(self, websocket):
        self.connections.append(websocket)
        await self.connection_events.put(websocket)
        async for raw in websocket:
            message = json.loads(raw)
            if message.get("type") == "register":
                self.registrations.append(message["payload"])
                await websocket.send(json.dumps({
                    "type": "registered",
                    "id": message["id"],
                    "payload": {"client-key": "fake-client-key"},
                }))
            elif message.get("type") == "subscribe":
                if message["id"] == "power":
                    payload = {"state": "Active"}
                else:
                    payload = {"appId": "com.example.video"}
                await websocket.send(json.dumps({
                    "type": "response", "id": message["id"], "payload": payload,
                }))
                if message["id"] == "power":
                    self.power_subscriptions.put_nowait(websocket)
                    self.subscribed.set()
                    if self.drop_first and len(self.connections) == 1:
                        await websocket.close(code=1011, reason="test reconnect")
                        return
            elif message.get("type") == "request" and message.get("uri") == "ssap://system.launcher/launch":
                self.launches.append(message["payload"])
                await self.launch_events.put(message["payload"])
                await websocket.send(json.dumps({
                    "type": "response", "id": message["id"], "payload": {"returnValue": True},
                }))

    async def send_foreground(self, app_id, connection_index=-1):
        await self.connections[connection_index].send(json.dumps({
            "type": "response", "id": "foreground", "payload": {"appId": app_id},
        }))

    async def send_power(self, state, connection_index=-1):
        await self.connections[connection_index].send(json.dumps({
            "type": "response", "id": "power", "payload": {"state": state},
        }))


class HomeWatcherIntegrationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.state_file = Path(self.temp.name) / "state.json"
        self.fake = FakeSsapServer()
        self.server = await serve(self.fake.handler, "127.0.0.1", 0)
        self.port = self.server.sockets[0].getsockname()[1]
        self.config = WatchConfig(
            tv_ip="127.0.0.1",
            target_app_id="com.omarchytv.home",
            home_app_ids=frozenset({"com.webos.app.home", "com.webos.launcher"}),
            screensaver_app_ids=frozenset({"com.webos.app.screensaver"}),
            state_file=self.state_file,
            uri=f"ws://127.0.0.1:{self.port}",
            reconnect_initial_sec=0.01,
            reconnect_max_sec=0.05,
        )
        self.watcher = HomeWatcher(self.config)

    async def asyncTearDown(self):
        if getattr(self, "task", None):
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        self.server.close()
        await self.server.wait_closed()
        self.temp.cleanup()

    async def start_watcher(self):
        self.task = asyncio.create_task(self.watcher.run_forever())
        await asyncio.wait_for(self.fake.subscribed.wait(), 1)
        await asyncio.wait_for(self.fake.power_subscriptions.get(), 1)
        await asyncio.sleep(0.01)

    async def test_registration_requests_power_status_control_permission(self):
        await self.start_watcher()

        permissions = self.fake.registrations[0]["manifest"]["permissions"]
        self.assertIn("READ_POWER_STATE", permissions)
        self.assertIn("CONTROL_POWER", permissions)

    async def test_redirects_when_lg_home_becomes_foreground(self):
        await self.start_watcher()

        await self.fake.send_foreground("com.webos.app.home")
        launch = await asyncio.wait_for(self.fake.launch_events.get(), 1)

        self.assertEqual(launch, {"id": "com.omarchytv.home"})
        self.assertEqual(self.fake.launches, [launch])
        self.assertEqual(json.loads(self.state_file.read_text())["client-key"], "fake-client-key")

    async def test_rapid_home_foreground_notification_is_debounced(self):
        await self.start_watcher()
        await self.fake.send_foreground("com.webos.app.home")
        await asyncio.wait_for(self.fake.launch_events.get(), 1)
        await self.fake.send_foreground("com.webos.app.home")
        await asyncio.sleep(0.03)

        self.assertEqual(len(self.fake.launches), 1)

    async def test_home_from_target_always_redirects(self):
        await self.start_watcher()
        await self.fake.send_foreground("com.webos.app.home")
        await asyncio.wait_for(self.fake.launch_events.get(), 1)
        await self.fake.send_foreground("com.omarchytv.home")
        await asyncio.sleep(0.05)

        await self.fake.send_foreground("com.webos.app.home")
        launch = await asyncio.wait_for(self.fake.launch_events.get(), 1)

        self.assertEqual(launch, {"id": "com.omarchytv.home"})
        self.assertEqual(len(self.fake.launches), 2)

    async def test_does_not_redirect_when_target_is_already_foreground(self):
        await self.start_watcher()

        await self.fake.send_foreground("com.omarchytv.home")
        await asyncio.sleep(0.03)

        self.assertEqual(self.fake.launches, [])

    async def test_does_not_redirect_during_screensaver(self):
        await self.start_watcher()
        await self.fake.send_power("Screen Saver")
        await asyncio.sleep(0.01)

        await self.fake.send_foreground("com.webos.app.home")
        await asyncio.sleep(0.03)

        self.assertEqual(self.fake.launches, [])

    async def test_does_not_redirect_when_power_state_is_not_active(self):
        await self.start_watcher()
        await self.fake.send_power(None)
        await asyncio.sleep(0.01)

        await self.fake.send_foreground("com.webos.app.home")
        await asyncio.sleep(0.03)

        self.assertEqual(self.fake.launches, [])

    async def test_defers_home_redirect_until_power_state_is_active(self):
        await self.start_watcher()
        await self.fake.send_power(None)
        await asyncio.sleep(0.01)
        await self.fake.send_foreground("com.webos.app.home")
        await asyncio.sleep(0.02)
        self.assertEqual(self.fake.launches, [])

        await self.fake.send_power("Active")
        launch = await asyncio.wait_for(self.fake.launch_events.get(), 1)
        self.assertEqual(launch, {"id": "com.omarchytv.home"})

    async def test_reconnects_after_socket_drop(self):
        self.fake.drop_first = True
        await self.start_watcher()
        await asyncio.wait_for(self.fake.power_subscriptions.get(), 1)
        while len(self.fake.connections) < 2:
            await asyncio.sleep(0.01)

        await self.fake.send_foreground("com.webos.app.home", connection_index=1)
        launch = await asyncio.wait_for(self.fake.launch_events.get(), 1)
        self.assertEqual(launch, {"id": "com.omarchytv.home"})
        self.assertEqual(len(self.fake.connections), 2)
        self.assertEqual(self.fake.registrations[1]["client-key"], "fake-client-key")
        self.assertEqual(json.loads(self.state_file.read_text())["client-key"], "fake-client-key")


if __name__ == "__main__":
    unittest.main()
