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
 package net.alphatab.file.loader;

import flash.external.ExternalInterface;
import flash.display.GraphicsPathWinding;
import flash.Lib;
import flash.events.Event;
import flash.text.TextField;
import flash.net.URLLoader;
import flash.net.URLLoaderDataFormat;
import haxe.Http;
import flash.utils.ByteArray;
import haxe.io.Bytes;
import haxe.remoting.Context;
import haxe.remoting.ExternalConnection;

class FlashFileLoader 
{
	static inline var SUCCESS:String = "net.alphatab.platform.js.JsFileLoader.onSuccess";
	static inline var ERROR:String = "net.alphatab.platform.js.JsFileLoader.onError";
	
	static var _cnx:ExternalConnection; 
	
	static function main() 
	{
		ExternalInterface.addCallback("loadFile", FlashFileLoader.loadBinaryFile);
	}
	
	public static function loadBinaryFile(url:String, method:String, uid:String) 
	{
		try
		{
			trace("Load: " + url + method + uid);
			var loader:URLLoader = new URLLoader();
			loader.dataFormat = URLLoaderDataFormat.BINARY;
			loader.addEventListener( "complete", function(e) {	
				var event:Event = cast e;			
				var bytes:ByteArray = cast loader.data;	
				var binaryString = "";
				for (i in 0 ... bytes.length) 
				{
					binaryString += StringTools.hex(bytes.readUnsignedByte(), 2);
				}
				trace(bytes.length);
				trace(binaryString.length);
				ExternalInterface.call(SUCCESS, uid, binaryString); 
			});
			loader.addEventListener( "ioError", function(e:flash.events.IOErrorEvent){
				//trace("IO: " + e.text);
				ExternalInterface.call(ERROR, uid, e.text);
			});
			loader.addEventListener( "securityError", function(e:flash.events.SecurityErrorEvent){
				//trace("Security: " + e.text);
				ExternalInterface.call(ERROR, uid, e.text);
			});
	
			var request = new flash.net.URLRequest( url );
			request.method = method;
	
			try {
				loader.load( request );
			}catch( e : Dynamic ){
				ExternalInterface.call(ERROR, uid, "Exception: "+Std.string(e));
			}
		}
		catch(e:Dynamic)
		{
			//trace(e);
		}
	}
	
}