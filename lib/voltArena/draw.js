// Volt Arena: stick-figure posing, joint math, and scene rendering.
// Angles for limbs are measured from straight down; positive = toward facing.

export const W = 960;
export const H = 540;
export const GROUND = 462;

const LEN = { torso: 34, upper: 18, lower: 18, thigh: 22, shin: 22, head: 17 };

const lerp = (a, b, t) => a + (b - a) * t;

// Attack extension curve: short wind-up, hold, retract.
function ext(p) {
    if (p < 0.3) return -0.35 * (p / 0.3);
    if (p < 0.62) return 1;
    return 1 - (p - 0.62) / 0.38;
}

export function getPose(f) {
    const t = f.anim;
    const p = f.actDur ? Math.min(1, f.actT / f.actDur) : 0;
    const e = Math.max(-0.35, ext(p));
    const bob = Math.sin(t * 4) * 0.08;
    const stance = { fl: [0.42, 0.18], bl: [-0.38, -0.2] };
    switch (f.state) {
        case 'walk': {
            const s = Math.sin(t * 11);
            return { lean: 0.15, crouch: 0, fa: [0.5 - 0.3 * s, 2.2], ba: [0.3 + 0.3 * s, 1.9], fl: [0.55 * s, 0.55 * s - 0.25], bl: [-0.55 * s, -0.55 * s - 0.25] };
        }
        case 'jump':
            return { lean: 0.1, crouch: 0, fa: [1.2, 2.6], ba: [-0.5, 0.7], fl: [1.0, -0.2], bl: [0.3, -0.9] };
        case 'jab':
            return { lean: 0.12 + 0.15 * e, crouch: 2, fa: [lerp(0.6, 1.57, e), lerp(2.4, 1.57, e)], ba: [0.25, 2.5], ...stance };
        case 'cross':
        case 'vpunch':
            return { lean: 0.15 + 0.25 * e, crouch: 3, fa: [0.5, 2.5], ba: [lerp(0.2, 1.6, e), lerp(2.4, 1.6, e)], ...stance };
        case 'grab':
        case 'vgrab':
            return { lean: 0.2 + 0.15 * e, crouch: 3, fa: [lerp(0.6, 1.45, e), lerp(2.4, 1.5, e)], ba: [lerp(0.3, 1.35, e), lerp(2.2, 1.45, e)], ...stance };
        case 'hold':
            return { lean: -0.08, crouch: 4, fa: [2.0, 2.4], ba: [1.8, 2.5], ...stance };
        case 'throw':
            return { lean: 0.35, crouch: 2, fa: [1.7, 1.6], ba: [1.1, 1.3], fl: [0.6, 0.3], bl: [-0.5, -0.2] };
        case 'block':
            return { lean: 0.05, crouch: 4, fa: [1.3, 3.0], ba: [1.1, 2.9], ...stance };
        case 'crouch':
            return { lean: 0.35, crouch: 22, fa: [0.9, 2.6], ba: [0.6, 2.5], fl: [1.25, -0.45], bl: [-1.25, 0.45] };
        case 'uppercut':
            return { lean: 0.3 - 0.4 * Math.max(0, e), crouch: lerp(20, 0, Math.max(0, e)), fa: [lerp(0.5, 2.9, Math.max(0, e)), lerp(2.6, 3.1, Math.max(0, e))], ba: [0.2, 2.4], fl: [0.6, 0.2], bl: [-0.5, -0.1] };
        case 'slide':
            return { lean: -0.6, crouch: 20, fa: [-0.9, -0.3], ba: [-1.3, -0.6], fl: [1.35, 1.45], bl: [0.4, -1.2] };
        case 'cast':
            return { lean: 0.1 - 0.2 * Math.sin(p * Math.PI), crouch: 4, fa: [lerp(-0.6, 1.7, p), lerp(0.4, 1.7, p)], ba: [-0.4, 0.6], ...stance };
        case 'windup':
            return { lean: 0.55, crouch: 14, fa: [-0.6, 0.0], ba: [-0.9, -0.2], fl: [0.7, -0.2], bl: [-0.8, -0.3] };
        case 'rush': {
            const s = Math.sin(t * 22);
            return { lean: 0.7, crouch: 6, fa: [-0.7, -0.2], ba: [-0.9, -0.4], fl: [0.7 * s, 0.7 * s - 0.3], bl: [-0.7 * s, -0.7 * s - 0.3] };
        }
        case 'blink':
            return { lean: 0, crouch: 0, fa: [0.2, 0.2], ba: [-0.2, -0.2], fl: [0.15, 0.1], bl: [-0.15, -0.1] };
        case 'roll':
            return { lean: 0, crouch: 16, fa: [1.3, 2.9], ba: [1.0, 2.7], fl: [1.7, -0.3], bl: [1.4, -0.5] };
        case 'kick':
        case 'vkick':
            return { lean: 0.1 - 0.4 * e, crouch: 0, fa: [0.9, 2.1], ba: [-0.7, 0.3], fl: [lerp(0.3, 1.55, e), lerp(0.1, 1.65, e)], bl: [-0.15, -0.1] };
        case 'airkick':
            return { lean: -0.2, crouch: 0, fa: [1.0, 2.4], ba: [-0.9, 0.2], fl: [lerp(0.8, 1.9, e), lerp(-0.2, 2.0, e)], bl: [0.4, -1.0] };
        case 'charge':
            return { lean: -0.12, crouch: 6, fa: [2.6, 2.95], ba: [2.4, 3.0], fl: [0.5, 0.3], bl: [-0.5, -0.3] };
        case 'held':
        case 'thrown':
        case 'hit':
            return { lean: -0.45, crouch: 2, fa: [-0.5, 0.6], ba: [-0.9, 0.1], fl: [0.35, 0.2], bl: [-0.45, -0.1] };
        default:
            return { lean: 0.12, crouch: 0, fa: [0.6, 2.4 + bob], ba: [0.3, 2.2 - bob], ...stance };
    }
}

