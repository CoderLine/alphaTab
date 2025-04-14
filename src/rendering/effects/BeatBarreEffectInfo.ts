import type { Beat } from '@src/model/Beat';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { LineRangedGlyph } from '@src/rendering/glyphs/LineRangedGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';
import { BarreShape } from '@src/model/BarreShape';

export class BeatBarreEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectLetRing;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return beat.isBarre;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeat;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        let barre = '';
        switch (beat.barreShape) {
            case BarreShape.None:
            case BarreShape.Full:
                break;
            case BarreShape.Half:
                barre += '1/2';
                break;
        }

        barre += `B ${BeatBarreEffectInfo.toRoman(beat.barreFret)}`;

        return new LineRangedGlyph(barre, false);
    }

    private static readonly RomanLetters = new Map<string, number>([
        // ['M', 1000],
        // ['CM', 900],
        // ['D', 500],
        // ['CD', 400],
        // ['C', 100],
        // ['XC', 90],
        ['L', 50],
        ['XL', 40],
        ['X', 10],
        ['IX', 9],
        ['V', 5],
        ['IV', 4],
        ['I', 1]
    ]);

    public static toRoman(num: number): string {
        let str = '';

        if (num > 0) {
            for (const [romanLetter, romanNumber] of BeatBarreEffectInfo.RomanLetters) {
                const q = Math.floor(num / romanNumber);
                num -= q * romanNumber;
                str += romanLetter.repeat(q);
            }
        }

        return str;
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return from.barreFret === to.barreFret && from.barreShape === to.barreShape;
    }
}
