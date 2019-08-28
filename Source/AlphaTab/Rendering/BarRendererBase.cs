using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;
using Staff = AlphaTab.Rendering.Staves.Staff;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This is the base public class for creating blocks which can render bars.
    /// </summary>
    internal class BarRendererBase
    {
        private LeftToRightLayoutingGlyphGroup _preBeatGlyphs;
        private FastDictionary<int, VoiceContainerGlyph> _voiceContainers;
        private LeftToRightLayoutingGlyphGroup _postBeatGlyphs;

        public BarRendererBase NextRenderer
        {
            get
            {
                if (Bar.NextBar == null)
                {
                    return null;
                }

                return ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Staff.StaveId, Bar.NextBar);
            }
        }

        public BarRendererBase PreviousRenderer
        {
            get
            {
                if (Bar.PreviousBar == null)
                {
                    return null;
                }

                return ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Staff.StaveId, Bar.PreviousBar);
            }
        }

        public Staff Staff { get; set; }
        public float X { get; set; }
        public float Y { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
        public int Index { get; set; }

        public float TopOverflow { get; set; }
        public float BottomOverflow { get; set; }

        public BarHelpers Helpers { get; set; }
        public Bar Bar { get; set; }

        /// <summary>
        /// Gets or sets whether this renderer is linked to the next one
        /// by some glyphs like a vibrato effect
        /// </summary>
        public bool IsLinkedToPrevious { get; set; }

        /// <summary>
        /// Gets or sets whether this renderer can wrap to the next line
        /// or it needs to stay connected to the previous one.
        /// (e.g. when having double bar repeats we must not separate the 2 bars)
        /// </summary>
        public bool CanWrap { get; set; }

        public BarRendererBase(ScoreRenderer renderer, Bar bar)
        {
            Bar = bar;
            ScoreRenderer = renderer;
            Helpers = new BarHelpers(bar);
            CanWrap = true;
        }

        public void RegisterOverflowTop(float topOverflow)
        {
            if (topOverflow > TopOverflow)
            {
                TopOverflow = topOverflow;
            }
        }

        public void RegisterOverflowBottom(float bottomOverflow)
        {
            if (bottomOverflow > BottomOverflow)
            {
                BottomOverflow = bottomOverflow;
            }
        }

        public virtual void ScaleToWidth(float width)
        {
            // preBeat and postBeat glyphs do not get resized
            var containerWidth = width - _preBeatGlyphs.Width - _postBeatGlyphs.Width;

            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                c.ScaleToWidth(containerWidth);
            }

            _postBeatGlyphs.X = _preBeatGlyphs.X + _preBeatGlyphs.Width + containerWidth;

            Width = width;
        }

        public RenderingResources Resources => Settings.Display.RenderingResources;

        public ScoreRenderer ScoreRenderer
        {
            get;
            private set;
        }

        public Settings Settings => ScoreRenderer.Settings;

        public float Scale => Settings.Display.Scale;

        private bool _wasFirstOfLine;
        public bool IsFirstOfLine => Index == 0;

        public bool IsLast => Bar.Index == ScoreRenderer.Layout.LastBarIndex;

        public BarLayoutingInfo LayoutingInfo { get; set; }

        public virtual void RegisterLayoutingInfo()
        {
            var info = LayoutingInfo;

            var preSize = _preBeatGlyphs.Width;
            if (info.PreBeatSize < preSize)
            {
                info.PreBeatSize = preSize;
            }

            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                c.RegisterLayoutingInfo(info);
            }

            var postSize = _postBeatGlyphs.Width;
            if (info.PostBeatSize < postSize)
            {
                info.PostBeatSize = postSize;
            }
        }

        private int _appliedLayoutingInfo;

        public virtual bool ApplyLayoutingInfo()
        {
            if (_appliedLayoutingInfo >= LayoutingInfo.Version)
            {
                return false;
            }

            _appliedLayoutingInfo = LayoutingInfo.Version;
            // if we need additional space in the preBeat group we simply
            // add a new spacer
            _preBeatGlyphs.Width = LayoutingInfo.PreBeatSize;

            // on beat glyphs we apply the glyph spacing
            var voiceEnd = _preBeatGlyphs.X + _preBeatGlyphs.Width;
            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                c.X = _preBeatGlyphs.X + _preBeatGlyphs.Width;
                c.ApplyLayoutingInfo(LayoutingInfo);
                var newEnd = c.X + c.Width;
                if (voiceEnd < newEnd)
                {
                    voiceEnd = newEnd;
                }
            }

            // on the post glyphs we add the spacing before all other glyphs
            _postBeatGlyphs.X = (float)Math.Floor(voiceEnd);
            _postBeatGlyphs.Width = LayoutingInfo.PostBeatSize;

            Width = (float)Math.Ceiling(_postBeatGlyphs.X + _postBeatGlyphs.Width);
            return true;
        }

        public bool IsFinalized { get; private set; }

        public virtual void FinalizeRenderer()
        {
            IsFinalized = true;
        }

        /// <summary>
        /// Gets the top padding for the main content of the renderer.
        /// Can be used to specify where i.E. the score lines of the notation start.
        /// </summary>
        /// <returns></returns>
        public float TopPadding
        {
            get;
            set;
        }

        /// <summary>
        /// Gets the bottom padding for the main content of the renderer.
        /// Can be used to specify where i.E. the score lines of the notation end.
        /// </summary>
        public float BottomPadding
        {
            get;
            set;
        }

        public virtual void DoLayout()
        {
            _preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
            _preBeatGlyphs.Renderer = this;
            _voiceContainers = new FastDictionary<int, VoiceContainerGlyph>();
            _postBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
            _postBeatGlyphs.Renderer = this;

            for (var i = 0; i < Bar.Voices.Count; i++)
            {
                var voice = Bar.Voices[i];
                if (HasVoiceContainer(voice))
                {
                    var c = new VoiceContainerGlyph(0, 0, voice);
                    c.Renderer = this;
                    _voiceContainers[Bar.Voices[i].Index] = c;
                }
            }

            if (Bar.SimileMark == SimileMark.SecondOfDouble)
            {
                CanWrap = false;
            }

            CreatePreBeatGlyphs();
            CreateBeatGlyphs();
            CreatePostBeatGlyphs();

            UpdateSizes();
        }

        protected virtual bool HasVoiceContainer(Voice voice)
        {
            return !voice.IsEmpty || voice.Index == 0;
        }

        protected virtual void UpdateSizes()
        {
            Staff.RegisterStaffTop(TopPadding);
            Staff.RegisterStaffBottom(Height - BottomPadding);

            var voiceContainers = _voiceContainers;
            var beatGlyphsStart = BeatGlyphsStart;
            var postBeatStart = beatGlyphsStart;
            foreach (var voice in voiceContainers)
            {
                var c = voiceContainers[voice];
                c.X = beatGlyphsStart;
                c.DoLayout();
                var x = c.X + c.Width;
                if (postBeatStart < x)
                {
                    postBeatStart = x;
                }
            }

            _postBeatGlyphs.X = (float)Math.Floor(postBeatStart);

            Width = (float)Math.Ceiling(_postBeatGlyphs.X + _postBeatGlyphs.Width);
        }

        protected void AddPreBeatGlyph(Glyph g)
        {
            _preBeatGlyphs.AddGlyph(g);
        }

        protected virtual void AddBeatGlyph(BeatContainerGlyph g)
        {
            g.Renderer = this;
            g.PreNotes.Renderer = this;
            g.OnNotes.Renderer = this;
            g.OnNotes.BeamingHelper = Helpers.BeamHelperLookup[g.Beat.Voice.Index][g.Beat.Index];
            GetOrCreateVoiceContainer(g.Beat.Voice).AddGlyph(g);
        }

        protected VoiceContainerGlyph GetOrCreateVoiceContainer(Voice voice)
        {
            return _voiceContainers[voice.Index];
        }

        public BeatContainerGlyph GetBeatContainer(Beat beat)
        {
            return GetOrCreateVoiceContainer(beat.Voice).BeatGlyphs[beat.Index];
        }

        public BeatGlyphBase GetPreNotesGlyphForBeat(Beat beat)
        {
            return GetBeatContainer(beat).PreNotes;
        }

        public BeatGlyphBase GetOnNotesGlyphForBeat(Beat beat)
        {
            return GetBeatContainer(beat).OnNotes;
        }

        public virtual void Paint(float cx, float cy, ICanvas canvas)
        {
            PaintBackground(cx, cy, canvas);

            canvas.Color = Resources.MainGlyphColor;

            _preBeatGlyphs.Paint(cx + X, cy + Y, canvas);

            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                canvas.Color = c.Voice.Index == 0
                    ? Resources.MainGlyphColor
                    : Resources.SecondaryGlyphColor;
                c.Paint(cx + X, cy + Y, canvas);
            }


            canvas.Color = Resources.MainGlyphColor;
            _postBeatGlyphs.Paint(cx + X, cy + Y, canvas);
        }

        protected virtual void PaintBackground(float cx, float cy, ICanvas canvas)
        {
            //canvas.Color = Color.Random();
            //canvas.FillRect(cx + X, cy + Y - TopOverflow, Width, Height + TopOverflow + BottomOverflow);
        }

        public virtual void BuildBoundingsLookup(MasterBarBounds masterBarBounds, float cx, float cy)
        {
            var barBounds = new BarBounds();
            barBounds.Bar = Bar;
            barBounds.VisualBounds = new Bounds
            {
                X = cx + X,
                Y = cy + Y + TopPadding,
                W = Width,
                H = Height - TopPadding - BottomPadding
            };
            barBounds.RealBounds = new Bounds
            {
                X = cx + X,
                Y = cy + Y,
                W = Width,
                H = Height
            };
            masterBarBounds.AddBar(barBounds);

            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                var isEmptyBar = Bar.IsEmpty && voice == 0;
                if (!c.Voice.IsEmpty || isEmptyBar)
                {
                    for (int i = 0, j = c.BeatGlyphs.Count; i < j; i++)
                    {
                        var bc = c.BeatGlyphs[i];

                        var beatBoundings = new BeatBounds();
                        beatBoundings.Beat = bc.Beat;
                        beatBoundings.VisualBounds = new Bounds
                        {
                            X = cx + X + c.X + bc.X + bc.OnNotes.X,
                            Y = barBounds.VisualBounds.Y,
                            W = bc.OnNotes.Width,
                            H = barBounds.VisualBounds.H
                        };
                        beatBoundings.RealBounds = new Bounds
                        {
                            X = cx + X + c.X + bc.X,
                            Y = barBounds.RealBounds.Y,
                            W = bc.Width,
                            H = barBounds.RealBounds.H
                        };

                        if (isEmptyBar)
                        {
                            beatBoundings.VisualBounds.X = cx + X;
                            beatBoundings.RealBounds.X = beatBoundings.VisualBounds.X;
                        }

                        barBounds.AddBeat(beatBoundings);
                    }
                }
            }
        }

        protected void AddPostBeatGlyph(Glyph g)
        {
            _postBeatGlyphs.AddGlyph(g);
        }

        protected virtual void CreatePreBeatGlyphs()
        {
            _wasFirstOfLine = IsFirstOfLine;
        }

        protected virtual void CreateBeatGlyphs()
        {
        }

        protected virtual void CreatePostBeatGlyphs()
        {
        }

        public float BeatGlyphsStart => _preBeatGlyphs.X + _preBeatGlyphs.Width;

        public float PostBeatGlyphsStart => _postBeatGlyphs.X;

        public virtual float GetNoteX(Note note, bool onEnd = true)
        {
            return 0;
        }

        public float GetBeatX(Beat beat, BeatXPosition requestedPosition = BeatXPosition.PreNotes)
        {
            var container = GetBeatContainer(beat);
            if (container != null)
            {
                switch (requestedPosition)
                {
                    case BeatXPosition.PreNotes:
                        return container.VoiceContainer.X + container.X;
                    case BeatXPosition.OnNotes:
                        return container.VoiceContainer.X + container.X + container.OnNotes.X;
                    case BeatXPosition.MiddleNotes:
                        return container.VoiceContainer.X + container.X + container.OnTimeX;
                    case BeatXPosition.PostNotes:
                        return container.VoiceContainer.X + container.X + container.OnNotes.X + container.OnNotes.Width;
                    case BeatXPosition.EndBeat:
                        return container.VoiceContainer.X + container.X + container.Width;
                }
            }

            return 0;
        }

        public virtual float GetNoteY(Note note, bool aboveNote = false)
        {
            return 0;
        }

        public void ReLayout()
        {
            // there are some glyphs which are shown only for renderers at the line start, so we simply recreate them
            // but we only need to recreate them for the renderers that were the first of the line or are now the first of the line
            if (_wasFirstOfLine && !IsFirstOfLine || !_wasFirstOfLine && IsFirstOfLine)
            {
                _preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
                _preBeatGlyphs.Renderer = this;
                CreatePreBeatGlyphs();
            }

            UpdateSizes();
            RegisterLayoutingInfo();
        }

        protected void PaintSimileMark(float cx, float cy, ICanvas canvas)
        {
            switch (Bar.SimileMark)
            {
                case SimileMark.Simple:
                    canvas.FillMusicFontSymbol(cx + X + (Width - 20 * Scale) / 2,
                        cy + Y + Height / 2,
                        1,
                        MusicFontSymbol.SimileMarkSimple);
                    break;
                case SimileMark.SecondOfDouble:
                    canvas.FillMusicFontSymbol(cx + X - 28 * Scale / 2,
                        cy + Y + Height / 2,
                        1,
                        MusicFontSymbol.SimileMarkDouble);
                    break;
            }
        }
    }

    /// <summary>
    /// Lists the different position modes for <see cref="BarRendererBase.GetBeatX"/>
    /// </summary>
    internal enum BeatXPosition
    {
        /// <summary>
        /// Gets the pre-notes position which is located before the accidentals
        /// </summary>
        PreNotes,

        /// <summary>
        /// Gets the on-notes position which is located after the accidentals but before the note heads.
        /// </summary>
        OnNotes,

        /// <summary>
        /// Gets the middel-notes position which is located after in the middle the note heads.
        /// </summary>
        MiddleNotes,

        /// <summary>
        /// Get the post-notes position which is located at after the note heads.
        /// </summary>
        PostNotes,

        /// <summary>
        /// Get the end-beat position which is located at the end of the beat. This position is almost
        /// equal to the pre-notes position of the next beat.
        /// </summary>
        EndBeat
    }
}
