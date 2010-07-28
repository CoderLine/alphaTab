/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.midi;
import js.Lib;
import net.alphatab.model.GsDuration;
import net.alphatab.model.GsTimeSignature;

class MidiSequenceHandler 
{
	public var InfoTrack:Int;
	public var MetronomeTrack:Int;
	public var Tracks:Int;
	
	private var _commands:Array<String>;
	public var Commands:String;
	
	
	public function new(tracks:Int)
	{
		Tracks = tracks;
		InfoTrack = 0;
		MetronomeTrack = tracks - 1;
		_commands = new Array<String>();
	}
	
	private function AddEvent(track:Int, tick:Int, evt:String) :Void
	{
		var command:String = MidiMessageUtils.IntToString(track) + "|" + MidiMessageUtils.IntToString(tick) + "|" + evt;
		_commands.push(command);
	}

	public function AddControlChange(tick:Int, track:Int, channel:Int, controller:Int, value:Int):Void
	{
		AddEvent(track, tick, MidiMessageUtils.ControlChange(channel, controller, value));
	}
	
	public function AddNoteOff(tick:Int, track:Int, channel:Int, note:Int, velocity:Int):Void
	{
		AddEvent(track, tick, MidiMessageUtils.NoteOff(channel, note, velocity));
	}
	
	public function AddNoteOn(tick:Int, track:Int, channel:Int, note:Int, velocity:Int):Void
	{
		AddEvent(track, tick, MidiMessageUtils.NoteOn(channel, note, velocity));
	}
	
	public function AddPitchBend(tick:Int, track:Int, channel:Int, value:Int):Void
	{
        AddEvent(track, tick, MidiMessageUtils.PitchBend(channel, value));
	}
	
	public function AddProgramChange(tick:Int, track:Int, channel:Int, instrument:Int):Void
	{
        AddEvent(track, tick, MidiMessageUtils.ProgramChange(channel, instrument));
	}
	
	public function AddTempoInUSQ(tick:Int, track:Int, usq:Int):Void
	{
		AddEvent(track, tick, MidiMessageUtils.TempoInUSQ(usq));
	}
	
	public function AddTimeSignature(tick:Int, track:Int, timeSignature:GsTimeSignature):Void
	{
        AddEvent(track, tick, MidiMessageUtils.TimeSignature(timeSignature));
	}
	
	public function NotifyFinish():Void
	{
		// Tracks InfoTrack MetronomeTrack Commands
		Commands = MidiMessageUtils.IntToString(MetronomeTrack) + ";" + _commands.join(";");
	}
}