/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsBeatStroke
{
	public var Direction:GsBeatStrokeDirection;
	public var Value:Int;
	
	public function new()
	{
		Direction = GsBeatStrokeDirection.None;
	}
	
	public function GetIncrementTime(beat:GsBeat) : Int
	{
		var duration:Int = 0;
		if(this.Value > 0)
		{
			for(v in 0 ...  beat.Voices.length)
			{
				var voice:GsVoice = beat.Voices[v];
				if(voice.IsEmpty) continue;
				var currentDuration:Int = voice.Duration.Time();
				if(duration == 0 || currentDuration < duration)
				{
					duration = (currentDuration <= GsDuration.QuarterTime) ? currentDuration : GsDuration.QuarterTime;
				}
			}
			if(duration > 0)
			{
				return Math.round(((duration / 8.0) * (4.0 / this.Value)));
			}
		}
		return 0;
	}
}