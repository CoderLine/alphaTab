/**
 * The drawn extent of a glyph as a list of boxes, for the skyline placement of glyphs whose
 * bounding box would claim far more area than they cover (slanted lines, curves).
 * Lines and curves are split into steps whose boxes cover the drawn stroke, so the shape never claims less
 * than what is drawn.
 * Coordinates follow the {@link ITieGlyph} convention: staff-local x, renderer-local y.
 * @internal
 */
export class SkylineShape {
    /** The minimal width of the steps lines and curves are split into. */
    private static readonly _minStepWidth: number = 2;
    /**
     * How much more a step may claim vertically than the stroke it covers, unless the step would get narrower
     * than {@link _minStepWidth}.
     */
    private static readonly _maxStepRise: number = 1;

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
     * Adds a straight line of the given thickness.
     */
    public addLine(x1: number, y1: number, x2: number, y2: number, thickness: number): void {
        if (x2 < x1) {
            this.addLine(x2, y2, x1, y1, thickness);
            return;
        }
        const half = thickness / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const steps = Math.max(
            1,
            Math.min(Math.ceil(dx / SkylineShape._minStepWidth), Math.ceil(Math.abs(dy) / SkylineShape._maxStepRise))
        );
        for (let i = 0; i < steps; i++) {
            const xa = x1 + (dx * i) / steps;
            const xb = x1 + (dx * (i + 1)) / steps;
            const ya = y1 + (dy * i) / steps;
            const yb = y1 + (dy * (i + 1)) / steps;
            this.addBox(xa - half, Math.min(ya, yb) - half, xb + half, Math.max(ya, yb) + half);
        }
    }

    /**
     * Adds the cubic bezier curve from (x1, y1) to (x2, y2) with the control points ((x1 + x2) / 2, y1) and
     * (x2, y1), of the given thickness: it leaves the start horizontally and reaches the end vertically.
     */
    public addBendCurve(x1: number, y1: number, x2: number, y2: number, thickness: number): void {
        // With the curve parameter t and s = t³ the curve is y = y1 + dy * s and
        // x = x1 + dx * (1.5 * s^(1/3) - 0.5 * s). Both change monotonically, so the ends of a step are its
        // extremes. The steps rise equally and are joined while narrower than the minimal step width.
        const half = thickness / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const steps = Math.max(1, Math.ceil(Math.abs(dy) / SkylineShape._maxStepRise));
        let startX = x1;
        let startY = y1;
        for (let i = 1; i <= steps; i++) {
            const s = i / steps;
            const x = i === steps ? x2 : x1 + dx * (1.5 * Math.pow(s, 1 / 3) - 0.5 * s);
            if (i < steps && Math.abs(x - startX) < SkylineShape._minStepWidth) {
                continue;
            }
            const y = i === steps ? y2 : y1 + dy * s;
            this.addBox(
                Math.min(startX, x) - half,
                Math.min(startY, y) - half,
                Math.max(startX, x) + half,
                Math.max(startY, y) + half
            );
            startX = x;
            startY = y;
        }
    }
}
