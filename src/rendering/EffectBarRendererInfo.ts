import { Beat } from '@src/model/Beat';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';

/**
 * A classes inheriting from this base can provide the
 * data needed by a EffectBarRenderer to create effect glyphs dynamically.
 */
export abstract class EffectBarRendererInfo {
    /**
     * Gets the unique effect name for this effect. (Used for grouping)
     */
    public get effectId(): string {
        return this.notationElement.toString(); 
    }

    /**
     * Gets the notation element that this effect represents. (Used for dynamic showing/hiding)
     */
    public abstract get notationElement(): NotationElement;

    /**
     * Gets a value indicating whether this effect can share the space
     * with other effects if required.
     * (Example: tempo and dynamics don't share their space with other effects, a let-ring and palm-mute will share the space if possible)
     * @returns true if this effect bar should only be created once for the first track, otherwise false.
     */
    public abstract get canShareBand(): boolean;

    /**
     * Gets a value indicating whether this effect glyphs
     * should only be added once on the first track if multiple tracks are rendered.
     * (Example: this allows to render the tempo changes only once)
     * @returns true if this effect bar should only be created once for the first track, otherwise false.
     */
    public abstract get hideOnMultiTrack(): boolean;

    /**
     * Checks whether the given beat has the appropriate effect set and
     * needs a glyph creation
     * @param settings
     * @param beat the beat storing the data
     * @returns true if the beat has the effect set, otherwise false.
     */
    public abstract shouldCreateGlyph(settings: Settings, beat: Beat): boolean;

    /**
     * Gets the sizing mode of the glyphs created by this info.
     * @returns the sizing mode to apply to the glyphs during layout
     */
    public abstract get sizingMode(): EffectBarGlyphSizing;

    /**
     * Creates a new effect glyph for the given beat.
     * @param renderer the renderer which requests for glyph creation
     * @param beat the beat storing the data
     * @returns the glyph which needs to be added to the renderer
     */
    public abstract createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph;

    /**
     * Checks whether an effect glyph can be expanded to a particular beat.
     * @param from the beat which already has the glyph applied
     * @param to the beat which the glyph should get expanded to
     * @returns true if the glyph can be expanded, false if a new glyph needs to be created.
     */
    public abstract canExpand(from: Beat, to: Beat): boolean;
}
