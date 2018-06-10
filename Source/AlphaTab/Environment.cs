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
        public static FastDictionary<string, Func<ScoreRenderer, ScoreLayout>> LayoutEngines;
        public static FastDictionary<string, BarRendererFactory[]> StaveProfiles;
        public const string StaveProfileScoreTab = "score-tab";
        public const string StaveProfileTab = "tab";
        public const string StaveProfileTabMixed = "tab-mixed";
        public const string StaveProfileScore = "score";

        static Environment()
        {
            Init();
        }

        public static void Init()
        {
            RenderEngines = new FastDictionary<string, Func<ICanvas>>();
            LayoutEngines = new FastDictionary<string, Func<ScoreRenderer, ScoreLayout>>();
            StaveProfiles = new FastDictionary<string, BarRendererFactory[]>();

            PlatformInit();

            // default layout engines
            LayoutEngines["default"] = r => new PageViewLayout(r);
            LayoutEngines["page"] = r => new PageViewLayout(r);
            LayoutEngines["horizontal"] = r => new HorizontalScreenLayout(r);

            // default combinations of stave textprofiles
            StaveProfiles["default"] = StaveProfiles[StaveProfileScoreTab] = new BarRendererFactory[]
            {
                new EffectBarRendererFactory("score-effects", new IEffectBarRendererInfo[] {
                    new TempoEffectInfo(),
                    new TripletFeelEffectInfo(),
                    new MarkerEffectInfo(),
                    new TextEffectInfo(),
                    new ChordsEffectInfo(),
                    new FermataEffectInfo(), 
                    new WhammyBarEffectInfo(),
                    new TrillEffectInfo(),
                    new OttaviaEffectInfo(true), 
                    new WideBeatVibratoEffectInfo(),
                    new SlightBeatVibratoEffectInfo(),
                    new WideNoteVibratoEffectInfo(),
                    new SlightNoteVibratoEffectInfo(),
                    new AlternateEndingsEffectInfo(),
                }),
                new ScoreBarRendererFactory(),
                new EffectBarRendererFactory("tab-effects", new IEffectBarRendererInfo[] {
                    new CrescendoEffectInfo(),
                    new OttaviaEffectInfo(false),
                    new DynamicsEffectInfo(),
                    new LyricsEffectInfo(), 
                    new TrillEffectInfo(),
                    new WideBeatVibratoEffectInfo(),
                    new SlightBeatVibratoEffectInfo(),
                    new WideNoteVibratoEffectInfo(),
                    new SlightNoteVibratoEffectInfo(),
                    new TapEffectInfo(),
                    new FadeInEffectInfo(),
                    new HarmonicsEffectInfo(HarmonicType.Natural),
                    new HarmonicsEffectInfo(HarmonicType.Artificial),
                    new HarmonicsEffectInfo(HarmonicType.Pinch),
                    new HarmonicsEffectInfo(HarmonicType.Tap),
                    new HarmonicsEffectInfo(HarmonicType.Semi),
                    new HarmonicsEffectInfo(HarmonicType.Feedback),
                    new LetRingEffectInfo(),
                    new CapoEffectInfo(),
                    new FingeringEffectInfo(),
                    new PalmMuteEffectInfo(),
                    new PickStrokeEffectInfo(),
                    new PickSlideEffectInfo()
                }),
                new TabBarRendererFactory(false, false, false)
            };

            StaveProfiles[StaveProfileScore] = new BarRendererFactory[]
            {
                new EffectBarRendererFactory("score-effects", new IEffectBarRendererInfo[] {
                    new TempoEffectInfo(), 
                    new TripletFeelEffectInfo(),
                    new MarkerEffectInfo(),
                    new TextEffectInfo(),
                    new ChordsEffectInfo(),
                    new FermataEffectInfo(),
                    new WhammyBarEffectInfo(),
                    new TrillEffectInfo(),
                    new OttaviaEffectInfo(true),
                    new WideBeatVibratoEffectInfo(),
                    new SlightBeatVibratoEffectInfo(),
                    new WideNoteVibratoEffectInfo(),
                    new SlightNoteVibratoEffectInfo(),
                    new FadeInEffectInfo(),
                    new LetRingEffectInfo(),
                    new PalmMuteEffectInfo(),
                    new PickStrokeEffectInfo(),
                    new PickSlideEffectInfo(),
                    new AlternateEndingsEffectInfo(), 
                }),
                new ScoreBarRendererFactory(),
                new EffectBarRendererFactory("score-bottom-effects", new IEffectBarRendererInfo[] {
                    new CrescendoEffectInfo(),
                    new OttaviaEffectInfo(false),
                    new DynamicsEffectInfo(),
                    new LyricsEffectInfo(), 
                }),
            };

            StaveProfiles[StaveProfileTab] = new BarRendererFactory[]
            {
                new EffectBarRendererFactory("tab-effects", new IEffectBarRendererInfo[] {
                    new TempoEffectInfo(), 
                    new TripletFeelEffectInfo(), 
                    new MarkerEffectInfo(), 
                    new TextEffectInfo(), 
                    new ChordsEffectInfo(),
                    new TripletFeelEffectInfo(),
                    new FermataEffectInfo(),
                    new TrillEffectInfo(),
                    new WideBeatVibratoEffectInfo(),
                    new SlightBeatVibratoEffectInfo(),
                    new WideNoteVibratoEffectInfo(),
                    new SlightNoteVibratoEffectInfo(),
                    new TapEffectInfo(), 
                    new FadeInEffectInfo(),
                    new HarmonicsEffectInfo(HarmonicType.Artificial),
                    new HarmonicsEffectInfo(HarmonicType.Pinch),
                    new HarmonicsEffectInfo(HarmonicType.Tap),
                    new HarmonicsEffectInfo(HarmonicType.Semi),
                    new HarmonicsEffectInfo(HarmonicType.Feedback),
                    new LetRingEffectInfo(), 
                    new CapoEffectInfo(),
                    new FingeringEffectInfo(),
                    new PalmMuteEffectInfo(), 
                    new PickStrokeEffectInfo(),
                    new PickSlideEffectInfo(), 
                    new AlternateEndingsEffectInfo()
                }),
                new TabBarRendererFactory(true, true, true),
                new EffectBarRendererFactory("tab-bottom-effects", new IEffectBarRendererInfo[] {
                    new LyricsEffectInfo(),
                }),
            };

            StaveProfiles[StaveProfileTabMixed] = new BarRendererFactory[]
            {
                new EffectBarRendererFactory("tab-effects", new IEffectBarRendererInfo[] {
                    new TempoEffectInfo(), 
                    new TripletFeelEffectInfo(), 
                    new MarkerEffectInfo(), 
                    new TextEffectInfo(), 
                    new ChordsEffectInfo(), 
                    new TripletFeelEffectInfo(),
                    new TrillEffectInfo(),
                    new WideBeatVibratoEffectInfo(),
                    new SlightBeatVibratoEffectInfo(),
                    new WideNoteVibratoEffectInfo(),
                    new SlightNoteVibratoEffectInfo(),
                    new TapEffectInfo(), 
                    new FadeInEffectInfo(),
                    new HarmonicsEffectInfo(HarmonicType.Artificial),
                    new HarmonicsEffectInfo(HarmonicType.Pinch),
                    new HarmonicsEffectInfo(HarmonicType.Tap),
                    new HarmonicsEffectInfo(HarmonicType.Semi),
                    new HarmonicsEffectInfo(HarmonicType.Feedback),
                    new LetRingEffectInfo(), 
                    new CapoEffectInfo(), 
                    new PalmMuteEffectInfo(), 
                    new PickStrokeEffectInfo(),
                    new PickSlideEffectInfo(),
                    new AlternateEndingsEffectInfo()
                }),
                new TabBarRendererFactory(false, false, false),
                new EffectBarRendererFactory("tab-bottom-effects", new IEffectBarRendererInfo[] {
                    new LyricsEffectInfo(),
                }),
            };
        }
    }
}
