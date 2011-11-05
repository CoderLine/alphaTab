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
package alphatab.tablature.model;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Measure;
import alphatab.model.MeasureHeader;
import alphatab.model.TripletFeel;
import alphatab.model.VoiceDirection;
import alphatab.tablature.staves.StaveLine;
import alphatab.tablature.ViewLayout;

/**
 * This measure implements layouting functionalities for later drawing on staves.
 * It layouts elements like keysignatures and timesignatures
 */
class MeasureDrawing extends Measure
{    
    public static var ACCIDENTAL_SHARP_NOTES:Array<Int> = [ 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6 ];
    public static var ACCIDENTAL_FLAT_NOTES:Array<Int> = [ 0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6 ];
    // stores which notes in an octave get an accidental
    public static var ACCIDENTAL_NOTES:Array<Bool> = [ false, true, false, true, false, false,
                                                       true, false, true, false, true, false];
                                                       
    public static inline var NONE = 0;
    public static inline var NATURAL = 1;
    public static inline var SHARP = 2;
    public static inline var FLAT = 3;

                                                       
    // Stores for all key signatures which note will get what accidental        
    // TODO: find out if this can be calculated instead of this table
    public static var ACCIDENTALS:Array<Array<Int>> = [
        /*//------------NATURAL------------------------------------
        [NONE, SHARP, NONE, SHARP, NONE, NONE, SHARP, NONE, SHARP, NONE, SHARP, NONE, NONE ], // NATURAL
        //------------SHARPS------------------------------------
        [NONE, SHARP, NONE, SHARP, NONE, NATURAL, SHARP, NONE, SHARP, NONE, SHARP, NONE, NONE ], // 1 SHARP
        [NATURAL, SHARP, NONE, SHARP, NONE, NATURAL, SHARP, NONE, SHARP, NONE, SHARP, NONE, NATURAL ], // 2 SHARPS
        [NATURAL, SHARP, NONE, SHARP, NONE, NATURAL, SHARP, NATURAL, NONE, NONE, SHARP, NONE, NATURAL ], // 3 SHARPS
        [NATURAL, SHARP, NATURAL, SHARP, NONE, NATURAL, SHARP, NATURAL, NONE, NONE, SHARP, NONE, NATURAL ], // 4 SHARPS
        [NATURAL, SHARP, NATURAL, SHARP, NONE, NATURAL, SHARP, NATURAL, NONE, NATURAL, SHARP, NONE, NATURAL ], // 5 SHARPS
        [NATURAL, SHARP, NATURAL, SHARP, NATURAL, NATURAL, SHARP, NATURAL, NONE, NATURAL, SHARP, NONE, NATURAL ], // 6 SHARPS
        [NATURAL, SHARP, NATURAL, SHARP, NATURAL, NATURAL, SHARP, NATURAL, NONE, NATURAL, SHARP, NATURAL, NATURAL ], // 7 SHARPS
        //------------FLATS------------------------------------
        [NONE, FLAT, NATURAL, FLAT, NONE, NONE, FLAT, NATURAL, FLAT, NATURAL, NONE, NATURAL, NONE ], // 1 FLAT
        [NONE, FLAT, NATURAL, NONE, NATURAL, NONE, FLAT, NATURAL, FLAT, NATURAL, NONE, NATURAL, NONE ], // 2 FLATS
        [NONE, FLAT, NATURAL, NONE, NATURAL, NONE, FLAT, NATURAL, NONE, NATURAL, NONE, NATURAL, NONE ], // 3 FLATS
        [NONE, NONE, NATURAL, NONE, NATURAL, NONE, FLAT, NATURAL, NONE, NATURAL, NONE, NATURAL, NONE ], // 4 FLATS
        [NONE, NONE, NATURAL, NONE, NATURAL, NONE, NONE, NATURAL, NONE, NATURAL, NONE, NATURAL, NONE ], // 5 FLATS
        [NATURAL, NONE, NATURAL, NONE, NATURAL, NONE, NONE, NATURAL, NONE, NATURAL, NONE, NATURAL, NATURAL ], // 6 FLATS
        [NATURAL, NONE, NATURAL, NONE, NATURAL, NATURAL, NONE, NATURAL, NONE, NATURAL, NONE, NATURAL, NATURAL ] // 7 FLATS        */
        //------------NATURAL------------------------------------
        [NATURAL, NATURAL, NATURAL, NATURAL, NATURAL, NATURAL, NATURAL], // NATURAL
        //------------SHARPS------------------------------------
        [NATURAL, NATURAL, NATURAL, SHARP, NATURAL, NATURAL, NATURAL], // 1 SHARP
        [SHARP, NATURAL, NATURAL, SHARP, NATURAL, NATURAL, NATURAL], // 2 SHARPS
        [SHARP, NATURAL, NATURAL, SHARP, SHARP, NATURAL, NATURAL], // 3 SHARPS
        [SHARP, SHARP, NATURAL, SHARP, SHARP, NATURAL, NATURAL], // 4 SHARPS
        [SHARP, SHARP, NATURAL, SHARP, SHARP, SHARP, NATURAL], // 5 SHARPS
        [SHARP, SHARP, SHARP, SHARP, SHARP, SHARP, NATURAL], // 6 SHARPS
        [SHARP, SHARP, SHARP, SHARP, SHARP, SHARP, SHARP], // 7 SHARPS
        //------------FLATS------------------------------------
        [NATURAL, NATURAL, NATURAL, NATURAL, NATURAL, NATURAL, FLAT], // 1 FLAT
        [NATURAL, NATURAL, FLAT, NATURAL, NATURAL, NATURAL, FLAT], // 2 FLATS
        [NATURAL, NATURAL, FLAT, NATURAL, NATURAL, FLAT, FLAT], // 3 FLATS
        [NATURAL, FLAT, FLAT, NATURAL, NATURAL, FLAT, FLAT], // 4 FLATS
        [NATURAL, FLAT, FLAT, NATURAL, FLAT, FLAT, FLAT], // 5 FLATS
        [FLAT, FLAT, FLAT, NATURAL, FLAT, FLAT, FLAT], // 6 FLATS
        [FLAT, FLAT, FLAT, FLAT, FLAT, FLAT, FLAT] // 7 FLATS        
    ];
    
