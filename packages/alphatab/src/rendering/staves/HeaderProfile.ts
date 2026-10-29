import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import type { LeftToRightLayoutingGlyphGroup } from '@coderline/alphatab/rendering/glyphs/LeftToRightLayoutingGlyphGroup';

/**
 * Receives the bar header columns (clef, key signature, time signature ...) of the header glyphs
 * and provides their aligned positions.
 * @internal
 */
export interface IHeaderRodSink {
    addHeaderRod(rank: number, pre: number, post: number, trailingSpace: number): void;
    getHeaderRodX(rank: number, ownPre: number): number;
}

/**
 * The layout-relevant geometry of one header glyph.
 * @internal
 */
export class HeaderProfileGlyph {
    /**
     * The header column the glyph is aligned to, or -1 if it keeps its {@link localX}.
     */
    public rank: number = -1;
    public ownPre: number = 0;
    public localX: number = 0;
    /**
     * The horizontal extent of the bounding box, relative to the glyph x.
     */
    public left: number = 0;
    public right: number = 0;
    public top: number = 0;
    public bottom: number = 0;
    /**
     * The boxes the glyph occupies in the skyline, as `left, right, top, bottom` per box relative to the
     * glyph x: one per leaf child of a glyph group (e.g. the accidentals of a key signature), so the group
     * does not claim its full height over its full width. `null` if the bounding box is used.
     */
    public skylineBoxes: number[] | null = null;
}

/**
 * Everything the layout needs from the header glyphs of a bar, without the glyphs: their header
 * rods and their bounding boxes. Bars with the same header share one profile; the glyphs
 * themselves are only created to be painted.
 * @internal
 */
export class HeaderProfile implements IHeaderRodSink {
    private readonly _rodRanks: number[] = [];
    private readonly _rodPres: number[] = [];
    private readonly _rodPosts: number[] = [];
    private readonly _rodTrailingSpaces: number[] = [];
    public readonly glyphs: HeaderProfileGlyph[] = [];
    /**
     * The width of the header glyphs laid out next to each other, before column alignment.
     */
    public naturalWidth: number = 0;

    private _current: HeaderProfileGlyph | null = null;

    public static measure(group: LeftToRightLayoutingGlyphGroup): HeaderProfile {
        const profile = new HeaderProfile();
        profile.naturalWidth = group.width;
        const glyphs = group.glyphs;
        if (glyphs) {
            for (const g of glyphs) {
                const entry = new HeaderProfileGlyph();
                entry.localX = g.x;
                // measured at x = 0 so that x + left reproduces the box of the glyph at any x
                g.x = 0;
                entry.left = g.getBoundingBoxLeft();
                entry.right = g.getBoundingBoxRight();
                entry.top = g.getBoundingBoxTop();
                entry.bottom = g.getBoundingBoxBottom();
                if (g instanceof GlyphGroup && g.glyphs && g.glyphs.length > 0) {
                    const boxes: number[] = [];
                    HeaderProfile._collectSkylineBoxes(g, 0, boxes);
                    entry.skylineBoxes = boxes;
                }
                g.x = entry.localX;
                profile._current = entry;
                g.registerHeaderRod(profile);
                g.applyHeaderRod(profile);
                profile.glyphs.push(entry);
            }
        }
        profile._current = null;
        return profile;
    }

    private static _collectSkylineBoxes(g: Glyph, offsetX: number, boxes: number[]): void {
        if (g instanceof GlyphGroup && g.glyphs && g.glyphs.length > 0) {
            for (const c of g.glyphs) {
                HeaderProfile._collectSkylineBoxes(c, offsetX + g.x, boxes);
            }
            return;
        }
        const left = offsetX + g.getBoundingBoxLeft();
        const right = offsetX + g.getBoundingBoxRight();
        if (right > left) {
            boxes.push(left);
            boxes.push(right);
            boxes.push(g.getBoundingBoxTop());
            boxes.push(g.getBoundingBoxBottom());
        }
    }

    public addHeaderRod(rank: number, pre: number, post: number, trailingSpace: number): void {
        this._rodRanks.push(rank);
        this._rodPres.push(pre);
        this._rodPosts.push(post);
        this._rodTrailingSpaces.push(trailingSpace);
    }

    public getHeaderRodX(rank: number, ownPre: number): number {
        const current = this._current;
        if (current) {
            current.rank = rank;
            current.ownPre = ownPre;
        }
        return 0;
    }

    public registerHeaderRods(sink: IHeaderRodSink): void {
        const ranks = this._rodRanks;
        for (let i = 0; i < ranks.length; i++) {
            sink.addHeaderRod(ranks[i], this._rodPres[i], this._rodPosts[i], this._rodTrailingSpaces[i]);
        }
    }

    /**
     * The x of the given glyph once the header columns of all staves are aligned.
     */
    public glyphX(glyph: HeaderProfileGlyph, sink: IHeaderRodSink): number {
        return glyph.rank >= 0 ? sink.getHeaderRodX(glyph.rank, glyph.ownPre) : glyph.localX;
    }
}

/**
 * The identity of a bar header, built without allocations from small integer inputs packed into
 * two numbers. Inputs outside their bit range make the key invalid; such headers are not shared.
 * @internal
 */
export class HeaderKey {
    private static readonly _maxBits: number = 52;

    public high: number = 0;
    public low: number = 0;
    public isValid: boolean = true;
    private _highBits: number = 0;
    private _lowBits: number = 0;

    public reset(): void {
        this.high = 0;
        this.low = 0;
        this.isValid = true;
        this._highBits = 0;
        this._lowBits = 0;
    }

    public invalidate(): void {
        this.isValid = false;
    }

    public addHigh(value: number, bits: number): void {
        this.high = this._append(this.high, this._highBits, value, bits);
        this._highBits += bits;
    }

    public addLow(value: number, bits: number): void {
        this.low = this._append(this.low, this._lowBits, value, bits);
        this._lowBits += bits;
    }

    public addHighFlag(value: boolean): void {
        this.addHigh(value ? 1 : 0, 1);
    }

    public addLowFlag(value: boolean): void {
        this.addLow(value ? 1 : 0, 1);
    }

    private _append(current: number, usedBits: number, value: number, bits: number): number {
        const range = Math.pow(2, bits);
        if (usedBits + bits > HeaderKey._maxBits || value < 0 || value >= range || value !== Math.floor(value)) {
            this.isValid = false;
            return current;
        }
        return current * range + value;
    }
}
