// Volt Arena: enemy archetypes, round/wave plan, difficulty, and AI.
import { W, GROUND, bolt } from './draw';
import { fighter, physics, startAttack, isAttack, checkHits, damage, sparks, popText, updateThrown } from './combat';
import { spawnOrb } from './items';

export const ARCHETYPES = {
    drone: { name: 'DRONE', color: '#94a3b8', glow: '#64748b', hp: 34, speed: 115, dmg: 0.55, cd: 1.5, moves: ['jab'] },
    guard: { name: 'BULWARK', color: '#2dd4bf', glow: '#0f766e', hp: 52, speed: 100, dmg: 0.7, cd: 1.4, moves: ['jab', 'cross'], block: 0.75 },
    dash: { name: 'FLICKER', color: '#facc15', glow: '#a16207', hp: 36, speed: 320, dmg: 0.7, cd: 0.9, moves: ['cross'], ai: 'hitrun' },
    leap: { name: 'SKIPJACK', color: '#c084fc', glow: '#7e22ce', hp: 46, speed: 165, dmg: 0.85, cd: 1.2, moves: ['jab', 'kick'], ai: 'leaper' },
    spark: { name: 'SPARKER', color: '#a3e635', glow: '#4d7c0f', hp: 38, speed: 140, dmg: 0.8, cd: 2.0, moves: ['jab'], ai: 'ranged' },
    glitch: { name: 'GLITCH', color: '#f472b6', glow: '#be185d', hp: 44, speed: 150, dmg: 0.9, cd: 1.2, moves: ['cross', 'kick'], ai: 'blink' },
    brute: { name: 'GRIDLOCK', color: '#fb923c', glow: '#c2410c', hp: 95, speed: 92, dmg: 1.3, cd: 1.3, moves: ['kick', 'cross'], armor: true, scale: 1.22 },
    warden: { name: 'WARDEN', color: '#e2e8f0', glow: '#94a3b8', hp: 170, speed: 110, dmg: 1.1, cd: 1.4, moves: ['cross', 'kick'], armor: true, scale: 1.35, ai: 'rush', gate: true },
    boss: { name: 'OVERLOAD', color: '#f43f5e', glow: '#be123c', hp: 280, speed: 180, dmg: 1.2, cd: 0.8, moves: ['cross', 'kick'], armor: true, scale: 1.42, block: 0.25, ai: 'boss', gate: true },
};

export const TIPS = {
    drone: 'DRONES are fodder. Mix different moves in a combo for bonus points.',
    guard: 'BULWARK blocks from the front. Grab it (L), flank it, or use a volt move.',
    dash: 'FLICKER hits and runs. Duck its punches (↓) or roll through (↓ + direction).',
    warden: 'WARDEN charges across the arena. Jump or roll past it, then punish the stumble.',
    spark: 'SPARKER fires orbs at head height. Duck under them, or punch them back.',
    leap: 'SKIPJACK leaps in with flying kicks. Launch it with ↓+J and juggle it.',
    brute: 'GRIDLOCK shrugs off jabs. Kick it, sweep it (↓+K), throw things at it.',
    glitch: 'GLITCH teleports behind you. Turn and strike first.',
    boss: 'OVERLOAD charges arc bursts. When it glows, roll away.',
};

export const ROUNDS = ['QUALIFIERS', 'SEMIFINALS', 'FINALS'];
export const WAVES = [
    { round: 0, list: ['drone', 'drone', 'drone'] },
    { round: 0, list: ['drone', 'guard', 'dash', 'drone'] },
    { round: 0, list: ['warden'], gate: true },
    { round: 1, list: ['spark', 'dash', 'drone', 'spark'] },
    { round: 1, list: ['leap', 'guard', 'spark', 'leap'] },
    { round: 1, list: ['brute', 'spark', 'brute'], gate: true },
    { round: 2, list: ['glitch', 'dash', 'spark', 'glitch'] },
    { round: 2, list: ['leap', 'guard', 'glitch', 'brute', 'spark'] },
    { round: 2, list: ['boss', 'drone', 'spark', 'glitch'], gate: true },
];

