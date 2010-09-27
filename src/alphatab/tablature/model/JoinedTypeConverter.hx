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
package alphatab.tablature.model;

/**
 * This converter converts JoinedTypes to int values.
 */
class JoinedTypeConverter 
{
	public static function toInt(t:JoinedType) : Int
	{
		switch(t)
		{
			case JoinedType.NoneLeft: return 1;
			case JoinedType.NoneRight: return 2;
			case JoinedType.Left: return 3;
			case JoinedType.Right: return 4;
		}
	}
}