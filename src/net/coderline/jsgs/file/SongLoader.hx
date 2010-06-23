/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.file;
import haxe.Http;
import haxe.io.StringInput;
import haxe.Log;
import net.coderline.jsgs.model.GsSong;
import net.coderline.jsgs.model.GsSongFactory;
import net.coderline.jsgs.platform.BinaryReader;
import net.coderline.jsgs.platform.FileLoader;
import net.coderline.jsgs.platform.PlatformFactory;

class SongLoader 
{
	public static function LoadSong(url:String, factory:GsSongFactory, success:GsSong->Void) 
	{
		var loader:FileLoader = PlatformFactory.GetLoader();
		Log.trace("Load song " + url);
		loader.LoadBinary("GET", url, 
		// success
		function(data:BinaryReader) : Void {
			var readers:Array<SongReader> = SongReader.AvailableReaders();
			Log.trace("Song loaded, search for reader");
			for (reader in readers) 
			{
				try
				{
					Log.trace("Try Reader " + Type.getClassName(Type.getClass(reader)));
					data.seek(0);
					reader.Init(data, factory);
					var song:GsSong = reader.ReadSong();
					Log.trace("Reading succeeded");
					success(song);
					return;
				}
				catch (e:FileFormatException) {
					Log.trace("Reading failed");
					continue;
				}
			}
			throw new FileFormatException("No reader for requested file found");

		},
		// error
		function(err:String) : Void
		{
			Log.trace("Error loading file " + err);
			throw err;
		});		
	}
}