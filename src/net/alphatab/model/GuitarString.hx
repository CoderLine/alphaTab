package net.alphatab.model;

/**
 * A guitar string with a special tuning.
 */
class GuitarString
{
	public var number:Int;
	public var value:Int;
	
	public function new()
	{
		number = 0;
		value = 0;
	}
	
	public function clone(factory:SongFactory) : GuitarString
	{
		var newString:GuitarString = factory.newString();
		newString.number = number;
		newString.value = value;
		return newString;
	}
}