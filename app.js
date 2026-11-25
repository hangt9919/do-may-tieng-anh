// Đố Mày Tiếng Anh – logic game
"use strict";
const $ = id => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem("dmta." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("dmta." + k, JSON.stringify(v)); } catch {} },
};
const settings = Object.assign({ level: "2", tone: "roast", sound: "1", voice: "1", scare: "1" }, store.get("settings", {}));
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const norm = s => String(s || "").toLowerCase().replace(/[’‘`]/g, "'").replace(/[.!?,;]+$/, "").replace(/\s+/g, " ").trim();

/* ================================================================ LỜI THOẠI (LINES, RANKS, MEMES ở lines.js) */
let lastLine = "";
function line(kind, n) {
  const pool = (LINES[settings.tone] || LINES.roast)[kind] || LINES.roast[kind];
  let s; for (let i = 0; i < 5; i++) { s = pick(pool); if (s !== lastLine) break; }
  lastLine = s; return s.replace("{n}", n);
}

/* ================================================================ ÂM THANH */
let ac;
function actx() { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); return ac; }
// một nốt: tần số f (có thể trượt tới `to`), bắt đầu sau `at` giây
function tone(f, at, dur, { type = "sine", vol = 0.16, to = null, vib = 0, lp = 0 } = {}) {
  const c = actx(), t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  if (vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 6; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur); }
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.setValueAtTime(vol, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o; if (lp) { const fl = c.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = lp; o.connect(fl); node = fl; }
  node.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(at, dur, { vol = 0.2, type = "lowpass", freq = 800 } = {}) {
  const c = actx(), t = c.currentTime + at, len = Math.ceil(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = buf; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
}
const SFX_RAW = {
  good: () => { tone(660, 0, 0.1); tone(990, 0.08, 0.22); },
  ding: () => { tone(1320, 0, 0.5, { vol: 0.14 }); tone(1980, 0.02, 0.35, { vol: 0.07 }); },
  bad: () => { tone(200, 0, 0.22, { type: "sawtooth", vol: 0.09 }); tone(130, 0.18, 0.4, { type: "sawtooth", vol: 0.09 }); },
  tick: () => tone(1200, 0, 0.03, { type: "square", vol: 0.04 }),
  trombone: () => { [392, 370, 349].forEach((f, i) => tone(f, i * 0.33, 0.3, { type: "sawtooth", vol: 0.13, lp: 1400 })); tone(330, 0.99, 1.0, { type: "sawtooth", vol: 0.13, lp: 1400, vib: 9 }); },
  boom: () => { tone(110, 0, 1.1, { vol: 0.6, to: 32 }); noise(0, 0.35, { vol: 0.35, freq: 220 }); },
  honk: () => { tone(560, 0, 0.16, { type: "square", vol: 0.1, to: 470, lp: 2500 }); tone(560, 0.22, 0.22, { type: "square", vol: 0.1, to: 440, lp: 2500 }); },
  siren: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 950 : 650, i * 0.3, 0.3, { vol: 0.11, to: i % 2 ? 650 : 950 }); },
  fall: () => tone(1400, 0, 1.0, { vol: 0.13, to: 90 }),
  melt: () => tone(700, 0, 1.3, { type: "triangle", vol: 0.15, to: 70, vib: 12 }),
  quack: () => { [0, 0.2].forEach(at => tone(320, at, 0.14, { type: "sawtooth", vol: 0.14, to: 190, lp: 1600 })); },
  snore: () => { noise(0, 0.9, { vol: 0.25, freq: 380 }); tone(85, 0, 0.9, { vol: 0.12 }); },
  airhorn: () => { [0, 0.16, 0.32].forEach((at, i) => [466, 587, 698].forEach(f => tone(f, at, i === 2 ? 0.75 : 0.13, { type: "sawtooth", vol: 0.06, lp: 3000 }))); },
  scream: () => { tone(820, 0, 1.3, { type: "sawtooth", vol: 0.22, to: 1500, vib: 90 }); tone(610, 0.05, 1.2, { type: "square", vol: 0.12, to: 380, vib: 60, lp: 3500 }); noise(0, 1.1, { vol: 0.3, type: "highpass", freq: 1500 }); tone(60, 0, 0.8, { vol: 0.5, to: 30 }); },
};
const SFX = new Proxy(SFX_RAW, { get: (o, k) => () => { if (settings.sound === "1" && o[k]) try { o[k](); } catch {} } });

/* ---------- giọng đọc ---------- */
let voice, viVoice;
function pickVoice() {
  try {
    const all = speechSynthesis.getVoices(), us = all.filter(v => /^en[-_]US/i.test(v.lang));
    voice = us.find(v => /Samantha|Google US English|Ava|Allison|Aria/i.test(v.name)) || us[0] || all.find(v => /^en/i.test(v.lang));
    viVoice = all.find(v => /^vi/i.test(v.lang));
  } catch {}
}
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text, rate = 0.9) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; if (voice) u.voice = voice; u.rate = rate; speechSynthesis.speak(u); } catch {}
}
let manifest = {};
fetch("voice/manifest.json").then(r => r.ok ? r.json() : {}).then(m => { manifest = m || {}; }).catch(() => {});
let curAudio = null, voiceTok = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
function stopVoice() { voiceTok++; if (curAudio) { curAudio.pause(); curAudio = null; } try { speechSynthesis.cancel(); } catch {} }
function speakVi(text) {
  text = String(text || "").replace(/\p{Extended_Pictographic}|️/gu, "").trim();
  if (settings.voice !== "1" || !text) return Promise.resolve();
  const file = manifest[text];
  if (file) return new Promise(res => { const a = new Audio("voice/" + file); curAudio = a; a.onended = a.onerror = () => res(); a.play().catch(() => res()); });
  if (!viVoice) return Promise.resolve();
  return new Promise(res => {
    try { const u = new SpeechSynthesisUtterance(text); u.voice = viVoice; u.lang = viVoice.lang; u.rate = 1.08; u.onend = u.onerror = () => res(); speechSynthesis.speak(u); } catch { res(); }
    setTimeout(res, 9000);
  });
}
// đọc lần lượt các câu (bị huỷ nếu sang câu khác), xong thì chạy `then`
async function voiceSeq(parts, delay = 0, then) {
  const tok = ++voiceTok;
  if (delay) await sleep(delay);
  for (const p of parts) { if (tok !== voiceTok) return; await speakVi(p); }
  if (tok === voiceTok && then) then();
}

/* ---------- meme + dọa ---------- */
const isImg = s => /\.(jpe?g|png|webp|gif)$/i.test(s);
const petOK = new Set();
for (const list of Object.values(PETS)) for (const m of list) if (isImg(m[0])) { const im = new Image(); im.onload = () => petOK.add(m[0]); im.src = m[0]; }
function pickMeme(kind) { // kind: wrong | vietlish | streak | timeout | right | combo
  const pets = (PETS[kind] || []).filter(m => !isImg(m[0]) || petOK.has(m[0]));
  if (pets.length && Math.random() < 0.85) return pets[Math.random() * pets.length | 0];
  const emo = MEMES[kind === "streak" || kind === "easy" ? "wrong" : kind === "comeback" ? "right" : kind] || MEMES.wrong;
  return emo[Math.random() * emo.length | 0];
}
let memeTimer = 0;
function hideMeme() { clearTimeout(memeTimer); $("meme").className = "meme hidden"; }
function showMeme([emo, top, bot, sfx, anim], mood) {
  clearTimeout(memeTimer);
  if (isImg(emo)) $("memeEmo").innerHTML = `<img src="${emo}" alt="">`; else $("memeEmo").textContent = emo; $("memeTop").textContent = top; $("memeBot").textContent = bot;
  const m = $("meme"); m.className = "meme " + mood; void m.offsetWidth; m.classList.add("a-" + (anim || "zoom"));
  if (sfx) SFX[sfx]();
  memeTimer = setTimeout(hideMeme, mood === "good" ? 1400 : 2300);
}
function scare() {
  clearTimeout(memeTimer);
  const [emo, top, bot] = pick(MEMES.scare);
  $("memeEmo").textContent = emo; $("memeTop").textContent = top; $("memeBot").textContent = bot;
  const m = $("meme"); m.className = "meme dark";
  memeTimer = setTimeout(() => {
    m.className = "meme scare"; SFX.scream();
    try { navigator.vibrate && navigator.vibrate([200, 80, 300]); } catch {}
    memeTimer = setTimeout(hideMeme, 2300);
  }, 650);
}

/* ================================================================ CÂU HỎI */
// VOCAB, GRAMMAR, VIETLISH, SALON, TYPE, LISTEN được khai báo sẵn trong questions.js
const CAT = { vocab: "📖 Từ vựng", grammar: "🧠 Ngữ pháp", vietlish: "🇻🇳 Lỗi kiểu người Việt", salon: "💅 Tiếng Anh tiệm nail", type: "⌨️ Gõ đáp án", listen: "👂 Nghe", ai: "🤖 Đề AI" };
const ALL = ["vocab", "grammar", "vietlish", "type", "listen", "salon"];
const MODES = [
  { id: "quick", ic: "⚡", name: "Đấu nhanh", desc: "10 câu trộn đủ loại, 3 mạng", count: 10, cats: ALL, hot: true },
  { id: "survival", ic: "💀", name: "Sinh tồn", desc: "Chơi tới khi hết 3 mạng. Xem mày trụ được bao lâu", count: Infinity, cats: ALL },
  { id: "vietlish", ic: "🇻🇳", name: "Lỗi kiểu người Việt", desc: "“Open the light”, “I very like”… dính là bị chửi", count: 10, cats: ["vietlish"] },
  { id: "vocab", ic: "📖", name: "Từ vựng", desc: "Nghĩa của từ, dịch Việt → Anh", count: 10, cats: ["vocab"] },
  { id: "grammar", ic: "🧠", name: "Ngữ pháp", desc: "Thì, giới từ, câu điều kiện…", count: 10, cats: ["grammar"] },
  { id: "listen", ic: "👂", name: "Nghe", desc: "Máy đọc, mày chọn. ship/sheep, 13/30…", count: 10, cats: ["listen"] },
  { id: "type", ic: "⌨️", name: "Gõ đáp án", desc: "Không có lựa chọn để đoán bừa, gõ đúng chính tả", count: 10, cats: ["type"] },
  { id: "salon", ic: "💅", name: "Tiếng Anh tiệm nail", desc: "Câu thợ và khách hay nói", count: 10, cats: ["salon"] },
];

function vocabQ(w, variant) {
  const [en, vi, lvl] = w;
  const others = shuffle(VOCAB.filter(x => x !== w && x[2] === lvl && x[1] !== vi)).slice(0, 3);
  if (variant === "reverse") return { id: `v:${en}:r`, cat: "vocab", lvl, kind: "mc", q: `“${vi}” tiếng Anh là gì?`, options: [en, ...others.map(o => o[0])], answer: en, ex: `${en} = ${vi}`, sayAfter: en };
  if (variant === "listen") return { id: `v:${en}:l`, cat: "listen", lvl, kind: "mc", q: "Nghe máy đọc rồi chọn nghĩa đúng", options: [vi, ...others.map(o => o[1])], answer: vi, ex: `Máy đọc: ${en} = ${vi}`, speak: en };
  return { id: `v:${en}:m`, cat: "vocab", lvl, kind: "mc", q: `“${en}” nghĩa là gì?`, options: [vi, ...others.map(o => o[1])], answer: vi, ex: `${en} = ${vi}`, speakBtn: en, sayAfter: en };
}
function listenQ([lvl, words, tip]) {
  const target = pick(words);
  return { id: `l:${words[0]}`, cat: "listen", lvl, kind: "mc", q: "Nghe máy đọc rồi chọn từ mày nghe được", options: [target, ...words.filter(w => w !== target)], answer: target, ex: `Máy đọc: “${target}”. ${tip}`, speak: target };
}
const listQ = (cat, [lvl, q, opts, ex]) => ({ id: `${cat}:${q}`, cat, lvl, kind: "mc", q, options: opts, answer: opts[0], ex });
const typeQ = ([lvl, q, answers, ex]) => ({ id: `t:${q}`, cat: "type", lvl, kind: "type", q, answers, answer: answers[0], ex });

function lvlOk(l) {
  const L = settings.level;
  return L === "0" || (L === "1" && l === 1) || (L === "2" && l <= 2) || (L === "3" && l >= 2);
}
function buildQueue(cats) {
  let pool = [];
  if (cats.includes("vocab")) VOCAB.forEach(w => pool.push(vocabQ(w, Math.random() < 0.65 ? "meaning" : "reverse")));
  if (cats.includes("listen")) { LISTEN.forEach(i => pool.push(listenQ(i))); shuffle(VOCAB).slice(0, 14).forEach(w => pool.push(vocabQ(w, "listen"))); }
  if (cats.includes("grammar")) GRAMMAR.forEach(i => pool.push(listQ("grammar", i)));
  if (cats.includes("vietlish")) VIETLISH.forEach(i => pool.push(listQ("vietlish", i)));
  if (cats.includes("salon")) SALON.forEach(i => pool.push(listQ("salon", i)));
  if (cats.includes("type")) TYPE.forEach(i => pool.push(typeQ(i)));
  const filtered = pool.filter(q => lvlOk(q.lvl));
  if (filtered.length >= 10) pool = filtered;
  // ưu tiên câu chưa gặp gần đây, chia đều các loại câu
  const seen = new Set(store.get("seen", []));
  const groups = {};
  for (const q of shuffle(pool)) (groups[q.cat] = groups[q.cat] || []).push(q);
  for (const k in groups) groups[k].sort((a, b) => seen.has(a.id) - seen.has(b.id));
  const out = [];
  let keys = Object.keys(groups);
  while (keys.length) { const k = pick(keys); out.push(groups[k].shift()); keys = keys.filter(x => groups[x].length); }
  return out;
}
function markSeen(id) { const s = store.get("seen", []).filter(x => x !== id); s.push(id); store.set("seen", s.slice(-400)); }

/* ================================================================ SỔ LỖI */
const nbGet = () => store.get("notebook", []);
function nbAdd(q) {
  const keep = { id: q.id, cat: q.cat, lvl: q.lvl, kind: q.kind, q: q.q, options: q.options, answer: q.answer, answers: q.answers, ex: q.ex, speak: q.speak, speakBtn: q.speakBtn, sayAfter: q.sayAfter, chip: q.chip, roast: q.roast };
  store.set("notebook", [keep, ...nbGet().filter(x => x.id !== q.id)].slice(0, 200));
}
const nbRemove = id => store.set("notebook", nbGet().filter(x => x.id !== id));

/* ================================================================ MÀN HÌNH */
function show(id) { for (const s of document.querySelectorAll(".screen")) s.classList.toggle("hidden", s.id !== id); window.scrollTo(0, 0); }
function setSeg(segId, key) {
  for (const b of $(segId).querySelectorAll("button")) {
    b.classList.toggle("on", b.dataset.v === settings[key]);
    b.onclick = () => { settings[key] = b.dataset.v; store.set("settings", settings); setSeg(segId, key); if (key === "tone") renderHome(); };
  }
}
function renderHome() {
  setSeg("levelSeg", "level"); setSeg("toneSeg", "tone"); setSeg("soundSeg", "sound"); setSeg("voiceSeg", "voice"); setSeg("scareSeg", "scare");
  $("homeFace").textContent = settings.tone === "roast" ? "😏" : "😊";
  $("homeLine").textContent = line("home");
  $("modes").innerHTML = MODES.map(m => `<button class="mode${m.hot ? " hot" : ""}" data-m="${m.id}"><span class="ic">${m.ic}</span><span><b>${m.name}</b><small>${m.desc}</small></span></button>`).join("");
  for (const b of $("modes").querySelectorAll("button")) b.onclick = () => startGame(MODES.find(m => m.id === b.dataset.m));
  $("nbCount").textContent = nbGet().length;
  const best = store.get("best", {});
  const parts = [];
  if (best.quick) parts.push(`Kỷ lục Đấu nhanh: ${best.quick} đ`);
  if (best.survival) parts.push(`Sinh tồn: ${best.survival} đ`);
  $("bestLine").textContent = parts.join(" · ");
}

/* ================================================================ CHƠI */
let G = null;
const MAX_LIVES = 3;

function startGame(mode, queue) {
  queue = queue || buildQueue(mode.cats);
  G = { mode, queue, count: Math.min(mode.count, mode.id === "survival" ? Infinity : queue.length), idx: -1, score: 0,
    lives: mode.lives ?? MAX_LIVES, streak: 0, bestStreak: 0, wrongStreak: 0, correct: 0, answered: 0, wrongs: [], fifty: 1, cur: null, locked: true };
  show("game");
  setFace("neutral");
  next();
}

function setFace(mood) {
  const f = $("face"), b = $("bubble");
  f.classList.remove("mad", "happy"); b.classList.remove("mad", "happy");
  void f.offsetWidth; // chạy lại animation
  const roast = settings.tone === "roast";
  f.textContent = mood === "mad" ? (G && G.wrongStreak >= 2 ? (roast ? "🤯" : "🫂") : (roast ? "🤬" : "😅")) : mood === "happy" ? (G && G.streak >= 3 ? "🤩" : "😎") : (roast ? "😏" : "😊");
  if (mood !== "neutral") { f.classList.add(mood); b.classList.add(mood); }
}
function talk(text) { $("bubble").textContent = text; }

function renderHud() {
  $("lives").textContent = G.lives === Infinity ? "♾️" : "❤️".repeat(Math.max(0, G.lives)) + "🖤".repeat(Math.max(0, MAX_LIVES - G.lives));
  $("progressTxt").textContent = G.count === Infinity ? `Câu ${G.idx + 1}` : `Câu ${G.idx + 1}/${G.count}`;
  $("streakTxt").textContent = G.streak >= 2 ? `🔥 ${G.streak}` : "";
  $("scoreTxt").textContent = G.score;
  $("fiftyBtn").textContent = `🆘 50:50 (còn ${G.fifty})`;
  $("fiftyBtn").disabled = !G.fifty || G.locked || !G.cur || G.cur.kind !== "mc";
}

function next() {
  if (G.lives <= 0 || G.idx + 1 >= G.count) return endGame();
  G.idx++;
  if (G.idx >= G.queue.length) {
    if (G.mode.id === "survival") G.queue.push(...buildQueue(G.mode.cats)); else return endGame();
  }
  const q = G.cur = G.queue[G.idx];
  G.locked = false;
  stopVoice(); hideMeme();
  $("explain").classList.add("hidden");
  $("card").classList.remove("shake");
  $("chip").textContent = q.chip ? `🤖 ${q.chip}` : CAT[q.cat] || "";
  $("question").textContent = q.q;
  const sp = q.speak || q.speakBtn;
  $("speakBtn").classList.toggle("hidden", !sp);
  $("speakBtn").textContent = q.speak ? "🔊 Nghe lại (chậm)" : "🔊 Nghe đọc";
  if (q.speak) setTimeout(() => say(q.speak), 350);

  const box = $("options");
  if (q.kind === "mc") {
    $("typeForm").classList.add("hidden");
    box.classList.remove("hidden");
    box.innerHTML = "";
    shuffle(q.options).forEach((o, i) => {
      const b = document.createElement("button");
      b.className = "opt"; b.dataset.v = o;
      b.innerHTML = `<span class="n">${i + 1}</span><span>${esc(o)}</span>`;
      b.onclick = () => answer(o);
      box.appendChild(b);
    });
  } else {
    box.classList.add("hidden");
    $("typeForm").classList.remove("hidden");
    const inp = $("typeInput");
    inp.value = ""; inp.disabled = false; inp.className = "";
    setTimeout(() => inp.focus(), 50);
  }
  if (G.lives === 1 && !G.warnedLast) { G.warnedLast = true; const t = line("lastLife"); setFace("neutral"); talk(t); if (!q.speak) voiceSeq([t], 150); }
  else if (G.idx > 0 || G.mode.id !== "ai") { setFace("neutral"); talk(line("prompt")); }
  renderHud();
  startTimer(q.kind === "type" ? 30 : q.speak ? 25 : 20);
}

/* ---------- đồng hồ ---------- */
let raf = 0, tStart = 0, tDur = 0, lastTick = 0;
function startTimer(sec) {
  cancelAnimationFrame(raf); tStart = performance.now(); tDur = sec * 1000; lastTick = sec;
  const bar = $("timerBar");
  const loop = now => {
    const left = Math.max(0, 1 - (now - tStart) / tDur);
    bar.style.width = (left * 100) + "%";
    bar.className = left < 0.25 ? "danger" : left < 0.5 ? "warn" : "";
    const secLeft = Math.ceil(left * sec);
    if (left < 0.25 && secLeft !== lastTick) { lastTick = secLeft; SFX.tick(); }
    if (left <= 0) return answer(null, true);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}
function stopTimer() { cancelAnimationFrame(raf); return Math.max(0, 1 - (performance.now() - tStart) / tDur); }

/* ---------- trả lời ---------- */
function answer(choice, timeout = false) {
  if (!G || G.locked) return;
  G.locked = true;
  const timeLeft = stopTimer();
  const q = G.cur;
  const ok = !timeout && (q.kind === "type" ? q.answers.some(a => norm(a) === norm(choice)) : choice === q.answer);

  if (q.kind === "mc") {
    for (const b of $("options").querySelectorAll(".opt")) {
      b.disabled = true;
      if (b.dataset.v === q.answer) b.classList.add("right");
      else if (b.dataset.v === choice) b.classList.add("wrong");
    }
  } else {
    const inp = $("typeInput"); inp.disabled = true; inp.className = ok ? "right" : "wrong";
  }
  G.answered++; markSeen(q.id);

  let pts = 0, spoken = [], voiceDelay = 150;
  if (ok) {
    const wasWrongStreak = G.wrongStreak;
    G.correct++; G.streak++; G.wrongStreak = 0; G.bestStreak = Math.max(G.bestStreak, G.streak);
    const mult = G.streak >= 8 ? 3 : G.streak >= 5 ? 2 : G.streak >= 3 ? 1.5 : 1;
    pts = Math.round((100 + 50 * timeLeft) * mult / 5) * 5;
    G.score += pts;
    popText(G.streak >= 3 ? `Combo x${G.streak}! +${pts}` : `+${pts}`);
    const roast = settings.tone === "roast";
    if (roast && wasWrongStreak >= 2) showMeme(pickMeme("comeback"), "good");
    else if (roast && G.streak >= 3) showMeme(pickMeme("combo"), "good");
    else if (roast && Math.random() < 0.35) showMeme(pickMeme("right"), "good");
    else G.streak >= 3 ? SFX.airhorn() : SFX.good();
    setFace("happy");
    const t = wasWrongStreak >= 2 ? line("comeback") : G.streak >= 3 ? line("rightStreak", G.streak) : line("right");
    talk(t); spoken = [t];
    if (G.mode.id === "review") nbRemove(q.id);
  } else {
    if (G.lives !== Infinity) G.lives--;
    G.streak = 0; G.wrongStreak++;
    G.wrongs.push({ q, you: timeout ? null : choice });
    nbAdd(q);
    const card = $("card"); card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    setFace("mad");
    let t, scared = false;
    const roast = settings.tone === "roast";
    if (roast && settings.scare === "1" && (G.wrongStreak >= 3 || Math.random() < 0.12) && G.idx - (G.lastScare ?? -9) >= 4) {
      G.lastScare = G.idx; scared = true; t = line("scare");
    } else if (timeout) t = line("timeout");
    else if (G.wrongStreak >= 2) t = line("wrongStreak", G.wrongStreak);
    else if (q.roast && settings.tone === "roast" && Math.random() < 0.7) t = q.roast;
    else if (q.cat === "vietlish" && Math.random() < 0.6) t = line("vietlish");
    else if (q.lvl === 1 && Math.random() < 0.4) t = line("wrongEasy");
    else t = line("wrong");
    spoken = [t];
    if (G.lives <= 0) spoken.push(line("gameover"));
    talk(spoken.join(" "));
    if (scared) scare();
    else if (roast) {
      const meme = pickMeme(timeout ? "timeout" : G.wrongStreak >= 2 ? "streak" : q.cat === "vietlish" && Math.random() < 0.6 ? "vietlish" : q.lvl === 1 && Math.random() < 0.4 ? "easy" : "wrong");
      showMeme(meme, "bad");
      // tiếng cười chọc quê: luôn có với meme "cười", còn lại 45%
      const laughs = LAUGHS.filter(l => manifest[l]);
      if (laughs.length && (meme[5] || Math.random() < 0.45)) spoken.unshift(pick(laughs));
    }
    else SFX.bad();
    voiceDelay = scared ? 750 : roast ? 380 : 150;
  }
  const sayEn = q.sayAfter && (ok || q.kind === "mc") ? () => setTimeout(() => say(q.sayAfter), 200) : null;
  voiceSeq(spoken, voiceDelay, sayEn);

  const ex = $("explain");
  ex.classList.remove("hidden"); ex.classList.toggle("bad", !ok);
  let html = ok ? `<div class="ans">✅ Đúng${q.kind === "type" ? `: ${esc(choice)}` : ""}</div>`
    : `<div class="ans">${timeout ? "⏰ Hết giờ." : "❌ Sai."} Đáp án: ${esc(q.answer)}</div>`;
  if (!ok && q.kind === "type" && !timeout) html += `<div class="muted">Mày gõ: “${esc(choice)}”</div>`;
  html += `<div>${esc(q.ex)}</div>`;
  $("explainTxt").innerHTML = html;
  $("nextBtn").innerHTML = (G.lives <= 0 || G.idx + 1 >= G.count ? "Xem kết quả ➜" : "Câu tiếp ➜") + ' <span class="kbd">Enter</span>';
  renderHud();
  setTimeout(() => $("nextBtn").focus(), 30);
}

function popText(t) { const p = $("pop"); p.textContent = t; p.classList.remove("go"); void p.offsetWidth; p.classList.add("go"); }

function useFifty() {
  if (!G || G.locked || !G.fifty || G.cur.kind !== "mc") return;
  G.fifty--;
  const wrong = shuffle([...$("options").querySelectorAll(".opt")].filter(b => b.dataset.v !== G.cur.answer)).slice(0, 2);
  wrong.forEach(b => { b.classList.add("gone"); b.disabled = true; });
  const t = line("fifty"); talk(t); voiceSeq([t]);
  renderHud();
}

/* ================================================================ KẾT THÚC */
function endGame() {
  cancelAnimationFrame(raf);
  try { speechSynthesis.cancel(); } catch {}
  const acc = G.answered ? G.correct / G.answered : 0;
  hideMeme();
  const tone = RANKS[settings.tone] ? settings.tone : "roast";
  let ri = 0; RANKS[tone].forEach((x, i) => { if (acc >= x[0]) ri = i; });
  const r = RANKS[tone][ri];
  $("endFace").textContent = r[1];
  $("rank").textContent = r[2];
  let msg = LINES[tone].rank[ri];
  voiceSeq([msg], 500);
  const best = store.get("best", {});
  const key = G.mode.id;
  const isRecord = ["quick", "survival"].includes(key) && G.score > (best[key] || 0) && G.score > 0;
  if (isRecord) { best[key] = G.score; store.set("best", best); msg = (settings.tone === "roast" ? "KỶ LỤC MỚI! Ăn may thôi chứ gì. " : "Kỷ lục mới! ") + msg; }
  $("endLine").textContent = msg;
  const stat = (v, l, cls = "") => `<div class="stat ${cls}"><b>${v}</b><span>${l}</span></div>`;
  $("stats").innerHTML = stat(G.score, "điểm", isRecord ? "new" : "") + stat(`${G.correct}/${G.answered}`, "câu đúng") + stat(Math.round(acc * 100) + "%", "chính xác") + stat(G.bestStreak, "chuỗi dài nhất");

  $("wrongWrap").classList.toggle("hidden", !G.wrongs.length);
  $("wrongList").innerHTML = G.wrongs.map(({ q, you }) => `<div class="wrong-item">
      <div class="q">${esc(q.speak ? `${q.q} (máy đọc: “${q.speak}”)` : q.q)}</div>
      <div>${you == null ? '<span class="you">hết giờ</span>' : `<span class="you">${esc(you)}</span>`} → <span class="ok">${esc(q.answer)}</span></div>
      <div class="ex">${esc(q.ex)}</div></div>`).join("");
  show("end");
}

/* ================================================================ SỔ LỖI UI */
function renderNotebook() {
  const nb = nbGet();
  $("nbList").innerHTML = nb.length ? nb.map(q => `<div class="wrong-item">
      <div class="q">${esc(q.speak ? `${q.q} (“${q.speak}”)` : q.q)}</div>
      <div>Đáp án: <span class="ok">${esc(q.answer)}</span></div>
      <div class="ex">${esc(q.ex)}</div></div>`).join("") : `<p class="muted">Sổ trống trơn. ${settings.tone === "roast" ? "Hoặc mày giỏi, hoặc mày chưa chơi." : "Chơi vài ván rồi quay lại nhé."}</p>`;
  $("nbPlay").disabled = !nb.length; $("nbClear").classList.toggle("hidden", !nb.length);
  show("notebook");
}
const REVIEW = { id: "review", name: "Ôn lỗi sai", count: 20, lives: Infinity, cats: [] };

/* ================================================================ ĐỀ AI */
let aiOK = true;
// Bản đăng tĩnh (GitHub Pages) không có server → ẩn hẳn phần Đề AI
fetch("api/status").then(r => { if (!r.ok) throw 0; return r.json(); })
  .then(s => { aiOK = !!s.hasKey; if (!aiOK) { $("aiErr").textContent = "Chưa có GEMINI_API_KEY nên phần đề AI chưa dùng được. Các chế độ khác vẫn chơi bình thường."; $("aiErr").classList.remove("hidden"); } })
  .catch(() => { aiOK = false; document.querySelector(".ai-box").classList.add("hidden"); });
let lastAI = null;
$("aiForm").onsubmit = async e => {
  e.preventDefault();
  const topic = $("aiTopic").value.trim();
  if (!topic) { $("aiTopic").focus(); return; }
  const btn = $("aiBtn"); btn.disabled = true; btn.textContent = "Đang soạn… (~30 giây)";
  $("aiErr").classList.add("hidden");
  $("homeLine").textContent = settings.tone === "roast" ? "Đợi tí, tao đang soạn đề hành mày…" : "Đang soạn đề, đợi chút nhé…";
  try {
    const r = await fetch("api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, level: settings.level, tone: settings.tone }) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Lỗi không rõ");
    const qs = j.questions.map((x, i) => ({ id: `ai:${topic}:${x.q}`, cat: "ai", chip: x.category_vi || topic, lvl: 2, kind: "mc", q: x.q, options: x.options, answer: x.options[0], ex: x.explain_vi, roast: x.roast_vi }));
    lastAI = { id: "ai", name: "Đề AI: " + topic, count: qs.length, cats: [], queue: qs };
    startGame(lastAI, shuffle(qs));
    setFace("neutral"); talk(settings.tone === "roast" ? `Đề “${topic}” nóng hổi đây. Sai là biết tay tao.` : `Đề “${topic}” đây, chúc bạn may mắn!`);
  } catch (err) {
    $("aiErr").textContent = err.message; $("aiErr").classList.remove("hidden");
    $("homeLine").textContent = settings.tone === "roast" ? "AI nó dỗi rồi. Chơi đề có sẵn đi mày." : "AI đang bận, bạn chơi đề có sẵn nhé.";
  } finally { btn.disabled = false; btn.textContent = "Soạn đề"; }
};

/* ================================================================ SỰ KIỆN */
$("typeForm").onsubmit = e => { e.preventDefault(); const v = $("typeInput").value; if (!G.locked && v.trim()) answer(v); };
$("nextBtn").onclick = () => next();
$("speakBtn").onclick = () => { const q = G && G.cur; if (q) say(q.speak || q.speakBtn, q.speak ? 0.65 : 0.9); };
$("fiftyBtn").onclick = useFifty;
$("quitBtn").onclick = () => {
  if (!G.answered || confirm(settings.tone === "roast" ? "Bỏ cuộc hả đồ nhát? Bấm OK để xem kết quả." : "Kết thúc ván này?")) { G.answered ? endGame() : (cancelAnimationFrame(raf), renderHome(), show("home")); }
};
$("againBtn").onclick = () => {
  const m = G.mode;
  if (m.id === "review") return nbGet().length ? startGame(REVIEW, shuffle(nbGet()).slice(0, 20)) : (renderHome(), show("home"));
  if (m.id === "ai") return startGame(m, shuffle(m.queue));
  startGame(m);
};
$("homeBtn").onclick = () => { stopVoice(); renderHome(); show("home"); };
$("nbBtn").onclick = renderNotebook;
$("nbBack").onclick = () => { renderHome(); show("home"); };
$("nbPlay").onclick = () => startGame(REVIEW, shuffle(nbGet()).slice(0, 20));
$("nbClear").onclick = () => { if (confirm("Xóa hết sổ lỗi?")) { store.set("notebook", []); renderNotebook(); } };

$("meme").onclick = hideMeme;
document.addEventListener("keydown", e => {
  if ($("game").classList.contains("hidden") || !G) return;
  if (!$("meme").classList.contains("hidden") && G.locked) { e.preventDefault(); hideMeme(); return; }
  if (e.target.tagName === "INPUT" && !G.locked) return;
  if (!G.locked && G.cur.kind === "mc" && /^[1-4]$/.test(e.key)) {
    const b = $("options").querySelectorAll(".opt")[+e.key - 1];
    if (b && !b.disabled) b.click();
  } else if (G.locked && e.key === "Enter" && !$("explain").classList.contains("hidden")) {
    e.preventDefault(); next();
  }
});

renderHome();
