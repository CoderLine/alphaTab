/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;
import net.alphatab.model.GsBeatText;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;

class GsBeatTextImpl extends GsBeatText
{
	public function new() 
	{
		super();		 
	}
	
	public function Paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var beat:GsBeatImpl = cast Beat;
		var measure:GsMeasureImpl = beat.MeasureImpl();
		var realX:Int = x + beat.Spacing() + beat.PosX;
		var realY:Int = y + measure.Ts.Get(TrackSpacingPositions.Text); 
		context.Get(DrawingLayers.Voice1).AddString(Value, DrawingResources.DefaultFont, realX, realY);
	}
	
}