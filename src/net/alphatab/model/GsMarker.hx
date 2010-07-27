/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsMarker
{
	private static inline var DefaultColor:GsColor = new GsColor(255,0,0);
	private static inline var DefaultTitle:String = "Untitled";
	
	public var Title:String;
	public var Color:GsColor;
	public var MeasureHeader:GsMeasureHeader;
	
	public function new()
	{
		this.Title = DefaultTitle;
		this.Color = DefaultColor;
	}

}