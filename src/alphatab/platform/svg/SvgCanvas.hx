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
package alphatab.platform.svg;

import alphatab.io.OutputStream;
import alphatab.io.StringOutputStream;
import alphatab.platform.Canvas;

/**
 * A canvas implementation storing SVG data
 */
class SvgCanvas implements Canvas
{
    private var _buffer:StringBuf;
    private var _currentPath:StringBuf;
    private var _currentPathIsEmpty:Bool;
    
    private var _width:Int;
    private var _height:Int;
     
    public function new() 
    {
        _buffer = new StringBuf();
        _currentPath = new StringBuf();
        _currentPathIsEmpty = true;
        strokeStyle = "#FFFFFF";
        fillStyle = "#FFFFFF";
        lineWidth = 1;
        _width = 0;
        _height = 0;
        font = "10px sans-serif";
        textBaseline = "alphabetic";
        textAlign = "left";
    }
    
    public function writeTo(stream:OutputStream, includeWrapper:Bool, className:String = null)
    {
        if (includeWrapper) 
        {
            stream.writeString('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="');
            stream.writeAsString(_width);
            stream.writeString('px" height="');
            stream.writeAsString(_height);
            stream.writeString('px"');
            if (className != null) 
            {
                stream.writeString(' class="');
                stream.writeString(className);
                stream.writeString('"');
            }
            stream.writeString('>\n');
        }
        stream.writeString(_buffer.toString());
        if (includeWrapper) 
        {
            stream.writeString('</svg>'); 
        } 
    }
    
    public function toSvg(includeWrapper:Bool, className:String = null) : String
    {
        var out:StringOutputStream = new StringOutputStream();
        writeTo(out, includeWrapper, className);
        out.flush();
        return out.toString();       
    }
    
    public var width(getWidth, setWidth):Int;
    public var height(getHeight, setHeight):Int;
    
    private function getWidth():Int 
    {
        return _width; 
    }
    
    private function getHeight():Int 
    {
        return _height;
    }
    
    private function setWidth(width:Int):Int 
    {
        _width = width;
        return _width;
    }
    
    private function setHeight(height:Int):Int 
    {
        _height = height;
        return _height;
    } 
    
    // colors and styles
    private var _strokeStyle:String;
    public var strokeStyle(getStrokeStyle, setStrokeStyle):String;
    
    private function getStrokeStyle() : String
    {
        return _strokeStyle;
    } 
    private function setStrokeStyle(value:String) : String
    {
        _strokeStyle = value; 
        return _strokeStyle;
    }
    
    private var _fillStyle:String;
    public var fillStyle(getFillStyle, setFillStyle):String;
    private function getFillStyle() : String
    {
        return _fillStyle;
    }
    private function setFillStyle(value:String) : String
    {
        _fillStyle = value;
        return _fillStyle;
    }
    
    // line caps/joins
    private var _lineWidth:Float;
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
    public function clear():Void
    {
        _buffer = new StringBuf(); 
        _currentPath = new StringBuf(); 
        _currentPathIsEmpty = true;
    }
    
