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
package alphatab.platform.model;

/**
 * This container class can store the definition for a font and it's style.
 */
class Font 
{
    public static inline var StylePlain = 0;
    public static inline var StyleBold = 1;
    public static inline var StyleItalic = 2;
    
    private var _family:String;
    private var _size:Float;
    private var _style:Int;
    
    public function getFamily() : String
    {
        return _family;
    }
    
    public function setFamily(family:String)
    {
        _family = family;
    }
    
    public function getSize() : Float
    {
        return _size;
    }    
    
    public function setSize(size:Float)
    {
        _size = size;
    }
    
    public function getStyle() : Int
    {
        return _style;
    }
    
    public function setStyle(style:Int)
    {
        _style = style;
    }
    
    public inline function isBold() : Bool
    {
        return ((getStyle() & StyleBold) != 0);
    }    
    
    public inline function isItalic() : Bool
    {
        return ((getStyle() & StyleItalic) != 0);
    }
    
    public function new(family:String, size:Float, style:Int = StylePlain) 
    {
        _family = family;
        _size = size;
        _style = style;
    }
    
    public function clone() : Font
    {
        return new Font(_family, _size, _style);
    }
    
    public function toCssString() : String
    {
        var buf = new StringBuf();
        
        if (isBold()) 
        {
            buf.add("bold ");
        }
        if (isItalic()) 
        {
            buf.add("italic ");
        }
        
        buf.add(_size);
        buf.add("px");
        buf.add("'");
        buf.add(_family);
        buf.add("'");
        
        return buf.toString();
    }
    
}