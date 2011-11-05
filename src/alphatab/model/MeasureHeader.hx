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
    
    public var number(default,default):Int;
    public var hasDoubleBar(default,default):Bool;
    public var keySignature(default,default):Int;
    public var keySignatureType(default,default):Int;
    public var start(default,default):Int;
    public var timeSignature(default,default):TimeSignature;
    public var tempo(default,default):Tempo;
    public var marker(default,default):Marker;
    public function hasMarker():Bool
    {
        return this.marker != null;
    }
    public var isRepeatOpen(default,default):Bool;
    public var repeatAlternative(default,default):Int;
    public var repeatClose(default,default):Int;
    public var tripletFeel(default,default):Int;
    public var song(default,default):Song;
    
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
    }

}