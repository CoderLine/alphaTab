import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';

/**
 * @internal
 */
class ScrambledSegment {
    public readonly isCubic: boolean;
    public readonly c1x: number;
    public readonly c1y: number;
    public readonly c2x: number;
    public readonly c2y: number;
    public readonly x: number;
    public readonly y: number;

    public constructor(isCubic: boolean, c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) {
        this.isCubic = isCubic;
        this.c1x = c1x;
        this.c1y = c1y;
        this.c2x = c2x;
        this.c2y = c2y;
        this.x = x;
        this.y = y;
    }
}

/**
 * Collects closed subpaths and fills them as one path. The emitted command sequence differs on every
 * {@link fill} (subpath order, start vertices, segment subdivisions) while the filled area stays the same.
 * @internal
 */
export class ScrambledPath {
    private _contours: ScrambledSegment[][] = [];
    private _current: ScrambledSegment[] | null = null;
    private _startX: number = 0;
    private _startY: number = 0;

    public moveTo(x: number, y: number): void {
        this.closePath();
        this._current = [];
        this._startX = x;
        this._startY = y;
    }

    public lineTo(x: number, y: number): void {
        this._current!.push(new ScrambledSegment(false, 0, 0, 0, 0, x, y));
    }

    public bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void {
        this._current!.push(new ScrambledSegment(true, c1x, c1y, c2x, c2y, x, y));
    }

    public closePath(): void {
        const current = this._current;
        if (current === null) {
            return;
        }
        if (current.length > 0) {
            const last = current[current.length - 1];
            if (last.x !== this._startX || last.y !== this._startY) {
                current.push(new ScrambledSegment(false, 0, 0, 0, 0, this._startX, this._startY));
            }
            this._contours.push(current);
        }
        this._current = null;
    }

    public rect(x: number, y: number, w: number, h: number): void {
        if (w <= 0 || h <= 0) {
            return;
        }
        this.moveTo(x, y);
        this.lineTo(x + w, y);
        this.lineTo(x + w, y + h);
        this.lineTo(x, y + h);
        this.closePath();
    }

    public fill(canvas: ICanvas): void {
        this.closePath();
        const contours = this._contours;
        for (let i = contours.length - 1; i > 0; i--) {
            const j = ScrambledPath._randomInt(i + 1);
            const t = contours[i];
            contours[i] = contours[j];
            contours[j] = t;
        }

        canvas.beginPath();
        for (const contour of contours) {
            const count = contour.length;
            const first = ScrambledPath._randomInt(count);
            const start = contour[(first + count - 1) % count];
            let px = start.x;
            let py = start.y;
            canvas.moveTo(px, py);
            for (let k = 0; k < count; k++) {
                const s = contour[(first + k) % count];
                if (Math.random() < 0.35) {
                    ScrambledPath._emitSplit(canvas, px, py, s, 0.25 + Math.random() * 0.5);
                } else {
                    ScrambledPath._emit(canvas, s);
                }
                px = s.x;
                py = s.y;
            }
            canvas.closePath();
        }
        canvas.fill();
        this._contours = [];
    }

    private static _randomInt(exclusiveMax: number): number {
        return Math.min(exclusiveMax - 1, Math.floor(Math.random() * exclusiveMax));
    }

    private static _emit(canvas: ICanvas, s: ScrambledSegment): void {
        if (s.isCubic) {
            canvas.bezierCurveTo(s.c1x, s.c1y, s.c2x, s.c2y, s.x, s.y);
        } else {
            canvas.lineTo(s.x, s.y);
        }
    }

    private static _emitSplit(canvas: ICanvas, px: number, py: number, s: ScrambledSegment, t: number): void {
        if (!s.isCubic) {
            canvas.lineTo(px + (s.x - px) * t, py + (s.y - py) * t);
            canvas.lineTo(s.x, s.y);
            return;
        }
        // de Casteljau subdivision at t
        const ax = px + (s.c1x - px) * t;
        const ay = py + (s.c1y - py) * t;
        const bx = s.c1x + (s.c2x - s.c1x) * t;
        const by = s.c1y + (s.c2y - s.c1y) * t;
        const cx = s.c2x + (s.x - s.c2x) * t;
        const cy = s.c2y + (s.y - s.c2y) * t;
        const abx = ax + (bx - ax) * t;
        const aby = ay + (by - ay) * t;
        const bcx = bx + (cx - bx) * t;
        const bcy = by + (cy - by) * t;
        const mx = abx + (bcx - abx) * t;
        const my = aby + (bcy - aby) * t;
        canvas.bezierCurveTo(ax, ay, abx, aby, mx, my);
        canvas.bezierCurveTo(bcx, bcy, cx, cy, s.x, s.y);
    }
}
