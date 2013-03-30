package alphatab.rendering.glyphs;

import alphatab.model.Beat;

/**
 * Effect-Glyphs implementing this interface get notified
 * as they are expanded over multiple beats.
 */
interface IMultiBeatEffectGlyph
{
    function expandedTo(beat:Beat) : Void;
}