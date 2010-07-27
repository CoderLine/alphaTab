/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsMidiChannel
{
	public static inline var DefaultPercussionChannel:Int = 9;
	public static inline var DefaultInstrument:Int = 25;
	public static inline var DefaultVolume:Int = 127;
	public static inline var DefaultBalance:Int = 64;
	public static inline var DefaultChorus:Int = 0;
	public static inline var DefaultReverb:Int = 0;
	public static inline var DefaultPhaser:Int = 0;
	public static inline var DefaultTremolo:Int = 0;
	
	public var Channel:Int;
	public var EffectChannel:Int;
	
	public var Volume:Int;
	public var Balance:Int;
	public var Chorus:Int;
	public var Reverb:Int;
	public var Phaser:Int;
	public var Tremolo:Int;
	
	private var _instrument:Int;
	
	public function Instrument(newInstrument:Int = -1) : Int
	{
		if(newInstrument != -1)
			this._instrument = newInstrument;
		return IsPercussionChannel() ? 0 : _instrument;
	}
	
	public function IsPercussionChannel() : Bool
	{
		return Channel == DefaultPercussionChannel;
	}
	
	public function new()
	{
		this.Channel = 0;
		this.EffectChannel = 0;
		this.Instrument(DefaultInstrument);
		this.Volume = DefaultVolume;
		this.Balance = DefaultBalance;
		this.Chorus = DefaultChorus;
		this.Reverb = DefaultReverb;
		this.Phaser = DefaultPhaser;
		this.Tremolo = DefaultTremolo;
	}

	public function Copy(channel:GsMidiChannel) : Void
	{
		channel.Channel = this.Channel;
		channel.EffectChannel = this.EffectChannel;
		channel.Instrument(this.Instrument());
		channel.Volume = this.Volume;
		channel.Balance = this.Balance;
		channel.Chorus = this.Chorus;
		channel.Reverb = this.Reverb;
		channel.Phaser = this.Phaser;
		channel.Tremolo = this.Tremolo;
	}
}