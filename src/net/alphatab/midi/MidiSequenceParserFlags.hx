/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.midi;

class MidiSequenceParserFlags
{
	public static inline var ADD_DEFAULT_CONTROLS:Int = 1;
	public static inline var ADD_MIXER_MESSAGES:Int = 2;
	public static inline var ADD_METRONOME:Int = 4;
	public static inline var ADD_FIRST_TICK_MOVE:Int = 8;
	public static inline var DEFAULT_PLAY_FLAGS:Int = ADD_MIXER_MESSAGES | ADD_DEFAULT_CONTROLS | ADD_METRONOME | ADD_FIRST_TICK_MOVE;
}