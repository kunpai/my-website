// Volt Arena: shared fighter factory, physics, attacks, grabs and throws.
import { W, GROUND, joints, bolt } from './draw';

const GRAVITY = 1900;

// win = active window as a fraction of the move; radius = hits all around the hip.
export const ATTACKS = {
    jab: { dur: 0.24, dmg: 6, limb: 'fh', kb: 140, win: [0.3, 0.62] },
    cross: { dur: 0.3, dmg: 9, limb: 'bh', kb: 200, win: [0.3, 0.62] },
    kick: { dur: 0.42, dmg: 13, limb: 'ff', kb: 360, win: [0.32, 0.62] },
    airkick: { dur: 0.38, dmg: 11, limb: 'ff', kb: 300, win: [0.25, 0.75] },
    grab: { dur: 0.32, limb: 'fh', win: [0.3, 0.65], grab: true },
    uppercut: { dur: 0.42, dmg: 10, limb: 'fh', kb: 60, win: [0.25, 0.6], launch: -720 },
    slide: { dur: 0.5, dmg: 11, limb: 'ff', kb: 200, win: [0.15, 0.75], launch: -260 },
    vpunch: { dur: 0.5, dmg: 22, limb: 'bh', kb: 560, win: [0.3, 0.7], volt: true },
    vkick: { dur: 0.6, dmg: 17, kb: 440, win: [0.3, 0.8], volt: true, radius: 82 },
    vgrab: { dur: 0.34, limb: 'fh', win: [0.3, 0.7], grab: true, volt: true },
};
export const LIGHT = new Set(['jab', 'cross']);

let nextId = 1;
export function fighter(o) {
    return { id: nextId++, x: W / 2, y: GROUND, vx: 0, vy: 0, facing: 1, state: 'idle', anim: 0, actT: 0, actDur: 0,
        hitIds: new Set(), stun: 0, flash: 0, invuln: 0, koT: 0, spin: 0, onGround: true, ...o };
}

export const isAttack = (f) => f.state in ATTACKS;

export function startAttack(f, atk) {
    f.state = atk;
    f.actT = 0;
    f.actDur = ATTACKS[atk].dur * (f.isPlayer ? 1 : 1.55);
    f.flipped = false;
    f.hitIds.clear();
}

export function physics(f, dt) {
    if (!f.onGround) f.vy += GRAVITY * dt;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    if (f.y >= GROUND) {
        if (!f.onGround && f.state === 'airkick') f.state = 'idle';
        f.y = GROUND;
        f.vy = 0;
        f.onGround = true;
    }
    if (f.x < 60 || f.x > W - 60) {
        f.x = Math.max(60, Math.min(W - 60, f.x));
        if (f.state === 'thrown') f.vx = -f.vx * 0.4;
    }
    f.anim += dt;
    f.flash = Math.max(0, f.flash - dt);
    f.invuln = Math.max(0, f.invuln - dt);
}

export function sparks(S, x, y, color, n = 12) {
    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 120 + Math.random() * 380;
        S.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 0.35 + Math.random() * 0.3, color });
    }
}

export function popText(S, x, y, text, color) {
    S.texts.push({ x, y, text, life: 0.7, color });
}

// heavy = staggers armored enemies too.
export function damage(S, t, amount, dir, kb, stun, heavy) {
    t.hp -= amount;
    t.flash = 0.08;
    if (t.isPlayer) S.dmgTaken += amount;
    if (t.hp <= 0) {
        t.hp = 0;
        t.state = 'ko';
        t.koT = 0;
        t.spin = 0;
        t.vx = dir * Math.max(kb, 200);
        t.vy = -340;
        t.onGround = false;
        if (!t.isPlayer) S.score += Math.round(t.maxHp * 4);
        if (!t.isPlayer && S.onKo) S.onKo(t);
        return;
    }
    if (t.armor && !heavy) {
        t.vx += dir * kb * 0.15;
        return;
    }
    t.vx = dir * kb;
    t.facing = -dir;
    t.state = 'hit';
    t.stun = stun;
    if (t.isPlayer) t.invuln = 0.55;
}

// Score scales with combo length and with how many different moves the combo used.
export function credit(S, dmg, x, y, move) {
    S.combo += 1;
    S.maxCombo = Math.max(S.maxCombo, S.combo);
    S.comboT = 1.3;
    S.comboMoves.add(move);
    S.movesUsed.add(move);
    const variety = 1 + 0.2 * (S.comboMoves.size - 1);
    S.score += Math.round(dmg * 10 * Math.max(1, S.combo) * variety);
    S.player.volt = Math.min(100, S.player.volt + 7);
    popText(S, x, y - 20, String(Math.round(dmg)), '#a5f3fc');
}

function tryBlock(S, att, t, a) {
    if (!t.block || a.volt || t.facing !== -att.facing) return false;
    if (!['idle', 'walk', 'block'].includes(t.state) || Math.random() > t.block) return false;
    t.state = 'block';
    t.blockT = 0.35;
    t.vx = att.facing * 140;
    sparks(S, t.x - att.facing * 14, t.y - 70, '#ffffff', 8);
    popText(S, t.x, t.y - 120, 'BLOCK', '#e2e8f0');
    S.hitstop = 0.03;
    return true;
}

