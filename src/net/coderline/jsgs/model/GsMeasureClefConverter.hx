/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

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
	
}