    private static inline var CLEF_OFFSET = 40;
    private static inline var TIME_SIGNATURE_SPACING:Int = 30;
    private static inline var LEFT_SPACING:Int = 10;
    private static inline var RIGHT_SPACING:Int = 10;
    
    // cache for storing which effects are available in this measure
    public var effectsCache(default,default):EffectsCache;
    
    // the width of the measure within the ui
    public var width(default,default):Int;
    // the x position of the measure within the StaveLine 
    public var x(default,default):Int;
    // additional space for the measure 
    // used by layout managers to ensure a fixed with if needed
    public var spacing(default,default):Int;
    
    // a boolean flag indicating whether the measure is the first one
    // within the current StaveLine
    public function isFirstOfLine():Bool
    {
        return staveLine.measures.length == 0 || // no measures in this line yet. this instance will become the first
            staveLine.measures[0] == header.number - 1; // if there are any measures yet, check if we are first
    }
    
    private var _nextMeasure:MeasureDrawing;
    private var _prevMeasure:MeasureDrawing;
    
    // this is the lowest group which has the direction down
    public var minDownGroup(default,default):BeatGroup;
    // this is the hightest group which has the direction up
    public var maxUpGroup(default,default):BeatGroup;
    
    public var staveLine(default,default):StaveLine;
    
    // all registered accidentals for further clearing
    private var _registeredAccidentals:Array<Array<Bool>>;

#if cpp
    public function headerDrawing() : MeasureHeaderDrawing
#else
    public inline function headerDrawing() : MeasureHeaderDrawing
#end
    {
        return cast header;
    }


    public var minNote(default,default):NoteDrawing;
    public var maxNote(default,default):NoteDrawing;   
    public var divisionLength(default,default):Int;
    public var groups(default,default):Array<BeatGroup>;
    
    public function checkNote(note:NoteDrawing)
    {        
        if (minNote == null || minNote.realValue() > note.realValue())
        {
            minNote = note;
        }
        if (maxNote == null || maxNote.realValue() < note.realValue())
        {
            maxNote = note;
        }
    }

    public function new(header:MeasureHeader)
    {
        super(header);
        effectsCache = new EffectsCache();
        _registeredAccidentals = new Array<Array<Bool>>();
        for (i in 0 ... 11)
        {
            var a:Array<Bool> = new Array<Bool>();
            for (j in 0 ... 7)
            {
                a.push(false);
            }
            _registeredAccidentals.push(a);
        }
        _defaultSpacings = -1;
    }
    
