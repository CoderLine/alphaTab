package net.alphatab.model;

/**
 * A list of velocities / dynamics
 */
class Velocities
{
	public static inline var MIN_VELOCITY :Int = 15;
	public static inline var VELOCITY_INCREMENT :Int = 16;
	public static inline var PIANO_PIANISSIMO :Int = (MIN_VELOCITY);
	public static inline var PIANISSIMO :Int = (MIN_VELOCITY + VELOCITY_INCREMENT);
	public static inline var PIANO :Int = (MIN_VELOCITY + (VELOCITY_INCREMENT * 2));
	public static inline var MEZZO_PIANO :Int = (MIN_VELOCITY + (VELOCITY_INCREMENT * 3));
	public static inline var MEZZO_FORTE :Int = (MIN_VELOCITY + (VELOCITY_INCREMENT * 4));
	public static inline var FORTE :Int = (MIN_VELOCITY + (VELOCITY_INCREMENT * 5));
	public static inline var FORTISSIMO :Int = (MIN_VELOCITY + (VELOCITY_INCREMENT * 6));
	public static inline var FORTE_FORTISSIMO :Int = (MIN_VELOCITY + (VELOCITY_INCREMENT * 7));
	public static inline var DEFAULT :Int = FORTE;
}