using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    class TabBeatContainerGlyph : BeatContainerGlyph
    {
        private TabBendGlyph _bend;
        private FastList<TabSlurGlyph> _effectSlurs;

        public TabBeatContainerGlyph(Beat beat, VoiceContainerGlyph voiceContainer)
            : base(beat, voiceContainer)
        {
        }

        public override void DoLayout()
        {
            _effectSlurs = new FastList<TabSlurGlyph>();
            base.DoLayout();
            if (_bend != null)
            {
                _bend.Renderer = Renderer;
                _bend.DoLayout();
                UpdateWidth();
            }
        }

        protected override void CreateTies(Note n)
        {
            if (!n.IsVisible) return;

            var renderer = (TabBarRenderer)Renderer;
            if (n.IsTieOrigin && renderer.ShowTiedNotes && n.TieDestination.IsVisible)
            {
                var tie = new TabTieGlyph(n, n.TieDestination, false);
                Ties.Add(tie);
            }
            if (n.IsTieDestination && renderer.ShowTiedNotes)
            {
                var tie = new TabTieGlyph(n.TieOrigin, n, false, true);
                Ties.Add(tie);
            }

            // start effect slur on first beat
            if (n.IsEffectSlurOrigin && n.EffectSlurDestination != null)
            {
                var expanded = false;
                foreach (var slur in _effectSlurs)
                {
                    if (slur.TryExpand(n, n.EffectSlurDestination, false, false))
                    {
                        expanded = true;
                        break;
                    }
                }

                if (!expanded)
                {
                    var effectSlur = new TabSlurGlyph(n, n.EffectSlurDestination, false, false);
                    _effectSlurs.Add(effectSlur);
                    Ties.Add(effectSlur);
                }
            }
            // end effect slur on last beat
            if (n.IsEffectSlurDestination && n.EffectSlurOrigin != null)
            {
                var expanded = false;
                foreach (var slur in _effectSlurs)
                {
                    if (slur.TryExpand(n.EffectSlurOrigin, n, false, true))
                    {
                        expanded = true;
                        break;
                    }
                }

                if (!expanded)
                {
                    var effectSlur = new TabSlurGlyph(n.EffectSlurOrigin, n, false, true);
                    _effectSlurs.Add(effectSlur);
                    Ties.Add(effectSlur);
                }
            }

            if (n.SlideType != SlideType.None)
            {
                var l = new TabSlideLineGlyph(n.SlideType, n, this);
                Ties.Add(l);
            }

            if (n.HasBend)
            {
                if (_bend == null)
                {
                    _bend = new TabBendGlyph(n.Beat);
                    _bend.Renderer = Renderer;
                    Ties.Add(_bend);
                }
                _bend.AddBends(n);
            }
        }
    }
}
