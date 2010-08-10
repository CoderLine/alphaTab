package net.alphatab.model;

/**
 * A lyrics line. 
 */
class LyricLine
{
	public var startingMeasure:Int;
	public var lyrics:String;
	
	public function new(startingMeasure:Int = 0, lyrics:String = "")
	{
		this.startingMeasure = startingMeasure;
		this.lyrics = lyrics;
	}
}