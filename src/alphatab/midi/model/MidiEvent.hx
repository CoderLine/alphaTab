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
import alphatab.io.Byte;
import alphatab.io.DataOutputStream;
import alphatab.io.OutputStream;

class MidiEvent 
{
    public var track:MidiTrack;
    public var tick:Int;
    public var nextEvent:MidiEvent;
    public var previousEvent:MidiEvent;
    
    public var message:MidiMessage;
    
    public function new(tick:Int, message:MidiMessage) 
    {   
        this.tick = tick;
        this.message = message;
        this.message.event = this;
    }
    
    public function getDeltaTicks()
    {
        if (previousEvent == null)
        {
            return 0;
        }
        return tick - previousEvent.tick;
    }
    
    public function writeTo(out:OutputStream)
    {
        // deltatime
        var delta = getDeltaTicks();
        var data = new Array<Byte>();
        MidiFile.writeVariableLengthValue(data, delta);
        out.writeBytes(data);
        
        message.writeTo(out);
    }
}