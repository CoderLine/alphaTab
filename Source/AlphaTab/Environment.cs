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
using System;
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Effects;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;

namespace AlphaTab
{
    /// <summary>
    /// This public class represents the global alphaTab environment where
    /// alphaTab looks for information like available layout engines
    /// staves etc.
    /// </summary>
    public partial class Environment
    {
        public static FastDictionary<string, Func<ICanvas>> RenderEngines;
        public static FastDictionary<string, Func<IFileLoader>> FileLoaders;
        public static FastDictionary<string, Func<ScoreRenderer, ScoreLayout>> LayoutEngines;
        public static FastDictionary<string, BarRendererFactory> StaveFactories;
        public static FastDictionary<string, string[]> StaveProfiles;

        static Environment()
        {
            RenderEngines = new FastDictionary<string, Func<ICanvas>>();
            FileLoaders = new FastDictionary<string, Func<IFileLoader>>();
            LayoutEngines = new FastDictionary<string, Func<ScoreRenderer, ScoreLayout>>();
            StaveFactories = new FastDictionary<string, BarRendererFactory>();
            StaveProfiles = new FastDictionary<string, string[]>();

            PlatformInit();

            // default layout engines
            LayoutEngines["default"] = r => new PageViewLayout(r);
            LayoutEngines["page"] = r => new PageViewLayout(r);
            LayoutEngines["horizontal"] = r => new HorizontalScreenLayout(r);

            // default staves 
            StaveFactories["marker"] = new EffectBarRendererFactory(new MarkerEffectInfo());
            StaveFactories["triplet-feel"] = new EffectBarRendererFactory(new TripletFeelEffectInfo());
            StaveFactories["tempo"] = new EffectBarRendererFactory(new TempoEffectInfo());
            StaveFactories["text"] = new EffectBarRendererFactory(new TextEffectInfo());
            StaveFactories["chords"] = new EffectBarRendererFactory(new ChordsEffectInfo());
            StaveFactories["trill"] = new EffectBarRendererFactory(new TrillEffectInfo());
            StaveFactories["beat-vibrato"] = new EffectBarRendererFactory(new BeatVibratoEffectInfo());
            StaveFactories["note-vibrato"] = new EffectBarRendererFactory(new NoteVibratoEffectInfo());
            StaveFactories["alternate-endings"] = new AlternateEndingsBarRendererFactory();
            StaveFactories["score"] = new ScoreBarRendererFactory();
            StaveFactories["crescendo"] = new EffectBarRendererFactory(new CrescendoEffectInfo());
            StaveFactories["dynamics"] = new EffectBarRendererFactory(new DynamicsEffectInfo());
            StaveFactories["capo"] = new EffectBarRendererFactory(new CapoEffectInfo());
            StaveFactories["tap"] = new EffectBarRendererFactory(new TapEffectInfo());
            StaveFactories["fade-in"] = new EffectBarRendererFactory(new FadeInEffectInfo());
            StaveFactories["harmonics"] = new EffectBarRendererFactory(new HarmonicsEffectInfo());
            StaveFactories["let-ring"] = new EffectBarRendererFactory(new LetRingEffectInfo());
            StaveFactories["palm-mute"] = new EffectBarRendererFactory(new PalmMuteEffectInfo());
            StaveFactories["tab"] = new TabBarRendererFactory();
            StaveFactories["pick-stroke"] = new EffectBarRendererFactory(new PickStrokeEffectInfo());
            StaveFactories["rhythm-up"] = new RhythmBarRendererFactory(BeamDirection.Down);
            StaveFactories["rhythm-down"] = new RhythmBarRendererFactory(BeamDirection.Up);

            // default combinations of stave textprofiles
            StaveProfiles["default"] = StaveProfiles["score-tab"] = new[]
            {
                "tempo",
                "triplet-feel",
                "marker",
                "text",
                "chords",
                "trill",
                "beat-vibrato",
                "note-vibrato",
                "alternate-endings",
                "score",
                "crescendo",
                "dynamics",
                "trill",
                "beat-vibrato",
                "note-vibrato",
                "tap",
                "fade-in",
                "harmonics",
                "let-ring",
                "capo",
                "palm-mute",
                "pick-stroke",
                "tab"
            };

            StaveProfiles["score"] = new[]
            {
                "tempo",
                "triplet-feel",
                "marker",
                "text",
                "chords",
                "trill",
                "beat-vibrato",
                "note-vibrato",
                "fade-in",
                "alternate-endings",
                "let-ring",
                "palm-mute",
                "pick-stroke",
                "score",
                "crescendo",
                "dynamics"
            };

            StaveProfiles["tab"] = new[]
            {
                "tempo",
                "triplet-feel",
                "marker",
                "text",
                "chords",
                "trill",
                "beat-vibrato",
                "note-vibrato",
                "alternate-endings",
                "trill",
                "beat-vibrato",
                "note-vibrato",
                "tap",
                "fade-in",
                "harmonics",
                "let-ring",
                "capo",
                "palm-mute",
                "pick-stroke",
                "tab",
                "rhythm-down"
            };
        }
    }
}
