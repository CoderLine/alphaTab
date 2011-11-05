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
 * A measure contains multiple beats
 */
class Measure
{
    public static inline var DEFAULT_CLEF:Int = MeasureClef.Treble;
    
    public var track(default,default):Track;
    public var clef(default,default):Int;
    
    public var beats(default,default):Array<Beat>;
    public var header(default,default):MeasureHeader;
    
    public inline function beatCount() : Int
    {
        return beats.length;
    }
    
    public inline function end() : Int
    {
        return (start() + length());
    }
    
    public inline function number() : Int
    {
        return header.number;
    }
    
    public inline function keySignature(): Int
    {
        return header.keySignature;
    }
    
    public inline function repeatClose() : Int
    {
        return header.repeatClose;
    }
    
    public inline function start() : Int
    {
        return header.start;    
    }
    
    public inline function length() : Int
    {
        return header.length();
    }
    
    public inline function tempo() : Tempo
    {
        return header.tempo;
    }
    
    public inline function timeSignature() : TimeSignature
    {
        return header.timeSignature;
    }

    public inline function isRepeatOpen() : Bool
    {
        return header.isRepeatOpen;
    }
    
    public inline function tripletFeel() : Int 
    {
        return header.tripletFeel;
    }
    
    public inline function hasMarker() : Bool
    {
        return header.hasMarker();
    }
    
    public inline function marker() : Marker
    {
        return header.marker;
    }
    
    public function new(header:MeasureHeader)
    {
        this.header = header;
        clef = DEFAULT_CLEF;
        beats = new Array<Beat>();
    }
    
    public function addBeat(beat:Beat) : Void
    {
        beat.measure = this;
        beat.index = beats.length;
        beats.push(beat);
    }
}
