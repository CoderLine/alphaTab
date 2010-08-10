package net.alphatab.model;

/**
 * A song tempo in BPM. 
 */
class Tempo
{
	public var value:Int;
	
	public function inUsq() : Int
	{
		return tempoToUsq(value);
	}
	
	public function new()
	{
		value = 120;
	}
	
	public function copy(tempo:Tempo) : Void
	{
		value = tempo.value;
	}
	
	public static function tempoToUsq(tempo:Int) : Int
	{
		return Math.floor((60.00 / tempo * 1000) * 1000.00);
	}

}