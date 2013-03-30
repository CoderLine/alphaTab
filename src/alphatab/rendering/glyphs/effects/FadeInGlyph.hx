package alphatab.rendering.glyphs.effects;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class FadeInGlyph extends Glyph
{
	public function new(x:Int = 0, y:Int = 0)
	{
		super(x, y);
	}	
	
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var size:Int = Std.int(6 * getScale());
        
        canvas.beginPath();
        canvas.moveTo(cx + x, cy + y);
        canvas.quadraticCurveTo(cx + x + Std.int(width/2), cy + y, cx + x + width, cy + y - size);
        canvas.moveTo(cx + x, cy + y);
        canvas.quadraticCurveTo(cx + x + Std.int(width/2), cy + y, cx + x + width, cy + y + size);
        canvas.stroke();
    }
}