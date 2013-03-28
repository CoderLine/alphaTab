package alphatab.rendering.glyphs.effects;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.RenderingResources;

class DummyEffectGlyph extends Glyph
{
	public function new(x:Int = 0, y:Int = 0)
	{
		super(x, y);
	}

	public override function doLayout():Void 
	{
		width = Std.int(20 * getScale());
	}
    
    public override function canScale():Dynamic 
    {
        return false;
    }
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
        var res:RenderingResources = renderer.getResources();
        canvas.setColor(res.mainGlyphColor);
        canvas.strokeRect(cx + x, cy + y, width, 20 * getScale());
	}
}