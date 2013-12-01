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

/**
 * This glyph allows to group several other glyphs to be
 * drawn at the same x position
 */
class GlyphGroup extends Glyph
{
    private var _glyphs:Array<Glyph>;
    public function new(x:Int = 0, y:Int = 0, glyphs:Array<Glyph> = null)
    {
        super(x, y);
        _glyphs = glyphs != null ? glyphs : new Array<Glyph>();
    }
    
    public override function doLayout():Void 
    {
        var w = 0;
        for (g in _glyphs)
        {
            g.renderer = renderer;
            g.doLayout();
            w = Std.int(Math.max(w, g.width));
        }    
        width = w;
    }
    
    public function addGlyph(g:Glyph)
    {
        _glyphs.push(g);
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        for (g in _glyphs)
        {
            g.renderer = renderer;
            g.paint(cx + x, cy + y, canvas);
        }
    }
}