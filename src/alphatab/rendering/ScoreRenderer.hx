/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
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
    public var canvas : ICanvas;
    public var score(get, null) : Score;
    public var track : Track;
    public var scale : Float;
    
    public var layout : ScoreLayout;
    
    public var renderingResources : RenderingResources;
	
	public var settings:Settings;

        
    public function new(settings:Settings, param:Dynamic) 
    {
        this.settings = settings;
        if (settings.engine == null || !Environment.renderEngines.exists(settings.engine))
        {
            canvas = Environment.renderEngines.get("default")(param);
        }
        else 
        {
            canvas = Environment.renderEngines.get(settings.engine)(param);
        }
        updateScale(1.0);
        layout = new PageViewLayout(this);
    }
	
	public function updateScale(scale:Float)
	{
		this.scale = scale;
		this.renderingResources = new RenderingResources(scale);
        canvas.setLineWidth(scale);
	}
    
    public function render(track:Track)
    {
		this.track = track;
        invalidate();
    }
    
    public function invalidate()
    {
		canvas.clear();		
        doLayout();
        paintScore();
    }
    
    public function get_score() : Score
    {
        if (track == null)
        {
            return null;
        }
        return track.score;
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
}