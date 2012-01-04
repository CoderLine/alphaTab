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
import alphatab.midi.model.MidiEvent;
import alphatab.midi.model.MidiFile;
import alphatab.midi.model.MidiMessage;
import alphatab.model.TimeSignature;

/**
 * This handler provides creating of a midi file.
 */
class MidiSequenceFileHandler implements MidiSequenceHandler
{
    public var infoTrack(default,default):Int;
    public var metronomeTrack(default,default):Int;
    
    public var midiFile:MidiFile;
    
    public function new(tracks:Int)
    {
        midiFile = new MidiFile(tracks);
        infoTrack = 0;
        metronomeTrack = tracks - 1;
    }
    
    private function addEvent(track:Int, tick:Int, message:MidiMessage) :Void
    {
        midiFile.tracks[track].addEvent(new MidiEvent(tick, message));
    } 

    public function addControlChange(tick:Int, track:Int, channel:Int, controller:Int, value:Int):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.controlChange(channel, controller, value));
    }
    
    public function addNoteOff(tick:Int, track:Int, channel:Int, note:Int, velocity:Int):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.noteOff(channel, note, velocity));
    }
    
    public function addNoteOn(tick:Int, track:Int, channel:Int, note:Int, velocity:Int):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.noteOn(channel, note, velocity));
    }
    
    public function addPitchBend(tick:Int, track:Int, channel:Int, value:Int):Void
    {
        addEvent(track, tick, MidiMessageFileUtils.pitchBend(channel, value));
    }
    
    public function addProgramChange(tick:Int, track:Int, channel:Int, instrument:Int):Void
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
        midiFile.infoTrack = infoTrack;
        midiFile.metronomeTrack = metronomeTrack;
    }
}