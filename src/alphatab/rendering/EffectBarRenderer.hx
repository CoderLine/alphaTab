package alphatab.rendering;
import alphatab.model.Bar;
import alphatab.model.Voice;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.glyphs.BeatGlyphBase;
import haxe.ds.IntMap;

class EffectBarRenderer extends GroupedBarRenderer
{
    private var _beatPosition:IntMap<BeatGlyphBase>;

	public function new(bar:Bar) 
	{
		super(bar);
        _beatPosition = new IntMap<BeatGlyphBase>();
	}
	
	public override function doLayout()
	{
		super.doLayout();
		height = Std.int(30 * getScale());
        if (index == 0)
        {
            stave.registerStaveBottom(height);            
        }
	}
	
	private override function createPreBeatGlyphs():Void 
	{
	}

	private override function createBeatGlyphs():Void 
	{
        // TODO: Render all voices
        createVoiceGlyphs(_bar.voices[0]);
	}
    
    private function createVoiceGlyphs(v:Voice)
    {
        for (b in v.beats)
        {
			var pre = new BeatGlyphBase(b);
			addBeatGlyph(pre);
			
			var g = new BeatGlyphBase(b);
			_beatPosition.set(b.index, g);
			addBeatGlyph(g); 
			
			var post = new BeatGlyphBase(b);
			addBeatGlyph(post);
        }
    }	

	
	private override function createPostBeatGlyphs():Void 
	{
	}
	
	public override function getTopPadding():Int 
	{
		return 0;
	}	
	
	public override function getBottomPadding():Int 
	{
		return 0;
	}
	
	public override function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
	{
		var res = getResources();
		
        //
        // fill a light gray shadow for help
        //
        canvas.setColor(new Color(0, 0, 0, 120));
        canvas.fillRect(cx + x, cy + y, width, height); 
	}
}