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
package alphatab.file.ptb;

import alphatab.file.SongReader;
import alphatab.model.Song;
import alphatab.model.Track;

/**
 *  A reader for PowerTab files. Based on the source code of TuxGuitar
 */
class PtReader extends SongReader
{
    private static inline var VERSION = "ptab-4";
    public function new() 
    {
        super();
    }
    
    /**
     * Reads the song
     * @return The song readen from the given stream using the specified factory
     */
    public override function readSong() : Song
    {
        if (!readVersion())
        {
            throw new FileFormatException("Unsupported Version");
        }
        
        var song:Song = factory.newSong();
        
         PowerTab have 2 tracks
        song.addTrack(factory.newTrack());
        song.addTrack(factory.newTrack());
        
        readSongInfo(song);
        readDataInstruments(song.tracks[0]);
        readDataInstruments(song.tracks[1]);
        
        return song;
    }
    
    /**
     * Reads the version string from the data source. 
     * @return true if the read version is supported otherwise false
     */
    private function readVersion() : Bool
    {
        var version = (readString(4) + "-" + Std.string(readShort()));
        return version == VERSION;
    }

    /**
     * Reads the song information from the data source into the specified
     * song instance.
     * @param    song the song to full the data into. 
     */
    private function readSongInfo(song:Song) : Void
    {
        var classification = readByte();
        
        if (classification == 0) 
        {
            skip(1);
            song.title = readString();
            song.artist = readString();
            var releaseType = readByte();
            
            song.notice = "";
            if (releaseType == 0) 
            {
                var albumType = readByte(); // unneeded
                song.album = readString();
                song.notice += "Year: " + Std.string(readShort());
                song.notice += "\nLive: " + Std.string(readBoolean());
            }
            else if (releaseType == 1) 
            {
                song.album = readString();
                song.notice = "\nLive: " + Std.string(readBoolean());
            }
            else if (releaseType == 2) 
            {
                song.album = readString();
                var day = readShort();
                var month = readShort();
                var year = readShort();
                song.notice = "\nDate: " + Std.string(day) + "." + Std.string(month) + "." + Std.string(year);
            }
            
            if (readByte() == 0) 
            {
                song.tab = readString();
                song.words = readString();
            }
            
            song.music = readString(); 
            song.notice += "\nGuitar Transcriber: " + readString();
            song.notice += "\nBass Transcriber: " + readString();
            song.copyright = readString();
            
            song.lyrics = factory.newLyrics();
            var lyrics = factory.newLyricLine();
            lyrics.lyrics = readString();
            song.lyrics.lines.push(lyrics);
            
            song.instructions += "Guitar Instructions: " + readString();
            song.instructions += "\nBass Instructions: " + readString();
        }
        else if (classification == 1)
        {
            song.title = readString();
            song.album = readString();
            var style = readShort(); // TODO: what style?
            var level = readByte(); // TODO: what level?
            song.tab = readString();
            song.instructions = readString();
            song.copyright = readString();
        }
    }
    
    /**
     * Reads the track data from the input stream into the 
     * specified track.
     * @param    track the track to fill the data into
     */
    private function readDataInstruments(track:Track) : Void
    {
         Guitar section
        var itemCount = readHeaderItems();
        for (i in 0 ... itemCount) 
        {
            readTrackInfo(track);
            if (i < itemCount - 1)
            {
                readShort();
            }
        }
         ChordDiagram section
        itemCount = readHeaderItems();
        for (i in 0 ... itemCount) 
        {
            readChord();
            if (i < itemCount - 1)
            {
                readShort();
            }
        }
         FloatingText section
        itemCount = readHeaderItems();
        for (i in 0 ... itemCount) 
        {
            readFloattingText();
            if (i < itemCount - 1)
            {
                readShort();
            }
        }
         GuitarIn section
        itemCount = readHeaderItems();
        for (i in 0 ... itemCount) 
        {
            readGuitarIn(track);
            if (i < itemCount - 1)
            {
                readShort();
            }
        }
         TempoMarker
        itemCount = readHeaderItems();
        for (i in 0 ... itemCount) 
        {
            readTempoMarker(track);
            if (i < itemCount - 1)
            {
                readShort();
            }
        }
         Dynamic section
        itemCount = readHeaderItems();
        for (i in 0 ... itemCount) 
        {
            readDynamic();            
            if (i < itemCount - 1)
            {
                readShort();
            }
        }
         SectionSymbol section
        itemCount = readHeaderItems();
        for (i in 0 ... itemCount) 
        {
            readSectionSymbol(track);
            if (i < itemCount - 1)
            {
                readShort();
            }
        }
         Section section
        for (i in 0 ... itemCount) 
        {
            readSection(track.getSection(j));
            if (i < itemCount - 1)
            {
                readShort();
            }
        }
    }
    
