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
package alphatab.rendering.layout;

import alphatab.rendering.staves.StaveGroup;

/**
 * This layout arranges the bars all horizontally.
 */
class HorizontalScreenLayout extends ScoreLayout
{
    // left top right bottom
    public static var PagePadding:Array<Int> = [20, 20, 20, 20];
    
    public static inline var GroupSpacing = 20;

    private var _group:StaveGroup;

    public function new(renderer:ScoreRenderer) 
    {
        super(renderer);
    }

    public override function doLayout()
    {
        if (renderer.settings.staves.length == 0) return;
        
        var score = renderer.score;
        
        var startIndex = renderer.settings.layout.get('start', 1);
        startIndex--; // map to array index
        startIndex = Std.int(Math.min(score.masterBars.length - 1, Math.max(0, startIndex)));
        var currentBarIndex = startIndex;
 
        var endBarIndex = renderer.settings.layout.get('count', score.masterBars.length);
        endBarIndex = startIndex + endBarIndex - 1; // map count to array index
        endBarIndex = Std.int(Math.min(score.masterBars.length - 1, Math.max(0, endBarIndex)));

        var x = PagePadding[0];
        var y = PagePadding[1];
        
        _group = createEmptyStaveGroup();
        
        while (currentBarIndex <= endBarIndex)
        {
            _group.addBars(renderer.tracks, currentBarIndex);            
            currentBarIndex++;
        }        
        
        _group.x = x;
        _group.y = y;
        
        _group.finalizeGroup(this);
        
        y += _group.calculateHeight() + Std.int(GroupSpacing * getScale());
        height = y + PagePadding[3];
        width = _group.x + _group.width + PagePadding[2];
    }

    public override function paintScore():Void 
    {
        _group.paint(0, 0, renderer.canvas);
    }

}