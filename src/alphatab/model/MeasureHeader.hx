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

/**
 * A measure header contains metadata for measures over multiple tracks. 
 */
class MeasureHeader
{
    public static inline var DEFAULT_KEY_SIGNATURE:Int = 0;
    
    public var number:Int;
    public var hasDoubleBar:Bool;
    public var keySignature:Int;
    public var keySignatureType:Int;
    /**
     * This is the start tick (midi) of the measure which does not take account
     * of repetitions
     */
    public var start:Int;
    /**
     * This is the start tick (midi) of the measure which takes account of repetitions. 
     * The tick represents the first time the measure was played.
     */
    public var realStart : Int;
    public var timeSignature:TimeSignature;
    public var tempo:Tempo;
    public var marker:Marker;
    public function hasMarker():Bool
    {
        return this.marker != null;
    }
    public var isRepeatOpen:Bool;
    public var repeatAlternative:Int;
    public var repeatClose:Int;
    public var repeatGroup:RepeatGroup;
    public var tripletFeel:Int;
    public var song:Song;
    
    public function length() : Int
    {
        return timeSignature.numerator * timeSignature.denominator.time();
    }
    
    public function new(factory:SongFactory)
    {
        number = 0;
        start = Duration.QUARTER_TIME;
        timeSignature = factory.newTimeSignature();
        keySignature = DEFAULT_KEY_SIGNATURE;
        tempo = factory.newTempo();
        marker = null;
        tripletFeel = TripletFeel.None;
        isRepeatOpen = false;
        repeatClose = 0;
        repeatAlternative = 0;
        realStart = -1;
    }

}