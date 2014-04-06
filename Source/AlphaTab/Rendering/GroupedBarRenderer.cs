using System.Collections.Generic;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This BarRenderer has 3 different groups which cna store glyphs:
    ///  - PreBeatGlyphs : Those glyphs are aligned left to right before the first glyph which represents a beat
    ///  - BeatGlyphs : Each of those glyphs represents one beat. They are aligned left to right.
    ///  - PostBeatGlyphs : Those glyphs are aligned left to right after the last beat glyph
    /// </summary>
    public class GroupedBarRenderer : BarRendererBase
    {
        public const string KeySizePre = "Pre";
        public const string KeySizePost = "Post";

        private readonly List<Glyph> _preBeatGlyphs;
        private readonly Dictionary<int, VoiceContainerGlyph> _voiceContainers;
        private readonly List<Glyph> _postBeatGlyphs;

        private VoiceContainerGlyph _biggestVoiceContainer;

        public GroupedBarRenderer(Bar bar)
            : base(bar)
        {
            _preBeatGlyphs = new List<Glyph>();
            _voiceContainers = new Dictionary<int, VoiceContainerGlyph>();
            _postBeatGlyphs = new List<Glyph>();
        }

        public override void DoLayout()
        {
            CreatePreBeatGlyphs();
            CreateBeatGlyphs();
            CreatePostBeatGlyphs();
            foreach (var c in _voiceContainers.Values)
            {
                c.DoLayout();
            }
            UpdateWidth();
        }

        private void UpdateWidth()
        {
            Width = PostBeatGlyphsStart;
            if (_postBeatGlyphs.Count > 0)
            {
                Width += _postBeatGlyphs[_postBeatGlyphs.Count - 1].X + _postBeatGlyphs[_postBeatGlyphs.Count - 1].Width;
            }
            foreach (var c in _voiceContainers.Values)
            {
                if (_biggestVoiceContainer == null || c.Width > _biggestVoiceContainer.Width)
                {
                    _biggestVoiceContainer = c;
                }
            }
        }

        public override void RegisterMaxSizes(BarSizeInfo sizes)
        {
            var preSize = BeatGlyphsStart;
            if (sizes.GetSize(KeySizePre) < preSize)
            {
                sizes.SetSize(KeySizePre, preSize);
            }

            foreach (var c in _voiceContainers.Values)
            {
                c.RegisterMaxSizes(sizes);
            }

            int postSize;
            if (_postBeatGlyphs.Count == 0)
            {
                postSize = 0;
            }
            else
            {
                postSize = _postBeatGlyphs[_postBeatGlyphs.Count - 1].X + _postBeatGlyphs[_postBeatGlyphs.Count - 1].Width;
            }
            if (sizes.GetSize(KeySizePost) < postSize)
            {
                sizes.SetSize(KeySizePost, postSize);
            }

            if (sizes.FullWidth < Width)
            {
                sizes.FullWidth = Width;
            }
        }

        public override void ApplySizes(BarSizeInfo sizes)
        {
            // if we need additional space in the preBeat group we simply
            // add a new spacer
            var preSize = sizes.GetSize(KeySizePre);
            var preSizeDiff = preSize - BeatGlyphsStart;
            if (preSizeDiff > 0)
            {
                AddPreBeatGlyph(new SpacingGlyph(0, 0, preSizeDiff));
            }

            // on beat glyphs we apply the glyph spacing
            foreach (var c in _voiceContainers.Values)
            {
                c.ApplySizes(sizes);
            }

            // on the post glyphs we add the spacing before all other glyphs
            var postSize = sizes.GetSize(KeySizePost);
            int postSizeDiff;
            if (_postBeatGlyphs.Count == 0)
            {
                postSizeDiff = 0;
            }
            else
            {
                postSizeDiff = postSize - (_postBeatGlyphs[_postBeatGlyphs.Count - 1].X + _postBeatGlyphs[_postBeatGlyphs.Count - 1].Width);
            }

            if (postSizeDiff > 0)
            {
                _postBeatGlyphs.Insert(0, new SpacingGlyph(0, 0, postSizeDiff));
                for (var i = 0; i < _postBeatGlyphs.Count; i++)
                {
                    var g = _postBeatGlyphs[i];
                    g.X = i == 0 ? 0 : _postBeatGlyphs[_postBeatGlyphs.Count - 1].X + _postBeatGlyphs[_postBeatGlyphs.Count - 1].Width;
                    g.Index = i;
                    g.Renderer = this;
                }
            }

            UpdateWidth();
        }

        private void AddGlyph(List<Glyph> c, Glyph g)
        {
            IsEmpty = false;
            g.X = c.Count == 0 ? 0 : (c[c.Count - 1].X + c[c.Count - 1].Width);
            g.Index = c.Count;
            g.Renderer = this;
            g.DoLayout();
            c.Add(g);
        }

        protected void AddPreBeatGlyph(Glyph g)
        {
            AddGlyph(_preBeatGlyphs, g);
        }

        protected void AddBeatGlyph(BeatContainerGlyph g)
        {
            GetOrCreateVoiceContainer(g.Beat.Voice.Index).AddGlyph(g);
        }

        private VoiceContainerGlyph GetOrCreateVoiceContainer(int voiceIndex)
        {
            VoiceContainerGlyph c;
            if (voiceIndex >= _voiceContainers.Count)
            {
                c = new VoiceContainerGlyph(0, 0, voiceIndex);
                c.Renderer = this;
                _voiceContainers[voiceIndex] = c;
            }
            else
            {
                c = _voiceContainers[voiceIndex];
            }
            return c;
        }

        public BeatContainerGlyph GetBeatContainer(int voice, int beat)
        {
            return GetOrCreateVoiceContainer(voice).BeatGlyphs[beat];
        }

        public BeatGlyphBase GetPreNotesPosition(int voice, int beat)
        {
            return GetBeatContainer(voice, beat).PreNotes;
        }

        public BeatGlyphBase GetOnNotesPosition(int voice, int beat)
        {
            return GetBeatContainer(voice, beat).OnNotes;
        }

        public BeatGlyphBase GetPostNotesPosition(int voice, int beat)
        {
            return GetBeatContainer(voice, beat).PostNotes;
        }

        protected void AddPostBeatGlyph(Glyph g)
        {
            AddGlyph(_postBeatGlyphs, g);
        }

        protected virtual void CreatePreBeatGlyphs()
        {

        }

        protected virtual void CreateBeatGlyphs()
        {

        }

        protected virtual void CreatePostBeatGlyphs()
        {

        }

        public int PreBeatGlyphStart
        {
            get
            {
                return 0;
            }
        }

        public int BeatGlyphsStart
        {
            get
            {
                var start = PreBeatGlyphStart;
                if (_preBeatGlyphs.Count > 0)
                {
                    start += _preBeatGlyphs[_preBeatGlyphs.Count - 1].X + _preBeatGlyphs[_preBeatGlyphs.Count - 1].Width;
                }
                return start;
            }
        }

        public int PostBeatGlyphsStart
        {
            get
            {
                var start = BeatGlyphsStart;
                var offset = 0;
                foreach (var c in _voiceContainers.Values)
                {
                    if (c.Width > offset)
                    {
                        offset = c.Width;
                    }
                    //if (c.beatGlyphs.length > 0)
                    //{
                    //    var coff = c.beatGlyphs[c.beatGlyphs.length - 1].x + c.beatGlyphs[c.beatGlyphs.length - 1].width;
                    //    if (coff > offset)
                    //    {
                    //        offset = coff;
                    //    }
                    //}
                }

                return start + offset;
            }
        }

        public int PostBeatGlyphsWidth
        {
            get
            {
                var width = 0;
                foreach (var c in _postBeatGlyphs)
                {
                    var x = c.X + c.Width;
                    if (x > width)
                        width = x;
                }
                return width;
            }
        }

        public override void ApplyBarSpacing(int spacing)
        {
            Width += spacing;

            foreach (var c in _voiceContainers.Values)
            {
                var toApply = spacing;
                if (_biggestVoiceContainer != null)
                {
                    toApply += _biggestVoiceContainer.Width - c.Width;
                }
                c.ApplyGlyphSpacing(toApply);
            }
        }

        public override void FinalizeRenderer(ScoreLayout layout)
        {
            foreach (var c in _voiceContainers.Values)
            {
                c.FinalizeGlyph(layout);
            }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            PaintBackground(cx, cy, canvas);

            var glyphStartX = PreBeatGlyphStart;
            foreach (var g in _preBeatGlyphs)
            {
                g.Paint(cx + X + glyphStartX, cy + Y, canvas);
            }

            glyphStartX = BeatGlyphsStart;
            foreach (var c in _voiceContainers.Values)
            {
                c.Paint(cx + X + glyphStartX, cy + Y, canvas);
            }

            glyphStartX = Width - PostBeatGlyphsWidth;
            foreach (var g in _postBeatGlyphs)
            {
                g.Paint(cx + X + glyphStartX, cy + Y, canvas);
            }
        }

        protected virtual void PaintBackground(int cx, int cy, ICanvas canvas)
        {

        }

        public override void BuildBoundingsLookup(BoundingsLookup lookup,
                int visualTop, int visualHeight,
                int realTop, int realHeight, int x)
        {
            base.BuildBoundingsLookup(lookup, visualTop, visualHeight, realTop, realHeight, x);
            var barLookup = lookup.Bars[lookup.Bars.Count - 1];
            var beatStart = BeatGlyphsStart;
            foreach (var c in _voiceContainers.Values)
            {
                foreach (var bc in c.BeatGlyphs)
                {
                    var beatLookup = new BeatBoundings();
                    beatLookup.Beat = bc.Beat;
                    // on beat bounding rectangle
                    beatLookup.VisualBounds = new Bounds(
                    x + Stave.X + X + beatStart + c.X + bc.X + bc.OnNotes.X, visualTop,
                    bc.OnNotes.Width, visualHeight);
                    // real beat boundings
                    beatLookup.Bounds = new Bounds(
                    x + Stave.X + X + beatStart + c.X + bc.X, realTop,
                    bc.Width, realHeight);
                    barLookup.Beats.Add(beatLookup);
                }
            }
        }
    }
}
