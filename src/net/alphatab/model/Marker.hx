package net.alphatab.model;

/**
 * A marker annotation for beats
 */
class Marker
{
	private static inline var DEFAULT_COLOR:Color = Color.Red;
	private static inline var DEFAULT_TITLE:String = "Untitled";
	
	public var title:String;
	public var color:Color;
	public var measureHeader:MeasureHeader;
	
	public function new()
	{
	}
}