using System;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TabSlurGlyph : TabTieGlyph
    {
        private BeamDirection _direction;

        public TabSlurGlyph(Note startNote, Note endNote, bool forSlide, bool forEnd = false)
            : base(startNote, endNote, forSlide, forEnd)
        {
            _direction = GetBeamDirection(startNote);
        }

        protected override float GetTieHeight(float startX, float startY, float endX, float endY)
        {
            return (float)Math.Log(endX - startX + 1) * Renderer.Settings.Notation.SlurHeight;
        }

        public bool TryExpand(Note startNote, Note endNote, bool forSlide, bool forEnd)
        {
            // same type required
            if (ForSlide != forSlide)
            {
                return false;
            }

            if (ForEnd != forEnd)
            {
                return false;
            }

            // same start and endbeat
            if (StartNote.Beat.Id != startNote.Beat.Id)
            {
                return false;
            }

            if (EndNote.Beat.Id != endNote.Beat.Id)
            {
                return false;
            }

            // same draw direction
            if (_direction != GetBeamDirection(startNote))
            {
                return false;
            }

            // if we can expand, expand in correct direction
            switch (_direction)
            {
                case BeamDirection.Up: // slur up -> slur on highest note
                    if (startNote.RealValue > StartNote.RealValue)
                    {
                        StartNote = startNote;
                        StartBeat = startNote.Beat;
                    }

                    if (endNote.RealValue > EndNote.RealValue)
                    {
                        EndNote = endNote;
                        EndBeat = endNote.Beat;
                    }

                    break;
                case BeamDirection.Down: // slur down -> slur on lowest note
                    if (startNote.RealValue < StartNote.RealValue)
                    {
                        StartNote = startNote;
                        StartBeat = startNote.Beat;
                    }

                    if (endNote.RealValue < EndNote.RealValue)
                    {
                        EndNote = endNote;
                        EndBeat = endNote.Beat;
                    }

                    break;
            }

            return true;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var startNoteRenderer =
                Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId,
                    StartBeat.Voice.Bar);
            var direction = GetBeamDirection(StartBeat, startNoteRenderer);
            var slurId = "tab.slur." + StartNote.Beat.Id + "." + EndNote.Beat.Id + "." + direction;
            var renderer = (TabBarRenderer)Renderer;
            var isSlurRendered = renderer.Staff.GetSharedLayoutData(slurId, false);
            if (!isSlurRendered)
            {
                renderer.Staff.SetSharedLayoutData(slurId, true);
                base.Paint(cx, cy, canvas);
            }
        }
    }
}
