package alphatab.rendering.glyphs;
import alphatab.model.Note;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;

class NoteNumberGlyph extends Glyph
{
	public static inline var Padding = 0;
	private var _noteString:String;
	private var _isGrace:Bool;
	
	public function new(x:Int = 0, y:Int = 0, n:Note, isGrace:Bool) 
	{
		super(x, y);
		_isGrace = isGrace;
		if (!n.isTieDestination)
		{
			_noteString = n.isDead ? "X" : Std.string(n.fret);
			if (n.isGhost)
			{
				_noteString = "(" + _noteString + ")";
			}
		}
		else if (n.beat.index == 0)
		{
			_noteString = "(" + _noteString + ")";
		}
	}
	
	public override function doLayout():Void 
	{
        var scoreRenderer = renderer.getLayout().renderer;
		if (_isGrace) 
		{
			scoreRenderer.canvas.setFont(scoreRenderer.renderingResources.graceFont);			
		}
		else
		{
			scoreRenderer.canvas.setFont(scoreRenderer.renderingResources.tablatureFont);
		}
        
		width = Std.int(renderer.getLayout().renderer.canvas.measureText(_noteString));
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		if (_noteString != null) 
		{
			var res = renderer.getResources();
            //canvas.setColor(new Color(200, 200, 0, 100));
            //canvas.fillRect(cx + x, cy + y, width, 10);
			canvas.setColor(res.mainGlyphColor);
			if (_isGrace) 
			{
				canvas.setFont(res.graceFont);			
			}
			else
			{
				canvas.setFont(res.tablatureFont);
			}
			canvas.fillText(Std.string(_noteString), cx + x + (Padding * getScale()), cy + y);
		}
	}	
}