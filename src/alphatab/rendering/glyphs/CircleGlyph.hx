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

class CircleGlyph extends Glyph
{
    private var _size:Float;
    public function new(x:Int = 0, y:Int = 0, size:Float)
    {
        super(x, y);
        _size = size;
    }

    public override function doLayout():Void 
    {
        width = Std.int(_size + (3 * getScale()));
    }
    
    public override function canScale():Dynamic 
    {
        return false;
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        canvas.beginPath();
        canvas.circle(cx + x, cy + y, _size);
        canvas.fill();
    }
}