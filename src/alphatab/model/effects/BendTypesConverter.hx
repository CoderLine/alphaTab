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
package alphatab.model.effects;

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