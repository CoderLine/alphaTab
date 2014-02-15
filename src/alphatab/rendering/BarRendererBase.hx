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
import alphatab.platform.ICanvas;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.staves.BarSizeInfo;
import alphatab.rendering.staves.Stave;
import alphatab.rendering.utils.BoundingsLookup;
import alphatab.Settings;

/**
 * This is the base class for creating blocks which can render bars.
 */
class BarRendererBase 
{
    public var stave:Stave;
    public var x:Int;
    public var y:Int;
    public var width:Int;
    public var height:Int;
    public var index:Int;
    public var isEmpty:Bool;
    
    public var topOverflow:Int;
    public var bottomOverflow:Int;
    
    public var bar:Bar;

    private function new(bar:Bar) 
    {
        this.bar = bar;
        x = 0;
        y = 0;
        width = 0;
        height = 0;
        index = 0;
        topOverflow = 0;
        bottomOverflow = 0;
        isEmpty = true;
    }
    
    public function registerOverflowTop(topOverflow:Int)
    {
        if(topOverflow > this.topOverflow)
            this.topOverflow = topOverflow;
    }
    
    public function registerOverflowBottom(bottomOverflow:Int)
    {
        if(bottomOverflow > this.bottomOverflow)
            this.bottomOverflow = bottomOverflow;
    }
    
    public function applyBarSpacing(spacing:Int) : Void
    {
    }
    
    public inline function getSettings() : Settings
    {
        return stave.staveGroup.layout.renderer.settings;
    }
    
    public inline function getScale() : Float
    {
        return getSettings().scale;
    }
    
    public inline function getLayout() : ScoreLayout
    {
        return stave.staveGroup.layout;
    }    
    
    public inline function getResources() : RenderingResources
    {
        return getLayout().renderer.renderingResources;
    }
    
    public inline function isFirstOfLine() : Bool
    {
        return index == 0;
    }
    
    public inline function isLastOfLine() : Bool
    {
        return index == stave.barRenderers.length - 1;
    }    
    
    public inline function isLast() : Bool
    {
        return bar.index == bar.track.bars.length - 1;
    }
    
    public function registerMaxSizes(sizes:BarSizeInfo)
    {
        
    }
    
    public function applySizes(sizes:BarSizeInfo)
    {
        
    }
    
    public function finalizeRenderer(layout:ScoreLayout)
    {
        
    }
    
    /**
     * Gets the top padding for the main content of the renderer. 
     * Can be used to specify where i.E. the score lines of the notation start.
     */
    public function getTopPadding() : Int
    {
        return 0;
    }    
    
    /**
     * Gets the bottom padding for the main content of the renderer. 
     * Can be used to specify where i.E. the score lines of the notation end.
     */
    public function getBottomPadding() : Int
    {
        return 0;
    }
    
    public function doLayout()
    {
        
    }
    
    public function paint(cx:Int, cy:Int, canvas:ICanvas)
    {
    }
    
    public function buildBoundingsLookup(lookup:BoundingsLookup, y:Int, h:Int, x:Int)
    {
        var barLookup = new BarBoundings();
        barLookup.bar = bar;
        barLookup.y = y;
        barLookup.h = h;
        barLookup.x = x + this.stave.x + this.x;
        barLookup.w = width;
        lookup.bars.push(barLookup);
    }
}