/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsGuitarString
{
	public var Number:Int;
	public var Value:Int;
	
	public function new()
	{
		this.Number = 0;
		this.Value = 0;
	}
	
	public function Clone(factory:GsSongFactory) : GsGuitarString
	{
		var newString:GsGuitarString = factory.NewString();
		newString.Number = this.Number;
		newString.Value = this.Value;
		return newString;
	}

}