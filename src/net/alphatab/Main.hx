package net.alphatab;
import net.alphatab.model.Song;
import net.alphatab.tablature.Tablature;


/**
 * The main entry point of this application.
 */
class Main 
{
	/**
	 * The main entry point of this application.
	 */
	static function main() 
	{		
		MyTrace.init();
		var un = haxe.Unserializer.run(haxe.Serializer.run('test'));
	}
}