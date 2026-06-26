/**
 * Articulation kind for an inner span of a {@link Slur}.
 *
 * Drives the renderer's font selection (which {@link NotationElement} to
 * use) and the default label text when {@link SlurSegment.text} is null.
 * `Note.finish()` classifies the kind once when building the slur; the
 * renderer never re-derives it.
 * @internal
 */
export enum SlurSegmentKind {
    HammerPull = 0,
    LegatoSlide = 1
}
