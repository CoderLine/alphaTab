/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;
	
class GsMeasure
{
	public static inline var DefaultClef:GsMeasureClef = GsMeasureClef.Treble;
	
	public var Track:GsTrack;
	public var Clef:GsMeasureClef;
	
	public var Beats:Array<GsBeat>;
	public var Header:GsMeasureHeader;
	
	public function BeatCount() : Int
	{
		return Beats.length;
	}
	
	public function End() : Int
	{
		return this.Start() + this.Length();
	}
	
	public function Number() : Int
	{
		return Header.Number;
	}
	
	public function KeySignature(): Int
	{
		return Header.KeySignature;
	}
	
	public function RepeatClose() : Int
	{
		return Header.RepeatClose;
	}
	
	public function Start() : Int
	{
		return Header.Start;	
	}
	
	public function Length() : Int
	{
		return Header.Length();
	}
	
	public function GetTempo() : GsTempo
	{
		return Header.Tempo;
	}
	
	public function GetTimeSignature() : GsTimeSignature
	{
		return Header.TimeSignature;
	}
	
	public function GetKeySignature() : Int
	{
		return Header.KeySignature;
	}
	
	public function IsRepeatOpen() : Bool
	{
		return Header.IsRepeatOpen;
	}
	
	public function GetTripletFeel() : GsTripletFeel
	{
		return Header.TripletFeel;
	}
	
	public function HasMarker() : Bool
	{
		return Header.HasMarker();
	}
	
	public function GetMarker() : GsMarker
	{
		return Header.Marker;
	}
	
	public function new(header:GsMeasureHeader)
	{
		this.Header = header;
		this.Clef = DefaultClef;
		this.Beats = new Array<GsBeat>();
	}
	
	public function AddBeat(beat:GsBeat) : Void
	{
		beat.Measure = this;
		this.Beats.push(beat);
	}
}