export const DIFFICULTY = [
    { name: 'EASY', hp: 0.8, dmg: 0.65, max: 2, color: '#4ade80' },
    { name: 'NORMAL', hp: 1, dmg: 1, max: 2, color: '#67e8f9' },
    { name: 'HARD', hp: 1.25, dmg: 1.35, max: 3, color: '#f43f5e' },
];

export function spawnEnemy(S, key) {
    const a = ARCHETYPES[key];
    const d = DIFFICULTY[S.diff];
    const side = Math.random() < 0.5 ? 70 : W - 70;
    const hp = Math.round(a.hp * d.hp);
    S.enemies.push(fighter({ x: side, facing: side < W / 2 ? 1 : -1, hp, maxHp: hp, color: a.color, glow: a.glow, arch: a,
        name: a.name, dmgMul: a.dmg * d.dmg, scale: a.scale, armor: a.armor, block: a.block, boss: key === 'boss',
        gate: a.gate, cd: 0.8 + Math.random(), burstT: 4, retreatT: 0 }));
}

const clampX = (x) => Math.max(70, Math.min(W - 70, x));
const canHurt = (P) => P.invuln <= 0 && !['ko', 'roll'].includes(P.state);

function arcBurst(S, e) {
    const P = S.player;
    S.shake = 16;
    for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        S.bolts.push({ pts: bolt(e.x, e.y - 80, e.x + Math.cos(ang) * 230, e.y - 80 + Math.sin(ang) * 120, 30), life: 0.4 });
    }
    sparks(S, e.x, e.y - 80, '#fda4af', 30);
    if (Math.abs(P.x - e.x) < 230 && canHurt(P)) {
        damage(S, P, 18 * e.dmgMul, Math.sign(P.x - e.x) || 1, 460, 0.5, true);
        popText(S, P.x, P.y - 130, 'ZAPPED', '#fda4af');
    }
}

function special(S, e, state, actDur, text) {
    Object.assign(e, { state, actT: 0, actDur, vx: 0 });
    if (text) popText(S, e.x, e.y - 150 * (e.scale || 1), text, '#fda4af');
    return true;
}

// Archetype-specific openers; return true if one started.
function tryOpener(S, e, dist, dt) {
    const a = e.arch;
    const ad = Math.abs(dist);
    if (a.ai === 'boss') {
        e.burstT -= dt;
        if (e.burstT <= 0 && ad < 300) { e.burstT = 5 + Math.random() * 2.5; return special(S, e, 'charge', 1.0, '! ARC BURST !'); }
    }
    if (e.cd > 0) return false;
    if (a.ai === 'rush' && ad > 150 && Math.random() < dt * 2) return special(S, e, 'windup', 0.75, '! CHARGE !');
    if (a.ai === 'ranged' && ad > 150 && ad < 480) return special(S, e, 'cast', 0.7);
    if (a.ai === 'blink' && ad > 110 && Math.random() < dt * 2.5) return special(S, e, 'blink', 0.5);
    if (a.ai === 'leaper' && e.onGround && ad > 130 && ad < 290 && Math.random() < dt * 3) {
        Object.assign(e, { vy: -640, vx: e.facing * 330, onGround: false });
        startAttack(e, 'airkick');
        return true;
    }
    return false;
}

function think(S, e, dt) {
    const P = S.player;
    const a = e.arch;
    const dist = P.x - e.x;
    const reach = 56 * (e.scale || 1);
    e.facing = Math.sign(dist) || e.facing;
    if (e.retreatT > 0) {
        e.retreatT -= dt;
        e.vx = -e.facing * a.speed * 0.7;
        e.state = 'walk';
        return;
    }
    if (tryOpener(S, e, dist, dt)) return;
    let want = Math.abs(dist) > reach ? 1 : 0;
    if (a.ai === 'ranged') want = Math.abs(dist) < 200 && Math.abs(dist) > reach ? -1 : Math.abs(dist) > 380 ? 1 : 0;
    e.vx = want * e.facing * a.speed;
    e.state = want ? 'walk' : 'idle';
    if (Math.abs(dist) < reach + 14 && e.cd <= 0 && P.state !== 'ko') {
        startAttack(e, a.moves[Math.floor(Math.random() * a.moves.length)]);
    }
}

