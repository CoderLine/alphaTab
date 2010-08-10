package net.alphatab.midi;

/**
 * A list of available midi controllers. 
 */
class MidiController
{
	public static inline var ALL_NOTES_OFF:Int = 0x7b;
	public static inline var BALANCE:Int = 0x0A;
	public static inline var CHORUS:Int = 0x5d;
	public static inline var DATA_ENTRY_LSB:Int = 0x26;
	public static inline var DATA_ENTRY_MSB:Int = 0x06;
	public static inline var EXPRESSION:Int = 0x0B;
	public static inline var PHASER:Int = 0x5f;
	public static inline var REVERB:Int = 0x5b;
	public static inline var RPN_LSB:Int = 0x64;
	public static inline var RPN_MBS:Int = 0x65;
	public static inline var TREMOLO:Int = 0x5c;
	public static inline var VOLUME:Int = 0x07;
}