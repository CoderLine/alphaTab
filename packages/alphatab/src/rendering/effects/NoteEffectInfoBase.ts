import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export abstract class NoteEffectInfoBase extends EffectBarRendererInfo {
    protected lastCreateInfo: Note[] | null = null;

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        this.lastCreateInfo = [];
        for (let i: number = 0, j: number = beat.notes.length; i < j; i++) {
            const n: Note = beat.notes[i];
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

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
