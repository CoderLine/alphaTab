package net.alphatab.model;

/**
 * A measure header contains metadata for measures over multiple tracks. 
 */
class MeasureHeader
{
	public static inline var DEFAULT_KEY_SIGNATURE:Int = 0;
	
	public var number:Int;
	public var hasDoubleBar:Bool;
	public var keySignature:Int;
	public var keySignatureType:Int;
	public var start:Int;
	public var timeSignature:TimeSignature;
	public var tempo:Tempo;
	public var marker:Marker;
	public function hasMarker():Bool
	{
		return this.marker != null;
	}
	public var isRepeatOpen:Bool;
	public var repeatAlternative:Int;
	public var repeatClose:Int;
	public var tripletFeel:TripletFeel;
	public var song:Song;
	
	public function length() : Int
	{
		return timeSignature.numerator * timeSignature.denominator.time();
	}
	
	public function new(factory:SongFactory)
	{
		number = 0;
		start = Duration.QUARTER_TIME;
		timeSignature = factory.newTimeSignature();
		keySignature = DEFAULT_KEY_SIGNATURE;
		tempo = factory.newTempo();
		marker = null;
		tripletFeel = TripletFeel.None;
		isRepeatOpen = false;
		repeatClose = 0;
		repeatAlternative = 0;
	}

}