// Volt Arena: energy orbs (enemy projectiles the player can duck or punch back) and pickups.
import { GROUND, joints } from './draw';
import { ATTACKS, isAttack, damage, sparks, popText, credit } from './combat';

export const ORB_Y = GROUND - 112; // above a crouching player's head, at a standing player's face
const ORB_R = 7;

const PICKUPS = {
    hp: { color: '#4ade80', label: '+', text: '+25 HP' },
    volt: { color: '#facc15', label: 'ϟ', text: '+40 VOLT' },
    power: { color: '#f43f5e', label: '▲', text: 'POWER UP' },
};

export function spawnOrb(S, e) {
    S.orbs.push({ x: e.x + e.facing * 30, y: ORB_Y, vx: e.facing * 330, dmg: 9 * e.dmgMul, friendly: false, life: 4, hitIds: new Set() });
}

function reflect(S, o, P) {
    if (!isAttack(P) || ATTACKS[P.state].grab) return false;
    const a = ATTACKS[P.state];
    const p = P.actT / P.actDur;
    if (p < a.win[0] || p > a.win[1] || !a.limb) return false;
    const [hx, hy] = joints(P)[a.limb];
    if (Math.abs(hx - o.x) > 30 || Math.abs(hy - o.y) > 48) return false;
    Object.assign(o, { vx: P.facing * Math.abs(o.vx) * 1.5, friendly: true, dmg: 16, life: 3 });
    sparks(S, o.x, o.y, '#a3e635', 14);
    popText(S, o.x, o.y - 24, 'REFLECT', '#a3e635');
    S.hitstop = 0.05;
    return true;
}

export function updateOrbs(S, pdt, edt) {
    const P = S.player;
    for (const o of S.orbs) {
        const dt = o.friendly ? pdt : edt;
        o.x += o.vx * dt;
        o.life -= dt;
        if (o.friendly) {
            for (const e of S.enemies) {
                if (['ko', 'held', 'thrown'].includes(e.state) || o.hitIds.has(e.id)) continue;
                const s = e.scale || 1;
                if (Math.abs(e.x - o.x) > 18 * s || o.y < e.y - 125 * s) continue;
                o.hitIds.add(e.id);
                damage(S, e, o.dmg, Math.sign(o.vx), 300, 0.5, true);
                sparks(S, o.x, o.y, '#a3e635', 18);
                credit(S, o.dmg, o.x, o.y, 'reflect');
                o.life = 0;
            }
            continue;
        }
        if (reflect(S, o, P) || P.state === 'ko' || P.invuln > 0) continue;
        const j = joints(P);
        if (Math.abs(P.x - o.x) < 18 && o.y + ORB_R > j.head[1] - j.headR) {
            damage(S, P, o.dmg, Math.sign(o.vx), 260, 0.3, true);
            sparks(S, o.x, o.y, '#a3e635', 12);
            o.life = 0;
        }
    }
    S.orbs = S.orbs.filter((o) => o.life > 0 && o.x > 0 && o.x < 960);
}

export function maybeDrop(S, e) {
    const roll = Math.random();
    let type = null;
    if (e.gate) type = 'hp';
    else if (roll < 0.14) type = 'hp';
    else if (roll < 0.28) type = 'volt';
    else if (roll < 0.36) type = 'power';
    if (type) S.items.push({ x: e.x, y: e.y - 80, vy: -200, type, life: 9 });
}

export function updateItems(S, dt) {
    const P = S.player;
    for (const it of S.items) {
        it.life -= dt;
        if (it.y < GROUND - 16) { it.vy += 1200 * dt; it.y = Math.min(GROUND - 16, it.y + it.vy * dt); }
        if (P.state === 'ko' || Math.abs(P.x - it.x) > 30 || P.y < GROUND - 60) continue;
        it.life = 0;
        if (it.type === 'hp') P.hp = Math.min(P.maxHp, P.hp + 25);
        if (it.type === 'volt') P.volt = Math.min(100, P.volt + 40);
        if (it.type === 'power') P.powerT = 7;
        sparks(S, it.x, it.y, PICKUPS[it.type].color, 16);
        popText(S, it.x, it.y - 30, PICKUPS[it.type].text, PICKUPS[it.type].color);
    }
    S.items = S.items.filter((it) => it.life > 0);
}

export function drawItemsAndOrbs(ctx, S, time) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 14px system-ui, sans-serif';
    for (const it of S.items) {
        const k = PICKUPS[it.type];
        const bob = Math.sin(time * 5 + it.x) * 3;
        ctx.globalAlpha = it.life < 2 ? 0.4 + 0.6 * Math.abs(Math.sin(time * 12)) : 1;
        ctx.shadowColor = k.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#0b1020';
        ctx.strokeStyle = k.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(it.x, it.y + bob, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = k.color;
        ctx.fillText(k.label, it.x, it.y + bob + 5);
    }
    ctx.globalAlpha = 1;
    for (const o of S.orbs) {
        const c = o.friendly ? '#67e8f9' : '#a3e635';
        ctx.shadowColor = c;
        ctx.shadowBlur = 20;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(o.x, o.y, ORB_R + Math.sin(time * 30) * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(o.x, o.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}
