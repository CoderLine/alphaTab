package net.alphatab.tablature.model;

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