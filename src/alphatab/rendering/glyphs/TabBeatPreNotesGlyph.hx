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
            addGlyph(new BrushGlyph(container.beat));    
        }
        super.doLayout();
    }
}