function limb(x, y, angles, l1, l2, dir) {
    const kx = x + Math.sin(angles[0]) * l1 * dir;
    const ky = y + Math.cos(angles[0]) * l1;
    return [[kx, ky], [kx + Math.sin(angles[1]) * l2 * dir, ky + Math.cos(angles[1]) * l2]];
}

// World-space joint positions, also used for hit detection.
export function joints(f) {
    const s = f.scale || 1;
    const pose = getPose(f);
    const d = f.facing;
    const hip = [f.x, f.y - (LEN.thigh + LEN.shin) * s + pose.crouch * s];
    const sh = [hip[0] + Math.sin(pose.lean) * LEN.torso * s * d, hip[1] - Math.cos(pose.lean) * LEN.torso * s];
    const headR = LEN.head * s * (f.isPlayer ? 1.25 : 1);
    const head = [sh[0] + Math.sin(pose.lean) * (headR + 3) * d, sh[1] - Math.cos(pose.lean) * (headR + 3)];
    const [fe, fh] = limb(sh[0], sh[1], pose.fa, LEN.upper * s, LEN.lower * s, d);
    const [be, bh] = limb(sh[0], sh[1], pose.ba, LEN.upper * s, LEN.lower * s, d);
    const [fk, ff] = limb(hip[0], hip[1], pose.fl, LEN.thigh * s, LEN.shin * s, d);
    const [bk, bf] = limb(hip[0], hip[1], pose.bl, LEN.thigh * s, LEN.shin * s, d);
    return { hip, sh, head, headR, fe, fh, be, bh, fk, ff, bk, bf };
}

function poly(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
}

export function drawFighter(ctx, f, faceImg) {
    const j = joints(f);
    const s = f.scale || 1;
    ctx.save();
    if (f.state === 'ko') {
        const k = Math.min(1, f.koT / 0.35);
        ctx.globalAlpha = f.koT > 1.2 ? Math.max(0, 1 - (f.koT - 1.2) / 0.6) : 1;
        ctx.translate(f.x, f.y);
        ctx.rotate(-(Math.PI / 2) * f.facing * k);
        ctx.translate(-f.x, -f.y);
    } else if (f.spin) {
        const cy = f.y - 40 * s;
        ctx.translate(f.x, cy);
        ctx.rotate(f.spin);
        ctx.translate(-f.x, -cy);
    }
    if (f.state === 'charge') {
        ctx.beginPath();
        ctx.arc(j.hip[0], j.hip[1] - 20 * s, 60 * s * (0.8 + 0.2 * Math.sin(f.anim * 40)), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244,63,94,0.18)';
        ctx.fill();
    }
    if (f.state === 'blink') ctx.globalAlpha = Math.min(1, Math.abs(f.actT - 0.25) / 0.25);
    const flash = f.flash > 0;
    ctx.strokeStyle = flash ? '#ffffff' : f.color;
    ctx.lineWidth = 6 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = f.glow;
    ctx.shadowBlur = 14;
    ctx.globalAlpha *= f.invuln > 0 && Math.floor(f.invuln * 20) % 2 ? 0.45 : 1;
    poly(ctx, [j.sh, j.be, j.bh]);
    poly(ctx, [j.hip, j.bk, j.bf]);
    poly(ctx, [j.hip, j.sh]);
    poly(ctx, [j.hip, j.fk, j.ff]);
    poly(ctx, [j.sh, j.fe, j.fh]);
    drawHead(ctx, f, j, faceImg, flash);
    ctx.restore();
}

