// Volt Arena: HUD bars, banners, and title / end screens.
import { W, H } from './draw';
import { DIFFICULTY, WAVES, ROUNDS } from './enemies';

const FONT = '"Segoe UI", system-ui, -apple-system, sans-serif';

function bar(ctx, x, y, w, h, frac, color, label) {
    ctx.fillStyle = 'rgba(15,23,42,0.85)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillRect(x + 2, y + 2, Math.max(0, (w - 4) * frac), h - 4);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(148,163,184,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    if (label) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = `600 11px ${FONT}`;
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 6, y + h - 4);
    }
}

function face(ctx, img, x, y, r, ring = '#22d3ee') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#0b1020';
    ctx.fill();
    if (img && img.complete && img.naturalWidth) {
        ctx.clip();
        ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = ring;
    ctx.lineWidth = 3;
    ctx.shadowColor = ring;
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function text(ctx, str, x, y, size, color, align = 'center', weight = 800) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
}

export function drawHud(ctx, S, img) {
    const P = S.player;
    face(ctx, img, 44, 44, 26);
    bar(ctx, 80, 22, 260, 18, P.hp / P.maxHp, P.hp > 30 ? '#4ade80' : '#f43f5e', 'HP');
    bar(ctx, 80, 46, 260, 14, P.volt / 100, S.slow ? '#38bdf8' : '#facc15', 'VOLT');
    // One pip per affordable volt move (25 each)
    for (const v of [25, 50, 75, 100]) {
        ctx.fillStyle = P.volt >= v ? '#facc15' : 'rgba(250,204,21,0.25)';
        ctx.fillRect(80 + 260 * (v / 100) - 3, 62, 6, 4);
    }
    const w = WAVES[Math.min(S.wave, WAVES.length - 1)];
    const inRound = WAVES.filter((x, i) => x.round === w.round && i <= S.wave).length;
    text(ctx, `${ROUNDS[w.round]} · ${w.gate ? 'BOSS' : `WAVE ${inRound}`}`, W - 24, 36, 16, '#e2e8f0', 'right');
    if (P.powerT > 0) bar(ctx, 80, 70, 120, 8, P.powerT / 7, '#f43f5e');
    text(ctx, `${S.score.toLocaleString()}`, W - 24, 62, 22, '#67e8f9', 'right');
    if (S.combo >= 2) {
        const a = Math.min(1, S.comboT * 2);
        ctx.globalAlpha = a;
        text(ctx, `${S.combo} HIT COMBO`, W / 2, 48, 26, '#facc15');
        if (S.comboMoves.size > 1) text(ctx, `${S.comboMoves.size} MOVES · ×${(1 + 0.2 * (S.comboMoves.size - 1)).toFixed(1)} STYLE`, W / 2, 68, 13, '#fde68a', 'center', 700);
        ctx.globalAlpha = 1;
    }
    if (S.slow) text(ctx, '◷ OVERCLOCK', W / 2, 88, 14, '#7dd3fc', 'center', 700);
    // Enemy bars above heads
    for (const e of S.enemies) {
        if (e.state === 'ko') continue;
        const s = e.scale || 1;
        const bw = 46 * s;
        const by = e.y - 118 * s;
        ctx.fillStyle = 'rgba(15,23,42,0.8)';
        ctx.fillRect(e.x - bw / 2, by, bw, 5);
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x - bw / 2, by, bw * (e.hp / e.maxHp), 5);
        text(ctx, e.name, e.x, by - 4, 9, e.color, 'center', 700);
    }
    for (const t of S.texts) {
        ctx.globalAlpha = Math.min(1, t.life * 3);
        text(ctx, t.text, t.x, t.y, 16, t.color);
    }
    ctx.globalAlpha = 1;
}

function veil(ctx) {
    ctx.fillStyle = 'rgba(2,6,23,0.78)';
    ctx.fillRect(0, 0, W, H);
}

const CONTROLS = [
    ['← → / A D', 'move  ·  ↑ jump  ·  ↓ duck  ·  ↓ + direction: roll'],
    ['J  K  L', 'punch  ·  kick  ·  grab, then attack to throw (on the run: vault)'],
    ['↓+J  ↓+K', 'launcher uppercut (juggle in the air)  ·  slide kick'],
    ['U  I  O', 'volt punch  ·  volt spin-kick  ·  zap grab (25 volt)'],
    ['SPACE (hold)', 'overclock: slow time while volt lasts'],
];

