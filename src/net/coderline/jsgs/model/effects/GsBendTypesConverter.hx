/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model.effects;

class GsBendTypesConverter 
{
	public static function FromInt(i : Int) : GsBendTypes
	{
		switch(i)
		{
			case 0: return GsBendTypes.None;
			case 1: return GsBendTypes.Bend;
			case 2: return GsBendTypes.BendRelease;
			case 3: return GsBendTypes.BendReleaseBend;
			case 4: return GsBendTypes.Prebend;
			case 5: return GsBendTypes.PrebendRelease;
			case 6: return GsBendTypes.Dip;
			case 7: return GsBendTypes.Dive;
			case 8: return GsBendTypes.ReleaseUp;
			case 9: return GsBendTypes.InvertedDip;
			case 10: return GsBendTypes.Return;
			case 11: return GsBendTypes.ReleaseDown;	
			default: return GsBendTypes.None;
		}
	}
	
}