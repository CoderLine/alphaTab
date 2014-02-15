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
import alphatab.model.MasterBar;
import alphatab.model.Track;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.BarRendererBase;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.staves.StaveGroup.StaveTrackGroup;
import alphatab.rendering.utils.BarHelpersGroup;
import alphatab.rendering.utils.BeamingHelper;
import alphatab.rendering.utils.BoundingsLookup;
import alphatab.rendering.utils.TupletHelper;
import haxe.ds.IntMap.IntMap;

class StaveTrackGroup
{
    public var track:Track;
    public var staveGroup:StaveGroup;
    public var staves:Array<Stave>;
    
    public var firstStaveInAccolade:Stave;
    public var lastStaveInAccolade:Stave;

    
    public function new(staveGroup:StaveGroup,track:Track)
    {
        this.staveGroup = staveGroup;
        this.track = track;
        staves = new Array<Stave>();
    }
}

/**
 * A stave consists of a list of different staves and groups
 * them using an accolade. 
 */
class StaveGroup 
{
    private static inline var AccoladeLabelSpacing = 10;
    private var _firstStaveInAccolade:Stave;
    private var _lastStaveInAccolade:Stave;
    
    public var x:Int;
    public var y:Int;
    public var index:Int;
    
    private var _accoladeSpacingCalculated:Bool;
    public var accoladeSpacing:Int;

    /**
     * Indicates whether this line is full or not. If the line is full the
     * bars can be aligned to the maximum width. If the line is not full 
     * the bars will not get stretched.
     */
    public var isFull:Bool;
    
    /**
     * The width that the content bars actually need
     */
    public var width:Int;

    public var bars:Array<MasterBar>;
    
    public var staves:Array<StaveTrackGroup>;
    private var _allStaves:Array<Stave>;
    
    public var layout:ScoreLayout;
    public var helpers:BarHelpersGroup;
    
    public function new() 
    {
        bars = new Array<MasterBar>();
        staves = new Array<StaveTrackGroup>();
        _allStaves = new Array<Stave>();
        width = 0;
        index = 0;
        _accoladeSpacingCalculated = false;
        accoladeSpacing = 0;
        
        helpers = new BarHelpersGroup();
    }
    
    public inline function getLastBarIndex() : Int
    {
        return bars[bars.length - 1].index;
    }
    
    public function addBars(tracks:Array<Track>, barIndex:Int) : Void
    {
        if (tracks.length == 0) return;
        var score = tracks[0].score;
        var masterBar = score.masterBars[barIndex];
        bars.push(masterBar);
        
        helpers.buildHelpers(tracks, barIndex);
        
        if (!_accoladeSpacingCalculated && index == 0)
        {
            _accoladeSpacingCalculated = true;
            var canvas = layout.renderer.canvas;
            var res = layout.renderer.renderingResources.effectFont;
            canvas.setFont(res);
            for (t in tracks)
            {
                accoladeSpacing = Std.int(Math.max(accoladeSpacing, canvas.measureText(t.shortName)));
            }
            accoladeSpacing += (2 * AccoladeLabelSpacing);
            width += accoladeSpacing;
        }
        
        // add renderers
        var maxSizes = new BarSizeInfo();
        for (g in staves)
        {
            for (s in g.staves)
            {
                s.addBar(g.track.bars[barIndex]);
                s.barRenderers[s.barRenderers.length - 1].registerMaxSizes(maxSizes);
            }
        }
        
        // ensure same widths of new renderer
        var realWidth:Int = 0;
        for (s in _allStaves)
        {
            s.barRenderers[s.barRenderers.length - 1].applySizes(maxSizes);
            if (s.barRenderers[s.barRenderers.length - 1].width > realWidth)
            {
                realWidth = s.barRenderers[s.barRenderers.length - 1].width;
            }
        }
        
        width += realWidth;
    }

    private function getStaveTrackGroup(track:Track)
    {
        for (g in staves)
        {
            if (g.track == track)
            {
                return g;
            }
        }
        return null;
    }
    
    public function addStave(track:Track, stave:Stave) 
    {
        var group:StaveTrackGroup = getStaveTrackGroup(track);
        if (group == null)
        {
            group = new StaveTrackGroup(this, track);
            staves.push(group);
        }
       
        stave.staveTrackGroup = group;
        stave.staveGroup = this;
        stave.index = _allStaves.length;
        _allStaves.push(stave);
        group.staves.push(stave);
        
        if (stave.isInAccolade())
        {
            if (_firstStaveInAccolade == null)
            {
                _firstStaveInAccolade = stave;
                stave.isFirstInAccolade = true;
            }    
            if (group.firstStaveInAccolade == null)
            {
                group.firstStaveInAccolade = stave;
            }            
            if (_lastStaveInAccolade == null)
            {
                _lastStaveInAccolade = stave;
                stave.isLastInAccolade = true;
            }    
            
            if (_lastStaveInAccolade != null) { _lastStaveInAccolade.isLastInAccolade = false; }
            _lastStaveInAccolade = stave;
            _lastStaveInAccolade.isLastInAccolade = true;
            group.lastStaveInAccolade = stave;
        }
    }
    
