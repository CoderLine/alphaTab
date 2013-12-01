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

/**
 * This simple glyph allows to put an empty region in to a BarRenderer.
 */
class SpacingGlyph extends Glyph
{
    private var _scaling:Bool;
    
    public function new(x:Int = 0, y:Int = 0, width:Int, scaling:Bool = true)
    {
        super(x, y);
        this.width = width;
        _scaling = scaling;
    }
    
    public override function canScale():Bool 
    {
        return _scaling;
    }
}