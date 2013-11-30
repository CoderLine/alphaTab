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
package alphatab.audio.model;

/**
 * A midi file consists of multiple tracks including a
 * info track for multi-track messages and a track for metronome ticks. 
 */
class MidiFile
{
    public var tracks:Array<MidiTrack>;
    
    /**
     * Gets or sets the index of the track used for midi events
     * affecting all tracks. (like the tempo)
     */
    public var infoTrack:Int;
    
    /**
     * Gets or sets the index of the track used as metronome.
     */
    public var metronomeTrack:Int;
    
    public function new() 
    {
    }
    
    public function createTrack() : MidiTrack
    {
        var track = new MidiTrack();
        track.index = tracks.length;
        track.file = this;
        tracks.push(track);
        return track;
    }
}