/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

class GsMeasureHeader
{
	public static inline var DefaultKeySignature:Int = 0;
	
	public var Number:Int;
	public var HasDoubleBar:Bool;
	public var KeySignature:Int;
	public var KeySignatureType:Int;
	public var Start:Int;
	public var TimeSignature:GsTimeSignature;
	public var Tempo:GsTempo;
	public var Marker:GsMarker;
	public function HasMarker():Bool
	{
		return this.Marker != null;
	}
	public var IsRepeatOpen:Bool;
	public var RepeatAlternative:Int;
	public var RepeatClose:Int;
	public var TripletFeel:GsTripletFeel;
	public var Song:GsSong;
	
	public function Length() : Int
	{
		return this.TimeSignature.Numerator * TimeSignature.Denominator.Time();
	}
	
	public function new(factory:GsSongFactory)
	{
		this.Number = 0;
		this.Start = GsDuration.QuarterTime;
		this.TimeSignature = factory.NewTimeSignature();
		this.KeySignature = DefaultKeySignature;
		this.Tempo = factory.NewTempo();
		this.Marker = null;
		this.TripletFeel = GsTripletFeel.None;
		this.IsRepeatOpen = false;
		this.RepeatClose = 0;
		this.RepeatAlternative = 0;
	}

}