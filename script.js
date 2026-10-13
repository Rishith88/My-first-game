const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const timeEl = document.getElementById("time");
const levelEl = document.getElementById("level");
const bestEl = document.getElementById("best");
const startScreen = document.getElementById("startScreen");
const overScreen = document.getElementById("overScreen");
const overTitle = document.getElementById("overTitle");
const finalScore = document.getElementById("finalScore");
const finalBest = document.getElementById("finalBest");
const startBtn = document.getElementById("startBtn");
const againBtn = document.getElementById("againBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const soundBtn = document.getElementById("soundBtn");
let player = { x: 220, y: 160, s: 22, speed: 3, color: "#4ade80" };
let stars = [];
let enemies = [];
let parts = [];
let keys = {};
let score = 0;
let lives = 3;
let time = 60;
let level = 1;
let best = 0;
let running = false;
let paused = false;
let soundOn = true;
let audio = null;
try {
best = Number(localStorage.getItem("starBest")) || 0;
} catch (e) {
best = 0;
}
bestEl.textContent = best;
function beep(f) {
if (!soundOn) return;
try {
if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
let o = audio.createOscillator();
let g = audio.createGain();
o.type = "sine";
o.frequency.value = f;
g.gain.value = 0.08;
o.connect(g);
g.connect(audio.destination);
o.start();
o.stop(audio.currentTime + 0.12);
} catch (e) {}
}
function rand(a, b) {
return Math.floor(Math.random() * (b - a + 1)) + a;
}
function makeStar() {
return { x: rand(10, 460), y: rand(10, 340), s: 12, spin: Math.random() * 6 };
}
function makeEnemy() {
let side = rand(0, 3);
let e = { s: 20 + level * 2, speed: 1 + level * 0.3 };
if (side === 0) { e.x = rand(0, 460); e.y = -30; e.vx = rand(-1, 1); e.vy = e.speed; }
else if (side === 1) { e.x = rand(0, 460); e.y = 390; e.vx = rand(-1, 1); e.vy = -e.speed; }
else if (side === 2) { e.x = -30; e.y = rand(0, 340); e.vx = e.speed; e.vy = rand(-1, 1); }
else { e.x = 510; e.y = rand(0, 340); e.vx = -e.speed; e.vy = rand(-1, 1); }
return e;
}
function reset() {
player.x = 220;
player.y = 160;
score = 0;
lives = 3;
time = 60;
level = 1;
stars = [makeStar(), makeStar(), makeStar()];
enemies = [makeEnemy(), makeEnemy()];
parts = [];
keys = {};
paused = false;
pauseBtn.textContent = "Pause";
updateHud();
}
function updateHud() {
scoreEl.textContent = score;
livesEl.textContent = lives;
timeEl.textContent = time;
levelEl.textContent = level;
bestEl.textContent = best;
}
function hit(a, b) {
return a.x < b.x + b.s && a.x + a.s > b.x && a.y < b.y + b.s && a.y + a.s > b.y;
}
function burst(x, y, color) {
for (let i = 0; i < 10; i++) {
parts.push({ x: x, y: y, vx: rand(-3, 3), vy: rand(-3, 3), life: 20, color: color });
}
}
function startGame() {
reset();
running = true;
startScreen.classList.add("hidden");
overScreen.classList.add("hidden");
beep(600);
}
function endGame(win) {
running = false;
if (score > best) {
best = score;
try { localStorage.setItem("starBest", best); } catch (e) {}
}
finalScore.textContent = score;
finalBest.textContent = best;
overTitle.textContent = win ? "You Win!" : "Game Over";
overScreen.classList.remove("hidden");
beep(win ? 900 : 200);
updateHud();
}
function togglePause() {
if (!running) return;
paused = !paused;
pauseBtn.textContent = paused ? "Resume" : "Pause";
}
function update() {
if (!running || paused) return;
if (keys["up"] && player.y > 0) player.y -= player.speed;
if (keys["down"] && player.y < 360 - player.s) player.y += player.speed;
if (keys["left"] && player.x > 0) player.x -= player.speed;
if (keys["right"] && player.x < 480 - player.s) player.x += player.speed;
for (let s of stars) s.spin += 0.1;
for (let e of enemies) {
e.x += e.vx;
e.y += e.vy;
if (e.x < -40) e.x = 500;
if (e.x > 510) e.x = -30;
if (e.y < -40) e.y = 380;
if (e.y > 390) e.y = -30;
}
for (let i = stars.length - 1; i >= 0; i--) {
let box = { x: stars[i].x, y: stars[i].y, s: stars[i].s };
if (hit(player, box)) {
burst(stars[i].x, stars[i].y, "#ffd93d");
stars.splice(i, 1);
stars.push(makeStar());
score += 1;
beep(750);
if (score % 10 === 0) {
level += 1;
enemies.push(makeEnemy());
player.speed += 0.2;
beep(950);
}
updateHud();
}
}
for (let e of enemies) {
if (hit(player, e)) {
lives -= 1;
burst(player.x, player.y, "#ff5555");
beep(180);
player.x = 220;
player.y = 160;
updateHud();
if (lives <= 0) endGame(false);
break;
}
}
for (let i = parts.length - 1; i >= 0; i--) {
let p = parts[i];
p.x += p.vx;
p.y += p.vy;
p.life -= 1;
if (p.life <= 0) parts.splice(i, 1);
}
}
function draw() {
ctx.clearRect(0, 0, 480, 360);
ctx.fillStyle = "#0b1224";
ctx.fillRect(0, 0, 480, 360);
for (let s of stars) {
let w = Math.abs(Math.sin(s.spin)) * 4;
ctx.fillStyle = "#ffd93d";
ctx.fillRect(s.x - w * 0.5, s.y, s.s + w, s.s);
ctx.fillStyle = "#fff3a0";
ctx.fillRect(s.x + 2, s.y + 2, 5, 5);
}
ctx.fillStyle = player.color;
ctx.fillRect(player.x, player.y, player.s, player.s);
ctx.fillStyle = "#166534";
ctx.fillRect(player.x + 4, player.y + 4, 5, 5);
ctx.fillRect(player.x + 13, player.y + 4, 5, 5);
for (let e of enemies) {
ctx.fillStyle = "#ef4444";
ctx.fillRect(e.x, e.y, e.s, e.s);
ctx.fillStyle = "#7f1d1d";
ctx.fillRect(e.x + 4, e.y + 4, e.s - 8, e.s - 8);
}
for (let p of parts) {
ctx.fillStyle = p.color;
ctx.fillRect(p.x, p.y, 4, 4);
}
if (paused && running) {
ctx.fillStyle = "white";
ctx.font = "24px Arial";
ctx.fillText("PAUSED", 190, 180);
}
}
function loop() {
update();
draw();
requestAnimationFrame(loop);
}
setInterval(function () {
if (running && !paused) {
time -= 1;
timeEl.textContent = time;
if (time <= 0) endGame(true);
}
}, 1000);
document.addEventListener("keydown", function (e) {
let k = e.key.toLowerCase();
if (k === "arrowup" || k === "w") keys["up"] = true;
if (k === "arrowdown" || k === "s") keys["down"] = true;
if (k === "arrowleft" || k === "a") keys["left"] = true;
if (k === "arrowright" || k === "d") keys["right"] = true;
if (k === "p") togglePause();
if (k === "m") toggleSound();
if (k === "r") startGame();
if (k === " ") { e.preventDefault(); if (!running) startGame(); }
});
document.addEventListener("keyup", function (e) {
let k = e.key.toLowerCase();
if (k === "arrowup" || k === "w") keys["up"] = false;
if (k === "arrowdown" || k === "s") keys["down"] = false;
if (k === "arrowleft" || k === "a") keys["left"] = false;
if (k === "arrowright" || k === "d") keys["right"] = false;
});
function toggleSound() {
soundOn = !soundOn;
soundBtn.textContent = soundOn ? "Sound: On" : "Sound: Off";
}
startBtn.addEventListener("click", startGame);
againBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
soundBtn.addEventListener("click", toggleSound);
let touchBtns = document.querySelectorAll(".touch button");
touchBtns.forEach(function (b) {
let k = b.getAttribute("data-k");
b.addEventListener("pointerdown", function () { keys[k] = true; });
b.addEventListener("pointerup", function () { keys[k] = false; });
b.addEventListener("pointerleave", function () { keys[k] = false; });
});
updateHud();
loop();

