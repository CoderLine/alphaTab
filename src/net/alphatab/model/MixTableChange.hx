/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
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