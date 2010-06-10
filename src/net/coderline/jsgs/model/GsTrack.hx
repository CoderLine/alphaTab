/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;
	
class GsTrack
{
	public var FretCount:Int;
	public var Number:Int;
	public var Offset:Int;
	public var IsSolo:Bool;
	public var IsMute:Bool;
	public var IsPercussionTrack:Bool;
	public var Is12StringedGuitarTrack:Bool;
	public var IsBanjoTrack:Bool;
	
	public var Name:String;
	public var Measures:Array<GsMeasure>;
	public var Strings:Array<GsGuitarString>;
	
	public var Port:Int;
	public var Channel:GsMidiChannel;
	public var Color:GsColor;
	public var Song:GsSong;
	
	public function StringCount() : Int 
	{
		return this.Strings.length;
	}
	
	public function MeasureCount() : Int 
	{
		return this.Measures.length;
	}
	
	public function new(factory:GsSongFactory)
	{
		this.Number = 0;
		this.Offset = 0;
		this.IsSolo = false;
		this.IsMute = false;
		this.Name = "";
		this.Measures = new Array<GsMeasure>();
		this.Strings = new Array<GsGuitarString>();
		this.Channel = factory.NewMidiChannel();
		this.Color = new GsColor(255,0,0);
	}
	
	public function AddMeasure(measure:GsMeasure) : Void
	{
		measure.Track = this;
		this.Measures.push(measure);
	}

}