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
import alphatab.io.MemoryOutputStream;
import alphatab.io.OutputStream;
import haxe.FastList;

class MidiTrack 
{
    public var firstEvent:MidiEvent;
    public var lastEvent:MidiEvent;
    
    public function new() 
    {
        
    }
    
    public function addEvent(newEvent:MidiEvent)
    {
        // first entry 
        if (firstEvent == null) 
        {
            // first and last event
            firstEvent = newEvent;
            lastEvent = newEvent;
        }
        else
        {
            // is the event after the last one?
            if (lastEvent.tick <= newEvent.tick)
            {
                // make the new event the last one
                lastEvent.nextEvent = newEvent;
                newEvent.previousEvent = lastEvent;
                lastEvent = newEvent;
            }
            // insert at the beginning?
            else if (firstEvent.tick > newEvent.tick)
            {
                // make the new event the new head
                newEvent.nextEvent = firstEvent;
                firstEvent.previousEvent = newEvent;
                firstEvent = newEvent;
            }
            else // insert inbetween
            {
                // we assume equal tick distribution and search for
                // the lesser distance,
                
                // start inserting on first event or last event?
                // use smaller delta 
                var firstDelta = newEvent.tick - firstEvent.tick;
                var lastDelta = lastEvent.tick - newEvent.tick;
                
                if (firstDelta < lastDelta)
                {
                    // search position from start to end
                    var previous:MidiEvent = firstEvent;
                    
                    // as long the upcoming event is still before 
                    // the new one
                    while (previous != null &&
                           previous.nextEvent != null &&
                           previous.nextEvent.tick < newEvent.tick)
                    {
                       // we're moving to the next event 
                       previous = previous.nextEvent;
                    }
                   
                   if (previous == null) return;
                   
                   // insert after the found element
                   var next:MidiEvent = previous.nextEvent;
                   
                   // update previous
                   previous.nextEvent = newEvent;
                   
                   // update new
                   newEvent.previousEvent = previous;
                   newEvent.nextEvent = next;       
                   
                   // update next
                   if (next != null)
                   {
                       next.previousEvent = newEvent;
                   }
                }
                else
                {
                    // search position from end to start
                    var next:MidiEvent = lastEvent;
                    
                    // as long the previous event is after the new one
                    while (next != null &&
                           next.previousEvent != null &&
                           next.previousEvent.tick > newEvent.tick)
                    {
                        // we're moving to previous event
                       next = next.previousEvent;
                    }
                   
                   if (next == null) return;
                   
                   var previous:MidiEvent = next.previousEvent;
                   
                   // update next
                   next.previousEvent = newEvent;
                   
                   // update new
                   newEvent.nextEvent = next;
                   newEvent.previousEvent = previous;
                   
                   // update previous
                   if (previous != null)
                   {
                       previous.nextEvent = newEvent;
                   }
                   else
                   {
                       firstEvent = newEvent;
                   }
                }
            }
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
        
        var trackData = new MemoryOutputStream();
        var current = firstEvent;
        while (current != null)
        {
            current.writeTo(trackData);
            current = current.nextEvent;
        }
        
        // magic number "MTrk" (0x4D54726B)
        d.writeBytes([0x4D, 0x54, 0x72, 0x6B]); 
            
        // size as integer
        d.writeInt(trackData.getBuffer().length);
        d.writeBytes(trackData.getBuffer());
    }
}