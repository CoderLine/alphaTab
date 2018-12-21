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
    class RenderEngineFactory
    {
        public bool SupportsWorkers { get; }
        public Func<ICanvas> CreateCanvas { get; }

        public RenderEngineFactory(bool supportsWorkers, Func<ICanvas> canvas)
        {
            SupportsWorkers = supportsWorkers;
            CreateCanvas = canvas;
        }
    }

    class LayoutEngineFactory
    {
        public bool Vertical { get; }
        public Func<ScoreRenderer, ScoreLayout> CreateLayout { get; }

        public LayoutEngineFactory(bool vertical, Func<ScoreRenderer, ScoreLayout> layout)
        {
            Vertical = vertical;
            CreateLayout = layout;
        }
    }

    /// <summary>
    /// This public class represents the global alphaTab environment where
    /// alphaTab looks for information like available layout engines
    /// staves etc.
    /// </summary>
    partial class Environment
    {
        public static FastDictionary<string, RenderEngineFactory> RenderEngines;
        public static FastDictionary<string, LayoutEngineFactory> LayoutEngines;
        public static FastDictionary<string, BarRendererFactory[]> StaveProfiles;
        public const string StaveProfileScoreTab = "score-tab";
        public const string StaveProfileTab = "tab";
        public const string StaveProfileTabMixed = "tab-mixed";
        public const string StaveProfileScore = "score";

        static Environment()
        {
            Init();
        }

        public static IScoreRenderer CreateScoreRenderer(Settings settings)
        {
            return new ScoreRenderer(settings);
        }

        public static RenderEngineFactory GetRenderEngineFactory(Settings settings)
        {
            if (settings.Engine == null || !Environment.RenderEngines.ContainsKey(settings.Engine))
            {
                return Environment.RenderEngines["default"];
            }
            else
            {
                return Environment.RenderEngines[settings.Engine];
            }
        }

        public static LayoutEngineFactory GetLayoutEngineFactory(Settings settings)
        {
            if (settings.Layout.Mode == null || !Environment.LayoutEngines.ContainsKey(settings.Layout.Mode))
            {
                return Environment.LayoutEngines["default"];
            }
            else
            {
                return Environment.LayoutEngines[settings.Layout.Mode];
            }
        }

        public static void Init()
        {
            RenderEngines = new FastDictionary<string, RenderEngineFactory>();
            LayoutEngines = new FastDictionary<string, LayoutEngineFactory>();
            StaveProfiles = new FastDictionary<string, BarRendererFactory[]>();

            PlatformInit();

            // default layout engines
            LayoutEngines["page"] = new LayoutEngineFactory(true, r => new PageViewLayout(r));
            LayoutEngines["horizontal"] = new LayoutEngineFactory(false, r => new HorizontalScreenLayout(r));
            LayoutEngines["default"] = LayoutEngines["page"];

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
