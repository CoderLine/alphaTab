/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;
import net.alphatab.model.GsLyrics;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.TrackSpacingPositionConverter;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;

class GsLyricsImpl extends GsLyrics
{
	public function new() 
	{
		super();
	}
	
	public function PaintCurrentNoteBeats(context:DrawingContext, layout:ViewLayout, currentMeasure:GsMeasureImpl , x:Int, y:Int) : Void
	{
		var beats:Array<String> = this.LyricsBeats();
		if (beats != null && beats.length > 0)
		{
			var beatIndex:Int = 0;
			for (i in 0 ... currentMeasure.BeatCount())
			{
				var beat:GsBeatImpl = cast currentMeasure.Beats[i];
				if (!beat.IsRestBeat())
				{ 
					if (beatIndex < beats.length)
					{
						var str:String = StringTools.trim(beats[beatIndex]);
						if (str.length > 0)
						{
							var realX:Int = (x + beat.PosX + beat.Spacing() + 2);
							context.Get(DrawingLayers.MainComponents).AddString(str, 
								DrawingResources.DefaultFont, 
								realX + 13, y + currentMeasure.Ts.Get(TrackSpacingPositions.Lyric));
						}
					}
					beatIndex++;
				}
			}
		}
	}
}