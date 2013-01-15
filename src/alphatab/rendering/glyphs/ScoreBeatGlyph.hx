package alphatab.rendering.glyphs;
import alphatab.model.AccentuationType;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.HarmonicType;
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.ScoreBarRenderer;
import alphatab.rendering.utils.BeamingHelper;

class ScoreBeatGlyph extends BeatGlyphBase
					,implements ISupportsFinalize
{
	private var _ties:Array<Glyph>;

	public var noteHeads : ScoreNoteChordGlyph;
	public var restGlyph : RestGlyph;

	public var beamingHelper:BeamingHelper;

	public function new(b:Beat) 
	{
		super(b);
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
	
	public function finalizeGlyph(layout:ScoreLayout)
	{
		if (!beat.isRest()) 
		{
			noteHeads.updateBeamingHelper(x);
		}
	}
	
	public override function applyGlyphSpacing(spacing:Int):Dynamic 
	{
		super.applyGlyphSpacing(spacing);
		// TODO: we need to tell the beaming helper the position of rest beats
		if (!beat.isRest()) 
		{
			noteHeads.updateBeamingHelper(x);
		}
	}
		
	public override function doLayout():Void 
	{
		// create glyphs
		if (!beat.isRest())
        {		
			//
            // Note heads
            //
            noteHeads = new ScoreNoteChordGlyph();
            noteHeads.beat = beat;
            noteHeads.beamingHelper = beamingHelper;
            noteLoop( function(n) {
                createNoteGlyph(n);
            });
            addGlyph(noteHeads);			
			
            //
            // Note dots
            //
            for (i in 0 ... beat.dots)
            {
                var group = new GlyphGroup();
                noteLoop( function (n) {
                    createBeatDot(n, group);                    
                });
                addGlyph(group);
            }
		}
		else
		{
			var line = 0;
        
			switch(beat.duration)
			{
				case Whole:         
					line = 4;
				case Half:          
					line = 5;
				case Quarter:       
					line = 6;
				case Eighth:        
					line = 8;
				case Sixteenth:     
					line = 8;
				case ThirtySecond:  
					line = 8;
				case SixtyFourth:   
					line = 8;
			}
			
			var sr = cast(renderer, ScoreBarRenderer);
			var y = sr.getScoreY(line);

			addGlyph(new RestGlyph(0, y, beat.duration));
		}
		
		super.doLayout();
		if (noteHeads != null)
		{
			noteHeads.updateBeamingHelper(x);
		}
	}
	
    private function createBeatDot(n:Note, group:GlyphGroup)
    {			
		var sr = cast(renderer, ScoreBarRenderer);
        group.addGlyph(new CircleGlyph(0, sr.getScoreY(sr.getNoteLine(n), Std.int(2*getScale())), 1.5 * getScale()));
    }

	private function createNoteGlyph(n:Note) 
    {
		var sr = cast(renderer, ScoreBarRenderer);
        var noteHeadGlyph:Glyph;
		if (n.isDead) 
		{
            noteHeadGlyph = new DeadNoteHeadGlyph();
		}
        else if (n.harmonicType == HarmonicType.None)
        {
            noteHeadGlyph = new NoteHeadGlyph(n.beat.duration);
        }
        else
        {
            noteHeadGlyph = new DiamondNoteHeadGlyph();
        }
                
        // calculate y position
        var line = sr.getNoteLine(n);
        
        noteHeadGlyph.y = sr.getScoreY(line, -1);
        noteHeads.addNoteGlyph(noteHeadGlyph, n, line);
        
        if (n.isStaccato && !noteHeads.beatEffects.exists("STACCATO"))
        {
            noteHeads.beatEffects.set("STACCATO",  new CircleGlyph(0, 0, 1.5));
        }
        
        if (n.accentuated == AccentuationType.Normal && !noteHeads.beatEffects.exists("ACCENT"))
        {
            noteHeads.beatEffects.set("ACCENT",  new AccentuationGlyph(0, 0, AccentuationType.Normal));
        }
        if (n.accentuated == AccentuationType.Heavy && !noteHeads.beatEffects.exists("HACCENT"))
        {
            noteHeads.beatEffects.set("HACCENT",  new AccentuationGlyph(0, 0, AccentuationType.Heavy));
        }
		
		// create a tie if any effect requires it
		if (n.isTieDestination && n.tieOrigin != null) 
		{
			var tie = new ScoreTieGlyph(n.tieOrigin, n);
			_ties.push(tie);
		}
		else if (n.isHammerPullDestination && n.hammerPullOrigin != null)
		{
			var tie = new ScoreTieGlyph(n.hammerPullOrigin, n);
			_ties.push(tie);
		}
		else if (n.slideType == SlideType.Legato && n.slideTarget != null)
		{
			var tie = new ScoreTieGlyph(n, n.slideTarget);
			_ties.push(tie);
		}
		
		// TODO: depending on the type we have other positioning
		// we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
		if (n.slideType != SlideType.None)
		{
			var l = new ScoreSlideLineGlyph(n.slideType, n);
			_ties.push(l);
		}
    }
}