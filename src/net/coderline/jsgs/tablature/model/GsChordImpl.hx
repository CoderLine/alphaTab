/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.model;
import net.coderline.jsgs.model.GsChord;
import net.coderline.jsgs.tablature.drawing.DrawingContext;
import net.coderline.jsgs.tablature.drawing.DrawingLayers;
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.TrackSpacingPositions;
import net.coderline.jsgs.tablature.ViewLayout;

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