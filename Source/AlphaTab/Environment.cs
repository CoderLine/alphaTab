using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Effects;
using AlphaTab.Rendering.Layout;

namespace AlphaTab
{
    /// <summary>
    /// This public class represents the global alphaTab environment where
    /// alphaTab looks for information like available layout engines
    /// staves etc.
    /// </summary>
    internal partial class Environment
    {
        public static FastDictionary<string, RenderEngineFactory> RenderEngines;
        public static FastDictionary<LayoutMode, LayoutEngineFactory> LayoutEngines;
        public static FastDictionary<StaveProfile, BarRendererFactory[]> StaveProfiles;

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
            if (settings.Core.Engine == null || !RenderEngines.ContainsKey(settings.Core.Engine))
            {
                return RenderEngines["default"];
            }

            return RenderEngines[settings.Core.Engine];
        }

        public static LayoutEngineFactory GetLayoutEngineFactory(Settings settings)
        {
            return LayoutEngines[settings.Display.LayoutMode];
        }

        public static void Init()
        {
            RenderEngines = new FastDictionary<string, RenderEngineFactory>();
            LayoutEngines = new FastDictionary<LayoutMode, LayoutEngineFactory>();
            StaveProfiles = new FastDictionary<StaveProfile, BarRendererFactory[]>();

            PlatformInit();

            // default layout engines
            LayoutEngines[LayoutMode.Page] = new LayoutEngineFactory(true, r => new PageViewLayout(r));
            LayoutEngines[LayoutMode.Horizontal] = new LayoutEngineFactory(false, r => new HorizontalScreenLayout(r));

            // default combinations of stave textprofiles
            StaveProfiles[StaveProfile.ScoreTab] = new BarRendererFactory[]
            {
                new EffectBarRendererFactory("score-effects",
                    new IEffectBarRendererInfo[]
                    {
                        new TempoEffectInfo(), new TripletFeelEffectInfo(), new MarkerEffectInfo(),
                        new TextEffectInfo(), new ChordsEffectInfo(), new FermataEffectInfo(),
                        new WhammyBarEffectInfo(), new TrillEffectInfo(), new OttaviaEffectInfo(true),
                        new WideBeatVibratoEffectInfo(), new SlightBeatVibratoEffectInfo(),
                        new WideNoteVibratoEffectInfo(), new SlightNoteVibratoEffectInfo(),
                        new AlternateEndingsEffectInfo()
                    }),
                new ScoreBarRendererFactory(), new EffectBarRendererFactory("tab-effects",
                    new IEffectBarRendererInfo[]
                    {
                        new CrescendoEffectInfo(), new OttaviaEffectInfo(false), new DynamicsEffectInfo(),
                        new LyricsEffectInfo(), new TrillEffectInfo(), new WideBeatVibratoEffectInfo(),
                        new SlightBeatVibratoEffectInfo(), new WideNoteVibratoEffectInfo(),
                        new SlightNoteVibratoEffectInfo(), new TapEffectInfo(), new FadeInEffectInfo(),
                        new HarmonicsEffectInfo(HarmonicType.Natural), new HarmonicsEffectInfo(HarmonicType.Artificial),
                        new HarmonicsEffectInfo(HarmonicType.Pinch), new HarmonicsEffectInfo(HarmonicType.Tap),
                        new HarmonicsEffectInfo(HarmonicType.Semi), new HarmonicsEffectInfo(HarmonicType.Feedback),
                        new LetRingEffectInfo(), new CapoEffectInfo(), new FingeringEffectInfo(),
                        new PalmMuteEffectInfo(), new PickStrokeEffectInfo(), new PickSlideEffectInfo()
                    }),
                new TabBarRendererFactory(false, false, false)
            };

            StaveProfiles[StaveProfile.Score] = new BarRendererFactory[]
            {
                new EffectBarRendererFactory("score-effects",
                    new IEffectBarRendererInfo[]
                    {
                        new TempoEffectInfo(), new TripletFeelEffectInfo(), new MarkerEffectInfo(),
                        new TextEffectInfo(), new ChordsEffectInfo(), new FermataEffectInfo(),
                        new WhammyBarEffectInfo(), new TrillEffectInfo(), new OttaviaEffectInfo(true),
                        new WideBeatVibratoEffectInfo(), new SlightBeatVibratoEffectInfo(),
                        new WideNoteVibratoEffectInfo(), new SlightNoteVibratoEffectInfo(), new FadeInEffectInfo(),
                        new LetRingEffectInfo(), new PalmMuteEffectInfo(), new PickStrokeEffectInfo(),
                        new PickSlideEffectInfo(), new AlternateEndingsEffectInfo()
                    }),
                new ScoreBarRendererFactory(), new EffectBarRendererFactory("score-bottom-effects",
                    new IEffectBarRendererInfo[]
                    {
                        new CrescendoEffectInfo(), new OttaviaEffectInfo(false), new DynamicsEffectInfo(),
                        new LyricsEffectInfo()
                    })
            };

            var tabEffectInfos = new IEffectBarRendererInfo[]
            {
                new TempoEffectInfo(),
                new TripletFeelEffectInfo(),
                new MarkerEffectInfo(),
                new TextEffectInfo(),
                new ChordsEffectInfo(),
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
            };

            StaveProfiles[StaveProfile.Tab] = new BarRendererFactory[]
            {
                new EffectBarRendererFactory("tab-effects", tabEffectInfos),
                new TabBarRendererFactory(true, true, true), new EffectBarRendererFactory("tab-bottom-effects",
                    new IEffectBarRendererInfo[]
                    {
                        new LyricsEffectInfo()
                    })
            };

            StaveProfiles[StaveProfile.TabMixed] = new BarRendererFactory[]
            {
                new EffectBarRendererFactory("tab-effects",tabEffectInfos),
                new TabBarRendererFactory(false, false, false), new EffectBarRendererFactory("tab-bottom-effects",
                    new IEffectBarRendererInfo[]
                    {
                        new LyricsEffectInfo()
                    })
            };
        }
    }
}
