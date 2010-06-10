/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

class GsMixTableItem
{
	public var Value:Int;
	public var Duration:Int;
	public var AllTracks:Bool;
	
	public function new() 
	{
		this.Value = 0;
		this.Duration = 0;
		this.AllTracks = false;
	}
}