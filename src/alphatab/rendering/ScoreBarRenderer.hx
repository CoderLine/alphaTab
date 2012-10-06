/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.rendering;

import alphatab.model.AccentuationType;
import alphatab.model.Beat;
import alphatab.model.Clef;
import alphatab.model.Duration;
import alphatab.model.HarmonicType;
import alphatab.model.Note;
import alphatab.model.Voice;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.platform.svg.SvgCanvas;
import alphatab.rendering.glyphs.AccentuationGlyph;
import alphatab.rendering.glyphs.AccidentalGroupGlyph;
import alphatab.rendering.glyphs.BarNumberGlyph;
import alphatab.rendering.glyphs.BarSeperatorGlyph;
import alphatab.rendering.glyphs.BeamGlyph;
import alphatab.rendering.glyphs.CircleGlyph;
import alphatab.rendering.glyphs.ClefGlyph;
import alphatab.rendering.glyphs.DiamondNoteHeadGlyph;
import alphatab.rendering.glyphs.DummyTablatureGlyph;
import alphatab.rendering.glyphs.FlatGlyph;
import alphatab.rendering.glyphs.GlyphGroup;
import alphatab.rendering.glyphs.MusicFont;
import alphatab.rendering.glyphs.NaturalizeGlyph;
import alphatab.rendering.glyphs.NoteChordGlyph;
import alphatab.rendering.glyphs.NoteHeadGlyph;
import alphatab.rendering.glyphs.NumberGlyph;
import alphatab.rendering.glyphs.RepeatCloseGlyph;
import alphatab.rendering.glyphs.RepeatCountGlyph;
import alphatab.rendering.glyphs.RepeatOpenGlyph;
import alphatab.rendering.glyphs.RestGlyph;
import alphatab.rendering.glyphs.ScoreBeatGlyph;
import alphatab.rendering.glyphs.ScoreTieGlyph;
import alphatab.rendering.glyphs.SharpGlyph;
import alphatab.rendering.glyphs.SpacingGlyph;
import alphatab.rendering.glyphs.SvgGlyph;
import alphatab.rendering.glyphs.TimeSignatureGlyph;
import alphatab.rendering.utils.AccidentalHelper;
import alphatab.rendering.utils.BeamingHelper;

using alphatab.model.ModelUtils;

/**
 * This BarRenderer renders a bar using standard music notation. 
 */
class ScoreBarRenderer extends GroupedBarRenderer
{
    /**
     * We always have 7 steps per octave. 
     * (by a step the offsets inbetween score lines is meant, 
     *      0 steps is on the first line (counting from top)
     *      1 steps is on the space inbetween the first and the second line
     */
    private static inline var STEPS_PER_OCTAVE = 7;
    
    /**
     * Those are the amount of steps for the different clefs in case of a note value 0
     * [C3, C4, F4, G2]
     */
    private static var OCTAVE_STEPS = [32, 30, 26, 38];
    
    /**
     * The step offsets of the notes within an octave in case of for sharp keysignatures
     */
    private static var SHARP_NOTE_STEPS:Array<Int> = [ 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6 ];

    /**
     * The step offsets of the notes within an octave in case of for flat keysignatures
     */
    private static var FLAT_NOTE_STEPS:Array<Int>  = [ 0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6 ];
    
    /**
     * The step offsets of sharp symbols for sharp key signatures.
     */
    private static var SHARP_KS_STEPS:Array<Int> = [ 1, 4, 0, 3, 6, 2, 5 ];
    
    /**
     * The step offsets of sharp symbols for flat key signatures.
     */
    private static var FLAT_KS_STEPS:Array<Int> = [ 5, 2, 6, 3, 7, 4, 8 ];

	
	private static inline var LineSpacing = 8;
    public var accidentalHelper:AccidentalHelper;
    private var _beamHelpers:Array<BeamingHelper>;
	
	private var _beatPosition : IntHash<ScoreBeatGlyph>;
    
    private var _currentBeamHelper:BeamingHelper;
    
    
	public function new(bar:alphatab.model.Bar) 
	{
		super(bar);
        accidentalHelper = new AccidentalHelper();
        _beamHelpers = new Array<BeamingHelper>();
		_beatPosition = new IntHash<ScoreBeatGlyph>();
	}
	
	public function getBeatDirection(beat:Beat) : BeamDirection
	{
		if (_beatPosition.exists(beat.index)) 
		{
			var g = _beatPosition.get(beat.index);
			return g.noteHeads.getDirection();
		}
		return BeamDirection.Up;
	}		
	
