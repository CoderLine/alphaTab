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
package alphatab.midi;
import alphatab.model.Duration;
import alphatab.model.TimeSignature;

/**
 * This handler provides creating of a midi commandset.
 */
class MidiSequenceHandler 
{
	private var _commands:Array<String>;
	private var _ticksSoFar:Int;

	public var infoTrack:Int;
	public var metronomeTrack:Int;
	public var commands:String;

	public function new(tracks:Int)
	{
		infoTrack = 0;
		_ticksSoFar=0;
		metronomeTrack = tracks - 1;
		_commands = new Array<String>();
	}
	
	public function resetTicks() {
		_ticksSoFar=0;
	}
	
	public function getTicks() {
		return _ticksSoFar;
	}
	
	private function addEvent(track:Int, tick:Int, evt:String) :Void
	{
		var command:String = MidiMessageUtils.intToString(track) + "|" + MidiMessageUtils.intToString(tick) + "|" + evt;
		_commands.push(command);
		if(tick>_ticksSoFar) {
			_ticksSoFar=tick;
		}
	}

	public function addControlChange(tick:Int, track:Int, channel:Int, controller:Int, value:Int):Void
	{
		addEvent(track, tick, MidiMessageUtils.controlChange(channel, controller, value));
	}
	
	public function addNoteOff(tick:Int, track:Int, channel:Int, note:Int, velocity:Int):Void
	{
		addEvent(track, tick, MidiMessageUtils.noteOff(channel, note, velocity));
	}
	
	public function addNoteOn(tick:Int, track:Int, channel:Int, note:Int, velocity:Int):Void
	{
		addEvent(track, tick, MidiMessageUtils.noteOn(channel, note, velocity));
	}
	
	public function addPitchBend(tick:Int, track:Int, channel:Int, value:Int):Void
	{
        addEvent(track, tick, MidiMessageUtils.pitchBend(channel, value));
	}
	
	public function addProgramChange(tick:Int, track:Int, channel:Int, instrument:Int):Void
	{
        addEvent(track, tick, MidiMessageUtils.programChange(channel, instrument));
	}
	
	public function addTempoInUSQ(tick:Int, track:Int, usq:Int):Void
	{
		addEvent(track, tick, MidiMessageUtils.tempoInUSQ(usq));
	}
	
	public function addTimeSignature(tick:Int, track:Int, timeSignature:TimeSignature):Void
	{
        addEvent(track, tick, MidiMessageUtils.timeSignature(timeSignature));
	}
	
	public function notifyFinish():Void
	{
		commands = MidiMessageUtils.intToString(metronomeTrack) + ";" + _commands.join(";");
	}
}