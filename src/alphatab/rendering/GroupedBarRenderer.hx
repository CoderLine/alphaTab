package alphatab.rendering;
import alphatab.model.Bar;
import alphatab.platform.ICanvas;
import alphatab.rendering.glyphs.BeatGlyphBase;

/**
 * This BarRenderer has 3 different groups which cna store glyphs:
 *  - PreBeatGlyphs : Those glyphs are aligned left to right before the first glyph which represents a beat
 *  - BeatGlyphs : Each of those glyphs represents one beat. They are aligned left to right.
 *  - PostBeatGlyphs : Those glyphs are aligned left to right after the last beat glyph
 */
class GroupedBarRenderer extends BarRendererBase
{
	private var _preBeatGlyphs:Array<Glyph>;
	private var _beatGlyphs:Array<BeatGlyphBase>;
	private var _postBeatGlyphs:Array<Glyph>;
	 
	public function new(bar:Bar) 
	{
		super(bar);
		_preBeatGlyphs = new Array<Glyph>();
	    _beatGlyphs = new Array<BeatGlyphBase>();
	    _postBeatGlyphs = new Array<Glyph>();
	}
	
	public override function doLayout():Dynamic 
	{
		createPreBeatGlyphs();
		createBeatGlyphs();
		createPostBeatGlyphs();
		width = getPostBeatGlyphsStart();
		if (_postBeatGlyphs.length > 0) 
		{
			width += _postBeatGlyphs[_postBeatGlyphs.length - 1].x + _postBeatGlyphs[_postBeatGlyphs.length - 1].width;
		}
	}
	
	private function addGlyph<T : (Glyph)>(c:Array<T>, g:T)
	{
		g.x = c.length == 0 ? 0 : (c[c.length - 1].x + c[c.length - 1].width);
		g.index = _preBeatGlyphs.length;
		g.renderer = this;
		g.doLayout();
		c.push(g);
	}
	
	private function addPreBeatGlyph(g:Glyph)
	{
		addGlyph(_preBeatGlyphs, g);
	}
	
	private function addBeatGlyph(g:BeatGlyphBase)
	{
		addGlyph(_beatGlyphs, g);
	}
	
	private function addPostBeatGlyph(g:Glyph)
	{
		addGlyph(_postBeatGlyphs, g);
	}
	
	private function createPreBeatGlyphs()
	{
		
	}
	
	private function createBeatGlyphs()
	{
		
	}
	
	private function createPostBeatGlyphs()
	{
		
	}
	
	public function getPreBeatGlyphStart() : Int
	{
		return 0;
	}
	
	public function getBeatGlyphsStart() : Int
	{
		return _preBeatGlyphs.length == 0 
			? getPreBeatGlyphStart() 
			: _preBeatGlyphs[_preBeatGlyphs.length - 1].x 
			  + _preBeatGlyphs[_preBeatGlyphs.length - 1].width;
	}
	
	public function getPostBeatGlyphsStart() : Int
	{
		return _beatGlyphs.length == 0 
			? getBeatGlyphsStart() 
			: _beatGlyphs[_beatGlyphs.length - 1].x 
			  + _beatGlyphs[_beatGlyphs.length - 1].width;
	}
		
	public override function applyBarSpacing(spacing:Int):Void 
	{
		// TODO: Find out which glyphs need to be expanded on additional spacing
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas)
	{
        paintBackground(cx, cy, canvas);
		
		var glyphStartX = getPreBeatGlyphStart();
		for (g in _preBeatGlyphs)
		{
			g.paint(cx + x + glyphStartX, cy + y, canvas);
		}		
		
		glyphStartX = getBeatGlyphsStart();
		for (g in _beatGlyphs)
		{
			g.paint(cx + x + glyphStartX, cy + y, canvas);
		}	

		glyphStartX = getPostBeatGlyphsStart();
		for (g in _postBeatGlyphs)
		{
			g.paint(cx + x + glyphStartX, cy + y, canvas);
		}	
	}
	
	public function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
	{
		
	}
}