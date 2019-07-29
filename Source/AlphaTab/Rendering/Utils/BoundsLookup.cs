using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    /// <summary>
    /// Represents a rectangular area within the renderer music notation.
    /// </summary>
    public class Bounds
    {
        /// <summary>
        /// Gets or sets the X-position of the rectangle within the music notation.
        /// </summary>
        public float X { get; set; }

        /// <summary>
        /// Gets or sets the Y-position of the rectangle within the music notation.
        /// </summary>
        public float Y { get; set; }

        /// <summary>
        /// Gets or sets the width of the rectangle.
        /// </summary>
        public float W { get; set; }

        /// <summary>
        /// Gets or sets the height of the rectangle.
        /// </summary>
        public float H { get; set; }
    }

    /// <summary>
    /// Represents the bounds of a stave group.
    /// </summary>
    public class StaveGroupBounds
    {
        /// <summary>
        /// Gets or sets the index of the bounds within the parent lookup.
        /// This allows fast access of the next/previous groups.
        /// </summary>
        public int Index { get; set; }

        /// <summary>
        /// Gets or sets the bounds covering all visually visible elements of this stave group.
        /// </summary>
        public Bounds VisualBounds { get; set; }

        /// <summary>
        /// Gets or sets the actual bounds of the elements in this stave group including whitespace areas.
        /// </summary>
        public Bounds RealBounds { get; set; }

        /// <summary>
        /// Gets or sets the list of master bar bounds related to this stave group.
        /// </summary>
        public FastList<MasterBarBounds> Bars { get; set; }

        /// <summary>
        /// Gets or sets a reference to the parent bounds lookup.
        /// </summary>
        public BoundsLookup BoundsLookup { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="StaveGroupBounds"/> class.
        /// </summary>
        public StaveGroupBounds()
        {
            Bars = new FastList<MasterBarBounds>();
            Index = 0;
        }

        /// <summary>
        /// Finished the lookup for optimized access.
        /// </summary>
        internal void Finish()
        {
            foreach (var t in Bars)
            {
                t.Finish();
            }
        }

        /// <summary>
        /// Adds a new master bar to this lookup.
        /// </summary>
        /// <param name="bounds">The master bar bounds to add.</param>
        internal void AddBar(MasterBarBounds bounds)
        {
            BoundsLookup.AddMasterBar(bounds);
            bounds.StaveGroupBounds = this;
            Bars.Add(bounds);
        }

        /// <summary>
        /// Tries to find the master bar bounds that are located at the given X-position.
        /// </summary>
        /// <param name="x">The X-position to find a master bar.</param>
        /// <returns>The master bounds at the given X-position.</returns>
        public MasterBarBounds FindBarAtPos(float x)
        {
            MasterBarBounds b = null;
            // move from left to right as long we find bars that start before the clicked position
            foreach (var bar in Bars)
            {
                if (b == null || bar.RealBounds.X < x)
                {
                    b = bar;
                }
                else if (x > bar.RealBounds.X + bar.RealBounds.W)
                {
                    break;
                }
            }

            return b;
        }
    }

    /// <summary>
    /// Represents the boundaries of a list of bars related to a single master bar.
    /// </summary>
    public class MasterBarBounds
    {
        /// <summary>
        /// Gets or sets the index of this bounds relative within the parent lookup.
        /// </summary>
        public int Index { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether this bounds are the first of the line.
        /// </summary>
        public bool IsFirstOfLine { get; set; }

        /// <summary>
        /// Gets or sets the bounds covering all visually visible elements spanning all bars of this master bar.
        /// </summary>
        public Bounds VisualBounds { get; set; }

        /// <summary>
        /// Gets or sets the actual bounds of the elements in this master bar including whitespace areas.
        /// </summary>
        public Bounds RealBounds { get; set; }

        /// <summary>
        /// Gets or sets the actual bounds which are exactly aligned with the lines of the staffs.
        /// </summary>
        public Bounds LineAlignedBounds { get; set; }

        /// <summary>
        /// Gets or sets the list of individual bars within this lookup.
        /// </summary>
        public FastList<BarBounds> Bars { get; set; }

        /// <summary>
        /// Gets or sets a reference to the parent <see cref="StaveGroupBounds"/>.
        /// </summary>
        public StaveGroupBounds StaveGroupBounds { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="MasterBarBounds"/> class.
        /// </summary>
        public MasterBarBounds()
        {
            Bars = new FastList<BarBounds>();
        }

        /// <summary>
        /// Adds a new bar to this lookup.
        /// </summary>
        /// <param name="bounds">The bar bounds to add to this lookup.</param>
        internal void AddBar(BarBounds bounds)
        {
            bounds.MasterBarBounds = this;
            Bars.Add(bounds);
        }

        /// <summary>
        /// Tries to find a beat at the given location.
        /// </summary>
        /// <param name="x">The absolute X position where the beat spans across.</param>
        /// <param name="y">The absolute Y position where the beat spans across.</param>
        /// <returns>The beat that spans across the given point, or null if none of the contained bars had a beat at this position.</returns>
        public Beat FindBeatAtPos(float x, float y)
        {
            BeatBounds beat = null;
            foreach (var bar in Bars)
            {
                var b = bar.FindBeatAtPos(x);
                if (b != null && (beat == null || beat.RealBounds.X < b.RealBounds.X))
                {
                    beat = b;
                }
            }

            return beat == null ? null : beat.Beat;
        }

        /// <summary>
        /// Finishes the lookup object and optimizes itself for fast access.
        /// </summary>
        internal void Finish()
        {
            Bars.Sort((a, b) =>
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

        /// <summary>
        /// Adds a new beat to the lookup.
        /// </summary>
        /// <param name="bounds">The beat bounds to add.</param>
        internal void AddBeat(BeatBounds bounds)
        {
            StaveGroupBounds.BoundsLookup.AddBeat(bounds);
        }
    }

    /// <summary>
    /// Represents the boundaries of a single bar.
    /// </summary>
    public class BarBounds
    {
        /// <summary>
        /// Gets or sets the reference to the related <see cref="MasterBarBounds"/>
        /// </summary>
        public MasterBarBounds MasterBarBounds { get; set; }

        /// <summary>
        /// Gets or sets the bounds covering all visually visible elements spanning this bar.
        /// </summary>
        public Bounds VisualBounds { get; set; }

        /// <summary>
        /// Gets or sets the actual bounds of the elements in this bar including whitespace areas.
        /// </summary>
        public Bounds RealBounds { get; set; }

        /// <summary>
        /// Gets or sets the bar related to this boundaries.
        /// </summary>
        public Bar Bar { get; set; }

        /// <summary>
        /// Gets or sets a list of the beats contained in this lookup.
        /// </summary>
        public FastList<BeatBounds> Beats { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="BarBounds"/> class.
        /// </summary>
        public BarBounds()
        {
            Beats = new FastList<BeatBounds>();
        }

        /// <summary>
        /// Adds a new beat to this lookup.
        /// </summary>
        /// <param name="bounds">The beat bounds to add.</param>
        internal void AddBeat(BeatBounds bounds)
        {
            bounds.BarBounds = this;
            Beats.Add(bounds);
            MasterBarBounds.AddBeat(bounds);
        }

        /// <summary>
        /// Tries to find the beat at the given X-position.
        /// </summary>
        /// <param name="x">The X-position of the beat to find.</param>
        /// <returns>The beat at the given X-position or null if none was found.</returns>
        public BeatBounds FindBeatAtPos(float x)
        {
            BeatBounds beat = null;
            foreach (var t in Beats)
            {
                if (beat == null || t.RealBounds.X < x)
                {
                    beat = t;
                }
                else if (t.RealBounds.X > x)
                {
                    break;
                }
            }

            return beat;
        }
    }

    /// <summary>
    /// Represents the bounds of a single beat.
    /// </summary>
    public class BeatBounds
    {
        /// <summary>
        /// Gets or sets the reference to the parent <see cref="BarBounds"/>.
        /// </summary>
        public BarBounds BarBounds { get; set; }

        /// <summary>
        /// Gets or sets the bounds covering all visually visible elements spanning this beat.
        /// </summary>
        public Bounds VisualBounds { get; set; }

        /// <summary>
        /// Gets or sets the actual bounds of the elements in this beat including whitespace areas.
        /// </summary>
        public Bounds RealBounds { get; set; }

        /// <summary>
        /// Gets or sets the beat related to this bounds.
        /// </summary>
        public Beat Beat { get; set; }

        /// <summary>
        /// Gets or sets the individual note positions of this beat (if <see cref="Settings.IncludeNoteBounds"/> was set to true).
        /// </summary>
        public FastList<NoteBounds> Notes { get; set; }

        /// <summary>
        /// Adds a new note to this bounds.
        /// </summary>
        /// <param name="bounds">The note bounds to add.</param>
        internal void AddNote(NoteBounds bounds)
        {
            if (Notes == null)
            {
                Notes = new FastList<NoteBounds>();
            }

            Notes.Add(bounds);
        }

        /// <summary>
        /// Tries to find a note at the given position.
        /// </summary>
        /// <param name="x">The X-position of the note to find.</param>
        /// <param name="y">The Y-position of the note to find.</param>
        /// <returns>The note at the given position or null if no note was found, or the note lookup was not enabled before rendering.</returns>
        public Note FindNoteAtPos(float x, float y)
        {
            if (Notes == null)
            {
                return null;
            }

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

    /// <summary>
    /// Represents the bounds of a single note
    /// </summary>
    public class NoteBounds
    {
        /// <summary>
        /// Gets or sets the bounds of the individual note head.
        /// </summary>
        public Bounds NoteHeadBounds { get; set; }

        /// <summary>
        /// Gets or sets the note related to this instance.
        /// </summary>
        public Note Note { get; set; }
    }

    /// <summary>
    /// Represents a lookup cache for quickly finding bars, beats and notes at a given position.
    /// </summary>
    public partial class BoundsLookup
    {
        private readonly FastDictionary<int, BeatBounds> _beatLookup;
        private readonly FastDictionary<int, MasterBarBounds> _masterBarLookup;
        private StaveGroupBounds _currentStaveGroup;

        /// <summary>
        /// Gets a list of all individual stave groups contained in the rendered music notation.
        /// </summary>
        public FastList<StaveGroupBounds> StaveGroups { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether this lookup was finished already.
        /// </summary>
        internal bool IsFinished { get; private set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="BoundsLookup"/> class.
        /// </summary>
        public BoundsLookup()
        {
            StaveGroups = new FastList<StaveGroupBounds>();
            _beatLookup = new FastDictionary<int, BeatBounds>();
            _masterBarLookup = new FastDictionary<int, MasterBarBounds>();
        }

        /// <summary>
        /// Finishes the lookup for optimized access.
        /// </summary>
        internal void Finish()
        {
            foreach (var t in StaveGroups)
            {
                t.Finish();
            }

            IsFinished = true;
        }

        /// <summary>
        /// Adds a new note to the lookup.
        /// </summary>
        /// <param name="bounds">The note bounds to add.</param>
        internal void AddNote(NoteBounds bounds)
        {
            var beat = FindBeat(bounds.Note.Beat);
            beat.AddNote(bounds);
        }

        /// <summary>
        /// Adds a new stave group to the lookup.
        /// </summary>
        /// <param name="bounds">The stave group bounds to add.</param>
        internal void AddStaveGroup(StaveGroupBounds bounds)
        {
            bounds.Index = StaveGroups.Count;
            bounds.BoundsLookup = this;
            StaveGroups.Add(bounds);
            _currentStaveGroup = bounds;
        }

        /// <summary>
        /// Adds a new master bar to the lookup.
        /// </summary>
        /// <param name="bounds">The master bar bounds to add.</param>
        internal void AddMasterBar(MasterBarBounds bounds)
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

        /// <summary>
        /// Adds a new beat to the lookup.
        /// </summary>
        /// <param name="bounds">The beat bounds to add.</param>
        internal void AddBeat(BeatBounds bounds)
        {
            _beatLookup[bounds.Beat.Id] = bounds;
        }

        /// <summary>
        /// Tries to find the master bar bounds by a given index.
        /// </summary>
        /// <param name="index">The index of the master bar to find.</param>
        /// <returns>The master bar bounds if it was rendered, or null if no boundary information is available.</returns>
        public MasterBarBounds FindMasterBarByIndex(int index)
        {
            if (_masterBarLookup.ContainsKey(index))
            {
                return _masterBarLookup[index];
            }

            return null;
        }

        /// <summary>
        /// Tries to find the master bar bounds by a given master bar.
        /// </summary>
        /// <param name="bar">The master bar to find.</param>
        /// <returns>The master bar bounds if it was rendered, or null if no boundary information is available.</returns>
        public MasterBarBounds FindMasterBar(MasterBar bar)
        {
            var id = bar.Index;
            if (_masterBarLookup.ContainsKey(id))
            {
                return _masterBarLookup[id];
            }

            return null;
        }

        /// <summary>
        /// Tries to find the bounds of a given beat.
        /// </summary>
        /// <param name="beat">The beat to find.</param>
        /// <returns>The beat bounds if it was rendered, or null if no boundary information is available.</returns>
        public BeatBounds FindBeat(Beat beat)
        {
            var id = beat.Id;
            if (_beatLookup.ContainsKey(id))
            {
                return _beatLookup[id];
            }

            return null;
        }

        /// <summary>
        /// Tries to find a beat at the given absolute position.
        /// </summary>
        /// <param name="x">The absolute X-position of the beat to find.</param>
        /// <param name="y">The absolute Y-position of the beat to find.</param>
        /// <returns>The beat found at the given position or null if no beat could be found.</returns>
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
                if (y >= group.RealBounds.Y && y <= group.RealBounds.Y + group.RealBounds.H)
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
            if (staveGroupIndex == -1)
            {
                return null;
            }

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

        /// <summary>
        /// Tries to find the note at the given position using the given beat for fast access.
        /// Use <see cref="FindBeat"/> to find a beat for a given position first.
        /// </summary>
        /// <param name="beat">The beat containing the note.</param>
        /// <param name="x">The X-position of the note. </param>
        /// <param name="y">The Y-position of the note.</param>
        /// <returns>The note at the given position within the beat.</returns>
        public Note GetNoteAtPos(Beat beat, float x, float y)
        {
            var beatBounds = FindBeat(beat);
            if (beatBounds == null)
            {
                return null;
            }

            x -= beatBounds.BarBounds.MasterBarBounds.StaveGroupBounds.RealBounds.X;
            y -= beatBounds.BarBounds.MasterBarBounds.StaveGroupBounds.RealBounds.Y;

            return beatBounds.FindNoteAtPos(x, y);
        }
    }
}
