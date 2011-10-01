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
import alphatab.model.BeatStrokeDirection;
import alphatab.model.effects.BendPoint;
import alphatab.model.SongFactory;
import alphatab.model.Voice;
import alphatab.tablature.ViewLayout;

/**
 * This beat implements layouting functionalities for later drawing on staves.
 */
class BeatDrawing extends Beat
{
    // cache for storing which effects are available in this beat
    public var effectsCache:EffectsCache;
    // the x position within the measure
    public var x:Int;
    // the width of the beat
    public var width:Int;
    
    // a boolean flag indicating whether the beat is the first one
    // within the current MeasureDrawing
    public function isFirstOfLine():Bool
    {
        return measure.beats.length == 0 || // no beats in this line yet. this instance will become the first
            index==0; // if there are any beats yet, check if we are first
    }
    
    // full width including the additional spacing provided by the measure
    public function fullWidth() : Int
    {
        var md = measureDrawing();
        // calculate the factor of size change 
        // caused by additional space
        var factor = md.getSizingFactor();
        
        // calculate new size of beat and remove the old one to get the spacing
        return cast (width * factor);
    }
    
    public function fullX() : Int
    {
        var layout:ViewLayout = measureDrawing().staveLine.tablature.viewLayout;
        return measureDrawing().staveLine.x + measureDrawing().x + measureDrawing().getDefaultSpacings(layout) + x;
    }
    
    public inline function measureDrawing() : MeasureDrawing
    {
        return cast measure;
    }
    
    private var _nextBeat:BeatDrawing;
    private var _prevBeat:BeatDrawing;    

    public var minNote:NoteDrawing;
    public var maxNote:NoteDrawing;   
    
    
    public function new(factory:SongFactory) 
    {
        super(factory);
        effectsCache = new EffectsCache();
    }
    
    public function checkNote(note:NoteDrawing)
    {                
        var md:MeasureDrawing = measureDrawing();
        md.checkNote(note);
        
        if (minNote == null || minNote.realValue() > note.realValue())
        {
            minNote = note;
        }
        if (maxNote == null || maxNote.realValue() < note.realValue())
        {
            maxNote = note;
        }
    }
    
    private var _minNote:NoteDrawing;
    public function getMinNote()
    {
        if (_minNote == null)
        {
            for (note in getNotes())
            {
                if (_minNote == null || _minNote.realValue() <  note.realValue())
                    _minNote = cast note;
            }
        }
        return _minNote;
    }
        
    public function getNote(voice:Int, string:Int)
    {
        if (voice < 0 || voice >= voices.length) return null;

        var voice:Voice = voices[voice];
        for (note in voice.notes)
        {
            if (note.string == string)
                return note;
        }
        return null;
    }
    
    public function performLayout(layout:ViewLayout)
    {           
        width = 0;
        
        effectsCache.reset();
        // register beat effects
        registerEffects(layout);
        
        // width is the max required width by voices
        for (i in 0 ... voices.length)
        {
            var voice:VoiceDrawing = cast voices[i];
            if (!voice.isEmpty)
            {
                voice.performLayout(layout);                
                width = cast Math.max(width, voice.width);
            }
            effectsCache.fingering = cast Math.max(effectsCache.fingering, voice.effectsCache.fingering);
        }      
        
        // TODO: mention chord diagram width
    }
    
    public function getPreviousBeat() 
    {
        if (_prevBeat == null) // initialize
        {
            // not first beat in current voice? return previous one
            if (index > 0) 
            {
                _prevBeat = cast measure.beats[index - 1];
            }
            else
            {
                var prevMeasure = measureDrawing().getPreviousMeasure();
                if (prevMeasure != null)
                {
                    _prevBeat = cast prevMeasure.beats[prevMeasure.beats.length - 1];
                }
            }            
        }
        return _prevBeat;
    }
    
    public function getNextBeat() 
    {
        if (_nextBeat == null) // initialize
        {
            if (index < measure.beats.length - 1) 
            {
                _nextBeat = cast measure.beats[index + 1];
            }
            else
            {
                var nextMeasure = measureDrawing().getNextMeasure();
                if (nextMeasure != null)
                {
                    _nextBeat = cast nextMeasure.beats[0];
                }
            }            
        }
        return _nextBeat;
    }
    
    private function registerEffects(layout:ViewLayout)
    {
        var md:MeasureDrawing = measureDrawing();
        
        if (text != null)
        {
            md.effectsCache.text = true;
            effectsCache.text = true;
        }   
        if (effect.stroke.direction != BeatStrokeDirection.None)
        {
            md.effectsCache.stroke = true;
            effectsCache.stroke = true;
        }
        if (effect.hasRasgueado)
        {
            md.effectsCache.rasgueado = true;
            effectsCache.rasgueado = true;
        }
        if (effect.hasPickStroke)
        {
            md.effectsCache.pickStroke = true;
            effectsCache.pickStroke = true;
        }
        if (effect.chord != null)
        {
            md.effectsCache.chord = true;
            effectsCache.chord = true;
        }
        if (effect.fadeIn != null)
        {
            md.effectsCache.fadeIn = true;
            effectsCache.fadeIn = true;
        }
        if (effect.vibrato != null)
        {
            md.effectsCache.beatVibrato = true;
            effectsCache.beatVibrato = true;
        }
        if (effect.tremoloBar != null)
        {
            md.effectsCache.tremoloBar = true;
            effectsCache.tremoloBar = true;
            var overflow:Array<Int> = calculateTremoloBarOverflow(layout);
            md.effectsCache.tremoloBarTopOverflow = overflow[0];
            effectsCache.tremoloBarTopOverflow = overflow[0];
            md.effectsCache.tremoloBarBottomOverflow = overflow[1];
            effectsCache.tremoloBarBottomOverflow = overflow[1];
        }
        if (effect.mixTableChange != null)
        {
            md.effectsCache.mixTable = true;
            effectsCache.mixTable = true;
        }
        if (effect.tapping || effect.slapping || effect.popping)
        {
            md.effectsCache.tapSlapPop = true;
            effectsCache.tapSlapPop = true; 
        }
    }
    
    //[0] -> upper overflow, [1] -> lower overflow
    private function calculateTremoloBarOverflow(layout:ViewLayout) : Array<Int>
    {
        var offsets = new Array<Int>();
        offsets.push(0);
        offsets.push(0);
        
        if (effect.tremoloBar.points.length == 0) return offsets;
        
        // Find Highest and lowest point
        var min:BendPoint = null;
        var max:BendPoint = null;
        for (curr in effect.tremoloBar.points)
        {
            if (min == null || min.value > curr.value)
                min = curr;
            if (max == null || max.value < curr.value)
                max = curr;
        }

        
        // 6px*scale movement per value 
        var note = getMinNote();
        var string = note == null ? 6 : note.string;
        var heightToTabNote:Float = (string - 1) * layout.stringSpacing;

        offsets[0] = Math.round((Math.abs(min.value) * (6 * layout.scale)) - heightToTabNote);
        offsets[1] = Math.round((Math.abs(max.value) * (6 * layout.scale)) - heightToTabNote);
        
        return offsets;
    }
    
}