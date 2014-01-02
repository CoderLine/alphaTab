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
import alphatab.rendering.utils.BeamingHelper;

class BeamGlyph extends SvgGlyph
{
    public function new(x:Int = 0, y:Int = 0, duration:Duration, direction:BeamDirection, isGrace:Bool)
    {
        super(x, y, getRestSvg(duration, direction, isGrace), (isGrace ? NoteHeadGlyph.graceScale : 1), getSvgScale(duration, direction, isGrace));
    }    
    
    private function getSvgScale(duration:Duration, direction:BeamDirection, isGrace:Bool)
    {
        var scale = (isGrace ? NoteHeadGlyph.graceScale : 1);
        if (direction == Up)
        {
            return 1 * scale;
        }
        else
        {
            return -1 * scale;
        }
    }
        
    public override function doLayout():Void 
    {
        width = 0;
    }
    
    private function getRestSvg(duration:Duration, direction:BeamDirection, isGrace:Bool) 
    {
        if (isGrace)
        {
            return MusicFont.FooterUpEighth;
        }
        switch(duration)
        {
            case Eighth: return MusicFont.FooterUpEighth;
            case Sixteenth: return MusicFont.FooterUpSixteenth;
            case ThirtySecond: return MusicFont.FooterUpThirtySecond;
            case SixtyFourth: return MusicFont.FooterUpSixtyFourth;
            default: return null;
        }
    }
}