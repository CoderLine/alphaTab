using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// Effect-Glyphs implementing this public interface get notified
    /// as they are expanded over multiple beats.
    /// </summary>
    internal class EffectGlyph : Glyph
    {
        /// <summary>
        /// Gets or sets the beat where the glyph belongs to.
        /// </summary>
        public Beat Beat { get; set; }

        /// <summary>
        /// Gets or sets the next glyph of the same type in case 
        /// the effect glyph is expanded when using <see cref="EffectBarGlyphSizing.GroupedOnBeat"/>.
        /// </summary>
        public EffectGlyph NextGlyph { get; set; }

        /// <summary>
        /// Gets or sets the previous glyph of the same type in case 
        /// the effect glyph is expanded when using <see cref="EffectBarGlyphSizing.GroupedOnBeat"/>.
        /// </summary>
        public EffectGlyph PreviousGlyph { get; set; }

        public float Height { get; set; }

        protected EffectGlyph(float x, float y)
            : base(x, y)
        {
        }
    }
}
