import { TimeSignatureGlyph } from '@src/rendering/glyphs/TimeSignatureGlyph';
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class TabTimeSignatureGlyph extends TimeSignatureGlyph {
    protected get commonScale(): number {
        return 1;
    }

    protected get numberScale(): number {
        let renderer: TabBarRenderer = this.renderer as TabBarRenderer;
        if (renderer.bar.staff.tuning.length <= 4) {
            return NoteHeadGlyph.GraceScale;
        }
        return 1;
    }
}
