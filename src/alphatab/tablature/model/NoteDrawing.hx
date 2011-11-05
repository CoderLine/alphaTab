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
import alphatab.model.effects.BendPoint;
import alphatab.model.effects.FingeringType;
import alphatab.model.Note;
import alphatab.model.Point;
import alphatab.model.Rectangle;
import alphatab.model.SongFactory;
import alphatab.tablature.ViewLayout;

/**
 * This note implements layouting functionalities for later drawing on staves.
 */
class NoteDrawing extends Note 
{   
    public var noteSize(default,default):Point;
    // TODO: it isn't good we store stave specific data here, 
    public var scorePosY(default,default):Int;
    public var displaced(default,default):Bool;
    
    private var _accidental:Int;
    
    public function getAccitental()
    {
        if (_accidental < 0)
        {
            _accidental = measureDrawing().getNoteAccitental(realValue());
        }
        return _accidental;
    }

#if cpp
    public function voiceDrawing() : VoiceDrawing
#else
    public inline function voiceDrawing() : VoiceDrawing
#end
    {
        return cast voice;
    }

#if cpp
    public function beatDrawing() : BeatDrawing
#else
    public inline function beatDrawing() : BeatDrawing
#end
    {
        return voiceDrawing().beatDrawing();
    }

#if cpp
    public function measureDrawing() : MeasureDrawing
#else
    public inline function measureDrawing() : MeasureDrawing
#end
    {
        return voiceDrawing().beatDrawing().measureDrawing();
    }
    
    public function new(factory:SongFactory) 
    {
        super(factory);  
        _accidental = -1;
    }
    
    public function performLayout(layout:ViewLayout)
    {
        scorePosY = 0;
        noteSize = layout.getNoteSize(this);
        
        var vd:VoiceDrawing = voiceDrawing();
        vd.checkNote(this);

        registerEffects(layout);
    }
    
    private function registerEffects(layout:ViewLayout)
    {
        var md:MeasureDrawing = measureDrawing();
        var bd:BeatDrawing = beatDrawing();
        var vd:VoiceDrawing = voiceDrawing();
        
        if (effect.isFingering)
        {
            vd.effectsCache.fingering++;

            if (effect.leftHandFinger != FingeringType.Unknown && effect.leftHandFinger != FingeringType.NoOrDead)
            {
                vd.effectsCache.leftHandFingering.push(effect.leftHandFinger);
                if (!Lambda.has(bd.effectsCache.leftHandFingering, effect.leftHandFinger))
                {
                    bd.effectsCache.leftHandFingering.push(effect.leftHandFinger);
                }
                if (!Lambda.has(md.effectsCache.leftHandFingering, effect.leftHandFinger))
                {
                    md.effectsCache.leftHandFingering.push(effect.leftHandFinger);
                }
            }
            if (effect.rightHandFinger != FingeringType.Unknown && effect.rightHandFinger != FingeringType.NoOrDead)
            {
                vd.effectsCache.rightHandFingering.push(effect.rightHandFinger);
                if (!Lambda.has(bd.effectsCache.rightHandFingering, effect.rightHandFinger))
                {
                    bd.effectsCache.rightHandFingering.push(effect.rightHandFinger);
                }
                if (!Lambda.has(md.effectsCache.rightHandFingering, effect.rightHandFinger))
                {
                    md.effectsCache.rightHandFingering.push(effect.rightHandFinger);
                }
            }
        }
        if (effect.isBend())
        {
            vd.effectsCache.bend = true;
            vd.effectsCache.bendOverflow = calculateBendOverflow(layout);
            md.effectsCache.bend = true;
            md.effectsCache.bendOverflow = md.effectsCache.bendOverflow;      
            bd.effectsCache.bend = true;
            bd.effectsCache.bendOverflow = md.effectsCache.bendOverflow;            
        }
        if (effect.isHarmonic())
        {
            vd.effectsCache.harmonic = true;
            md.effectsCache.harmonic = true;
            bd.effectsCache.harmonic = true;
            
            if (vd.effectsCache.harmonicType == -1)
            {
                vd.effectsCache.harmonicType = effect.harmonic.type;
                md.effectsCache.harmonicType = effect.harmonic.type;
                bd.effectsCache.harmonicType = effect.harmonic.type;    
            }
        }
        if (effect.isGrace())
        {
            vd.effectsCache.grace = true;
            md.effectsCache.grace = true;
            bd.effectsCache.grace = true;
        }
        if (effect.isTrill())
        {
            vd.effectsCache.trill = true;
            md.effectsCache.trill = true;
            bd.effectsCache.trill = true;
        }
        if (effect.isTremoloPicking())
        {
            vd.effectsCache.tremoloPicking = true;
            md.effectsCache.tremoloPicking = true;
            bd.effectsCache.tremoloPicking = true;
        }
        if (effect.vibrato)
        {
            vd.effectsCache.vibrato = true;
            md.effectsCache.vibrato = true;
            bd.effectsCache.vibrato = true;
        }
        if (effect.deadNote)
        {
            vd.effectsCache.deadNote = true;
            md.effectsCache.deadNote = true;
            bd.effectsCache.deadNote = true;
        }
        if (effect.slide)
        {
            vd.effectsCache.slide = true;
            md.effectsCache.slide = true;
            bd.effectsCache.slide = true;
        }
        if (effect.hammer)
        {
            vd.effectsCache.hammer = true;
            md.effectsCache.hammer = true;
            bd.effectsCache.hammer = true;
        }
        if (effect.ghostNote)
        {
            vd.effectsCache.ghostNote = true;
            md.effectsCache.ghostNote = true;
            bd.effectsCache.ghostNote = true;
        }
        if (effect.accentuatedNote)
        {
            vd.effectsCache.accentuatedNote = true;
            md.effectsCache.accentuatedNote = true;
            bd.effectsCache.accentuatedNote = true;
        }
        if (effect.heavyAccentuatedNote)
        {
            vd.effectsCache.heavyAccentuatedNote = true;
            md.effectsCache.heavyAccentuatedNote = true;
            bd.effectsCache.heavyAccentuatedNote = true;
        }
        if (effect.palmMute)
        {
            vd.effectsCache.palmMute = true;
            md.effectsCache.palmMute = true;
            bd.effectsCache.palmMute = true;
        }
        if (effect.staccato)
        {
            vd.effectsCache.staccato = true;
            md.effectsCache.staccato = true;
            bd.effectsCache.staccato = true;
        }
        if (effect.letRing)
        {
            vd.effectsCache.letRing = true;
            md.effectsCache.letRing = true;
            bd.effectsCache.letRing = true;
        }
    }
    
    public function calculateBendOverflow(layout:ViewLayout) : Int
    {
        // Find Highest bend
        var point:BendPoint = null;
        for (curr in effect.bend.points)
        {
            if (point == null || point.value < curr.value)
                point = curr;
        }

        if (point == null) return 0;

        // 6px*scale movement per value 
        var fullHeight:Float = point.value * (6 * layout.scale);
        var heightToTabNote:Float = (string - 1) * layout.stringSpacing;

        return Math.round(fullHeight - heightToTabNote);
    }
}