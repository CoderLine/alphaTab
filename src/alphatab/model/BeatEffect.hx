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
    public var stroke:BeatStroke;
    public var hasRasgueado:Bool;

    public var pickStroke:Int;
    public var hasPickStroke:Bool;
    public var chord:Chord;
    public function isChord() : Bool
    {
        return this.chord != null;
    }
    

    public var fadeIn:Bool;
    public var vibrato:Bool;
    
    public var tremoloBar:BendEffect;    
    public function isTremoloBar() : Bool
    {
        return this.tremoloBar != null;
    }
    

    public var mixTableChange:MixTableChange;
    
    public var tapping: Bool;
    public var slapping: Bool;
    public var popping: Bool;

    public function new(factory:SongFactory) 
    {
        tapping = false;
        slapping = false;
        popping = false;
        fadeIn = false;        
        stroke = factory.newStroke();
    }
    
}