// biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
import type { RenderingResources } from '@src/RenderingResources';
import type { Color } from '@src/model/Color';

/**
 * Defines the custom styles for an element in the music sheet (like bars, voices, notes etc).
 */
export class ElementStyle<TSubElements extends number> {
    /**
     * Changes the color of the specified sub-element within the element this style container belongs to.
     * Null indicates that a certain element should use the default color from {@link RenderingResources}
     * even if some "higher level" element changes colors.
     */
    public colors: Map<TSubElements, Color | null> = new Map<TSubElements, Color | null>();

    // TODO: replace NotationSettings.elements by adding a visibility here?
}
