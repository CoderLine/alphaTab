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
package alphatab.rendering;

import alphatab.model.Bar;
import alphatab.rendering.utils.BeamingHelper.BeamDirection;

class RhythmBarRendererFactory extends BarRendererFactory
{
    private var _direction:BeamDirection;
    public function new(direction:BeamDirection) 
    {
        super();
        isInAccolade = false;
        _direction = direction;
        hideOnMultiTrack = false;
    }

    public override function create(bar:Bar):BarRendererBase 
    {
        return new RhythmBarRenderer(bar, _direction);
    }
}