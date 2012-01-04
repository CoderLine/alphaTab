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
package alphatab.midi.model;
import alphatab.io.DataOutputStream;
import alphatab.io.OutputStream;

class MidiFile 
{
    public var tracks:Array<MidiTrack>;
    
    public var infoTrack:Int;
    public var metronomeTrack:Int;
    
    public function new(trackCount:Int) 
    {
        tracks = new Array<MidiTrack>();
        for (i in 0 ... trackCount)
        {
            tracks.push(new MidiTrack());
        }
    }
    
    public function writeTo(out:OutputStream)
    {
        //
        // write midi file properties
        //
        var d:DataOutputStream = null;
        
        if (Std.is(out, DataOutputStream))
        {
            d = cast out;
            if (!d.bigEndian)
            {
                d = new DataOutputStream(out, true);
            }
        }
        else
        {
            d = new DataOutputStream(out, true);
        }
        
        // magic number "MThd" (0x4D546864)
        d.writeBytes([0x4D, 0x54, 0x68, 0x64]);
        
        // 6 (0x00000006)
        d.writeBytes([0, 0, 0, 6]);
        
        // format 
        d.writeBytes([0, 1]);
        
        // number of tracks
        d.writeShort(tracks.length);
        
        d.writeShort(960);
        
        // tracks
        for (t in tracks)
        {
            t.writeTo(d);
        }
    }
    
        
    public static function writeVariableLengthValue(data:Array<Int>, value:Int)
    {
        var v = value;
        var array = [0, 0, 0, 0];
        var count = 0;
        
        array[0] = (v & 0x7F) & 0xFF;
        
        v = v >> 7;
        
        while (v > 0)
        {
            count++;
            array[count] = ((v & 0x7F) | 0x80) & 0xFF;
            v = v >> 7;
        }
        
        while (count >= 0)
        {
            data.push(array[count]);
            count--;
        }
    }
}