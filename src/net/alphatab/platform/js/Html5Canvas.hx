/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.platform.js;

#if js
import net.alphatab.platform.Canvas;
import net.alphatab.platform.TextMetrics;


class Html5Canvas implements Canvas 
{
	private var canvas:Dynamic;
	private var jCanvas:JQuery;
	private var context:Dynamic;
	
	public function new(dom:Dynamic) 
	{
		this.canvas = dom;
		this.jCanvas = JQuery.Elements(dom);
		this.context = dom.getContext("2d");
	}
	
	public function Width():Int 
	{
		return this.jCanvas.Width();
	}
	public function Height():Int 
	{
		return this.jCanvas.Height();
	}
	public function SetWidth(width:Int):Void 
	{
		this.jCanvas.SetWidth(width);
		this.canvas.width = width;
		this.context = this.canvas.getContext("2d");
	}
	public function SetHeight(height:Int):Void 
	{
		this.jCanvas.SetHeight(height);
		this.canvas.height = height;
		this.context = this.canvas.getContext("2d");
	} 
	
	// colors and styles
	public var strokeStyle(getStrokeStyle, setStrokeStyle):String;
	
	private function getStrokeStyle() : String
	{
		return this.context.strokeStyle;
	} 
	private function setStrokeStyle(value:String) : String
	{
		this.context.strokeStyle = value; 
		return this.context.strokeStyle;
	}
	
	public var fillStyle(getFillStyle, setFillStyle):String;
	private function getFillStyle() : String
	{
		return this.context.fillStyle;
	}
	private function setFillStyle(value:String) : String
	{
		this.context.fillStyle = value;
		return this.context.fillStyle;
	}
	
	// line caps/joins
	public var lineWidth(getLineWidth, setLineWidth):Float;
	private function getLineWidth() : Float
	{
		return this.context.lineWidth;
	}
	private function setLineWidth(value:Float) : Float
	{
		this.context.lineWidth = value;
		return this.context.lineWidth;
	}
	
	// rects
	public function clearRect(x:Float, y:Float, w:Float, h:Float):Void
	{
		this.context.clearRect(x, y, w, h);
	}
	public function fillRect(x:Float, y:Float, w:Float, h:Float):Void
	{
		this.context.fillRect(x, y, w, h);
	}
	public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void
	{
		this.context.strokeRect(x, y, w, h);
	}

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
}

#end