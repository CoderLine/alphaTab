package net.alphatab.tablature;

/**
 * A converter which converts spacings to integer. 
 */
class TrackSpacingPositionConverter
{
	public static function toInt(pos:TrackSpacingPositions):Int
	{
		switch(pos)
		{
			case TrackSpacingPositions.Top: return 0;
			case TrackSpacingPositions.Marker: return 1;
			case TrackSpacingPositions.Text: return 2;
			case TrackSpacingPositions.BufferSeparator: return 3;
			case TrackSpacingPositions.RepeatEnding: return 4;
			case TrackSpacingPositions.Chord: return 5;
			case TrackSpacingPositions.ScoreUpLines: return 6;
			case TrackSpacingPositions.ScoreMiddleLines: return 7;
			case TrackSpacingPositions.ScoreDownLines: return 8;
			case TrackSpacingPositions.Tupleto: return 9;
			case TrackSpacingPositions.AccentuatedEffect: return 10;
			case TrackSpacingPositions.HarmonicEffect: return 11;
			case TrackSpacingPositions.TapingEffect: return 12;
			case TrackSpacingPositions.LetRingEffect:return  13;
			case TrackSpacingPositions.PalmMuteEffect: return 14;
			case TrackSpacingPositions.BeatVibratoEffect: return 15;
			case TrackSpacingPositions.VibratoEffect: return 16;
			case TrackSpacingPositions.FadeIn: return 17;
			case TrackSpacingPositions.Bend: return 18;
			case TrackSpacingPositions.TablatureTopSeparator: return 19;
			case TrackSpacingPositions.Tablature: return 20;
			case TrackSpacingPositions.TremoloBarDown: return 21;
			case TrackSpacingPositions.Lyric: return 22;
			case TrackSpacingPositions.Bottom: return 23;
			default: return 0;
		}
		
	}
}