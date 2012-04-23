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
 * The score is the root node of the complete 
 * model. It stores the basic information of 
 * a song and stores the sub components. 
 */
class Score 
{
    /**
     * The album of this song. 
     */
    public var album:String;
    /**
     * The artist who performs this song.
     */
    public var artist:String;
    /**
     * The owner of the copyright of this song. 
     */
    public var copyright:String;
    /**
     * Additional instructions 
     */
    public var instructions:String;
    /**
     * The author of the music. 
     */
    public var music:String;
    /**
     * Some additional notes about the song. 
     */
    public var notices:String;
    /**
     * The subtitle of the song. 
     */
    public var subTitle:String;
    /**
     * The title of the song. 
     */
    public var title:String;
    /**
     * The author of the song lyrics
     */
    public var words:String;    
    /**
     * The author of this tablature. 
     */
    public var tab:String;

    public var tempoLabel:String;
    
    public var masterBars:Array<MasterBar>;
    public var tracks:Array<Track>;
    
    public function new() 
    {
        masterBars = new Array<MasterBar>();
        tracks = new Array<Track>();
    }
    
    public function addMasterBar(bar:MasterBar)
    {
        bar.score = this;
        bar.index = masterBars.length;
        if (masterBars.length != 0)
        {
            bar.previousMasterBar = masterBars[masterBars.length - 1];
            bar.previousMasterBar.nextMasterBar = bar;
        }
        masterBars.push(bar);
    }
    
    public function addTrack(track:Track)
    {
        track.score = this;
        track.index = tracks.length;
        tracks.push(track);
    }
}