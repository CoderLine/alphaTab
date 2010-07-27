/**
 * ...
 * @author Zenas
 */

package net.alphatab.platform.flash;
import flash.net.URLLoader;
import flash.net.URLLoaderDataFormat;
import flash.utils.ByteArray;
import haxe.Http;
import net.alphatab.platform.BinaryReader;
import net.alphatab.platform.FileLoader;

class FlashFileLoader implements FileLoader
{

	public function new() 
	{
		
	}
	
	public function LoadBinary(method:String, file:String, success:BinaryReader->Void, error:String->Void) : Void
	{
		var loader:URLLoader = new URLLoader();
		loader.dataFormat = URLLoaderDataFormat.BINARY;
		loader.addEventListener( "complete", function(e) {
			// the binaryreader uses a string 
			var binaryData:ByteArray = loader.data;
			var stringData:String = "";
			for (i in 0 ... binaryData.length)
			{
				stringData += String.fromCharCode(binaryData.readByte());
			}
			var reader:BinaryReader = new BinaryReader();
			reader.initialize(stringData);
			success(reader);
		});
		loader.addEventListener( "ioError", function(e:flash.events.IOErrorEvent){
			error(e.text);
		});
		loader.addEventListener( "securityError", function(e:flash.events.SecurityErrorEvent){
			error(e.text);
		});

		// headers
		var request = new flash.net.URLRequest( file );
		request.method = method;

		try {
			loader.load( request );
		}catch( e : Dynamic ){
			error("Exception: "+Std.string(e));
		}
	}
}