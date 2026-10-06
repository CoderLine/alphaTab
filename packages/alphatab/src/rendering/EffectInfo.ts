import type { Beat } from '@coderline/alphatab/model/Beat';
import type { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import type { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import type { OverlayRodPolicy } from '@coderline/alphatab/rendering/OverlayRodPolicy';

/**
 * Lower = placed first = closer to staff. Gould (Behind Bars p.118, 184, 484).
 * @internal
 */
export enum EffectBandPlacementCategory {
    /** Articulations, fingerings, dynamics, text, ornaments, fermatas. */
    NoteAttached = 0,
    /** Vibrato, let-ring, palm-mute, trill, whammy, hairpins, ottava, pedal, rasgueado, barré. */
    Span = 1,
    /** Tempo, rehearsal, section markers, free-time, alternate endings, chords. */
    SystemMarker = 2,
    /**
     * Single-baseline rows parallel to the stave (Gould p.300). Bands sharing
     * {@link EffectInfo.effectId} align at the deepest magnitude across the
     * row's combined x-range.
     */
    HorizontalRow = 3
}

/**
 * Provides the data an EffectBarRenderer needs to create effect glyphs.
 * @internal
 * @record
 */
export interface EffectInfo {
    /**
     * The unique effect name for this effect. (Used for grouping)
     */
    readonly effectId: string;

    /**
     * The notation element that this effect represents. (Used for dynamic showing/hiding)
     */
    readonly notationElement: NotationElement;

    /**
     * Whether this effect glyphs
     * should only be added once on the first track if multiple tracks are rendered.
     * (Example: this allows to render the tempo changes only once)
     * @returns true if this effect bar should only be created once for the first track, otherwise false.
     */
    readonly hideOnMultiTrack: boolean;

    /**
     * Checks whether the given beat has the appropriate effect set and
     * needs a glyph creation
     * @param settings
     * @param beat the beat storing the data
     * @returns true if the beat has the effect set, otherwise false.
     */
    shouldCreateGlyph: (renderer: BarRendererBase, beat: Beat) => boolean;

    readonly sizingMode: EffectBarGlyphSizing;

    /**
     * Describes how glyphs created by this effect contribute overlay rods
     * during bar spacing. Defaults to {@link OverlayRodPolicy.None} (no
     * contribution); override to opt in and declare the alignment policy.
     */
    readonly overlayRodPolicy?: OverlayRodPolicy;

    /**
     * Creates a new effect glyph for the given beat.
     * @param renderer the renderer which requests for glyph creation
     * @param beat the beat storing the data
     * @returns the glyph which needs to be added to the renderer
     */
    createNewGlyph: (renderer: BarRendererBase, beat: Beat) => EffectGlyph;

    /**
     * Checks whether an effect glyph can be expanded to a particular beat.
     * @param from the beat which already has the glyph applied
     * @param to the beat which the glyph should get expanded to
     * @returns true if the glyph can be expanded, false if a new glyph needs to be created.
     */
    canExpand: (from: Beat, to: Beat) => boolean;

    /** Default {@link EffectBandPlacementCategory.NoteAttached} keeps unknown effects close to the staff. */
    readonly placementCategory: EffectBandPlacementCategory;

    /**
     * When `true`, this band is placed against the content-only skyline
     * ({@link import('@coderline/alphatab/rendering/staves/RenderStaff').RenderStaff.contentSkyline}),
     * i.e. it ignores the structural bar header (clef, key signature, time
     * signature, barlines, repeat counts) when finding its vertical position.
     *
     * This is for elements that conceptually live *within* the header's own
     * reserved band rather than stacked above the whole engraving — chiefly bar
     * numbers, which sit at the barline over the clef and must not be shoved up
     * by it (the header's height is already priced into the staff via scalar
     * overflow). The band is still inserted into the full skyline, so later
     * bands stack above it correctly. Defaults to `false` (respects the header).
     */
    readonly ignoresStructuralHeader?: boolean;

    /** When `true`, the band feeds each beat-glyph's paint extent into the rhythmic-spacing solver. */
    readonly contributesToBeatSpacing?: boolean;

    /**
     * Define this method to finalize an effect band with all glyphs created.
     * Allows special layout logic like for whammys where we center-align the glyphs and size the band accordingly.
     * @param band The band which is being finalized.
     */
    finalizeBand?: (band: EffectBand) => void;

    /**
     * Define this method when glyphs are for this effect is being re-aligned during resizing.
     * @param band The band holding the glyph
     */
    onAlignGlyphs?: (band: EffectBand) => void;
}