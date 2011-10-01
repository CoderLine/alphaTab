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

class MidiSequenceParserFlags
{
    public static inline var ADD_DEFAULT_CONTROLS:Int = 1;
    public static inline var ADD_MIXER_MESSAGES:Int = 2;
    public static inline var ADD_METRONOME:Int = 4;
    public static inline var ADD_FIRST_TICK_MOVE:Int = 8;
    public static inline var DEFAULT_PLAY_FLAGS:Int = ADD_MIXER_MESSAGES | ADD_DEFAULT_CONTROLS | ADD_METRONOME | ADD_FIRST_TICK_MOVE;
}