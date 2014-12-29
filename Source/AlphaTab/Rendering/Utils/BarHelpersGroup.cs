/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
    public class BarHelpers
    {
        public FastList<FastList<BeamingHelper>> BeamHelpers { get; set; }
        public FastList<FastDictionary<int, BeamingHelper>> BeamHelperLookup { get; set; }
        public FastList<FastList<TupletHelper>> TupletHelpers { get; set; }

        public BarHelpers(Bar bar)
        {
            BeamHelpers = new FastList<FastList<BeamingHelper>>();
            BeamHelperLookup = new FastList<FastDictionary<int, BeamingHelper>>();
            TupletHelpers = new FastList<FastList<TupletHelper>>();

            BeamingHelper currentBeamHelper = null;
            TupletHelper currentTupletHelper = null;

            for (int i = 0, j = bar.Voices.Count; i < j; i++)
            {
                var v = bar.Voices[i];
                BeamHelpers.Add(new FastList<BeamingHelper>());
                BeamHelperLookup.Add(new FastDictionary<int, BeamingHelper>());
                TupletHelpers.Add(new FastList<TupletHelper>());

                for (int k = 0, l = v.Beats.Count; k < l; k++)
                {
                    var b = v.Beats[k];
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
        public FastDictionary<int, FastDictionary<int, BarHelpers>> Helpers { get; set; }

        public BarHelpersGroup()
        {
            Helpers = new FastDictionary<int, FastDictionary<int, BarHelpers>>();
        }

        public void BuildHelpers(Track[] tracks, int barIndex)
        {
            for (int i = 0; i < tracks.Length; i++)
            {
                var t = tracks[i];
                FastDictionary<int, BarHelpers> h;
                if (!Helpers.ContainsKey(t.Index))
                {
                    h = new FastDictionary<int, BarHelpers>();
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