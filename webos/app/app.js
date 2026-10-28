(function () {
  "use strict";

  var DATA = window.OMARCHY_DATA || { version: "2.11.0-testing", themes: {}, wallpapers: {}, logo: "OMARCHY TV", notice: "" };
  var START_TIME = Date.now() - (42 * 60 * 1000); // default 42m uptime look

  var STRINGS = {
    en: {
      tip_wifi: "Wi-Fi & network", tip_bt: "Bluetooth", tip_vol: "Audio", tip_inputs: "Inputs (TV / HDMI)", tip_saver: "Start screensaver",
      box_weather: "weather", box_pc: "omarchy · pc", box_ai: "ai credits · pc", box_tv: "tv", box_app: "app", box_ws_pc: "pc", box_system: "system",
      term_theme: "theme ", term_net: "net ", term_up: "up ",
      pc_not_connected: "pc not connected",
      hint_tv: "OK watch TV · ▲ bar · long OK: Walker",
      hint_app: "OK open · ▲ bar · long OK: Move / Hide",
      hint_ws2: "OK switch input · ▲ bar · 1-5 workspaces",
      hint_ws3: "OK open · long OK: Move / Hide · 1-5 workspaces",
      ws4_heading: "Connect Omarchy Linux",
      ws4_desc: "Pair the PC over LAN HTTP (http://<pc-ip>:8765/status.json) to see live CPU/RAM, AI credits and deploys on LG webOS.",
      sys_webos: "webOS TV settings", sys_themes: "Themes", sys_trans: "Transparency", sys_widgets: "Home widgets",
      sys_arrange: "Arrange panels", sys_saver: "Screensaver", sys_saver_idle: "Start screensaver after",
      sys_logo_anim: "Animated logo", sys_text_tiles: "Text tiles (terminal style)", sys_all: "All OmarchyTV settings", sys_about: "About & licences",
      wx_title: "Weather", wx_auto: "Automatic (from IP)", wx_search: "Search city…", wx_unit: "Temperature unit",
      wx_min: "min ", wx_max: "max ",
      wmo: { 0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 51: "drizzle", 61: "rain", 71: "snow", 80: "showers", 95: "thunderstorm" }
    },
    it: {
      tip_wifi: "Wi-Fi e rete", tip_bt: "Bluetooth", tip_vol: "Audio", tip_inputs: "Ingressi (TV / HDMI)", tip_saver: "Avvia salvaschermo",
      box_weather: "meteo", box_pc: "omarchy · pc", box_ai: "crediti ia · pc", box_tv: "tv", box_app: "app", box_ws_pc: "pc", box_system: "sistema",
      term_theme: "tema ", term_net: "rete ", term_up: "up ",
      pc_not_connected: "pc non connesso",
      hint_tv: "OK guarda TV · ▲ barra · OK lungo: Walker",
      hint_app: "OK apri · ▲ barra · OK lungo: Sposta / Nascondi",
      hint_ws2: "OK cambia ingresso · ▲ barra · 1-5 spazi",
      hint_ws3: "OK apri · OK lungo: Sposta / Nascondi · 1-5 spazi",
      ws4_heading: "Collega Omarchy Linux",
      ws4_desc: "Abbina il PC via HTTP LAN (http://<ip-pc>:8765/status.json) per vedere stato, crediti IA e deploy qui.",
      sys_webos: "Impostazioni TV webOS", sys_themes: "Temi", sys_trans: "Trasparenza", sys_widgets: "Widget della Home",
      sys_arrange: "Disponi pannelli", sys_saver: "Salvaschermo", sys_saver_idle: "Avvia salvaschermo dopo",
      sys_logo_anim: "Logo animato", sys_text_tiles: "Tile solo testo (stile terminale)", sys_all: "Tutte le impostazioni OmarchyTV", sys_about: "Info e licenze",
      wx_title: "Meteo", wx_auto: "Automatica (da IP)", wx_search: "Cerca città…", wx_unit: "Unità temperatura",
      wx_min: "min ", wx_max: "max ",
      wmo: { 0: "sereno", 1: "poco nuvoloso", 2: "parz. nuvoloso", 3: "coperto", 45: "nebbia", 51: "pioviggine", 61: "pioggia", 71: "neve", 80: "rovesci", 95: "temporale" }
    },
    de: {
      tip_wifi: "WLAN & Netzwerk", tip_bt: "Bluetooth", tip_vol: "Audio", tip_inputs: "Eingänge (TV / HDMI)", tip_saver: "Bildschirmschoner starten",
      box_weather: "wetter", box_pc: "omarchy · pc", box_ai: "ki-guthaben · pc", box_tv: "tv", box_app: "app", box_ws_pc: "pc", box_system: "system",
      term_theme: "thema ", term_net: "netz ", term_up: "up ",
      pc_not_connected: "pc nicht verbunden",
      hint_tv: "OK TV ansehen · ▲ Leiste · lang OK: Walker",
      hint_app: "OK öffnen · ▲ Leiste · lang OK: Verschieben / Ausblenden",
      hint_ws2: "OK Eingang wechseln · ▲ Leiste · 1-5 Arbeitsbereiche",
      hint_ws3: "OK öffnen · lang OK: Verschieben / Ausblenden · 1-5 Arbeitsbereiche",
      ws4_heading: "Omarchy Linux verbinden",
      ws4_desc: "Koppeln Sie den PC über LAN HTTP (http://<pc-ip>:8765/status.json), um Status, KI-Guthaben und Deploys anzuzeigen.",
      sys_webos: "webOS TV-Einstellungen", sys_themes: "Themen", sys_trans: "Transparenz", sys_widgets: "Startseiten-Widgets",
      sys_arrange: "Panels anordnen", sys_saver: "Bildschirmschoner", sys_saver_idle: "Bildschirmschoner starten nach",
      sys_logo_anim: "Animiertes Logo", sys_text_tiles: "Text-Kacheln (Terminal-Stil)", sys_all: "Alle OmarchyTV-Einstellungen", sys_about: "Info & Lizenzen",
      wx_title: "Wetter", wx_auto: "Automatisch (über IP)", wx_search: "Stadt suchen…", wx_unit: "Temperatureinheit",
      wx_min: "Min ", wx_max: "Max ",
      wmo: { 0: "klar", 1: "überwiegend klar", 2: "teilweise bewölkt", 3: "bedeckt", 45: "Nebel", 51: "Nieselregen", 61: "Regen", 71: "Schnee", 80: "Schauer", 95: "Gewitter" }
    }
  };

  var DEFAULT_CFG = {
    theme: "tokyo-night",
    lang: "",
    opacity: 0.75,
    wallpaperDim: 0,
    wallpaperIdx: 0,
    proceduralBg: false,
    tempUnit: "C",
    weatherCity: "Alessandria",
    weatherLat: 44.913,
    weatherLon: 8.615,
    logoAnim: true,
    textTiles: false,
    tvEnabled: true,
    saverIdleMin: 2.5,
    saverLogoScale: 0.65,
    saverShowClock: false,
    promptUser: "user",
    promptHost: "omarchytv",
    pcHost: "",
    pcSimulated: false,
    widgets: { term: true, weather: true, pc: true, ai: true, deploy: false },
    hiddenApps: []
  };

  var cfg = Object.assign({}, DEFAULT_CFG);
  try {
    var saved = localStorage.getItem("omarchytv_cfg_2110");
    if (saved) cfg = Object.assign({}, DEFAULT_CFG, JSON.parse(saved));
  } catch (e) {}

  function saveCfg() {
    try { localStorage.setItem("omarchytv_cfg_2110", JSON.stringify(cfg)); } catch (e) {}
  }

  function getLang() {
    if (cfg.lang && STRINGS[cfg.lang]) return cfg.lang;
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return STRINGS[nav] ? nav : "en";
  }

  function tr(key) {
    var l = getLang();
    return (STRINGS[l] && STRINGS[l][key]) || STRINGS.en[key] || key;
  }

  var DEFAULT_APPS = [
    { id: "tv", name: "TV", appId: "com.webos.app.livetv", brand: "tv" },
    { id: "disney", name: "Disney+", appId: "com.disney.disneyplus-prod", brand: "disney", bg: "radial-gradient(circle at 50% 35%, #113ccf 0%, #050b24 85%)", fg: "#ffffff", sub: "DISNEY+" },
    { id: "netflix", name: "Netflix", appId: "netflix", brand: "netflix", bg: "linear-gradient(135deg, #1b0000 0%, #090909 100%)", fg: "#e50914", sub: "NETFLIX" },
    { id: "plex", name: "Plex", appId: "cdp-30", brand: "plex", bg: "linear-gradient(135deg, #1f2326 0%, #121417 100%)", fg: "#e5a00d", sub: "plex" },
    { id: "prime", name: "Prime Video", appId: "amazon", brand: "prime", bg: "linear-gradient(135deg, #00273d 0%, #05111a 100%)", fg: "#00a8e1", sub: "prime video" },
    { id: "spotify", name: "Spotify", appId: "spotify-beehive", brand: "spotify", bg: "linear-gradient(135deg, #0c2916 0%, #080d0a 100%)", fg: "#1db954", sub: "Spotify" },
    { id: "youtube", name: "YouTube", appId: "youtube.leanback.v4", brand: "youtube", bg: "linear-gradient(135deg, #2b0707 0%, #0f0f0f 100%)", fg: "#ff0033", sub: "YouTube" },
    { id: "jellyfin", name: "Jellyfin", appId: "org.jellyfin.webos", brand: "jellyfin", bg: "linear-gradient(135deg, #1b112c 0%, #0b0914 100%)", fg: "#aa5cc3", sub: "Jellyfin" },
    { id: "moonlight", name: "Moonlight", appId: "com.limelight.webos", brand: "moonlight", bg: "linear-gradient(135deg, #1b2432 0%, #0d1117 100%)", fg: "#cdd9e5", sub: "Moonlight" },
    { id: "raiplay", name: "RaiPlay", appId: "it.rai.raiplay", brand: "raiplay", bg: "linear-gradient(135deg, #001c44 0%, #000b1e 100%)", fg: "#ffffff", sub: "RaiPlay" },
    { id: "browser", name: "Web Browser", appId: "com.webos.app.browser", brand: "browser", bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", fg: "#38bdf8", sub: "WWW" },
    { id: "settings", name: "LG Settings", appId: "com.palm.app.settings", brand: "settings", bg: "linear-gradient(135deg, #27272a 0%, #18181b 100%)", fg: "#f43f5e", sub: "webOS" }
  ];

  var TV_INPUTS = [
    { id: "livetv", name: "TV", sub: "Live TV", appId: "com.webos.app.livetv" },
    { id: "hdmi1", name: "HDMI 1", sub: "HDMI 1", appId: "com.webos.app.hdmi1" },
    { id: "hdmi2", name: "HDMI 2", sub: "HDMI 2", appId: "com.webos.app.hdmi2" },
    { id: "hdmi3", name: "HDMI 3", sub: "HDMI 3", appId: "com.webos.app.hdmi3" },
    { id: "hdmi4", name: "HDMI 4", sub: "HDMI 4", appId: "com.webos.app.hdmi4" }
  ];

  var state = {
    ws: 0,
    zone: "dock", // "bar", "widgets", "dock", "ws2", "ws3", "ws4", "ws5", "modal", "arrange"
    barIdx: 1,
    widgetIdx: 0,
    dockIdx: 0,
    dockScroll: 0,
    ws2Idx: 0,
    ws3Idx: 0,
    ws4Idx: 0,
    ws5Idx: 0,
    modalOpen: false,
    modalItems: [],
    modalIdx: 0,
    weather: { tempC: 9, minC: 6, maxC: 16, code: 0, city: cfg.weatherCity || "Alessandria" },
    pcStatus: null
  };

  window.__OMARCHY_STATE = state;
  window.__OMARCHY_CFG = cfg;

  function hexToRgba(hex, a) {
    var h = (hex || "#1a1b26").replace("#", "");
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var r = parseInt(h.slice(0,2), 16) || 26;
    var g = parseInt(h.slice(2,4), 16) || 27;
    var b = parseInt(h.slice(4,6), 16) || 38;
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  function currentThemeObj() {
    var t = DATA.themes[cfg.theme] || DATA.themes["tokyo-night"] || {};
    var n = t.normal || {};
    var b = t.bright || {};
    var bg = t.bg || "#1a1b26";
    var fg = t.fg || "#a9b1d6";
    return {
      bg: bg,
      bgAlt: n.black || "#24283b",
      fg: fg,
      fgBright: b.white || fg,
      fgDim: b.black || "#565f89",
      muted: b.black || "#414868",
      accent: t.accent || n.blue || "#7aa2f7",
      accent2: n.magenta || "#bb9af7",
      green: n.green || "#9ece6a",
      yellow: n.yellow || "#e0af68",
      red: n.red || "#f7768e",
      cyan: n.cyan || "#7dcfff"
    };
  }

  function applyTheme() {
    var t = currentThemeObj();
    var r = document.documentElement.style;
    r.setProperty("--t-bg", t.bg);
    r.setProperty("--t-bg-alt", t.bgAlt);
    r.setProperty("--t-fg", t.fg);
    r.setProperty("--t-fg-bright", t.fgBright);
    r.setProperty("--t-fg-dim", t.fgDim);
    r.setProperty("--t-muted", t.muted);
    r.setProperty("--t-accent", t.accent);
    r.setProperty("--t-accent2", t.accent2);
    r.setProperty("--t-green", t.green);
    r.setProperty("--t-yellow", t.yellow);
    r.setProperty("--t-red", t.red);
    r.setProperty("--t-cyan", t.cyan);
    r.setProperty("--win-bg", hexToRgba(t.bg, cfg.opacity));
    r.setProperty("--bar-bg", hexToRgba(t.bg, Math.min(0.88, cfg.opacity + 0.05)));
    r.setProperty("--popup-bg", hexToRgba(t.bg, 0.95));

    var wl = document.getElementById("wallpaper-layer");
    var wlist = DATA.wallpapers[cfg.theme] || [];
    if (cfg.proceduralBg || !wlist.length) {
      wl.style.backgroundImage = "radial-gradient(circle at 75% 20%, " + hexToRgba(t.accent, 0.22) + " 0%, " + t.bg + " 70%)";
    } else {
      var wp = wlist[cfg.wallpaperIdx % wlist.length];
      wl.style.backgroundImage = "url('" + wp + "')";
    }
    var dim = document.getElementById("wallpaper-dim");
    dim.style.background = "rgba(0,0,0," + (cfg.wallpaperDim || 0) + ")";
  }

  function fitStage() {
    var st = document.getElementById("stage");
    var sx = window.innerWidth / 1920;
    var sy = window.innerHeight / 1080;
    var s = Math.min(sx, sy);
    st.style.transform = "scale(" + s + ")";
  }
  window.addEventListener("resize", fitStage);

  function updateClock() {
    var d = new Date();
    var lang = getLang();
    var days = {
      en: ["sun","mon","tue","wed","thu","fri","sat"],
      it: ["dom","lun","mar","mer","gio","ven","sab"],
      de: ["so","mo","di","mi","do","fr","sa"]
    }[lang] || ["sun","mon","tue","wed","thu","fri","sat"];
    var months = {
      en: ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"],
      it: ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"],
      de: ["jan","feb","mär","apr","mai","jun","jul","aug","sep","okt","nov","dez"]
    }[lang] || ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    var h = d.getHours();
    var m = ("0" + d.getMinutes()).slice(-2);
    var timeStr = lang === "en" ? (((h + 11) % 12 + 1) + ":" + m + (h >= 12 ? " PM" : " AM")) : (("0" + h).slice(-2) + ":" + m);
    document.getElementById("bar-clock").textContent = days[d.getDay()] + " " + d.getDate() + " " + months[d.getMonth()] + "  " + timeStr;
  }

  var logoTimer = null;
  function animateLogo() {
    var el = document.getElementById("term-logo");
    var target = DATA.logo || "OMARCHY TV";
    if (logoTimer) clearInterval(logoTimer);
    if (!cfg.logoAnim) {
      el.textContent = target;
      return;
    }
    var glyphs = "░▒▓█▄▀■□▪▫01";
    var step = 0, total = 14;
    logoTimer = setInterval(function () {
      step++;
      if (step >= total) {
        clearInterval(logoTimer);
        logoTimer = null;
        el.textContent = target;
        return;
      }
      var ratio = step / total;
      var out = "";
      for (var i = 0; i < target.length; i++) {
        var ch = target[i];
        if (ch === "\n" || ch === " ") out += ch;
        else if (Math.random() < ratio) out += ch;
        else out += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el.textContent = out;
    }, 65);
  }

  function renderTerminal() {
    var t = currentThemeObj();
    var pr = document.getElementById("term-prompt");
    pr.innerHTML =
      '<span style="color:' + t.green + '">' + cfg.promptUser + '@' + cfg.promptHost + '</span>' +
      '<span style="color:' + t.fg + '">:</span>' +
      '<span style="color:' + t.accent + '">~</span>' +
      '<span style="color:' + t.fg + '">$ </span>' +
      '<span id="term-cursor">█</span>';

    var upMin = Math.max(1, Math.floor((Date.now() - START_TIME) / 60000));
    var upStr = upMin >= 60 ? (Math.floor(upMin / 60) + " h " + (upMin % 60) + " min") : (upMin + " min");
    var info = document.getElementById("term-info");
    info.innerHTML =
      '<span style="color:' + t.accent + '">' + tr("term_theme") + '</span><span style="color:' + t.fg + '">' + cfg.theme + '</span>\n' +
      '<span style="color:' + t.accent + '">' + tr("term_net") + '</span><span style="color:' + t.fg + '">Wi-Fi</span>\n' +
      '<span style="color:' + t.accent + '">' + tr("term_up") + '</span><span style="color:' + t.fg + '">' + upStr + '</span>' +
      '<span style="color:' + t.fgDim + '"> · 2.11.0-testing</span>';
  }

  function fmtTemp(c) {
    if (cfg.tempUnit === "F") {
      return Math.round(c * 9 / 5 + 32) + "°F";
    }
    return Math.round(c) + "°";
  }

  function renderWidgets() {
    document.getElementById("legend-wx").textContent = tr("box_weather");
    document.getElementById("legend-pc").textContent = tr("box_pc");
    document.getElementById("legend-ai").textContent = tr("box_ai");

    document.getElementById("term-box").style.display = cfg.widgets.term ? "block" : "none";
    document.getElementById("wx-box").style.display = cfg.widgets.weather ? "block" : "none";
    document.getElementById("pc-box").style.display = cfg.widgets.pc ? "block" : "none";
    document.getElementById("ai-box").style.display = cfg.widgets.ai ? "block" : "none";
    document.getElementById("deploy-box").style.display = cfg.widgets.deploy ? "block" : "none";

    var wx = state.weather;
    var wmoMap = tr("wmo") || {};
    var cond = wmoMap[wx.code] || "clear";
    document.getElementById("wx-temp").textContent = fmtTemp(wx.tempC);
    document.getElementById("wx-line1").textContent = (wx.city || cfg.weatherCity) + " · " + cond;
    document.getElementById("wx-line2").textContent = tr("wx_min") + fmtTemp(wx.minC) + " · " + tr("wx_max") + fmtTemp(wx.maxC);

    var pcBody = document.getElementById("pc-body");
    var aiBody = document.getElementById("ai-body");
    var ws4Live = document.getElementById("ws4-live-details");

    if (state.pcStatus) {
      var s = state.pcStatus;
      pcBody.style.color = "var(--t-fg)";
      pcBody.textContent = (s.host || "omarchy-pc") + " · " + (s.kernel || "Arch Linux") + "\nCPU " + s.cpu + "%  [████░░░░░░]\nRAM " + s.ram + "%  [██████░░░░]";
      aiBody.style.color = "var(--t-fg)";
      aiBody.textContent = "Claude   $" + (s.claude || "18.40") + " left\nOpenAI   $" + (s.openai || "42.10") + " left\nxAI Grok $" + (s.xai || "95.00") + " left";
      if (ws4Live) {
        ws4Live.textContent = "Connected to " + (s.host || "omarchy-pc") + " (" + (cfg.pcHost || "simulated LAN link") + ")\nCPU: " + s.cpu + "% · RAM: " + s.ram + "% · GPU: " + (s.gpu || "18%") + "\nDeploys: " + (s.deploy || "omarchytv-webos 2.11.0-testing ✓");
      }
    } else {
      pcBody.style.color = "var(--t-fg-dim)";
      pcBody.textContent = tr("pc_not_connected");
      aiBody.style.color = "var(--t-fg-dim)";
      aiBody.textContent = tr("pc_not_connected");
      if (ws4Live) ws4Live.textContent = "";
    }
  }

  function pollPcStatus() {
    if (cfg.pcSimulated) {
      state.pcStatus = { host: "omarchy-workstation", kernel: "Linux 6.14-arch", cpu: 14, ram: 38, gpu: "12%", claude: "24.80", openai: "51.20", xai: "110.00" };
      renderWidgets();
      return Promise.resolve(state.pcStatus);
    }
    if (!cfg.pcHost) {
      state.pcStatus = null;
      renderWidgets();
      return Promise.resolve(null);
    }
    var base = cfg.pcHost.indexOf("http") === 0 ? cfg.pcHost : ("http://" + cfg.pcHost + (cfg.pcHost.indexOf(":") > 0 ? "" : ":8765"));
    var url = base.replace(/\/+$/, "") + "/v1/status";
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      state.pcStatus = j;
      if (j && j.theme && DATA.themes[j.theme] && cfg.syncPcTheme) {
        cfg.theme = j.theme;
        applyTheme();
      }
      renderWidgets();
      return j;
    }).catch(function () {
      state.pcStatus = null;
      renderWidgets();
      return null;
    });
  }

  function fetchWeather() {
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + cfg.weatherLat + "&longitude=" + cfg.weatherLon + "&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1";
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.current) {
        state.weather.tempC = j.current.temperature_2m;
        state.weather.code = j.current.weather_code || 0;
        if (j.daily && j.daily.temperature_2m_min) {
          state.weather.minC = j.daily.temperature_2m_min[0];
          state.weather.maxC = j.daily.temperature_2m_max[0];
        }
        state.weather.city = cfg.weatherCity;
        renderWidgets();
      }
    }).catch(function () {});
  }

  function visibleApps() {
    return DEFAULT_APPS.filter(function (a) {
      if (a.id === "tv" && !cfg.tvEnabled) return false;
      return cfg.hiddenApps.indexOf(a.id) < 0;
    });
  }

  function buildTileHTML(app) {
    if (app.brand === "tv") {
      return '<div class="tile-banner" style="background:var(--t-bg-alt);">' +
        '<svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="var(--t-accent)" stroke-width="2">' +
        '<rect x="2" y="3" width="20" height="14"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' +
        '<div style="font-size:28px;font-weight:700;color:var(--t-fg-bright);margin-top:6px;">' + app.name + '</div></div>';
    }
    if (cfg.textTiles) {
      return '<div class="tile-banner" style="background:var(--t-bg-alt);"><div class="tile-text-only">' + app.name + '</div></div>';
    }
    return '<div class="tile-banner" style="background:' + (app.bg || "var(--t-bg-alt)") + ';">' +
      '<div style="font-size:30px;font-weight:700;letter-spacing:1.2px;color:' + (app.fg || "var(--t-fg-bright)") + ';">' + (app.sub || app.name) + '</div>' +
      '</div>';
  }

  function renderDock() {
    var apps = visibleApps();
    if (state.dockIdx >= apps.length) state.dockIdx = Math.max(0, apps.length - 1);
    if (state.dockIdx < state.dockScroll) state.dockScroll = state.dockIdx;
    if (state.dockIdx >= state.dockScroll + 6) state.dockScroll = state.dockIdx - 5;

    var strip = document.getElementById("dock-strip");
    strip.innerHTML = "";
    var slice = apps.slice(state.dockScroll, state.dockScroll + 6);
    slice.forEach(function (app, i) {
      var realIdx = state.dockScroll + i;
      var d = document.createElement("div");
      d.className = "app-tile" + (state.ws === 0 && state.zone === "dock" && state.dockIdx === realIdx ? " focused" : "");
      d.innerHTML = buildTileHTML(app);
      d.onclick = function () { state.zone = "dock"; state.dockIdx = realIdx; renderAll(); launchApp(app); };
      d.onmouseenter = function () { if (!state.modalOpen && state.ws === 0) { state.zone = "dock"; state.dockIdx = realIdx; renderAll(); } };
      strip.appendChild(d);
    });

    var cur = apps[state.dockIdx] || apps[0] || { name: "OmarchyTV", id: "tv" };
    document.getElementById("dock-app-name").textContent = cur.name;
    document.getElementById("dock-hint").textContent = cur.id === "tv" ? tr("hint_tv") : tr("hint_app");
  }

  function renderWorkspaces() {
    document.getElementById("ws1-layer").style.display = state.ws === 0 ? "block" : "none";
    document.getElementById("ws2-panel").className = "box has-legend ws-panel" + (state.ws === 1 ? " active" : "");
    document.getElementById("ws3-panel").className = "box has-legend ws-panel" + (state.ws === 2 ? " active" : "");
    document.getElementById("ws4-panel").className = "box has-legend ws-panel" + (state.ws === 3 ? " active" : "");
    document.getElementById("ws5-panel").className = "box has-legend ws-panel" + (state.ws === 4 ? " active" : "");

    document.getElementById("legend-ws2").textContent = tr("box_tv");
    document.getElementById("legend-ws3").textContent = tr("box_app");
    document.getElementById("legend-ws4").textContent = tr("box_ws_pc");
    document.getElementById("legend-ws5").textContent = tr("box_system");

    // Waybar buttons
    var btns = document.querySelectorAll("[data-bar-idx]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var idx = parseInt(b.getAttribute("data-bar-idx"), 10);
      var wsAttr = b.getAttribute("data-ws");
      var cls = b.classList.contains("bar-icon-btn") ? "bar-icon-btn" : ("bar-btn" + (idx === 0 ? " logo-btn" : " ws-btn"));
      if (wsAttr !== null && parseInt(wsAttr, 10) === state.ws) cls += " ws-active";
      if (state.zone === "bar" && state.barIdx === idx) cls += " focused";
      b.className = cls;
    }

    var tip = document.getElementById("bar-tip");
    if (state.zone === "bar" && state.barIdx >= 6) {
      var tipKeys = ["tip_wifi", "tip_bt", "tip_vol", "tip_inputs", "tip_saver"];
      tip.textContent = tr(tipKeys[state.barIdx - 6]);
      tip.style.display = "block";
    } else {
      tip.style.display = "none";
    }

    // Widget focus borders on WS1
    var wBoxes = [document.getElementById("term-box"), document.getElementById("wx-box"), document.getElementById("pc-box"), document.getElementById("ai-box")];
    wBoxes.forEach(function (el, idx) {
      if (!el) return;
      el.classList.toggle("focused", state.ws === 0 && state.zone === "widgets" && state.widgetIdx === idx);
    });

    // WS2: TV & HDMI Inputs
    if (state.ws === 1) {
      var g2 = document.getElementById("ws2-grid");
      g2.innerHTML = "";
      TV_INPUTS.forEach(function (inp, i) {
        var d = document.createElement("div");
        d.className = "app-tile" + (state.zone === "ws2" && state.ws2Idx === i ? " focused" : "");
        d.innerHTML = buildTileHTML({ name: inp.name, brand: "tv" });
        d.onclick = function () { state.zone = "ws2"; state.ws2Idx = i; renderAll(); launchApp(inp); };
        g2.appendChild(d);
      });
      var curInp = TV_INPUTS[state.ws2Idx] || TV_INPUTS[0];
      document.getElementById("ws2-title").textContent = curInp.sub;
      document.getElementById("ws2-hint").textContent = tr("hint_ws2");
    }

    // WS3: All Apps Grid
    if (state.ws === 2) {
      var g3 = document.getElementById("ws3-grid");
      g3.innerHTML = "";
      var all = visibleApps();
      all.forEach(function (app, i) {
        var d = document.createElement("div");
        d.className = "app-tile" + (state.zone === "ws3" && state.ws3Idx === i ? " focused" : "");
        d.innerHTML = buildTileHTML(app);
        d.onclick = function () { state.zone = "ws3"; state.ws3Idx = i; renderAll(); launchApp(app); };
        g3.appendChild(d);
      });
      var curApp = all[state.ws3Idx] || all[0];
      document.getElementById("ws3-title").textContent = curApp ? curApp.name : "Apps";
      document.getElementById("ws3-hint").textContent = tr("hint_ws3");
    }

    // WS4: Omarchy PC
    if (state.ws === 3) {
      document.getElementById("ws4-heading").textContent = tr("ws4_heading");
      document.getElementById("ws4-desc").textContent = tr("ws4_desc");
      var b0 = document.getElementById("ws4-pair-btn");
      var b1 = document.getElementById("ws4-demo-btn");
      b0.className = "ws4-btn" + (state.zone === "ws4" && state.ws4Idx === 0 ? " focused" : "");
      b1.className = "ws4-btn" + (state.zone === "ws4" && state.ws4Idx === 1 ? " focused" : "");
      b1.textContent = cfg.pcSimulated ? "[ disconnect simulated PC ]" : "[ simulate connected PC ]";
    }

    // WS5: System Settings
    if (state.ws === 4) {
      var rows = getSysRows();
      var list5 = document.getElementById("ws5-list");
      list5.innerHTML = "";
      rows.forEach(function (r, i) {
        var row = document.createElement("div");
        row.className = "sys-row" + (state.zone === "ws5" && state.ws5Idx === i ? " focused" : "");
        row.innerHTML = '<span class="sys-lbl">' + r.label + '</span><span class="sys-val">' + r.val + '</span>';
        row.onclick = function () { state.zone = "ws5"; state.ws5Idx = i; renderAll(); r.act(); };
        list5.appendChild(row);
      });
    }
  }

  function getSysRows() {
    var transPct = Math.round((1 - cfg.opacity) * 100) + "%";
    var idleStr = cfg.saverIdleMin === 0 ? "never" : (cfg.saverIdleMin + " min");
    return [
      { label: tr("sys_webos"), val: "›", act: function () { launchApp({ name: "LG Settings", appId: "com.palm.app.settings" }); } },
      { label: tr("sys_themes"), val: cfg.theme, act: openThemesModal },
      { label: tr("sys_trans"), val: transPct, act: function () {
        var steps = [0.95, 0.85, 0.75, 0.65, 0.50, 0.40];
        var idx = (steps.indexOf(cfg.opacity) + 1) % steps.length;
        cfg.opacity = steps[idx];
        saveCfg(); applyTheme(); renderAll();
      } },
      { label: tr("sys_widgets"), val: "›", act: openWidgetsModal },
      { label: tr("sys_arrange"), val: "›", act: function () { showToast("Arrange panels: use D-pad on Home"); switchWorkspace(0); } },
      { label: tr("sys_saver"), val: "›", act: openSaverModal },
      { label: tr("sys_saver_idle"), val: idleStr, act: function () {
        var opts = [1, 2.5, 5, 10, 0];
        cfg.saverIdleMin = opts[(opts.indexOf(cfg.saverIdleMin) + 1) % opts.length];
        saveCfg(); renderAll();
      } },
      { label: tr("sys_logo_anim"), val: cfg.logoAnim ? "on" : "off", act: function () { cfg.logoAnim = !cfg.logoAnim; saveCfg(); renderAll(); animateLogo(); } },
      { label: tr("sys_text_tiles"), val: cfg.textTiles ? "on" : "off", act: function () { cfg.textTiles = !cfg.textTiles; saveCfg(); renderAll(); } },
      { label: tr("sys_all"), val: "›", act: openAllSettingsModal },
      { label: tr("sys_about"), val: "2.11.0-testing ›", act: openAboutModal }
    ];
  }

  function openModal(title, sub, items, withInput, onInput) {
    state.modalOpen = true;
    state.modalItems = items || [];
    state.modalIdx = 0;
    document.getElementById("modal-title").textContent = title;
    var subEl = document.getElementById("modal-sub");
    subEl.textContent = sub || "";
    subEl.style.display = sub ? "block" : "none";

    var iw = document.getElementById("modal-input-wrap");
    var inp = document.getElementById("modal-input");
    if (withInput) {
      iw.style.display = "block";
      inp.value = "";
      inp.placeholder = withInput;
      inp.oninput = function () { if (onInput) onInput(inp.value); };
      setTimeout(function () { inp.focus(); }, 30);
    } else {
      iw.style.display = "none";
      inp.oninput = null;
    }
    document.getElementById("modal-backdrop").className = "open";
    renderModalList();
  }

  function closeModal() {
    state.modalOpen = false;
    document.getElementById("modal-backdrop").className = "";
    renderAll();
  }

  function renderModalList() {
    var list = document.getElementById("modal-list");
    list.innerHTML = "";
    state.modalItems.forEach(function (it, idx) {
      var d = document.createElement("div");
      d.className = "modal-item" + (idx === state.modalIdx ? " focused" : "");
      d.innerHTML = '<span>' + it.label + '</span><span class="mi-right">' + (it.right || "") + '</span>';
      d.onclick = function () { state.modalIdx = idx; if (it.act) it.act(); };
      list.appendChild(d);
      if (idx === state.modalIdx && d.scrollIntoView) d.scrollIntoView({ block: "nearest" });
    });
  }

  function openThemesModal() {
    var names = Object.keys(DATA.themes);
    var items = names.map(function (n) {
      return {
        label: n,
        right: n === cfg.theme ? "✓" : "",
        act: function () {
          cfg.theme = n;
          cfg.wallpaperIdx = 0;
          saveCfg(); applyTheme(); renderAll(); closeModal();
        }
      };
    });
    var curIdx = names.indexOf(cfg.theme);
    openModal(tr("sys_themes") + " (23 stock Omarchy 2.11.0)", "Select a theme (MIT omarchy.webp + Liftoff Sunset)", items);
    if (curIdx >= 0) { state.modalIdx = curIdx; renderModalList(); }
  }

  function openWeatherModal() {
    var items = [
      { label: tr("wx_auto"), right: "", act: function () {
        cfg.weatherCity = "Alessandria"; cfg.weatherLat = 44.913; cfg.weatherLon = 8.615;
        saveCfg(); fetchWeather(); renderAll(); closeModal();
      } },
      { label: tr("wx_search"), right: cfg.weatherCity, act: function () {
        openModal(tr("wx_search"), "Type city name (e.g. Milan, Rome, Berlin, New York):", [
          { label: "Milano, IT", right: "45.46, 9.19", act: function () { setCity("Milano", 45.464, 9.190); } },
          { label: "Alessandria, IT", right: "44.91, 8.61", act: function () { setCity("Alessandria", 44.913, 8.615); } },
          { label: "Roma, IT", right: "41.89, 12.48", act: function () { setCity("Roma", 41.893, 12.483); } },
          { label: "Berlin, DE", right: "52.52, 13.40", act: function () { setCity("Berlin", 52.520, 13.405); } },
          { label: "San Francisco, US", right: "37.77, -122.42", act: function () { setCity("San Francisco", 37.775, -122.419); } }
        ], "City name…");
      } },
      { label: tr("wx_unit"), right: "°" + cfg.tempUnit, act: function () {
        cfg.tempUnit = cfg.tempUnit === "C" ? "F" : "C";
        saveCfg(); renderAll(); openWeatherModal();
      } }
    ];
    openModal(tr("wx_title"), "", items);
  }

  function setCity(name, lat, lon) {
    cfg.weatherCity = name; cfg.weatherLat = lat; cfg.weatherLon = lon;
    state.weather.city = name;
    saveCfg(); fetchWeather(); renderAll(); closeModal();
  }

  function openWidgetsModal() {
    function tog(k) { cfg.widgets[k] = !cfg.widgets[k]; saveCfg(); renderAll(); openWidgetsModal(); }
    openModal(tr("sys_widgets"), "", [
      { label: "terminal · logo", right: cfg.widgets.term ? "on" : "off", act: function () { tog("term"); } },
      { label: "weather", right: cfg.widgets.weather ? "on" : "off", act: function () { tog("weather"); } },
      { label: "omarchy · pc", right: cfg.widgets.pc ? "on" : "off", act: function () { tog("pc"); } },
      { label: "ai credits · pc", right: cfg.widgets.ai ? "on" : "off", act: function () { tog("ai"); } },
      { label: "deploys · pc", right: cfg.widgets.deploy ? "on" : "off", act: function () { tog("deploy"); } }
    ]);
  }

  function openSaverModal() {
    openModal(tr("sys_saver"), "37 tte.js TerminalTextEffects over screensaver-tv.txt", [
      { label: "Preview screensaver now", right: "▶", act: function () { closeModal(); startScreensaver(); } },
      { label: tr("sys_saver_idle"), right: cfg.saverIdleMin === 0 ? "never" : (cfg.saverIdleMin + " min"), act: function () {
        var opts = [1, 2.5, 5, 10, 0];
        cfg.saverIdleMin = opts[(opts.indexOf(cfg.saverIdleMin) + 1) % opts.length];
        saveCfg(); openSaverModal();
      } },
      { label: "Clock under logo", right: cfg.saverShowClock ? "on" : "off", act: function () {
        cfg.saverShowClock = !cfg.saverShowClock; saveCfg(); openSaverModal();
      } }
    ]);
  }

  function openAllSettingsModal() {
    var wlist = DATA.wallpapers[cfg.theme] || [];
    openModal(tr("sys_all"), "OmarchyTV 2.11.0-testing (LG webOS)", [
      { label: "Language", right: cfg.lang || "auto", act: function () {
        var l = ["", "en", "it", "de"];
        cfg.lang = l[(l.indexOf(cfg.lang) + 1) % l.length];
        saveCfg(); renderAll(); openAllSettingsModal();
      } },
      { label: "Next background", right: wlist.length ? ((cfg.wallpaperIdx % wlist.length) + 1) + "/" + wlist.length : "procedural", act: function () {
        cfg.wallpaperIdx++; saveCfg(); applyTheme(); openAllSettingsModal();
      } },
      { label: "Wallpaper dimming", right: Math.round((cfg.wallpaperDim || 0) * 100) + "%", act: function () {
        var d = [0, 0.25, 0.5];
        cfg.wallpaperDim = d[(d.indexOf(cfg.wallpaperDim) + 1) % d.length];
        saveCfg(); applyTheme(); openAllSettingsModal();
      } },
      { label: "Show TV tile on dock", right: cfg.tvEnabled ? "on" : "off", act: function () {
        cfg.tvEnabled = !cfg.tvEnabled; saveCfg(); renderAll(); openAllSettingsModal();
      } },
      { label: "Temperature unit", right: "°" + cfg.tempUnit, act: function () {
        cfg.tempUnit = cfg.tempUnit === "C" ? "F" : "C"; saveCfg(); renderAll(); openAllSettingsModal();
      } }
    ]);
  }

  function openAboutModal() {
    var sub = "OmarchyTV 2.11.0-testing for LG webOS (community testing — NOT a beta)\n" +
      "Based on OmarchyTV v2.11.0 for Android TV by Marco Porro (MIT License).\n" +
      "Includes 23 Omarchy themes, 20 MIT omarchy.webp wallpapers, 'Liftoff Sunset' by Tom Ballard, and 37 tte.js effects.";
    openModal(tr("sys_about"), sub, [
      { label: "Version", right: "2.11.0-testing (webOS)", act: closeModal },
      { label: "Android base release", right: "2.11.0", act: closeModal },
      { label: "Wallpaper credit (tokyo-night)", right: "Liftoff Sunset — Tom Ballard", act: closeModal },
      { label: "Close", right: "ESC / Back", act: closeModal }
    ]);
  }

  function openWalkerModal() {
    function buildList(q) {
      var f = (q || "").toLowerCase();
      var apps = visibleApps().filter(function (a) { return !f || a.name.toLowerCase().indexOf(f) >= 0; });
      return apps.map(function (a) {
        return { label: a.name, right: a.appId, act: function () { closeModal(); launchApp(a); } };
      });
    }
    openModal("Walker · > search", "Filter and launch installed webOS apps", buildList(""), "> search apps…", function (val) {
      state.modalItems = buildList(val);
      state.modalIdx = 0;
      renderModalList();
    });
  }

  function openOmarchyMenu() {
    openModal("Omarchy Menu", "OmarchyTV 2.11.0-testing (LG webOS)", [
      { label: "Walker (app launcher)", right: "›", act: openWalkerModal },
      { label: tr("sys_themes"), right: cfg.theme, act: openThemesModal },
      { label: tr("wx_title"), right: "°" + cfg.tempUnit, act: openWeatherModal },
      { label: tr("sys_saver"), right: "›", act: openSaverModal },
      { label: tr("sys_all"), right: "›", act: openAllSettingsModal },
      { label: tr("sys_about"), right: "2.11.0-testing", act: openAboutModal }
    ]);
  }

  window.OmarchySaver = {
    text: function () { return DATA.logo; },
    color: function () { return currentThemeObj().accent; },
    clockColor: function () { return currentThemeObj().fg; },
    showClock: function () { return !!cfg.saverShowClock; },
    widthFraction: function () { return cfg.saverLogoScale || 0.65; },
    exclude: function () { return ""; },
    forceEffect: function () { return ""; },
    forceMode: function () { return "bundle"; },
    dismiss: function () { stopScreensaver(); },
    log: function (m) { console.log("[OmarchySaver]", m); }
  };

  function startScreensaver() {
    var ov = document.getElementById("saver-overlay");
    var fr = document.getElementById("saver-frame");
    fr.src = "saver/index.html";
    ov.className = "active";
  }

  function stopScreensaver() {
    var ov = document.getElementById("saver-overlay");
    var fr = document.getElementById("saver-frame");
    if (ov.className === "active") {
      ov.className = "";
      fr.src = "about:blank";
      animateLogo();
    }
  }

  function showToast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.display = "none"; }, 2600);
  }

  function launchApp(app) {
    if (!app) return;
    try {
      if (window.webOS && window.webOS.service && window.webOS.service.request) {
        window.webOS.service.request("luna://com.webos.applicationManager", {
          method: "launch",
          parameters: { id: app.appId }
        });
        return;
      }
      if (window.PalmServiceBridge) {
        var b = new window.PalmServiceBridge();
        b.call("luna://com.webos.applicationManager/launch", JSON.stringify({ id: app.appId }));
        return;
      }
    } catch (e) {}
    showToast("Launching " + app.name + " (" + app.appId + ")");
  }

  function switchWorkspace(ws) {
    state.ws = ws;
    if (ws === 0) { state.zone = "dock"; animateLogo(); }
    else if (ws === 1) state.zone = "ws2";
    else if (ws === 2) state.zone = "ws3";
    else if (ws === 3) state.zone = "ws4";
    else if (ws === 4) state.zone = "ws5";
    renderAll();
  }

  function renderAll() {
    renderTerminal();
    renderWidgets();
    renderDock();
    renderWorkspaces();
    if (state.modalOpen) renderModalList();
  }

  function activateBarItem(idx) {
    if (idx === 0) openOmarchyMenu();
    else if (idx >= 1 && idx <= 5) switchWorkspace(idx - 1);
    else if (idx === 9) switchWorkspace(1);
    else if (idx === 10) startScreensaver();
    else launchApp({ name: "LG Settings", appId: "com.palm.app.settings" });
  }

  // Keyboard / LG Remote Navigation
  var LEGACY_KEYS = { 8: "Backspace", 13: "Enter", 27: "Escape", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown" };
  window.addEventListener("keydown", function (e) {
    var ov = document.getElementById("saver-overlay");
    if (ov.className === "active") {
      stopScreensaver();
      e.preventDefault();
      return;
    }

    var code = e.keyCode;
    // webOS 3.x (Chrome 38) has no KeyboardEvent.key: derive it from the remote's keyCode
    var k = e.key || LEGACY_KEYS[code] || (code >= 48 && code <= 57 ? String(code - 48) : "");
    var isBack = (k === "Escape" || k === "Backspace" || code === 461);

    if (state.modalOpen) {
      if (isBack) { closeModal(); e.preventDefault(); return; }
      if (k === "ArrowDown") { state.modalIdx = (state.modalIdx + 1) % Math.max(1, state.modalItems.length); renderModalList(); e.preventDefault(); return; }
      if (k === "ArrowUp") { state.modalIdx = (state.modalIdx - 1 + Math.max(1, state.modalItems.length)) % Math.max(1, state.modalItems.length); renderModalList(); e.preventDefault(); return; }
      if (k === "Enter") {
        var it = state.modalItems[state.modalIdx];
        if (it && it.act) it.act();
        e.preventDefault();
        return;
      }
      return;
    }

    // Number keys 1..5 switch workspaces directly
    if (k >= "1" && k <= "5") {
      switchWorkspace(parseInt(k, 10) - 1);
      e.preventDefault();
      return;
    }

    if (isBack) {
      if (state.ws !== 0) { switchWorkspace(0); e.preventDefault(); }
      return;
    }

    if (state.zone === "bar") {
      if (k === "ArrowRight") { state.barIdx = Math.min(10, state.barIdx + 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowLeft") { state.barIdx = Math.max(0, state.barIdx - 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowDown") {
        if (state.ws === 0) state.zone = "widgets";
        else state.zone = "ws" + (state.ws + 1);
        renderAll(); e.preventDefault(); return;
      }
      if (k === "Enter") { activateBarItem(state.barIdx); e.preventDefault(); return; }
      return;
    }

    if (state.ws === 0 && state.zone === "widgets") {
      if (k === "ArrowRight") { state.widgetIdx = Math.min(3, state.widgetIdx + 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowLeft") { state.widgetIdx = Math.max(0, state.widgetIdx - 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowUp") { state.zone = "bar"; renderAll(); e.preventDefault(); return; }
      if (k === "ArrowDown") { state.zone = "dock"; renderAll(); e.preventDefault(); return; }
      if (k === "Enter") {
        if (state.widgetIdx === 0) openThemesModal();
        else if (state.widgetIdx === 1) openWeatherModal();
        else switchWorkspace(3);
        e.preventDefault(); return;
      }
      return;
    }

    if (state.ws === 0 && state.zone === "dock") {
      var apps = visibleApps();
      if (k === "ArrowRight") { state.dockIdx = Math.min(apps.length - 1, state.dockIdx + 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowLeft") { state.dockIdx = Math.max(0, state.dockIdx - 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowUp") { state.zone = "widgets"; renderAll(); e.preventDefault(); return; }
      if (k === "Enter") { launchApp(apps[state.dockIdx]); e.preventDefault(); return; }
    }

    if (state.ws === 1 && state.zone === "ws2") {
      if (k === "ArrowRight") { state.ws2Idx = Math.min(TV_INPUTS.length - 1, state.ws2Idx + 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowLeft") { state.ws2Idx = Math.max(0, state.ws2Idx - 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowUp") { state.zone = "bar"; renderAll(); e.preventDefault(); return; }
      if (k === "Enter") { launchApp(TV_INPUTS[state.ws2Idx]); e.preventDefault(); return; }
    }

    if (state.ws === 2 && state.zone === "ws3") {
      var all = visibleApps();
      if (k === "ArrowRight") { state.ws3Idx = Math.min(all.length - 1, state.ws3Idx + 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowLeft") { state.ws3Idx = Math.max(0, state.ws3Idx - 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowDown") { state.ws3Idx = Math.min(all.length - 1, state.ws3Idx + 7); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowUp") {
        if (state.ws3Idx >= 7) state.ws3Idx -= 7;
        else state.zone = "bar";
        renderAll(); e.preventDefault(); return;
      }
      if (k === "Enter") { launchApp(all[state.ws3Idx]); e.preventDefault(); return; }
    }

    if (state.ws === 3 && state.zone === "ws4") {
      if (k === "ArrowRight") { state.ws4Idx = 1; renderAll(); e.preventDefault(); return; }
      if (k === "ArrowLeft") { state.ws4Idx = 0; renderAll(); e.preventDefault(); return; }
      if (k === "ArrowUp") { state.zone = "bar"; renderAll(); e.preventDefault(); return; }
      if (k === "Enter") {
        if (state.ws4Idx === 1) {
          cfg.pcSimulated = !cfg.pcSimulated;
          saveCfg(); pollPcStatus(); renderAll();
        } else {
          openModal("Pair Omarchy Linux PC", "Enter your Omarchy PC LAN IP (serves http://<ip>:8765/status.json):", [
            { label: "Use 192.168.1.100:8765", right: "LAN", act: function () { cfg.pcHost = "192.168.1.100"; saveCfg(); pollPcStatus(); closeModal(); } },
            { label: "Toggle simulated PC link", right: cfg.pcSimulated ? "on" : "off", act: function () { cfg.pcSimulated = !cfg.pcSimulated; saveCfg(); pollPcStatus(); closeModal(); } }
          ], "192.168.1.x");
        }
        e.preventDefault(); return;
      }
    }

    if (state.ws === 4 && state.zone === "ws5") {
      var rows = getSysRows();
      if (k === "ArrowDown") { state.ws5Idx = Math.min(rows.length - 1, state.ws5Idx + 1); renderAll(); e.preventDefault(); return; }
      if (k === "ArrowUp") {
        if (state.ws5Idx > 0) state.ws5Idx--;
        else state.zone = "bar";
        renderAll(); e.preventDefault(); return;
      }
      if (k === "Enter") { rows[state.ws5Idx].act(); e.preventDefault(); return; }
    }
  });

  // Click bindings for Waybar and Widgets
  var waybarButtons = document.querySelectorAll("[data-bar-idx]");
  for (var bi = 0; bi < waybarButtons.length; bi++) {
    (function (button) {
      var idx = parseInt(button.getAttribute("data-bar-idx"), 10);
      button.onclick = function () {
        if (state.modalOpen) return;
        state.barIdx = idx;
        state.zone = "bar";
        renderAll();
        activateBarItem(idx);
      };
      button.onmouseenter = function () {
        if (state.modalOpen) return;
        state.barIdx = idx;
        state.zone = "bar";
        renderAll();
      };
    })(waybarButtons[bi]);
  }

  document.getElementById("wx-box").onclick = openWeatherModal;
  document.getElementById("term-box").onclick = openThemesModal;
  document.getElementById("pc-box").onclick = function () { switchWorkspace(3); };
  document.getElementById("ai-box").onclick = function () { switchWorkspace(3); };
  document.getElementById("ws4-pair-btn").onclick = function () { state.zone = "ws4"; state.ws4Idx = 0; renderAll(); };
  document.getElementById("ws4-demo-btn").onclick = function () { cfg.pcSimulated = !cfg.pcSimulated; saveCfg(); pollPcStatus(); renderAll(); };

  // Expose helper API for automated simulator tests
  window.OmarchyTestAPI = {
    switchWorkspace: switchWorkspace,
    openWeatherModal: openWeatherModal,
    openThemesModal: openThemesModal,
    openWalkerModal: openWalkerModal,
    openAboutModal: openAboutModal,
    startScreensaver: startScreensaver,
    stopScreensaver: stopScreensaver,
    setTheme: function (t) { cfg.theme = t; cfg.wallpaperIdx = 0; saveCfg(); applyTheme(); renderAll(); },
    setTempUnit: function (u) { cfg.tempUnit = u; saveCfg(); renderAll(); },
    setLang: function (l) { cfg.lang = l; saveCfg(); renderAll(); },
    setSimulatedPc: function (v) { cfg.pcSimulated = v; saveCfg(); pollPcStatus(); renderAll(); },
    connectPc: function (host) { cfg.pcSimulated = false; cfg.pcHost = host; saveCfg(); return pollPcStatus().then(function (s) { renderAll(); return s; }); }
  };

  // Boot
  fitStage();
  applyTheme();
  updateClock();
  setInterval(updateClock, 15000);
  animateLogo();
  renderAll();
  fetchWeather();
  pollPcStatus();
})();
