package net.alphatab.file.loader;

import flash.display.GraphicsPathWinding;
import flash.Lib;
import flash.net.URLLoader;
import flash.net.URLLoaderDataFormat;
import haxe.Http;
import haxe.io.Bytes;
import haxe.remoting.Context;
import haxe.remoting.ExternalConnection;

/**
 * ...
 * @author Zenas
 */

class Main 
{
	private static var cnx:ExternalConnection; 
	static function main() 
	{
		var ctx = new haxe.remoting.Context();
		ctx.addObject("FlashFileLoader",Main);
		cnx = ExternalConnection.jsConnect("default", ctx);
	}
	
	public static function LoadBinaryFile(url:String, post:Bool, onSuccess : String -> Void, onError : String -> Void) 
	{
		var loader:URLLoader = new URLLoader();
		loader.dataFormat = URLLoaderDataFormat.BINARY;
		loader.addEventListener( "complete", function(e) {
			var bytes:Bytes = cast e;
			var binaryString = "";
			for (i in 0 ... bytes.length) 
			{
				binaryString += String.fromCharCode(bytes.get(i));
			}
			onSuccess( binaryString );
		});
		loader.addEventListener( "ioError", function(e:flash.events.IOErrorEvent){
			onError(e.text);
		});
		loader.addEventListener( "securityError", function(e:flash.events.SecurityErrorEvent){
			onError(e.text);
		});

		var request = new flash.net.URLRequest( url );
		request.method = if( post ) "POST" else "GET";

		try {
			loader.load( request );
		}catch( e : Dynamic ){
			onError("Exception: "+Std.string(e));
		}
	}
	
}