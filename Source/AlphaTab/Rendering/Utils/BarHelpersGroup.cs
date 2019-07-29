using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    internal class BarHelpers
    {
        public FastList<FastList<BeamingHelper>> BeamHelpers { get; set; }
        public FastList<FastDictionary<int, BeamingHelper>> BeamHelperLookup { get; set; }

        public BarHelpers(Bar bar)
        {
            BeamHelpers = new FastList<FastList<BeamingHelper>>();
            BeamHelperLookup = new FastList<FastDictionary<int, BeamingHelper>>();

            BeamingHelper currentBeamHelper = null;
            BeamingHelper currentGraceBeamHelper = null;

            if (bar != null)
            {
                for (int i = 0, j = bar.Voices.Count; i < j; i++)
                {
                    var v = bar.Voices[i];
                    BeamHelpers.Add(new FastList<BeamingHelper>());
                    BeamHelperLookup.Add(new FastDictionary<int, BeamingHelper>());

                    for (int k = 0, l = v.Beats.Count; k < l; k++)
                    {
                        var b = v.Beats[k];

                        BeamingHelper helperForBeat;
                        if (b.GraceType != GraceType.None)
                        {
                            helperForBeat = currentGraceBeamHelper;
                        }
                        else
                        {
                            helperForBeat = currentBeamHelper;
                            currentGraceBeamHelper = null;
                        }

                        // if a new beaming helper was started, we close our tuplet grouping as well
                        if (!b.IsRest)
                        {
                            // try to fit beam to current beamhelper
                            if (helperForBeat == null || !helperForBeat.CheckBeat(b))
                            {
                                if (helperForBeat != null)
                                {
                                    helperForBeat.Finish();
                                }

                                // if not possible, create the next beaming helper
                                helperForBeat = new BeamingHelper(bar.Staff);
                                helperForBeat.CheckBeat(b);
                                if (b.GraceType != GraceType.None)
                                {
                                    currentGraceBeamHelper = helperForBeat;
                                }
                                else
                                {
                                    currentBeamHelper = helperForBeat;
                                }

                                BeamHelpers[v.Index].Add(helperForBeat);
                            }
                        }

                        BeamHelperLookup[v.Index][b.Index] = helperForBeat;
                    }

                    if (currentBeamHelper != null)
                    {
                        currentBeamHelper.Finish();
                    }

                    if (currentGraceBeamHelper != null)
                    {
                        currentGraceBeamHelper.Finish();
                    }

                    currentBeamHelper = null;
                    currentGraceBeamHelper = null;
                }
            }
        }

        public BeamingHelper GetBeamingHelperForBeat(Beat beat)
        {
            return BeamHelperLookup[beat.Voice.Index][beat.Index];
        }
    }
}