function grab(S, P, t, volt) {
    if (t.boss || !t.onGround) return false;
    t.state = 'held';
    t.vx = 0;
    P.held = t;
    P.state = 'hold';
    P.holdT = 0;
    P.voltHold = volt;
    if (P.vault && !volt) {
        P.facing = -P.facing;
        popText(S, t.x, t.y - 120, 'VAULT THROW', '#fde047');
        throwHeld(S, P, -560);
        return true;
    }
    if (volt) {
        t.hp -= 12;
        t.flash = 0.3;
        sparks(S, t.x, t.y - 60, '#fde047', 20);
        S.bolts.push({ pts: bolt(P.x, P.y - 70, t.x, t.y - 60, 30), life: 0.4 });
    }
    popText(S, t.x, t.y - 120, volt ? 'ZAP GRAB' : 'GRAB', '#fde047');
    return true;
}

export function checkHits(S, att, targets) {
    const a = ATTACKS[att.state];
    const p = att.actT / att.actDur;
    if (p < a.win[0] || p > a.win[1]) return;
    const jt = joints(att);
    for (const t of targets) {
        if (['ko', 'held', 'thrown'].includes(t.state) || t.invuln > 0 || att.hitIds.has(t.id)) continue;
        if (t.state === 'crouch' && LIGHT.has(att.state)) continue; // ducked under
        const s = t.scale || 1;
        let hx;
        let hy;
        if (a.radius) {
            if (Math.abs(t.x - att.x) > a.radius * (att.scale || 1) + 14 * s) continue;
            [hx, hy] = [t.x, t.y - 60 * s];
        } else {
            [hx, hy] = jt[a.limb];
            // Hit anywhere along the reach (body to limb tip), so point-blank targets still connect.
            const pad = 18 * s + 8;
            if (t.x < Math.min(att.x, hx) - pad || t.x > Math.max(att.x, hx) + pad) continue;
            if (Math.sign(t.x - att.x) === -att.facing && Math.abs(t.x - att.x) > 12) continue;
            if (hy < t.y - 98 * s || hy > t.y + 4) continue;
        }
        att.hitIds.add(t.id);
        if (a.grab) { if (grab(S, att, t, a.volt)) return; continue; }
        if (tryBlock(S, att, t, a)) continue;
        const dir = a.radius ? Math.sign(t.x - att.x) || att.facing : att.facing;
        const power = att.isPlayer && att.powerT > 0 ? 1.5 : 1;
        const dmg = att.isPlayer ? a.dmg * power * (1 + Math.min(S.combo, 10) * 0.05) : a.dmg * att.dmgMul;
        const airborne = !t.onGround && t.state === 'hit';
        damage(S, t, dmg, dir, a.kb * (s > 1 ? 0.5 : 1), att.isPlayer ? 0.34 : 0.28, !LIGHT.has(att.state));
        if (t.state === 'hit' && !t.armor && (a.launch || airborne)) {
            t.vy = a.launch || -380;
            t.vx = dir * (a.launch ? 30 : 90); // keep juggled targets within reach
            t.onGround = false;
            if (a.launch && a.launch < -500) popText(S, t.x, t.y - 130, 'LAUNCH', '#fde047');
        }
        sparks(S, hx, hy, a.volt ? '#fde047' : att.isPlayer ? '#67e8f9' : att.color, a.volt ? 22 : 12);
        if (a.volt) S.bolts.push({ pts: bolt(att.x, att.y - 70, hx, hy, 26), life: 0.3 });
        S.hitstop = a.volt || att.state === 'kick' ? 0.07 : 0.045;
        S.shake = Math.max(S.shake, att.isPlayer ? (a.volt ? 10 : 5) : 9);
        if (att.isPlayer) credit(S, dmg, hx, hy, att.state);
    }
}

export function throwHeld(S, P, vy = -380) {
    const t = P.held;
    P.held = null;
    P.state = 'throw';
    P.actT = 0;
    P.actDur = 0.26;
    if (!t || t.state !== 'held') return;
    Object.assign(t, { state: 'thrown', x: P.x + P.facing * 30, y: 430, onGround: false, vx: P.facing * 640, vy,
        charged: P.voltHold, spin: 0 });
    t.hitIds.clear();
    S.shake = 6;
}

// A thrown body is a projectile until it lands; it bowls over anyone it touches.
export function updateThrown(S, t, enemies, dt) {
    t.spin += dt * 14 * Math.sign(t.vx || 1);
    const dmg = t.charged ? 22 : 14;
    for (const o of enemies) {
        if (o === t || ['ko', 'held', 'thrown'].includes(o.state) || t.hitIds.has(o.id)) continue;
        if (Math.abs(o.x - t.x) > 34 * (o.scale || 1) || t.y < o.y - 110 * (o.scale || 1)) continue;
        t.hitIds.add(o.id);
        damage(S, o, dmg, Math.sign(t.vx) || 1, 400, 0.6, true);
        sparks(S, o.x, o.y - 60, t.charged ? '#fde047' : '#67e8f9', 18);
        if (t.charged) S.bolts.push({ pts: bolt(t.x, t.y - 20, o.x, o.y - 60, 24), life: 0.3 });
        S.hitstop = 0.06;
        S.shake = 10;
        credit(S, dmg, o.x, o.y - 60, 'throw');
    }
    physics(t, dt);
    if (t.onGround) {
        t.spin = 0;
        t.state = 'hit';
        t.stun = 0.8;
        sparks(S, t.x, t.y - 10, '#94a3b8', 10);
        damage(S, t, t.charged ? 20 : 10, Math.sign(t.vx) || 1, 160, 0.8, true);
        credit(S, t.charged ? 20 : 10, t.x, t.y - 40, 'slam');
    }
}
