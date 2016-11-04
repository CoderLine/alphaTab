using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Xml;
using XmlNodeType = AlphaTab.Xml.XmlNodeType;

namespace AlphaTab.Importer
{
    public class MusicXml2Importer : ScoreImporter
    {
        private Score _score;
        private FastDictionary<string, Track> _trackById;
        private int _trackFirstMeasureNumber;
        private int _maxVoices;

        public override Score ReadScore()
        {
            _trackById = new FastDictionary<string, Track>();

            var xml = Std.ToString(Data.ReadAll());
            IXmlDocument dom;
            try
            {
                dom = Std.LoadXml(xml);
            }
            catch (Exception)
            {
                throw new UnsupportedFormatException();
            }

            _score = new Score();
            _score.Tempo = 120;
            ParseDom(dom);
            _score.Finish();
            return _score;
        }

        private void ParseDom(IXmlDocument dom)
        {
            var root = dom.DocumentElement;
            if (root == null) return;
            switch (root.LocalName)
            {
                case "score-partwise":
                    ParsePartwise(root);
                    break;
                case "score-timewise":
                    //ParseTimewise(root);
                    break;
                default:
                    throw new UnsupportedFormatException();
            }
        }

        private void ParsePartwise(IXmlNode element)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "movement-title":
                            _score.Title = Std.GetNodeValue(c.FirstChild);
                            break;
                        case "identification":
                            ParseIdentification(c);
                            break;
                        case "part-list":
                            ParsePartList(c);
                            break;
                        case "part":
                            ParsePart(c);
                            break;
                    }
                }
            });
        }

        private void ParsePart(IXmlNode element)
        {
            var id = element.GetAttribute("id");
            var track = _trackById[id];
            var isFirstMeasure = true;
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "measure":
                            ParseMeasure(c, track, isFirstMeasure);
                            isFirstMeasure = false;
                            break;
                    }
                }
            });
        }

        private void ParseMeasure(IXmlNode element, Track track, bool isFirstMeasure)
        {
            var barIndex = 0;
            if (isFirstMeasure)
            {
                _trackFirstMeasureNumber = Std.ParseInt(element.GetAttribute("number"));
                barIndex = 0;
            }
            else
            {
                barIndex = Std.ParseInt(element.GetAttribute("number")) - _trackFirstMeasureNumber;
            }

            // create empty bars to the current index
            Bar bar = null;
            MasterBar masterBar = null;
            for (int i = track.Staves[0].Bars.Count; i <= barIndex; i++)
            {
                bar = new Bar();
                masterBar = GetOrCreateMasterBar(barIndex);
                track.AddBarToStaff(0, bar);

                for (int j = 0; j < _maxVoices; j++)
                {
                    var emptyVoice = new Voice();
                    bar.AddVoice(emptyVoice);
                    var emptyBeat = new Beat { IsEmpty = true };
                    emptyVoice.AddBeat(emptyBeat);
                }
            }

            var isFirstBeat = true;
            var attributesParsed = false; 

            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "note":
                            ParseNoteBeat(c, track, bar, isFirstBeat);
                            isFirstBeat = false;
                            break;
                        case "forward":
                            break;
                        case "direction":
                            ParseDirection(c, masterBar);
                            break;
                        case "attributes":
                            if (!attributesParsed)
                            {
                                ParseAttributes(c, bar, masterBar);
                                attributesParsed = true;
                            }
                            break;
                        case "harmony":
                            // TODO
                            break;
                        case "sound":
                            // TODO
                            break;
                        case "barline":
                            // TODO
                            break;
                    }
                }
            });
        }

        private bool ParseNoteBeat(IXmlNode element, Track track, Bar bar, bool isFirstBeat)
        {
            int voiceIndex = 0;
            var voiceNodes = element.GetElementsByTagName("voice");
            if (voiceNodes.Length > 0)
            {
                voiceIndex = Std.ParseInt(Std.GetNodeValue(voiceNodes[0])) - 1;
            }

            var chord = element.GetElementsByTagName("chord").Length > 0;

            Beat beat;
            var voice = GetOrCreateVoice(bar, voiceIndex);
            if (chord || (isFirstBeat && voice.Beats.Count == 1))
            {
                beat = voice.Beats[voice.Beats.Count - 1];
            }
            else
            {
                beat = new Beat();
                voice.AddBeat(beat);
            }

            var note = new Note();
            beat.AddNote(note);
            beat.IsEmpty = false;

            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "grace":
                            //var slash = e.GetAttribute("slash");
                            //var makeTime = Std.ParseInt(e.GetAttribute("make-time"));
                            //var stealTimePrevious = Std.ParseInt(e.GetAttribute("steal-time-previous"));
                            //var stealTimeFollowing = Std.ParseInt(e.GetAttribute("steal-time-following"));
                            beat.GraceType = GraceType.BeforeBeat;
                            beat.Duration = Duration.ThirtySecond;
                            break;
                        case "duration":
                            beat.Duration = (Duration)Std.ParseInt(Std.GetNodeValue(c));
                            break;
                        case "tie":
                            ParseTied(c, note);
                            break;
                        case "cue":
                            // not supported
                            break;
                        case "instrument":
                            // not supported
                            break;
                        case "type":
                            switch (Std.GetNodeValue(c))
                            {
                                case "256th":
                                case "128th":
                                case "64th":
                                    beat.Duration = Duration.SixtyFourth;
                                    break;
                                case "32nd":
                                    beat.Duration = Duration.ThirtySecond;
                                    break;
                                case "16th":
                                    beat.Duration = Duration.Sixteenth;
                                    break;
                                case "eighth":
                                    beat.Duration = Duration.Eighth;
                                    break;
                                case "quarter":
                                    beat.Duration = Duration.Quarter;
                                    break;
                                case "half":
                                    beat.Duration = Duration.Half;
                                    break;
                                case "long":
                                case "breve":
                                case "whole":
                                    beat.Duration = Duration.Whole;
                                    break;
                            }
                            break;
                        case "dot":
                            beat.Dots = 1;
                            break;
                        case "accidental":
                            ParseAccidental(c, note);
                            break;
                        case "time-modification":
                            ParseTimeModification(c, beat);
                            break;
                        case "stem":
                            // not supported
                            break;
                        case "notehead":
                            if (c.GetAttribute("parentheses") == "yes")
                            {
                                //note.IsGhost = true;
                            }
                            break;
                        case "beam":
                            // not supported
                            break;
                        case "notations":
                            ParseNotations(c, beat, note);
                            break;
                        case "lyric":
                            // not supported
                            break;
                        // "full-note"
                        case "pitch":
                            ParsePitch(c, note);
                            break;
                        case "unpitched":
                            // TODO: not yet fully supported
                            note.String = 0;
                            note.Fret = 0;
                            break;
                        case "rest":
                            beat.IsEmpty = false;
                            beat.Notes.Clear();
                            break;
                    }
                }
            });

            return chord;
        }

        private void ParseAccidental(IXmlNode element, Note note)
        {
            switch (Std.GetNodeValue(element))
            {
                //case "sharp":
                //    note.AccidentalMode = NoteAccidentalMode.ForceSharp;
                //    break;
                //case "natural":
                //    note.AccidentalMode = NoteAccidentalMode.ForceNatural;
                //    break;
                //case "flat":
                //    note.AccidentalMode = NoteAccidentalMode.ForceFlat;
                //    break;
                //case "double-sharp":
                //    break;
                //case "sharp-sharp":
                //    break;
                //case "flat-flat":
                //    break;
                //case "natural-sharp":
                //    break;
                //case "natural-flat":
                //    break;
                //case "quarter-flat":
                //    break;
                //case "quarter-sharp":
                //    break;
                //case "three-quarters-flat":
                //    break;
                //case "three-quarters-sharp":
                //    break;
            }
        }

        private static void ParseTied(IXmlNode element, Note note)
        {
            if (element.GetAttribute("type") == "start")
            {
                note.IsTieOrigin = true;
            }
            else
            {
                note.IsTieDestination = true;
            }
        }

        private void ParseNotations(IXmlNode element, Beat beat, Note note)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "articulations":
                            switch (c.FirstChild.LocalName)
                            {
                                case "accent":
                                    note.Accentuated = AccentuationType.Normal;
                                    break;
                                case "staccato":
                                    note.IsStaccato = true;
                                    break;
                            }
                            break;
                        case "tied":
                            ParseTied(c, note);
                            break;
                        case "slide":
                            if (c.GetAttribute("type") == "start")
                            {
                                note.SlideType = SlideType.Legato;
                            }
                            break;
                        case "dynamics":
                            ParseDynamics(c, beat);
                            break;
                    }
                }
            });
        }

        private void ParseDynamics(IXmlNode element, Beat beat)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "p":
                            beat.Dynamic = DynamicValue.P;
                            break;
                        case "pp":
                            beat.Dynamic = DynamicValue.PP;
                            break;
                        case "ppp":
                            beat.Dynamic = DynamicValue.PPP;
                            break;
                        case "f":
                            beat.Dynamic = DynamicValue.F;
                            break;
                        case "ff":
                            beat.Dynamic = DynamicValue.FF;
                            break;
                        case "fff":
                            beat.Dynamic = DynamicValue.FFF;
                            break;
                        case "mp":
                            beat.Dynamic = DynamicValue.MP;
                            break;
                        case "mf":
                            beat.Dynamic = DynamicValue.MF;
                            break;
                    }
                }
            });
        }

        private void ParseTimeModification(IXmlNode element, Beat beat)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "actual-notes":
                            beat.TupletNumerator = Std.ParseInt(Std.GetNodeValue(c));
                            break;
                        case "normal-notes":
                            beat.TupletDenominator = Std.ParseInt(Std.GetNodeValue(c));
                            break;
                            //case "normal-type":
                            //    break;
                            //case "normal-dot":
                            //    break;
                    }
                }
            });
        }

        private void ParsePitch(IXmlNode element, Note note)
        {
            string step = null;
            int semitones = 0;
            int octave = 0;
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "step":
                            step = Std.GetNodeValue(c);
                            break;
                        case "alter":
                            semitones = Std.ParseInt(Std.GetNodeValue(c));
                            break;
                        case "octave":
                            // 0-9, 4 for middle C
                            octave = Std.ParseInt(Std.GetNodeValue(c));
                            break;
                    }
                }
            });

            var value = octave * 12 + TuningParser.GetToneForText(step) + semitones;

            note.Octave = (value / 12);
            note.Tone = value - (note.Octave * 12);
        }

        private Voice GetOrCreateVoice(Bar bar, int index)
        {
            if (index < bar.Voices.Count)
            {
                return bar.Voices[index];
            }

            for (int i = bar.Voices.Count; i <= index; i++)
            {
                bar.AddVoice(new Voice());
            }

            _maxVoices = Math.Max(_maxVoices, bar.Voices.Count);

            return bar.Voices[index];
        }

        private void ParseDirection(IXmlNode element, MasterBar masterBar)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "sound":
                            var tempoAutomation = new Automation();
                            tempoAutomation.IsLinear = true;
                            tempoAutomation.Type = AutomationType.Tempo;
                            tempoAutomation.Value = Std.ParseInt(c.GetAttribute("tempo"));
                            masterBar.TempoAutomation = tempoAutomation;
                            break;
                        case "direction-type":
                            var directionType = c.FirstChild;
                            switch (directionType.LocalName)
                            {
                                case "words":
                                    if (element.GetAttribute("placement") == "above")
                                    {
                                        masterBar.Section = new Section();
                                        masterBar.Section.Text = Std.GetNodeValue(directionType);
                                    }
                                    break;
                            }
                            break;
                    }
                }
            });
        }

        private void ParseAttributes(IXmlNode element, Bar bar, MasterBar masterBar)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "key":
                            ParseKey(c, masterBar);
                            break;
                        case "time":
                            ParseTime(c, masterBar);
                            break;
                        case "clef":
                            ParseClef(c, bar);
                            break;
                    }
                }
            });
        }

        private void ParseClef(IXmlNode element, Bar bar)
        {
            string sign = null;
            int line = 0;
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "sign":
                            sign = Std.GetNodeValue(c);
                            break;
                        case "line":
                            line = Std.ParseInt(Std.GetNodeValue(c));
                            break;
                    }
                }
            });

            switch (sign)
            {
                case "G":
                    bar.Clef = Clef.G2;
                    break;
                case "F":
                    bar.Clef = Clef.F4;
                    break;
                case "C":
                    if (line == 3)
                    {
                        bar.Clef = Clef.C3;
                    }
                    else
                    {
                        bar.Clef = Clef.C4;
                    }
                    break;
                case "percussion":
                    bar.Clef = Clef.Neutral;
                    break;
            }
        }

        private void ParseTime(IXmlNode element, MasterBar masterBar)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    var v = Std.GetNodeValue(c);
                    switch (c.LocalName)
                    {
                        case "beats":
                            if (!v.Contains("+")) // compound TS
                            {
                                masterBar.TimeSignatureNumerator = Std.ParseInt(v);
                            }
                            break;
                        case "beat-type":
                            if (!v.Contains("+")) // compound TS
                            {
                                masterBar.TimeSignatureDenominator = Std.ParseInt(v);
                            }
                            break;
                    }
                }
            });
        }

        private void ParseKey(IXmlNode element, MasterBar masterBar)
        {
            int fifths = int.MinValue;
            int keyStep = int.MinValue;
            int keyAlter = int.MinValue;
            string mode = null;
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "fifths":
                            fifths = Std.ParseInt(Std.GetNodeValue(c));
                            break;
                        case "key-step":
                            keyStep = Std.ParseInt(Std.GetNodeValue(c));
                            break;
                        case "key-alter":
                            keyAlter = Std.ParseInt(Std.GetNodeValue(c));
                            break;
                        case "mode":
                            mode = Std.GetNodeValue(c);
                            break;
                    }
                }
            });

            if (-7 <= fifths && fifths <= 7)
            {
                // TODO: check if this is conrrect
                masterBar.KeySignature = fifths;
            }
            else
            {
                masterBar.KeySignature = 0;
                // TODO: map keyStep/keyAlter to internal keysignature
            }

            if (mode == "minor")
            {
                masterBar.KeySignatureType = KeySignatureType.Minor;
            }
            else
            {
                masterBar.KeySignatureType = KeySignatureType.Major;
            }
        }

        private MasterBar GetOrCreateMasterBar(int index)
        {
            if (index < _score.MasterBars.Count)
            {
                return _score.MasterBars[index];
            }

            for (int i = _score.MasterBars.Count; i <= index; i++)
            {
                var mb = new MasterBar();
                if (_score.MasterBars.Count > 0)
                {
                    var prev = _score.MasterBars[_score.MasterBars.Count - 1];
                    mb.TimeSignatureDenominator = prev.TimeSignatureDenominator;
                    mb.TimeSignatureNumerator = prev.TimeSignatureNumerator;
                    mb.KeySignature = prev.KeySignature;
                    mb.KeySignatureType = prev.KeySignatureType;
                }


                _score.AddMasterBar(mb);
            }

            return _score.MasterBars[index];
        }

        private void ParseIdentification(IXmlNode element)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "creator":
                            if (c.GetAttribute("type") == "composer")
                            {
                                _score.Music = Std.GetNodeValue(c.FirstChild);
                            }
                            break;
                        case "rights":
                            _score.Artist = Std.GetNodeValue(c.FirstChild);
                            break;
                    }
                }
            });
        }

        private void ParsePartList(IXmlNode element)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "score-part":
                            ParseScorePart(c);
                            break;
                    }
                }
            });

        }

        private void ParseScorePart(IXmlNode element)
        {
            string id = element.GetAttribute("id");
            var track = new Track(1);
            _trackById[id] = track;
            _score.AddTrack(track);
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "part-name":
                            track.Name = Std.GetNodeValue(c.FirstChild);
                            break;
                        case "part-abbreviation":
                            track.ShortName = Std.GetNodeValue(c.FirstChild);
                            break;
                        case "midi-instrument":
                            ParseMidiInstrument(c, track);
                            break;
                    }
                }
            });

            if (track.Tuning == null)
            {
                track.Tuning = new int[0];
            }
        }

        private void ParseMidiInstrument(IXmlNode element, Track track)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "midi-channel":
                            track.PlaybackInfo.PrimaryChannel = Std.ParseInt(Std.GetNodeValue(c.FirstChild));
                            break;
                        case "midi-program":
                            track.PlaybackInfo.Program = Std.ParseInt(Std.GetNodeValue(c.FirstChild));
                            break;
                        case "midi-volume":
                            track.PlaybackInfo.Volume = Std.ParseInt(Std.GetNodeValue(c.FirstChild));
                            break;
                    }
                }
            });
        }


    }
}