/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.drawing;
import haxe.remoting.FlashJsConnection;
import net.coderline.jsgs.model.GsColor;
import net.coderline.jsgs.model.Point;
import net.coderline.jsgs.model.PointF;
import net.coderline.jsgs.platform.Canvas;

class DrawingLayer 
{
	private var Path:Array<Dynamic>;
	private var Color:GsColor;
	private var IsFilled:Bool;
	private var PenWidth:Float;
	private var CurrentPosition:Point;
	
	public function new(color:GsColor, isFilled:Bool, penWidth:Float) 
	{
		this.Path = new Array<Dynamic>();
		this.Color = color;
		this.IsFilled = isFilled;
		this.PenWidth = penWidth;
		this.CurrentPosition = new Point(0, 0);
	}
	
	public function Draw(graphics:Canvas) : Void
	{
		graphics.textBaseline = "middle";
        graphics.fillStyle = this.Color.toString();
        graphics.strokeStyle = this.Color.toString();
		graphics.lineWidth = this.PenWidth;

        graphics.beginPath();
		for (elm in this.Path) {
			try {
				switch (elm.Command) {
					case "startFigure":
						this.Finish(graphics);
						graphics.beginPath();
					case "closeFigure":
                        graphics.closePath();
						//this.finish(graphics);
					case "moveTo":
						graphics.moveTo(elm.X, elm.Y);
						this.CurrentPosition.X = elm.X;
						this.CurrentPosition.Y = elm.Y;
					case "lineTo":
						graphics.lineTo(elm.X, elm.Y);
						this.CurrentPosition.X = elm.X;
						this.CurrentPosition.Y = elm.Y;
					case "bezierTo":
						graphics.bezierCurveTo(elm.X1, elm.Y1, elm.X2, elm.Y2, elm.X3, elm.Y3);
						this.CurrentPosition.X = elm.X3;
						this.CurrentPosition.Y = elm.Y3;
					case "quadraticCurveTo":
						graphics.quadraticCurveTo(elm.X1, elm.Y1, elm.X2, elm.Y2);
						this.CurrentPosition.X = elm.X2;
						this.CurrentPosition.Y = elm.Y2; 
					case "rectTo":
						graphics.rect(this.CurrentPosition.X, this.CurrentPosition.Y, elm.Width, elm.Height);
					case "addString":
						graphics.textBaseline = elm.BaseLine;
						graphics.font = elm.Font;
						graphics.fillText(elm.Text, elm.X, elm.Y);
					case "addLine":
						graphics.moveTo(elm.X1, elm.Y1);
						graphics.lineTo(elm.X2, elm.Y2);
					case "addPolygon":
						this.Finish(graphics);
						graphics.beginPath();
						graphics.moveTo(elm.Points[0].X, elm.Points[0].Y);
						var pts:Array<PointF> = cast elm.Points;
						for (pt in pts) {
							graphics.lineTo(pt.X, pt.Y);
						}
						graphics.closePath();
						this.Finish(graphics);
						graphics.beginPath();
					case "addArc":
						graphics.arc(elm.X, elm.Y, elm.Radius, elm.StartAngle, elm.SweepAngle, false);
					case "addBezier":
						graphics.moveTo(elm.X1, elm.Y1);
						graphics.bezierCurveTo(elm.X2, elm.Y2, elm.X3, elm.Y3, elm.X4, elm.Y4);
					case "addEllipse":
						this.Finish(graphics);
						this.DrawEllipse(graphics, elm.X, elm.Y, elm.Width, elm.Height);
						graphics.beginPath();
					case "addRect":
						graphics.rect(elm.X, elm.Y, elm.Width, elm.Height);
				}
			}
			catch(err:String) {
				throw err;
			}
		}
        this.Finish(graphics);
	}
	
	public function StartFigure(): Void
	{
		this.Path.push( { Command : "startFigure" } );
	}
	
	public function CloseFigure(): Void
	{
		this.Path.push( { Command : "closeFigure" } );
	}
	
