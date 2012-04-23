package alphatab.rendering;
import alphatab.model.Bar;
import alphatab.platform.ICanvas;
import alphatab.rendering.glyphs.SpacingGlyph;

/**
 * ...
 * @author 
 */

class GlyphBarRenderer extends BarRendererBase
{
	public static inline var FirstGlyphSpacing = 10;

	private var _bar:Bar;
	public var glyphs:Array<Glyph>;
	private function new(bar:Bar) 
	{
		super();
		_bar = bar;
		glyphs = new Array<Glyph>();
	}
	
	public override function doLayout():Void 
	{
		createGlyphs();
	}
	
	private function createGlyphs() : Void
	{
		var lay = getLayout();
		addGlyph(new SpacingGlyph(0, 0, Std.int(10 * lay.renderer.scale)));
	}
		
	private function addGlyph(glyph:Glyph) : Void
	{
		glyph.x = width;
		glyph.index = glyphs.length;
		glyph.renderer = this;
		glyph.doLayout();
		if (glyph.x + glyph.width > width)
		{
			width = glyph.x + glyph.width;
		}
		glyphs.push(glyph);
	}	
	
	
	public override function applyBarSpacing(spacing:Int):Void 
	{
		var oldWidth = width;
		width += spacing;
		
		var glyphSpacing = Std.int(spacing / glyphs.length);
		for (g in glyphs)
		{
			g.applyGlyphSpacing(glyphSpacing);
		}
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas)
	{
		paintBackground(cx, cy, canvas);
		
		for (g in glyphs)
		{
			g.paint(cx + x, cy + y, canvas);
		}
	}
	
	public function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
	{
		
	}
}