package alphatab.rendering.glyphs;
import alphatab.model.Note;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class TieGlyph extends Glyph
{
	private var _startNote:Note;
	private var _endNote:Note;
    private var _parent:Glyph;
	
	public function new(startNote:Note, endNote:Note, parent:Glyph)
	{
		super(0, 0);
		_startNote = startNote;
		_endNote = endNote;
        _parent = parent;
	}

	public override function doLayout():Void 
	{
		width = 0;
	}
	
	public override function canScale():Bool 
	{
		return false;
	}
	
	// paints a tie between the two given points
    public static function paintTie(canvas:ICanvas, scale:Float, x1:Float, y1:Float, x2:Float, y2:Float, down:Bool=false) : Void
    {
		// ensure endX > startX
		if (x2 > x1) 
		{
			var t = x1;
			x1 = x2;
			x2 = t;
			t = y1;
			y1 = y2;
			y2 = t;
		}
        //
        // calculate control points 
        //
        var offset = 15*scale;
        var size = 4*scale;
        // normal vector
        var normalVector = {
            x: (y2 - y1),
            y: (x2 - x1)
        }
        var length = Math.sqrt((normalVector.x*normalVector.x) + (normalVector.y * normalVector.y));
        if(down) 
            normalVector.x *= -1;
        else
            normalVector.y *= -1;
        
        // make to unit vector
        normalVector.x /= length;
        normalVector.y /= length;
        
        // center of connection
        var center = {
            x: (x2 + x1)/2,
            y: (y2 + y1)/2
        };
       
        // control points
        var cp1 = {
            x: center.x + (offset*normalVector.x),
            y: center.y + (offset*normalVector.y),
        }; 
        var cp2 = {
            x: center.x + ((offset-size)*normalVector.x),
            y: center.y + ((offset-size)*normalVector.y),
        };
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.quadraticCurveTo(cp1.x, cp1.y, x2, y2);
        canvas.quadraticCurveTo(cp2.x, cp2.y, x1, y1);
        canvas.closePath();
    }
}