/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.file;
import haxe.io.Bytes;
import haxe.io.Input;

import net.coderline.jsgs.file.guitarpro.Gp3Reader;
import net.coderline.jsgs.file.guitarpro.Gp4Reader;
import net.coderline.jsgs.file.guitarpro.Gp5Reader;
import net.coderline.jsgs.model.GsSong;
import net.coderline.jsgs.model.GsSongFactory;

class SongReader 
{
	public var Data:BinaryReader;
	public var Factory:GsSongFactory;

	public static function AvailableReaders() : Array<SongReader>
	{
		var d:Array<SongReader> = new Array<SongReader>();
		d.push(new Gp5Reader());
		d.push(new Gp4Reader());
		d.push(new Gp4Reader());
		return d;
	}

	public function new() 
	{
	}
	
	public function Init(data:BinaryReader, factory:GsSongFactory) : Void 
	{
		this.Data = data;
		this.Factory = factory;
	}
	
	public function ReadSong(): GsSong
	{
		return new GsSong();
	}	
}