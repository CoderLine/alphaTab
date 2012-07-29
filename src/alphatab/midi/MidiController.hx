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
package alphatab.midi;
import alphatab.io.Byte;

/**
 * A list of available midi controllers. 
 */
class MidiController
{
    public static inline var ALL_NOTES_OFF:Byte = 0x7b;
    public static inline var BALANCE:Byte = 0x0A;
    public static inline var CHORUS:Byte = 0x5d;
    public static inline var DATA_ENTRY_LSB:Byte = 0x26;
    public static inline var DATA_ENTRY_MSB:Byte = 0x06;
    public static inline var EXPRESSION:Byte = 0x0B;
    public static inline var PHASER:Byte = 0x5f;
    public static inline var REVERB:Byte = 0x5b;
    public static inline var RPN_LSB:Byte = 0x64;
    public static inline var RPN_MBS:Byte = 0x65;
    public static inline var TREMOLO:Byte = 0x5c;
    public static inline var VOLUME:Byte = 0x07;
}