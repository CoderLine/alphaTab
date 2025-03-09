import { TimeSignatureGlyph } from '@src/rendering/glyphs/TimeSignatureGlyph';
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { BarSubElement } from '@src/model';

export class TabTimeSignatureGlyph extends TimeSignatureGlyph {
    public override doLayout(): void {
        this.barSubElement = BarSubElement.GuitarTabsTimeSignature;
        super.doLayout();
    }

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
