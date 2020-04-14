import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { IEffectBarRendererInfo } from '@src/rendering/IEffectBarRendererInfo';
import { Settings } from '@src/Settings';

export abstract class NoteEffectInfoBase implements IEffectBarRendererInfo {
    protected lastCreateInfo: Note[] | null = null;

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        this.lastCreateInfo = [];
        for (let i: number = 0, j: number = beat.notes.length; i < j; i++) {
            let n: Note = beat.notes[i];
            if (this.shouldCreateGlyphForNote(n)) {
                this.lastCreateInfo.push(n);
            }
        }
        return this.lastCreateInfo.length > 0;
    }

    protected abstract shouldCreateGlyphForNote(note: Note): boolean;

    public abstract get effectId(): string;

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public abstract get sizingMode(): EffectBarGlyphSizing;

    public abstract createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph;

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
