package net.alphatab.tablature.model;
import net.alphatab.model.BeatText;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;

/**
 * This Beat-Text implementation extends the default beat text with drawing and layouting features. 
 */
class BeatTextImpl extends BeatText
{
	public function new() 
	{
		super();		 
	}
	
	public function paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var beat:BeatImpl = cast beat;
		var measure:MeasureImpl = beat.measureImpl();
		var realX:Int = x + beat.spacing() + beat.posX;
		var realY:Int = y + measure.ts.get(TrackSpacingPositions.Text); 
		context.get(DrawingLayers.Voice1).addString(value, DrawingResources.defaultFont, realX, realY);
	}
	
}