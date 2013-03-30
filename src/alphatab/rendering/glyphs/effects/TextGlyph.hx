package alphatab.rendering.glyphs.effects;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Font;
import alphatab.rendering.Glyph;

class TextGlyph extends Glyph
{
    private var _text:String;
    private var _font:Font;
    
	public function new(x:Int = 0, y:Int = 0, text:String, font:Font)
	{
		super(x, y);
        _text = text;
        _font = font;
	}	
	
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var res = renderer.getResources();
        canvas.setFont(_font);
        canvas.setColor(res.mainGlyphColor);
        
        canvas.fillText(_text, cx + x, cy + y);
    }
}