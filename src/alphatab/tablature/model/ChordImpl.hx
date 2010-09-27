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
/**
 * ...
 * @author Daniel Kuschny
 */

package alphatab.tablature.model;
import alphatab.model.Chord;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.TrackSpacingPositions;
import alphatab.tablature.ViewLayout;


/**
 * This Chord implementation extends the default chord with drawing and layouting features. 
 */
class ChordImpl extends Chord
{
	public static inline var MAX_FRETS:Int = 6;
	
	public function beatImpl() : BeatImpl
	{
		return cast beat;
	}

	public function new(length:Int) 
	{
		super(length);
	}
	
	public function paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		if (name != null && name != "")
		{
			var realX:Int = x + Math.round(4 * layout.scale);
			var realY:Int = y + getPaintPosition(TrackSpacingPositions.Chord); 
			context.get(DrawingLayers.MainComponents).addString(name, DrawingResources.chordFont,
										  realX, realY);
		}
	}

	public function getPaintPosition(index:Int) : Int
	{
		return beatImpl().measureImpl().ts.get(index);
	}
}