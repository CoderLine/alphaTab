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

using System;
using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    class BarHelpers
    {
        public FastList<FastList<BeamingHelper>> BeamHelpers { get; set; }
        public FastList<FastDictionary<int, BeamingHelper>> BeamHelperLookup { get; set; }
        public BarHelpers(Bar bar)
        {
            BeamHelpers = new FastList<FastList<BeamingHelper>>();
            BeamHelperLookup = new FastList<FastDictionary<int, BeamingHelper>>();

            BeamingHelper currentBeamHelper = null;

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
                        var hasNewTupletHelper = false;
                        var forceNewTupletHelper = false;

                        // if a new beaming helper was started, we close our tuplet grouping as well
                        if (!b.IsRest)
                        {
                            // try to fit beam to current beamhelper
                            if (currentBeamHelper == null || !currentBeamHelper.CheckBeat(b))
                            {
                                if (currentBeamHelper != null)
                                {
                                    currentBeamHelper.Finish();
                                    forceNewTupletHelper = currentBeamHelper.Beats.Count > 1;
                                }
                                else
                                {
                                    forceNewTupletHelper = true;
                                }
                                // if not possible, create the next beaming helper
                                currentBeamHelper = new BeamingHelper(bar.Staff);
                                currentBeamHelper.CheckBeat(b);
                                BeamHelpers[v.Index].Add(currentBeamHelper);
                            }
                        }

                        BeamHelperLookup[v.Index][b.Index] = currentBeamHelper;
                    }

                    if (currentBeamHelper != null)
                    {
                        currentBeamHelper.Finish();
                    }

                    currentBeamHelper = null;
                }
            }
        }

        public BeamingHelper GetBeamingHelperForBeat(Beat beat)
        {
            return BeamHelperLookup[beat.Voice.Index][beat.Index];
        }
    }
}