/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.midi;
import net.alphatab.model.GsSong;
import net.alphatab.model.GsSongFactory;

class MidiDataProvider 
{
	public static function GetSongMidiData(song:GsSong, factory:GsSongFactory):String
	{
		var parser:MidiSequenceParser = new MidiSequenceParser(factory, song, MidiSequenceParserFlags.DefaultPlayFlags,
											   100, 0);
		var sequence:MidiSequenceHandler = new MidiSequenceHandler(song.Tracks.length + 2);
		parser.Parse(sequence);
		return sequence.Commands;
	}
}