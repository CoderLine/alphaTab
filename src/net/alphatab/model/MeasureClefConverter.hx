package net.alphatab.model;

/**
 * A converter, which converts clefs into int and string. 
 */
class MeasureClefConverter 
{
	public static function toInt(clef:MeasureClef) : Int
	{
		switch(clef)
		{
			case MeasureClef.Treble: return 1;
			case MeasureClef.Bass: return 2;
			case MeasureClef.Tenor: return 3;
			case MeasureClef.Alto: return 4;
			default: return 1;
		}
	}
	public static function toString(clef:MeasureClef) : String
	{
		switch(clef)
		{
			case MeasureClef.Treble: return "treble";
			case MeasureClef.Bass: return "bass";
			case MeasureClef.Tenor: return "tenor";
			case MeasureClef.Alto: return "alto";
			default: return "treble";
		}
	}
}