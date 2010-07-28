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
		return "0" + ChannelToString(fixChannel(channel)) + ValueToString(fixValue(note)) + ValueToString(fixValue(velocity));
	}
	
	public static function NoteOff(channel:Int, note:Int, velocity:Int):String {
		// NoteOff,Channel,Note,Velocity
		return "1" + ChannelToString(fixChannel(channel)) + ValueToString(fixValue(note)) + ValueToString(fixValue(velocity));
	}
	
	public static function ControlChange(channel:Int, controller:Int, value:Int):String {
		// ControlChange,Channel,Controller,Value
		return "2" + ChannelToString(fixChannel(channel)) + ValueToString(fixValue(controller)) + ValueToString(fixValue(value));
	}
	
	public static function ProgramChange(channel:Int, instrument:Int):String {
		// ProgramChange,Channel,Instrument
		return "3" + ChannelToString(fixChannel(channel)) + ValueToString(fixValue(instrument));
	}
	
	public static function PitchBend(channel:Int, value:Int):String {
		// PitchBend,Channel,Value
		return "4" + ChannelToString(fixChannel(channel)) + ValueToString(fixValue(value));
	}
	
	public static function SystemReset() : String {
		return "5";
	}
	 
	public static function TempoInUSQ(usq:Int):String {
		return "6" + IntToString(usq);
	}
	
	public static function TimeSignature(ts:GsTimeSignature) : String {
		// TimeSignature,Numerator,DenominatorIndex,DenominatorValue
		return "7" + IntToString(ts.Numerator) + "," + IntToString(ts.Denominator.Index()) + "," + IntToString(ts.Denominator.Value);
	}
	
	public static function IntToString(num:Int) :String {
		return StringTools.hex(num);
	}	
	
	public static function ChannelToString(num:Int) :String {
		return StringTools.hex(num, 1);
	}	
	
	public static function ValueToString(num:Int) :String {
		return StringTools.hex(num, 2);
	}
}