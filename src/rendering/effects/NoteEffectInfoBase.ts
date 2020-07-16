import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { Settings } from '@src/Settings';

export abstract class NoteEffectInfoBase extends EffectBarRendererInfo {
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

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
