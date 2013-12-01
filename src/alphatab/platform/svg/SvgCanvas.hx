/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
package alphatab.platform.svg;

import alphatab.model.TextBaseline;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;
import alphatab.platform.model.TextAlign;
import haxe.io.BytesOutput;
import haxe.io.Output;

using alphatab.io.OutputExtensions;

/**
 * A canvas implementation storing SVG data
 */
class SvgCanvas implements ICanvas
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
        _color = new Color(255, 255, 255);
        _lineWidth = 1;
        _width = 0;
        _height = 0;
        _font = new Font("sans-serif", 10);
        _textAlign = TextAlign.Left;
        _textBaseline = TextBaseline.Default;
    }
    
    public function writeTo(stream:Output, includeWrapper:Bool, className:String = null)
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
        var out:BytesOutput = new BytesOutput();
        writeTo(out, includeWrapper, className);
        out.flush();
        return out.getBytes().toString();       
    }
    
    public function getWidth():Int 
    {
        return _width; 
    }
    
    public function getHeight():Int 
    {
        return _height;
    }
    
    public function setWidth(width:Int):Void 
    {
        _width = width;
    }
    
    public function setHeight(height:Int):Void 
    {
        _height = height;
    } 
    
    // colors and styles
    private var _color:Color;
    public function setColor(color : Color) : Void
    {
        _color = color;
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
        _buffer.add(_color.toRgbaString());
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
        _buffer.add(_color.toRgbaString());
        _buffer.add('; stroke-width:');
        _buffer.add(_lineWidth);
        _buffer.add(';" />\n'); 
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
        if(!_currentPathIsEmpty) {
            _buffer.add('<path d="');
            _buffer.add(_currentPath.toString());
            _buffer.add('" style="fill:');
            _buffer.add(_color.toRgbaString());
            _buffer.add('" stroke="none"/>\n');
        }
        _currentPath = new StringBuf();
        _currentPathIsEmpty = true;
    }
    public function stroke():Void
    {
        if(!_currentPathIsEmpty) {
            _buffer.add('<path d="');
            _buffer.add(_currentPath.toString());
            _buffer.add('" style="stroke:');
            _buffer.add(_color.toRgbaString());
            _buffer.add('; stroke-width:');
            _buffer.add(_lineWidth);
            _buffer.add(';" fill="none" />\n'); 
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
        _buffer.add('<text x="');
        _buffer.add(x);
        _buffer.add('" y="');
        _buffer.add(y + getSvgBaseLineOffset());
        _buffer.add('" style="font:');
        _buffer.add(_font.toCssString());
        _buffer.add('; fill:');
        _buffer.add(_color.toRgbaString());
        _buffer.add(';" ');
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
        switch(_textAlign) 
        {
            case Left: return "start";
            case Center: return "middle";
            case Right: return "end";
        }
    }    
    
    private function getSvgBaseLineOffset() : Float
    {
        switch(_textBaseline)
        {
            case Top: return 0;
            case Middle: return 0;
            case Bottom: return 0;
            default: return _font.getSize();
        }    
    }
    
    private inline function getSvgBaseLine() : String
    {
        return "middle";
        // switch(_textBaseline)
        // {
        //     case Top: return "top";
        //     case Middle: return "middle";
        //     case Bottom: return "bottom";
        //     default: return "alphabetic";
        // }
    }
    
    
    public function measureText(text:String):Float
    {
        if (text == null || text.length == 0) return 0;
        var font:SupportedFonts = SupportedFonts.Arial;
        if (_font.getFamily().indexOf("Times") >= 0) {
            font = SupportedFonts.TimesNewRoman;
        }
        return FontSizes.measureString(text, font, _font.getSize());
    }
}