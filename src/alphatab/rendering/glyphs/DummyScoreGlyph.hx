package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;

class DummyScoreGlyph extends Glyph
{
	public function new(x:Int = 0, y:Int = 0, width:Int = 100) 
	{
		super(x, y);
		this.width = width;
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var res = renderer.getResources();
		
		canvas.setColor(new Color(Std.random(256), Std.random(256), Std.random(256), 128));
		canvas.fillRect(cx + x, cy + y, width, renderer.height);

		canvas.setColor(new Color(Std.random(256), Std.random(256), Std.random(256), 200));
		canvas.beginPath();
		canvas.moveTo(cx + x, cy + y + renderer.height);
		canvas.lineTo(cx + x, cy + y);
		canvas.lineTo(cx + x + width, cy + y + renderer.height);
		canvas.lineTo(cx + x + width, cy + y);
		canvas.stroke();
	}
}