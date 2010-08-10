package net.alphatab.model;

/**
 * A mixtableitem is a change of a mixtablechange. 
 * It describes a value change over time. 
 */
class MixTableItem
{
	public var value:Int;
	public var duration:Int;
	public var allTracks:Bool;
	
	public function new() 
	{
		value = 0;
		duration = 0;
		allTracks = false;
	}
}