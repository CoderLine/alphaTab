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

import alphatab.model.Duration;

class RestGlyph extends SvgGlyph
{
    public function new(x:Int = 0, y:Int = 0, duration:Duration)
    {
        super(x, y, getRestSvg(duration), 1, 1);
    }        
        
    public override function doLayout():Void 
    {
        width = Std.int(9 * getScale());
    }
    
    public override function canScale():Bool 
    {
        return false;
    }

    private function getRestSvg(duration:Duration) 
    {
        switch(duration)
        {
            case Whole, Half: return MusicFont.RestWhole;
            case Quarter: return MusicFont.RestQuarter;
            case Eighth: return MusicFont.RestEighth;
            case Sixteenth: return MusicFont.RestSixteenth;
            case ThirtySecond: return MusicFont.RestThirtySecond;
            case SixtyFourth: return MusicFont.RestSixtyFourth;
        }
    }
}