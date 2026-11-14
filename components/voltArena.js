import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createGame, W, H } from '@/lib/voltArena/engine';

const TOUCH = [
    { key: 'arrowleft', label: '◀' },
    { key: 'arrowright', label: '▶' },
    { key: 'arrowup', label: '▲' },
    { key: 'arrowdown', label: '▼' },
    { key: 'enter', label: 'START' },
    { key: 'j', label: 'PUNCH' },
    { key: 'k', label: 'KICK' },
    { key: 'l', label: 'GRAB' },
    { key: 'v', label: '⚡ VOLT' },
    { key: ' ', label: '◷ SLOW' },
];

const btn = {
    flex: '1 1 18%',
    minWidth: 0,
    padding: '14px 0',
    border: '1px solid #22d3ee',
    borderRadius: 10,
    background: '#0b1020',
    color: '#e0f2fe',
    fontWeight: 700,
    fontSize: 16,
    touchAction: 'none',
    userSelect: 'none',
};

export default function VoltArena() {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const [touch, setTouch] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = '/images/game/hero-face.png';
        gameRef.current = createGame(canvasRef.current, img);
        if (process.env.NODE_ENV !== 'production') window.__voltArena = gameRef.current;
        setTouch(window.matchMedia('(pointer: coarse)').matches);
        return () => gameRef.current && gameRef.current.destroy();
    }, []);

    const press = (key, down) => (ev) => {
        ev.preventDefault();
        if (gameRef.current) gameRef.current.setKey(key, down);
    };

    return (
        <div className="container py-4" style={{ maxWidth: W + 32 }}>
            <h1 className="main-text-regular text-center mb-1">Volt Arena</h1>
            <p className="text-center text-muted mb-3">
                A stick-figure brawler. Chain hits to build volt, then spend it on electric moves, throws, and slow time.
            </p>
            <canvas
                ref={canvasRef}
                width={W}
                height={H}
                onPointerDown={press('enter', true)}
                onPointerUp={press('enter', false)}
                onPointerLeave={press('enter', false)}
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12, background: '#05060f', boxShadow: '0 0 30px rgba(34,211,238,0.25)' }}
                aria-label="Volt Arena game canvas"
            />
            {touch && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                    {TOUCH.map((b) => (
                        <button
                            key={b.label}
                            type="button"
                            style={{ ...btn, fontSize: b.label.length > 2 ? 12 : 16 }}
                            onPointerDown={press(b.key, true)}
                            onPointerUp={press(b.key, false)}
                            onPointerLeave={press(b.key, false)}
                            onPointerCancel={press(b.key, false)}
                        >
                            {b.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