function drawHead(ctx, f, j, faceImg, flash) {
    const [cx, cy] = j.head;
    const r = j.headR;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (f.isPlayer && faceImg && faceImg.complete && faceImg.naturalWidth) {
        ctx.save();
        ctx.clip();
        ctx.shadowBlur = 0;
        ctx.drawImage(faceImg, cx - r, cy - r, r * 2, r * 2);
        if (flash) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill(); }
        ctx.restore();
        ctx.lineWidth = 3;
        ctx.strokeStyle = flash ? '#fff' : '#22d3ee';
        ctx.stroke();
        return;
    }
    ctx.fillStyle = '#0b1020';
    ctx.fill();
    ctx.lineWidth = 4 * (f.scale || 1);
    ctx.stroke();
    // Visor slit eyes
    ctx.fillStyle = flash ? '#fff' : f.color;
    const ex = cx + f.facing * r * 0.25;
    ctx.fillRect(ex - r * 0.55, cy - r * 0.18, r * 1.1, r * 0.3);
}

export function bolt(x1, y1, x2, y2, jag = 18) {
    const pts = [[x1, y1]];
    const n = 9;
    for (let i = 1; i < n; i++) {
        const t = i / n;
        pts.push([lerp(x1, x2, t) + (Math.random() - 0.5) * jag, lerp(y1, y2, t) + (Math.random() - 0.5) * jag]);
    }
    pts.push([x2, y2]);
    return pts;
}

export function drawBolt(ctx, pts, alpha, color = '#a5f3fc') {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 3;
    poly(ctx, pts);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    poly(ctx, pts);
    ctx.restore();
}

export function drawArena(ctx, time, slow) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#05060f');
    g.addColorStop(0.75, '#0d1430');
    g.addColorStop(1, '#05060f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Skyline silhouettes
    ctx.fillStyle = '#0a1024';
    for (let i = 0; i < 16; i++) {
        const bw = 50 + ((i * 37) % 40);
        const bh = 80 + ((i * 53) % 140);
        ctx.fillRect(i * 62 - 10, GROUND - 60 - bh, bw, bh + 60);
    }
    // Perspective floor grid
    ctx.save();
    ctx.strokeStyle = 'rgba(34,211,238,0.22)';
    ctx.lineWidth = 1;
    for (let i = -12; i <= 12; i++) {
        ctx.beginPath();
        ctx.moveTo(W / 2 + i * 40, GROUND);
        ctx.lineTo(W / 2 + i * 140, H);
        ctx.stroke();
    }
    for (let k = 0; k < 6; k++) {
        const y = GROUND + Math.pow(k / 6, 1.6) * (H - GROUND) + ((time * 30) % 6);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }
    ctx.strokeStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND);
    ctx.lineTo(W, GROUND);
    ctx.stroke();
    ctx.restore();
    // Tesla pylons
    for (const px of [28, W - 28]) {
        ctx.fillStyle = '#111a33';
        ctx.fillRect(px - 8, GROUND - 190, 16, 190);
        ctx.fillStyle = '#22d3ee';
        for (let c = 0; c < 6; c++) ctx.fillRect(px - 12, GROUND - 180 + c * 26, 24, 4);
        ctx.beginPath();
        ctx.arc(px, GROUND - 200, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#67e8f9';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 25;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (Math.random() < 0.08) drawBolt(ctx, bolt(px, GROUND - 200, px + (px < W / 2 ? 50 : -50), GROUND - 230 + Math.random() * 60, 14), 0.8);
    }
    if (slow) {
        ctx.fillStyle = 'rgba(56,189,248,0.10)';
        ctx.fillRect(0, 0, W, H);
        const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
        v.addColorStop(0, 'rgba(0,0,0,0)');
        v.addColorStop(1, 'rgba(8,47,73,0.6)');
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, W, H);
    }
}
