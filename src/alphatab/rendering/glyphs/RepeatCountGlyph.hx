package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class RepeatCountGlyph  extends Glyph
{
	private var _count:Int;
	public function new(x:Int = 0, y:Int = 0, count:Int)
	{
		super(x, y);
		_count = count;
	}

	public override function doLayout():Void 
	{
		width = 0;
	}
	
    
    public override function canScale():Bool 
    {
        return false;
    }

	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var res = renderer.getResources();
		canvas.setColor(res.mainGlyphColor);
		canvas.setFont(res.barNumberFont);
		
		canvas.fillText("x" + Std.string(_count), cx + x, cy + y);
	}
}