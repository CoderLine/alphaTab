using System.Runtime.CompilerServices;
using AlphaTab.IO;

namespace AlphaTab.Audio.Model
{
    /// <summary>
    /// Represents a single midi track. A midi track contains
    /// a linked list of midi es and supports sorted inserting of 
    /// midi es into this track.
    /// </summary>
    public class MidiTrack
    {
        [IntrinsicProperty]
        public int Index { get; set; }
        [IntrinsicProperty]
        public MidiFile File { get; set; }

        [IntrinsicProperty]
        public MidiEvent FirstEvent { get; set; }
        [IntrinsicProperty]
        public MidiEvent LastEvent { get; set; }

        public void AddEvent(MidiEvent e)
        {
            e.Track = this;
            // first entry 
            if (FirstEvent == null) 
            {
                // first and last e
                FirstEvent = e;
                LastEvent = e;
            }
            else
            {
                // is the e after the last one?
                if (LastEvent.Tick <= e.Tick)
                {
                    // make the new e the last one
                    LastEvent.NextEvent = e;
                    e.PreviousEvent = LastEvent;
                    LastEvent = e;
                }
                // insert at the beginning?
                else if (FirstEvent.Tick > e.Tick)
                {
                    // make the new e the new head
                    e.NextEvent = FirstEvent;
                    FirstEvent.PreviousEvent = e;
                    FirstEvent = e;
                }
                else // insert inbetween
                {
                    // we assume equal tick distribution and search for
                    // the lesser distance,
                
                    // start inserting on first e or last e?
                    // use smaller delta 
                    var firstDelta = e.Tick - FirstEvent.Tick;
                    var lastDelta = LastEvent.Tick - e.Tick;
                
                    if (firstDelta < lastDelta)
                    {
                        // search position from start to end
                        var previous = FirstEvent;
                    
                        // as long the upcoming e is still before 
                        // the new one
                        while (previous != null &&
                               previous.NextEvent != null &&
                               previous.NextEvent.Tick < e.Tick)
                        {
                           // we're moving to the next e 
                           previous = previous.NextEvent;
                        }
                   
                       if (previous == null) return;
                   
                       // insert after the found element
                       var next = previous.NextEvent;
                   
                       // update previous
                       previous.NextEvent = e;
                   
                       // update new
                       e.PreviousEvent = previous;
                       e.NextEvent = next;       
                   
                       // update next
                       if (next != null)
                       {
                           next.PreviousEvent = e;
                       }
                    }
                    else
                    {
                        // search position from end to start
                        var next = LastEvent;
                    
                        // as long the previous e is after the new one
                        while (next != null &&
                               next.PreviousEvent != null &&
                               next.PreviousEvent.Tick > e.Tick)
                        {
                            // we're moving to previous e
                           next = next.PreviousEvent;
                        }
                   
                       if (next == null) return;
                   
                       var previous = next.PreviousEvent;
                   
                       // update next
                       next.PreviousEvent = e;
                   
                       // update new
                       e.NextEvent = next;
                       e.PreviousEvent = previous;
                   
                       // update previous
                       if (previous != null)
                       {
                           previous.NextEvent = e;
                       }
                       else
                       {
                           FirstEvent = e;
                       }
                    }
                }
            }
        }

        public void WriteTo(Stream s)
        {
            // build track data first
            var trackData = new MemoryStream();
            var current = FirstEvent;
            int count = 0;
            while (current != null)
            {
                current.WriteTo(trackData);
                current = current.NextEvent;
                count ++;
            }
        
            // magic number "MTrk" (0x4D54726B)
            var b = new ByteArray(0x4D, 0x54, 0x72, 0x6B);
            s.Write(b, 0, b.Length);

            // size as integer
            var data = trackData.ToArray();
            var l = data.Length;
            b = new ByteArray
            (
              (byte)((l >> 24) & 0xFF), (byte)((l >> 16) & 0xFF),
              (byte)((l >> 8) & 0xFF), (byte)((l >> 0) & 0xFF)
            );
            s.Write(b, 0, b.Length);
            s.Write(data, 0, data.Length);
        }
    }
}
