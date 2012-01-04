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
import alphatab.midi.model.MidiFile;
import alphatab.model.Song;
import alphatab.model.SongFactory;

/**
 * This wrapper allows easy converting of a song into a midi message list used by the player.
 */
class MidiDataProvider 
{
    public static function getSongMidiData(song:Song, factory:SongFactory):String
    {
        var parser:MidiSequenceParser = new MidiSequenceParser(factory, song, MidiSequenceParserFlags.DEFAULT_PLAY_FLAGS,
                                               100, 0);
        var sequence:MidiSequenceDataHandler = new MidiSequenceDataHandler(song.tracks.length + 2);
        parser.parse(sequence);
        return sequence.commands;
    }    
    
    public static function getSongMidiFile(song:Song, factory:SongFactory):MidiFile
    {
        var parser:MidiSequenceParser = new MidiSequenceParser(factory, song, MidiSequenceParserFlags.DEFAULT_PLAY_FLAGS,
                                               100, 0);
        var sequence:MidiSequenceFileHandler = new MidiSequenceFileHandler(song.tracks.length + 2);
        parser.parse(sequence);
        return sequence.midiFile;
    }
}