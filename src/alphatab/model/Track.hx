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
 * A track contains multiple measures
 */
class Track
{
	public var fretCount:Int;
	public var number:Int;
	public var offset:Int;
	public var isSolo:Bool;
	public var isMute:Bool;
	public var isPercussionTrack:Bool;
	public var is12StringedGuitarTrack:Bool;
	public var isBanjoTrack:Bool;
	
	public var name:String;
	public var measures:Array<Measure>;
	public var strings:Array<GuitarString>;
	
	public var port:Int;
	public var channel:MidiChannel;
	public var color:Color;
	public var song:Song;
	
	public function stringCount() : Int 
	{
		return strings.length;
	}
	
	public function measureCount() : Int 
	{
		return measures.length;
	}
	
	public function new(factory:SongFactory)
	{
		number = 0;
		offset = 0;
		isSolo = false;
		isMute = false;
		name = "";
		measures = new Array<Measure>();
		strings = new Array<GuitarString>();
		channel = factory.newMidiChannel();
		color = new Color(255,0,0);
	}
	
	public function addMeasure(measure:Measure) : Void
	{
		measure.track = this;
		measures.push(measure);
	}

}