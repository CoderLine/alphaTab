package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class CircleGlyph extends Glyph
{
    private var _size:Float;
	public function new(x:Int = 0, y:Int = 0, size:Float)
	{
		super(x, y);
        _size = size;
	}

	public override function doLayout():Void 
	{
		width = Std.int(_size + (3 * getScale()));
	}
    
    public override function canScale():Dynamic 
    {
        return false;
    }
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
        canvas.beginPath();
        canvas.circle(cx + x, cy + y, _size);
        canvas.fill();
	}
}