	public function MoveTo(x:Float, y:Float): Void
	{
		this.Path.push( {
            Command: "moveTo",
            X: Math.round(x) + 0.5,
            Y: Math.round(y) + 0.5
        });
	}
	
	public function BezierTo(x1:Float, y1:Float, x2:Float, y2:Float, x3:Float, y3:Float): Void{
		this.Path.push({
			Command: "bezierTo",
			X1: x1,
			Y1: y1,
			X2: x2,
			Y2: y2,
			X3: x3,
			Y3: y3
		});
	}
	public function QuadraticCurveTo(x1:Float, y1:Float, x2:Float, y2:Float): Void{
		this.Path.push({
			Command: "quadraticCurveTo",
			X1: x1,
			Y1: y1,
			X2: x2,
			Y2: y2
		});
	}
	public function LineTo(x:Float,y:Float): Void{
		this.Path.push({
			Command: "lineTo",
			X: (x) + 0.5,
			Y: (y) + 0.5
		});
	}
	public function EllipseTo(w:Float,h:Float): Void{
		this.Path.push({
			Command: "ellipseTo",
			Width: w,
			Height: h
		});
	}
	public function AddString(str:String, font:String, x:Float,y:Float, baseline:String="middle"): Void{
		this.Path.push({
			Command: "addString",
			Text: str,
			Font: font,
			X: (x) + 0.5,
			Y: (y) + 0.5,
			BaseLine:baseline
		});
	}
	public function AddMusicSymbol(symbol:String, x:Float, y:Float, xScale:Float, yScale:Float = null): Void {
		
		if (yScale == null)
		{
			yScale = xScale;
		}
		var painter = new SvgPainter(this, symbol, x, y, xScale, yScale);
		painter.Paint();
	}
	public function AddLine(x1:Float, y1:Float, x2:Float, y2:Float): Void {
		
		this.Path.push({
			Command: "addLine",
			X1: (x1) + 0.5,
			Y1: (y1) + 0.5,
			X2: (x2) + 0.5,
			Y2: (y2) + 0.5
		});
	}
	
	public function AddPolygon(points:Array<PointF>): Void{
		this.Path.push({
			Command: "addPolygon",
			Points: points
		});
	}

	public function AddArc(x:Int,y:Int,w:Int,h:Int,startAngle:Float,sweepAngle:Float): Void{
		this.Path.push({
			Command: "addArc",
			X : x,
			Y : y,
			Width : w,
			Height : h,
			StartAngle : startAngle,
			SweepAngle : sweepAngle
		});
	}

	public function AddBezier (x1:Int, y1:Int, x2:Int, y2:Int, x3:Int, y3:Int, x4:Int, y4:Int): Void{
		this.Path.push({
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

	public function AddEllipse (x:Int,y:Int,w:Int,h:Int): Void{
		this.Path.push({
			Command: "addEllipse",
			X: x,
			Y: y,
			Width: w,
			Height: h
		});
	}

	public function AddRect (x:Int,y:Int,w:Int,h:Int): Void{
		this.Path.push({
			Command: "addRect",
			X: x,
			Y: y,
			Width: w,
			Height: h
		});
	}

	public function RectTo (w:Int, h:Int) : Void {
		this.Path.push({Command: "rectTo",
		Width: w,
		Height: h});
	}

	public function DrawEllipse(ctx:Dynamic /*Canvas2dRenderingContext*/, x:Int, y:Int, w:Int, h:Int) : Void
	{
		var kappa:Float = .5522848;
		var ox:Float = (w / 2) * kappa, // control point offset horizontal
		 oy = (h / 2) * kappa, // control point offset vertical
		 xe = x + w, // x-end
		 ye = y + h, // y-end
		 xm = x + w / 2, // x-middle
		 ym = y + h / 2; // y-middle
		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		ctx.closePath();
		ctx.stroke();
	}
	
	public function Clear(): Void
	{
		this.Path = new Array<Dynamic>();
	}
	
	public function Finish(graphics:Dynamic/*Canvas2DRenderingContext*/) : Void
	{
		if (this.IsFilled) 
		{
			graphics.fill();
		}
		else
		{
			graphics.stroke();
		}
	}
}
