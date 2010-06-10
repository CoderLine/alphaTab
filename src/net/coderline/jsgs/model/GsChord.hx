/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

class GsChord
{
	public var Beat:GsBeat;
	public var FirstFret:Int;
	public var Strings:Array<Int>;
	public function StringCount() : Int
	{
		return this.Strings.length;
	}
	public var Name:String;
	
	public function NoteCount() : Int
	{
		var count:Int = 0;
		for(i in 0 ... this.Strings.length)
		{
			if(this.Strings[i] >= 0)
				count++;
		}
		return count;
	}
	
	public function new(length:Int)
	{
		this.Strings = new Array<Int>();
		for(i in 0 ... length)
		{
			this.Strings.push( -1);
		}
	}
}