# OmarchyTV Home watcher for LG webOS

`homewatch.py` runs on an always-on computer on the TV's LAN. It watches LG's SSAP foreground-app and power-state subscriptions; when LG Home appears, it launches OmarchyTV (`com.omarchytv.home`). The watcher is external to the TV and does not modify the existing `.ipk` or webOS app.

This is an opt-in convenience layer, not a Home-button replacement inside webOS. Stopping or removing the watcher restores completely stock Home-button behavior immediately; it does not change TV settings or disable any TV feature.

## What to expect

- Press **Home** once from another app: the watcher launches OmarchyTV when LG Home becomes foreground.
- Press **Home** again **at least one second, but less than three seconds, after the first Home surface**: the watcher treats that as an escape request, leaves stock LG Home visible, and stays out of the way until foreground leaves LG Home. It ignores sub-second Home/app flaps so one press doesn't accidentally trigger the escape hatch; it then re-arms.
- It does not redirect when OmarchyTV is already foreground, when the power-state subscription says the TV is not active, or while the screensaver is reported. Duplicate foreground notifications are ignored.
- It reconnects with exponential backoff after the TV or network returns. Pairing's SSAP `client-key` is stored in the configured state file and reused after restarts and TV power cycles.
- The host must stay awake and be on the same LAN/subnet as the TV. A laptop that sleeps only redirects Home while it is awake and at home.

### webOS 23/24 transport note

The watcher tries secure SSAP (`wss://TV_IP:3001`) first, which is the transport used by newer LG firmware, then falls back to legacy `ws://TV_IP:3000` for older sets. The SSAP certificate is self-signed, so the client encrypts the connection but cannot validate the TV certificate chain. Set `SSAP_URL` only if you want to pin a transport explicitly.

The common LG Home app id is `com.webos.app.home`; `com.webos.launcher` is included as a compatibility candidate. If your model reports a different id, set `HOME_APP_IDS` to a comma-separated list containing the actual id. The target defaults to `com.omarchytv.home`.

## Pairing: SSAP is separate from Developer Mode SSH

The watcher registers through LG's SSAP remote-control WebSocket and asks for a one-time on-screen pairing acceptance. The returned SSAP client key is persisted locally. This pairing is separate from Developer Mode's SSH Key Server/passphrase flow:

- **The watcher does not depend on Developer Mode being enabled.** Keep Developer Mode active because your existing OmarchyTV `.ipk` was installed through it; that app's availability is separate from SSAP.
- The watcher itself does **not** use the Developer Mode Key Server, its SSH passphrase, port `9922`, `ares-cli`, or an SSH key. It uses SSAP on port `3001` (newer sets) or `3000` (legacy sets) and its own on-TV pairing prompt.
- On first start, keep the TV powered on, start the watcher, and accept the remote-control/SSAP pairing prompt on the TV. No Key Server toggle is needed for this pairing.
- The registration requests `READ_RUNNING_APPS`, `READ_POWER_STATE`, `CONTROL_POWER`, and `LAUNCH`. Some LG firmware requires `CONTROL_POWER` to read power state; this watcher uses that permission only for the power-state subscription and never sends power-control commands. If updating from an earlier watcher build, a fresh SSAP pairing is needed for the TV to grant the added permission.

If no prompt appears or registration is rejected, confirm the TV and watcher host share the LAN, the SSAP port is reachable, and the saved state file is writable. Remove the persisted `client-key` only if you intentionally want to pair that watcher again.

## Docker Compose — UGREEN NAS / Synology-style layout

This service publishes **no ports**. It makes outbound SSAP connections to the TV over one dedicated Docker bridge network. `DATA_DIR` defaults to the UGREEN path below; set it in `.env` to an absolute persistent directory on other hosts. Copy this `homewatch/` folder to the deployment host, then from that folder:

```bash
mkdir -p /volume2/docker/omarchytv-homewatch
```

```bash
chown -R 1000:1000 /volume2/docker/omarchytv-homewatch
```

```bash
cp .env.example .env
```

Edit `.env` and set `TV_IP` to the TV's reserved/static LAN address. On non-UGREEN hosts, set `DATA_DIR` to an absolute persistent directory; set `PUID`/`PGID` if UID/GID 1000 is not appropriate. Create that directory and make it writable by the selected UID/GID.

```bash
docker compose up -d --build
```

```bash
docker compose logs -f homewatch
```

On first connection, accept the pairing prompt on the TV. The key is written to `/volume2/docker/omarchytv-homewatch/client-key.json` via the `/data` bind mount. Back up this file with the rest of the service config; do not publish it. To stop the watcher:

```bash
docker compose down
```

Stopping the service immediately returns Home handling to LG's stock behavior. To use this repo checkout directly, run Compose from `homewatch/` and ensure the host bind-mount directory exists first.

### Portainer Stack deployment

