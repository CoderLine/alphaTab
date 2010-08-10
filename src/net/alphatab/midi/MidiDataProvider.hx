package net.alphatab.midi;
import net.alphatab.model.Song;
import net.alphatab.model.SongFactory;

/**
 * This wrapper allows easy converting of a song into a midi message list used by the player.
 */
class MidiDataProvider 
{
	public static function getSongMidiData(song:Song, factory:SongFactory):String
	{
		var parser:MidiSequenceParser = new MidiSequenceParser(factory, song, MidiSequenceParserFlags.DEFAULT_PLAY_FLAGS,
											   100, 0);
		var sequence:MidiSequenceHandler = new MidiSequenceHandler(song.tracks.length + 2);
		parser.parse(sequence);
		return sequence.commands;
	}
}