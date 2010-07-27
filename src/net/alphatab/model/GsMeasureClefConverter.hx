/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsMeasureClefConverter 
{
	public static function ToInt(clef:GsMeasureClef) : Int
	{
		switch(clef)
		{
			case GsMeasureClef.Treble: return 1;
			case GsMeasureClef.Bass: return 2;
			case GsMeasureClef.Tenor: return 3;
			case GsMeasureClef.Alto: return 4;
			default: return 1;
		}
	}
	public static function ToString(clef:GsMeasureClef) : String
	{
		switch(clef)
		{
			case GsMeasureClef.Treble: return "treble";
			case GsMeasureClef.Bass: return "bass";
			case GsMeasureClef.Tenor: return "tenor";
			case GsMeasureClef.Alto: return "alto";
			default: return "";
		}
	}
}