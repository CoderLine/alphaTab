package alphatab.rendering.glyphs.effects;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.MusicFont;
import alphatab.rendering.glyphs.SvgGlyph;

class VibratoGlyph extends Glyph
{
    private var _scale:Float;
	public function new(x:Int = 0, y:Int = 0, scale:Float = 0.9)
	{
		super(x, y);
        _scale = scale;
	}	
	
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var step:Float = 11 * getScale() * _scale;        
        var loops:Int = Math.floor(Math.max(1, (width / step)));
        
        var loopX = 0;
        for (i in 0 ... loops)
        {
            var glyph = new SvgGlyph(loopX, 0, MusicFont.WaveHorizontal, _scale, _scale);
            glyph.renderer = renderer;
            glyph.paint(cx + x, cy + y, canvas);
            loopX += Math.floor(step);
        }
    }
}