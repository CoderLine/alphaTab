using System.Collections.Generic;
using System.Runtime.CompilerServices;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    public class BarHelpers
    {
        [IntrinsicProperty]
        public List<List<BeamingHelper>> BeamHelpers { get; set; }
        [IntrinsicProperty]
        public List<Dictionary<int, BeamingHelper>> BeamHelperLookup { get; set; }
        [IntrinsicProperty]
        public List<List<TupletHelper>> TupletHelpers { get; set; }

        public BarHelpers(Bar bar)
        {
            BeamHelpers = new List<List<BeamingHelper>>();
            BeamHelperLookup = new List<Dictionary<int, BeamingHelper>>();
            TupletHelpers = new List<List<TupletHelper>>();

            BeamingHelper currentBeamHelper = null;
            TupletHelper currentTupletHelper = null;

            foreach (var v in bar.Voices)
            {
                BeamHelpers.Add(new List<BeamingHelper>());
                BeamHelperLookup.Add(new Dictionary<int, BeamingHelper>());
                TupletHelpers.Add(new List<TupletHelper>());

                foreach (var b in v.Beats)
                {
                    var newBeamingHelper = false;

                    if (!b.IsRest)
                    {
                        // try to fit beam to current beamhelper
                        if (currentBeamHelper == null || !currentBeamHelper.CheckBeat(b))
                        {
                            // if not possible, create the next beaming helper
                            currentBeamHelper = new BeamingHelper(bar.Track);
                            currentBeamHelper.CheckBeat(b);
                            BeamHelpers[v.Index].Add(currentBeamHelper);
                            newBeamingHelper = true;
                        }
                    }

                    if (b.HasTuplet)
                    {
                        // try to fit tuplet to current tuplethelper
                        // TODO: register tuplet overflow
                        var previousBeat = b.PreviousBeat;

                        // don't group if the previous beat isn't in the same voice
                        if (previousBeat != null && previousBeat.Voice != b.Voice) previousBeat = null;

                        // if a new beaming helper was started, we close our tuplet grouping as well
                        if (newBeamingHelper && currentTupletHelper != null)
                        {
                            currentTupletHelper.Finish();
                        }

                        if (previousBeat == null || currentTupletHelper == null || !currentTupletHelper.Check(b))
                        {
                            currentTupletHelper = new TupletHelper(v.Index);
                            currentTupletHelper.Check(b);
                            TupletHelpers[v.Index].Add(currentTupletHelper);
                        }
                    }

                    BeamHelperLookup[v.Index][b.Index] = currentBeamHelper;
                }

                currentBeamHelper = null;
                currentTupletHelper = null;
            }
        }
    }

    /// <summary>
    /// This helpers group creates beaming and tuplet helpers
    /// upon request.
    /// </summary>
    public class BarHelpersGroup
    {
        [IntrinsicProperty]
        public Dictionary<int, Dictionary<int, BarHelpers>> Helpers { get; set; }

        public BarHelpersGroup()
        {
            Helpers = new Dictionary<int, Dictionary<int, BarHelpers>>();
        }

        public void BuildHelpers(List<Track> tracks, int barIndex)
        {
            foreach (var t in tracks)
            {
                Dictionary<int, BarHelpers> h;
                if (!Helpers.ContainsKey(t.Index))
                {
                    h = new Dictionary<int, BarHelpers>();
                    Helpers[t.Index] = h;
                }
                else
                {
                    h = Helpers[t.Index];
                }

                if (!h.ContainsKey(barIndex))
                {
                    h[barIndex] = new BarHelpers(t.Bars[barIndex]);
                }
            }
        }
    }
}