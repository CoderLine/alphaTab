/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    abstract class GroupedEffectGlyph : EffectGlyph
    {
        protected BeatXPosition EndPosition { get; set; }
        protected bool ForceGroupedRendering { get; set; }
        protected bool EndOnBarLine { get; set; }

        protected GroupedEffectGlyph(BeatXPosition endPosition) : base(0, 0)
        {
            EndPosition = endPosition;
        }

        /// <summary>
        /// Gets a value whether this glyph is linked with a previous glyph for rendering. 
        /// This means this glyph will not be rendered itself, but rendered as part of the very first glyph of this link-group.
        /// </summary>
        public bool IsLinkedWithPrevious
        {
            get
            {
                return PreviousGlyph != null && PreviousGlyph.Renderer.Staff.StaveGroup == Renderer.Staff.StaveGroup;
            }
        }

        /// <summary>
        /// Gets a value whether this glyph is linked with the next glyph for rendering. 
        /// </summary>
        public bool IsLinkedWithNext
        {
            get
            {
                // we additionally check IsFinalized since the next renderer might not be part of the current partial
                // and therefore not finalized yet. 
                return NextGlyph != null && NextGlyph.Renderer.IsFinalized && NextGlyph.Renderer.Staff.StaveGroup == Renderer.Staff.StaveGroup;
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            // if we are linked with the previous, the first glyph of the group will also render this one.
            if (IsLinkedWithPrevious)
            {
                return;
            }

            // we are not linked with any glyph therefore no expansion is required, we render a simple glyph. 
            if (!IsLinkedWithNext && !ForceGroupedRendering)
            {
                PaintNonGrouped(cx, cy, canvas);
                return;
            }

            // find last linked glyph that can be  
            GroupedEffectGlyph lastLinkedGlyph;
            if (!IsLinkedWithNext && ForceGroupedRendering)
            {
                lastLinkedGlyph = this;
            }
            else
            {
                lastLinkedGlyph = (GroupedEffectGlyph) NextGlyph;
                while (lastLinkedGlyph.IsLinkedWithNext)
                {
                    lastLinkedGlyph = (GroupedEffectGlyph) lastLinkedGlyph.NextGlyph;
                }
            }

            // use start position of next beat when possible
            Beat endBeat;
            BarRendererBase endBeatRenderer;
            BeatXPosition position;
            if (EndPosition == BeatXPosition.EndBeat && lastLinkedGlyph.Beat.NextBeat != null)
            {
                endBeat = lastLinkedGlyph.Beat.NextBeat;
                endBeatRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId, endBeat.Voice.Bar);
                position = BeatXPosition.MiddleNotes;
                if (endBeatRenderer == null || endBeatRenderer.Staff != Renderer.Staff)
                {
                    endBeatRenderer = lastLinkedGlyph.Renderer;
                    endBeat = lastLinkedGlyph.Beat;
                    position = EndPosition;
                }
            }
            else
            {
                endBeatRenderer = lastLinkedGlyph.Renderer;
                endBeat = lastLinkedGlyph.Beat;
                position = EndPosition;
            }

            // calculate end X-position
            var cxRenderer = cx - Renderer.X;
            var endX = CalculateEndX(endBeatRenderer, endBeat, cxRenderer, position);

            PaintGrouped(cx, cy, endX, canvas);
        }

        protected virtual float CalculateEndX(BarRendererBase endBeatRenderer, Beat endBeat, float cx, BeatXPosition endPosition)
        {
            if (endBeat == null)
            {
                return cx + endBeatRenderer.X + X + Width;
            }
            else
            {
                return cx + endBeatRenderer.X + endBeatRenderer.GetBeatX(endBeat, endPosition);
            }
        }

        protected virtual void PaintNonGrouped(float cx, float cy, ICanvas canvas)
        {
            var cxRenderer = cx - Renderer.X;
            var endX = CalculateEndX(Renderer, Beat, cxRenderer, EndPosition);
            PaintGrouped(cx, cy, endX, canvas);
        }

        protected abstract void PaintGrouped(float cx, float cy, float endX, ICanvas canvas);
    }
}