/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

class GsTempo
{
	public var Value:Int;
	
	public function InUsq() : Int
	{
		return TempoToUsq(this.Value);
	}
	
	public function new()
	{
		this.Value = 120;
	}
	
	public function Copy(tempo:GsTempo) : Void
	{
		tempo.Value = this.Value;
	}
	
	public static function TempoToUsq(tempo:Int) : Int
	{
		return Math.floor((60.00 / tempo * 1000) * 1000.00);
	}

}