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
package alphatab.file;
//import alphatab.file.ptb.PtReader;
import alphatab.midi.MidiRepeatController;
import alphatab.model.Duration;
import alphatab.model.Measure;
import alphatab.model.MeasureHeader;
import alphatab.model.Note;
import alphatab.model.Track;
import alphatab.model.Voice;
import alphatab.io.DataInputStream;

import alphatab.file.gpx.GpxReader;
import alphatab.file.guitarpro.Gp3Reader;
import alphatab.file.guitarpro.Gp4Reader;
import alphatab.file.guitarpro.Gp5Reader;
import alphatab.model.Song;
import alphatab.model.SongFactory;

/**
 * The Base class for creating file readers. 
 */
class SongReader 
{
    /**
     * The data source for reading. 
     */
    public var data(default,default):DataInputStream;
    /**
     * The song factory for creating objects.
     */
    public var factory(default,default):SongFactory;

    /**
     * Gets a list of the available readers. 
     */
    public static function availableReaders() : Array<SongReader>
    {
        var d:Array<SongReader> = new Array<SongReader>();
        d.push(new GpxReader());
        d.push(new Gp5Reader());
        d.push(new Gp4Reader());
        d.push(new Gp3Reader());
        //d.push(new PtReader());
        return d;
    }

    /**
     * Initializes a new instance of this class.
     */
    public function new() 
    {
    }
    
    /**
     * Initializes the reader. 
     * @param data The data source for reading.
     * @param factory The song factory for creating objects.
     */
    public function init(data:DataInputStream, factory:SongFactory) : Void 
    {
        this.data = data;
        this.factory = factory;
    }
    
    /**
     * Starts the reading of songs.
     * @return The song which was read from the initialized data source.
     * @throws FileFormatException Thrown on an error during reading. 
     */
    public function readSong(): Song
    {
        return factory.newSong();
    }    
    
    /**
     * Returns the value for a tied note. 
     */
    public function getTiedNoteValue(stringIndex:Int, track:Track) : Int
    {
        var measureCount:Int = track.measureCount();
        if (measureCount > 0) {
            for (m2 in 0 ... measureCount)
            {
                var m:Int = measureCount - 1 - m2;
                var measure:Measure = track.measures[m];
                for (b2 in 0 ... measure.beatCount())
                {
                    var b:Int = measure.beatCount() - 1 - b2;
                    var beat = measure.beats[b];
                    
                    for (v in 0 ... beat.voices.length)
                    {
                        var voice:Voice = beat.voices[v];
                        if (!voice.isEmpty) {
                            for (n in 0 ... voice.notes.length) {
                                var note:Note = voice.notes[n];
                                if (note.string == stringIndex) {
                                    return note.value;
                                }
                            }
                        }
                    }
                }
            }
        }
        return -1;
    }
    
    /**
     * This method finalizes the song by postprocess the model:
     * - Calculate correct measure start ticks
     */
    public static function finalize(song:Song) : Void
    {
        var controller:MidiRepeatController = new MidiRepeatController(song);
        var start:Int = Duration.QUARTER_TIME;
        
        while (!controller.finished())
        {
            var header:MeasureHeader = song.measureHeaders[controller.index];
            controller.process();
            
            if (header.realStart < 0)
            {
                header.realStart = start;
            }
            
            if (controller.shouldPlay)
            {
                start += header.length();
            }
        }
    }
}