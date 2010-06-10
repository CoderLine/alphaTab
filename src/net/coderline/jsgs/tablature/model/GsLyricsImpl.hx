/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.model;
import net.coderline.jsgs.model.GsLyrics;
import net.coderline.jsgs.tablature.drawing.DrawingContext;
import net.coderline.jsgs.tablature.drawing.DrawingLayers;
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.TrackSpacingPositionConverter;
import net.coderline.jsgs.tablature.TrackSpacingPositions;
import net.coderline.jsgs.tablature.ViewLayout;

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