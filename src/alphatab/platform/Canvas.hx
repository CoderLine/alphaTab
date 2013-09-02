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

/**
 * This is the base interface for canvas implementations on different plattforms.
 */
interface Canvas 
{
    var width(get, set):Int;
    var height(get, set):Int;
        
    // colors and styles
    var strokeStyle(get, set):String; //(default black);
    var fillStyle(get, set):String; //(default black);
        
    // line caps/joins
    var lineWidth(get, set):Float; // (default 1)
    
    // rects
    function clear():Void;
    function fillRect(x:Float, y:Float, w:Float, h:Float):Void;
    function strokeRect(x:Float, y:Float, w:Float, h:Float):Void;

    // path API
    function beginPath():Void;
    function closePath():Void;
    function moveTo(x:Float, y:Float):Void;
    function lineTo(x:Float, y:Float):Void;
    function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void;
    function bezierCurveTo(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float):Void;
    function rect(x:Float, y:Float, w:Float, h:Float):Void;
    function circle(x:Float, y:Float, radius:Float):Void;
    function fill():Void;
    function stroke():Void;

    // text
    var font(get, set):String; // (default 10px sans-serif)
    var textBaseline(get, set):String; // "top", "hanging", "middle", "alphabetic", "ideographic", "bottom" (default: "alphabetic")
    var textAlign(get, set):String; // "left", "right", "center", "start", "end"
    function fillText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void;
    function strokeText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void;
    function measureText(text:String):Float;    
}