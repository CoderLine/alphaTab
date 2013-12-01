/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
package alphatab.audio.model;

/**
 * Represents a single midi track. A midi track contains
 * a linked list of midi events and supports sorted inserting of 
 * midi events into this track.
 */
class MidiTrack
{
    public var index:Int;
    public var file:MidiFile;
    
    public var firstEvent:MidiEvent;
    public var lastEvent:MidiEvent;
    
    public function new() 
    {
    }
    
    public function addEvent(event:MidiEvent)
    {
        event.track = this;
        // first entry 
        if (firstEvent == null) 
        {
            // first and last event
            firstEvent = event;
            lastEvent = event;
        }
        else
        {
            // is the event after the last one?
            if (lastEvent.tick <= event.tick)
            {
                // make the new event the last one
                lastEvent.nextEvent = event;
                event.previousEvent = lastEvent;
                lastEvent = event;
            }
            // insert at the beginning?
            else if (firstEvent.tick > event.tick)
            {
                // make the new event the new head
                event.nextEvent = firstEvent;
                firstEvent.previousEvent = event;
                firstEvent = event;
            }
            else // insert inbetween
            {
                // we assume equal tick distribution and search for
                // the lesser distance,
                
                // start inserting on first event or last event?
                // use smaller delta 
                var firstDelta = event.tick - firstEvent.tick;
                var lastDelta = lastEvent.tick - event.tick;
                
                if (firstDelta < lastDelta)
                {
                    // search position from start to end
                    var previous:MidiEvent = firstEvent;
                    
                    // as long the upcoming event is still before 
                    // the new one
                    while (previous != null &&
                           previous.nextEvent != null &&
                           previous.nextEvent.tick < event.tick)
                    {
                       // we're moving to the next event 
                       previous = previous.nextEvent;
                    }
                   
                   if (previous == null) return;
                   
                   // insert after the found element
                   var next:MidiEvent = previous.nextEvent;
                   
                   // update previous
                   previous.nextEvent = event;
                   
                   // update new
                   event.previousEvent = previous;
                   event.nextEvent = next;       
                   
                   // update next
                   if (next != null)
                   {
                       next.previousEvent = event;
                   }
                }
                else
                {
                    // search position from end to start
                    var next:MidiEvent = lastEvent;
                    
                    // as long the previous event is after the new one
                    while (next != null &&
                           next.previousEvent != null &&
                           next.previousEvent.tick > event.tick)
                    {
                        // we're moving to previous event
                       next = next.previousEvent;
                    }
                   
                   if (next == null) return;
                   
                   var previous:MidiEvent = next.previousEvent;
                   
                   // update next
                   next.previousEvent = event;
                   
                   // update new
                   event.nextEvent = next;
                   event.previousEvent = previous;
                   
                   // update previous
                   if (previous != null)
                   {
                       previous.nextEvent = event;
                   }
                   else
                   {
                       firstEvent = event;
                   }
                }
            }
        }
    }
}