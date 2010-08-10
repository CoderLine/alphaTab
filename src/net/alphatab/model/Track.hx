package net.alphatab.model;

/**
 * A track contains multiple measures
 */
class Track
{
	public var fretCount:Int;
	public var number:Int;
	public var offset:Int;
	public var isSolo:Bool;
	public var isMute:Bool;
	public var isPercussionTrack:Bool;
	public var is12StringedGuitarTrack:Bool;
	public var isBanjoTrack:Bool;
	
	public var name:String;
	public var measures:Array<Measure>;
	public var strings:Array<GuitarString>;
	
	public var port:Int;
	public var channel:MidiChannel;
	public var color:Color;
	public var song:Song;
	
	public function stringCount() : Int 
	{
		return strings.length;
	}
	
	public function measureCount() : Int 
	{
		return measures.length;
	}
	
	public function new(factory:SongFactory)
	{
		number = 0;
		offset = 0;
		isSolo = false;
		isMute = false;
		name = "";
		measures = new Array<Measure>();
		strings = new Array<GuitarString>();
		channel = factory.newMidiChannel();
		color = new Color(255,0,0);
	}
	
	public function addMeasure(measure:Measure) : Void
	{
		measure.track = this;
		measures.push(measure);
	}

}