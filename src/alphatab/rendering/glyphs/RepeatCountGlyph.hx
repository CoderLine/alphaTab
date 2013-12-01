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

import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class RepeatCountGlyph extends Glyph
{
    private var _count:Int;
    public function new(x:Int = 0, y:Int = 0, count:Int)
    {
        super(x, y);
        _count = count;
    }

    public override function doLayout():Void 
    {
        width = 0;
    }    
    
    public override function canScale():Bool 
    {
        return false;
    }

    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var res = renderer.getResources();
        canvas.setColor(res.mainGlyphColor);
        canvas.setFont(res.barNumberFont);
        
        var s = "x" + Std.string(_count);
        var w = Std.int(canvas.measureText(s) / 1.5);
        canvas.fillText(s, cx + x - w, cy + y);
    }
}