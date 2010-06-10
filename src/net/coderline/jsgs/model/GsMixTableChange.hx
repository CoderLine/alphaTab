/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

class GsMixTableChange
{
	public var Volume:GsMixTableItem;
	public var Balance:GsMixTableItem;
	public var Chorus:GsMixTableItem;
	public var Reverb:GsMixTableItem;
	public var Phaser:GsMixTableItem;
	public var Tremolo:GsMixTableItem;
	public var Instrument:GsMixTableItem;
	public var TempoName:String;
	public var Tempo:GsMixTableItem;
	public var HideTempo:Bool;
	
	public function new()
	{
		this.Volume = new GsMixTableItem();
		this.Balance = new GsMixTableItem();
		this.Chorus = new GsMixTableItem();
		this.Reverb = new GsMixTableItem();
		this.Phaser = new GsMixTableItem();
		this.Tremolo = new GsMixTableItem();
		this.Instrument = new GsMixTableItem();
		this.Tempo = new GsMixTableItem();
		this.HideTempo = true;
	}
}