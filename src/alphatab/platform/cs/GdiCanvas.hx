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
package alphatab.platform.cs;

#if cs 
import alphatab.model.BrushType;
import alphatab.model.TextBaseline;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;
import alphatab.platform.model.TextAlign;

//
//  Some GDI+ externals (not fully, only the stuff we need)
// 

@:native("System.Bitmap")
@:nativeGen
extern interface IDisposable
{
    public function Dispose():Void;
}

@:native("System.Drawing.Bitmap")
@:nativeGen
extern class Bitmap implements IDisposable
{
    public var Width(default, null):Int;
    public var Height(default, null):Int;
    public function new(width:Int, height:Int, format:PixelFormat) : Void;
    public function Dispose():Void;
}

@:native("System.Drawing.Imaging.PixelFormat")
@:nativeGen
extern enum PixelFormat
{
    Format32bppArgb;
}

@:native("System.Drawing.Graphics")
@:nativeGen
extern class Graphics implements IDisposable
{
    public var SmoothingMode:SmoothingMode;
    public var TextRenderingHint:TextRenderingHint;

    public function DrawImage(image:Bitmap, srcRect:Rectangle, dstRect:Rectangle, unit:GraphicsUnit):Void;
    public function Clear(color:GdiColor):Void;
    public function FillRectangle(brush:SolidBrush, x:Single, y:Single, w:Single, h:Single):Void;
    public function DrawRectangle(pen:Pen, x:Single, y:Single, w:Single, h:Single):Void;
    public function FillPath(brush:SolidBrush, path:GraphicsPath):Void;
    public function DrawPath(pen:Pen, path:GraphicsPath):Void;
    public function DrawString(text:String, font:GdiFont, brush:SolidBrush, point:PointF, format:StringFormat):Void;
    public function MeasureString(text:String, font:GdiFont):SizeF;
    
    public static function FromImage(image:Bitmap):Graphics;
    public function Dispose():Void;
}

@:native("System.Drawing.Drawing2D.GraphicsPath")
@:nativeGen
extern class GraphicsPath implements IDisposable
{
    public function new(fillMode:FillMode):Void;
    public function StartFigure():Void;
    public function CloseFigure():Void;
    public function AddLine(x1:Single, y1:Single, x2:Single, y2:Single):Void;
    public function AddBezier(x1:Single, y1:Single, cp1x:Single, cp1y:Single, cp2x:Single, cp2y:Single, x2:Single, y2:Single):Void;
    public function AddEllipse(x:Single, y:Single, w:Single, h:Single):Void;
    public function AddRectangle(rect:RectangleF):Void;
    public function Dispose():Void;
}

@:native("System.Drawing.Drawing2D.FillMode")
@:nativeGen
extern enum FillMode
{
    Winding;
}

@:native("System.Drawing.Drawing2D.SmoothingMode")
@:nativeGen
extern enum SmoothingMode
{
    HighQuality;
}

@:native("System.Drawing.Text.TextRenderingHint")
@:nativeGen
extern enum TextRenderingHint
{
    AntiAlias;
}

@:native("System.Drawing.StringFormat")
@:nativeGen
extern class StringFormat implements IDisposable
{
    public var Alignment:StringAlignment;
    public var LineAlignment:StringAlignment;
    public function new():Void;
    public function Dispose():Void;
}

@:native("System.Drawing.Font")
@:nativeGen
extern class GdiFont implements IDisposable
{
	@:overload(function(fontFamily:String, size:Single,style:FontStyle, unit:GraphicsUnit):GdiFont{})
    public function new(fontFamily:String, size:Single, unit:GraphicsUnit):Void;
    public function Dispose():Void;
}

@:native("System.Drawing.FontStyle")
@:nativeGen
extern enum FontStyle
{
    Regular;
    Bold;
    Italic;
}

@:native("System.Drawing.Rectangle")
@:nativeGen
extern class Rectangle
{
    public var X:Int;
    public var Y:Int;
    public var Width:Int;
    public var Height:Int;
    
    public function new(x:Int, y:Int, w:Int, h:Int):Void;
}

@:native("System.Drawing.RectangleF")
@:nativeGen
extern class RectangleF
{
    public var X:Single;
    public var Y:Single;
    public var Width:Single;
    public var Height:Single;
    
    public function new(x:Single, y:Single, w:Single, h:Single):Void;
}

