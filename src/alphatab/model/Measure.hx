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
	
	public var track:Track;
	public var clef:Int;
	
	public var beats:Array<Beat>;
	public var header:MeasureHeader;
	
	public function beatCount() : Int
	{
		return beats.length;
	}
	
	public function end() : Int
	{
		return start() + length();
	}
	
	public function number() : Int
	{
		return header.number;
	}
	
	public function keySignature(): Int
	{
		return header.keySignature;
	}
	
	public function repeatClose() : Int
	{
		return header.repeatClose;
	}
	
	public function start() : Int
	{
		return header.start;	
	}
	
	public function length() : Int
	{
		return header.length();
	}
	
	public function tempo() : Tempo
	{
		return header.tempo;
	}
	
	public function timeSignature() : TimeSignature
	{
		return header.timeSignature;
	}

	public function isRepeatOpen() : Bool
	{
		return header.isRepeatOpen;
	}
	
	public function tripletFeel() : Int 
	{
		return header.tripletFeel;
	}
	
	public function hasMarker() : Bool
	{
		return header.hasMarker();
	}
	
	public function marker() : Marker
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
		beats.push(beat);
	}
}
