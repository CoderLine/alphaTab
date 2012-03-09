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
package alphatab.platform;
import alphatab.platform.svg.SvgCanvas;

/**
 * This factory provides objects which require custom implementations 
 * for different platforms like PHP, JavaScript etc. 
 */
class PlatformFactory
{ 
    public static function getLoader() : IFileLoader
    { 
        #if neko 
        return new alphatab.platform.neko.NekoFileLoader();
        #elseif js
        return new alphatab.platform.js.JsFileLoader();
        #else
        return null;
        #end
    }
    
    public static var SVG_CANVAS = "svg";
    public static function getCanvas(object:Dynamic) : Canvas
    {
        if (object == SVG_CANVAS) // all Platforms
        {
            return new SvgCanvas();
        }
            
        // target conditionals
        #if js
        return new alphatab.platform.js.Html5Canvas(object);
        #else
        return new SvgCanvas();
        #end
    } 
}