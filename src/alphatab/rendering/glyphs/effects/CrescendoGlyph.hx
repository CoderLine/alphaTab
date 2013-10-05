package alphatab.rendering.glyphs.effects;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.CrescendoType;
import alphatab.rendering.glyphs.MusicFont;
import alphatab.rendering.glyphs.SvgGlyph;

class CrescendoGlyph extends Glyph
{
    public static inline var Height = 17;
    private var _crescendo:CrescendoType;
	public function new(x:Int = 0, y:Int = 0, crescendo:CrescendoType)
	{
		super(x, y);
        _crescendo = crescendo;
	}	
	
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var height = Height * getScale();
        var res = renderer.getResources();
        canvas.setColor(res.mainGlyphColor);
        canvas.beginPath();
        if (_crescendo == CrescendoType.Crescendo)
        {
            canvas.moveTo(cx + x + width, cy + y);
            canvas.lineTo(cx + x, cy + y + Std.int(height / 2));
            canvas.lineTo(cx + x + width, cy + y + height);
        }
        else
        {
            canvas.moveTo(cx + x, cy + y);
            canvas.lineTo(cx + x + width, cy + y + Std.int(height / 2));
            canvas.lineTo(cx + x, cy + y + height);
        }
        canvas.stroke();
    }
}