package net.alphatab.midi;
import js.Lib;
import net.alphatab.model.Duration;
import net.alphatab.model.TimeSignature;

/**
 * This handler provides creating of a midi commandset.
 */
class MidiSequenceHandler 
{
	private var _commands:Array<String>;

	public var infoTrack:Int;
	public var metronomeTrack:Int;
	public var commands:String;

	public function new(tracks:Int)
	{
		infoTrack = 0;
		metronomeTrack = tracks - 1;
		_commands = new Array<String>();
	}
	
	private function addEvent(track:Int, tick:Int, evt:String) :Void
	{
		var command:String = MidiMessageUtils.intToString(track) + "|" + MidiMessageUtils.intToString(tick) + "|" + evt;
		_commands.push(command);
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