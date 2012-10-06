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

import alphatab.model.TextBaseline;
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;
import alphatab.platform.model.TextAlign;

/**
 * This is the base interface for canvas implementations on different plattforms.
 */
interface ICanvas 
{
	function getWidth() : Int;
	function setWidth(width:Int) : Void;
	
	function getHeight() : Int;
	function setHeight(height:Int) : Void;
	
    // colors and styles
	function setColor(color : Color) : Void; 
        
    // line caps/joins
	function setLineWidth(width:Float) : Void;
    
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
	function setFont(font:Font) : Void;
	
	function getTextAlign() : TextAlign;
	function setTextAlign(textAlign:TextAlign) : Void;
	function getTextBaseline() : TextBaseline;
	function setTextBaseline(textBaseLine:TextBaseline) : Void;
	
    function fillText(text:String, x:Float, y:Float):Void;
    function strokeText(text:String, x:Float, y:Float):Void;
    function measureText(text:String):Float;    
}