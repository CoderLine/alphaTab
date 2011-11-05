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

/**
 *     This class contains all beat effects.
 */
class BeatEffect 
{
    public var stroke(default,default):BeatStroke;
    public var hasRasgueado(default,default):Bool;

    public var pickStroke(default,default):Int;
    public var hasPickStroke(default,default):Bool;
    public var chord(default,default):Chord;
    public function isChord() : Bool
    {
        return this.chord != null;
    }
    

    public var fadeIn(default,default):Bool;
    public var vibrato(default,default):Bool;
    
    public var tremoloBar(default,default):BendEffect;    
    public function isTremoloBar() : Bool
    {
        return this.tremoloBar != null;
    }
    

    public var mixTableChange(default,default):MixTableChange;
    
    public var tapping(default,default): Bool;
    public var slapping(default,default): Bool;
    public var popping(default,default): Bool;

    public function new(factory:SongFactory) 
    {
        tapping = false;
        slapping = false;
        popping = false;
        fadeIn = false;        
        stroke = factory.newStroke();
    }
    
}