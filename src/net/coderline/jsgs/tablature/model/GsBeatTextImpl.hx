/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.model;
import net.coderline.jsgs.model.GsBeatText;
import net.coderline.jsgs.tablature.drawing.DrawingContext;
import net.coderline.jsgs.tablature.drawing.DrawingLayers;
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.TrackSpacingPositions;
import net.coderline.jsgs.tablature.ViewLayout;

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