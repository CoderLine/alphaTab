/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.midi;

/**
 * A container for grouping a beat-start and duration.
 */
class BeatData
{
	public var duration:Int;
	public var start:Int;
	
	public function new(start:Int, duration:Int)
	{
		this.start = start;
		this.duration = duration;
	}
}