    public function calculateHeight() : Int
    {
        return _allStaves[_allStaves.length - 1].y + _allStaves[_allStaves.length - 1].height; 
    }
    
    public function revertLastBar() : Void
    {
        if (bars.length > 1)
        {
            bars.pop();
            var w = 0;
            for (s in _allStaves)
            {
                w = Std.int(Math.max(w, s.barRenderers[s.barRenderers.length - 1].width));
                s.revertLastBar();
            }
            width -= w;
        }
    }
    
    public function applyBarSpacing(spacing:Int)
    {
        for (s in _allStaves)
        {
            s.applyBarSpacing(spacing);
        }
        width += bars.length * spacing;
    }
    
    public function paint(cx:Int, cy:Int,  canvas:ICanvas)
    {
        for (s in _allStaves)
        {
            s.paint(cx + x, cy + y, canvas);
        }
        
        var res = layout.renderer.renderingResources; 
        
        if (staves.length > 0)
        {            
            //
            // Draw start grouping
            // 
            
            if (_firstStaveInAccolade != null && _lastStaveInAccolade != null)
            {
                //
                // draw grouping line for all staves
                //

                var firstStart = cy + y + _firstStaveInAccolade.y + _firstStaveInAccolade.staveTop + _firstStaveInAccolade.topSpacing + _firstStaveInAccolade.getTopOverflow();
                var lastEnd = cy + y + _lastStaveInAccolade.y + _lastStaveInAccolade.topSpacing + _lastStaveInAccolade.getTopOverflow()
                                     + _lastStaveInAccolade.staveBottom;
                                     
                var acooladeX = cx + x + _firstStaveInAccolade.x;
                
                canvas.setColor(res.barSeperatorColor);
                
                canvas.beginPath();
                canvas.moveTo(acooladeX, firstStart);
                canvas.lineTo(acooladeX, lastEnd);
                canvas.stroke();
            }
            
            //
            // Draw accolade for each track group
            // 
            canvas.setFont(res.effectFont);
            for (g in staves)
            {                        
                var firstStart = cy + y + g.firstStaveInAccolade.y + g.firstStaveInAccolade.staveTop + g.firstStaveInAccolade.topSpacing + g.firstStaveInAccolade.getTopOverflow();
                var lastEnd = cy + y + g.lastStaveInAccolade.y + g.lastStaveInAccolade.topSpacing + g.lastStaveInAccolade.getTopOverflow()
                                     + g.lastStaveInAccolade.staveBottom;
                                     
                var acooladeX = cx + x + g.firstStaveInAccolade.x;

                var barSize:Int = Std.int(3 * layout.renderer.settings.scale);
                var barOffset:Int = barSize;
                
                var accoladeStart = firstStart - (barSize*4);
                var accoladeEnd = lastEnd + (barSize * 4);
                
                // text
                if (index == 0)
                {
                    canvas.fillText(g.track.shortName, cx + x + (AccoladeLabelSpacing * layout.getScale()), firstStart);
                }
                
                // rect
                canvas.fillRect(acooladeX - barOffset - barSize, accoladeStart, barSize, accoladeEnd - accoladeStart);
                
                var spikeStartX = acooladeX - barOffset - barSize;
                var spikeEndX = acooladeX + barSize * 2;
                
                // top spike
                canvas.beginPath();
                canvas.moveTo(spikeStartX, accoladeStart);
                canvas.bezierCurveTo(spikeStartX, accoladeStart, spikeStartX, accoladeStart, spikeEndX, accoladeStart - barSize);
                canvas.bezierCurveTo(acooladeX, accoladeStart + barSize, spikeStartX, accoladeStart + barSize, spikeStartX, accoladeStart + barSize);
                canvas.closePath();
                canvas.fill();
                
                // bottom spike 
                canvas.beginPath();
                canvas.moveTo(spikeStartX, accoladeEnd);
                canvas.bezierCurveTo(spikeStartX, accoladeEnd, acooladeX, accoladeEnd, spikeEndX, accoladeEnd + barSize);
                canvas.bezierCurveTo(acooladeX, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize);
                canvas.closePath();
                
                canvas.fill();
            }
        }
    }
    
    public function finalizeGroup(scoreLayout:ScoreLayout)
    {
        var currentY:Float = 0;
        for (i in 0 ... _allStaves.length)
        {
            _allStaves[i].x = accoladeSpacing;
            _allStaves[i].y = Std.int(currentY);
            _allStaves[i].finalizeStave(scoreLayout);
            currentY += _allStaves[i].height;
        }
    }
    
    public function buildBoundingsLookup(lookup:BoundingsLookup)
    {
        var topY = y + _firstStaveInAccolade.y;
        var bottomY = y + _lastStaveInAccolade.y + _lastStaveInAccolade.height;
        var h = bottomY - topY;
        for (b in _firstStaveInAccolade.barRenderers)
        {
            b.buildBoundingsLookup(lookup, topY, h, x);
        }
    }
}