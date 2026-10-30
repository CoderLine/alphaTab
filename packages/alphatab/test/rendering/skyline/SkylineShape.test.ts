import { SkylineShape } from '@coderline/alphatab/rendering/skyline/SkylineShape';
import { describe, expect, it } from 'vitest';

/**
 * @internal
 */
class SkylineShapeFixtures {
    public static covers(shape: SkylineShape, x: number, y: number): boolean {
        for (let i = 0; i < shape.count; i++) {
            if (shape.xStart(i) <= x && x <= shape.xEnd(i) && shape.top(i) <= y && y <= shape.bottom(i)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Expects the shape to cover the stroke of the given thickness around the point.
     */
    public static expectCovered(shape: SkylineShape, x: number, y: number, thickness: number): void {
        const half = thickness / 2;
        const label = `${x}/${y}`;
        expect(SkylineShapeFixtures.covers(shape, x, y - half), `${label} top`).toBe(true);
        expect(SkylineShapeFixtures.covers(shape, x, y + half), `${label} bottom`).toBe(true);
        expect(SkylineShapeFixtures.covers(shape, x - half, y), `${label} left`).toBe(true);
        expect(SkylineShapeFixtures.covers(shape, x + half, y), `${label} right`).toBe(true);
    }

    /**
     * Expects the shape to cover the curve TabBendGlyph draws (control points ((x1 + x2) / 2, y1) and (x2, y1)).
     */
    public static expectBendCurveCovered(
        shape: SkylineShape,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        thickness: number
    ): void {
        const cp1X = (x1 + x2) / 2;
        for (let i = 0; i <= 200; i++) {
            const t = i / 200;
            const mt = 1 - t;
            const x = mt * mt * mt * x1 + 3 * mt * mt * t * cp1X + 3 * mt * t * t * x2 + t * t * t * x2;
            const y = mt * mt * mt * y1 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y1 + t * t * t * y2;
            SkylineShapeFixtures.expectCovered(shape, x, y, thickness);
        }
    }

    public static expectLineCovered(
        shape: SkylineShape,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        thickness: number
    ): void {
        for (let i = 0; i <= 200; i++) {
            const t = i / 200;
            SkylineShapeFixtures.expectCovered(shape, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness);
        }
    }
}

describe('SkylineShapeTests', () => {
    it('covers-bend-up-curve', () => {
        const shape = new SkylineShape();
        shape.addBendCurve(10, 40, 50, 0, 1);
        SkylineShapeFixtures.expectBendCurveCovered(shape, 10, 40, 50, 0, 1);
        // one box per pixel of rise at most, joined where they would be narrower than 2px
        expect(shape.count).toBeLessThanOrEqual(40);
        expect(shape.count).toBeGreaterThan(1);
    });

    it('covers-bend-down-curve', () => {
        const shape = new SkylineShape();
        shape.addBendCurve(10, -20, 30, 25, 1.5);
        SkylineShapeFixtures.expectBendCurveCovered(shape, 10, -20, 30, 25, 1.5);
        expect(shape.count).toBeLessThanOrEqual(45);
    });

    it('covers-shallow-line', () => {
        const shape = new SkylineShape();
        shape.addLine(0, 0, 40, -5, 1);
        SkylineShapeFixtures.expectLineCovered(shape, 0, 0, 40, -5, 1);
        expect(shape.count).toBe(5);
    });

    it('covers-steep-line', () => {
        const shape = new SkylineShape();
        shape.addLine(4, 30, 0, 0, 1);
        SkylineShapeFixtures.expectLineCovered(shape, 4, 30, 0, 0, 1);
        expect(shape.count).toBe(2);
    });

    it('horizontal-line-is-one-box', () => {
        const shape = new SkylineShape();
        shape.addLine(0, 10, 100, 10, 2);
        SkylineShapeFixtures.expectLineCovered(shape, 0, 10, 100, 10, 2);
        expect(shape.count).toBe(1);
    });

    it('clear-removes-all-boxes', () => {
        const shape = new SkylineShape();
        shape.addLine(0, 0, 40, -5, 1);
        shape.addBox(0, 0, 10, 10);
        shape.clear();
        expect(shape.count).toBe(0);
    });
});