    public function fillRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _buffer.add('<rect x="');
        _buffer.add(x);
        _buffer.add('" y="');
        _buffer.add(y);
        _buffer.add('" width="');
        _buffer.add(w);
        _buffer.add('" height="');
        _buffer.add(h);
        _buffer.add('" style="fill:');
        _buffer.add(fillStyle);
        _buffer.add(';" />\n'); 
    }
    
    public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _buffer.add('<rect x="');
        _buffer.add(x);
        _buffer.add('" y="');
        _buffer.add(y);
        _buffer.add('" width="');
        _buffer.add(w);
        _buffer.add('" height="');
        _buffer.add(h);
        _buffer.add('" style="stroke:');
        _buffer.add(strokeStyle);
        _buffer.add('; stroke-width:');
        _buffer.add(lineWidth);
        _buffer.add(';" />\n'); 
    }

    // path API
    public function beginPath():Void
    {
        // TODO: check how to start a new path
    }
    public function closePath():Void
    {
        _currentPath.add(" z");
    }
    public function moveTo(x:Float, y:Float):Void
    {
        _currentPath.add(" M");
        _currentPath.add(x);
        _currentPath.add(",");
        _currentPath.add(y);
    }
    public function lineTo(x:Float, y:Float):Void
    {
        _currentPathIsEmpty = false;
        _currentPath.add(" L");
        _currentPath.add(x);
        _currentPath.add(",");
        _currentPath.add(y);
    }
    public function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void
    {
        _currentPathIsEmpty = false;
        _currentPath.add(" Q");
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
        _currentPath.add(" C");
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
        _currentPath.add(" M");
        _currentPath.add(x - radius);
        _currentPath.add(",");
        _currentPath.add(y);
        
        _currentPath.add(" A1,1 0 0,0 ");
        _currentPath.add(x + radius);
        _currentPath.add(",");
        _currentPath.add(y);
        
        _currentPath.add(" A1,1 0 0,0 ");
        _currentPath.add(x - radius);
        _currentPath.add(",");
        _currentPath.add(y);
        
        _currentPath.add(" z");
    }
    public function rect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _currentPathIsEmpty = false;
        _currentPath.add(" M");
        _currentPath.add(x);
        _currentPath.add(",");
        _currentPath.add(y);
        
        _currentPath.add(" L");
        
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
        var path = _currentPath.toString();
        if(!_currentPathIsEmpty) {
            _buffer.add('<path d="');
            _buffer.add(_currentPath.toString());
            _buffer.add('" style="fill:');
            _buffer.add(fillStyle);
            _buffer.add('" stroke="none"/>\n');
        }
        _currentPath = new StringBuf();
        _currentPathIsEmpty = true;
    }
    public function stroke():Void
    {
        var path = _currentPath.toString();
        if(!_currentPathIsEmpty) {
            _buffer.add('<path d="');
            _buffer.add(_currentPath.toString());
            _buffer.add('" style="stroke:');
            _buffer.add(strokeStyle);
            _buffer.add('; stroke-width:');
            _buffer.add(lineWidth);
            _buffer.add(';" fill="none" />\n'); 
        }
        _currentPath = new StringBuf();
        _currentPathIsEmpty = true;
    }

    // text
    private var _font:String; 
    public var font(getFont, setFont):String; 
    private function getFont() : String
    {
        return _font;
    }
    private function setFont(value:String) : String
    {
        _font = value;
        return _font;
    }
    
    private var _textBaseline:String; 
    public var textBaseline(getTextBaseline, setTextBaseline):String; 
    private function getTextBaseline() : String
    {
        return _textBaseline;
    }
    private function setTextBaseline(value:String) : String
    {
        _textBaseline = value;
        return _textBaseline;
    }

    private var _textAlign:String; 
    public var textAlign(getTextAlign, setTextAlign):String; 
    private function getTextAlign() : String
    {
        return _textAlign;
    }
    private function setTextAlign(value:String) : String
    {
        _textAlign = value;
        return _textAlign;
    }
    
    public function fillText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void
    {
        _buffer.add('<text x="');
        _buffer.add(x);
        _buffer.add('" y="');
        _buffer.add(y);
        _buffer.add('" style="font:');
        _buffer.add(font);
        _buffer.add('; fill:');
        _buffer.add(fillStyle);
        _buffer.add(';" ');
        if (maxWidth != 0)
        {
            _buffer.add('width="');
            _buffer.add(maxWidth);
            _buffer.add('"');
        }
        _buffer.add(' dominant-baseline="');
        _buffer.add(getSvgBaseLine());       
        _buffer.add('" text-anchor="');
        _buffer.add(getSvgTextAlignment());
        _buffer.add('">\n');
        _buffer.add(text);
        _buffer.add("</text>\n");
    }
    public function strokeText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void
    {
        _buffer.add('<text x="');
        _buffer.add(x);
        _buffer.add('" y="');
        _buffer.add(y);
        _buffer.add('" style="font:');
        _buffer.add(font);
        _buffer.add('" stroke:');
        _buffer.add(strokeStyle);
        _buffer.add('; stroke-width:');
        _buffer.add(lineWidth);
        _buffer.add(';" ');
        if (maxWidth != 0)
        {
            _buffer.add('width="');
            _buffer.add(maxWidth);
            _buffer.add('"');
        }
        _buffer.add(' dominant-baseline="');
        _buffer.add(getSvgBaseLine());       
        _buffer.add('" text-anchor="');
        _buffer.add(getSvgTextAlignment());
        _buffer.add('">\n');
        _buffer.add(text);
        _buffer.add("</text>\n");
    }
    
    private function getSvgTextAlignment() : String
    {
        switch(textAlign) 
        {
            case "left": return "start";
            case "right": return "end";
            case "center": return "middle";
            case "start": return "start";
            case "end": return "end";
            default: return "start";
        }
    }    
    private function getSvgBaseLine() : String
    {
        switch(textBaseline) 
        {
            case "top": return "top";
            case "hanging": return "hanging";
            case "middle": return "central";
            case "alphabetic": return "alphabetic";
            case "ideographic": return "ideographic";
            case "bottom": return "bottom";
            default: return "alphabetic";
        }
    }
    
    
    public function measureText(text:String):Float
    {
        var font:SupportedFonts = SupportedFonts.Arial;
        if (this.font.indexOf("Times") >= 0) {
            font = SupportedFonts.TimesNewRoman;
        }
        var size = "";
        var preparedFont = this.font;
        if (preparedFont.indexOf("bold ") == 0) 
        {
            preparedFont = preparedFont.substr(5);
        }
        if (preparedFont.indexOf("italic ") == 0) 
        {
            preparedFont = preparedFont.substr(7);
        }
        
        for (i in 0 ... preparedFont.length) {
            var c = preparedFont.charCodeAt(i); 
            if ((c < 0x30 || c > 0x39) && c != 0x2E && c != 0x20) { // 0-9, . and space 
                break;
            }
            size += preparedFont.charAt(i);
        }
        
        return FontSizes.measureString(text, font, Std.parseFloat(size));
    }
}