/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsVoice
{
	public var Beat:GsBeat;
	public var Duration:GsDuration;
	public var Notes:Array<GsNote>;
	public var Index:Int;
	public var Direction:GsVoiceDirection;
	public var IsEmpty:Bool;
	
	public function IsRestVoice() : Bool
	{
		return this.Notes.length == 0;
	}
	
	public function new(factory:GsSongFactory, index:Int)
	{
		this.Duration = factory.NewDuration();
		this.Notes = new Array<GsNote>();
		this.Index = index;
		this.Direction = GsVoiceDirection.None;
		this.IsEmpty = true;
	}
	
	public function AddNote(note:GsNote) : Void
	{
		note.Voice = this;
		this.Notes.push(note);
		this.IsEmpty = false;
	}

}