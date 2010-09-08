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
package net.alphatab.model;

/**
 * A stroke effect for beats. 
 */
class BeatStroke
{
	public var direction:BeatStrokeDirection;
	public var value:Int;
	
	public function new()
	{
		direction = BeatStrokeDirection.None;
	}
	
	public function getIncrementTime(beat:Beat) : Int
	{
		var duration:Int = 0;
		if(this.value > 0)
		{
			for(v in 0 ...  beat.voices.length)
			{
				var voice:Voice = beat.voices[v];
				if(voice.isEmpty) continue;
				var currentDuration:Int = voice.duration.time();
				if(duration == 0 || currentDuration < duration)
				{
					duration = (currentDuration <= Duration.QUARTER_TIME) ? currentDuration : Duration.QUARTER_TIME;
				}
			}
			if(duration > 0)
			{
				return Math.round(((duration / 8.0) * (4.0 / value)));
			}
		}
		return 0;
	}
}