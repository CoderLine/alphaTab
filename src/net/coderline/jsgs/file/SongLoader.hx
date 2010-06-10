/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.file;
import haxe.Http;
import haxe.io.StringInput;
import net.coderline.jsgs.model.GsSong;
import net.coderline.jsgs.model.GsSongFactory;

class SongLoader 
{
	public static function LoadSong(url:String, factory:GsSongFactory, success:GsSong->Void) 
	{
		FileLoader.LoadBinary(url, "GET", 
		// success
		function(data:BinaryReader) : Void {
			var readers:Array<SongReader> = SongReader.AvailableReaders();
		
			for (reader in readers) 
			{
				try
				{
					data.seek(0);
					reader.Init(data, factory);
					success(reader.ReadSong());
				}
				catch (e:FileFormatException) {
					continue;
				}
			}
			throw new FileFormatException("No reader for requested file found");

		},
		// error
		function(err:String) : Void
		{
			throw err;
		});
		
		
		
	}
}