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
package alphatab.model.effects;

/**
 * A single point within the BendEffect or TremoloBarEffect 
 */
class BendPoint 
{
    /**
     * The position of the bend point on the x-axis (time)
     */
    public var position(default,default):Int;
    /**
     * The value of the bend y-axis (pitch)
     */
    public var value(default,default):Int;
    /**
     * Whether to perform a vibrato effect on the bend. 
     */
    public var vibrato(default,default):Bool;
        
    /**
     * Initializes a new instance of the BendPoint class. 
     */
    public function new(position:Int, value:Int, vibrato:Bool)
    {
        this.position = position;
        this.value = value;
        this.vibrato = vibrato;
    }
    
    /**
     * Gets the exact time when the point need to be played (midi)
     * @param duration the full duration of the effect
     * @param the time when this point is processed according to the given song duration
     */
    public function getTime(duration:Int) : Int
    {
        return Math.floor(duration * position / BendEffect.MAX_POSITION);
    }
}