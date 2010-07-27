/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsLyricLine
{
	public var StartingMeasure:Int;
	public var Lyrics:String;
	
	public function new(startingMeasure:Int = 0, lyrics:String = "")
	{
		this.StartingMeasure = startingMeasure;
		this.Lyrics = lyrics;
	}

}