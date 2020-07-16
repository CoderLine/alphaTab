import { TimeSignatureGlyph } from '@src/rendering/glyphs/TimeSignatureGlyph';
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class TabTimeSignatureGlyph extends TimeSignatureGlyph {
    protected get commonY(): number {
        let renderer: TabBarRenderer = this.renderer as TabBarRenderer;
        return renderer.getTabY(0, 0);
    }

    protected get numeratorY(): number {
        let renderer: TabBarRenderer = this.renderer as TabBarRenderer;
        let offset: number = renderer.bar.staff.tuning.length <= 4 ? 1 / 4 : 1 / 3;
        return renderer.lineOffset * renderer.bar.staff.tuning.length * offset * this.scale;
    }

    protected get denominatorY(): number {
        let renderer: TabBarRenderer = this.renderer as TabBarRenderer;
        let offset: number = 3 / 5;
        return renderer.lineOffset * renderer.bar.staff.tuning.length * offset * this.scale;
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
