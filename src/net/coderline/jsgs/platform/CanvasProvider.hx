/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.platform;
import net.coderline.jsgs.platform.js.Html5Canvas;

class CanvasProvider 
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
}