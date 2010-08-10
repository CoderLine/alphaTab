package net.alphatab.model;

/**
 * Describes a single note. 
 */
class Note
{
	public var duration:Int;
	public var tuplet:Int;
	public var value:Int;
	public var velocity:Int;
	public var string:Int;
	public var isTiedNote:Bool;
	public var effect:NoteEffect;
	public var voice:Voice;
	public var durationPercent:Float;
	
	public function realValue() : Int
	{
		return value + voice.beat.measure.track.strings[string - 1].value;
	}
	
	public function new(factory:SongFactory)
	{
		value = 0;
		velocity = Velocities.DEFAULT;
		string = 1;
		isTiedNote = false;
		effect = factory.newNoteEffect();
	}

}