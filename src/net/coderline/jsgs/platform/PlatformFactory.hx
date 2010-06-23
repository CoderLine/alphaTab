/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.platform;
import net.coderline.jsgs.platform.js.Html5Canvas;
import net.coderline.jsgs.platform.js.JsBinaryReader;
import net.coderline.jsgs.platform.js.JsFileLoader;

class PlatformFactory
{
	public static function GetCanvas(object:Dynamic) : Canvas
	{
		#if js
			return new Html5Canvas(object);
		/*#elseif php
			return new GdiCanvas(object);*/
		#else 
			#error 
		#end
	}
	
	public static function GetLoader() : FileLoader
	{
		#if js
			return new JsFileLoader();
		/*#elseif php
			return new PhpBinaryReader(object);*/
		#else 
			#error 
		#end
	}

}