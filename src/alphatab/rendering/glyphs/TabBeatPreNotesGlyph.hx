package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.BrushType;

class TabBeatPreNotesGlyph extends BeatGlyphBase
{
	public function new() 
	{
		super();
	}
    
    public override function doLayout():Void 
    {
        if (container.beat.brushType != BrushType.None)
        {
            addGlyph(new TabBrushGlyph(container.beat));    
            addGlyph(new SpacingGlyph(0, 0, Std.int(4 * getScale())));
        }
        super.doLayout();
    }
}