export function drawScreen(ctx, S, img) {
    const pulse = 0.6 + 0.4 * Math.sin(S.time * 4);
    if (S.mode === 'banner') {
        ctx.globalAlpha = Math.min(1, S.bannerT * 2);
        const w = WAVES[S.wave];
        const boss = !!w.gate;
        const first = S.wave === 0 || WAVES[S.wave - 1].round !== w.round;
        if (first) text(ctx, `ROUND ${w.round + 1} · ${ROUNDS[w.round]}`, W / 2, H / 2 - 90, 20, '#94a3b8', 'center', 700);
        const label = boss ? (S.wave === WAVES.length - 1 ? 'FINAL BOSS' : 'BOSS FIGHT') : `WAVE ${S.wave + 1}`;
        text(ctx, label, W / 2, H / 2 - 30, 54, boss ? '#f43f5e' : '#67e8f9');
        if (S.tip) {
            ctx.fillStyle = 'rgba(2,6,23,0.7)';
            ctx.fillRect(W / 2 - 330, H / 2 - 8, 660, 34);
            text(ctx, S.tip, W / 2, H / 2 + 15, 16, boss ? '#fda4af' : '#fde68a', 'center', 600);
        }
        ctx.globalAlpha = 1;
        return;
    }
    if (S.mode === 'title') {
        veil(ctx);
        face(ctx, img, W / 2, 124, 70);
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 24;
        text(ctx, 'VOLT ARENA', W / 2, 256, 64, '#e0f2fe');
        ctx.shadowBlur = 0;
        text(ctx, 'Three rounds. Nine waves. One charged-up hero.', W / 2, 292, 16, '#94a3b8', 'center', 500);
        const d = DIFFICULTY[S.diff];
        text(ctx, `◀  ${d.name}  ▶`, W / 2, 326, 20, d.color);
        CONTROLS.forEach(([k, desc], i) => {
            const y = 364 + i * 24;
            text(ctx, k, W / 2 - 190, y, 14, '#facc15', 'right', 700);
            text(ctx, desc, W / 2 - 190 + 12, y, 14, '#cbd5e1', 'left', 500);
        });
        ctx.globalAlpha = pulse;
        text(ctx, 'PRESS ENTER OR TAP TO FIGHT', W / 2, 510, 18, '#67e8f9');
        ctx.globalAlpha = 1;
        if (S.best) text(ctx, `BEST ${S.best.toLocaleString()}`, W - 24, 30, 14, '#64748b', 'right', 700);
        return;
    }
    if (S.mode === 'over' || S.mode === 'win') {
        veil(ctx);
        const win = S.mode === 'win';
        face(ctx, img, W / 2, 150, 70, win ? '#facc15' : '#f43f5e');
        text(ctx, win ? 'FULLY CHARGED' : 'SHORT CIRCUIT', W / 2, 280, 56, win ? '#facc15' : '#f43f5e');
        const fell = WAVES[Math.min(S.wave, WAVES.length - 1)];
        text(ctx, win ? 'Tournament cleared.' : `Fell in the ${ROUNDS[fell.round].toLowerCase()}, wave ${S.wave + 1} of ${WAVES.length}.`, W / 2, 314, 16, '#cbd5e1', 'center', 500);
        text(ctx, `SCORE  ${S.score.toLocaleString()}`, W / 2, 366, 28, '#67e8f9');
        text(ctx, `RANK ${S.rank}  ·  BEST COMBO ${S.maxCombo}  ·  ${S.movesUsed.size} MOVES USED  ·  ${DIFFICULTY[S.diff].name}`, W / 2, 398, 16, '#facc15', 'center', 700);
        text(ctx, `BEST  ${S.best.toLocaleString()}`, W / 2, 424, 14, '#94a3b8', 'center', 700);
        ctx.globalAlpha = pulse;
        text(ctx, 'PRESS ENTER OR TAP TO RETRY', W / 2, 470, 18, '#e0f2fe');
        ctx.globalAlpha = 1;
    }
}
