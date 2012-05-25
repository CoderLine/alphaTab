package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class RepeatCloseGlyph extends Glyph
{
	public function new(x:Int = 0, y:Int = 0)
	{
		super(x, y);
	}

	public override function doLayout():Void 
	{
		width = Std.int( 13 * getScale());
	}
	
	public override function applyGlyphSpacing(spacing:Int):Void
	{
	}

	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var res = renderer.getResources();
		canvas.setColor(res.mainGlyphColor);
		
		var blockWidth = 4 * getScale();
		
		var top = cy + y + renderer.getTopPadding();
		var bottom = cy + y + renderer.height - renderer.getBottomPadding();
		var left:Float = cx + x;
		var h = bottom - top;

		//circles 
		var circleSize = 1.5 * getScale();
		var middle = (top + bottom) / 2;
		var dotOffset = 3;
		canvas.beginPath();
		canvas.circle(left, middle - (circleSize * dotOffset), circleSize);
		canvas.circle(left, middle + (circleSize * dotOffset), circleSize);
		canvas.fill();
		
		// line
		left += (4 * getScale());
		canvas.beginPath();
		canvas.moveTo(left, top);
		canvas.lineTo(left, bottom);
		canvas.stroke();
		
		// big bar
		left += (3 * getScale()) + 0.5;
		canvas.fillRect(left, top, blockWidth, h); 

	}
}