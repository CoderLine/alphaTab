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
package alphatab.rendering.staves;

import alphatab.model.Bar;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.BarRendererBase;
import alphatab.rendering.BarRendererFactory;
import alphatab.rendering.layout.ScoreLayout;

/**
 * A stave represents a single line within a StaveGroup. 
 * It stores BarRenderer instances created from a given factory. 
 */
class Stave 
{
    public var staveGroup:StaveGroup;
    
    private var _factory:BarRendererFactory;
    public var barRenderers:Array<BarRendererBase>;
    
    public var x:Int;
    public var y:Int;
    public var height:Int;
    public var index:Int;
    
    /**
     * This is the visual offset from top where the
     * stave contents actually start. Used for grouping 
     * using a accolade
     */
    public var staveTop:Int;
    public var topSpacing:Int;
    public var bottomSpacing:Int;
    /**
     * This is the visual offset from top where the
     * stave contents actually ends. Used for grouping 
     * using a accolade
     */    
    public var staveBottom:Int;
    
    public var isFirstInAccolade:Bool;
    public var isLastInAccolade:Bool;
    
    public function new(barRendererFactory:BarRendererFactory) 
    {
        barRenderers = new Array<BarRendererBase>();
        _factory = barRendererFactory;
        topSpacing = 10;
        bottomSpacing = 10;
        staveTop = 0;
        staveBottom = 0;
    }

    public inline function isInAccolade()
    {
        return _factory.isInAccolade;
    }
    
    public function registerStaveTop(offset:Int)
    {
        staveTop = offset;
    }
    
    public function registerStaveBottom(offset:Int)
    {
        staveBottom = offset;
    }
    
    public function addBar(bar:Bar)
    {
        var renderer:BarRendererBase = _factory.create(bar);
        renderer.stave = this;
        renderer.index = barRenderers.length;
        renderer.doLayout();
        barRenderers.push(renderer);
    }
    
    public function revertLastBar()
    {
        barRenderers.pop();
    }
    
    public function applyBarSpacing(spacing:Int)
    {
        for (b in barRenderers)
        {
            b.applyBarSpacing(spacing);
        }
    }
    
    public function getTopOverflow() : Int
    {
        var m:Int = 0;
        for (r in barRenderers)
        {
            if (r.topOverflow > m)
            {
                m = r.topOverflow;
            }
        }
        return m;
    }    
    
    public function getBottomOverflow() : Int
    {
        var m:Int = 0;
        for (r in barRenderers)
        {
            if (r.bottomOverflow > m)
            {
                m = r.bottomOverflow;
            }
        }
        return m;
    }
    
    public function finalizeStave(layout:ScoreLayout)
    {
        var x = 0; 
        height = 0;
        var topOverflow = getTopOverflow();
        var bottomOverflow = getBottomOverflow();
        var isEmpty:Bool = true;
        for (i in 0 ... barRenderers.length)
        {
            barRenderers[i].x = x;
            barRenderers[i].y = topSpacing + topOverflow;
            height = Std.int(Math.max(height, barRenderers[i].height));
            barRenderers[i].finalizeRenderer(layout);
            x += barRenderers[i].width;
            if (!barRenderers[i].isEmpty)
            {
                isEmpty = false;
            }
        }
        
        if (!isEmpty)
        {
            height += topSpacing + topOverflow + bottomOverflow + bottomSpacing;
        }
        else
        {
            height = 0;
        }
    }
    
        
    public function paint(cx:Int, cy:Int, canvas:ICanvas)
    {
        if (height == 0) return;
        for (r in barRenderers)
        {
            r.paint(cx + x, cy + y, canvas);
        }
    }
}