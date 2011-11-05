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
package alphatab.model;
import alphatab.model.effects.BendEffect;
import alphatab.model.effects.GraceEffect;
import alphatab.model.effects.HarmonicEffect;
import alphatab.model.effects.TremoloPickingEffect;
import alphatab.model.effects.TrillEffect;

/**
 * Contains all effects which can be applied to one note. 
 */
class NoteEffect
{
    public function new()
    {
        bend = null;
        harmonic = null;
        grace = null;
        trill = null;
        tremoloPicking = null;
        vibrato = false;
        deadNote = false;
        slide = false;
        hammer = false;
        ghostNote = false;
        accentuatedNote = false;
        heavyAccentuatedNote = false;
        palmMute = false;
        staccato = false;
        letRing = false;
        isFingering = false;
    }
    
    public var leftHandFinger(default,default):Int;
    public var rightHandFinger(default,default):Int;
    public var isFingering(default,default):Bool;


    public var bend(default,default):BendEffect;
    public function isBend() : Bool
    {
        return bend != null && bend.points.length != 0;
    }
        
    public var harmonic(default,default):HarmonicEffect;
    public function isHarmonic() : Bool
    {
        return harmonic != null;
    }
    
    public var grace(default,default):GraceEffect;
    public function isGrace() : Bool
    {
        return grace != null;    
    }
    
    public var trill(default,default):TrillEffect;
    public function isTrill() : Bool
    {
        return trill != null;
    }
    
    public var tremoloPicking(default,default):TremoloPickingEffect;
    public function isTremoloPicking() : Bool
    {
        return tremoloPicking != null;
    }
    
    public var vibrato(default,default): Bool;
    public var deadNote(default,default): Bool;
    public var slideType(default,default):Int;
    public var slide(default,default): Bool;
    public var hammer(default,default): Bool;
    public var ghostNote(default,default): Bool;
    public var accentuatedNote(default,default): Bool;
    public var heavyAccentuatedNote(default,default): Bool;
    public var palmMute(default,default): Bool;
    public var staccato(default,default): Bool;
    public var letRing(default,default): Bool;
    
    public function clone(factory:SongFactory) : NoteEffect
    {
        var effect:NoteEffect = factory.newNoteEffect();
        effect.vibrato = vibrato;
        effect.deadNote = deadNote;
        effect.slide = slide;
        effect.slideType = slideType;
        effect.hammer = hammer;
        effect.ghostNote = ghostNote;
        effect.accentuatedNote = accentuatedNote;
        effect.heavyAccentuatedNote = heavyAccentuatedNote;
        effect.palmMute = palmMute;
        effect.staccato = staccato;
        effect.letRing = letRing;
        effect.isFingering = isFingering;
        effect.leftHandFinger = leftHandFinger;
        effect.rightHandFinger = rightHandFinger;
        effect.bend = isBend() ? bend.clone(factory) : null;
        effect.harmonic = isHarmonic() ? harmonic.clone(factory) : null;
        effect.grace = isGrace() ? grace.clone(factory) : null;
        effect.trill = isTrill() ? trill.clone(factory) : null;
        effect.tremoloPicking = isTremoloPicking() ? tremoloPicking.clone(factory) : null;
        return effect;
    }
}