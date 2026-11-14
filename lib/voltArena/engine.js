// Volt Arena: player control, waves, input, and the main loop.
import { W, H, GROUND, drawFighter, drawArena, drawBolt } from './draw';
import { drawHud, drawScreen } from './hud';
import { fighter, physics, startAttack, isAttack, checkHits, throwHeld, popText } from './combat';
import { WAVES, DIFFICULTY, TIPS, spawnEnemy, updateEnemy } from './enemies';
import { updateOrbs, maybeDrop, updateItems, drawItemsAndOrbs } from './items';

const VOLT_COST = 25;
const GAME_KEYS = new Set(['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's',
    'j', 'k', 'l', 'u', 'i', 'o', 'v', ' ', 'shift', 'enter']);

function readBest() {
    try { return Number(localStorage.getItem('voltArenaBest')) || 0; } catch { return 0; }
}
function saveBest(v) {
    try { localStorage.setItem('voltArenaBest', String(v)); } catch { /* storage unavailable */ }
}

const PAR_TIME = 25; // seconds per wave before the speed bonus runs out

// 0-100 performance score: waves cleared, best combo, move variety, damage taken.
export function rankOf(S) {
    const perf = (S.wave / WAVES.length) * 45 + (Math.min(S.maxCombo, 15) / 15) * 20
        + (Math.min(S.movesUsed.size, 10) / 10) * 15 + Math.max(0, 20 - S.dmgTaken / 15);
    if (perf >= 90) return 'S';
    if (perf >= 75) return 'A';
    if (perf >= 55) return 'B';
    if (perf >= 35) return 'C';
    return 'D';
}