@:native("System.Drawing.SizeF")
@:nativeGen
extern class SizeF
{
    public var Width:Single;
    public var Height:Single;
    
    public function new(w:Single, h:Single):Void;
}

@:native("System.Drawing.PointF")
@:nativeGen
extern class PointF
{
    public var X:Single;
    public var Y:Single;
    
    public function new(x:Single, y:Single):Void;
}

@:native("System.Drawing.GraphicsUnit")
@:nativeGen
extern enum GraphicsUnit
{
    Pixel;
}

@:native("System.Drawing.StringAlignment")
@:nativeGen
extern enum StringAlignment
{
    Near;
    Center;
    Far;
}

@:native("System.Drawing.Color")
@:nativeGen
extern class GdiColor
{
    public static var Transparent:GdiColor;
    public static function FromArgb(a:Int, r:Int, g:Int, b:Int):GdiColor;
}

@:native("System.Drawing.SolidBrush")
@:nativeGen
extern class SolidBrush implements IDisposable
{
    public function new(color:GdiColor):Void;
    public function Dispose():Void;
}

@:native("System.Drawing.Pen")
@:nativeGen
extern class Pen implements IDisposable
{
    public function new(color:GdiColor, width:Single):Void;
    public function Dispose():Void;
}

class GdiCanvas implements ICanvas
{    
    private var _image:Bitmap;
    private var _graphics:Graphics;
    
    private var _currentPath:GraphicsPath;
     
    private var _currentX : Single;
    private var _currentY : Single;

    public function new() 
    {
        _image = new Bitmap(1, 1, PixelFormat.Format32bppArgb);
        _graphics = Graphics.FromImage(_image);
        _graphics.SmoothingMode = SmoothingMode.HighQuality;
        _graphics.TextRenderingHint = TextRenderingHint.AntiAlias;
        _currentPath = new GraphicsPath(FillMode.Winding);
        _stringFormat = new StringFormat();
        _stringFormat.LineAlignment = StringAlignment.Near;
        _lineWidth = 1;
        _currentX = 0;
        _currentY = 0;
        _font = new GdiFont("Arial", 10, GraphicsUnit.Pixel);
        _textAlign = TextAlign.Left;
        _textBaseline = TextBaseline.Top;
        setColor(new Color(255, 255, 255));
    }

    public function getWidth():Int 
    {
        return _image.Width; 
    }
    
    public function getHeight():Int 
    {
        return _image.Height;
    }
    
    public function setWidth(width:Int):Void 
    {
        recreateImage(width, _image.Height);
    }
    
    public function setHeight(height:Int):Void 
    {
        recreateImage(_image.Width, height);
    } 
    
    public function getImage() : Bitmap
    {
        // _graphics.Dispose();
        // _brush.Dispose();
        // _pen.Dispose();
        // _currentPath.Dispose();
        // _font.Dispose();
        // _stringFormat.Dispose();
        return _image;
    }
    
    private function recreateImage(width:Int, height:Int) : Void
    {
        var newImage = new Bitmap(width, height, PixelFormat.Format32bppArgb);
        var newGraphics = Graphics.FromImage(newImage);
        newGraphics.SmoothingMode = SmoothingMode.HighQuality;
        newGraphics.TextRenderingHint = TextRenderingHint.AntiAlias;
        newGraphics.Clear(GdiColor.Transparent);
        _image.Dispose();
        _graphics.Dispose();
        
        _image = newImage;
        _graphics = newGraphics;
    }
    
    // colors and styles
    private var _brush:SolidBrush;
    private var _pen:Pen;
	private var _color:GdiColor;
	public function setColor(color : Color) : Void
	{
		_color = GdiColor.FromArgb(color.getA(), color.getR(), color.getG(), color.getB());
        
        recreateBrush();
        recreatePen();
	}
    
    private function recreateBrush()
    {
        var newBrush = new SolidBrush(_color);
        if (_brush != null)
        {
            _brush.Dispose();
        }
        _brush = newBrush;
    }
    
    private function recreatePen()
    {
        var newPen = new Pen(_color, _lineWidth);
        if (_pen != null)
        {
            _pen.Dispose();
        }
        _pen = newPen;
    }
    
