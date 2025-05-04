import { Duration } from '@src/model/Duration';
import type { ICanvas } from '@src/platform/ICanvas';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import type { Glyph } from '@src/rendering/glyphs/Glyph';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';
import { NoteSubElement } from '@src/model/Note';
import { type Beat, BeatSubElement } from '@src/model/Beat';

export class SlashNoteHeadGlyph extends EffectGlyph {
    private _isGrace: boolean;

    public beatEffects: Map<string, Glyph> = new Map();
    public beamingHelper!: BeamingHelper;
    public noteHeadElement: NoteSubElement = NoteSubElement.SlashNoteHead;
    public effectElement: BeatSubElement = BeatSubElement.SlashEffects;
    private _symbol: MusicFontSymbol;

    public constructor(x: number, y: number, duration: Duration, isGrace: boolean, beat: Beat) {
        super(x, y);
        this._isGrace = isGrace;
        this._symbol = SlashNoteHeadGlyph.getSymbol(duration);
        this.beat = beat;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ =
            this.beat!.notes.length === 0
                ? undefined
                : ElementStyleHelper.note(canvas, this.noteHeadElement, this.beat!.notes[0]);
        const offset: number = this._isGrace ? 1 : 0;
        const glyphScale = this._isGrace ? NoteHeadGlyph.GraceScale : 1;
        canvas.fillMusicFontSymbol(cx + this.x, cy + this.y + offset, glyphScale, this._symbol, false);

        this.paintEffects(cx, cy, canvas);
    }
    private paintEffects(cx: number, cy: number, canvas: ICanvas) {
        using _ = ElementStyleHelper.beat(canvas, this.effectElement, this.beat!);
        for (const g of this.beatEffects.values()) {
            g.paint(cx + this.x, cy + this.y, canvas);
        }
    }

    public override doLayout(): void {
        const scale: number = this._isGrace ? NoteHeadGlyph.GraceScale : 1;

        this.width = MusicFontSymbolSizes.Widths.get(this._symbol)! * scale;
        this.height = MusicFontSymbolSizes.Heights.get(this._symbol)! * scale;

        const effectSpacing: number = 7;
        let effectY = MusicFontSymbolSizes.Heights.get(this._symbol)!;
        for (const g of this.beatEffects.values()) {
            g.y += effectY;
            g.x += this.width / 2;
            g.renderer = this.renderer;
            effectY += effectSpacing;
            g.doLayout();
        }
    }

    private static getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.DoubleWhole:
            case Duration.Whole:
                return MusicFontSymbol.NoteheadSlashWhiteWhole;
            case Duration.Half:
                return MusicFontSymbol.NoteheadSlashWhiteHalf;
            default:
                return MusicFontSymbol.NoteheadSlashVerticalEnds;
        }
    }

    public updateBeamingHelper(cx: number) {
        if (this.beamingHelper) {
            this.beamingHelper.registerBeatLineX('slash', this.beat!, cx + this.x + this.width, cx + this.x);
        }
    }
}
