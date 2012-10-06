package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Duration;

class TabBeatGlyph extends BeatGlyphBase
{
	public function new(b:Beat) 
	{
		super(b);
	}
	
	public override function doLayout():Void 
	{
		// create glyphs
		if (!beat.isRest())
        {
            
		}
		else
		{
			
		}
		
		// left to right layout
		var w = 0;
		for (g in _glyphs)
		{
			g.x = w;
			g.renderer = renderer;
			g.doLayout();
			w += g.width;
		}	
		width = w;
	} 
}