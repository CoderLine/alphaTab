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
 * Represents a collection of lyrics lines for a track. 
 */
class Lyrics
{
    public static inline var MAX_LINE_COUNT:Int = 5;
    
    public var trackChoice:Int;
    public var lines:Array<LyricLine>;
    
    public function lyricsBeats() : Array<String>
    {
        var full:String = "";
        for (line in lines)
        {
            if(line != null)
                full += line.lyrics + "\n";
        }

        var ret = StringTools.trim(full);
        ret = StringTools.replace(ret, "\n", " ");
        ret = StringTools.replace(ret, "\r", " ");
        return ret.split(" ");
    }
    
    public function new(trackChoice:Int)
    {
        this.trackChoice = trackChoice;
        lines = new Array<LyricLine>();
    }

}