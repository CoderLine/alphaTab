package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class BarNumberGlyph extends Glyph
{
	private var _number:Int;
	public function new(x:Int = 0, y:Int = 0, number:Int)
	{
		super(x, y);
		_number = number;
	}

	public override function doLayout():Void 
	{
		width = Std.int(8 * getScale());
	}
	
	public override function applyGlyphSpacing(spacing:Int):Void
	{
	}

	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var res = renderer.getResources();
		canvas.setColor(res.barNumberColor);
		canvas.setFont(res.barNumberFont);
		
		canvas.fillText(Std.string(_number), cx + x, cy + y);
	}
}