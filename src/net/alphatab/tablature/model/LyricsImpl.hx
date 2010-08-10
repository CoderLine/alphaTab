package net.alphatab.tablature.model;
import net.alphatab.model.Lyrics;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.TrackSpacingPositionConverter;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;

/**
 * This Lyrics implementation extends the default lyrics with drawing and layouting features. 
 */
class LyricsImpl extends Lyrics
{
	public function new() 
	{
		super();
	}
	
	public function paintCurrentNoteBeats(context:DrawingContext, layout:ViewLayout, currentMeasure:MeasureImpl, beatCount:Int, x:Int, y:Int) : Void
	{
		var beats:Array<String> = this.lyricsBeats();
		if (beats != null && beats.length > 0)
		{
			var beatIndex:Int = 0;
			for (i in 0 ... currentMeasure.beatCount())
			{
				var index = beatCount + i;
				var beat:BeatImpl = cast currentMeasure.beats[i];
				if (index < beats.length)
				{
					var str:String = StringTools.trim(beats[index]);
					if (str.length > 0)
					{
						var realX:Int = (x + beat.posX + beat.spacing() + 2);
						context.get(DrawingLayers.MainComponents).addString(str, 
							DrawingResources.defaultFont, 
							realX + 13, y + currentMeasure.ts.get(TrackSpacingPositions.Lyric));
					}
				}
				beatIndex++;
			}
		}
	}
}