Yes—if the UGREEN NAS is your always-on Docker host, deploy this as a **Portainer Stack**. Set `TV_IP` as a required Stack environment variable; `DATA_DIR` defaults to `/volume2/docker/omarchytv-homewatch` and can be overridden for other hosts. `PUID` and `PGID` default to `1000`. Use repository compose path `homewatch/docker-compose.yml`; the Docker build context is the `homewatch/` directory. Ensure `DATA_DIR` exists and is writable by the selected UID/GID. No ports need to be published.

For Portainer's Git deployment flow, the selected repository branch must contain the `homewatch/` files. Alternatively, copy the folder to the NAS and run `docker compose up -d --build` from that directory.

## Raspberry Pi systemd option

Use a current Raspberry Pi OS with Python 3 and network access to the TV. Install the watcher under `/opt/omarchytv-homewatch`, create a service account, and install the one runtime dependency in a virtual environment:

```bash
sudo useradd --system --home /var/lib/omarchytv-homewatch --create-home homewatch
```

```bash
sudo mkdir -p /opt/omarchytv-homewatch
sudo cp homewatch.py requirements.txt omarchytv-homewatch.service /opt/omarchytv-homewatch/
sudo python3 -m venv /opt/omarchytv-homewatch/.venv
sudo /opt/omarchytv-homewatch/.venv/bin/pip install -r /opt/omarchytv-homewatch/requirements.txt
sudo chown -R root:root /opt/omarchytv-homewatch
```

Create `/etc/omarchytv-homewatch.env` with at least the TV address and any watcher variables you need (for example `TARGET_APP_ID`, `HOME_APP_IDS`, `SCREENSAVER_APP_IDS`, `ESCAPE_WINDOW_SEC`, or `SSAP_URL`). The unit sets `STATE_FILE` under `/var/lib`; Docker-only `DATA_DIR`, `PUID`, and `PGID` are not used by systemd.

```ini
TV_IP=192.168.1.50
TARGET_APP_ID=com.omarchytv.home
HOME_APP_IDS=com.webos.app.home,com.webos.launcher
SCREENSAVER_APP_IDS=com.webos.app.screensaver,com.webos.screensaver
ESCAPE_WINDOW_SEC=3
```

Install the included unit, then enable and start it:

```bash
sudo cp /opt/omarchytv-homewatch/omarchytv-homewatch.service /etc/systemd/system/
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now omarchytv-homewatch.service
```

```bash
sudo journalctl -u omarchytv-homewatch.service -f
```

The SSAP client key is stored at `/var/lib/omarchytv-homewatch/client-key.json`. Stop or disable the service to restore stock LG Home behavior:

```bash
sudo systemctl disable --now omarchytv-homewatch.service
```

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `TV_IP` | required | TV LAN IPv4 address or hostname. |
| `DATA_DIR` | `/volume2/docker/omarchytv-homewatch` | Host directory bind-mounted at `/data` for the persistent SSAP client key; set an absolute path for other Docker hosts. |
| `PUID` | `1000` | Container user ID; ensure `DATA_DIR` is writable by this ID. |
| `PGID` | `1000` | Container group ID; ensure `DATA_DIR` is writable by this group. |
| `TARGET_APP_ID` | `com.omarchytv.home` | App launched when LG Home surfaces. |
| `HOME_APP_IDS` | `com.webos.app.home,com.webos.launcher` | Comma-separated foreground app ids treated as LG Home. |
| `SCREENSAVER_APP_IDS` | `com.webos.app.screensaver,com.webos.screensaver` | Comma-separated screensaver app ids to ignore. Power-state detection also suppresses redirects. |
| `ESCAPE_WINDOW_SEC` | `3` | Time window for the second-Home escape. |
| `STATE_FILE` | `/data/client-key.json` | Local JSON file used to persist the SSAP pairing key. |
| `SSAP_URL` | automatic | Optionally pin a full `wss://host:3001` or `ws://host:3000` URL. |

## Tests

The unit/integration tests run an in-process fake SSAP WebSocket server and cover Home redirection, double-Home escape and re-arm, no redirect when OmarchyTV is already foreground, screensaver suppression, and reconnect after a dropped socket.

```bash
python3 -m unittest discover -s tests -v
```

## Limits

The tests validate the SSAP protocol flow and watcher policy against a fake server; they cannot verify model-specific foreground app ids, pairing prompts, exact redirect time, or transport behavior on your physical webOS 23/24 TV. Confirm the Home app id if a particular model uses a different one, and report the model/firmware if you find one. The expected latency depends on the TV's notification timing and app launch time; this repo change has not been exercised on a physical TV.

## References

- [LG Developer Mode app guide](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app) — LG documents the Key Server and passphrase for its CLI/SSH developer-device setup; that workflow is separate from SSAP remote-control pairing.
- [webOS Homebrew command cheatsheet](https://www.webosbrew.org/pages/commands-cheatsheet) — foreground-app and power-state SSAP endpoints.
- [webOS-vibehack Home watcher](https://github.com/OmkarK97/webos-vibehack) — behavioral precedent for external Home redirection and the common `com.webos.app.home` id.
- [lgtv2 documentation](https://github.com/GermanBluefox/lgtv2) — modern secure SSAP (`wss://:3001`) and legacy (`ws://:3000`) transport behavior.
