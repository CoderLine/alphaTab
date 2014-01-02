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

class NoteHeadGlyph extends SvgGlyph
{
    public static inline var graceScale = 0.7;
    public static inline var noteHeadHeight = 9;
    
    private var _isGrace:Bool;

    public function new(x:Int = 0, y:Int = 0, duration:Duration, isGrace:Bool)
    {
        super(x, y, getNoteSvg(duration), isGrace ? graceScale : 1, isGrace ? graceScale : 1);
        _isGrace = isGrace;
    }    
    
    public override function doLayout():Void 
    {
        width = Std.int(9 * (_isGrace ? NoteHeadGlyph.graceScale : 1) * getScale());
    }
    
    public override function canScale():Bool 
    {
        return false;
    }
    
    private function getNoteSvg(duration:Duration) 
    {
        switch(duration)
        {
            case Whole: return MusicFont.NoteWhole;
            case Half: return MusicFont.NoteHalf;
            default: return MusicFont.NoteQuarter;
        }
    }
}