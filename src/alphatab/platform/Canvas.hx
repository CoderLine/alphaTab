package alphatab.platform;

/**
 * This is the base interface for canvas implementations on different plattforms.
 */
interface Canvas 
{
	function width():Int;
	function height():Int;
	function setWidth(width:Int):Void;
	function setHeight(height:Int):Void;
		
	// colors and styles
	var strokeStyle(getStrokeStyle, setStrokeStyle):String; //(default black);
	var fillStyle(getFillStyle, setFillStyle):String; //(default black);
		
	// line caps/joins
	var lineWidth(getLineWidth, setLineWidth):Float; // (default 1)
	
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
	var font(getFont, setFont):String; // (default 10px sans-serif)
	var textBaseline(getTextBaseline, setTextBaseline):String; // "top", "hanging", "middle", "alphabetic", "ideographic", "bottom" (default: "alphabetic")
	function fillText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void;
	function strokeText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void;
	function measureText(text:String):Float;	
}