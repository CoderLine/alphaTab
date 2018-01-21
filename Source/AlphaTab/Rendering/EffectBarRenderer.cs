/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering
{
    public class EffectBand : Glyph
    {
        private FastList<FastList<EffectGlyph>> _uniqueEffectGlyphs;
        private FastList<FastDictionary<int, EffectGlyph>> _effectGlyphs;

        public bool IsEmpty { get; set; }
        public EffectBand PreviousBand { get; set; }
        public bool IsLinkedToPrevious { get; set; }
        public Beat FirstBeat { get; set; }
        public Beat LastBeat { get; set; }
        public float Height { get; set; }
        public IEffectBarRendererInfo Info { get; set; }

        public EffectBand(IEffectBarRendererInfo info)
            : base(0, 0)
        {
            Info = info;
            _uniqueEffectGlyphs = new FastList<FastList<EffectGlyph>>();
            _effectGlyphs = new FastList<FastDictionary<int, EffectGlyph>>();
            IsEmpty = true;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            for (int i = 0; i < Renderer.Bar.Voices.Count; i++)
            {
                _effectGlyphs.Add(new FastDictionary<int, EffectGlyph>());
                _uniqueEffectGlyphs.Add(new FastList<EffectGlyph>());
            }
        }

        public void CreateGlyph(Beat beat)
        {
            // NOTE: the track order will never change. even if the staff behind the renderer changes, the trackIndex will not. 
            // so it's okay to access the staff here while creating the glyphs. 
            if (Info.ShouldCreateGlyph(beat) && (!Info.HideOnMultiTrack || Renderer.Staff.TrackIndex == 0))
            {
                IsEmpty = false;
                if (FirstBeat == null || FirstBeat.Index > beat.Index)
                {
                    FirstBeat = beat;
                }
                if (LastBeat == null || LastBeat.Index < beat.Index)
                {
                    LastBeat = beat;
                }

                var glyph = CreateOrResizeGlyph(Info.SizingMode, beat);
                if (glyph.Height > Height)
                {
                    Height = glyph.Height;
                }
            }
        }

        private EffectGlyph CreateOrResizeGlyph(EffectBarGlyphSizing sizing, Beat b)
        {
            EffectGlyph g;
            switch (sizing)
            {
                case EffectBarGlyphSizing.FullBar:
                    g = Info.CreateNewGlyph(Renderer, b);
                    g.Renderer = Renderer;
                    g.Beat = b;
                    g.DoLayout();
                    _effectGlyphs[b.Voice.Index][b.Index] = g;
                    _uniqueEffectGlyphs[b.Voice.Index].Add(g);
                    return g;
                case EffectBarGlyphSizing.SinglePreBeat:
                case EffectBarGlyphSizing.SingleOnBeat:
                    g = Info.CreateNewGlyph(Renderer, b);
                    g.Renderer = Renderer;
                    g.Beat = b;
                    g.DoLayout();
                    _effectGlyphs[b.Voice.Index][b.Index] = g;
                    _uniqueEffectGlyphs[b.Voice.Index].Add(g);
                    return g;

                case EffectBarGlyphSizing.GroupedOnBeat:
                    if (b.Index > 0 || Renderer.Index > 0)
                    {
                        // check if the previous beat also had this effect
                        Beat prevBeat = b.PreviousBeat;
                        if (Info.ShouldCreateGlyph(prevBeat))
                        {
                            // first load the effect bar renderer and glyph
                            EffectGlyph prevEffect = null;

                            if (b.Index > 0 && _effectGlyphs[b.Voice.Index].ContainsKey(prevBeat.Index))
                            {
                                // load effect from previous beat in the same renderer
                                prevEffect = _effectGlyphs[b.Voice.Index][prevBeat.Index];
                            }
                            else if (Renderer.Index > 0)
                            {
                                // load the effect from the previous renderer if possible. 
                                var previousRenderer = (EffectBarRenderer)Renderer.PreviousRenderer;
                                var previousBand = previousRenderer.BandLookup[Info.EffectId];
                                var voiceGlyphs = previousBand._effectGlyphs[b.Voice.Index];
                                if (voiceGlyphs.ContainsKey(prevBeat.Index))
                                {
                                    prevEffect = voiceGlyphs[prevBeat.Index];
                                }
                            }

                            // if the effect cannot be expanded, create a new glyph
                            // in case of expansion also create a new glyph, but also link the glyphs together 
                            // so for rendering it might be expanded. 
                            EffectGlyph newGlyph = CreateOrResizeGlyph(EffectBarGlyphSizing.SingleOnBeat, b);

                            if (prevEffect != null && Info.CanExpand(prevBeat, b))
                            {
                                // link glyphs 
                                prevEffect.NextGlyph = newGlyph;
                                newGlyph.PreviousGlyph = prevEffect;

                                // mark renderers as linked for consideration when layouting the renderers (line breaking, partial breaking)
                                IsLinkedToPrevious = true;
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

            //canvas.Color = new Color((byte)Platform.Random(255), (byte)Platform.Random(255), (byte)Platform.Random(255), 100);
            //canvas.FillRect(cx + X, cy + Y, Renderer.Width, Height);

            for (int i = 0, j = _uniqueEffectGlyphs.Count; i < j; i++)
            {
                var v = _uniqueEffectGlyphs[i];
                //canvas.Color = i == 0
                //    ? Renderer.Resources.MainGlyphColor
                //    : Renderer.Resources.SecondaryGlyphColor;

                for (int k = 0, l = v.Count; k < l; k++)
                {
                    var g = v[k];
                    g.Paint(cx + X, cy + Y, canvas);
                }
            }
        }

        public void AlignGlyphs()
        {
            for (int v = 0; v < _effectGlyphs.Count; v++)
            {
                foreach (var key in _effectGlyphs[v])
                {
                    AlignGlyph(Info.SizingMode, Renderer.Bar.Voices[v].Beats[key]);
                }
            }
        }

        private void AlignGlyph(EffectBarGlyphSizing sizing, Beat beat)
        {
            EffectGlyph g = _effectGlyphs[beat.Voice.Index][beat.Index];
            Glyph pos;
            var container = Renderer.GetBeatContainer(beat);
            switch (sizing)
            {
                case EffectBarGlyphSizing.SinglePreBeat:
                    pos = container.PreNotes;
                    g.X = Renderer.BeatGlyphsStart + pos.X + container.X;
                    g.Width = pos.Width;
                    break;

                case EffectBarGlyphSizing.SingleOnBeat:
                case EffectBarGlyphSizing.GroupedOnBeat: // grouping is achieved by linking the normaly aligned glyphs
                    pos = container.OnNotes;
                    g.X = Renderer.BeatGlyphsStart + pos.X + container.X;
                    g.Width = pos.Width;
                    break;

                case EffectBarGlyphSizing.FullBar:
                    g.Width = Renderer.Width;
                    break;
            }
        }
    }

    public class EffectBandSizingInfo
    {
        private readonly FastDictionary<string, EffectBandSlot> _effectSlot;
        public FastList<EffectBandSlot> Slots { get; set; }

        public EffectBandSizingInfo()
        {
            Slots = new FastList<EffectBandSlot>();
            _effectSlot = new FastDictionary<string, EffectBandSlot>();
        }

        public EffectBandSlot GetOrCreateSlot(EffectBand band)
        {
            // first check preferrable slot depending on type
            if (_effectSlot.ContainsKey(band.Info.EffectId))
            {
                var slot = _effectSlot[band.Info.EffectId];
                if (slot.CanBeUsed(band))
                {
                    return slot;
                }
            }

            // find any slot that can be used
            foreach (var slot in Slots)
            {
                if (slot.CanBeUsed(band))
                {
                    return slot;
                }
            }

            // create a new slot if required
            var newSlot = new EffectBandSlot();
            Slots.Add(newSlot);
            return newSlot;
        }

        public void CopySlots(EffectBandSizingInfo sizingInfo)
        {
            foreach (var slot in sizingInfo.Slots)
            {
                var copy = new EffectBandSlot();
                copy.Y = slot.Y;
                copy.Height = slot.Height;
                copy.UniqueEffectId = slot.UniqueEffectId;
                Slots.Add(copy);
                foreach (var band in slot.Bands)
                {
                    _effectSlot[band.Info.EffectId] = copy;
                }
            }
        }

        public void Register(EffectBand effectBand)
        {
            var freeSlot = GetOrCreateSlot(effectBand);
            freeSlot.Update(effectBand);
            _effectSlot[effectBand.Info.EffectId] = freeSlot;
        }
    }
    public class EffectBandSlot
    {
        public float Y { get; set; }
        public float Height { get; set; }
        public Beat FirstBeat { get; set; }
        public Beat LastBeat { get; set; }
        public FastList<EffectBand> Bands { get; set; }
        public string UniqueEffectId { get; set; }

        public EffectBandSlot()
        {
            Bands = new FastList<EffectBand>();
        }

        public void Update(EffectBand effectBand)
        {
            // lock band to particular effect if needed
            if (!effectBand.Info.CanShareBand)
            {
                UniqueEffectId = effectBand.Info.EffectId;
            }
            Bands.Add(effectBand);
            if (effectBand.Height > Height)
            {
                Height = effectBand.Height;
            }
            if (FirstBeat == null || FirstBeat.Index > effectBand.FirstBeat.Index)
            {
                FirstBeat = effectBand.FirstBeat;
            }
            if (LastBeat == null || LastBeat.Index < effectBand.LastBeat.Index)
            {
                LastBeat = effectBand.LastBeat;
            }
        }

        public bool CanBeUsed(EffectBand band)
        {
            return
                // if the current band is marked as unique, only merge with same effect, 
                // if the current band is shared, only merge with same effect 
                ((UniqueEffectId == null && band.Info.CanShareBand) || band.Info.EffectId == UniqueEffectId)
                // only merge if there is space for the new band before or after the current beat
                && (FirstBeat == null || LastBeat.Index < band.FirstBeat.Index || band.LastBeat.Index < FirstBeat.Index);
        }
    }

    /// <summary>
    /// This renderer is responsible for displaying effects above or below the other staves
    /// like the vibrato. 
    /// </summary>
    public class EffectBarRenderer : BarRendererBase
    {
        private readonly IEffectBarRendererInfo[] _infos;
        private EffectBand[] _bands;
        public FastDictionary<string, EffectBand> BandLookup { get; set; }

        public EffectBandSizingInfo SizingInfo { get; set; }

        public EffectBarRenderer(ScoreRenderer renderer, Bar bar, IEffectBarRendererInfo[] infos)
            : base(renderer, bar)
        {
            _infos = infos;
        }

        protected override void UpdateSizes()
        {
            TopOverflow = 0;
            BottomOverflow = 0;
            TopPadding = 0;
            BottomPadding = 0;

            UpdateHeight();

            base.UpdateSizes();
        }

        private void UpdateHeight()
        {
            if (SizingInfo == null) return;

            var y = 0f;
            foreach (var slot in SizingInfo.Slots)
            {
                slot.Y = y;
                foreach (var band in slot.Bands)
                {
                    band.Y = y;
                    band.Height = slot.Height;
                }
                y += slot.Height;
            }

            Height = y;
        }

        public override bool ApplyLayoutingInfo()
        {
            if (!base.ApplyLayoutingInfo()) return false;

            SizingInfo = new EffectBandSizingInfo();
            // we create empty slots for the same group
            if (Index > 0)
            {
                var previousRenderer = (EffectBarRenderer)PreviousRenderer;
                SizingInfo.CopySlots(previousRenderer.SizingInfo);
            }

            foreach (var effectBand in _bands)
            {
                effectBand.AlignGlyphs();
                if (!effectBand.IsEmpty)
                {
                    // find a slot that ended before the start of the band
                    SizingInfo.Register(effectBand);
                }
            }

            UpdateHeight();

            return true;
        }

        public override void ScaleToWidth(float width)
        {
            base.ScaleToWidth(width);
            foreach (var effectBand in _bands)
            {
                effectBand.AlignGlyphs();
            }
        }

        protected override void CreateBeatGlyphs()
        {
            _bands = new EffectBand[_infos.Length];
            BandLookup = new FastDictionary<string, EffectBand>();
            for (int i = 0; i < _infos.Length; i++)
            {
                _bands[i] = new EffectBand(_infos[i]);
                _bands[i].Renderer = this;
                _bands[i].DoLayout();
                BandLookup[_infos[i].EffectId] = _bands[i];
            }

            foreach (var voice in Bar.Voices)
            {
                if (HasVoiceContainer(voice))
                {
                    CreateVoiceGlyphs(voice);
                }
            }

            foreach (var effectBand in _bands)
            {
                if (effectBand.IsLinkedToPrevious)
                {
                    IsLinkedToPrevious = true;
                }
            }
        }
        
        private void CreateVoiceGlyphs(Voice v)
        {
            foreach (var b in v.Beats)
            {
                // we create empty glyphs as alignment references and to get the 
                // effect bar sized
                var container = new BeatContainerGlyph(b, GetOrCreateVoiceContainer(v));
                container.PreNotes = new BeatGlyphBase();
                container.OnNotes = new BeatOnNoteGlyphBase();
                AddBeatGlyph(container);

                foreach (var effectBand in _bands)
                {
                    effectBand.CreateGlyph(b);
                }
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            PaintBackground(cx, cy, canvas);
            canvas.Color = Resources.MainGlyphColor;
            foreach (var effectBand in _bands)
            {
                effectBand.Paint(cx + X, cy + Y, canvas);
            }

            //canvas.Color = new Color(0, 0, 200, 100);
            //canvas.StrokeRect(cx + X, cy + Y, Width, Height);
        }
    }
}
