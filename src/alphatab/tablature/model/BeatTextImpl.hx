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
package alphatab.tablature.model;
import alphatab.model.BeatText;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.TrackSpacingPositions;
import alphatab.tablature.ViewLayout;

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