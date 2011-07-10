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
 * All harmonic effect types
 */
class HarmonicType
{
	/**
	 * No harmonic
	 */
	public static inline var None = -1;
	/**
	 * Natural harmonic
	 */
	public static inline var Natural = 0;
	/**
	 * Artificial harmonic
	 */
	public static inline var Artificial = 1;
	/**
	 * Tapped harmonic
	 */
	public static inline var Tapped = 2;
	/**
	 * Pinch harmonic
	 */
	public static inline var Pinch = 3;
	/**
	 * Semi harmonic
	 */
	public static inline var Semi = 4;
}