export function createGame(canvas, faceImg) {
    const ctx = canvas.getContext('2d');
    const keys = new Set();
    const pressed = new Set();
    const S = { mode: 'title', time: 0, best: readBest(), diff: 1, seen: new Set() };

    function reset() {
        Object.assign(S, { wave: 0, score: 0, combo: 0, maxCombo: 0, comboT: 0, dmgTaken: 0, hitstop: 0, shake: 0,
            voltFlash: 0, enemies: [], sparks: [], bolts: [], texts: [], orbs: [], items: [], slow: false, nextPunch: 'jab',
            seen: new Set(), comboMoves: new Set(), movesUsed: new Set() });
        S.onKo = (e) => maybeDrop(S, e);
        S.player = fighter({ isPlayer: true, x: W / 2, hp: 100, maxHp: 100, volt: 50, color: '#e0f2fe', glow: '#22d3ee' });
        startWave(0);
    }

    function startWave(n) {
        S.wave = n;
        S.queue = [...WAVES[n].list];
        S.waveT = 0;
        S.spawnT = 0.3;
        S.mode = 'banner';
        S.bannerT = 2.4;
        const fresh = WAVES[n].list.filter((k) => !S.seen.has(k));
        fresh.forEach((k) => S.seen.add(k));
        const gateKey = WAVES[n].gate && fresh.find((k) => ['warden', 'boss'].includes(k));
        S.tip = gateKey ? TIPS[gateKey] : fresh.length ? TIPS[fresh[0]] : '';
    }

    const press = (...ks) => ks.some((k) => pressed.has(k));

    function playerMove(kind, volt) {
        const P = S.player;
        if (volt && P.volt < VOLT_COST) { popText(S, P.x, P.y - 130, 'LOW VOLT', '#facc15'); volt = false; }
        if (volt) { P.volt -= VOLT_COST; S.voltFlash = 0.45; P.voltGlow = 0.6; }
        const down = keys.has('arrowdown') || keys.has('s');
        if (kind === 'grab') {
            P.vault = Math.abs(P.vx) > 100 && !volt;
            if (P.onGround) startAttack(P, volt ? 'vgrab' : 'grab');
            return;
        }
        if (!P.onGround) { startAttack(P, 'airkick'); return; }
        if (down && !volt) { startAttack(P, kind === 'kick' ? 'slide' : 'uppercut'); return; }
        if (kind === 'kick') { startAttack(P, volt ? 'vkick' : 'kick'); return; }
        if (volt) { startAttack(P, 'vpunch'); return; }
        startAttack(P, S.nextPunch);
        S.nextPunch = S.nextPunch === 'jab' ? 'cross' : 'jab';
    }

    // Returns true if an action was started from input this frame.
    function actionInput() {
        const P = S.player;
        const mod = keys.has('v');
        const dir = (keys.has('arrowright') || keys.has('d') ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') ? 1 : 0);
        const down = keys.has('arrowdown') || keys.has('s');
        const rollIn = (press('arrowdown', 's') && dir) || (down && press('arrowleft', 'arrowright', 'a', 'd'));
        if (rollIn && P.onGround) {
            P.facing = dir || P.facing;
            Object.assign(P, { state: 'roll', actT: 0, actDur: 0.42, vx: P.facing * 440, invuln: 0.42 });
            return true;
        }
        if (press('j', 'u')) { playerMove('punch', pressed.has('u') || mod); return true; }
        if (press('k', 'i')) { playerMove('kick', pressed.has('i') || mod); return true; }
        if (press('l', 'o')) { playerMove('grab', pressed.has('o') || mod); return true; }
        return false;
    }

    function updatePlayer(dt) {
        const P = S.player;
        P.voltGlow = Math.max(0, (P.voltGlow || 0) - dt);
        P.powerT = Math.max(0, (P.powerT || 0) - dt);
        P.glow = P.voltGlow > 0 ? '#facc15' : P.powerT > 0 ? '#f43f5e' : '#22d3ee';
        const speed = P.powerT > 0 ? 1.25 : 1;
        if (P.state === 'ko') { P.koT += dt; P.vx *= Math.pow(0.02, dt); physics(P, dt); return; }
        if (P.held && P.held.state !== 'held') { P.held = null; if (P.state === 'hold') P.state = 'idle'; }
        if (P.state !== 'hold' && P.held) { P.held.state = 'hit'; P.held.stun = 0.3; P.held = null; }
        const dir = (keys.has('arrowright') || keys.has('d') ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') ? 1 : 0);
        if (P.state === 'hit') {
            P.stun -= dt;
            P.vx *= Math.pow(0.01, dt);
            if (P.stun <= 0) P.state = 'idle';
        } else if (P.state === 'roll') {
            P.actT += dt;
            P.spin = (P.actT / P.actDur) * Math.PI * 2 * P.facing;
            if (P.actT >= P.actDur) { P.state = 'idle'; P.spin = 0; P.vx = 0; }
        } else if (P.state === 'hold') {
            P.holdT += dt;
            P.vx = 0;
            if (dir) P.facing = dir;
            Object.assign(P.held, { x: P.x + P.facing * 34, y: GROUND - 26, facing: -P.facing });
            if (press('j', 'k', 'l', 'u', 'i', 'o') || P.holdT > (P.voltHold ? 0.35 : 1.3)) throwHeld(S, P);
        } else if (P.state === 'throw') {
            P.actT += dt;
            if (P.actT >= P.actDur) P.state = 'idle';
        } else if (isAttack(P)) {
            P.actT += dt;
            const p = P.actT / P.actDur;
            if (P.state === 'vpunch' && p > 0.25 && p < 0.65) P.vx = P.facing * 560;
            else if (P.state === 'slide' && p < 0.75) P.vx = P.facing * 480 * (1 - p);
            else if (P.onGround) P.vx *= Math.pow(0.002, dt);
            if (P.state === 'vkick' && p > 0.5 && !P.flipped) { P.facing = -P.facing; P.flipped = true; }
            checkHits(S, P, S.enemies);
            if (P.state === 'hold') return physics(P, dt);
            const canCancel = P.actT > P.actDur * 0.65 && P.onGround;
            if (canCancel && press('arrowup', 'w')) { P.vy = -680; P.onGround = false; P.state = 'jump'; }
            else if (!(canCancel && actionInput()) && P.actT >= P.actDur) P.state = P.onGround ? 'idle' : 'jump';
        } else {
            const crouching = P.onGround && (keys.has('arrowdown') || keys.has('s'));
            P.vx = crouching ? 0 : dir * (P.onGround ? 270 : 230) * speed;
            if (dir) P.facing = dir;
            P.state = !P.onGround ? 'jump' : crouching ? 'crouch' : dir ? 'walk' : 'idle';
            if (press('arrowup', 'w') && P.onGround) { P.vy = -680; P.onGround = false; P.state = 'jump'; }
            actionInput();
        }
        const wantSlow = keys.has(' ') || keys.has('shift');
        const overclock = wantSlow && P.volt > 0;
        S.slow = overclock || S.voltFlash > 0;
        P.volt = overclock ? Math.max(0, P.volt - 28 * dt) : Math.min(100, P.volt + 3 * dt);
        physics(P, dt);
    }

    function update(rawDt) {
        S.time += rawDt;
        if (S.mode === 'title') {
            if (press('arrowleft', 'a')) S.diff = (S.diff + 2) % 3;
            if (press('arrowright', 'd')) S.diff = (S.diff + 1) % 3;
        }
        if (press('enter') && ['title', 'over', 'win'].includes(S.mode)) reset();
        if (!['play', 'banner'].includes(S.mode)) return;
        if (S.mode === 'banner') { S.bannerT -= rawDt; if (S.bannerT <= 0) S.mode = 'play'; }
        if (S.hitstop > 0) { S.hitstop -= rawDt; return; }
        S.voltFlash = Math.max(0, S.voltFlash - rawDt);
        const pdt = rawDt * (S.slow ? 0.8 : 1);
        const edt = rawDt * (S.slow ? 0.3 : 1);
        updatePlayer(pdt);
        S.enemies.forEach((e) => updateEnemy(S, e, edt));
        updateOrbs(S, pdt, edt);
        updateItems(S, pdt);
        S.waveT += rawDt;
        S.enemies = S.enemies.filter((e) => !(e.state === 'ko' && e.koT > 1.8));
        const alive = S.enemies.filter((e) => e.state !== 'ko').length;
        S.spawnT -= rawDt;
        if (S.mode === 'play' && S.queue.length && alive < DIFFICULTY[S.diff].max && S.spawnT <= 0) {
            spawnEnemy(S, S.queue.shift());
            S.spawnT = 1.0;
        }
        if (S.mode === 'play' && !S.queue.length && !S.enemies.length) {
            const bonus = Math.max(0, Math.round((PAR_TIME - S.waveT) * 60));
            if (bonus) { S.score += bonus; S.texts.push({ x: W / 2, y: 140, text: `SPEED BONUS +${bonus}`, life: 1.6, color: '#fde047' }); }
            S.items = [];
            S.orbs = [];
            if (S.wave + 1 >= WAVES.length) { S.wave += 1; S.mode = 'win'; S.score += Math.round(S.player.hp * 20); finish(); }
            else {
                const newRound = WAVES[S.wave + 1].round !== WAVES[S.wave].round;
                S.player.hp = Math.min(100, S.player.hp + (newRound ? 60 : 20));
                startWave(S.wave + 1);
            }
        }
        if (S.player.state === 'ko' && S.player.koT > 1.4 && S.mode === 'play') { S.mode = 'over'; finish(); }
        S.comboT -= rawDt;
        if (S.comboT <= 0) { S.combo = 0; S.comboMoves.clear(); }
        S.shake *= Math.pow(0.004, rawDt);
        for (const s of S.sparks) { s.x += s.vx * edt; s.y += s.vy * edt; s.vy += 900 * edt; s.life -= rawDt; }
        S.sparks = S.sparks.filter((s) => s.life > 0);
        S.bolts.forEach((b) => { b.life -= rawDt; });
        S.bolts = S.bolts.filter((b) => b.life > 0);
        S.texts.forEach((t) => { t.y -= 50 * rawDt; t.life -= rawDt; });
        S.texts = S.texts.filter((t) => t.life > 0);
    }

    function finish() {
        S.rank = rankOf(S);
        if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    }

    function drawWarnings() {
        for (const e of S.enemies) {
            if (e.state !== 'charge') continue;
            const p = e.actT / e.actDur;
            ctx.save();
            ctx.strokeStyle = `rgba(244,63,94,${0.3 + 0.5 * p})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 8]);
            ctx.beginPath();
            ctx.ellipse(e.x, GROUND, 230 * p, 26 * p, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    function render() {
        ctx.save();
        if (S.shake > 0.3) ctx.translate((Math.random() - 0.5) * S.shake, (Math.random() - 0.5) * S.shake);
        drawArena(ctx, S.time, S.slow);
        if (S.player) {
            drawWarnings();
            drawItemsAndOrbs(ctx, S, S.time);
            S.enemies.filter((e) => e.state !== 'held').forEach((e) => drawFighter(ctx, e, null));
            drawFighter(ctx, S.player, faceImg);
            if (S.player.held) drawFighter(ctx, S.player.held, null);
            for (const s of S.sparks) {
                ctx.fillStyle = s.color;
                ctx.globalAlpha = Math.min(1, s.life * 3);
                ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
            }
            ctx.globalAlpha = 1;
            S.bolts.forEach((b) => drawBolt(ctx, b.pts, Math.min(1, b.life * 5)));
        }
        ctx.restore();
        if (S.player) drawHud(ctx, S, faceImg);
        drawScreen(ctx, S, faceImg);
    }

    let raf = 0;
    let last = performance.now();
    function frame(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        update(dt);
        pressed.clear();
        render();
        raf = requestAnimationFrame(frame);
    }

    function setKey(key, down) {
        const k = key.toLowerCase();
        if (down && !keys.has(k)) pressed.add(k);
        if (down) keys.add(k); else keys.delete(k);
    }
    const onDown = (ev) => {
        const k = ev.key.toLowerCase();
        if (!GAME_KEYS.has(k)) return;
        ev.preventDefault();
        setKey(k, true);
    };
    const onUp = (ev) => setKey(ev.key, false);
    const onBlur = () => keys.clear();
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    raf = requestAnimationFrame(frame);

    return {
        setKey,
        debug: () => S,
        destroy() {
            cancelAnimationFrame(raf);
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
            window.removeEventListener('blur', onBlur);
        },
    };
}

export { W, H };
