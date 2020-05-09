import { Beat } from '@src/model/Beat';
import { HarmonicType } from '@src/model/HarmonicType';
import { Note } from '@src/model/Note';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@src/rendering/effects/NoteEffectInfoBase';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { LineRangedGlyph } from '@src/rendering/glyphs/LineRangedGlyph';
import { NotationElement } from '@src/NotationSettings';

export class HarmonicsEffectInfo extends NoteEffectInfoBase {
    private _harmonicType: HarmonicType;
    private _beat: Beat | null = null;
    private _effectId: string;

    public get effectId(): string {
        return this._effectId;
    }

    public get notationElement(): NotationElement {
        return NotationElement.EffectHarmonics;
    }

    public constructor(harmonicType: HarmonicType) {
        super();
        this._harmonicType = HarmonicType.None;
        this._harmonicType = harmonicType;
        switch (harmonicType) {
            case HarmonicType.None:
                this._effectId = 'harmonics-none';
                break;
            case HarmonicType.Natural:
                this._effectId = 'harmonics-natural';
                break;
            case HarmonicType.Artificial:
                this._effectId = 'harmonics-artificial';
                break;
            case HarmonicType.Pinch:
                this._effectId = 'harmonics-pinch';
                break;
            case HarmonicType.Tap:
                this._effectId = 'harmonics-tap';
                break;
            case HarmonicType.Semi:
                this._effectId = 'harmonics-semi';
                break;
            case HarmonicType.Feedback:
                this._effectId = 'harmonics-feedback';
                break;
        }
    }

    protected shouldCreateGlyphForNote(note: Note): boolean {
        if (!note.isHarmonic || note.harmonicType !== this._harmonicType) {
            return false;
        }
        if (note.beat !== this._beat) {
            this._beat = note.beat;
        }
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeat;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new LineRangedGlyph(HarmonicsEffectInfo.harmonicToString(this._harmonicType));
    }

    public static harmonicToString(type: HarmonicType): string {
        switch (type) {
            case HarmonicType.Natural:
                return 'N.H.';
            case HarmonicType.Artificial:
                return 'A.H.';
            case HarmonicType.Pinch:
                return 'P.H.';
            case HarmonicType.Tap:
                return 'T.H.';
            case HarmonicType.Semi:
                return 'S.H.';
            case HarmonicType.Feedback:
                return 'Fdbk.';
        }
        return '';
    }
}
