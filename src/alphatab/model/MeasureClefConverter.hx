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
package alphatab.model;

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