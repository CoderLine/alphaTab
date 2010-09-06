package net.alphatab.platform;
import net.alphatab.platform.js.Html5Canvas;
import net.alphatab.platform.js.JsFileLoader;

/**
 * This factory provides objects which require custom implementations for different platforms like PHP, JavaScript etc. 
 */
class PlatformFactory
{
	public static function getCanvas(object:Dynamic) : Canvas
	{
		#if js
			return new Html5Canvas(object);
		#else 
			#error 
		#end
	} 
	
	public static function getLoader() : FileLoader
	{ 
		#if js
			return new JsFileLoader();
		#else 
			#error 
		#end
	}
}