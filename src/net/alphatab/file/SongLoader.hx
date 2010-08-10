package net.alphatab.file;
import haxe.Http;
import haxe.io.StringInput;
import haxe.Log;
import net.alphatab.model.Song;
import net.alphatab.model.SongFactory;
import net.alphatab.platform.BinaryReader;
import net.alphatab.platform.FileLoader;
import net.alphatab.platform.PlatformFactory;

/**
 * A wrapper for reading songs. 
 */
class SongLoader 
{
	public static function loadSong(url:String, factory:SongFactory, success:Song->Void) 
	{
		var loader:FileLoader = PlatformFactory.getLoader();
		Log.trace("Load song " + url);
		loader.loadBinary("GET", url, 
		// success
		function(data:BinaryReader) : Void 
		{
			var readers:Array<SongReader> = SongReader.availableReaders();
			Log.trace("Song loaded, search for reader");
			for (reader in readers) 
			{
				try
				{
					Log.trace("Try Reader " + Type.getClassName(Type.getClass(reader)));
					data.seek(0);
					reader.init(data, factory);
					var song:Song = reader.readSong();
					Log.trace("Reading succeeded");
					success(song);
					return;
				}
				catch (e:FileFormatException) 
				{
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