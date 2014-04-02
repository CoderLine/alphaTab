using System;
using System.Collections.Generic;
using AlphaTab.Platform;
using AlphaTab.Platform.CSharp;
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
    public class Environment
    {
        public static Dictionary<string, Func<object, ICanvas>> RenderEngines;
        public static Dictionary<string, Func<IFileLoader>> FileLoaders;
        public static Dictionary<string, Func<ScoreRenderer, ScoreLayout>> LayoutEngines;
        public static Dictionary<string, Func<ScoreLayout, BarRendererFactory>> StaveFactories;

        static Environment()
        {
            RenderEngines = new Dictionary<string, Func<object, ICanvas>>();
            FileLoaders = new Dictionary<string, Func<IFileLoader>>();
            LayoutEngines = new Dictionary<string, Func<ScoreRenderer, ScoreLayout>>();
            StaveFactories = new Dictionary<string, Func<ScoreLayout, BarRendererFactory>>();

            // default render engines
            RenderEngines["default"] = d =>
#if JavaScript
                new Html5Canvas(d);
#elif CSharp
 new GdiCanvas();
#endif

#if JavaScript
            RenderEngines["html5"] = d => new Html5Canvas(d); 
#elif CSharp
            RenderEngines["gdi"] = d => new GdiCanvas();
#endif

            RenderEngines["svg"] = d => new SvgCanvas();

            // default file loaders
            FileLoaders["default"] = () =>
#if JavaScript
                new JsFileLoader();
                
#elif CSharp
 new CsFileLoader();
#else
#error Unsupported Platform
#endif

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
            StaveFactories["rhythm-up"] = l => new RhythmBarRendererFactory(BeamDirection.Up);
            StaveFactories["rhythm-down"] = l => new RhythmBarRendererFactory(BeamDirection.Down);
            // staveFactories.set("fingering", functionl { return new EffectBarRendererFactory(new FingeringEffectInfo()); });   
        }
    }
}
