package net.alphatab.model.effects;

/**
 * A converter which converts a int value into a BendType.
 */
class BendTypesConverter 
{
	public static function fromInt(i : Int) : BendTypes
	{
		switch(i)
		{
			case 0: return BendTypes.None;
			case 1: return BendTypes.Bend;
			case 2: return BendTypes.BendRelease;
			case 3: return BendTypes.BendReleaseBend;
			case 4: return BendTypes.Prebend;
			case 5: return BendTypes.PrebendRelease;
			case 6: return BendTypes.Dip;
			case 7: return BendTypes.Dive;
			case 8: return BendTypes.ReleaseUp;
			case 9: return BendTypes.InvertedDip;
			case 10: return BendTypes.Return;
			case 11: return BendTypes.ReleaseDown;	
			default: return BendTypes.None;
		}
	}	
}