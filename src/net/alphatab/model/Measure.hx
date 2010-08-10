package net.alphatab.model;

/**
 * A measure contains multiple beats
 */
class Measure
{
	public static inline var DEFAULT_CLEF:MeasureClef = MeasureClef.Treble;
	
	public var track:Track;
	public var clef:MeasureClef;
	
	public var beats:Array<Beat>;
	public var header:MeasureHeader;
	
	public function beatCount() : Int
	{
		return beats.length;
	}
	
	public function end() : Int
	{
		return start() + length();
	}
	
	public function number() : Int
	{
		return header.number;
	}
	
	public function keySignature(): Int
	{
		return header.keySignature;
	}
	
	public function repeatClose() : Int
	{
		return header.repeatClose;
	}
	
	public function start() : Int
	{
		return header.start;	
	}
	
	public function length() : Int
	{
		return header.length();
	}
	
	public function tempo() : Tempo
	{
		return header.tempo;
	}
	
	public function timeSignature() : TimeSignature
	{
		return header.timeSignature;
	}

	public function isRepeatOpen() : Bool
	{
		return header.isRepeatOpen;
	}
	
	public function tripletFeel() : TripletFeel
	{
		return header.tripletFeel;
	}
	
	public function hasMarker() : Bool
	{
		return header.hasMarker();
	}
	
	public function marker() : Marker
	{
		return header.marker;
	}
	
	public function new(header:MeasureHeader)
	{
		this.header = header;
		clef = DEFAULT_CLEF;
		beats = new Array<Beat>();
	}
	
	public function addBeat(beat:Beat) : Void
	{
		beat.measure = this;
		beats.push(beat);
	}
}
