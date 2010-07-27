/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;
import net.alphatab.model.GsChord;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;

class GsChordImpl extends GsChord
{
	public static inline var MaxFrets:Int = 6;
	
	public function BeatImpl() : GsBeatImpl
	{
		return cast Beat;
	}

	public function new(length:Int) 
	{
		super(length);
	}
	
	public function Paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		if (Name != null && Name != "")
		{
			var realX:Int = x + Math.round(4 * layout.Scale);
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.Chord); 
			context.Get(DrawingLayers.MainComponents).AddString(Name, DrawingResources.ChordFont,
										  realX, realY);
		}
	}

	public function GetPaintPosition(iIndex:TrackSpacingPositions) : Int
	{
		return BeatImpl().MeasureImpl().Ts.Get(iIndex);
	}
}