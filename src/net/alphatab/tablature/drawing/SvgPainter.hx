/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.drawing;
import net.alphatab.model.Point;
import net.alphatab.model.PointF;

class SvgPainter 
{
    private var Layer:DrawingLayer;
    private var Svg:String;
    private var X:Float;
    private var Y:Float;
    private var XScale:Float;
    private var YScale:Float;
    private var CurrentPosition:PointF;
    private var Token:Array<String>;
    private var CurrentIndex:Int;
	
	public function new(layer:DrawingLayer, svg:String, x:Float, y:Float, xScale:Float, yScale:Float) 
	{
		Layer = layer;
		Svg = svg;
		X = x;
		Y = y;
		XScale = xScale * 0.98;
		YScale = yScale * 0.98;
		CurrentPosition = new PointF(x, y);
		Token = svg.split(" ");
		CurrentIndex = 0;
	}
	
	public function Paint(): Void
	{
		this.Layer.StartFigure();
		while (this.CurrentIndex < this.Token.length)
		{
			this.ParseCommand();
		}
	}
	
	private function ParseCommand() 
	{
		var command = this.GetString();
        switch (command) {
            case "M": // absolute moveto
                this.CurrentPosition.X = (this.X + this.GetNumber() * this.XScale);
                this.CurrentPosition.Y = (this.Y + this.GetNumber() * this.YScale);
                this.Layer.MoveTo(this.CurrentPosition.X, this.CurrentPosition.Y);
            case "m": // relative moveto
                this.CurrentPosition.X += (this.GetNumber() * this.XScale);
                this.CurrentPosition.Y += (this.GetNumber() * this.YScale);
                this.Layer.MoveTo(this.CurrentPosition.X, this.CurrentPosition.Y);
            case "z":
            case "Z": // closePath
                this.Layer.CloseFigure();
            case "L": // absolute lineTo
                this.CurrentPosition.X = (this.X + this.GetNumber() * this.XScale);
                this.CurrentPosition.Y = (this.Y + this.GetNumber() * this.YScale);
                this.Layer.LineTo(this.CurrentPosition.X, this.CurrentPosition.Y);
            case "l": // relative lineTo
                this.CurrentPosition.X += (this.GetNumber() * this.XScale);
                this.CurrentPosition.Y += (this.GetNumber() * this.YScale);
                this.Layer.LineTo(this.CurrentPosition.X, this.CurrentPosition.Y);
            case "C": // absolute bezierTo
                var isNextNumber = true;
                do {
                    var x1:Float = (this.X + this.GetNumber() * this.XScale);
                    var y1:Float = (this.Y + this.GetNumber() * this.YScale);
                    var x2:Float = (this.X + this.GetNumber() * this.XScale);
                    var y2:Float = (this.Y + this.GetNumber() * this.YScale);
                    var x3:Float = (this.X + this.GetNumber() * this.XScale);
                    var y3:Float = (this.Y + this.GetNumber() * this.YScale);
                    this.CurrentPosition.X = (x3);
                    this.CurrentPosition.Y = (y3);
                    this.Layer.BezierTo(x1, y1, x2, y2, x3, y3);
                    isNextNumber = !this.IsNextCommand();
                }
                while (isNextNumber);
            case "c": // relative bezierTo
                var isNextNumber = true;
                do {
                    var x1:Float= (this.CurrentPosition.X + this.GetNumber() * this.XScale);
                    var y1:Float = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
                    var x2:Float = (this.CurrentPosition.X + this.GetNumber() * this.XScale);
                    var y2:Float = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
                    var x3:Float = (this.CurrentPosition.X + this.GetNumber() * this.XScale);
                    var y3:Float = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
                    this.CurrentPosition.X = x3;
                    this.CurrentPosition.Y = y3;
                    this.Layer.BezierTo(x1, y1, x2, y2, x3, y3);
                    isNextNumber = !this.IsNextCommand();
                }
                while (isNextNumber && this.CurrentIndex < this.Token.length);
            case "Q": // absolute quadraticCurveTo
                var isNextNumber = true;
                do {
                    var x1:Float = (this.X + this.GetNumber() * this.XScale);
                    var y1:Float = (this.Y + this.GetNumber() * this.YScale);
                    var x2:Float = (this.X + this.GetNumber() * this.XScale);
                    var y2:Float = (this.Y + this.GetNumber() * this.YScale);
                    this.CurrentPosition.X = x2;
                    this.CurrentPosition.Y = y2;
                    this.Layer.QuadraticCurveTo(x1, y1, x2, y2);
                    isNextNumber = !this.IsNextCommand();
                }
                while (isNextNumber);
            case "q": // relative quadraticCurveTo
                var isNextNumber = true;
                do {
                    var x1:Float = (this.CurrentPosition.X + this.GetNumber() * this.XScale);
                    var y1:Float = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
                    var x2:Float = (this.CurrentPosition.X + this.GetNumber() * this.XScale);
                    var y2:Float = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
                    this.CurrentPosition.X = x2;
                    this.CurrentPosition.Y = y2;
                    this.Layer.QuadraticCurveTo(x1, y1, x2, y2);
                    isNextNumber = !this.IsNextCommand();
                }
                while (isNextNumber && this.CurrentIndex < this.Token.length);
        }
	}
	
	private function GetNumber() : Float
	{
		return Std.parseFloat(this.Token[this.CurrentIndex++]);
	}
	
	private function IsNextCommand() : Bool
	{
        var command = this.PeekString();
        return command == "m" ||
        command == "M" ||
        command == "c" ||
        command == "C" ||
        command == "q" ||
        command == "Q" ||
        command == "l" ||
        command == "L" ||
        command == "z" ||
        command == "Z";
	}
		
	private function PeekString() : String
	{
		return this.Token[this.CurrentIndex];
	}
	
	private function PeekNumber() : Float
	{
		return Std.parseFloat(this.Token[this.CurrentIndex]);
	}
	private function GetString() : String
	{
		return this.Token[this.CurrentIndex++];
	}
}