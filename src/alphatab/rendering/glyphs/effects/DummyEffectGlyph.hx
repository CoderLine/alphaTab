package alphatab.rendering.glyphs.effects;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.RenderingResources;

class DummyEffectGlyph extends Glyph
{
    private var _s:String;
	public function new(x:Int = 0, y:Int = 0, s:String)
	{
		super(x, y);
        _s = s;
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
        canvas.setFont(res.tablatureFont);
        canvas.fillText(_s, cx + x, cy + y);
	}
}