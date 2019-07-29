using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Exporter
{
    /// <summary>
    /// This class allows converting scores into alphaTex. 
    /// </summary>
    // ReSharper disable once UnusedMember.Global
    public class AlphaTexExporter
    {
        private readonly StringBuilder _builder;

        /// <summary>
        /// Initializes a new instance of the <see cref="AlphaTexExporter"/> class.
        /// </summary>
        public AlphaTexExporter()
        {
            _builder = new StringBuilder();
        }

        /// <summary>
        /// Exports the given track. 
        /// </summary>
        /// <param name="track">The track to export</param>
        public void Export(Track track)
        {
            Score(track);
        }

        private void Score(Track track)
        {
            MetaData(track);
            Bars(track);
        }

        /// <summary>
        /// Returns the generated tex code. 
        /// </summary>
        /// <returns></returns>
        public string ToTex()
        {
            return _builder.ToString();
        }

        private void MetaData(Track track)
        {
            var score = track.Score;
            StringMetaData("title", score.Title);
            StringMetaData("subtitle", score.SubTitle);
            StringMetaData("artist", score.Artist);
            StringMetaData("album", score.Album);
            StringMetaData("words", score.Words);
            StringMetaData("music", score.Music);
            StringMetaData("copyright", score.Copyright);

            _builder.Append("\\tempo ");
            _builder.Append(score.Tempo);
            _builder.AppendLine();

            var staff = track.Staves[0];

            if (staff.Capo > 0)
            {
                _builder.Append("\\capo ");
                _builder.Append(staff.Capo);
                _builder.AppendLine();
            }

            _builder.Append("\\tuning");
            for (var i = 0; i < staff.Tuning.Length; i++)
            {
                _builder.Append(" ");
                _builder.Append(Tuning.GetTextForTuning(staff.Tuning[i], true));
            }

            _builder.Append("\\instrument ");
            _builder.Append(track.PlaybackInfo.Program);
            _builder.AppendLine();

            _builder.Append(".");
            _builder.AppendLine();
        }

        private void StringMetaData(string key, string value)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                _builder.Append("\\");
                _builder.Append(key);
                _builder.Append(" \"");
                _builder.Append(value.Replace("\"", "\\\""));
                _builder.Append("\"");
                _builder.AppendLine();
            }
        }

        private void Bars(Track track)
        {
            // alphatab only supports single staves, 
            for (var i = 0; i < 1; i++)
            {
                for (var j = 0; j < track.Staves[i].Bars.Count; j++)
                {
                    if (i > 0)
                    {
                        _builder.Append(" |");
                        _builder.AppendLine();
                    }

                    Bar(track.Staves[i].Bars[j]);
                }
            }
        }

        private void Bar(Bar bar)
        {
            BarMeta(bar);
            Voice(bar.Voices[0]);
        }

        private void Voice(Voice voice)
        {
            for (var i = 0; i < voice.Beats.Count; i++)
            {
                Beat(voice.Beats[i]);
            }
        }

        private void Beat(Beat beat)
        {
            if (beat.IsRest)
            {
                _builder.Append("r");
            }
            else
            {
                if (beat.Notes.Count > 1)
                {
                    _builder.Append("(");
                }

                for (var i = 0; i < beat.Notes.Count; i++)
                {
                    Note(beat.Notes[i]);
                }

                if (beat.Notes.Count > 1)
                {
                    _builder.Append(")");
                }
            }

            _builder.Append(".");
            _builder.Append((int)beat.Duration);
            _builder.Append(" ");

            BeatEffects(beat);
        }

        private void Note(Note note)
        {
            if (note.IsDead)
            {
                _builder.Append("x");
            }
            else if (note.IsTieDestination)
            {
                _builder.Append("-");
            }
            else
            {
                _builder.Append(note.Fret);
            }

            _builder.Append(".");
            _builder.Append(note.Beat.Voice.Bar.Staff.Tuning.Length - note.String + 1);
            _builder.Append(" ");

            NoteEffects(note);
        }

        private void NoteEffects(Note note)
        {
            var hasEffectOpen = false;

            if (note.HasBend)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("be (");

                for (var i = 0; i < note.BendPoints.Count; i++)
                {
                    _builder.Append(note.BendPoints[i].Offset);
                    _builder.Append(" ");
                    _builder.Append(note.BendPoints[i].Value);
                    _builder.Append(" ");
                }

                _builder.Append(")");
            }

            switch (note.HarmonicType)
            {
                case HarmonicType.Natural:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("nh ");
                    break;
                case HarmonicType.Artificial:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("ah ");
                    break;
                case HarmonicType.Tap:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("th ");
                    break;
                case HarmonicType.Pinch:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("ph ");
                    break;
                case HarmonicType.Semi:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("sh ");
                    break;
            }

            if (note.IsTrill)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("tr ");
                _builder.Append(note.TrillFret);
                _builder.Append(" ");
                switch (note.TrillSpeed)
                {
                    case Duration.Sixteenth:
                        _builder.Append("16 ");
                        break;
                    case Duration.ThirtySecond:
                        _builder.Append("32 ");
                        break;
                    case Duration.SixtyFourth:
                        _builder.Append("64 ");
                        break;
                }
            }

            if (note.Vibrato != VibratoType.None)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("v ");
            }

            if (note.SlideType == SlideType.Legato)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("sl ");
            }

            if (note.SlideType == SlideType.Shift)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("ss ");
            }

            if (note.IsHammerPullOrigin)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("h ");
            }

            if (note.IsGhost)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("g ");
            }

            if (note.Accentuated == AccentuationType.Normal)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("ac ");
            }
            else if (note.Accentuated == AccentuationType.Heavy)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("hac ");
            }

            if (note.IsPalmMute)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("pm ");
            }

            if (note.IsStaccato)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("st ");
            }

            if (note.IsLetRing)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("lr ");
            }

            switch (note.LeftHandFinger)
            {
                case Fingers.Thumb:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("1 ");
                    break;
                case Fingers.IndexFinger:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("2 ");
                    break;
                case Fingers.MiddleFinger:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("3 ");
                    break;
                case Fingers.AnnularFinger:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("4 ");
                    break;
                case Fingers.LittleFinger:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("5 ");
                    break;
            }

            switch (note.RightHandFinger)
            {
                case Fingers.Thumb:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("1 ");
                    break;
                case Fingers.IndexFinger:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("2 ");
                    break;
                case Fingers.MiddleFinger:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("3 ");
                    break;
                case Fingers.AnnularFinger:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("4 ");
                    break;
                case Fingers.LittleFinger:
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("5 ");
                    break;
            }

            EffectClose(hasEffectOpen);
        }

        private bool EffectOpen(bool hasBeatEffectOpen)
        {
            if (!hasBeatEffectOpen)
            {
                _builder.Append("{");
            }

            return true;
        }

        private void EffectClose(bool hasBeatEffectOpen)
        {
            if (hasBeatEffectOpen)
            {
                _builder.Append("}");
            }
        }

        private void BeatEffects(Beat beat)
        {
            var hasEffectOpen = false;

            if (beat.FadeIn)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("f ");
            }

            switch (beat.GraceType)
            {
                case GraceType.BendGrace:
                    _builder.Append("gr b ");
                    break;
                case GraceType.OnBeat:
                    _builder.Append("gr ob ");
                    break;
                case GraceType.BeforeBeat:
                    _builder.Append("gr ");
                    break;
            }

            if (beat.Vibrato != VibratoType.None)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("v ");
            }

            if (beat.Slap)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("s ");
            }

            if (beat.Pop)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("p ");
            }

            if (beat.Dots == 2)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("dd ");
            }
            else if (beat.Dots == 1)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("d ");
            }

            if (beat.PickStroke == PickStroke.Up)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("su ");
            }
            else if (beat.PickStroke == PickStroke.Down)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("sd ");
            }

            if (beat.HasTuplet)
            {
                var tupletValue = 0;
                if (beat.TupletDenominator == 3 && beat.TupletNumerator == 2)
                {
                    tupletValue = 3;
                }
                else if (beat.TupletDenominator == 5 && beat.TupletNumerator == 4)
                {
                    tupletValue = 5;
                }
                else if (beat.TupletDenominator == 6 && beat.TupletNumerator == 4)
                {
                    tupletValue = 6;
                }
                else if (beat.TupletDenominator == 7 && beat.TupletNumerator == 4)
                {
                    tupletValue = 7;
                }
                else if (beat.TupletDenominator == 9 && beat.TupletNumerator == 8)
                {
                    tupletValue = 9;
                }
                else if (beat.TupletDenominator == 10 && beat.TupletNumerator == 8)
                {
                    tupletValue = 10;
                }
                else if (beat.TupletDenominator == 11 && beat.TupletNumerator == 8)
                {
                    tupletValue = 11;
                }
                else if (beat.TupletDenominator == 12 && beat.TupletNumerator == 8)
                {
                    tupletValue = 12;
                }

                if (tupletValue != 0)
                {
                    hasEffectOpen = EffectOpen(hasEffectOpen);
                    _builder.Append("tu ");
                    _builder.Append(tupletValue);
                    _builder.Append(" ");
                }
            }

            if (beat.HasWhammyBar)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("tbe (");

                for (var i = 0; i < beat.WhammyBarPoints.Count; i++)
                {
                    _builder.Append(beat.WhammyBarPoints[i].Offset);
                    _builder.Append(" ");
                    _builder.Append(beat.WhammyBarPoints[i].Value);
                    _builder.Append(" ");
                }

                _builder.Append(")");
            }

            if (beat.IsTremolo)
            {
                hasEffectOpen = EffectOpen(hasEffectOpen);
                _builder.Append("tp ");
                if (beat.TremoloSpeed == Duration.Eighth)
                {
                    _builder.Append("8 ");
                }
                else if (beat.TremoloSpeed == Duration.Sixteenth)
                {
                    _builder.Append("16 ");
                }
                else if (beat.TremoloSpeed == Duration.ThirtySecond)
                {
                    _builder.Append("32 ");
                }
                else
                {
                    _builder.Append("8 ");
                }
            }


            EffectClose(hasEffectOpen);
        }


        private void BarMeta(Bar bar)
        {
            var masterBar = bar.MasterBar;
            if (masterBar.Index > 0)
            {
                var previousMasterBar = masterBar.PreviousMasterBar;
                var previousBar = bar.PreviousBar;

                if (previousMasterBar.TimeSignatureDenominator != masterBar.TimeSignatureDenominator ||
                    previousMasterBar.TimeSignatureNumerator != masterBar.TimeSignatureNumerator)
                {
                    _builder.Append("\\ts ");
                    _builder.Append(masterBar.TimeSignatureNumerator);
                    _builder.Append(" ");
                    _builder.Append(masterBar.TimeSignatureDenominator);
                    _builder.AppendLine();
                }

                if (previousMasterBar.KeySignature != masterBar.KeySignature)
                {
                    _builder.Append("\\ks ");
                    switch (masterBar.KeySignature)
                    {
                        case KeySignature.Cb:
                            _builder.Append("cb");
                            break;
                        case KeySignature.Gb:
                            _builder.Append("gb");
                            break;
                        case KeySignature.Db:
                            _builder.Append("db");
                            break;
                        case KeySignature.Ab:
                            _builder.Append("ab");
                            break;
                        case KeySignature.Eb:
                            _builder.Append("eb");
                            break;
                        case KeySignature.Bb:
                            _builder.Append("bb");
                            break;
                        case KeySignature.F:
                            _builder.Append("f");
                            break;
                        case KeySignature.C:
                            _builder.Append("c");
                            break;
                        case KeySignature.G:
                            _builder.Append("g");
                            break;
                        case KeySignature.D:
                            _builder.Append("d");
                            break;
                        case KeySignature.A:
                            _builder.Append("a");
                            break;
                        case KeySignature.E:
                            _builder.Append("e");
                            break;
                        case KeySignature.B:
                            _builder.Append("b");
                            break;
                        case KeySignature.FSharp:
                            _builder.Append("f#");
                            break;
                        case KeySignature.CSharp:
                            _builder.Append("c#");
                            break;
                    }

                    _builder.AppendLine();
                }

                if (bar.Clef != previousBar.Clef)
                {
                    _builder.Append("\\clef ");
                    switch (bar.Clef)
                    {
                        case Clef.Neutral:
                            _builder.Append("n");
                            break;
                        case Clef.C3:
                            _builder.Append("c3");
                            break;
                        case Clef.C4:
                            _builder.Append("c4");
                            break;
                        case Clef.F4:
                            _builder.Append("f4");
                            break;
                        case Clef.G2:
                            _builder.Append("g2");
                            break;
                    }

                    _builder.AppendLine();
                }

                if (masterBar.TempoAutomation != null)
                {
                    _builder.Append("\\tempo ");
                    _builder.Append(masterBar.TempoAutomation.Value);
                    _builder.AppendLine();
                }
            }

            if (masterBar.IsRepeatStart)
            {
                _builder.Append("\\ro ");
                _builder.AppendLine();
            }

            if (masterBar.IsRepeatEnd)
            {
                _builder.Append("\\rc ");
                _builder.Append(masterBar.RepeatCount + 1);
                _builder.AppendLine();
            }
        }
    }
}
