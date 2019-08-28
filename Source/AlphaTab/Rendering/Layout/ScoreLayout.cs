using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Staves;
using AlphaTab.Util;
using Staff = AlphaTab.Rendering.Staves.Staff;

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// This is the base public class for creating new layouting engines for the score renderer.
    /// </summary>
    internal abstract class ScoreLayout
    {
        private readonly FastDictionary<string, FastDictionary<int, BarRendererBase>> _barRendererLookup;

        public ScoreRenderer Renderer { get; set; }

        public abstract string Name { get; }
        public float Width { get; set; }
        public float Height { get; set; }

        protected FastDictionary<HeaderFooterElements, TextGlyph> ScoreInfoGlyphs;
        protected ChordDiagramContainerGlyph ChordDiagrams;
        protected TuningGlyph TuningGlyph;


        protected ScoreLayout(ScoreRenderer renderer)
        {
            Renderer = renderer;
            _barRendererLookup = new FastDictionary<string, FastDictionary<int, BarRendererBase>>();
        }


        public abstract bool SupportsResize { get; }
        public abstract void Resize();

        public void LayoutAndRender()
        {
            var score = Renderer.Score;
            var startIndex = Renderer.Settings.Display.StartBar;
            startIndex--; // map to array index
            startIndex = Math.Min(score.MasterBars.Count - 1, Math.Max(0, startIndex));
            FirstBarIndex = startIndex;

            var endBarIndex = Renderer.Settings.Display.BarCount;
            if (endBarIndex < 0)
            {
                endBarIndex = score.MasterBars.Count;
            }

            endBarIndex = startIndex + endBarIndex - 1; // map count to array index
            endBarIndex = Math.Min(score.MasterBars.Count - 1, Math.Max(0, endBarIndex));
            LastBarIndex = endBarIndex;

            CreateScoreInfoGlyphs();
            DoLayoutAndRender();
        }

        protected abstract void DoLayoutAndRender();

        private void CreateScoreInfoGlyphs()
        {
            Logger.Info("ScoreLayout", "Creating score info glyphs");

            var flags = Renderer.Settings.Notation.HideInfo
                ? HeaderFooterElements.None
                : HeaderFooterElements.All;
            var score = Renderer.Score;
            var res = Renderer.Settings.Display.RenderingResources;

            ScoreInfoGlyphs = new FastDictionary<HeaderFooterElements, TextGlyph>();
            if (!string.IsNullOrEmpty(score.Title) && (flags & HeaderFooterElements.Title) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.Title] =
                    new TextGlyph(0, 0, score.Title, res.TitleFont, TextAlign.Center);
            }

            if (!string.IsNullOrEmpty(score.SubTitle) && (flags & HeaderFooterElements.SubTitle) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.SubTitle] =
                    new TextGlyph(0, 0, score.SubTitle, res.SubTitleFont, TextAlign.Center);
            }

            if (!string.IsNullOrEmpty(score.Artist) && (flags & HeaderFooterElements.Artist) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.Artist] =
                    new TextGlyph(0, 0, score.Artist, res.SubTitleFont, TextAlign.Center);
            }

            if (!string.IsNullOrEmpty(score.Album) && (flags & HeaderFooterElements.Album) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.Album] =
                    new TextGlyph(0, 0, score.Album, res.SubTitleFont, TextAlign.Center);
            }

            if (!string.IsNullOrEmpty(score.Music) && score.Music == score.Words &&
                (flags & HeaderFooterElements.WordsAndMusic) != 0)
            {
                ScoreInfoGlyphs[HeaderFooterElements.WordsAndMusic] = new TextGlyph(0,
                    0,
                    "Music and Words by " + score.Words,
                    res.WordsFont,
                    TextAlign.Center);
            }
            else
            {
                if (!string.IsNullOrEmpty(score.Music) && (flags & HeaderFooterElements.Music) != 0)
                {
                    ScoreInfoGlyphs[HeaderFooterElements.Music] = new TextGlyph(0,
                        0,
                        "Music by " + score.Music,
                        res.WordsFont,
                        TextAlign.Right);
                }

                if (!string.IsNullOrEmpty(score.Words) && (flags & HeaderFooterElements.Words) != 0)
                {
                    ScoreInfoGlyphs[HeaderFooterElements.Words] = new TextGlyph(0,
                        0,
                        "Words by " + score.Words,
                        res.WordsFont,
                        TextAlign.Left);
                }
            }

            if (!Renderer.Settings.Notation.HideTuning)
            {
                Model.Staff staffWithTuning = null;
                foreach (var track in Renderer.Tracks)
                {
                    foreach (var staff in track.Staves)
                    {
                        if (!staff.IsPercussion && staff.IsStringed && staff.Tuning.Length > 0)
                        {
                            staffWithTuning = staff;
                            break;
                        }
                    }

                    if (staffWithTuning != null)
                    {
                        break;
                    }
                }

                // tuning info
                if (staffWithTuning != null)
                {
                    var tuning = Tuning.FindTuning(staffWithTuning.Tuning);
                    if (tuning != null)
                    {
                        TuningGlyph = new TuningGlyph(0, 0, Scale, res, tuning);
                    }
                }
            }

            // chord diagram glyphs
            if (!Renderer.Settings.Notation.HideChordDiagram)
            {
                ChordDiagrams = new ChordDiagramContainerGlyph(0, 0);
                ChordDiagrams.Renderer = new BarRendererBase(Renderer, null);
                var chords = new FastDictionary<string, Chord>();
                foreach (var track in Renderer.Tracks)
                {
                    foreach (var staff in track.Staves)
                    {
                        foreach (var chordId in staff.Chords)
                        {
                            if (!chords.ContainsKey(chordId))
                            {
                                var chord = staff.Chords[chordId];
                                if (chord.ShowDiagram)
                                {
                                    chords[chordId] = chord;
                                    ChordDiagrams.AddChord(chord);
                                }
                            }
                        }
                    }
                }
            }
        }

        public float Scale => Renderer.Settings.Display.Scale;

        public int FirstBarIndex { get; private set; }
        public int LastBarIndex { get; private set; }

        protected StaveGroup CreateEmptyStaveGroup()
        {
            var group = new StaveGroup();
            group.Layout = this;


            for (var trackIndex = 0; trackIndex < Renderer.Tracks.Length; trackIndex++)
            {
                var track = Renderer.Tracks[trackIndex];
                var hasScore = false;
                foreach (var staff in track.Staves)
                {
                    if (staff.ShowStandardNotation)
                    {
                        hasScore = true;
                        break;
                    }
                }


                for (var staffIndex = 0; staffIndex < track.Staves.Count; staffIndex++)
                {
                    var staff = track.Staves[staffIndex];

                    // use optimal profile for track
                    StaveProfile staveProfile;
                    if (staff.IsPercussion)
                    {
                        staveProfile = StaveProfile.Score;
                    }
                    else if (Renderer.Settings.Display.StaveProfile != StaveProfile.Default)
                    {
                        staveProfile = Renderer.Settings.Display.StaveProfile;
                    }
                    else if (staff.ShowTablature && staff.ShowStandardNotation)
                    {
                        staveProfile = StaveProfile.ScoreTab;
                    }
                    else if (staff.ShowTablature)
                    {
                        staveProfile = hasScore ? StaveProfile.TabMixed : StaveProfile.Tab;
                    }
                    else if (staff.ShowStandardNotation)
                    {
                        staveProfile = StaveProfile.Score;
                    }
                    else
                    {
                        continue;
                    }

                    var profile = Environment.StaveProfiles[staveProfile];

                    foreach (var factory in profile)
                    {
                        if (factory.CanCreate(track, staff))
                        {
                            group.AddStaff(track, new Staff(trackIndex, staff, factory));
                        }
                    }
                }
            }

            return group;
        }

        public void RegisterBarRenderer(string key, BarRendererBase renderer)
        {
            if (!_barRendererLookup.ContainsKey(key))
            {
                _barRendererLookup[key] = new FastDictionary<int, BarRendererBase>();
            }

            _barRendererLookup[key][renderer.Bar.Id] = renderer;
        }

        public void UnregisterBarRenderer(string key, BarRendererBase renderer)
        {
            if (_barRendererLookup.ContainsKey(key))
            {
                var lookup = _barRendererLookup[key];
                lookup.Remove(renderer.Bar.Id);
            }
        }

        public T GetRendererForBar<T>(string key, Bar bar)
            where T : BarRendererBase
        {
            var barRendererId = bar.Id;
            if (_barRendererLookup.ContainsKey(key) && _barRendererLookup[key].ContainsKey(barRendererId))
            {
                return (T)_barRendererLookup[key][barRendererId];
            }

            return null;
        }

        public void RenderAnnotation()
        {
            // attention, you are not allowed to remove change this notice within any version of this library without permission!
            var msg = "rendered by alphaTab (https://alphaTab.net)";

            var canvas = Renderer.Canvas;
            var resources = Renderer.Settings.Display.RenderingResources;

            var size = 12 * Renderer.Settings.Display.Scale;
            var height = size * 2;
            Height += height;
            var x = Width / 2;

            canvas.BeginRender(Width, height);
            canvas.Color = resources.MainGlyphColor;
            canvas.Font = new Font(resources.CopyrightFont.Family, size, FontStyle.Bold);
            canvas.TextAlign = TextAlign.Center;
            canvas.FillText(msg, x, size);
            var result = canvas.EndRender();
            Renderer.OnPartialRenderFinished(new RenderFinishedEventArgs
            {
                Width = Width,
                Height = height,
                RenderResult = result,
                TotalWidth = Width,
                TotalHeight = Height,
                FirstMasterBarIndex = -1,
                LastMasterBarIndex = -1
            });
        }
    }
}
