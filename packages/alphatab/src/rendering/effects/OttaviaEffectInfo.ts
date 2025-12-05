import type { Beat } from '@coderline/alphatab/model/Beat';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { OttavaGlyph } from '@coderline/alphatab/rendering/glyphs/OttavaGlyph';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
export class OttaviaEffectInfo extends EffectInfo {
    private _aboveStaff: boolean;

    public override get effectId(): string {
        return `ottavia-${this._aboveStaff ? 'above' : 'below'}`;
    }

    public get notationElement(): NotationElement {
        return NotationElement.EffectOttavia;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeat;
    }

    public constructor(aboveStaff: boolean) {
        super();
        this._aboveStaff = aboveStaff;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        switch (beat.ottava) {
            case Ottavia._15ma:
                return this._aboveStaff;
            case Ottavia._8va:
                return this._aboveStaff;
            case Ottavia._8vb:
                return !this._aboveStaff;
            case Ottavia._15mb:
                return !this._aboveStaff;
        }
        return false;
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new OttavaGlyph(beat.ottava, this._aboveStaff);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return from.ottava === to.ottava;
    }
}
