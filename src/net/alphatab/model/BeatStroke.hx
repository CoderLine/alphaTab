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