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
package alphatab.rendering.glyphs.effects;

import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.RenderingResources;

class DummyEffectGlyph extends Glyph
{
    private var _s:String;
    public function new(x:Int = 0, y:Int = 0, s:String)
    {
        super(x, y);
        _s = s;
    }

    public override function doLayout():Void 
    {
        width = Std.int(20 * getScale());
    }
    
    public override function canScale():Dynamic 
    {
        return false;
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var res:RenderingResources = renderer.getResources();
        canvas.setColor(res.mainGlyphColor);
        canvas.strokeRect(cx + x, cy + y, width, 20 * getScale());
        canvas.setFont(res.tablatureFont);
        canvas.fillText(_s, cx + x, cy + y);
    }
}