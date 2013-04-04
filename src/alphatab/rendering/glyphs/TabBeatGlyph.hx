package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.GraceType;
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.TabBarRenderer;

class TabBeatGlyph extends BeatGlyphBase
{
	private var _ties:Array<Glyph>;
	public var noteNumbers : TabNoteChordGlyph;

	public function new() 
	{
		super();
		_ties = new Array<Glyph>();
	}
    
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		super.paint(cx, cy, canvas);	
		for (t in _ties)
		{
			t.renderer = renderer;
			t.paint(cx, cy + y, canvas);
		}
	}
	
	public override function doLayout():Void 
	{
		// create glyphs
		if (!container.beat.isRest())
        {
			//
            // Note numbers
            //
            noteNumbers = new TabNoteChordGlyph();
            noteNumbers.beat = container.beat;
            noteLoop( function(n) {
                createNoteGlyph(n);
            });
            addGlyph(noteNumbers);			
		}

		
		// left to right layout
		var w = 0;
		for (g in _glyphs)
		{
			g.x = w;
			g.renderer = renderer;
			g.doLayout();
			w += g.width;
		}	
		width = w;
	} 
	
	private function createNoteGlyph(n:Note) 
    {
		var isGrace = container.beat.graceType != GraceType.None;
		var tr = cast(renderer, TabBarRenderer);
        var noteNumberGlyph:Glyph = new NoteNumberGlyph(0, 0, n, isGrace);    
		var l = n.beat.voice.bar.track.tuning.length - n.string + 1;
        noteNumberGlyph.y = tr.getTabY(l, -2);
        noteNumbers.addNoteGlyph(noteNumberGlyph, n);
		
		if (n.isHammerPullDestination && n.hammerPullOrigin != null)
		{
			var tie = new TabTieGlyph(n.hammerPullOrigin, n);
			_ties.push(tie);
		}
		else if (n.slideType == SlideType.Legato && n.slideTarget != null)
		{
			var tie = new TabTieGlyph(n, n.slideTarget);
			_ties.push(tie);
		}
		
		if (n.slideType != SlideType.None)
		{
			var l = new TabSlideLineGlyph(n.slideType, n);
			_ties.push(l);
		}		
    }	
}