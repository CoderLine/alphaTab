import { TimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/TimeSignatureGlyph';
import type { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import { BarSubElement } from '@coderline/alphatab/model/Bar';

/**
 * @internal
 */
export class TabTimeSignatureGlyph extends TimeSignatureGlyph {
    public override doLayout(): void {
        this.barSubElement = BarSubElement.GuitarTabsTimeSignature;
        super.doLayout();
    }

    protected get commonScale(): number {
        return 1;
    }

    protected get numberScale(): number {
        const renderer: TabBarRenderer = this.renderer as TabBarRenderer;
        if (renderer.bar.staff.tuning.length <= 4) {
            return NoteHeadGlyph.GraceScale;
        }
        return 1;
    }
}
