import { NoteOrnament } from '@src/model/NoteOrnament';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

/**
 * @internal
 */
export class NoteOrnamentGlyph extends MusicFontGlyph {
    constructor(ornament: NoteOrnament) {
        super(0, 0, 1, NoteOrnamentGlyph._getSymbol(ornament));
        this.center = true;
    }

    private static _getSymbol(ornament: NoteOrnament): MusicFontSymbol {
        switch (ornament) {
            case NoteOrnament.InvertedTurn:
                return MusicFontSymbol.OrnamentTurnInverted;
            case NoteOrnament.Turn:
                return MusicFontSymbol.OrnamentTurn;
            case NoteOrnament.UpperMordent:
                return MusicFontSymbol.OrnamentShortTrill;
            case NoteOrnament.LowerMordent:
                return MusicFontSymbol.OrnamentMordent;
        }
        return MusicFontSymbol.None;
    }

    public override doLayout(): void {
        super.doLayout();
        // NOTE: fixed height to vertically align the different ornaments
        this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.OrnamentMordent)!;
        this.offsetY = this.renderer.smuflMetrics.glyphTop.get(MusicFontSymbol.OrnamentMordent)!;
    }
}
