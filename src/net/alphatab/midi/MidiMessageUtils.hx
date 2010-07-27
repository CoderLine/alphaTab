/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.midi;
import haxe.io.Bytes;
import net.alphatab.model.GsTimeSignature;

class MidiMessageUtils 
{
	public static inline var TickMove:Int = 0x01;
	
	private static function fixValue(value:Int):Int{
		var fixedValue:Int = value;
		fixedValue = cast Math.min(fixedValue,127);
		fixedValue = cast Math.max(fixedValue,0);
		return fixedValue;
	}
	
	private static function fixChannel(channel:Int):Int
	{
		var fixedChannel:Int = channel;
		fixedChannel = cast Math.min(fixedChannel,15);
		fixedChannel = cast Math.max(fixedChannel,0);
		return fixedChannel;
	}
	
	public static function NoteOn(channel:Int, note:Int, velocity:Int):String
	{
		// NoteOn,Channel,Note,Velocity
		return "NoteOn," + Std.string(fixChannel(channel)) + "," + Std.string(fixValue(note)) + "," + Std.string(fixValue(velocity));
	}
	
	public static function NoteOff(channel:Int, note:Int, velocity:Int):String {
		// NoteOff,Channel,Note,Velocity
		return "NoteOff," + Std.string(fixChannel(channel)) + "," + Std.string(fixValue(note)) + "," + Std.string(fixValue(velocity));
	}
	
	public static function ControlChange(channel:Int, controller:Int, value:Int):String {
		// ControlChange,Channel,Controller,Value
		return "ControlChange," + Std.string(fixChannel(channel)) + "," + Std.string(fixValue(controller)) + "," + Std.string(fixValue(value));
	}
	
	public static function ProgramChange(channel:Int, instrument:Int):String {
		// ProgramChange,Channel,Instrument
		return "ProgramChange," + Std.string(fixChannel(channel)) + "," + Std.string(fixValue(instrument));
	}
	
	public static function PitchBend(channel:Int, value:Int):String {
		// PitchBend,Channel,Value
		return "PitchBend," + Std.string(fixChannel(channel)) + "," + Std.string(fixValue(value));
	}
	
	public static function SystemReset() : String {
		return "SystemReset";
	}
	 
	public static function TempoInUSQ(usq:Int):String {
		return "TempoInUsq," + Std.string(usq);
	}
	
	public static function TimeSignature(ts:GsTimeSignature) : String {
		// TimeSignature,Numerator,DenominatorIndex,DenominatorValue
		return "TimeSignature," + Std.string(ts.Numerator) + "," + Std.string(ts.Denominator.Index()) + "," + Std.string(ts.Denominator.Value);
	}
}