    /**
     * Reads the general track information from the data source 
     * into the specified track
     * @param    track the track which should get filled with data
     */
    private function readTrackInfo(track:Track) : Void {
        
        track.number = readByte();
        track.name = readString();
        track.channel.instrument(readByte());
        
        var offset = 2 * track.number;
        track.channel.channel = TRACK_CHANNELS[offset + 0];
        track.channel.effectChannel = TRACK_CHANNELS[offset + 1];
        
        track.channel.volume = readByte();
        track.channel.balance = readByte();
        track.channel.reverb = readByte();
        track.channel.chorus = readByte();
        track.channel.tremolo = readByte();
        track.channel.phaser = readByte();
        
        track.offset = readByte() 
                
         Tuning
        readString();//tunningName
        
        bit 7 = Music notation offset sign, bits 6 to 1 = Music notation offset value, bit 0 = display sharps or flats;
        readByte();  
        
        var stringCount = readByte() & 0xFF;
        for (i in 0 ... stringCount) 
        {
            var string = factory.newString();
            string.number = i + 1;
            string.value = readByte();
            track.strings.push(string);
        }
    }
    
    /**
     * Reads the chord diagram section.
     */
    private function readChord() : Void
    {
        readShort(); //chordKey
        readByte();
        readShort(); //chordModification
        readByte();
        readByte();
        var stringCount = readByte();
        for (i in 0 ... stringCount) 
        {
            readByte(); //fret
        }        
    }
    
    /**
     * Reads the floating text section.
     */
    private function readFloattingText() : Void
    {
         text
        readString();
         mfc rect
        readInt(); // left
        readInt(); // top
        readInt(); // right
        readInt(); // bottom
        
        readByte();
        readFontSetting();
    }
    
    /**
     * Reads a font setting structure.
     */
    private function readFontSetting() : Void
    {
        readString(); // Font name
        readInt(); // point size
        readInt(); // weight
        readBoolean(); // italic
        readBoolean(); // underline
        readBoolean(); // strikeout
        readInt(); // color        
    }
    
    /**
     * Reads a guitar in section and fills the data into the
     * specified section.
     * @param    track the track to fill the data into
     */
    private function readGuitarIn(track:Track) : Void
    {
        var section = readShort();
        var staff = readByte();
        var position = readByte();
        skip(1);
        var info = readByte() & 0xFF;
    }

    /**
     * Reads a tempo marker section and fills the data into the
     * specified section.
     */
    private function readTempoMarker(track:Track) : Void
    {
        var section = readShort();
        var position = readByte();
        var tempo = readShort();
        var data = readShort();
        readString();//description
        
        var tripletFeel = TripletFeel.None;
        if ((data & 0x01) != 0)
        {
            tripletFeel = TripletFeel.Eighth;
        }
        else if ((data & 0x02) != 0)
        {
            tripletFeel = TripletFeel.Sixteenth;
        }
        
        if (tempo > 0)
        {
             TODO: set tempo on correct measureheader
        }
    }

    /**
     * Reads a dynamic structure.
     */
    private function readDynamic() : Void
    {
        readShort();
        readByte();
        readByte();
        readShort();
    }

    /**
     * Reads a section symbol section and fills the data into the
     * specified section.
     * @param    track the track to fill the data into 
     */
    private function readSectionSymbol(track:Track) : Void
    {
        var section = readShort();
        var position = readByte();
        var data = readInt();
        
        var endNumber = data >> 16;
        
         TODO: process section symbol
    }

    /**
     * Reads a section section and fills the data into the
     * specified section.
     * @param    track the track to fill the data into 
     */
    private function readSection(track:Track) : Void
    {
        readInt();//left
        readInt();//top
        readInt();//right
        readInt();//bottom
        
        var lastBarData = readByte();
        
        readByte();
        readByte();
        readByte();
        readByte();
        
         BarLine
        readBarLine(track);
    }

    
    /**
     * Reads a section header and returns the amount of items in this section
     * @return the count of items within the section
     */
    private function readHeaderItems() : Int
    {
        var itemCount:Int = readShort();
        if (itemCount != 0){
            var header:Int = readShort();
            if (header == 0xffff) {
                if (readShort() != 1) {
                    return -1;
                }
                readString(readShort()); // section title
            }
        }
        return itemCount;
    }
    
    
    /**
     * Reads a string from the data source.
     * @param    length the amount of bytes to read for the string
     * @return the string read. 
     */
    private function readString(length:Int = -1) : String
    {
        if (length == -1) 
        {
            length = data.readByte() & 0xFF;
        }
        
        var text:String = "";
        for (i in 0 ... length)
        {
           TODO: Check for unicode support
            text += String.fromCharCode(readByte());
        }
        return text;
    }
    
    /**
     * Reads a 32 bit integer from the data source
     * @return an integer in the range of -2.147.483.648 bis 2.147.483.647
     */
    private function readInt() : Int
    {
        return data.readInt32();
    }
    
    /**
     * Reads a 16 bit signed integer from the data source
     * @return an integer in the range of -32.768 bis 32.767
     */
    private function readShort() : Int
    {
        return data.readInt16();
    }
    
    /**
     * Reads a boolean value from the data source
     * @return true if the read value was not 0, otherwise false
     */
    private function readBoolean() : Bool
    {
        return data.readBool();
    }
    
    /**
     * Reads a single byte from the data source
     * @return an integer in the range of 0-255 
     */
    private function readByte() : Int
    {
        return data.readByte();
    }
    
    /**
     * Skips the specified amount of bytes. 
     * @param    count the amount of bytes to skip
     */
    private function skip(count:Int) : Void 
    {
        for (i in 0 ... count) 
        {
            data.readByte();
        }
    }
}