/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsVelocities
{
	public static inline var MinVelocity :Int = 15;
	public static inline var VelocityIncrement :Int = 16;
	public static inline var PianoPianissimo :Int = (MinVelocity);
	public static inline var Pianissimo :Int = (MinVelocity + VelocityIncrement);
	public static inline var Piano :Int = (MinVelocity + (VelocityIncrement * 2));
	public static inline var MezzoPiano :Int = (MinVelocity + (VelocityIncrement * 3));
	public static inline var MezzoForte :Int = (MinVelocity + (VelocityIncrement * 4));
	public static inline var Forte :Int = (MinVelocity + (VelocityIncrement * 5));
	public static inline var Fortissimo :Int = (MinVelocity + (VelocityIncrement * 6));
	public static inline var ForteFortissimo :Int = (MinVelocity + (VelocityIncrement * 7));
	public static inline var Default :Int = Forte;

	private function new()
	{
	}

}