// Timed specials: boss charge, warden windup/rush, sparker cast, glitch blink.
function updateSpecial(S, e, dt) {
    const P = S.player;
    e.actT += dt;
    const done = e.actT >= e.actDur;
    if (e.state === 'charge' && done) { arcBurst(S, e); e.state = 'idle'; e.cd = 0.6; }
    if (e.state === 'cast' && done) { spawnOrb(S, e); e.state = 'idle'; e.cd = e.arch.cd * (0.8 + Math.random() * 0.5); }
    if (e.state === 'windup' && done) {
        Object.assign(e, { state: 'rush', actT: 0, actDur: 1.1, vx: e.facing * 580 });
        e.hitIds.clear();
    }
    if (e.state === 'rush') {
        const s = e.scale || 1;
        if (!e.hitIds.has(P.id) && Math.abs(P.x - e.x) < 40 * s && P.y > GROUND - 70 && canHurt(P)) {
            e.hitIds.add(P.id);
            damage(S, P, 18 * e.dmgMul, e.facing, 540, 0.5, true);
            S.shake = 14;
        }
        if (e.actT >= e.actDur || e.x <= 70 || e.x >= W - 70) {
            const missed = !e.hitIds.has(P.id);
            Object.assign(e, { state: missed ? 'hit' : 'idle', stun: 1.2, vx: 0, cd: 1.2 });
            if (missed) { popText(S, e.x, e.y - 170, 'STUMBLED', '#fde047'); S.shake = 10; }
        }
    }
    if (e.state === 'blink') {
        if (e.actT >= 0.25 && !e.blinked) {
            sparks(S, e.x, e.y - 60, e.color, 14);
            e.x = clampX(P.x - P.facing * 55);
            e.facing = Math.sign(P.x - e.x) || 1;
            e.blinked = true;
            sparks(S, e.x, e.y - 60, e.color, 14);
        }
        if (done) { e.blinked = false; startAttack(e, 'cross'); }
    }
}

const SPECIALS = new Set(['charge', 'cast', 'windup', 'rush', 'blink']);

export function updateEnemy(S, e, dt) {
    if (e.state === 'ko') {
        e.koT += dt;
        e.vx *= Math.pow(0.02, dt);
        physics(e, dt);
        return;
    }
    if (e.state === 'held') return;
    if (e.state === 'thrown') { updateThrown(S, e, S.enemies, dt); return; }
    e.cd -= dt;
    if (e.state === 'hit') {
        if (e.onGround) { e.stun -= dt; e.vx *= Math.pow(0.01, dt); }
        if (e.stun <= 0) e.state = 'idle';
    } else if (e.state === 'block') {
        e.blockT -= dt;
        e.vx *= Math.pow(0.01, dt);
        if (e.blockT <= 0) { e.state = 'idle'; e.cd = Math.min(e.cd, 0.15); }
    } else if (SPECIALS.has(e.state)) {
        updateSpecial(S, e, dt);
    } else if (isAttack(e)) {
        e.actT += dt;
        if (e.onGround) e.vx *= Math.pow(0.002, dt);
        checkHits(S, e, [S.player]);
        if (e.actT >= e.actDur && e.onGround) {
            e.state = 'idle';
            e.cd = e.arch.cd * (0.7 + Math.random() * 0.6);
            if (e.arch.ai === 'hitrun') e.retreatT = 0.6 + Math.random() * 0.4;
        }
    } else {
        think(S, e, dt);
    }
    for (const o of S.enemies) {
        if (o === e || ['ko', 'held', 'thrown'].includes(o.state) || e.state === 'rush') continue;
        const dx = e.x - o.x;
        if (Math.abs(dx) < 40) e.x += (dx >= 0 ? 1 : -1) * 60 * dt;
    }
    physics(e, dt);
}
