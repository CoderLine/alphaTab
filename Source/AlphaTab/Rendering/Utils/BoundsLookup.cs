/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    public class Bounds
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float W { get; set; }
        public float H { get; set; }
    }

    public class StaveGroupBounds
    {
        public int Index { get; set; }
        public Bounds VisualBounds { get; set; }
        public Bounds RealBounds { get; set; }
        public FastList<MasterBarBounds> Bars { get; set; }
        public BoundsLookup BoundsLookup { get; set; }

        public StaveGroupBounds()
        {
            Bars = new FastList<MasterBarBounds>();
            Index = 0;
        }

        public void Finish()
        {
            for (int i = 0; i < Bars.Count; i++)
            {
                Bars[i].Finish();
            }
        }

        public void AddBar(MasterBarBounds bounds)
        {
            BoundsLookup.AddMasterBar(bounds);
            bounds.StaveGroupBounds = this;
            Bars.Add(bounds);
        }

        public MasterBarBounds FindBarAtPos(float x)
        {
            MasterBarBounds b = null;
            // move from left to right as long we find bars that start before the clicked position
            for (int i = 0; i < Bars.Count; i++)
            {
                if (b == null || Bars[i].RealBounds.X < x)
                {
                    b = Bars[i];
                }
                else if (x > Bars[i].RealBounds.X + Bars[i].RealBounds.W)
                {
                    break;
                }
            }
            return b;
        }

    }

    public class MasterBarBounds
    {
        public int Index { get; set; }
        public bool IsFirstOfLine { get; set; }
        public Bounds VisualBounds { get; set; }
        public Bounds RealBounds { get; set; }
        public Bounds LineAlignedBounds { get; set; }
        public FastList<BarBounds> Bars { get; set; }
        public StaveGroupBounds StaveGroupBounds { get; set; }

        public MasterBarBounds()
        {
            Bars = new FastList<BarBounds>();
        }

        public void AddBar(BarBounds bounds)
        {
            bounds.MasterBarBounds = this;
            Bars.Add(bounds);
        }

        public Beat FindBeatAtPos(float x, float y)
        {
            BeatBounds beat = null;
            for (int i = 0; i < Bars.Count; i++)
            {
                var b = Bars[i].FindBeatAtPos(x);
                if (b != null && (beat == null || beat.RealBounds.X < b.RealBounds.X))
                {
                    beat = b;
                }
            }
            return beat == null ? null : beat.Beat;
        }

        public void Finish()
        {
            Bars.Sort((a,b)=>
            {
                if (a.RealBounds.Y < b.RealBounds.Y)
                {
                    return -1;
                }
                if (a.RealBounds.Y > b.RealBounds.Y)
                {
                    return 1;
                }
                if (a.RealBounds.X < b.RealBounds.X)
                {
                    return -1;
                }
                if (a.RealBounds.X > b.RealBounds.X)
                {
                    return 1;
                }
                return 0;
            });
        }

        public void AddBeat(BeatBounds bounds)
        {
            StaveGroupBounds.BoundsLookup.AddBeat(bounds);
        }
    }

    public class BarBounds
    {
        public MasterBarBounds MasterBarBounds { get; set; }

        public Bounds VisualBounds { get; set; }
        public Bounds RealBounds { get; set; }
        public Bar Bar { get; set; }

        public FastList<BeatBounds> Beats { get; set; }

        public BarBounds()
        {
            Beats = new FastList<BeatBounds>();
        }

        public void AddBeat(BeatBounds bounds)
        {
            bounds.BarBounds = this;
            Beats.Add(bounds);
            MasterBarBounds.AddBeat(bounds);
        }

        public BeatBounds FindBeatAtPos(float x)
        {
            BeatBounds beat = null;
            for (int i = 0; i < Beats.Count; i++)
            {
                if (beat == null || Beats[i].RealBounds.X < x)
                {
                    beat = Beats[i];
                }
                else if (Beats[i].RealBounds.X > x)
                {
                    break;
                }
            }
            return beat;
        }
    }

    public class BeatBounds
    {
        public BarBounds BarBounds { get; set; }

        public Bounds VisualBounds { get; set; }
        public Bounds RealBounds { get; set; }

        public Beat Beat { get; set; }

        public FastList<NoteBounds> Notes { get; set; }

        public void AddNote(NoteBounds bounds)
        {
            if(Notes == null) Notes = new FastList<NoteBounds>();
            Notes.Add(bounds);
        }

        public Note FindNoteAtPos(float x, float y)
        {
            if (Notes == null) return null;
            // TODO: can be likely optimized 
            // a beat is mostly vertically aligned, we could sort the note bounds by Y 
            // and then do a binary search on the Y-axis. 
            foreach (var note in Notes)
            {
                var bottom = note.NoteHeadBounds.Y + note.NoteHeadBounds.H;
                var right = note.NoteHeadBounds.X + note.NoteHeadBounds.W;
                if (note.NoteHeadBounds.X >= x && note.NoteHeadBounds.Y >= y && x <= right && y <= bottom)
                {
                    return note.Note;
                }
            }
            return null;
        }
    }

    public class NoteBounds
    {
        public Bounds NoteHeadBounds { get; set; }

        public Note Note { get; set; }
    }

    public partial class BoundsLookup
    {
        private FastDictionary<int, BeatBounds> _beatLookup;
        private FastDictionary<int, MasterBarBounds> _masterBarLookup;
        private StaveGroupBounds _currentStaveGroup;
        public FastList<StaveGroupBounds> StaveGroups { get; set; }
        public bool IsFinished { get; private set; }

        public BoundsLookup()
        {
            StaveGroups = new FastList<StaveGroupBounds>();
            _beatLookup = new FastDictionary<int, BeatBounds>();
            _masterBarLookup = new FastDictionary<int, MasterBarBounds>();
        }

        public void Finish()
        {
            for (int i = 0; i < StaveGroups.Count; i++)
            {
                StaveGroups[i].Finish();
            }
            IsFinished = true;
        }

        public void AddNote(NoteBounds bounds)
        {
            var beat = FindBeat(bounds.Note.Beat);
            beat.AddNote(bounds);
        }

        public void AddStaveGroup(StaveGroupBounds bounds)
        {
            bounds.Index = StaveGroups.Count;
            bounds.BoundsLookup = this;
            StaveGroups.Add(bounds);
            _currentStaveGroup = bounds;
        }

        public void AddMasterBar(MasterBarBounds bounds)
        {
            if (bounds.StaveGroupBounds == null)
            {
                bounds.StaveGroupBounds = _currentStaveGroup;
                _masterBarLookup[bounds.Index] = bounds;
                _currentStaveGroup.AddBar(bounds);
            }
            else
            {
                _masterBarLookup[bounds.Index] = bounds;
            }
        }

        public void AddBeat(BeatBounds bounds)
        {
            _beatLookup[bounds.Beat.Id] = bounds;
        }

        public MasterBarBounds FindMasterBarByIndex(int index)
        {
            if (_masterBarLookup.ContainsKey(index))
            {
                return _masterBarLookup[index];
            }
            return null;
        }

        public MasterBarBounds FindMasterBar(MasterBar bar)
        {
            var id = bar.Index;
            if (_masterBarLookup.ContainsKey(id))
            {
                return _masterBarLookup[id];
            }
            return null;
        }

        public BeatBounds FindBeat(Beat beat)
        {
            var id = beat.Id;
            if (_beatLookup.ContainsKey(id))
            {
                return _beatLookup[id];
            }
            return null;
        }

        public Beat GetBeatAtPos(float x, float y)
        {
            //
            // find a bar which matches in y-axis
            var bottom = 0;
            var top = StaveGroups.Count - 1;

            var staveGroupIndex = -1;
            while (bottom <= top)
            {
                var middle = (top + bottom) / 2;
                var group = StaveGroups[middle];

                // found?
                if (y >= group.RealBounds.Y && y <= (group.RealBounds.Y + group.RealBounds.H))
                {
                    staveGroupIndex = middle;
                    break;
                }
                // search in lower half 
                if (y < group.RealBounds.Y)
                {
                    top = middle - 1;
                }
                // search in upper half
                else
                {
                    bottom = middle + 1;
                }
            }

            // no bar found
            if (staveGroupIndex == -1) return null;

            // 
            // Find the matching bar in the row
            var staveGroup = StaveGroups[staveGroupIndex];

            var bar = staveGroup.FindBarAtPos(x);

            if (bar != null)
            {
                return bar.FindBeatAtPos(x, y);
            }

            return null;
        }

        public Note GetNoteAtPos(Beat beat, float x, float y)
        {
            var beatBounds = FindBeat(beat);
            if (beatBounds == null) return null;

            x -= beatBounds.BarBounds.MasterBarBounds.StaveGroupBounds.RealBounds.X;
            y -= beatBounds.BarBounds.MasterBarBounds.StaveGroupBounds.RealBounds.Y;

            return beatBounds.FindNoteAtPos(x, y);
        }

    }
}