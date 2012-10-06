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
package alphatab.platform.js;

#if js
import alphatab.model.TextBaseline;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;
import alphatab.platform.model.TextAlign;

/**
 * A canvas implementation for HTML5 canvas
 */
class Html5Canvas implements ICanvas 
{
    private var _canvas:Dynamic;
    private var _context:Dynamic;
    private var _width:Int;
	private var _height:Int;
	
    public function new(dom:Dynamic) 
    {  
        this._canvas = dom;
        this._context = dom.getContext("2d");
		this._context.textBaseline = "top";
    }
    
    public function getWidth():Int 
    {
        return _canvas.offsetWidth; 
    }
    
    public function getHeight():Int 
    {
        return _canvas.offsetHeight;
    }
    
    public function setWidth(width:Int):Void 
    {
        var lineWidth = this._context.lineWidth;
        this._canvas.width = width;
        this._context = this._canvas.getContext("2d");
		this._context.textBaseline = "top";
		this._context.lineWidth = lineWidth;
		_width = width;
    }
    
    public function setHeight(height:Int):Void 
    {
        var lineWidth = this._context.lineWidth;
        this._canvas.height = height;
        this._context = this._canvas.getContext("2d");
		this._context.textBaseline = "top";
		this._context.lineWidth = lineWidth;
		_height = height;
    } 
    
    // colors and styles
	public function setColor(color : Color) : Void
	{
		this._context.strokeStyle = color.toRgbaString();
		this._context.fillStyle = color.toRgbaString();
	}

    // line caps/joins
    public function setLineWidth(value:Float) : Void
    {
        this._context.lineWidth = value;
    }
    
    // rects
    public function clear():Void
    {
        var lineWidth = this._context.lineWidth;
		this._canvas.width = this._canvas.width;
		this._context.lineWidth = lineWidth;
		// this._context.clearRect(0,0,_width, _height);
    }
    public function fillRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        this._context.fillRect(x - 0.5, y - 0.5, w, h);
    }
    public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        this._context.strokeRect(x - 0.5, y - 0.5, w, h);
    }

    // path API
    public function beginPath():Void
    {
        this._context.beginPath();
    }
    public function closePath():Void
    {
        this._context.closePath();
    }
    public function moveTo(x:Float, y:Float):Void
    {
        this._context.moveTo(x - 0.5, y - 0.5);
    }
    public function lineTo(x:Float, y:Float):Void
    {
        this._context.lineTo(x - 0.5, y - 0.5);
    }
    public function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void
    {
        this._context.quadraticCurveTo(cpx, cpy, x, y);
    }
    public function bezierCurveTo(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float):Void
    {
        this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    }
    public function circle(x:Float, y:Float, radius:Float):Void
    {
        this._context.arc(x,y, radius, 0, Math.PI*2,true);
    }
    public function rect(x:Float, y:Float, w:Float, h:Float):Void
    {
        this._context.rect(x, y, w, h);
    }
    public function fill():Void
    {
        this._context.fill();
    }
    public function stroke():Void
    {
        this._context.stroke();
    }

    // text
    public function setFont(font:Font) : Void
    {
        this._context.font = font.toCssString();
    }
     
	public function getTextAlign() : TextAlign
	{
		switch(this._context.textAlign)
		{
			case "left":
				return TextAlign.Left;
			case "center":
				return TextAlign.Center;
			case "right":
				return TextAlign.Right;
			default:
				return TextAlign.Left;
		}
	}
	
	public function setTextAlign(textAlign:TextAlign) : Void
	{
		switch(textAlign)
		{
			case Left:
				this._context.textAlign = "left";
			case Center:
				this._context.textAlign = "center";
			case Right:
				this._context.textAlign = "right";
		}
	}
	
	public function getTextBaseline() : TextBaseline
	{
		switch(this._context.textBaseline)
		{
			case "top":
				return TextBaseline.Top;
			case "middle":
				return TextBaseline.Middle;
			case "bottom":
				return TextBaseline.Bottom;
			default:
				return TextBaseline.Default;
		}
	}
	
	public function setTextBaseline(textBaseLine:TextBaseline) : Void
	{
		switch(textBaseLine)
		{
			case Top:
				this._context.textBaseline = "top";
			case Middle:
				this._context.textBaseline = "middle";
			case Bottom:
				this._context.textBaseline = "bottom";
			default:
				this._context.textBaseline = "alphabetic";
		}
	}

    public function fillText(text:String, x:Float, y:Float):Void
    {
		this._context.fillText(text, x, y);
    }
    public function strokeText(text:String, x:Float, y:Float):Void
    {
		this._context.strokeText(text, x, y);
    }
    public function measureText(text:String):Float
    {
        return this._context.measureText(text).width;
    }
}
#end
