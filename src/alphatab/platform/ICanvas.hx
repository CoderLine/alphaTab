package alphatab.platform;
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
	
	function setTextAlign(textAlign:TextAlign) : Void;
	
    function fillText(text:String, x:Float, y:Float):Void;
    function strokeText(text:String, x:Float, y:Float):Void;
    function measureText(text:String):Float;    
}