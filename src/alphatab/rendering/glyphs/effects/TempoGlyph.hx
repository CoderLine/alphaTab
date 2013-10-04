package alphatab.rendering.glyphs.effects;
import alphatab.model.TextBaseline;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.MusicFont;
import alphatab.rendering.glyphs.SvgGlyph;

class TempoGlyph extends Glyph
{
    private var _tempo:Int;
    
	public function new(x:Int = 0, y:Int = 0, tempo:Int)
	{
		super(x, y);
        _tempo = tempo;
	}	
	
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var res = renderer.getResources();
        canvas.setFont(res.markerFont);
        canvas.setColor(res.mainGlyphColor);
        
        var symbol = new SvgGlyph(0, 0, MusicFont.Tempo, 1, 1);
        symbol.renderer = renderer;
        symbol.paint(cx + x, cy + y, canvas);
        
        canvas.fillText("" + _tempo, cx + x + Std.int(30 * getScale()), cy + y + Std.int(7*getScale()));
    }
}