/**
 * ...
 * @author Zenas
 */

package net.alphatab.platform.php;
#if php
import net.alphatab.model.effects.GsBendTypes;
import net.alphatab.platform.Canvas;
import net.alphatab.platform.TextMetrics;

class PhpCanvas implements Canvas
{
	private var canvas:Dynamic;
	private var _strokeStyle:Array<Int>;
	private var _strokeColor:Dynamic;
	private var _fillStyle:Array<Int>;
	private var _fillColor:Dynamic;
	private var _lineWidth:Float;
	
	public function new(dom:Dynamic) 
	{
		this.canvas = GdWrapper.imageCreateTrueColor(1, 1);
	}
	
	public function Width():Int 
	{
		return GdWrapper.imageSx(canvas);
	}
	public function Height():Int 
	{
		return GdWrapper.imageSy(canvas);
	}
	public function SetWidth(width:Int):Void 
	{
		var newImg = GdWrapper.imageCreateTrueColor(width, Height());
		GdWrapper.imageCopy(newImg, canvas, 0, 0, 0, 0, Width(), Height());
		canvas = newImg;
	}
	public function SetHeight(height:Int):Void 
	{
		var newImg = GdWrapper.imageCreateTrueColor(Width(), height);
		GdWrapper.imageCopy(newImg, canvas, 0, 0, 0, 0, Width(), Height());
		canvas = newImg;
	} 
	
	// colors and styles
	public var strokeStyle(getStrokeStyle, setStrokeStyle):String;
	
	private function getStrokeStyle() : String
	{
		return colorToString(_strokeStyle);
	} 
	private function setStrokeStyle(value:String) : String
	{
		_strokeStyle = stringToColor(value);
		_strokeColor = GdWrapper.imageColorAllocate(canvas, _strokeStyle[0], _strokeStyle[1], _strokeStyle[2]);
		return getStrokeStyle();
	}
	
	public var fillStyle(getFillStyle, setFillStyle):String;
	private function getFillStyle() : String
	{
		return colorToString(_fillStyle);
	}
	private function setFillStyle(value:String) : String
	{
		_fillStyle = stringToColor(value);
		_fillColor = GdWrapper.imageColorAllocate(canvas, _fillStyle[0], _fillStyle[1], _fillStyle[2]);
		return getFillStyle();
	}
	
	private static function stringToColor(value:String) : Array<Int>
	{
		// #RRGGBB or rgb(r, g, b)
		var r1:EReg = ~/#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i;
		var r2:EReg = ~/#rgb\s*\(\s*([0-9]{3})\s*,\s*([0-9]{3})\s*,\s*([0-9]{3})\s*\)/i;
		if (r1.match(value))
		{ 
			var r = Std.parseInt('0x' + r1.matched(1));
			var g = Std.parseInt('0x' + r1.matched(2));
			var b = Std.parseInt('0x' + r1.matched(3));
			return [r, g, b];
		}
		else if (r2.match(value)) 
		{
			var r = Std.parseInt(r2.matched(1));
			var g = Std.parseInt(r2.matched(2));
			var b = Std.parseInt(r2.matched(3));
			return [r, g, b];
		}
		else
		{
			return [0, 0, 0];
		}		
	}
	
	private static function colorToString(value:Array<Int>):String 
	{
		return "#" + StringTools.hex(value[0]) + 
		StringTools.hex(value[1]) + 
		StringTools.hex(value[2]);
	}
	
	
	
	// line caps/joins
	public var lineWidth(getLineWidth, setLineWidth):Float;
	private function getLineWidth() : Float
	{
		return _lineWidth;
	}
	private function setLineWidth(value:Float) : Float
	{
		_lineWidth = value;
		GdWrapper.imageSetThickness(Math.round(value));
		return value;
	}
	
	
	// rects
	public function clearRect(x:Float, y:Float, w:Float, h:Float):Void
	{
		// TODO: this.context.clearRect(x, y, w, h);
	}
	public function fillRect(x:Float, y:Float, w:Float, h:Float):Void
	{
		GdWrapper.imageFilledRectangle(canvas, x, y, x + w, y + h, _fillColor);
	}
	public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void
	{
		GdWrapper.imageRectangle(canvas, x, y, x + w, y + h, _strokeColor);
	}
/*
	// path API
	public function beginPath():Void
	{
		this.context.beginPath();
	}
	public function closePath():Void
	{
		this.context.closePath();
	}
	public function moveTo(x:Float, y:Float):Void
	{
		this.context.moveTo(x, y);
	}
	public function lineTo(x:Float, y:Float):Void
	{
		this.context.lineTo(x, y);
	}
	public function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void
	{
		this.context.quadraticCurveTo(cpx, cpy, x, y);
	}
	public function bezierCurveTo(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float):Void
	{
		this.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	}
	public function arcTo(x1:Float, y1:Float, x2:Float, y2:Float, radius:Float):Void
	{
		this.context.arcTo(x1, y1, x2, y2, radius);
	}
	public function rect(x:Float, y:Float, w:Float, h:Float):Void
	{
		this.context.rect(x, y, w, h);
	}
	public function arc(x:Float, y:Float, radius:Float, startAngle:Float, endAngle:Float, anticlockwise:Bool):Void
	{
		this.context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
	}
	public function fill():Void
	{
		this.context.fill();
	}
	public function stroke():Void
	{
		this.context.stroke();
	}

	// text
	public var font(getFont, setFont):String; 
	private function getFont() : String
	{
		return this.context.font;
	}
	private function setFont(value:String) : String
	{
		this.context.font = value;
		return this.context.font;
	}

	public var textAlign(getTextAlign, setTextAlign):String; 
	private function getTextAlign() : String
	{
		return this.context.textAlign;
	}
	private function setTextAlign(value:String) : String
	{
		this.context.textAlign = value;
		return this.context.textAling;
	}
	
	public var textBaseline(getTextBaseline, setTextBaseline):String; 
	private function getTextBaseline() : String
	{
		return this.context.textBaseline;
	}
	private function setTextBaseline(value:String) : String
	{
		this.context.textBaseline = value;
		return this.context.textBaseLine;
	}
	
	public function fillText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void
	{
		if (maxWidth == 0)
		{
			this.context.fillText(text, x, y);
		}
		else
		{
			this.context.fillText(text, x, y, maxWidth);
		}
	}
	public function strokeText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void
	{
		if (maxWidth == 0)
		{
			this.context.strokeText(text, x, y);
		}
		else
		{
			this.context.strokeText(text, x, y, maxWidth);
		}
	}
	public function measureText(text:String):TextMetrics
	{
		return cast this.context.measureText(text);
	}
	*/
}
#end