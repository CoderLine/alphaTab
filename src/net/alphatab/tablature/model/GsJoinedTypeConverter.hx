/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;

class GsJoinedTypeConverter 
{
	public static function ToInt(t:GsJoinedType) : Int
	{
		switch(t)
		{
			case GsJoinedType.NoneLeft: return 1;
			case GsJoinedType.NoneRight: return 2;
			case GsJoinedType.Left: return 3;
			case GsJoinedType.Right: return 4;
		}
	}
}