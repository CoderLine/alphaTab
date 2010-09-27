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
import alphatab.model.Lyrics;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.TrackSpacingPositions;
import alphatab.tablature.ViewLayout;

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