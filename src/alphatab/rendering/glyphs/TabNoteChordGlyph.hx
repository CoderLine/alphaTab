package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.TextBaseline;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.TabBarRenderer;
import haxe.ds.IntMap;
import haxe.ds.StringMap;

class TabNoteChordGlyph extends Glyph
{
	private var _notes:Array<Glyph>;
	private var _noteLookup:IntMap<Glyph>;
    private var _maxNote:Note;
    
    public var beat:Beat;
    public var beatEffects:StringMap<Glyph>;
    
	public function new(x:Int = 0, y:Int = 0) 
	{
		super(x, y);
		_notes = new Array<Glyph>();
        beatEffects = new StringMap<Glyph>();
		_noteLookup = new IntMap<Glyph>();
	}
	
	public function getNoteX(note:Note, onEnd:Bool = true) 
	{
		if (_noteLookup.exists(note.string)) 
		{
			var n = _noteLookup.get(note.string);
			var pos = x + n.x + Std.int(NoteNumberGlyph.Padding * getScale());
			if (onEnd) 
			{
				pos += n.width;
			}
			return pos;
		}
		return 0;
	}
	
	public function getNoteY(note:Note) 
	{
		if (_noteLookup.exists(note.string)) 
		{
			return y + _noteLookup.get(note.string).y;
		}
		return 0;
	}
	
	public override function doLayout():Void 
	{
		var w = 0;
		for (g in _notes)
		{
			g.renderer = renderer;
			g.doLayout();
			if (g.width > w)
			{
				w = g.width;
			}
		}
        
        for (e in beatEffects)
        {
            e.renderer = renderer;
            e.doLayout();
        }
        
		width = w;
	}
	
	public function addNoteGlyph(noteGlyph:Glyph, note:Note)
    {
		_notes.push(noteGlyph);
		_noteLookup.set(note.string, noteGlyph);
        if (_maxNote == null || note.string > _maxNote.string) _maxNote = note;
    }	
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var old = canvas.getTextBaseline();
		canvas.setTextBaseline(TextBaseline.Middle);
		for (g in _notes)
		{
			g.renderer = renderer;
			g.paint(cx + x, cy + y, canvas);
		}
		canvas.setTextBaseline(old);
        
        var tabRenderer:TabBarRenderer = cast renderer;
        var tabHeight = renderer.getResources().tablatureFont.getSize();
        var effectY = Std.int(tabRenderer.getNoteY(_maxNote) + tabHeight);
         // TODO: take care of actual glyph height
        var effectSpacing:Int = Std.int(7 * getScale());
        for (g in beatEffects)
        {
            g.y = effectY;
            g.x = Std.int(width / 2);
            g.paint(cx + x, cy + y, canvas);
            effectY += effectSpacing;
        }
	}
}