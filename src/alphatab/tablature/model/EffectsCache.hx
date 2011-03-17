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
    public var bend:Bool;
    public var bendOverflow:Int;
    public var harmonic:Bool;
    public var harmonicType:Int;
    public var grace:Bool;
    public var trill:Bool;
    public var tremoloPicking:Bool;
    public var beatVibrato:Bool;
    public var vibrato:Bool;
    public var deadNote:Bool;
    public var slide:Bool;
    public var hammer:Bool;
    public var ghostNote:Bool;
    public var accentuatedNote:Bool;
    public var heavyAccentuatedNote:Bool;
    public var palmMute:Bool;
    public var staccato:Bool;
    public var letRing:Bool;
    public var leftHandFingering:Array<Int>;
    public var rightHandFingering:Array<Int>;
    public var fingering:Int;
    public var stroke:Bool;
    public var rasgueado:Bool;
    public var pickStroke:Bool;
    public var chord:Bool;
    public var fadeIn:Bool;
    public var tremoloBar:Bool;
    public var tremoloBarTopOverflow:Int;
    public var tremoloBarBottomOverflow:Int;
    public var tapSlapPop:Bool;
    public var mixTable:Bool;
    
    // other items
    public var text:Bool;
    public var tempo:Bool;
    public var tripletFeel:Bool;
    public var triplet:Bool;
    public var marker:Bool;
    
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