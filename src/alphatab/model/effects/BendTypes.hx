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
 * All Bend presets
 */
class BendTypes
{
	// Bends 
	/**
	 * No Preset 
	 */
	public static inline var None = 0;
	/**
	 * A simple bend 
	 */
	public static inline var Bend = 1;
	/**
	 * A bend and release afterwards
	 */
	public static inline var BendRelease = 2;
	/**
	 * A bend, then release and rebend
	 */
	public static inline var BendReleaseBend = 3;
	/**
	 * Prebend 
	 */
	public static inline var Prebend = 4;
	/**
	 * Prebend and then release
	 */
	public static inline var PrebendRelease = 5;
	
    // Tremolobar	
	/**
	 * Dip the bar down and then back up
	 */
	public static inline var Dip = 6;
	/**
	 * Dive the bar
	 */
	public static inline var Dive = 7;
	/**
	 * Release the bar up
	 */
	public static inline var ReleaseUp = 8;
	/**
	 * Dip the bar up and then back down
	 */
	public static inline var InvertedDip = 9;
	/**
	 * Return the bar
	 */
	public static inline var Return = 10;
	/**
	 * Release the bar down
	 */
	public static inline var ReleaseDown = 11;	
}