import { useState, useEffect } from 'react';

export function useCharWidth(fontSizePx: number, fontFamily = "'Roboto Mono', monospace") {
    const [charWidth, setCharWidth] = useState<number | null>(null);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.font = `${fontSizePx}px ${fontFamily}`;
        const metrics = ctx.measureText('M'); // o cualquier carácter monoespaciado representativo
        setCharWidth(metrics.width);
    }, [fontSizePx, fontFamily]);

    return charWidth;
}
