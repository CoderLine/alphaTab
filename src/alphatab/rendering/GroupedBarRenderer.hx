package alphatab.rendering;
import alphatab.model.Bar;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.glyphs.BeatGlyphBase;
import alphatab.rendering.glyphs.SpacingGlyph;
import alphatab.rendering.staves.BarSizeInfo;

/**
 * This BarRenderer has 3 different groups which cna store glyphs:
 *  - PreBeatGlyphs : Those glyphs are aligned left to right before the first glyph which represents a beat
 *  - BeatGlyphs : Each of those glyphs represents one beat. They are aligned left to right.
 *  - PostBeatGlyphs : Those glyphs are aligned left to right after the last beat glyph
 */
class GroupedBarRenderer extends BarRendererBase
{
	public static inline var KEY_SIZE_PRE = "PRE";
	public static inline var KEY_SIZE_BEAT = "BEAT";
	public static inline var KEY_SIZE_POST = "POST";
	
	private var _preBeatGlyphs:Array<Glyph>;
	private var _beatGlyphs:Array<BeatGlyphBase>;
	private var _beatScaleGlyphs:Array<BeatGlyphBase>;
	private var _postBeatGlyphs:Array<Glyph>;
	 
	public function new(bar:Bar) 
	{
		super(bar);
		_preBeatGlyphs = new Array<Glyph>();
	    _beatGlyphs = new Array<BeatGlyphBase>();
	    _beatScaleGlyphs = new Array<BeatGlyphBase>();
	    _postBeatGlyphs = new Array<Glyph>();
	}
	
	public override function doLayout():Void 
	{
		createPreBeatGlyphs();
		createBeatGlyphs();
		createPostBeatGlyphs();
		updateWidth();
	}
	
	private function updateWidth()
	{
		width = getPostBeatGlyphsStart();
		if (_postBeatGlyphs.length > 0) 
		{
			width += _postBeatGlyphs[_postBeatGlyphs.length - 1].x + _postBeatGlyphs[_postBeatGlyphs.length - 1].width;
		}
	}
	
	public override function registerMaxSizes(sizes:BarSizeInfo):Void 
	{
		var preSize = getBeatGlyphsStart();
		if (sizes.getSize(KEY_SIZE_PRE) < preSize)
		{
			sizes.setSize(KEY_SIZE_PRE, preSize);			
		}
		
		for (b in _beatGlyphs)
		{
			if (sizes.getIndexedSize(KEY_SIZE_BEAT, b.index) < b.width)
			{
				sizes.setIndexedSize(KEY_SIZE_BEAT, b.index, b.width);
			}
		}
		
		var postSize:Int;
		if (_postBeatGlyphs.length == 0)
		{
			postSize = 0;
		}
		else
		{
			postSize = _postBeatGlyphs[_postBeatGlyphs.length - 1].x + _postBeatGlyphs[_postBeatGlyphs.length - 1].width;
		}
		if (sizes.getSize(KEY_SIZE_POST) < postSize)
		{
			sizes.setSize(KEY_SIZE_POST, postSize);
		}
	}
	
	public override function applySizes(sizes:BarSizeInfo):Void 
	{
		// if we need additional space in the preBeat group we simply
		// add a new spacer
		var preSize = sizes.getSize(KEY_SIZE_PRE);
		var preSizeDiff = preSize - getBeatGlyphsStart();
		if (preSizeDiff > 0)
		{
			addPreBeatGlyph(new SpacingGlyph(0, 0, preSizeDiff));
		}
		
		// on beat glyphs we apply the glyph spacing
		for (i in 0 ... _beatGlyphs.length)
		{
			_beatGlyphs[i].x = (i == 0) ? 0 : _beatGlyphs[i - 1].x + _beatGlyphs[i - 1].width;
			
			var beatSize = sizes.getIndexedSize(KEY_SIZE_BEAT, i);
			var beatDiff = beatSize - _beatGlyphs[i].width;
			
			
			if (beatDiff > 0)
			{
				_beatGlyphs[i].applyGlyphSpacing(beatDiff);
			}
		}
		
		// on the post glyphs we add the spacing before all other glyphs
		var postSize = sizes.getSize(KEY_SIZE_POST);
		var postSizeDiff:Int;
		if (_postBeatGlyphs.length == 0)
		{
			postSizeDiff = 0;
		}
		else
		{
			postSizeDiff =  postSize - (_postBeatGlyphs[_postBeatGlyphs.length - 1].x + _postBeatGlyphs[_postBeatGlyphs.length - 1].width);
		}
		
		if (postSizeDiff > 0)
		{
			_postBeatGlyphs.insert(0, new SpacingGlyph(0, 0, postSizeDiff));
			for (i in 0 ... _postBeatGlyphs.length)
			{
				var g = _postBeatGlyphs[i];
				g.x = i == 0 ? 0 : _postBeatGlyphs[_postBeatGlyphs.length - 1].x + _postBeatGlyphs[_postBeatGlyphs.length - 1].width;
				g.index = i;
				g.renderer = this;
			}
		}
		
		updateWidth();
	}
	
	private function addGlyph<T : (Glyph)>(c:Array<T>, g:T)
	{
		g.x = c.length == 0 ? 0 : (c[c.length - 1].x + c[c.length - 1].width);
		g.index = c.length;
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
		if (g.canScale())
		{
			_beatScaleGlyphs.push(g);
		}
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
		var start = getPreBeatGlyphStart();
		if (_preBeatGlyphs.length > 0)
		{
			start += _preBeatGlyphs[_preBeatGlyphs.length - 1].x + _preBeatGlyphs[_preBeatGlyphs.length - 1].width;
		}
		return start;
	}
	
	public function getPostBeatGlyphsStart() : Int
	{
		var start = getBeatGlyphsStart();
		if (_beatGlyphs.length > 0)
		{
			start += _beatGlyphs[_beatGlyphs.length - 1].x + _beatGlyphs[_beatGlyphs.length - 1].width;
		}
		return start;		
	}
		
	public override function applyBarSpacing(spacing:Int):Void 
	{
        width += spacing;
         
        var glyphSpacing = Std.int(spacing / _beatScaleGlyphs.length);
        for (i in 0 ... _beatGlyphs.length)
        {
            var g = _beatGlyphs[i];
            // default behavior: simply replace glyph to new position
            if (i == 0)
            {
                g.x = 0;
            }
            else
            {
                g.x = _beatGlyphs[i - 1].x + _beatGlyphs[i - 1].width;
            }
             
			if (g.canScale())
			{
				if (g == _beatGlyphs[_beatGlyphs.length - 1])
				{
					g.applyGlyphSpacing(glyphSpacing + (spacing - (glyphSpacing * _beatGlyphs.length)));
				}
				else
				{
					g.applyGlyphSpacing(glyphSpacing);
				}
			}
        }
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