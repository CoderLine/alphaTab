package alphatab.platform;
import alphatab.platform.js.Html5Canvas;
import alphatab.platform.js.JsFileLoader;
import alphatab.platform.svg.SvgCanvas;

/**
 * This factory provides objects which require custom implementations for different platforms like PHP, JavaScript etc. 
 */
class PlatformFactory
{
	public static var SVG_CANVAS = "svg";
    public static function getCanvas(object:Dynamic) : Canvas
    {
		if (object == SVG_CANVAS)
		{
			return new SvgCanvas();
		}
		else {
			#if js
				return new Html5Canvas(object);
			#else 
				return new SvgCanvas();
			#end
		}
    } 
    
    public static function getLoader() : FileLoader
    { 
        #if js
            return new JsFileLoader();
        #else 
            return null;//#error 
        #end
    }
}