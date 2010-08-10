/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;
import net.alphatab.model.Chord;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;


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

	public function getPaintPosition(iIndex:TrackSpacingPositions) : Int
	{
		return beatImpl().measureImpl().ts.get(iIndex);
	}
}