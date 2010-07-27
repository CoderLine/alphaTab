/**
 * ...
 * @author Daniel Kuschny
 */
package net.alphatab.platform;
import net.alphatab.platform.js.Html5Canvas;
import net.alphatab.platform.js.JsFileLoader;
import net.alphatab.platform.php.PhpCanvas;
import net.alphatab.platform.php.PhpFileLoader;

class PlatformFactory
{
	public static function GetCanvas(object:Dynamic) : Canvas
	{
		#if js
			return new Html5Canvas(object);
		#elseif php
			return new PhpCanvas(object);
		#elseif flash
			return new net.alphatab.platform.flash.FlashCanvas(object);
		#else 
			#error 
		#end
	}
	
	public static function GetLoader() : FileLoader
	{ 
		#if js
			return new JsFileLoader();
		#elseif php
			return new PhpFileLoader();
		#elseif flash
			return new net.alphatab.platform.flash.FlashFileLoader();
		#else 
			#error 
		#end
	}

}