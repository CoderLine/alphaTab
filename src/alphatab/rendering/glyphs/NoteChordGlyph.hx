package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

typedef NoteGlyphInfo = {
    glyph:NoteHeadGlyph,
    line:Int
};

class NoteChordGlyph extends Glyph
{
    private var _infos:Array<NoteGlyphInfo>;
    
	public function new(x:Int = 0, y:Int = 0)
    {
        super(x, y);
        _infos = new Array<NoteGlyphInfo>();
    }
    
    public function addNoteGlyph(noteGlyph:NoteHeadGlyph, noteLine:Int)
    {
        _infos.push({glyph:noteGlyph, line:noteLine});
    }
    
	public override function doLayout():Void 
	{
        _infos.sort( function(a, b) {
            if (a.line == b.line) return 0;
            else if (a.line < b.line) return 1;
            else return -1;
        });
        
        var displacedX = 0;
        
        var lastDisplaced = false;
        var lastLine = 0; 
        var anyDisplaced = false; 
        
		var w = 0;
        for (i in 0 ... _infos.length)
        {
            var g = _infos[i].glyph;
 			g.renderer = renderer;
			g.doLayout();
           
            if (i == 0)
            {
                displacedX = g.width;
            }
            else 
            {
                // check if note needs to be repositioned
                if (Math.abs(lastLine - _infos[i].line) <= 1)
                {
                    // reposition if needed
                    if (!lastDisplaced)
                    {
                        g.x = Std.int(displacedX - (getScale()));
                        anyDisplaced = true;
                        lastDisplaced = true; // let next iteration know we are displace now
                    }
                    else
                    {
                        lastDisplaced = false;  // let next iteration know that we weren't displaced now
                    }
                }
                else // offset is big enough? no displacing needed
                {
                    lastDisplaced = false;
                }
            }
            
            lastLine = _infos[i].line;
            w = Std.int(Math.max(w, g.x + g.width));
        }

		width = w;
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		for (g in _infos)
		{
			g.glyph.paint(cx + x, cy + y, canvas);
		}
	}    
}