	public function getNoteX(note:Note, onEnd:Bool=true) 
	{
		if (_beatPosition.exists(note.beat.index)) 
		{
			var beat = _beatPosition.get(note.beat.index);
			return beat.noteHeads.getNoteX(note, onEnd);
		}
		return 0;
	}	
	
	public function getNoteY(note:Note) 
	{
		if (_beatPosition.exists(note.beat.index)) 
		{
			var beat = _beatPosition.get(note.beat.index);
			return beat.noteHeads.getNoteY(note);
		}
		return 0;
	}
	
	public override function getTopPadding():Int 
	{
		return getGlyphOverflow();
	}	
	
	public override function getBottomPadding():Int 
	{
		return getGlyphOverflow();
	}
	
	private inline function getLineOffset()
	{
		return ((LineSpacing + 1) * getLayout().renderer.scale);
	}
	
	public override function doLayout()
	{
		super.doLayout();
		height = Std.int(getLineOffset() * 4) + getTopPadding() + getBottomPadding();
		if (index == 0)
		{
			stave.registerStaveTop(getGlyphOverflow());
			stave.registerStaveBottom(height - getGlyphOverflow());
		}
        
        var top = getScoreY(0);
        var bottom = getScoreY(8);
        
        for (h in _beamHelpers)
        {
            //
            // max note (highest) -> top overflow
            // 
            var maxNoteY = getScoreY(getNoteLine(h.maxNote));
            if (h.getDirection() == Up)
            {
                maxNoteY -= getStemSize(h.maxDuration);
            }
                        
            if (maxNoteY < top)
            {
                registerOverflowTop(Std.int(Math.abs(maxNoteY)));
            }
                
            //
            // min note (lowest) -> bottom overflow
            //
            var minNoteY = getScoreY(getNoteLine(h.minNote));
            if (h.getDirection() == Down)
            {
                minNoteY += getStemSize(h.maxDuration);
            }
                        
            if (minNoteY > bottom)
            {
                registerOverflowBottom(Std.int(Math.abs(minNoteY)) - bottom);
            }
            
        }
	}
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        super.paint(cx, cy, canvas);
        paintBeams(cx, cy, canvas);
    }
	
    private function paintBeams(cx:Int, cy:Int, canvas:ICanvas):Void
    {
        for (h in _beamHelpers)
        {
            // paint beams
            paintBeamHelper(cx, cy, canvas, h);
        }
    }
    
    private function paintBeamHelper(cx:Int, cy:Int, canvas:ICanvas, h:BeamingHelper):Void
    {
        // check if we need to paint simple footer
        if (h.beats.length == 1)
        {
            paintFooter(cx, cy, canvas, h);
        }
        else
        {
            paintBar(cx, cy, canvas, h);
        }
    }
    
    private function getStemSize(duration:Duration)
    {
        var size:Int;
        switch(duration)
        {
            case Half:          size = 6;
            case Quarter:       size = 6;
            case Eighth:        size = 6;
            case Sixteenth:     size = 6;    
            case ThirtySecond:  size = 7;
            case SixtyFourth:   size = 8;
            default: size = 0;
        }
        
        return getScoreY(size);
    }
    
    private function calculateBeamY(h:BeamingHelper, x:Int)
    {
        var correction = Std.int((NoteHeadGlyph.noteHeadHeight / 2));
        var stemSize = getStemSize(h.maxDuration);
        return h.calculateBeamY(stemSize, Std.int(getScale()), x, getScale(), function(n) {
            return getScoreY(getNoteLine(n), correction - 1);
        });
    }
    
    private function paintBar(cx:Int, cy:Int, canvas:ICanvas, h:BeamingHelper)
    {
        for (i in 0 ... h.beats.length)
        {
            var beat = h.beats[i];
            
            var correction = Std.int((NoteHeadGlyph.noteHeadHeight / 2));
                        
            //
            // draw line 
            //
            var beatLineX = Std.int(h.getBeatLineX(beat) + getScale());

            var direction = h.getDirection();
            
            var y1 = cy + y + (direction == Up 
                        ? getScoreY(getNoteLine(beat.minNote), correction - 1)
                        : getScoreY(getNoteLine(beat.maxNote), correction - 1));
                        
            var y2 = cy + y + calculateBeamY(h, beatLineX);
            
            canvas.setColor(getLayout().renderer.renderingResources.mainGlyphColor);
            canvas.beginPath();
            canvas.moveTo(Std.int(cx + x + beatLineX), y1);
            canvas.lineTo(Std.int(cx + x + beatLineX), y2);
            canvas.stroke();
            
            var brokenBarOffset = Std.int(6 * getScale());
            var barSpacing = Std.int(6 * getScale());
            var barSize = Std.int(3 * getScale());
            var barCount = beat.duration.getDurationIndex() - 2;
            var barStart = cy + y;
            if (direction == Down)
            {
                barSpacing = -barSpacing;
            }
            
            for (barIndex in 0 ... barCount)
            {
                var barStartX:Int;
                var barEndX:Int;
                
                var barStartY:Int;
                var barEndY:Int;
                
                var barY = barStart + (barIndex * barSpacing);
                
                // 
                // Bar to Next?
                //
                if (i < h.beats.length - 1)
                {
                    // full bar?
                    if (isFullBarJoin(beat, h.beats[i + 1], barIndex))
                    {
                        barStartX = beatLineX;
                        barEndX = Std.int(h.getBeatLineX(h.beats[i+1]) + getScale());
                    }
                    // broken bar?
                    else if(i == 0 || !isFullBarJoin(h.beats[i-1], beat, barIndex))
                    {
                        barStartX = beatLineX;
                        barEndX = barStartX + brokenBarOffset;
                    }
                    else
                    {
                        continue;
                    }
                    barStartY = Std.int(barY + calculateBeamY(h,barStartX));
                    barEndY = Std.int(barY + calculateBeamY(h,barEndX));
                    paintSingleBar(canvas, cx + x + barStartX, barStartY, cx + x + barEndX, barEndY, barSize);
                }
                // 
                // Broken Bar to Previous?
                //
                else if (i > 0 && !isFullBarJoin(beat, h.beats[i - 1], barIndex))
                {
                    barStartX = beatLineX - brokenBarOffset;
                    barEndX = beatLineX;
                    
                    barStartY = Std.int(barY + calculateBeamY(h,barStartX));
                    barEndY = Std.int(barY + calculateBeamY(h,barEndX));
                    
                    paintSingleBar(canvas, cx + x + barStartX, barStartY, cx + x + barEndX, barEndY, barSize);
                }                
            }
        }
    }
    
    private function isFullBarJoin(a:Beat, b:Beat, barIndex:Int)
    {
        return (a.duration.getDurationIndex() - 2 - barIndex > 0) 
            && (b.duration.getDurationIndex() - 2 - barIndex > 0);
    }
    
    private static function paintSingleBar(canvas:ICanvas, x1:Int, y1:Int, x2:Int, y2:Int, size:Int ) : Void
    {
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.lineTo(x2, y2 - size);
        canvas.lineTo(x1, y1 - size);
        canvas.closePath();
        canvas.fill();
    }

    private function paintFooter(cx:Int, cy:Int, canvas:ICanvas, h:BeamingHelper)
    {
        var beat = h.beats[0];
        
        //
        // draw line 
        //
        
        var stemSize = getStemSize(h.maxDuration);
 
        var correction = Std.int((NoteHeadGlyph.noteHeadHeight / 2));
        var beatLineX = Std.int(h.getBeatLineX(beat) + getScale());

        var direction = h.getDirection();
        
        var topY = getScoreY(getNoteLine(beat.maxNote), correction);
        var bottomY = getScoreY(getNoteLine(beat.minNote), correction);

        var beamY:Int;
        if (direction == Down)
        {
           bottomY += stemSize;
           beamY = bottomY;
        }
        else
        {
           topY -= stemSize;
           beamY = topY;
        }

        canvas.setColor(getLayout().renderer.renderingResources.mainGlyphColor);
        canvas.beginPath();
        canvas.moveTo(Std.int(cx + x + beatLineX), cy + y + topY);
        canvas.lineTo(Std.int(cx + x + beatLineX), cy + y + bottomY);
        canvas.stroke();
        
        //
        // Draw beam 
        //
        var gx = Std.int(beatLineX);
        var glyph = new BeamGlyph(gx, beamY, beat.duration, direction);
		glyph.renderer = this;
		glyph.doLayout();
        glyph.paint(cx + x, cy + y, canvas);
    }
	
	private override function createPreBeatGlyphs():Dynamic 
	{
		createBarStartGlyphs();
		
		createStartGlyphs();
				
		if (_bar.isEmpty())
		{
			addPreBeatGlyph(new SpacingGlyph(0, 0, Std.int(30 * getScale())));
		}
	}

	private override function createBeatGlyphs():Void 
	{
        // TODO: Render all voices
        createVoiceGlyphs(_bar.voices[0]);
	}
	
	private override function createPostBeatGlyphs():Dynamic 
	{
		createBarEndGlyphs();
	}
	
	private var _startSpacing:Bool;
	
	private function createStartSpacing()
	{
		if (_startSpacing) return;
		addPreBeatGlyph(new SpacingGlyph(0, 0, Std.int(2 * getScale())));
		_startSpacing = true;
	}
	
	private function createBarStartGlyphs()
	{
		if (_bar.getMasterBar().isRepeatStart)
		{
			addPreBeatGlyph(new RepeatOpenGlyph(0, 0, 1.5, 3));
		}
	}	
	
	private function createBarEndGlyphs()
	{
		if (_bar.getMasterBar().isRepeatEnd())
		{
			addPostBeatGlyph(new RepeatCloseGlyph(x, 0));
			if (_bar.getMasterBar().repeatCount > 1)
			{
                var line = isLast() || isLastOfLine() ? -1 : -4;
				addPostBeatGlyph(new RepeatCountGlyph(0, getScoreY(line, -3), _bar.getMasterBar().repeatCount + 1));
			}
        }
		else if (_bar.getMasterBar().isDoubleBar)
		{
			addPostBeatGlyph(new BarSeperatorGlyph());
			addPostBeatGlyph(new SpacingGlyph(0, 0, Std.int(3 * getScale()), false));
			addPostBeatGlyph(new BarSeperatorGlyph());
		}		
		else if(_bar.nextBar == null || !_bar.nextBar.getMasterBar().isRepeatStart)
		{
			addPostBeatGlyph(new BarSeperatorGlyph(0,0,isLast()));
		}
	}
	
	private function createStartGlyphs()
	{
		// Clef
		if (isFirstOfLine() || _bar.clef != _bar.previousBar.clef)
		{
			var offset = 0;
			switch(_bar.clef)
			{
				case F4: offset = 4;
                case C3: offset = 6; 
				case C4: offset = 4;
				case G2: offset = 6; 
				default: offset = 0;
			}
			createStartSpacing();
			addPreBeatGlyph(new ClefGlyph(0, getScoreY(offset), _bar.clef));
		}
		
		// Key signature
		if ( (_bar.previousBar == null && _bar.getMasterBar().keySignature != 0)
			|| (_bar.previousBar != null && _bar.getMasterBar().keySignature != _bar.previousBar.getMasterBar().keySignature))
		{
			createStartSpacing();
			createKeySignatureGlyphs();
		}
		
		// Time Signature
		if(  (_bar.previousBar == null)
			|| (_bar.previousBar != null && _bar.getMasterBar().timeSignatureNumerator != _bar.previousBar.getMasterBar().timeSignatureNumerator)
			|| (_bar.previousBar != null && _bar.getMasterBar().timeSignatureDenominator != _bar.previousBar.getMasterBar().timeSignatureDenominator)
			)
		{
			createStartSpacing();
			createTimeSignatureGlyphs();
		}
		
		if (stave.index == 0)
		{
			addPreBeatGlyph(new BarNumberGlyph(0,getScoreY(-1, -3),_bar.index + 1));
		}
        else
        {
            addPreBeatGlyph(new SpacingGlyph(0, 0, Std.int(8 * getScale())));
        }
	}
	
	private function createKeySignatureGlyphs()
	{
		var offsetClef:Int  = 0;
		var currentKey:Int  = _bar.getMasterBar().keySignature;
        var previousKey:Int  = _bar.previousBar == null ? 0 : _bar.previousBar.getMasterBar().keySignature;
		
        switch (_bar.clef)
        {
            case Clef.G2:
                offsetClef = 0;
            case Clef.F4:
                offsetClef = 2;
            case Clef.C3:
                offsetClef = -1;
            case Clef.C4:
                offsetClef = 1;
        }
		
		// naturalize previous key
        // TODO: only naturalize the symbols needed 
        var naturalizeSymbols:Int = Std.int(Math.abs(previousKey));
        var previousKeyPositions:Array<Int> = previousKey.keySignatureIsSharp() ? SHARP_KS_STEPS : FLAT_KS_STEPS;

		for (i in 0 ... naturalizeSymbols)
        {
			addPreBeatGlyph(new NaturalizeGlyph(0, Std.int(getScoreY(previousKeyPositions[i] + offsetClef))));
        }
		
		// how many symbols do we need to get from a C-keysignature
        // to the new one
        var offsetSymbols:Int = (currentKey <= 7) ? currentKey : currentKey - 7;
        // a sharp keysignature
        if (currentKey.keySignatureIsSharp())
        {  
            for (i in 0 ... Std.int(Math.abs(currentKey)))
            {
				addPreBeatGlyph(new SharpGlyph(0, Std.int(getScoreY(SHARP_KS_STEPS[i] + offsetClef))));
            }
        }
        // a flat signature
        else 
        {
            for (i in 0 ... Std.int(Math.abs(currentKey)))
            {
				addPreBeatGlyph(new FlatGlyph(0, Std.int(getScoreY(FLAT_KS_STEPS[i] + offsetClef))));
            }
        }		
	}
    
	private function createTimeSignatureGlyphs()
	{
		addPreBeatGlyph(new SpacingGlyph(0,0, Std.int(5 * getScale())));
		addPreBeatGlyph(new TimeSignatureGlyph(0, 0, _bar.getMasterBar().timeSignatureNumerator, _bar.getMasterBar().timeSignatureDenominator));
	}
    
    private function createVoiceGlyphs(v:Voice)
    {
        for (b in v.beats)
        {
            if (!b.isRest())
            {
                // try to fit beam to current beamhelper
                if (_currentBeamHelper == null || !_currentBeamHelper.checkBeat(b))
                {
                    // if not possible, create the next beaming helper
                    _currentBeamHelper = new BeamingHelper();
                    _currentBeamHelper.checkBeat(b);
                    _beamHelpers.push(_currentBeamHelper);
                }
            }
			
			var g = new ScoreBeatGlyph(b);
			g.beamingHelper = _currentBeamHelper;
			_beatPosition.set(b.index, g);
			addBeatGlyph(g); 
        }
        
        _currentBeamHelper = null;
    }
    
    public override function applyBarSpacing(spacing:Int):Void 
    {
        super.applyBarSpacing(spacing);
    }
	
    // TODO[performance]: Maybe we should cache this (check profiler)
    public function getNoteLine(n:Note) : Int
    {
        var ks = n.beat.voice.bar.getMasterBar().keySignature;
        var clef = n.beat.voice.bar.clef;
        
        var value = n.realValue();
        
        var index = value % 12;             
        var octave = Std.int(value / 12);
        
        // Initial Position
        var steps = OCTAVE_STEPS[clef.getClefIndex()];
        
        // Move to Octave
        steps -= (octave * STEPS_PER_OCTAVE);
        
        // Add offset for note itself
        steps -= ks.keySignatureIsSharp() || ks.keySignatureIsNatural()
                     ? SHARP_NOTE_STEPS[index]
                     : FLAT_NOTE_STEPS[index];

        // TODO: It seems note heads are always one step above the calculated line 
        // maybe the SVG paths are wrong, need to recheck where step=0 is really placed
        return steps + NOTE_STEP_CORRECTION;
    }
    public static inline var NOTE_STEP_CORRECTION = 1;
    
 
	/**
	 * Gets the relative y position of the given steps relative to first line. 
	 * @param steps the amount of steps while 2 steps are one line
	 */
	public function getScoreY(steps:Int, correction:Int = 0) : Int
	{
		return Std.int(((getLineOffset() / 2) * steps) + (correction * getScale()));
	}
	
	/**
	 * gets the padding needed to place glyphs within the bounding box
	 */
	private function getGlyphOverflow()
	{
		var res = getResources();
		return Std.int((res.tablatureFont.getSize() / 2) + (res.tablatureFont.getSize() * 0.2));
	}

	public override function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
	{
		var res = getResources();

		//
		// draw string lines
		//
		canvas.setColor(res.staveLineColor);
		var lineY = cy + y + getGlyphOverflow();
		
		var startY = lineY;
		for (i in 0 ... 5)
		{
			if (i > 0) lineY += Std.int(getLineOffset());
			canvas.beginPath();
			canvas.moveTo(cx + x, lineY);
			canvas.lineTo(cx + x + width, lineY);
			canvas.stroke();
		}
	}
}