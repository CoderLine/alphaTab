package alphatab.rendering.glyphs;
import alphatab.model.Note;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;

class NoteNumberGlyph extends Glyph
{
	private var _noteString:String;
	
	public function new(x:Int = 0, y:Int = 0, n:Note) 
	{
		super(x, y);
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
        scoreRenderer.canvas.setFont(scoreRenderer.renderingResources.tablatureFont);
        
		width = Std.int(renderer.getLayout().renderer.canvas.measureText(_noteString));
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var res = renderer.getResources();

		canvas.setColor(res.mainGlyphColor);
		canvas.setFont(res.tablatureFont);
		canvas.fillText(Std.string(_noteString), cx + x + (3 * getScale()), cy + y);
	}	
}