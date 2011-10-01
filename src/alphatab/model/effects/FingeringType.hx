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
 * Lists all fingers for fingering effects. 
 */
class FingeringType 
{
    /**
     * Unknown type (not documented)
     */
    public static inline var Unknown = -2;
    /**
     * No finger, dead note
     */
    public static inline var NoOrDead = -1;
    /**
     * The thumb
     */
    public static inline var Thumb = 0;
    /**
     * The index finger
     */
    public static inline var IndexFinger = 1;
    /**
     * The middle finger
     */
    public static inline var MiddleFinger = 2;
    /**
     * The annular finger
     */
    public static inline var AnnularFinger = 3;
    /**
     * The little finger
     */
    public static inline var LittleFinger = 4;
}