/**
 * ...
 * @author Zenas
 */
#if flash
package net.alphatab.platform.flash;
import flash.display.Graphics;
import flash.display.GraphicsPath;
import flash.display.MovieClip;
import flash.display.Shape;
import flash.geom.Point;
import flash.text.TextField;
import flash.text.TextFieldAutoSize;
import flash.text.TextFieldType;
import flash.text.TextFormat;
import net.alphatab.platform.Canvas;
import net.alphatab.platform.TextMetrics;

class FlashCanvas implements Canvas
{
	private var canvas:MovieClip;
	private var context:Graphics;
	
	private var _strokeStyle:Array<Int>;
	private var _fillStyle:Array<Int>;
	private var _lineWidth:Float;
	private var CurrentPosition:Point;
	private var _font:String;
	
	private var _measure:TextField;

	public function new(dom:Dynamic) 
	{
		_strokeStyle = [0, 0, 0];
		_fillStyle = [0, 0, 0];
		_lineWidth = 1;
		_font = "10px Arial";
		this.canvas = cast dom;
		this.context = canvas.graphics;
		CurrentPosition = new Point(0, 0);
		this.Path = new Array<Dynamic>();
		
		// create textfield for measuring
		_measure = new TextField();
		_measure.text = "MeasureField";
		_measure.selectable = false;
		_measure.setTextFormat(parseTextFormat(_font));
		_measure.x = 0;
		_measure.y = -100;
		_measure.autoSize = TextFieldAutoSize.LEFT;
		canvas.addChild(_measure);
	}
	
	public function Width():Int 
	{
		return canvas.stage.stageWidth;
	}
	public function Height():Int 
	{
		return canvas.stage.stageHeight;
	}
	public function SetWidth(width:Int):Void 
	{
		canvas.width = width;
		canvas.stage.stageWidth = width;
	}
	public function SetHeight(height:Int):Void 
	{
		canvas.height = height;
		canvas.stage.stageHeight = height;
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
		context.lineStyle(_lineWidth, calculateColor(_strokeStyle), 1.0, true);
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
		return getFillStyle();
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
		return _lineWidth;
	}
	
	// rects
	public function clearRect(x:Float, y:Float, w:Float, h:Float):Void
	{
		while (canvas.numChildren > 0) {
			canvas.removeChildAt(0);
		}
		this.context.clear();
		// reenable strokestyle (gets cleared too)
		setStrokeStyle(getStrokeStyle());
	}
	public function fillRect(x:Float, y:Float, w:Float, h:Float):Void
	{
		context.beginFill(0xFF0000);
		context.moveTo(x, y);
		context.lineTo(x+w, y);
		context.lineTo(x+w, y+h);
		context.lineTo(x, y+h);
		context.lineTo(x, y);
		context.endFill();
	}
	public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void
	{
		context.moveTo(x, y);
		context.lineTo(x+w, y);
		context.lineTo(x+w, y+h);
		context.lineTo(x, y+h);
		context.lineTo(x, y);
	}

	// path API
	private var Path:Array<Dynamic>;

	public function beginPath():Void
	{
		this.Path.push( { Command : "startFigure" } );
	}
	public function closePath():Void
	{
		this.Path.push( { Command : "closeFigure" } );
	}
	public function moveTo(x:Float, y:Float):Void
	{
		this.Path.push( {
            Command: "moveTo",
            X: x,
            Y: y
        });
	}
	public function lineTo(x:Float, y:Float):Void
	{
		this.Path.push({
			Command: "lineTo",
			X: x,
			Y: y
		});
	}
	public function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void
	{
		this.Path.push({
			Command: "quadraticCurveTo",
			X1: cpx,
			Y1: cpy,
			X2: x,
			Y2: y
		});
	}
	public function bezierCurveTo(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float):Void
	{
		this.Path.push({
			Command: "bezierTo",
			X1: cp1x,
			Y1: cp1y,
			X2: cp2x,
			Y2: cp2y,
			X3: x,
			Y3: y
		});
	}
	public function arcTo(x1:Float, y1:Float, x2:Float, y2:Float, radius:Float):Void
	{
		//this.context.arcTo(x1, y1, x2, y2, radius);
	}
	public function rect(x:Float, y:Float, w:Float, h:Float):Void
	{
		this.Path.push({
			Command: "addRect",
			X: x,
			Y: y,
			Width: w,
			Height: h
		});
	}
	public function arc(x:Float, y:Float, radius:Float, startAngle:Float, endAngle:Float, anticlockwise:Bool):Void
	{
		this.Path.push({
			Command: "addArc",
			X : x,
			Y : y,
			Radius : radius,
			StartAngle : startAngle,
			SweepAngle : endAngle - startAngle
		});
	}
	public function fill():Void
	{
		context.beginFill(calculateColor(_fillStyle));
		stroke();
		context.endFill();
	}
	
