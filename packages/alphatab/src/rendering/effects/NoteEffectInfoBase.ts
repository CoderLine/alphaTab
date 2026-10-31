import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';

/**
 * Builds a `shouldCreateGlyph` for note-based effects: it creates a glyph
 * as soon as any note on the beat matches the given predicate.
 * @internal
 */
export function createNoteShouldCreateGlyph(
    shouldCreateGlyphForNote: (note: Note) => boolean
): (renderer: BarRendererBase, beat: Beat) => boolean {
    return (_renderer: BarRendererBase, beat: Beat): boolean => beat.notes.some(shouldCreateGlyphForNote);
}
