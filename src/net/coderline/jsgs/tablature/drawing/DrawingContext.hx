/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.drawing;
import net.coderline.jsgs.model.GsColor;
import net.coderline.jsgs.model.GsColor;
import net.coderline.jsgs.platform.Canvas;

class DrawingContext 
{
	public var Layers:Array<Dynamic>;
	public var Graphics:Canvas;
	
	public function new(scale:Float) 
	{
		this.Layers = new Array<Dynamic>();
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.Background)] = new DrawingLayer(new GsColor(205, 205, 205), true, 0);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.LayoutBackground)] = new DrawingLayer(new GsColor(34,34,17), true, 0);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.Lines)] = new DrawingLayer(new GsColor(165, 165, 165), false, 1);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.MainComponents)] = new DrawingLayer(new GsColor(34,34,17), true, 0);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.MainComponentsDraw)] = new DrawingLayer(new GsColor(34,34,17), false, 1*scale);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.Voice2)] = new DrawingLayer(new GsColor(206, 206, 206), true, 1);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.VoiceEffects2)] = new DrawingLayer(new GsColor(183,183,183), true, 0);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.VoiceEffectsDraw2)] = new DrawingLayer(new GsColor(183,183,183), false, 1*scale);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.VoiceDraw2)] = new DrawingLayer(new GsColor(206, 206, 206), false, 1*scale);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.Voice1)] = new DrawingLayer(new GsColor(34,34,17), true, 1);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.VoiceEffects1)] = new DrawingLayer(new GsColor(34,34,17), true, 0);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.VoiceEffectsDraw1)] = new DrawingLayer(new GsColor(34,34,17), false, 1*scale);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.VoiceDraw1)] = new DrawingLayer(new GsColor(34,34,17), false, 1*scale);
		this.Layers[DrawingLayersConverter.ToInt(DrawingLayers.Red)] = new DrawingLayer(new GsColor(255,0,0), true, 0);
	}
	
	public function Draw() : Void
	{
		for (i in 0 ... this.Layers.length) 
		{
			this.Layers[i].Draw(this.Graphics);
		}
	}
	
	public function Clear() : Void
	{
		for (i in 0 ... this.Layers.length) 
		{
			this.Layers[i].Clear();
		}
	}	
	
	public function Get(layer:DrawingLayers) : DrawingLayer
	{
		var index:Int = DrawingLayersConverter.ToInt(layer);
		return this.Layers[index];
	}
}