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

            var xml = Std.ToString(_data.ReadAll());
            IXmlDocument dom ;
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
            var version = element.GetAttribute("version");
            if (!string.IsNullOrEmpty(version) && version != "2.0")
            {
                throw new UnsupportedFormatException();
            }

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
            for (int i = track.Bars.Count; i <= barIndex; i++)
            {
                bar = new Bar();
                masterBar = GetOrCreateMasterBar(barIndex);
                track.AddBar(bar);

                for (int j = 0; j < _maxVoices; j++)
                {
                    var emptyVoice = new Voice();
                    bar.AddVoice(emptyVoice);
                    var emptyBeat = new Beat { IsEmpty = true };
                    emptyVoice.AddBeat(emptyBeat);
                }
            }

            bool chord = false;
            bool isFirstBeat = true;

            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "note":
                            chord = ParseNoteBeat(c, track, bar, chord, isFirstBeat);
                            isFirstBeat = false;
                            break;
                        case "forward":
                            break;
                        case "direction":
                            ParseDirection(c, masterBar);
                            break;
                        case "attributes":
                            ParseAttributes(c, bar, masterBar);
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

        private bool ParseNoteBeat(IXmlNode element, Track track, Bar bar, bool chord, bool isFirstBeat)
        {
            int voiceIndex = 0;
            var voiceNodes = element.GetElementsByTagName("voice");
            if (voiceNodes.Count > 0)
            {
                voiceIndex = Std.ParseInt(Std.GetNodeValue(voiceNodes.Get(0))) - 1;
            }

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
                                //case "256th":
                                //    break;
                                //case "128th":
                                //    break;
                                //case "breve":
                                //    break;
                                //case "long":
                                //    break;
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
                                case "whole":
                                    beat.Duration = Duration.Whole;
                                    break;
                            }
                            break;
                        case "dot":
                            note.IsStaccato = true;
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
                                note.IsGhost = true;
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
                        case "chord":
                            chord = true;
                            break;
                        case "pitch":
                            ParsePitch(c, track, beat, note);
                            break;
                        case "unpitched":
                            // TODO: not yet fully supported
                            note.String = 0;
                            note.Fret = 0;
                            break;
                        case "rest":
                            beat.IsEmpty = false;
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
                case "sharp":
                    note.AccidentalMode = NoteAccidentalMode.ForceSharp;
                    break;
                case "natural":
                    note.AccidentalMode = NoteAccidentalMode.ForceNatural;
                    break;
                case "flat":
                    note.AccidentalMode = NoteAccidentalMode.ForceFlat;
                    break;
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
            var actualNodes = 0;
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

        private void ParsePitch(IXmlNode element, Track track, Beat beat, Note note)
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

            var fullNoteName = step + octave;
            var fullNoteValue = TuningParser.GetTuningForText(fullNoteName) + semitones;

            ApplyNoteStringFrets(track, beat, note, fullNoteValue);
        }

        private void ApplyNoteStringFrets(Track track, Beat beat, Note note, int fullNoteValue)
        {
            note.String = FindStringForValue(track, beat, fullNoteValue);
            note.Fret = fullNoteValue - Note.GetStringTuning(track, note.String);
        }

        private int FindStringForValue(Track track, Beat beat, int value)
        {
            // find strings which are already taken
            var takenStrings = new FastDictionary<int, bool>();
            for (int i = 0; i < beat.Notes.Count; i++)
            {
                var note = beat.Notes[i];
                takenStrings[note.String] = true;
            }

            // find a string where the note matches into 0 to <upperbound>

            // first try to find a string from 0-14 (more handy to play)
            // then try from 0-20 (guitars with high frets)
            // then unlimited 
            int[] steps = { 14, 20, int.MaxValue };
            for (int i = 0; i < steps.Length; i++)
            {
                for (int j = 0; j < track.Tuning.Length; j++)
                {
                    if (!takenStrings.ContainsKey(j))
                    {
                        var min = track.Tuning[j];
                        var max = track.Tuning[j] + steps[i];

                        if (value >= min && value <= max)
                        {
                            return track.Tuning.Length - j;
                        }
                    }
                }
            }
            // will not happen
            return 1;
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
            string line = null;
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
                            line = Std.GetNodeValue(c);
                            break;
                    }
                }
            });

            var clef = sign + line;
            switch (clef)
            {
                case "G2":
                    bar.Clef = Clef.G2;
                    break;
                case "F4":
                    bar.Clef = Clef.F4;
                    break;
                case "C3":
                    bar.Clef = Clef.C3;
                    break;
                case "C4":
                    bar.Clef = Clef.C4;
                    break;
            }
        }

        private void ParseTime(IXmlNode element, MasterBar masterBar)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "beats":
                            masterBar.TimeSignatureNumerator = Std.ParseInt(Std.GetNodeValue(c));
                            break;
                        case "beats-type":
                            masterBar.TimeSignatureDenominator = Std.ParseInt(Std.GetNodeValue(c));
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
                    }
                }
            });

            if (fifths != int.MinValue)
            {
                // TODO: check if this is conrrect
                masterBar.KeySignature = fifths;
            }
            else
            {
                // TODO: map keyStep/keyAlter to internal keysignature
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
            var track = new Track();
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

            if (track.Tuning == null || track.Tuning.Length == 0)
            {
                track.Tuning = Tuning.GetDefaultTuningFor(6).Tunings;
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
