using System;
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Staves;
using AlphaTab.Util;

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// This layout arranges the bars into a fixed width and dynamic height region.
    /// </summary>
    internal class PageViewLayout : ScoreLayout
    {
        // left top right bottom
        public static readonly float[] PagePadding =
        {
            40, 40, 40, 40
        };

        public const float GroupSpacing = 20;

        private FastList<StaveGroup> _groups;
        private FastList<MasterBarsRenderers> _allMasterBarRenderers;
        private FastList<MasterBarsRenderers> _barsFromPreviousGroup;
        private float[] _pagePadding;

        public override string Name => "PageView";

        public PageViewLayout(ScoreRenderer renderer)
            : base(renderer)
        {
            _barsFromPreviousGroup = new FastList<MasterBarsRenderers>();
        }

        protected override void DoLayoutAndRender()
        {
            _pagePadding = Renderer.Settings.Display.Padding;
            if (_pagePadding == null)
            {
                _pagePadding = PagePadding;
            }

            if (_pagePadding.Length == 1)
            {
                _pagePadding = new[]
                {
                    _pagePadding[0], _pagePadding[0], _pagePadding[0], _pagePadding[0]
                };
            }
            else if (_pagePadding.Length == 2)
            {
                _pagePadding = new[]
                {
                    _pagePadding[0], _pagePadding[1], _pagePadding[0], _pagePadding[1]
                };
            }

            var x = _pagePadding[0];
            var y = _pagePadding[1];
            Width = Renderer.Width;
            _allMasterBarRenderers = new FastList<MasterBarsRenderers>();

            //
            // 1. Score Info
            y = LayoutAndRenderScoreInfo(x, y);

            //
            // 2. Chord Diagrms
            y = LayoutAndRenderChordDiagrams(y);

            //
            // 3. One result per StaveGroup
            y = LayoutAndRenderScore(x, y);

            Height = y + _pagePadding[3];
        }

        public override bool SupportsResize => true;

        public override void Resize()
        {
            var x = _pagePadding[0];
            var y = _pagePadding[1];
            Width = Renderer.Width;
            var oldHeight = Height;

            //
            // 1. Score Info
            y = LayoutAndRenderScoreInfo(x, y, oldHeight);

            //
            // 2. Chord Digrams
            y = LayoutAndRenderChordDiagrams(y, oldHeight);

            //
            // 2. One result per StaveGroup
            y = ResizeAndRenderScore(x, y, oldHeight);

            Height = y + _pagePadding[3];
        }

        private float LayoutAndRenderChordDiagrams(float y, float totalHeight = -1)
        {
            if (ChordDiagrams == null)
            {
                return y;
            }

            var res = Renderer.Settings.Display.RenderingResources;

            ChordDiagrams.Width = Width;
            ChordDiagrams.DoLayout();

            var canvas = Renderer.Canvas;
            canvas.BeginRender(Width, ChordDiagrams.Height);
            canvas.Color = res.ScoreInfoColor;
            canvas.TextAlign = TextAlign.Center;

            ChordDiagrams.Paint(0, 0, canvas);

            var result = canvas.EndRender();
            y += ChordDiagrams.Height;
            Renderer.OnPartialRenderFinished(new RenderFinishedEventArgs
            {
                Width = Width,
                Height = ChordDiagrams.Height,
                RenderResult = result,
                TotalWidth = Width,
                TotalHeight = totalHeight < 0 ? y : totalHeight,
                FirstMasterBarIndex = -1,
                LastMasterBarIndex = -1
            });

            return y;
        }

        private float LayoutAndRenderScoreInfo(float x, float y, float totalHeight = -1)
        {
            Logger.Debug(Name, "Layouting score info");

            var scale = Scale;
            var res = Renderer.Settings.Display.RenderingResources;

            var centeredGlyphs = new[]
            {
                HeaderFooterElements.Title, HeaderFooterElements.SubTitle, HeaderFooterElements.Artist,
                HeaderFooterElements.Album, HeaderFooterElements.WordsAndMusic
            };

            for (var i = 0; i < centeredGlyphs.Length; i++)
            {
                if (ScoreInfoGlyphs.ContainsKey(centeredGlyphs[i]))
                {
                    var glyph = ScoreInfoGlyphs[centeredGlyphs[i]];
                    glyph.X = Width / 2f;
                    glyph.Y = y;
                    glyph.TextAlign = TextAlign.Center;
                    y += glyph.Font.Size;
                }
            }

            var musicOrWords = false;
            float musicOrWordsHeight = 0;
            if (ScoreInfoGlyphs.ContainsKey(HeaderFooterElements.Music))
            {
                var glyph = ScoreInfoGlyphs[HeaderFooterElements.Music];
                glyph.X = Width - _pagePadding[2];
                glyph.Y = y;
                glyph.TextAlign = TextAlign.Right;
                musicOrWords = true;
                musicOrWordsHeight = glyph.Font.Size;
            }

            if (ScoreInfoGlyphs.ContainsKey(HeaderFooterElements.Words))
            {
                var glyph = ScoreInfoGlyphs[HeaderFooterElements.Words];
                glyph.X = x;
                glyph.Y = y;
                glyph.TextAlign = TextAlign.Left;
                musicOrWords = true;
                musicOrWordsHeight = glyph.Font.Size;
            }

            if (musicOrWords)
            {
                y += musicOrWordsHeight;
            }

            if (TuningGlyph != null)
            {
                y += 20 * scale;
                TuningGlyph.X = x;
                TuningGlyph.Y = y;
                y += TuningGlyph.Height;
            }

            y += 20 * scale;

            var canvas = Renderer.Canvas;
            canvas.BeginRender(Width, y);
            canvas.Color = res.ScoreInfoColor;
            canvas.TextAlign = TextAlign.Center;
            foreach (var key in ScoreInfoGlyphs)
            {
                ScoreInfoGlyphs[key].Paint(0, 0, canvas);
            }

            if (TuningGlyph != null)
            {
                TuningGlyph.Paint(0, 0, canvas);
            }

            var result = canvas.EndRender();
            Renderer.OnPartialRenderFinished(new RenderFinishedEventArgs
            {
                Width = Width,
                Height = y,
                RenderResult = result,
                TotalWidth = Width,
                TotalHeight = totalHeight < 0 ? y : totalHeight,
                FirstMasterBarIndex = -1,
                LastMasterBarIndex = -1
            });

            return y;
        }

        private float ResizeAndRenderScore(float x, float y, float oldHeight)
        {
            var canvas = Renderer.Canvas;

            // if we have a fixed number of bars per row, we only need to refit them.
            if (Renderer.Settings.Display.BarsPerRow != -1)
            {
                for (var i = 0; i < _groups.Count; i++)
                {
                    var group = _groups[i];
                    FitGroup(group);
                    group.FinalizeGroup();

                    y += PaintGroup(group, oldHeight, canvas);
                }
            }
            // if the bars per row are flexible, we need to recreate the stave groups
            // by readding the existing groups
            else
            {
                _groups = new FastList<StaveGroup>();

                var currentIndex = 0;
                var maxWidth = MaxWidth;

                var group = CreateEmptyStaveGroup();
                group.Index = _groups.Count;
                group.X = x;
                group.Y = y;

                while (currentIndex < _allMasterBarRenderers.Count)
                {
                    // if the current renderer still has space in the current group add it
                    // also force adding in case the group is empty
                    var renderers = _allMasterBarRenderers[currentIndex];
                    if (group.Width + renderers.Width <= maxWidth || group.MasterBarsRenderers.Count == 0)
                    {
                        group.AddMasterBarRenderers(Renderer.Tracks, renderers);
                        // move to next group
                        currentIndex++;
                    }
                    else
                    {
                        // if we cannot wrap on the current bar, we remove the last bar
                        // (this might even remove multiple ones until we reach a bar that can wrap);
                        while (renderers != null && !renderers.CanWrap && group.MasterBarsRenderers.Count > 1)
                        {
                            renderers = group.RevertLastBar();
                            currentIndex--;
                        }

                        // in case we do not have space, we create a new group
                        group.IsFull = true;
                        group.IsLast = LastBarIndex == group.LastBarIndex;
                        _groups.Add(group);
                        FitGroup(group);
                        group.FinalizeGroup();
                        y += PaintGroup(group, oldHeight, canvas);

                        // note: we do not increase currentIndex here to have it added to the next group
                        group = CreateEmptyStaveGroup();
                        group.Index = _groups.Count;
                        group.X = x;
                        group.Y = y;
                    }
                }

                group.IsLast = LastBarIndex == group.LastBarIndex;

                // don't forget to finish the last group
                FitGroup(group);
                group.FinalizeGroup();
                y += PaintGroup(group, oldHeight, canvas);
            }

            return y;
        }

        private float LayoutAndRenderScore(float x, float y)
        {
            var canvas = Renderer.Canvas;

            var startIndex = FirstBarIndex;
            var currentBarIndex = startIndex;

            var endBarIndex = LastBarIndex;

            _groups = new FastList<StaveGroup>();
            while (currentBarIndex <= endBarIndex)
            {
                // create group and align set proper coordinates
                var group = CreateStaveGroup(currentBarIndex, endBarIndex);
                _groups.Add(group);
                group.X = x;
                group.Y = y;

                currentBarIndex = group.LastBarIndex + 1;

                // finalize group (sizing etc).
                FitGroup(group);
                group.FinalizeGroup();

                Logger.Info(Name, "Rendering partial from bar " + group.FirstBarIndex + " to " + group.LastBarIndex);
                y += PaintGroup(group, y, canvas);
            }

            return y;
        }

        private float PaintGroup(StaveGroup group, float totalHeight, ICanvas canvas)
        {
            // paint into canvas
            var height = group.Height + GroupSpacing * Scale;
            canvas.BeginRender(Width, height);
            Renderer.Canvas.Color = Renderer.Settings.Display.RenderingResources.MainGlyphColor;
            Renderer.Canvas.TextAlign = TextAlign.Left;
            // NOTE: we use this negation trick to make the group paint itself to 0/0 coordinates
            // since we use partial drawing
            group.Paint(0, -group.Y, canvas);

            // calculate coordinates for next group
            totalHeight += height;

            var result = canvas.EndRender();
            var args = new RenderFinishedEventArgs();
            args.TotalWidth = Width;
            args.TotalHeight = totalHeight;
            args.Width = Width;
            args.Height = height;
            args.RenderResult = result;
            args.FirstMasterBarIndex = group.FirstBarIndex;
            args.LastMasterBarIndex = group.LastBarIndex;

            Renderer.OnPartialRenderFinished(args);

            return height;
        }

        /// <summary>
        /// Realignes the bars in this line according to the available space
        /// </summary>
        private void FitGroup(StaveGroup group)
        {
            if (group.IsFull || group.Width > MaxWidth)
            {
                group.ScaleToWidth(MaxWidth);
            }

            Width = Math.Max(Width, group.Width);
        }

        private StaveGroup CreateStaveGroup(int currentBarIndex, int endIndex)
        {
            var group = CreateEmptyStaveGroup();
            group.Index = _groups.Count;

            var barsPerRow = Renderer.Settings.Display.BarsPerRow;

            var maxWidth = MaxWidth;
            var end = endIndex + 1;
            for (var i = currentBarIndex; i < end; i++)
            {
                if (_barsFromPreviousGroup.Count > 0)
                {
                    foreach (var renderer in _barsFromPreviousGroup)
                    {
                        group.AddMasterBarRenderers(Renderer.Tracks, renderer);
                        i = renderer.MasterBar.Index;
                    }
                }
                else
                {
                    var renderers = group.AddBars(Renderer.Tracks, i);
                    _allMasterBarRenderers.Add(renderers);
                }

                _barsFromPreviousGroup = new FastList<MasterBarsRenderers>();

                var groupIsFull = false;

                // can bar placed in this line?
                if (barsPerRow == -1 && group.Width >= maxWidth && group.MasterBarsRenderers.Count != 0)
                {
                    groupIsFull = true;
                }
                else if (group.MasterBarsRenderers.Count == barsPerRow + 1)
                {
                    groupIsFull = true;
                }

                if (groupIsFull)
                {
                    var reverted = group.RevertLastBar();
                    if (reverted != null)
                    {
                        _barsFromPreviousGroup.Add(reverted);

                        while (reverted != null && !reverted.CanWrap && group.MasterBarsRenderers.Count > 1)
                        {
                            reverted = group.RevertLastBar();
                            _barsFromPreviousGroup.Add(reverted);
                        }
                    }

                    group.IsFull = true;
                    group.IsLast = false;

                    _barsFromPreviousGroup.Reverse();
                    return group;
                }

                group.X = 0;
            }

            group.IsLast = endIndex == group.LastBarIndex;
            return group;
        }

        private float MaxWidth => Renderer.Width - _pagePadding[0] - _pagePadding[2];
    }
}
