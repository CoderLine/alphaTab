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

import alphatab.model.TextBaseline;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Font;
import alphatab.platform.model.TextAlign;
import cs.StdTypes;

@:native("System.Windows.Controls.UIElement")
@:nativeGen
extern class UIElement
{
}

@:native("System.Windows.Controls.UIElementCollection")
@:nativeGen
extern class UIElementCollection
{
    var Count(default, null):Int;
    public function Add(element:UIElement) : Int;
    public function Clear() : Void;
}

@:native("System.Windows.Controls.FrameworkElement")
@:nativeGen
extern class FrameworkElement extends UIElement
{
    var Width:Float;
    var Height:Float;
}

@:native("System.Windows.Media.Color")
@:nativeGen
extern class Color 
{
    public static function FromArgb(a:UInt8, r:UInt8, g:UInt8, b:UInt8) : Color;
}

@:native("System.Windows.Media.SolidColorBrush")
@:nativeGen
extern class SolidColorBrush 
{
    public function new(color:Color);
}

@:native("System.Windows.Shapes.Shape")
@:nativeGen
extern class Shape extends FrameworkElement
{
    var Stroke:SolidColorBrush;
    var StrokeThickness:Float;
    var Fill:SolidColorBrush;
}

@:native("System.Windows.Media.Geometry")
@:nativeGen
extern class Geometry 
{
    public static function Parse(s:String):Geometry;
}

@:native("System.Windows.Shapes.Rectangle")
@:nativeGen
extern class WpfRectangle extends Shape
{
    public function new():Void;
}

@:native("System.Windows.Media.FontFamily")
@:nativeGen
extern class FontFamily 
{
    public function new(name:String):Void;
}

@:native("System.Windows.FontStyle")
@:nativeGen
extern class WpfFontStyle 
{
}

@:native("System.Windows.FontWeight")
@:nativeGen
extern class FontWeight 
{
}

@:native("System.Windows.FontStyles")
@:nativeGen
extern class FontStyles 
{
    public static var Italic:WpfFontStyle;
}

@:native("System.Windows.FontWeights")
@:nativeGen
extern class FontWeights 
{
    public static var Bold:FontWeight;
}

@:native("System.Windows.Controls.TextBlock")
@:nativeGen
extern class TextBlock extends FrameworkElement
{
    var Foreground:SolidColorBrush;
    var Text:String;
    var FontFamily:FontFamily;
    var FontSize:Float;
    var FontStyle:WpfFontStyle;
    var FontWeight:FontWeight;
    public function new():Void;
}

@:native("System.Windows.Shapes.Path")
@:nativeGen
extern class Path extends Shape
{
    var Data:Geometry;
    public function new():Void;
}

@:native("System.Windows.Controls.Canvas")
@:nativeGen
extern class CsWpfCanvas extends FrameworkElement
{
    var Children:UIElementCollection;
    
    public static function SetTop(element:UIElement, length:Float):Void;
    public static function SetLeft(element:UIElement, length:Float):Void;
}

@:native("AlphaTab2.Utils.AlignmentHelper")
@:nativeGen
extern extern class AlignmentHelper 
{
    public static function SetAlignment(element:UIElement, alignment:TextAlign):Void;
    public static function SetLineAlignment(element:UIElement, alignment:TextBaseline):Void;
}

@:native("AlphaTab2.Utils.MeasureUtil")
@:nativeGen
extern extern class MeasureUtil 
{
    public static function MeasureText(text:String, font:Font):Float;
}

class WpfCanvas implements ICanvas
{
    private var _currentPath:StringBuf;
    private var _currentPathIsEmpty:Bool;
    
    private var _canvas:CsWpfCanvas;
     
    public function new(canvas:Dynamic) 
    {
        setCanvas(cast canvas);
    }
    public function setCanvas(canvas:CsWpfCanvas)
    
    {
        _canvas = canvas;
        _currentPath = new StringBuf();
        _currentPathIsEmpty = true;
        _lineWidth = 1;
        _font = new Font("sans-serif", 10);
        _textAlign = TextAlign.Left;
        _textBaseline = TextBaseline.Default;
        setColor(new alphatab.platform.model.Color(255, 255, 255));
    }
    
    public function getWidth():Int 
    {
        return Std.int(_canvas.Width); 
    }
    
    public function getHeight():Int 
    {
        return Std.int(_canvas.Height);
    }
    
    public function setWidth(width:Int):Void 
    {
        _canvas.Width = width;
    }
    
    public function setHeight(height:Int):Void 
    {
        _canvas.Height = height;
    } 
    
    // colors and styles
    private var _brush:SolidColorBrush;
    public function setColor(color : alphatab.platform.model.Color) : Void
    {
        _brush = new SolidColorBrush(Color.FromArgb(color.getA(), color.getR(), color.getG(), color.getB()));
    }
    
    // line caps/joins
    private var _lineWidth:Float;
    public function setLineWidth(value:Float) : Void
    {
        _lineWidth = value;
    }
    
    // rects
    public function clear():Void
    {
        _canvas.Children.Clear();
        _currentPath = new StringBuf(); 
        _currentPathIsEmpty = true;
    }
    
