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
package net.alphatab.tablature.drawing;
import net.alphatab.model.Color;
import net.alphatab.model.Point;
import net.alphatab.model.PointF;
import net.alphatab.platform.Canvas;

/**
 * A drawing layer is a storage for drawing commands. 
 * A layer is either stroked or filled.
 */
class DrawingLayer 
{
	private var _path:Array<Dynamic>;
	private var _color:Color;
	private var _isFilled:Bool;
	private var _penWidth:Float;
	private var _currentPosition:Point;
	
	public function new(color:Color, isFilled:Bool, penWidth:Float) 
	{
		_path = new Array<Dynamic>();
		_color = color;
		_isFilled = isFilled;
		_penWidth = penWidth;
		_currentPosition = new Point(0, 0);
	}
	
	public function draw(graphics:Canvas) : Void
	{
		graphics.textBaseline = "middle";
        graphics.fillStyle = _color.toString();
        graphics.strokeStyle = _color.toString();
		graphics.lineWidth = _penWidth;

        graphics.beginPath();
		for (elm in _path) {
			try {
				switch (elm.Command) {
					case "startFigure":
						finish(graphics);
						graphics.beginPath();
					case "closeFigure":
                        graphics.closePath();
						//finish(graphics);
					case "moveTo":
						graphics.moveTo(elm.X, elm.Y);
						_currentPosition.x = elm.X;
						_currentPosition.y = elm.Y;
					case "lineTo":
						graphics.lineTo(elm.X, elm.Y);
						_currentPosition.x = elm.X;
						_currentPosition.y = elm.Y;
					case "bezierTo":
						graphics.bezierCurveTo(elm.X1, elm.Y1, elm.X2, elm.Y2, elm.X3, elm.Y3);
						_currentPosition.x = elm.X3;
						_currentPosition.y = elm.Y3;
					case "quadraticCurveTo":
						graphics.quadraticCurveTo(elm.X1, elm.Y1, elm.X2, elm.Y2);
						_currentPosition.x = elm.X2;
						_currentPosition.y = elm.Y2; 
					case "rectTo":
						graphics.rect(_currentPosition.x, _currentPosition.y, elm.Width, elm.Height);
					case "circleTo":
						graphics.circle(_currentPosition.x + elm.Radius, _currentPosition.y + elm.Radius, elm.Radius);
					case "addString":
						graphics.textBaseline = elm.BaseLine;
						graphics.font = elm.Font;
						graphics.fillText(elm.Text, elm.X, elm.Y);
					case "addLine":
						graphics.moveTo(elm.X1, elm.Y1);
						graphics.lineTo(elm.X2, elm.Y2);
					case "addPolygon":
						finish(graphics);
						graphics.beginPath();
						graphics.moveTo(elm.Points[0].x, elm.Points[0].y);
						var pts:Array<PointF> = cast elm.Points;
						for (pt in pts) {
							graphics.lineTo(pt.x, pt.y);
						}
						graphics.closePath();
						finish(graphics);
						graphics.beginPath();
					case "addBezier":
						graphics.moveTo(elm.X1, elm.Y1);
						graphics.bezierCurveTo(elm.X2, elm.Y2, elm.X3, elm.Y3, elm.X4, elm.Y4);
					case "addCircle":
						finish(graphics);
						graphics.circle(elm.X + elm.Radius, elm.Y + elm.Radius, elm.Radius);
					case "addRect":
						graphics.rect(elm.X, elm.Y, elm.Width, elm.Height);
				}
			}
			catch(err:String) {
				throw err;
			}
		}
        finish(graphics);
	}
	
	public function startFigure(): Void
	{
		_path.push( { Command : "startFigure" } );
	}
	
	public function closeFigure(): Void
	{
		_path.push( { Command : "closeFigure" } );
	}
	
	public function moveTo(x:Float, y:Float): Void
	{
		_path.push( {
            Command: "moveTo",
            X: Math.round(x) + 0.5,
            Y: Math.round(y) + 0.5
        });
	}
	
	public function bezierTo(x1:Float, y1:Float, x2:Float, y2:Float, x3:Float, y3:Float): Void{
		_path.push({
			Command: "bezierTo",
			X1: x1,
			Y1: y1,
			X2: x2,
			Y2: y2,
			X3: x3,
			Y3: y3
		});
	}
	public function quadraticCurveTo(x1:Float, y1:Float, x2:Float, y2:Float): Void{
		_path.push({
			Command: "quadraticCurveTo",
			X1: x1,
			Y1: y1,
			X2: x2,
			Y2: y2
		});
	}
	public function lineTo(x:Float,y:Float): Void{
		_path.push({
			Command: "lineTo",
			X: (x) + 0.5,
			Y: (y) + 0.5
		});
	}
	public function circleTo(diameter:Float): Void{
		_path.push({
			Command: "circleTo",
			Radius: diameter/2
		});
	}
	public function addString(str:String, font:String, x:Float,y:Float, baseline:String="middle"): Void{
		_path.push({
			Command: "addString",
			Text: str,
			Font: font,
			X: (x) + 0.5,
			Y: (y) + 0.5,
			BaseLine:baseline
		});
	}
	public function addMusicSymbol(symbol:String, x:Float, y:Float, xScale:Float, yScale:Float = 0): Void {
		
		if (yScale == 0)
		{
			yScale = xScale;
		}
		var painter = new SvgPainter(this, symbol, x, y, xScale, yScale);
		painter.paint();
	}
	public function addLine(x1:Float, y1:Float, x2:Float, y2:Float): Void {
		
		_path.push({
			Command: "addLine",
			X1: (x1) + 0.5,
			Y1: (y1) + 0.5,
			X2: (x2) + 0.5,
			Y2: (y2) + 0.5
		});
	}
	
	public function addPolygon(points:Array<PointF>): Void{
		_path.push({
			Command: "addPolygon",
			Points: points
		});
	}

	public function addBezier (x1:Int, y1:Int, x2:Int, y2:Int, x3:Int, y3:Int, x4:Int, y4:Int): Void{
		_path.push({
			Command: "addBezier",
			X1: x1,
			Y1: y1,
			X2: x2,
			Y2: y2,
			X3: x3,
			Y3: y3,
			X4: x4,
			Y4: y4
		});
	}

	public function addCircle (x:Int,y:Int,diameter:Float): Void{
		_path.push({
			Command: "addCircle",
			X: x,
			Y: y,
			Radius: diameter/2
		});
	}

	public function addRect (x:Int,y:Int,w:Int,h:Int): Void{
		_path.push({
			Command: "addRect",
			X: x,
			Y: y,
			Width: w,
			Height: h
		});
	}

	public function rectTo (w:Int, h:Int) : Void {
		_path.push({Command: "rectTo",
		Width: w,
		Height: h});
	}
	
	public function clear(): Void
	{
		_path = new Array<Dynamic>();
	}
	
	public function finish(graphics:Canvas): Void
	{
		if (_isFilled) 
		{
			graphics.fill();
		}
		else
		{
			graphics.stroke();
		}
	}
}
