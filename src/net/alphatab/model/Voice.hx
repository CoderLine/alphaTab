package net.alphatab.model;

/**
 * A voice contains multiple notes. 
 */
class Voice
{
	public var beat:Beat;
	public var duration:Duration;
	public var notes:Array<Note>;
	public var index:Int;
	public var direction:VoiceDirection;
	public var isEmpty:Bool;
	
	public function isRestVoice() : Bool
	{
		return notes.length == 0;
	}
	
	public function new(factory:SongFactory, index:Int)
	{
		duration = factory.newDuration();
		notes = new Array<Note>();
		this.index = index;
		direction = VoiceDirection.None;
		isEmpty = true;
	}
	
	public function addNote(note:Note) : Void
	{
		note.voice = this;
		this.notes.push(note);
		isEmpty = false;
	}

}