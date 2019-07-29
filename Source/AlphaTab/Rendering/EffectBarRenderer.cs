using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering
{
    class EffectBand : Glyph
    {
        private FastList<FastList<EffectGlyph>> _uniqueEffectGlyphs;
        private FastList<FastDictionary<int, EffectGlyph>> _effectGlyphs;

        public bool IsEmpty { get; set; }
        public EffectBand PreviousBand { get; set; }
        public bool IsLinkedToPrevious { get; set; }
        public Beat FirstBeat { get; set; }
        public Beat LastBeat { get; set; }
        public float Height { get; set; }
        public Voice Voice { get; set; }

        public IEffectBarRendererInfo Info { get; set; }
        public EffectBandSlot Slot { get; set; }

        public EffectBand(Voice voice, IEffectBarRendererInfo info)
            : base(0, 0)
        {
            Voice = voice;
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
            if (beat.Voice != Voice) return;

            // NOTE: the track order will never change. even if the staff behind the renderer changes, the trackIndex will not. 
            // so it's okay to access the staff here while creating the glyphs. 
            if (Info.ShouldCreateGlyph(Renderer.Settings, beat) && (!Info.HideOnMultiTrack || Renderer.Staff.TrackIndex == 0))
            {
                IsEmpty = false;
                if (FirstBeat == null || beat.IsBefore(FirstBeat))
                {
                    FirstBeat = beat;
                }
                if (LastBeat == null || beat.IsAfter(LastBeat))
                {
                    LastBeat = beat;

                    // for "toEnd" sizing occupy until next follow-up-beat
                    switch (Info.SizingMode)
                    {
                        case EffectBarGlyphSizing.SingleOnBeatToEnd:
                        case EffectBarGlyphSizing.GroupedOnBeatToEnd:
                            if (LastBeat.NextBeat != null)
                            {
                                LastBeat = LastBeat.NextBeat;
                            }
                            break;
                    }
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
                case EffectBarGlyphSizing.SingleOnBeatToEnd:
                    g = Info.CreateNewGlyph(Renderer, b);
                    g.Renderer = Renderer;
                    g.Beat = b;
                    g.DoLayout();
                    _effectGlyphs[b.Voice.Index][b.Index] = g;
                    _uniqueEffectGlyphs[b.Voice.Index].Add(g);
                    return g;

                case EffectBarGlyphSizing.GroupedOnBeat:
                case EffectBarGlyphSizing.GroupedOnBeatToEnd:

                    var singleSizing = sizing == EffectBarGlyphSizing.GroupedOnBeat
                        ? EffectBarGlyphSizing.SingleOnBeat
                        : EffectBarGlyphSizing.SingleOnBeatToEnd;

                    if (b.Index > 0 || Renderer.Index > 0)
                    {
                        // check if the previous beat also had this effect
                        Beat prevBeat = b.PreviousBeat;
                        if (Info.ShouldCreateGlyph(Renderer.Settings, prevBeat))
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
                                var previousBand = previousRenderer.GetBand(Voice, Info.EffectId);
                                var voiceGlyphs = previousBand._effectGlyphs[b.Voice.Index];
                                if (voiceGlyphs.ContainsKey(prevBeat.Index))
                                {
                                    prevEffect = voiceGlyphs[prevBeat.Index];
                                }
                            }

                            // if the effect cannot be expanded, create a new glyph
                            // in case of expansion also create a new glyph, but also link the glyphs together 
                            // so for rendering it might be expanded. 
                            EffectGlyph newGlyph = CreateOrResizeGlyph(singleSizing, b);

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
                        return CreateOrResizeGlyph(singleSizing, b);
                    }

                    // in case of the very first beat, we simply create the glyph. 
                    return CreateOrResizeGlyph(singleSizing, b);
            }

            return null;
        }


        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy, canvas);

            //canvas.LineWidth = 1;
            //canvas.StrokeRect(cx + X, cy + Y, Renderer.Width, Slot.Shared.Height);
            //canvas.LineWidth = 1.5f;

            for (int i = 0, j = _uniqueEffectGlyphs.Count; i < j; i++)
            {
                var v = _uniqueEffectGlyphs[i];

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

                case EffectBarGlyphSizing.SingleOnBeatToEnd:
                case EffectBarGlyphSizing.GroupedOnBeatToEnd: // grouping is achieved by linking the normaly aligned glyphs
                    pos = container.OnNotes;
                    g.X = Renderer.BeatGlyphsStart + pos.X + container.X;
                    if (container.Beat.IsLastOfVoice)
                    {
                        g.Width = Renderer.Width - g.X;
                    }
                    else
                    {
                        g.Width = container.Width - container.PreNotes.Width - container.PreNotes.X;
                    }
                    break;

                case EffectBarGlyphSizing.FullBar:
                    g.Width = Renderer.Width;
                    break;
            }
        }
    }

    class EffectBandSizingInfo
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

        public void Register(EffectBand effectBand)
        {
            var freeSlot = GetOrCreateSlot(effectBand);
            freeSlot.Update(effectBand);
            _effectSlot[effectBand.Info.EffectId] = freeSlot;
        }
    }

    class EffectBandSlotShared
    {
        public string UniqueEffectId { get; set; }
        public float Y { get; set; }
        public float Height { get; set; }
        public Beat FirstBeat { get; set; }
        public Beat LastBeat { get; set; }

        public EffectBandSlotShared()
        {
            Y = 0;
            Height = 0;
        }
    }

    class EffectBandSlot
    {
        public FastList<EffectBand> Bands { get; set; }
        public EffectBandSlotShared Shared { get; set; }

        public EffectBandSlot()
        {
            Bands = new FastList<EffectBand>();
            Shared = new EffectBandSlotShared();
        }

        public void Update(EffectBand effectBand)
        {
            // lock band to particular effect if needed
            if (!effectBand.Info.CanShareBand)
            {
                Shared.UniqueEffectId = effectBand.Info.EffectId;
            }

            effectBand.Slot = this;
            Bands.Add(effectBand);

            if (effectBand.Height > Shared.Height)
            {
                Shared.Height = effectBand.Height;
            }
            if (Shared.FirstBeat == null || effectBand.FirstBeat.IsBefore(Shared.FirstBeat))
            {
                Shared.FirstBeat = effectBand.FirstBeat;
            }
            if (Shared.LastBeat == null || effectBand.LastBeat.IsAfter(Shared.LastBeat))
            {
                Shared.LastBeat = effectBand.LastBeat;
            }
        }

        public bool CanBeUsed(EffectBand band)
        {
            return
                // if the current band is marked as unique, only merge with same effect, 
                // if the current band is shared, only merge with same effect 
                ((Shared.UniqueEffectId == null && band.Info.CanShareBand) || band.Info.EffectId == Shared.UniqueEffectId)
                // only merge if there is space for the new band before or after the current beat
                && (Shared.FirstBeat == null || Shared.LastBeat.IsBefore(band.FirstBeat) || Shared.LastBeat.IsBefore(Shared.FirstBeat));
        }
    }

    /// <summary>
    /// This renderer is responsible for displaying effects above or below the other staves
    /// like the vibrato. 
    /// </summary>
    class EffectBarRenderer : BarRendererBase
    {
        private readonly IEffectBarRendererInfo[] _infos;
        private FastList<EffectBand> _bands;
        private FastDictionary<string, EffectBand> _bandLookup;

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

        public override void FinalizeRenderer()
        {
            base.FinalizeRenderer();
            UpdateHeight();
        }

        private void UpdateHeight()
        {
            if (SizingInfo == null) return;

            var y = 0f;
            foreach (var slot in SizingInfo.Slots)
            {
                slot.Shared.Y = y;
                foreach (var band in slot.Bands)
                {
                    band.Y = y;
                    band.Height = slot.Shared.Height;
                }

                y += slot.Shared.Height;
            }

            Height = y;
        }


        public override bool ApplyLayoutingInfo()
        {
            if (!base.ApplyLayoutingInfo()) return false;

            // we create empty slots for the same group
            if (Index > 0)
            {
                var previousRenderer = (EffectBarRenderer)PreviousRenderer;
                SizingInfo = previousRenderer.SizingInfo;
            }
            else
            {
                SizingInfo = new EffectBandSizingInfo();
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
            _bands = new FastList<EffectBand>();
            _bandLookup = new FastDictionary<string, EffectBand>();
            foreach (var voice in Bar.Voices)
            {
                if (HasVoiceContainer(voice))
                {
                    foreach (var info in _infos)
                    {
                        var band = new EffectBand(voice, info);
                        band.Renderer = this;
                        band.DoLayout();
                        _bands.Add(band);
                        _bandLookup[voice.Index + "." + info.EffectId] = band;
                    }
                }
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
            foreach (var effectBand in _bands)
            {
                canvas.Color = effectBand.Voice.Index == 0 ? Resources.MainGlyphColor : Resources.SecondaryGlyphColor;
                if (!effectBand.IsEmpty)
                {
                    effectBand.Paint(cx + X, cy + Y, canvas);
                }
            }

            //canvas.Color = new Color(0, 0, 200, 100);
            //canvas.StrokeRect(cx + X, cy + Y, Width, Height);
        }

        public EffectBand GetBand(Voice voice, string effectId)
        {
            var id = voice.Index + "." + effectId;
            if (_bandLookup.ContainsKey(id)) return _bandLookup[id];
            return null;
        }
    }
}
