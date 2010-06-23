/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.midi;

class BeatData
{
	public var Duration:Int;
	public var Start:Int;
	
	public function new(start:Int, duration:Int)
	{
		Start = start;
		Duration = duration;
	}

}