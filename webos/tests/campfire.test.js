// node --test webos/tests/campfire.test.js — OmaFire campfire background (webOS/Tizen).
const test = require("node:test");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const C = require("../app/campfire.js");
const Fire = require("../app/vendor/omafire/fire.js").OmaFire;
const ART = (() => { const r = {}; new Function("window", fs.readFileSync(path.join(__dirname, "../app/vendor/omafire/art.js"), "utf8"))(r); return r.OmaFireArt; })();
const atob = (b) => Buffer.from(b, "base64").toString("latin1");

function fakeCanvas() {
  const puts = [];
  return { puts, getContext: () => ({
    createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
    putImageData: (img) => puts.push(img.data.slice(0, 16))
  }) };
}
function fakeClock() {
  let t = 1000; const q = [];
  return { now: () => t, raf: (f) => { q.push(f); return q.length; }, caf: () => { q.length = 0; },
    run(ms, step = 33) { for (let e = 0; e < ms; e += step) { t += step; const f = q.shift(); if (f) f(t); } }, pending: () => q.length };
}

test("vendored engine loads with its own exports", () => {
  assert.strictEqual(Fire.W, 360);
  assert.strictEqual(Fire.H, 240);
  assert.strictEqual(typeof Fire.render, "function");
});
test("art decodes to a 360x240 opaque RGBA background", () => {
  const bg = C.artToRgba(ART, atob);
  assert.strictEqual(bg.length, 360 * 240 * 4);
  for (let a = 3; a < bg.length; a += 4000) assert.strictEqual(bg[a], 255);
  assert.strictEqual(C.artToRgba({ w: 360, h: 240, rgb: "AAAA" }, atob), null);
});
test("keep-burning mode adds a log only when the fire runs low", () => {
  const s = Fire.createState();
  assert.strictEqual(C.tend(Fire, s), false);
  s.fuel = 0.2;
  assert.strictEqual(C.tend(Fire, s), true);
  assert.ok(s.fuel > 0.4);
  assert.strictEqual(C.tend(Fire, s), false);
});
test("an untended background never burns out over an hour", () => {
  const s = Fire.createState();
  for (let i = 0; i < 3600 * 10; i++) { Fire.tick(s, 0.1, false); C.tend(Fire, s); if (s.flight) s.flight = null; }
  assert.ok(s.fuel >= C.TEND_BELOW - 0.01, "fuel " + s.fuel);
  assert.notStrictEqual(Fire.status(s).key, "resting");
});
test("crackle volume follows heat and stays in range", () => {
  assert.ok(C.crackleVolume(0) < C.crackleVolume(1));
  assert.ok(Math.abs(C.crackleVolume(0.68) - 0.22) < 1e-9);
  assert.ok(C.crackleVolume(5) <= 1 && C.crackleVolume(-5) >= 0);
});
test("draws while playing, stops scheduling when paused", () => {
  const cv = fakeCanvas(), clk = fakeClock();
  const f = C.create(cv, { fire: Fire, art: ART, atob, now: clk.now, raf: clk.raf, caf: clk.caf, audio: false });
  assert.strictEqual(cv.puts.length, 1, "first frame drawn at once");
  f.setPlaying(true);
  clk.run(1000);
  assert.ok(cv.puts.length >= 25 && cv.puts.length <= 32, "about 30 fps, got " + cv.puts.length);
  f.setPlaying(false);
  const n = cv.puts.length;
  clk.run(1000);
  assert.strictEqual(cv.puts.length, n);
  assert.strictEqual(clk.pending(), 0);
  assert.ok(typeof f.addLog() === "string" && f.status().label);
});
test("index.html loads the engine, art and controller before app.js, with a cover-cropped canvas", () => {
  const html = fs.readFileSync(path.join(__dirname, "../app/index.html"), "utf8");
  const at = (s) => html.indexOf(s);
  assert.ok(at("vendor/omafire/fire.js") > 0 && at("vendor/omafire/fire.js") < at("vendor/omafire/art.js"));
  assert.ok(at("vendor/omafire/art.js") < at('src="campfire.js"') && at('src="campfire.js"') < at('src="app.js"'));
  assert.match(html, /id="wallpaper-fire" width="360" height="240" style="[^"]*top:-100px;width:1920px;height:1280px;/);
});
test("the vendored files keep Wes Grimes' MIT licence", () => {
  for (const f of ["fire.js", "art.js"]) {
    const head = fs.readFileSync(path.join(__dirname, "../app/vendor/omafire", f), "utf8").slice(0, 1500);
    assert.match(head, /MIT License/);
    assert.match(head, /Copyright \(c\) 2026 Wes Grimes/);
  }
});
