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

import alphatab.Environment;
import alphatab.model.Score;
import alphatab.model.Track;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.platform.model.TextAlign;
import alphatab.rendering.layout.HorizontalScreenLayout;
import alphatab.rendering.layout.PageViewLayout;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.Settings;
import haxe.ds.StringMap;

/**
 * This is the main wrapper of the rendering engine which 
 * can render a single track of a score object into a notation sheet.
 */
class ScoreRenderer 
{
    private var _renderFinishedListeners:Array < Void->Void > ;
    public var canvas : ICanvas;
    public var score(get, null) : Score;
    public var tracks : Array<Track>;
    
    private var _currentLayoutMode:String;
    public var layout : ScoreLayout;
    
    public var renderingResources : RenderingResources;
    
    public var settings:Settings;
    
    public function new(settings:Settings, param:Dynamic) 
    {
        this.settings = settings;
        _renderFinishedListeners = new Array < Void->Void > ();
        this.renderingResources = new RenderingResources(1);
        if (settings.engine == null || !Environment.renderEngines.exists(settings.engine))
        {
            canvas = Environment.renderEngines.get("default")(param);
        }
        else 
        {
            canvas = Environment.renderEngines.get(settings.engine)(param);
        }
        recreateLayout();
    }
    
    private function recreateLayout() 
    {
        if (_currentLayoutMode != settings.layout.mode)
        {
            if (settings.layout == null || !Environment.layoutEngines.exists(settings.layout.mode))
            {
                layout = Environment.layoutEngines.get("default")(this);
            }
            else 
            {
                layout = Environment.layoutEngines.get(settings.layout.mode)(this);
            }
            _currentLayoutMode = settings.layout.mode;
        }
    }
    
    public function render(track:Track)
    {
        this.tracks = [track];
        invalidate();
    }
    
    public function renderMultiple(tracks:Array<Track>)
    {
        this.tracks = tracks;
        invalidate();
    }
    
    public function invalidate()
    {
        if (tracks.length == 0) return;
        if (this.renderingResources.scale != this.settings.scale)
        {
            this.renderingResources.init(this.settings.scale);         
            canvas.setLineWidth(this.settings.scale);
        }
        recreateLayout();
        canvas.clear();   
        doLayout();
        paintScore();
        raiseRenderFinished();
    }
    
    public function get_score() : Score
    {
        if (tracks == null || tracks.length == 0)
        {
            return null;
        }
        return tracks[0].score;
    }
    
    private function doLayout()
    {
        layout.doLayout();
        canvas.setHeight(Std.int(layout.height + (renderingResources.copyrightFont.getSize() * 2)));
        canvas.setWidth(layout.width);
    }
    
    private function paintScore()
    {
        paintBackground();
        layout.paintScore();
    }
    
    public function paintBackground() 
    {
        // attention, you are not allowed to remove change this notice within any version of this library without permission!
        var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
        canvas.setColor(new Color(62, 62, 62));
        canvas.setFont(renderingResources.copyrightFont);
        canvas.setTextAlign(TextAlign.Center);
        
        var x:Float = canvas.getWidth() / 2;
        canvas.fillText(msg, x, canvas.getHeight() - (renderingResources.copyrightFont.getSize() * 2));
    }

    public function addRenderFinishedListener(listener:Void->Void)
    {
        _renderFinishedListeners.push(listener);
    }
    
    public function removeRenderFinishedListener(listener:Void->Void)
    {
        _renderFinishedListeners.remove(listener);
    }
    
    private function raiseRenderFinished()
    {
        for (l in _renderFinishedListeners)
        {
            if(l != null) l();
        }
    }
    
}