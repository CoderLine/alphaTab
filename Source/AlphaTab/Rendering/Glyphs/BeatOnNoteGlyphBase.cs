using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class BeatOnNoteGlyphBase : BeatGlyphBase
    {
        public BeamingHelper BeamingHelper { get; set; }
        /// <summary>
        /// Gets or sets the x position where the spring of this beat starts. 
        /// </summary>
        public float SpringStartX { get; set; }
    }
}