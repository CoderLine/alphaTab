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