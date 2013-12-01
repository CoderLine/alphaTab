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

import alphatab.rendering.Glyph;

class TimeSignatureGlyph extends GlyphGroup
{
    private var _numerator:Int;
    private var _denominator:Int;
    
    public function new(x:Int, y:Int, numerator:Int, denominator:Int) 
    {
        super(x, y, new Array<Glyph>());
        _numerator = numerator;
        _denominator = denominator;
    }
    
    public override function canScale():Bool 
    {
        return false;
    }
    
    public override function doLayout():Void 
    {
        var numerator = new NumberGlyph(0, 0, _numerator);
        var denominator = new NumberGlyph(0, Std.int(18 * getScale()), _denominator);

        _glyphs.push(numerator);
        _glyphs.push(denominator);

        super.doLayout();
        
        for (g in _glyphs)
        {
            g.x = Std.int((width - g.width) / 2);
        }
    }
}