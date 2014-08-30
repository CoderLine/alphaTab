using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// This is the base public class for creating new layouting engines for the score renderer. 
    /// </summary>
    abstract public class ScoreLayout
    {
        private readonly FastDictionary<string, FastDictionary<int, BarRendererBase>> _barRendererLookup;

        [IntrinsicProperty]
        public ScoreRenderer Renderer { get; set; }

        [IntrinsicProperty]
        public int Width { get; set; }
        [IntrinsicProperty]
        public int Height { get; set; }

        protected ScoreLayout(ScoreRenderer renderer)
        {
            Renderer = renderer;
            _barRendererLookup = new FastDictionary<string, FastDictionary<int, BarRendererBase>>();
        }

        public abstract void DoLayout();
        public abstract void PaintScore();
        public abstract void BuildBoundingsLookup(BoundingsLookup lookup);

        public float Scale
        {
            get
            {
                return Renderer.Settings.Scale;
            }
        }

        protected StaveGroup CreateEmptyStaveGroup()
        {
            var group = new StaveGroup();
            group.Layout = this;

            var isFirstTrack = true;
            for (int i = 0; i < Renderer.Tracks.Length; i++)
            {
                var track = Renderer.Tracks[i];
                for (int j = 0; j < Renderer.Settings.Staves.Count; j++)
                {
                    var s = Renderer.Settings.Staves[j];
                    if (Environment.StaveFactories.ContainsKey(s.Id))
                    {
                        var factory = Environment.StaveFactories[s.Id](this);
                        if (factory.CanCreate(track) && (isFirstTrack || !factory.HideOnMultiTrack))
                        {
                            group.AddStave(track, new Stave(s.Id, factory));
                        }
                    }
                }
                isFirstTrack = false;
            }
            return group;
        }

        public void RegisterBarRenderer(string key, int index, BarRendererBase renderer)
        {
            if (!_barRendererLookup.ContainsKey(key))
            {
                _barRendererLookup[key] = new FastDictionary<int, BarRendererBase>();
            }
            _barRendererLookup[key][index] = renderer;
        }

        public BarRendererBase GetRendererForBar(string key, int index)
        {
            if (_barRendererLookup.ContainsKey(key) && _barRendererLookup[key].ContainsKey(index))
            {
                return _barRendererLookup[key][index];
            }
            return null;
        }
    }
}
