using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Audio
{
    /// <summary>
    /// Represents the time period, for which a <see cref="Beat"/> is played.
    /// </summary>
    public class BeatTickLookup
    {
        /// <summary>
        /// Gets or sets the start time in midi ticks at which the given beat is played. 
        /// </summary>
        public int Start { get; set; }

        /// <summary>
        /// Gets or sets the end time in midi ticks at which the given beat is played. 
        /// </summary>
        public int End { get; set; }

        /// <summary>
        /// Gets or sets the beat which is played.
        /// </summary>
        public Beat Beat { get; set; }

        /// <summary>
        /// Gets or sets whether the beat is the placeholder beat for an empty bar. 
        /// </summary>
        public bool IsEmptyBar { get; set; }
    }

    /// <summary>
    /// Represents the time period, for which all bars of a <see cref="MasterBar"/> are played.
    /// </summary>
    public class MasterBarTickLookup
    {
        /// <summary>
        /// Gets or sets the start time in midi ticks at which the MasterBar is played. 
        /// </summary>
        public int Start { get; set; }

        /// <summary>
        /// Gets or sets the end time in midi ticks at which the MasterBar is played. 
        /// </summary>
        public int End { get; set; }

        /// <summary>
        /// Gets or sets the current tempo when the MasterBar is played.
        /// </summary>
        public int Tempo { get; set; }

        /// <summary>
        /// Gets or sets the MasterBar which is played. 
        /// </summary>
        public MasterBar MasterBar { get; set; }

        /// <summary>
        /// Gets or sets the list of <see cref="BeatTickLookup"/> object which define the durations
        /// for all <see cref="Beats"/> played within the period of this MasterBar. 
        /// </summary>
        public FastList<BeatTickLookup> Beats { get; set; }

        /// <summary>
        /// Gets or sets the <see cref="MasterBarTickLookup"/> of the next masterbar in the <see cref="Score"/>
        /// </summary>
        public MasterBarTickLookup NextMasterBar { get; set; }


        /// <summary>
        /// Initializes a new instance of the <see cref="MasterBarTickLookup"/> class.
        /// </summary>
        public MasterBarTickLookup()
        {
            Beats = new FastList<BeatTickLookup>();
        }

        /// <summary>
        /// Performs the neccessary finalization steps after all information was written. 
        /// </summary>
        public void Finish()
        {
            Beats.Sort((a, b) => a.Start - b.Start);
        }

        /// <summary>
        /// Adds a new <see cref="BeatTickLookup"/> to the list of played beats during this MasterBar period. 
        /// </summary>
        /// <param name="beat"></param>
        public void AddBeat(BeatTickLookup beat)
        {
            Beats.Add(beat);
        }
    }

    /// <summary>
    /// Represents the results of searching the currently played beat. 
    /// </summary>
    /// <seealso cref="MidiTickLookup.FindBeat"/>
    public class MidiTickLookupFindBeatResult
    {
        /// <summary>
        /// Gets or sets the beat that is currently played. 
        /// </summary>
        public Beat CurrentBeat { get; set; }

        /// <summary>
        /// Gets or sets the beat that will be played next. 
        /// </summary>
        public Beat NextBeat { get; set; }

        /// <summary>
        /// Gets or sets the duration in milliseconds how long this beat is playing. 
        /// </summary>
        public int Duration { get; set; }
    }

    /// <summary>
    /// This class holds all information about when <see cref="MasterBar"/>s and <see cref="Beat"/>s are played. 
    /// </summary>
    public class MidiTickLookup
    {
        private MasterBarTickLookup _currentMasterBar;

        /// <summary>
        /// Gets a dictionary of all master bars played. The index is the index equals to <see cref="MasterBar.Index"/>.
        /// </summary>
        /// <remarks>
        /// This lookup only contains the first time a MasterBar is played. For a whole sequence of the song refer to <see cref="MasterBars"/>.
        /// </remarks>
        public FastDictionary<int, MasterBarTickLookup> MasterBarLookup { get; }

        /// <summary>
        /// Gets a list of all <see cref="MasterBarTickLookup"/> sorted by time. 
        /// </summary>
        public FastList<MasterBarTickLookup> MasterBars { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="MidiTickLookup"/> class.
        /// </summary>
        public MidiTickLookup()
        {
            MasterBars = new FastList<MasterBarTickLookup>();
            MasterBarLookup = new FastDictionary<int, MasterBarTickLookup>();
        }

        /// <summary>
        /// Performs the neccessary finalization steps after all information was written. 
        /// </summary>
        public void Finish()
        {
            MasterBarTickLookup previous = null;
            foreach (var bar in MasterBars)
            {
                bar.Finish();
                if (previous != null)
                {
                    previous.NextMasterBar = bar;
                }

                previous = bar;
            }
        }

        /// <summary>
        /// Finds the currently played beat given a list of tracks and the current time. 
        /// </summary>
        /// <param name="tracks">The tracks in which to search the played beat for.</param>
        /// <param name="tick">The current time in midi ticks.</param>
        /// <returns>The information about the current beat or null if no beat could be found.</returns>
        public MidiTickLookupFindBeatResult FindBeat(Track[] tracks, int tick)
        {
            // get all beats within the masterbar
            var masterBar = FindMasterBar(tick);
            if (masterBar == null)
            {
                return null;
            }

            var trackLookup = new FastDictionary<int, bool>();
            foreach (var track in tracks)
            {
                trackLookup[track.Index] = true;
            }

            BeatTickLookup beat = null;
            var index = 0;
            var beats = masterBar.Beats;
            for (var b = 0; b < beats.Count; b++)
            {
                // is the current beat played on the given tick?
                var currentBeat = beats[b];
                // skip non relevant beats
                if (!trackLookup.ContainsKey(currentBeat.Beat.Voice.Bar.Staff.Track.Index))
                {
                    continue;
                }

                if (currentBeat.Start <= tick && tick < currentBeat.End)
                {
                    // take the latest played beat we can find. (most right)
                    if (beat == null || beat.Start < currentBeat.Start)
                    {
                        beat = beats[b];
                        index = b;
                    }
                }
                // if we are already past the tick, we can stop searching
                else if (currentBeat.End > tick)
                {
                    break;
                }
            }

            if (beat == null)
            {
                return null;
            }

            // search for next relevant beat in masterbar
            BeatTickLookup nextBeat = null;
            for (var b = index + 1; b < beats.Count; b++)
            {
                var currentBeat = beats[b];
                if (currentBeat.Start > beat.Start &&
                    trackLookup.ContainsKey(currentBeat.Beat.Voice.Bar.Staff.Track.Index))
                {
                    nextBeat = currentBeat;
                    break;
                }
            }

            // first relevant beat in next bar
            if (nextBeat == null && masterBar.NextMasterBar != null)
            {
                var nextBar = masterBar.NextMasterBar;
                beats = nextBar.Beats;
                for (var b = 0; b < beats.Count; b++)
                {
                    var currentBeat = beats[b];
                    if (trackLookup.ContainsKey(currentBeat.Beat.Voice.Bar.Staff.Track.Index))
                    {
                        nextBeat = currentBeat;
                        break;
                    }
                }
            }

            var result = new MidiTickLookupFindBeatResult();
            result.CurrentBeat = beat.Beat;
            result.NextBeat = nextBeat == null ? null : nextBeat.Beat;
            result.Duration = nextBeat == null
                ? MidiUtils.TicksToMillis(beat.End - beat.Start, masterBar.Tempo)
                : MidiUtils.TicksToMillis(nextBeat.Start - beat.Start, masterBar.Tempo);
            return result;
        }

        private MasterBarTickLookup FindMasterBar(int tick)
        {
            var bars = MasterBars;
            var bottom = 0;
            var top = bars.Count - 1;

            while (bottom <= top)
            {
                var middle = (top + bottom) / 2;
                var bar = bars[middle];

                // found?
                if (tick >= bar.Start && tick < bar.End)
                {
                    return bar;
                }

                // search in lower half 
                if (tick < bar.Start)
                {
                    top = middle - 1;
                }
                // search in upper half
                else
                {
                    bottom = middle + 1;
                }
            }

            return null;
        }

        /// <summary>
        /// Gets the <see cref="MasterBarTickLookup"/> for a given masterbar at which the masterbar is played the first time. 
        /// </summary>
        /// <param name="bar">The masterbar to find the time period for. </param>
        /// <returns>A <see cref="MasterBarTickLookup"/> containing the details about the first time the <see cref="MasterBar"/> is played.</returns>
        // ReSharper disable once UnusedMember.Global
        public MasterBarTickLookup GetMasterBar(MasterBar bar)
        {
            if (!MasterBarLookup.ContainsKey(bar.Index))
            {
                return new MasterBarTickLookup
                {
                    Start = 0,
                    End = 0,
                    Beats = new FastList<BeatTickLookup>(),
                    MasterBar = bar
                };
            }

            return MasterBarLookup[bar.Index];
        }

        /// <summary>
        /// Gets the start time in midi ticks for a given masterbar at which the masterbar is played the first time. 
        /// </summary>
        /// <param name="bar">The masterbar to find the time period for. </param>
        /// <returns>The time in midi ticks at which the masterbar is played the first time or 0 if the masterbar is not contained</returns>
        // ReSharper disable once UnusedMember.Global
        public int GetMasterBarStart(MasterBar bar)
        {
            if (!MasterBarLookup.ContainsKey(bar.Index))
            {
                return 0;
            }

            return MasterBarLookup[bar.Index].Start;
        }

        /// <summary>
        /// Adds a new <see cref="MasterBarTickLookup"/> to the lookup table. 
        /// </summary>
        /// <param name="masterBar">The item to add. </param>
        public void AddMasterBar(MasterBarTickLookup masterBar)
        {
            MasterBars.Add(masterBar);
            _currentMasterBar = masterBar;
            if (!MasterBarLookup.ContainsKey(masterBar.MasterBar.Index))
            {
                MasterBarLookup[masterBar.MasterBar.Index] = masterBar;
            }
        }

        /// <summary>
        /// Adds the given <see cref="BeatTickLookup"/> to the current <see cref="MasterBarTickLookup"/>.
        /// </summary>
        /// <param name="beat">The lookup to add.</param>
        public void AddBeat(BeatTickLookup beat)
        {
            _currentMasterBar.AddBeat(beat);
        }
    }
}