    public function getNoteAccitental(noteValue:Int)
    {
        if (noteValue >= 0 && noteValue < 128)
        {
            var key:Int = keySignature();
            var note:Int = (noteValue % 12);
            var octave:Int = Math.floor(noteValue / 12);
            var accidentalValue:Int = (key <= 7 ? SHARP : FLAT);
            var accidentalNotes:Array<Int> = (key <= 7 ? ACCIDENTAL_SHARP_NOTES : ACCIDENTAL_FLAT_NOTES);
            var isAccidentalNote:Bool = ACCIDENTAL_NOTES[note];
            var isAccidentalKey:Bool = ACCIDENTALS[key][accidentalNotes[note]] == accidentalValue;

            if (isAccidentalKey != isAccidentalNote && !_registeredAccidentals[octave][accidentalNotes[note]])
            {
                _registeredAccidentals[octave][accidentalNotes[note]] = true;
                return (isAccidentalNote ? accidentalValue : NATURAL);
            }

            if (isAccidentalKey == isAccidentalNote && _registeredAccidentals[octave][accidentalNotes[note]])
            {
                _registeredAccidentals[octave][accidentalNotes[note]] = false;
                return (isAccidentalNote ? accidentalValue : NATURAL);
            }
        }
        return NONE;        
    }
    
    public function setSpacing(spacing:Int)
    {
        this.spacing = spacing;
        // reposition beats
        var beatX = 0;
        for (beat in beats)
        {
            var bd:BeatDrawing = cast beat;
            bd.x = beatX;
            beatX += bd.fullWidth();
        }
    }
    
    private function clearRegisteredAccidentals() : Void
    {
        for (i in 0 ... 11)
        {
            for (n in 0 ... 7)
            {
                _registeredAccidentals[i][n] = false;
            }
        }
    }
    
    // calculates the layout for this measure
    public function performLayout(layout:ViewLayout) : Void
    {       
        groups = new Array<BeatGroup>();
        width = 0;
        spacing = 0;
        effectsCache.reset();
        
        registerSpacings(layout);
        
        // default spacing on start
        width += getDefaultSpacings(layout, true);         
         
        // do beat layouting
        var beatX = 0;
        for (i in 0 ... beatCount()) 
        {
            var beat:BeatDrawing = cast beats[i];
            beat.x = beatX;
            beat.performLayout(layout);
            
            beatX += beat.width;
            effectsCache.fingering = cast Math.max(effectsCache.fingering, beat.effectsCache.fingering);
        }
        
        divisionLength = calculateDivisionLength();
        
        // after layouting check for min and max groups
        minDownGroup = null;
        maxUpGroup = null;
        for (group in groups)
        {
            var direction = group.getDirection();
            if (direction == VoiceDirection.Down)
            {
                // do we have a smaller minNote within this group?
                if (minDownGroup == null || minDownGroup.minNote.realValue() > group.minNote.realValue())
                {
                    minDownGroup = group;
                }
            }
            else
            {
                // do we have a bigger maxNote within this group?
                if (maxUpGroup == null || maxUpGroup.maxNote.realValue() < group.maxNote.realValue())
                {
                    maxUpGroup = group;
                }
            }
        }
        
        width += beatX;
    }
    
    public function getPreviousMeasure() 
    {
        if (_prevMeasure == null) // initialize
        {
            _prevMeasure = number() > 1 ? cast track.measures[number() - 2] : null;
        }
        return _prevMeasure;
    }
    
    public function getNextMeasure() 
    {
        if (_nextMeasure == null) // initialize
        {
            _nextMeasure = number() < track.measures.length ? cast track.measures[number()] : null;
        }
        return _nextMeasure;
    }
    
    private function calculateDivisionLength()
    {
        var defaultLenght:Int = Duration.QUARTER_TIME;
        var denominator:Int = header.timeSignature.denominator.value;
        switch (denominator)
        {
            case Duration.EIGHTH:
                if (header.timeSignature.numerator % 3 == 0)
                    defaultLenght += Math.floor(Duration.QUARTER_TIME / 2);
        }
        return defaultLenght;
    }
    