    public function fillRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        var rectangle = new WpfRectangle();
        rectangle.Fill = _brush;
        rectangle.Width = w;
        rectangle.Height = h;
        CsWpfCanvas.SetLeft(rectangle, x);
        CsWpfCanvas.SetTop(rectangle, y);
        _canvas.Children.Add(rectangle);
    }
    
    public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        var rectangle = new WpfRectangle();
        rectangle.Stroke = _brush;
        rectangle.StrokeThickness = _lineWidth;
        rectangle.Width = w;
        rectangle.Height = h;
        CsWpfCanvas.SetLeft(rectangle, x);
        CsWpfCanvas.SetTop(rectangle, y);
        _canvas.Children.Add(rectangle);
    }

    // path API
    public function beginPath():Void
    {
    }
    public function closePath():Void
    {
        _currentPath.add(" z");
    }
    public function moveTo(x:Float, y:Float):Void
    {
        _currentPath.add(" M ");
        _currentPath.add(x);
        _currentPath.add(",");
        _currentPath.add(y);
    }
    public function lineTo(x:Float, y:Float):Void
    {
        _currentPathIsEmpty = false;
        _currentPath.add(" L ");
        _currentPath.add(x);
        _currentPath.add(",");
        _currentPath.add(y);
    }
    public function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void
    {
        _currentPathIsEmpty = false;
        _currentPath.add(" Q ");
        _currentPath.add(cpx);
        _currentPath.add(",");
        _currentPath.add(cpy);
        _currentPath.add(",");
        _currentPath.add(x);
        _currentPath.add(",");
        _currentPath.add(y);
    }
    public function bezierCurveTo(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float):Void
    {
        _currentPathIsEmpty = false;
        _currentPath.add(" C ");
        _currentPath.add(cp1x);
        _currentPath.add(",");
        _currentPath.add(cp1y);
        _currentPath.add(",");
        _currentPath.add(cp2x);
        _currentPath.add(",");
        _currentPath.add(cp2y);
        _currentPath.add(",");
        _currentPath.add(x);
        _currentPath.add(",");
        _currentPath.add(y);    
    }
    
    public function circle(x:Float, y:Float, radius:Float):Void
    {
        _currentPathIsEmpty = false;
        // 
        // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
        _currentPath.add(" M ");
        _currentPath.add(x - radius);
        _currentPath.add(",");
        _currentPath.add(y);
        
        _currentPath.add(" A 1,1 0 0,0 ");
        _currentPath.add(x + radius);
        _currentPath.add(",");
        _currentPath.add(y);
         
        _currentPath.add(" A 1,1 0 0,0 ");
        _currentPath.add(x - radius);
        _currentPath.add(",");
        _currentPath.add(y);
        
        _currentPath.add(" z");
    }
    public function rect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _currentPathIsEmpty = false;
        _currentPath.add(" M ");
        _currentPath.add(x);
        _currentPath.add(",");
        _currentPath.add(y);
        
        _currentPath.add(" L ");
        
        _currentPath.add(x + w);
        _currentPath.add(",");
        _currentPath.add(y);
        _currentPath.add(" ");

        _currentPath.add(x + w);
        _currentPath.add(",");
        _currentPath.add(y + h);
        _currentPath.add(" ");

        _currentPath.add(x);
        _currentPath.add(",");
        _currentPath.add(y + h);
        _currentPath.add(" z");
    }
    
    public function fill():Void
    {
        if (!_currentPathIsEmpty) 
        {
            var wpfPath = new Path();
            wpfPath.Fill = _brush;
            wpfPath.Data = Geometry.Parse(_currentPath.toString());
            _canvas.Children.Add(wpfPath);
        }
        _currentPath = new StringBuf();
        _currentPathIsEmpty = true;
    }
    public function stroke():Void
    {
        var path = _currentPath.toString();
        if (!_currentPathIsEmpty) 
        {
            var wpfPath = new Path();
            wpfPath.Stroke = _brush;
            wpfPath.StrokeThickness = _lineWidth;
            wpfPath.Data = Geometry.Parse(_currentPath.toString());
            _canvas.Children.Add(wpfPath);
        }
        _currentPath = new StringBuf();
        _currentPathIsEmpty = true;
    }

    // text
    private var _font:Font; 
    public function setFont(font:Font) : Void
    {
        _font = font;
    }

    private var _textAlign:TextAlign; 
    public function getTextAlign() : TextAlign
    {
        return _textAlign;
    }
    public function setTextAlign(textAlign:TextAlign) : Void
    {
        _textAlign = textAlign;
    }
    

    private var _textBaseline:TextBaseline; 
    public function getTextBaseline() : TextBaseline
    {
        return _textBaseline;
    }
    public function setTextBaseline(textBaseline:TextBaseline) : Void
    {
        _textBaseline = textBaseline;
    }
    
    public function fillText(text:String, x:Float, y:Float):Void
    {
        var textBlock = new TextBlock();
        textBlock.Text = text;
        textBlock.Foreground = _brush;
        textBlock.FontFamily = new FontFamily(_font.getFamily());
        textBlock.FontSize = _font.getSize();
        if(_font.isItalic())
            textBlock.FontStyle = FontStyles.Italic;
        if(_font.isBold())
            textBlock.FontWeight = FontWeights.Bold;
            
        AlignmentHelper.SetAlignment(textBlock, _textAlign);
        AlignmentHelper.SetLineAlignment(textBlock, _textBaseline);
        CsWpfCanvas.SetLeft(textBlock, x);
        CsWpfCanvas.SetTop(textBlock, y);
        
        _canvas.Children.Add(textBlock);
    }
    
    public function measureText(text:String):Float
    {
        if (text == null || text.length == 0) return 0;
        
        return MeasureUtil.MeasureText(text, _font);
    }
}