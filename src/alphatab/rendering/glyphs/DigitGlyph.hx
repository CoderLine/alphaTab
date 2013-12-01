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
package alphatab.rendering.glyphs;

class DigitGlyph extends SvgGlyph
{
    private var _digit:Int;
    public function new(x:Int = 0, y:Int = 0, digit:Int)
    {
        super(x, y, getDigit(digit), 1, 1); 
        _digit = digit;
    }    
    
        
    public override function doLayout():Void 
    {
        y += Std.int(7 * getScale());
        width = Std.int(getDigitWidth(_digit) * getScale());
    }
    
    public override function canScale():Bool 
    {
        return false;
    }
    
    private function getDigitWidth(digit:Int) : Int
    {
        switch(digit)
        {
            case 0,2,3,4,5,6,7,8,9: return 14;
            case 1: return 10;
            default: return 0;
        }
    }    
    private function getDigit(digit:Int) : String
    {
        switch(digit)
        {
            case 0: return MusicFont.Num0;
            case 1: return MusicFont.Num1;
            case 2: return MusicFont.Num2;
            case 3: return MusicFont.Num3;
            case 4: return MusicFont.Num4;
            case 5: return MusicFont.Num5;
            case 6: return MusicFont.Num6;
            case 7: return MusicFont.Num7;
            case 8: return MusicFont.Num8;
            case 9: return MusicFont.Num9;
            default: return "";
        }
    }
}