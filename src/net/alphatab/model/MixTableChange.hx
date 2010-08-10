package net.alphatab.model;

/**
 * A mixtablechange describes several track changes. 
 */
class MixTableChange
{
	public var volume:MixTableItem;
	public var balance:MixTableItem;
	public var chorus:MixTableItem;
	public var reverb:MixTableItem;
	public var phaser:MixTableItem;
	public var tremolo:MixTableItem;
	public var instrument:MixTableItem;
	public var tempoName:String;
	public var tempo:MixTableItem;
	public var hideTempo:Bool;
	
	public function new()
	{
		volume = new MixTableItem();
		balance = new MixTableItem();
		chorus = new MixTableItem();
		reverb = new MixTableItem();
		phaser = new MixTableItem();
		tremolo = new MixTableItem();
		instrument = new MixTableItem();
		tempo = new MixTableItem();
		hideTempo = true;
	}
}