	private function drawBezierCurve(anchor1:Point, control1:Point, control2:Point, anchor2:Point) 
	{
		var posx:Float;
		var posy:Float;

		//loop through 100 steps of the curve
		var u:Float = 0;
		while (u <= 1)
		{
			posx = Math.pow(u,3)*(anchor2.x+3*(control1.x-control2.x)-anchor1.x)
			+3*Math.pow(u,2)*(anchor1.x-2*control1.x+control2.x)
			+3*u*(control1.x-anchor1.x)+anchor1.x;

			posy = Math.pow(u,3)*(anchor2.y+3*(control1.y-control2.y)-anchor1.y)
			+3*Math.pow(u,2)*(anchor1.y-2*control1.y+control2.y)
			+3*u*(control1.y-anchor1.y)+anchor1.y;

			context.lineTo(posx,posy);	
			u += 1 / 10;
		}
		context.lineTo(anchor2.x,anchor2.y);
	}
	
	public function stroke():Void
	{
		for (elm in this.Path) {
			try {
				switch (elm.Command) {
					case "moveTo":
						context.moveTo(elm.X, elm.Y);
						this.CurrentPosition.x = elm.X;
						this.CurrentPosition.y = elm.Y;
					case "lineTo":
						context.lineTo(elm.X, elm.Y);
						this.CurrentPosition.x = elm.X;
						this.CurrentPosition.y = elm.Y;
					case "bezierTo":
						drawBezierCurve(new Point(CurrentPosition.x, CurrentPosition.y), 
										new Point(elm.X1, elm.Y1),
										new Point(elm.X2, elm.Y2),
										new Point(elm.X3, elm.Y3));
						this.CurrentPosition.x = elm.X3;
						this.CurrentPosition.y = elm.Y3;
					case "quadraticCurveTo":
						context.curveTo(elm.X1, elm.Y1, elm.X2, elm.Y2);
						this.CurrentPosition.x = elm.X2;
						this.CurrentPosition.y = elm.Y2; 
					case "addLine":
						context.moveTo(elm.X1, elm.Y1);
						context.lineTo(elm.X2, elm.Y2);
					case "addArc":
						var twoPI:Float = 2 * Math.PI;
						var steps = 20;
						var angleStep = elm.SweepAngle/steps;
						var xx = elm.X + Math.cos(elm.StartAngle * twoPI) * elm.Radius;
						var yy = elm.Y + Math.sin(elm.StartAngle * twoPI) * elm.Radius;

						moveTo(xx, yy);
						for(i in 1 ... steps + 1){
							var angle = elm.StartAngle + i * angleStep;
							xx = elm.X + Math.cos(angle * twoPI) * elm.Radius;
							yy = elm.Y + Math.sin(angle * twoPI) * elm.Radius;
							lineTo(xx, yy);
						}
					case "addBezier":
						drawBezierCurve(new Point(elm.X1, elm.Y1), new Point(elm.X2, elm.Y2), new Point(elm.X3, elm.Y3), new Point(elm.X4, elm.Y4));
					case "addRect":
						context.moveTo(elm.X, elm.Y);
						context.lineTo(elm.X + elm.Width, elm.Y);
						context.lineTo(elm.X + elm.Width, elm.Y + elm.Height);
						context.lineTo(elm.X, elm.Y + elm.Height);
						context.lineTo(elm.X, elm.Y);
				}
			}
			catch(err:String) {
				throw err;
			}
		}
	}
	
	private function parseTextFormat(str:String) : TextFormat
	{
		var regex:EReg = ~/([a-z]*)([0-9]+)px (.*)/i;
		if (regex.match(str))
		{
			var size:Int = Std.parseInt(regex.matched(2));
			var font:String = regex.matched(3);
			var style:String = regex.matched(1);
			var italic:Bool = StringTools.trim(style) == "italic";
			return new TextFormat(font, size, calculateColor(_fillStyle), false, italic);
		}
		return new TextFormat("Arial", 12, calculateColor(_fillStyle));
	}

	// text
	public var font(getFont, setFont):String; 
	private function getFont() : String
	{
		return _font;
	}
	private function setFont(value:String) : String
	{
		_font = value;
		_measure.setTextFormat(parseTextFormat(_font));
		return _font;
	}

	public var textAlign(getTextAlign, setTextAlign):String; 
	private function getTextAlign() : String
	{
		return "";
	}
	private function setTextAlign(value:String) : String
	{
		return "";
	}
	
	public var textBaseline(getTextBaseline, setTextBaseline):String; 
	private function getTextBaseline() : String
	{
		return "";
	}
	private function setTextBaseline(value:String) : String
	{
		return "";
	}
	
	public function fillText(str:String, x:Float, y:Float, maxWidth:Float = 0):Void
	{
		var text:TextField = new TextField();
		text.text = str;
		text.selectable = false;
		text.setTextFormat(parseTextFormat(_font));
		text.x = x;
		text.y = y;
		text.autoSize = TextFieldAutoSize.LEFT;
		canvas.addChild(text);
	}
	public function strokeText(str:String, x:Float, y:Float, maxWidth:Float = 0):Void
	{
		var text:TextField = new TextField();
		text.text = str;
		text.selectable = false;
		text.setTextFormat(parseTextFormat(_font));
		text.x = x;
		text.y = y;
		text.autoSize = TextFieldAutoSize.LEFT;
		canvas.addChild(text);
	}
	public function measureText(text:String):TextMetrics
	{
		_measure.text = text;
		return new FlashTextMetrics(_measure.textWidth);
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
	
	
	private static function calculateColor(value:Array<Int>):Int 
	{
		return ((value[0] << 16) | (value[1] << 8) | value[2]);
	}
}
#end