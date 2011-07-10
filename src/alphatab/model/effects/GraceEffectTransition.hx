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
 * All transition types for grace notes. 
 */
class GraceEffectTransition 
{
	/**
	 * No transition
	 */
	public static inline var None = 0;
	/**
	 * Slide from the grace note to the real one
	 */
	public static inline var Slide = 1;
	/**
	 * Perform a bend from the grace note to the real one
	 */
	public static inline var Bend = 2;
	/**
	 * Perform a hammer on 
	 */
	public static inline var Hammer = 3;	
}