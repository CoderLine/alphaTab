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
package alphatab.model;

/**
 * This is the toplevel node of the song model. 
 * It contains basic information about the stored song. 
 */
class Song
{
    /**
     * The title of the song. 
     */
    public var title(default,default):String;
    
    /**
     * The subtitle of the song. 
     */
    public var subtitle(default,default):String;
    
    /**
     * The artist who performs this song.
     */
    public var artist(default,default):String;
    
    /**
     * The album of this song. 
     */
    public var album(default,default):String;
    
    /**
     * The author of the song lyrics
     */
    public var words(default,default):String;
    
    /**
     * The author of the music. 
     */
    public var music(default,default):String;
    
    /**
     * The owner of the copyright of this song. 
     */
    public var copyright(default,default):String;
    
    /**
     * The author of this tablature. 
     */
    public var tab(default,default):String;
    
    /**
     * Additional instructions 
     */
    public var instructions(default,default):String;
    
    /**
     * Some additional notes about the song. 
     */
    public var notice(default,default):String;
    
    /**
     * The lyrics of this song
     */
    public var lyrics(default,default):Lyrics;
    
    /**
     * The page setup information like aspect ratio and page size. 
     */
    public var pageSetup(default,default):PageSetup;

    /**
     * The name of the tempo. 
     */
    public var tempoName(default,default):String;
    
    /**
     * The song tempo in bpm 
     */
    public var tempo(default,default):Int;
    
    /**
     * Whether to hide the tempo on the tablature.
     */
    public var hideTempo(default,default):Bool;
    
    /**
     * The key (signature) of the song. 
     */
    public var key(default,default):Int;
    
    /**
     * The octave offset of the song.  
     * default 0, becomes 8 if the song is played an octave higher (8va)
     */
    public var octave(default,default):Int;
    
    /**
     * The list of measure headers of the song. 
     */
    public var measureHeaders(default,default):Array<MeasureHeader>;
    
    /**
     * The tracks stored in this song. 
     */
    public var tracks(default,default):Array<Track>;
    
    /**    
     * Initializes a new instance of the Song class. 
     */
    public function new()
    {
        measureHeaders = new Array<MeasureHeader>();
        tracks = new Array<Track>();
        title = "";
        subtitle = "";
        artist = "";
        album = "";
        words = "";
        music = "";
        copyright = "";
        tab = "";
        instructions = "";
        notice = "";
    }
    
    /**
     * Adds a new measure header to the song. 
     * @param header the measure header to add. 
     */
    public function addMeasureHeader(header:MeasureHeader): Void
    {
        header.song = this;
        measureHeaders.push(header);
    }
    
    /**
     * Adds a new track to the song. 
     * @param track the track to add. 
     */
    public function addTrack(track:Track) : Void 
    {
        track.song = this;
        tracks.push(track);
    }
}