    // line caps/joins
    private var _lineWidth:Float;
    public function setLineWidth(value:Float) : Void
    {
        _lineWidth = value;
        recreatePen();
    }
    
    // rects
    public function clear():Void
    {
        _graphics.Clear(GdiColor.Transparent); 
    }
    
    public function fillRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _graphics.FillRectangle(_brush, x, y, w, h);
    }
    
    public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _graphics.DrawRectangle(_pen, x, y, w, h);
    }

    // path API
    public function beginPath():Void
    {
        _currentPath.StartFigure();
    }
    
    public function closePath():Void
    {
        _currentPath.CloseFigure();
    }
    
    public function moveTo(x:Float, y:Float):Void
    {
        _currentX = x;
        _currentY = y;
    }
    
    public function lineTo(x:Float, y:Float):Void
    {
        _currentPath.AddLine(_currentX, _currentY, x, y);
        _currentX = x;
        _currentY = y;
    }
    
    public function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void
    {
        _currentPath.AddBezier(_currentX, _currentY, cpx, cpy, cpx, cpy, x, y);
        _currentX = x;
        _currentY = y;
    }
    
    public function bezierCurveTo(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float):Void
    {
        _currentPath.AddBezier(_currentX, _currentY, cp1x, cp1y, cp2x, cp2y, x, y);
        _currentX = x;
        _currentY = y;
    }
    
    public function circle(x:Float, y:Float, radius:Float):Void
    {
        _currentPath.StartFigure();
        _currentPath.AddEllipse(x - radius, y - radius, radius * 2, radius * 2);
        _currentPath.CloseFigure();
        _currentX = x;
        _currentY = y;
    }
    
    public function rect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _currentPath.StartFigure();
        _currentPath.AddRectangle(new RectangleF(x, y, w, h));
        _currentPath.CloseFigure();
        _currentX = x;
        _currentY = y;
    }
    
    public function fill():Void
    {
        _graphics.FillPath(_brush, _currentPath);
        _currentPath.Dispose();
        _currentPath = new GraphicsPath(FillMode.Winding);
    }
    
    public function stroke():Void
    {
        _graphics.DrawPath(_pen, _currentPath);
        _currentPath.Dispose();
        _currentPath = new GraphicsPath(FillMode.Winding);
    }

    // text
    private var _fontSize:Float; 
    private var _font:GdiFont; 
    public function setFont(font:Font) : Void
    {
        var fontStyle:FontStyle = FontStyle.Regular;
        if (font.isBold()) untyped __cs__("fontStyle |= System.Drawing.FontStyle.Bold");
        if (font.isItalic()) untyped __cs__("fontStyle |= System.Drawing.FontStyle.Italic");
        
        _fontSize = font.getSize();
        _font = new GdiFont(font.getFamily(), font.getSize(), fontStyle, GraphicsUnit.Pixel);
    }

    
    private var _textAlign:TextAlign; 
    private var _stringFormat:StringFormat;
    public function getTextAlign() : TextAlign
	{
		return _textAlign;
	}
    public function setTextAlign(textAlign:TextAlign) : Void
    {
        _textAlign = textAlign;
        switch(textAlign)
        {
            case Left: _stringFormat.Alignment = StringAlignment.Near;
            case Center: _stringFormat.Alignment = StringAlignment.Center;
            case Right: _stringFormat.Alignment = StringAlignment.Far;
        }
    }
    

    private var _textBaseline:TextBaseline; 
    public function getTextBaseline() : TextBaseline
	{
		return _textBaseline;
	}
    public function setTextBaseline(textBaseline:TextBaseline) : Void
    {
        _textBaseline = textBaseline;
        switch(textBaseline)
        {
			case Top: _stringFormat.LineAlignment = StringAlignment.Near;
			case Middle: _stringFormat.LineAlignment = StringAlignment.Center;
			case Bottom: _stringFormat.LineAlignment = StringAlignment.Far;
			default: _stringFormat.LineAlignment = StringAlignment.Near;
        }
    }
    
    public function fillText(text:String, x:Float, y:Float):Void
    {
        _graphics.DrawString(text, _font, _brush, new PointF(x, y), _stringFormat); 
    }
    
    public function measureText(text:String):Float
    {
        return _graphics.MeasureString(text, _font).Width; 
    }
}

#end