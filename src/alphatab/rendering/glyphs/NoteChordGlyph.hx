package alphatab.rendering.glyphs;
import alphatab.model.Voice;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;
import alphatab.rendering.RenderingResources;
import alphatab.rendering.ScoreBarRenderer;

typedef NoteGlyphInfo = {
    glyph:Glyph,
    line:Int
};

class NoteChordGlyph extends Glyph
{
    private var _infos:Array<NoteGlyphInfo>;
    
    public var minNote:NoteGlyphInfo;
    public var maxNote:NoteGlyphInfo;
    
    public var spacingChanged:Void->Void;
    public var upLineX:Int;
    public var downLineX:Int;
    
	public function new(x:Int = 0, y:Int = 0)
    {
        super(x, y);
        _infos = new Array<NoteGlyphInfo>();
    }
    
    public function addNoteGlyph(noteGlyph:Glyph, noteLine:Int)
    {
        var info:NoteGlyphInfo =  { glyph:noteGlyph, line:noteLine }
        _infos.push( info );
        if (minNote == null || minNote.line > info.line)
        {
            minNote = info;
        }
        if (maxNote == null || maxNote.line < info.line)
        {
            maxNote = info;
        }
    }
       
    public override function canScale():Bool 
    {
        return false;
    }
    
    public override function applyGlyphSpacing(spacing:Int):Dynamic 
    {
        super.applyGlyphSpacing(spacing);
        if(spacingChanged != null)
            spacingChanged();
    }
    
    public function hasTopOverflow() : Bool
    {
        return minNote != null && minNote.line < 0;
    }
    
    public function hasBottomOverflow() : Bool
    {
        return maxNote != null && maxNote.line > 8;
    }
    
	public override function doLayout():Void 
	{
        _infos.sort( function(a, b) {
            if (a.line == b.line) return 0;
            else if (a.line < b.line) return 1;
            else return -1;
        });
        
        var padding = Std.int(4 * getScale());

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
            
            g.x = padding;
           
            if (i == 0)
            {
                displacedX = g.width + padding;
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
        
        if (anyDisplaced)
        {
            upLineX = displacedX;
            downLineX = displacedX;
        }
        else
        {
            upLineX = w;
            downLineX = padding;
        }

		width = w + padding;
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
        var scoreRenderer:ScoreBarRenderer = cast renderer;
        canvas.setColor(renderer.getLayout().renderer.renderingResources.staveLineColor);
        
        if (hasTopOverflow()) 
        {
            var l = -1;
            while (l >= minNote.line)
            {
                // + 1 Because we want to place the line in the center of the note, not at the top
                var lY = cy + y + scoreRenderer.getScoreY(l + 1, -1);
                canvas.beginPath();
                canvas.moveTo(cx + x, lY);
                canvas.lineTo(cx + x + width, lY);
                canvas.stroke();
                l -= 2;
            }
        }
      
        if (hasBottomOverflow()) 
        {
            var l = 11;
            while (l <= maxNote.line)
            {
                var lY = cy + y + scoreRenderer.getScoreY(l + 1, -1);
                canvas.beginPath();
                canvas.moveTo(cx + x, lY);
                canvas.lineTo(cx + x + width, lY);
                canvas.stroke();
                l += 2;
            }
        }
		
        
        for (g in _infos)
		{
			g.glyph.paint(cx + x, cy + y, canvas);
		}
        

	}    
}