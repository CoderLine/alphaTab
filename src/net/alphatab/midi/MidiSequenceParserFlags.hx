/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.midi;

class MidiSequenceParserFlags
{
	public static inline var AddDefaultControls:Int = 1;
	public static inline var AddMixerMessages:Int = 2;
	public static inline var AddMetronome:Int = 4;
	public static inline var AddFirstTickMove:Int = 8;
	public static inline var DefaultPlayFlags:Int = AddMixerMessages | AddDefaultControls | AddMetronome | AddFirstTickMove;
}