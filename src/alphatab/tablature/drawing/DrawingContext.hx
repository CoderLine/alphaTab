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
package alphatab.tablature.drawing;
import alphatab.model.Color;
import alphatab.model.Color;
import alphatab.platform.Canvas;

/**
 * A drawing context is a set of drawing layers. 
 */
class DrawingContext 
{
	public var layers:Array<DrawingLayer>;
	public var graphics:Canvas;
	
	public function new(scale:Float) 
	{
		this.layers = new Array<DrawingLayer>();
		this.layers[DrawingLayers.Background] = new DrawingLayer(new Color(205, 205, 205), true, 0);
		this.layers[DrawingLayers.LayoutBackground] = new DrawingLayer(new Color(34,34,17), true, 0);
		this.layers[DrawingLayers.Lines] = new DrawingLayer(new Color(165, 165, 165), false, 1);
		this.layers[DrawingLayers.MainComponents] = new DrawingLayer(new Color(34,34,17), true, 0);
		this.layers[DrawingLayers.MainComponentsDraw] = new DrawingLayer(new Color(34,34,17), false, 1*scale);
		this.layers[DrawingLayers.Voice2] = new DrawingLayer(new Color(150, 150, 150), true, 1);
		this.layers[DrawingLayers.VoiceEffects2] = new DrawingLayer(new Color(150, 150, 150), true, 0);
		this.layers[DrawingLayers.VoiceEffectsDraw2] = new DrawingLayer(new Color(150, 150, 150), false, 1*scale);
		this.layers[DrawingLayers.VoiceDraw2] = new DrawingLayer(new Color(150, 150, 150), false, 1*scale);
		this.layers[DrawingLayers.Voice1] = new DrawingLayer(new Color(34,34,17), true, 1);
		this.layers[DrawingLayers.VoiceEffects1] = new DrawingLayer(new Color(34,34,17), true, 0);
		this.layers[DrawingLayers.VoiceEffectsDraw1] = new DrawingLayer(new Color(34,34,17), false, 1*scale);
		this.layers[DrawingLayers.VoiceDraw1] = new DrawingLayer(new Color(34,34,17), false, 1*scale);
		this.layers[DrawingLayers.Red] = new DrawingLayer(new Color(255,0,0), true, 0);
	}
	
	public function draw() : Void
	{
		for (i in 0 ... this.layers.length) 
		{
			this.layers[i].draw(this.graphics);
		}
	}
	
	public function clear() : Void
	{
		for (i in 0 ... this.layers.length) 
		{
			this.layers[i].clear();
		}
	}	
	
	public function get(layer:Int) : DrawingLayer
	{
		return this.layers[layer];
	}
}