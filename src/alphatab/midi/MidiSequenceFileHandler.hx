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
import alphatab.midi.model.MidiEvent;
import alphatab.midi.model.MidiFile;
import alphatab.midi.model.MidiMessage;
import alphatab.model.TimeSignature;

/**
 * This handler provides creating of a midi file.
 */
class MidiSequenceFileHandler implements MidiSequenceHandler
{
    private var _infoTrack:Int;
    private var _metronomeTrack:Int;
    
    public var midiFile:MidiFile;
    
    public function new(tracks:Int)
    {
        midiFile = new MidiFile(tracks);
        _infoTrack = 0;
        _metronomeTrack = tracks - 1;
    }
	    
	public function getInfoTrack():Int
	{
		return _infoTrack;
	}
    
    public function getMetronomeTrack():Int
	{
		return _metronomeTrack;
	}


    
    private function addEvent(track:Int, tick:Int, message:MidiMessage) :Void
    {
        midiFile.tracks[track].addEvent(new MidiEvent(tick, message));
    } 

    public function addControlChange(tick:Int, track:Int, channel:Byte, controller:Byte, value:Byte):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.controlChange(channel, controller, value));
    }
    
    public function addNoteOff(tick:Int, track:Int, channel:Byte, note:Byte, velocity:Byte):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.noteOff(channel, note, velocity));
    }
    
    public function addNoteOn(tick:Int, track:Int, channel:Byte, note:Byte, velocity:Byte):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.noteOn(channel, note, velocity));
    }
        
    public function addRest(tick:Int, track:Int, channel:Byte):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.rest());
    }
    
    public function addPitchBend(tick:Int, track:Int, channel:Byte, value:Byte):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.pitchBend(channel, value));
    }
    
    public function addProgramChange(tick:Int, track:Int, channel:Byte, instrument:Byte):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.programChange(channel, instrument));
    }
    
    public function addTempoInUSQ(tick:Int, track:Int, usq:Int):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.tempoInUSQ(usq));
    }
    
    public function addTimeSignature(tick:Int, track:Int, timeSignature:TimeSignature):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.timeSignature(timeSignature));
    }
    
    public function notifyFinish():Void
    {
        midiFile.infoTrack = _infoTrack;
        midiFile.metronomeTrack = _metronomeTrack;
    }
}