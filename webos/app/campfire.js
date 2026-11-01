// OmarchyTV campfire background for webOS/Tizen (app.js) and node tests. MIT, Marco Porro / OmarchyTV contributors.
// Runs Wes Grimes' OmaFire engine (vendor/omafire/fire.js, MIT) full screen behind the home screen.
// fire.js draws a 360 x 240 pixel-art frame; the canvas keeps that size and CSS scales it up with
// nearest-neighbour pixels, "cover" style: 360 -> 1920 wide is 5.33x, so the 1280 px tall picture loses
// 100 px at the top and bottom of the 1080 px stage. The same CSS scale is 4K-sharp on a 4K panel.
(function (root) {
  var FPS = 30;
  // Keep-burning mode: a background nobody tends would burn out in ~13 minutes, so a log goes on
  // whenever the fuel falls below this (one log is +0.25 fuel, about 3 minutes of fire).
  var TEND_BELOW = 0.32;

  /** Background mode tending: adds a log when the fire runs low. Returns true when it added one. */
  function tend(Fire, s) {
    if (s.fuel < TEND_BELOW && !s.flight) { Fire.addLog(s); return true; }
    return false;
  }

  /** base64 RGB (OmaFireArt) -> RGBA bytes, the prepared background fire.js render() expects. */
  function artToRgba(art, decode) {
    var bin = decode(art.rgb), n = art.w * art.h, out = new Uint8ClampedArray(n * 4);
    if (bin.length !== n * 3) return null;
    for (var i = 0, j = 0, k = 0; i < n; i++, j += 3, k += 4) {
      out[k] = bin.charCodeAt(j); out[k + 1] = bin.charCodeAt(j + 1); out[k + 2] = bin.charCodeAt(j + 2); out[k + 3] = 255;
    }
    return out;
  }

  /** Crackle volume, following OmaFire's FireAudio.qml curve (its loop was mixed at heat 0.68). */
  function crackleVolume(heat) {
    var v = 0.22 * (0.1 + heat * 0.6) / (0.1 + 0.68 * 0.6);
    return Math.max(0, Math.min(1, v));
  }

  /**
   * Starts drawing on `canvas` (360 x 240). Returns { setPlaying(bool), setSound(bool), addLog, stoke, poke,
   * status, destroy }. Nothing runs while paused; on resume fire.js catches up on the time away analytically.
   */
  function create(canvas, opts) {
    opts = opts || {};
    var Fire = opts.fire || root.OmaFire, art = opts.art || root.OmaFireArt;
    var now = opts.now || function () { return Date.now(); };
    var raf = opts.raf || root.requestAnimationFrame || function (f) { return setTimeout(function () { f(now()); }, 1000 / FPS); };
    var caf = opts.caf || root.cancelAnimationFrame || clearTimeout;
    var ctx = canvas.getContext("2d");
    var img = ctx.createImageData(Fire.W, Fire.H);
    var fb = img.data;
    var bg = art ? artToRgba(art, opts.atob || root.atob) : null;
    var s = Fire.createState();
    var playing = false, handle = 0, last = 0, lastDraw = 0, audio = null, soundOn = false;
    var keepBurning = opts.keepBurning !== false;

    function frame() {
      handle = 0;
      if (!playing) return;
      var t = now(), dt = (t - last) / 1000;
      if (t - lastDraw >= 1000 / FPS - 2) {
        last = t; lastDraw = t;
        Fire.tick(s, dt, true);
        if (keepBurning) tend(Fire, s);
        Fire.render(fb, s, bg, null);
        ctx.putImageData(img, 0, 0);
        if (audio) audio.volume = crackleVolume(s.heat);
      }
      handle = raf(frame);
    }
    function setPlaying(on) {
      on = !!on;
      if (on === playing) return;
      playing = on;
      if (on) { last = lastDraw = now() - 1000 / FPS; handle = raf(frame); }
      else if (handle) { caf(handle); handle = 0; }
      syncAudio();
    }
    function syncAudio() {
      var want = soundOn && playing;
      if (want && !audio && opts.audio !== false && root.Audio) {
        try { audio = new root.Audio(opts.crackle || "vendor/omafire/crackle.wav"); audio.loop = true; } catch (e) { audio = null; }
      }
      if (!audio) return;
      try {
        if (want) { audio.volume = crackleVolume(s.heat); var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
        else audio.pause();
      } catch (e) {}
    }
    // Draw one frame straight away so the picture is there even before the first animation frame.
    Fire.render(fb, s, bg, null);
    ctx.putImageData(img, 0, 0);
    return {
      state: s,
      setPlaying: setPlaying,
      setSound: function (on) { soundOn = !!on; syncAudio(); },
      setKeepBurning: function (on) { keepBurning = !!on; },
      addLog: function () { return Fire.addLog(s); },
      stoke: function () { return Fire.stoke(s); },
      poke: function () { return Fire.poke(s); },
      status: function () { return Fire.status(s); },
      destroy: function () { setPlaying(false); if (audio) { try { audio.pause(); } catch (e) {} audio = null; } }
    };
  }

  var api = { FPS: FPS, TEND_BELOW: TEND_BELOW, tend: tend, artToRgba: artToRgba, crackleVolume: crackleVolume, create: create };
  root.OmarchyCampfire = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : this);
