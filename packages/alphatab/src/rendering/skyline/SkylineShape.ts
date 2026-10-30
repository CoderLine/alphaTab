/**
 * The drawn extent of a glyph as a list of narrow boxes, for the skyline placement of glyphs whose
 * bounding box would claim far more area than they cover (slanted lines, curves).
 * Coordinates follow the {@link ITieGlyph} convention: staff-local x, renderer-local y.
 * @internal
 */
export class SkylineShape {
    /** The width of the x-steps lines and curves are split into. */
    private static readonly _stepWidth: number = 2;
    private static readonly _curveSteps: number = 16;

    private _xStarts: number[] = [];
    private _xEnds: number[] = [];
    private _tops: number[] = [];
    private _bottoms: number[] = [];

    public get count(): number {
        return this._xStarts.length;
    }

    public xStart(i: number): number {
        return this._xStarts[i];
    }

    public xEnd(i: number): number {
        return this._xEnds[i];
    }

    public top(i: number): number {
        return this._tops[i];
    }

    public bottom(i: number): number {
        return this._bottoms[i];
    }

    public clear(): void {
        // pop() keeps the backing stores for the next shape (splice allocates the removed part)
        while (this._xStarts.length > 0) {
            this._xStarts.pop();
            this._xEnds.pop();
            this._tops.pop();
            this._bottoms.pop();
        }
    }

    public addBox(left: number, top: number, right: number, bottom: number): void {
        if (Number.isNaN(left) || Number.isNaN(right) || Number.isNaN(top) || Number.isNaN(bottom)) {
            return;
        }
        if (right < left) {
            const t = left;
            left = right;
            right = t;
        }
        this._xStarts.push(left);
        this._xEnds.push(right);
        this._tops.push(Math.min(top, bottom));
        this._bottoms.push(Math.max(top, bottom));
    }

    /**
     * Adds a straight line of the given thickness, split into narrow x-steps.
     */
    public addLine(x1: number, y1: number, x2: number, y2: number, thickness: number): void {
        if (x2 < x1) {
            this.addLine(x2, y2, x1, y1, thickness);
            return;
        }
        const half = thickness / 2;
        const dx = x2 - x1;
        const steps = Math.max(1, Math.ceil(dx / SkylineShape._stepWidth));
        for (let i = 0; i < steps; i++) {
            const xa = x1 + (dx * i) / steps;
            const xb = x1 + (dx * (i + 1)) / steps;
            const ya = y1 + ((y2 - y1) * i) / steps;
            const yb = y1 + ((y2 - y1) * (i + 1)) / steps;
            this.addBox(xa - half, Math.min(ya, yb) - half, xb + half, Math.max(ya, yb) + half);
        }
    }

    /**
     * Adds a cubic bezier curve of the given thickness as a sequence of straight lines.
     */
    public addBezier(
        x1: number,
        y1: number,
        cp1X: number,
        cp1Y: number,
        cp2X: number,
        cp2Y: number,
        x2: number,
        y2: number,
        thickness: number
    ): void {
        let previousX = x1;
        let previousY = y1;
        for (let i = 1; i <= SkylineShape._curveSteps; i++) {
            const t = i / SkylineShape._curveSteps;
            const mt = 1 - t;
            const a = mt * mt * mt;
            const b = 3 * mt * mt * t;
            const c = 3 * mt * t * t;
            const d = t * t * t;
            const x = a * x1 + b * cp1X + c * cp2X + d * x2;
            const y = a * y1 + b * cp1Y + c * cp2Y + d * y2;
            this.addLine(previousX, previousY, x, y, thickness);
            previousX = x;
            previousY = y;
        }
    }
}
