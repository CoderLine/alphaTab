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
import alphatab.io.Byte;
import alphatab.model.Duration;
import alphatab.model.TimeSignature;

/**
 * This handler provides creating of a midi commandset.
 */
class MidiSequenceDataHandler  implements MidiSequenceHandler
{
    private var _commands:Array<String>;
    private var _ticksSoFar:Int;
    private var _infoTrack:Int;
    private var _metronomeTrack:Int;

    public var commands(default, default):String;


    public function new(tracks:Int)
    {
        _infoTrack = 0;
        _ticksSoFar=0;
        _metronomeTrack = tracks - 1;
        _commands = new Array<String>();
    }
    
	public function getInfoTrack():Int
	{
		return _infoTrack;
	}
    
    public function getMetronomeTrack():Int
	{
		return _metronomeTrack;
	}

	
	
    public function resetTicks() 
	{
        _ticksSoFar=0;
    }
    
    public function getTicks() 
	{
        return _ticksSoFar;
    }
    
    private function addEvent(track:Int, tick:Int, evt:String) :Void
    {
        var command:String = MidiMessageDataUtils.intToString(track) + "|" + MidiMessageDataUtils.intToString(tick) + "|" + evt;
        _commands.push(command);
        if(tick>_ticksSoFar) {
            _ticksSoFar=tick;
        }
    }

    public function addControlChange(tick:Int, track:Int, channel:Byte, controller:Byte, value:Byte):Void
    {
        addEvent(track, tick, MidiMessageDataUtils.controlChange(channel, controller, value));
    }
    
    public function addNoteOff(tick:Int, track:Int, channel:Byte, note:Byte, velocity:Byte):Void
    {
        addEvent(track, tick, MidiMessageDataUtils.noteOff(channel, note, velocity));
    }
    
    public function addNoteOn(tick:Int, track:Int, channel:Byte, note:Byte, velocity:Byte):Void
    {
        addEvent(track, tick, MidiMessageDataUtils.noteOn(channel, note, velocity));
    }
    
    public function addRest(tick:Int, track:Int, channel:Byte):Void
    {
        addEvent(track, tick, MidiMessageDataUtils.rest());
    }
    
    public function addPitchBend(tick:Int, track:Int, channel:Byte, value:Byte):Void
    {
        addEvent(track, tick, MidiMessageDataUtils.pitchBend(channel, value));
    }
    
    public function addProgramChange(tick:Int, track:Int, channel:Byte, instrument:Byte):Void
    {
        addEvent(track, tick, MidiMessageDataUtils.programChange(channel, instrument));
    }
    
    public function addTempoInUSQ(tick:Int, track:Int, usq:Int):Void
    {
        addEvent(track, tick, MidiMessageDataUtils.tempoInUSQ(usq));
    }
    
    public function addTimeSignature(tick:Int, track:Int, timeSignature:TimeSignature):Void
    {
        addEvent(track, tick, MidiMessageDataUtils.timeSignature(timeSignature));
    }
    
    public function notifyFinish():Void
    {
        commands = MidiMessageDataUtils.intToString(_metronomeTrack) + ";" + _commands.join(";");
    }
}