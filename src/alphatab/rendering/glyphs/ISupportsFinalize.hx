package alphatab.rendering.glyphs;
import alphatab.rendering.layout.ScoreLayout;

interface ISupportsFinalize 
{
	function finalizeGlyph(layout:ScoreLayout) : Void;
}