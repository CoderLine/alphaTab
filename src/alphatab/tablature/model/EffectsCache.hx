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
import alphatab.model.effects.HarmonicType;

/**
 * This class stores a cache of effects and special annotations, 
 * available in a measure/beat
 * if a bool flag within this class is set. 
 * any note, in any voice, in any beat has this effect set
 */
class EffectsCache 
{
    // effects
    public var bend(default,default):Bool;
    public var bendOverflow(default,default):Int;
    public var harmonic(default,default):Bool;
    public var harmonicType(default,default):Int;
    public var grace(default,default):Bool;
    public var trill(default,default):Bool;
    public var tremoloPicking(default,default):Bool;
    public var beatVibrato(default,default):Bool;
    public var vibrato(default,default):Bool;
    public var deadNote(default,default):Bool;
    public var slide(default,default):Bool;
    public var hammer(default,default):Bool;
    public var ghostNote(default,default):Bool;
    public var accentuatedNote(default,default):Bool;
    public var heavyAccentuatedNote(default,default):Bool;
    public var palmMute(default,default):Bool;
    public var staccato(default,default):Bool;
    public var letRing(default,default):Bool;
    public var leftHandFingering(default,default):Array<Int>;
    public var rightHandFingering(default,default):Array<Int>;
    public var fingering(default,default):Int;
    public var stroke(default,default):Bool;
    public var rasgueado(default,default):Bool;
    public var pickStroke(default,default):Bool;
    public var chord(default,default):Bool;
    public var fadeIn(default,default):Bool;
    public var tremoloBar(default,default):Bool;
    public var tremoloBarTopOverflow(default,default):Int;
    public var tremoloBarBottomOverflow(default,default):Int;
    public var tapSlapPop(default,default):Bool;
    public var mixTable(default,default):Bool;
    
    // other items
    public var text(default,default):Bool;
    public var tempo(default,default):Bool;
    public var tripletFeel(default,default):Bool;
    public var triplet(default,default):Bool;
    public var marker(default,default):Bool;
    
    public function new() 
    {
        reset();
    }
    
    public function reset()
    {
        bend = false;
        bendOverflow = 0;
        harmonic = false;
        harmonicType = HarmonicType.None;
        grace = false;
        trill = false;
        tremoloPicking = false;
        beatVibrato = false;
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
        leftHandFingering = new Array<Int>();
        rightHandFingering = new Array<Int>();
        fingering = 0;
        slide = false;
        stroke = false;
        rasgueado = false;
        pickStroke = false;
        chord = false;
        fadeIn = false;
        tremoloBar = false;
        tapSlapPop = false;
        mixTable = false;
        
        text = false;
        tempo = false;
        tripletFeel = false;
        triplet = false;
        marker = false;
    }
    
}