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
using AlphaTab.Platform.Svg;
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
        public static FastDictionary<string, Func<object, ICanvas>> RenderEngines;
        public static FastDictionary<string, Func<IFileLoader>> FileLoaders;
        public static FastDictionary<string, Func<ScoreRenderer, ScoreLayout>> LayoutEngines;
        public static FastDictionary<string, Func<ScoreLayout, BarRendererFactory>> StaveFactories;

        static Environment()
        {
            RenderEngines = new FastDictionary<string, Func<object, ICanvas>>();
            FileLoaders = new FastDictionary<string, Func<IFileLoader>>();
            LayoutEngines = new FastDictionary<string, Func<ScoreRenderer, ScoreLayout>>();
            StaveFactories = new FastDictionary<string, Func<ScoreLayout, BarRendererFactory>>();

            PlatformInit();

            RenderEngines["svg"] = d => new SvgCanvas();


            // default layout engines
            LayoutEngines["default"] = r => new PageViewLayout(r);
            LayoutEngines["page"] = r => new PageViewLayout(r);
            LayoutEngines["horizontal"] = r => new HorizontalScreenLayout(r);

            // default staves 
            StaveFactories["marker"] = l => new EffectBarRendererFactory(new MarkerEffectInfo());
            //staveFactories.set("triplet-feel", functionl { return new EffectBarRendererFactory(new TripletFeelEffectInfo()); });
            StaveFactories["tempo"] = l => new EffectBarRendererFactory(new TempoEffectInfo());
            StaveFactories["text"] = l => new EffectBarRendererFactory(new TextEffectInfo());
            StaveFactories["chords"] = l => new EffectBarRendererFactory(new ChordsEffectInfo());
            StaveFactories["trill"] = l => new EffectBarRendererFactory(new TrillEffectInfo());
            StaveFactories["beat-vibrato"] = l => new EffectBarRendererFactory(new BeatVibratoEffectInfo());
            StaveFactories["note-vibrato"] = l => new EffectBarRendererFactory(new NoteVibratoEffectInfo());
            StaveFactories["alternate-endings"] = l => new AlternateEndingsBarRendererFactory();
            StaveFactories["score"] = l => new ScoreBarRendererFactory();
            StaveFactories["crescendo"] = l => new EffectBarRendererFactory(new CrescendoEffectInfo());
            StaveFactories["dynamics"] = l => new EffectBarRendererFactory(new DynamicsEffectInfo());
            StaveFactories["tap"] = l => new EffectBarRendererFactory(new TapEffectInfo());
            StaveFactories["fade-in"] = l => new EffectBarRendererFactory(new FadeInEffectInfo());
            StaveFactories["let-ring"] = l => new EffectBarRendererFactory(new LetRingEffectInfo());
            StaveFactories["palm-mute"] = l => new EffectBarRendererFactory(new PalmMuteEffectInfo());
            StaveFactories["tab"] = l => new TabBarRendererFactory();
            StaveFactories["pick-stroke"] = l => new EffectBarRendererFactory(new PickStrokeEffectInfo());
            StaveFactories["rhythm-up"] = l => new RhythmBarRendererFactory(BeamDirection.Down);
            StaveFactories["rhythm-down"] = l => new RhythmBarRendererFactory(BeamDirection.Up);
            // staveFactories.set("fingering", functionl { return new EffectBarRendererFactory(new FingeringEffectInfo()); });   
        }
    }
}
