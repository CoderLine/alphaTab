package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;

/**
 * ...
 * @author 
 */

class DummyTablatureGlyph extends Glyph
{
	public function new(x:Int = 0, y:Int = 0) 
	{
		super(x, y);
	}
	
	public override function doLayout():Void 
	{
		width = 100;
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var res = renderer.getResources();
		
		canvas.setColor(new Color(Std.random(256), Std.random(256), Std.random(256), 128));
		canvas.fillRect(cx + x, cy + y, width, renderer.height);
		
		canvas.setFont(res.tablatureFont);
		canvas.setColor(new Color(0, 0, 0));
		canvas.fillText("0 1 2 3 4 5 6 7 9 0", cx + x, cy + y);
	}
}