    public function getRealStart(currentStart:Int) : Int
    {
        var beatLength:Int = divisionLength;
        var start:Int = currentStart;
        var startBeat:Bool = start % beatLength == 0;
        if (!startBeat)
        {
            /*var minDuration:Duration = new Duration();;
            minDuration.value = Duration.SIXTY_FOURTH;
            minDuration.tuplet.enters = 3;
            minDuration.tuplet.times = 2;
            var time : Int = minDuration.time();*/
            var time : Int = Duration.MIN_TIME;
            for (i in 0 ... time)
            {
                start++;
                startBeat = start % beatLength == 0;
                if (startBeat)
                    break;
            }
            if (!startBeat)
                start = currentStart;
        }
        return start;
    }
    
    private function registerSpacings(layout:ViewLayout)
    {
        if (getPreviousMeasure() == null || getPreviousMeasure().header.tempo.value != header.tempo.value)
        {
            effectsCache.tempo = true;
        }
        if ( (getPreviousMeasure() == null && header.tripletFeel != TripletFeel.None) 
            || (getPreviousMeasure() != null && getPreviousMeasure().header.tripletFeel != header.tripletFeel))
        {
            effectsCache.tripletFeel = true;
        }
        if (hasMarker())
        {
            effectsCache.marker = true;
        }
    }
    
    private var _defaultSpacings:Int;
    public function getDefaultSpacings(layout:ViewLayout, update:Bool=false) : Int
    {
        if (_defaultSpacings >= 0 && !update) return _defaultSpacings;
        var w:Float = 0;

        // clef
        w += calculateClefSpacing(layout); 
               
        // key signature 
        w += calculateKeySignatureSpacing(layout); 
        
        // time signature
        w += calculateTimeSignatureSpacing(layout);
        
        // repeat?
        w += repeatClose() > 0 ? 20 * layout.scale : 0;
        
        // left and right spacings
        w += LEFT_SPACING * layout.scale;
        w += RIGHT_SPACING * layout.scale;
        
        _defaultSpacings = cast w;
        return _defaultSpacings;
    }
    
    public function getSizingFactor()
    {
        var beatBoundsWidth = width - _defaultSpacings;
        return (beatBoundsWidth + spacing) / beatBoundsWidth;
    }
    
    public function shouldPaintClef() 
    {
        return getPreviousMeasure() == null || getPreviousMeasure().clef != clef || isFirstOfLine();
    }
        
    // the space required for drawing the clef
    public function calculateClefSpacing(layout:ViewLayout) : Int
    {
        if (!shouldPaintClef()) return 0;        
        return cast (CLEF_OFFSET * layout.scale);
    }
    
    // the space required for drawing the timesignature
    public function calculateTimeSignatureSpacing(layout:ViewLayout) : Int
    {
        if (!headerDrawing().shouldPaintTimeSignature(this)) return 0;
        return cast (TIME_SIGNATURE_SPACING * layout.scale);
    }
    
    // the space required for drawing the keysignature    
    public function calculateKeySignatureSpacing(layout:ViewLayout) : Int
    {
        if (!headerDrawing().shouldPaintKeySignature(this)) return 0;
        
        // we have 7 possible keysignature symbols to get from 
        // the old keysignature to the new one
                        
        var newKeySignature = keySignature();
        
        // get the old keysignature, we need to mention this
        var oldKeySignature:Int = 0;
        if (getPreviousMeasure() != null)
        {
            oldKeySignature = getPreviousMeasure().keySignature();
        }        
        
        // TODO: try to only naturalize required strings, not all previous set ones
        
        // count how many steps we need to get to a C-keysignature 
        var normalizingSymbols:Int = 0;        
        if (oldKeySignature <= 7)
        {
            normalizingSymbols = oldKeySignature;
        }
        else
        {
            normalizingSymbols = oldKeySignature - 7;
        }    
                
        // how many symbols do we need to get from a C-keysignature
        // to the new one
        var offsetSymbols:Int = 0;
        if (newKeySignature <= 7)
        {
            offsetSymbols = newKeySignature;
        }
        else
        {
            offsetSymbols = newKeySignature - 7;
        }  
        
        // 8px per symbol
        
        
        return Math.round((normalizingSymbols + offsetSymbols) * (8*layout.scale));
    }
    
}