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
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This renderer is responsible for displaying effects above or below the other staves
    /// like the vibrato. 
    /// </summary>
    public class EffectBarRenderer : BarRendererBase
    {
        private readonly IEffectBarRendererInfo _info;
        private readonly FastList<FastList<EffectGlyph>> _uniqueEffectGlyphs;
        private readonly FastList<FastDictionary<int, EffectGlyph>> _effectGlyphs;

        public EffectBarRenderer(Bar bar, IEffectBarRendererInfo info)
            : base(bar)
        {
            _info = info;
            _uniqueEffectGlyphs = new FastList<FastList<EffectGlyph>>();
            _effectGlyphs = new FastList<FastDictionary<int, EffectGlyph>>();
        }

        public override void DoLayout()
        {
            base.DoLayout();
            if (Index == 0)
            {
                Staff.TopSpacing = 5;
                Staff.BottomSpacing = 5;
            }
            Height = _info.GetHeight(this);
        }

        public override void FinalizeRenderer(ScoreLayout layout)
        {
            base.FinalizeRenderer(layout);
            // after all layouting and sizing place and size the effect glyphs
            IsEmpty = true;

            foreach (var voice in Bar.Voices)
            {
                foreach (var key in _effectGlyphs[voice.Index].Keys)
                {
                    AlignGlyph(_info.SizingMode, voice.Beats[key]);
                    IsEmpty = false;
                }
            }
        }

        private void AlignGlyph(EffectBarGlyphSizing sizing, Beat beat)
        {
            EffectGlyph g = _effectGlyphs[beat.Voice.Index][beat.Index];
            Glyph pos;
            var container = GetBeatContainer(beat);
            switch (sizing)
            {
                case EffectBarGlyphSizing.SinglePreBeat:
                    pos = container.PreNotes;
                    g.X = BeatGlyphsStart + pos.X + container.X;
                    g.Width = pos.Width;
                    break;

                case EffectBarGlyphSizing.SingleOnBeat:
                case EffectBarGlyphSizing.GroupedOnBeat: // grouping is achieved by linking the normaly aligned glyphs
                    pos = container.OnNotes;
                    g.X = BeatGlyphsStart + pos.X + container.X;
                    g.Width = pos.Width;
                    break;
            }
        }

        protected override void CreatePreBeatGlyphs()
        {
        }

        protected override void CreateBeatGlyphs()
        {
            foreach (var voice in Bar.Voices)
            {
                _effectGlyphs.Add(new FastDictionary<int, EffectGlyph>());
                _uniqueEffectGlyphs.Add(new FastList<EffectGlyph>());
                CreateVoiceGlyphs(voice);
            }
        }

        private void CreateVoiceGlyphs(Voice v)
        {
            foreach (var b in v.Beats)
            {
                // we create empty glyphs as alignment references and to get the 
                // effect bar sized
                var container = new BeatContainerGlyph(b, GetOrCreateVoiceContainer(v), true);
                container.PreNotes = new BeatGlyphBase();
                container.OnNotes = new BeatOnNoteGlyphBase();
                AddBeatGlyph(container);

                if (_info.ShouldCreateGlyph(this, b))
                {
                    CreateOrResizeGlyph(_info.SizingMode, b);
                }
            }
        }

        private EffectGlyph CreateOrResizeGlyph(EffectBarGlyphSizing sizing, Beat b)
        {
            switch (sizing)
            {
                case EffectBarGlyphSizing.SinglePreBeat:
                case EffectBarGlyphSizing.SingleOnBeat:
                    var g = _info.CreateNewGlyph(this, b);
                    g.Renderer = this;
                    g.Beat = b;
                    g.DoLayout();
                    _effectGlyphs[b.Voice.Index][b.Index] = g;
                    _uniqueEffectGlyphs[b.Voice.Index].Add(g);
                    return g;

                case EffectBarGlyphSizing.GroupedOnBeat:
                    if (b.Index > 0 || Index > 0)
                    {
                        // check if the previous beat also had this effect
                        Beat prevBeat = b.PreviousBeat;
                        if (_info.ShouldCreateGlyph(this, prevBeat))
                        {
                            // first load the effect bar renderer and glyph
                            EffectBarRenderer previousRenderer = null;
                            EffectGlyph prevEffect = null;

                            if (b.Index > 0 && _effectGlyphs[b.Voice.Index].ContainsKey(prevBeat.Index))
                            {
                                // load effect from previous beat in the same renderer
                                prevEffect = _effectGlyphs[b.Voice.Index][prevBeat.Index];
                            }
                            else if (Index > 0)
                            {
                                // load the effect from the previous renderer if possible. 
                                previousRenderer = (EffectBarRenderer)Staff.BarRenderers[Index - 1];
                                var voiceGlyphs = previousRenderer._effectGlyphs[b.Voice.Index];
                                if (voiceGlyphs.ContainsKey(prevBeat.Index))
                                {
                                    prevEffect = voiceGlyphs[prevBeat.Index];
                                }
                            }

                            // if the effect cannot be expanded, create a new glyph
                            // in case of expansion also create a new glyph, but also link the glyphs together 
                            // so for rendering it might be expanded. 
                            EffectGlyph newGlyph = CreateOrResizeGlyph(EffectBarGlyphSizing.SingleOnBeat, b);

                            if (prevEffect != null && _info.CanExpand(this, prevBeat, b))
                            {
                                // link glyphs 
                                prevEffect.NextGlyph = newGlyph;
                                newGlyph.PreviousGlyph = prevEffect;

                                // mark renderers as linked for consideration when layouting the renderers (line breaking, partial breaking)
                                if (previousRenderer != null)
                                {
                                    IsLinkedToPrevious = true;
                                }
                            }

                            return newGlyph;
                        }

                        // in case the previous beat did not have the same effect, we simply create a new glyph
                        return CreateOrResizeGlyph(EffectBarGlyphSizing.SingleOnBeat, b);
                    }

                    // in case of the very first beat, we simply create the glyph. 
                    return CreateOrResizeGlyph(EffectBarGlyphSizing.SingleOnBeat, b);
            }

            return null;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy, canvas);

            //canvas.Color = new Color(0, 0, 200, 100);
            //canvas.StrokeRect(cx + X, cy + Y, Width, Height);

            for (int i = 0, j = _uniqueEffectGlyphs.Count; i < j; i++)
            {
                var v = _uniqueEffectGlyphs[i];
                canvas.Color = i == 0
                    ? Resources.MainGlyphColor
                    : Resources.SecondaryGlyphColor;

                for (int k = 0, l = v.Count; k < l; k++)
                {
                    var g = v[k];
                    if (g.Renderer == this)
                    {
                        g.Paint(cx + X, cy + Y, canvas);
                    }
                }
            }
        }
    }
}
