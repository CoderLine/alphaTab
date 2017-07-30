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
using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Xml;
using XmlNodeType = AlphaTab.Xml.XmlNodeType;

namespace AlphaTab.Importer
{
    public class MusicXmlImporter : ScoreImporter
    {
        private Score _score;
        private FastDictionary<string, Track> _trackById;
        private int _trackFirstMeasureNumber;
        private int _maxVoices;

        public override string Name { get { return "MusicXML"; } }

        public override Score ReadScore()
        {
            _trackById = new FastDictionary<string, Track>();

            var xml = Std.ToString(Data.ReadAll());
            XmlDocument dom;
            try
            {
                dom = new XmlDocument(xml);
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

        private void ParseDom(XmlDocument dom)
        {
            var root = dom.DocumentElement;
            if (root == null)
            {
                throw new UnsupportedFormatException();
            }

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

        private void ParsePartwise(XmlNode element)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "movement-title":
                            _score.Title = c.FirstChild.InnerText;
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
            }
        }

        private void ParsePart(XmlNode element)
        {
            var id = element.GetAttribute("id");
            if (!_trackById.ContainsKey(id))
            {
                return;
            }

            var track = _trackById[id];
            var isFirstMeasure = true;
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "measure":
                            if (ParseMeasure(c, track, isFirstMeasure))
                            {
                                isFirstMeasure = false;
                            }
                            break;
                    }
                }
            }
        }

        private bool ParseMeasure(XmlNode element, Track track, bool isFirstMeasure)
        {
            if (element.GetAttribute("implicit") == "yes" && element.GetElementsByTagName("note").Length == 0)
            {
                return false;
            }

            var barIndex = 0;
            if (isFirstMeasure)
            {
                _divisionsPerQuarterNote = 0;
                _trackFirstMeasureNumber = Std.ParseInt(element.GetAttribute("number"));
                if (_trackFirstMeasureNumber == int.MinValue)
                {
                    _trackFirstMeasureNumber = 0;
                }
                barIndex = 0;
            }
            else
            {
                barIndex = Std.ParseInt(element.GetAttribute("number"));
                if (barIndex == int.MinValue)
                {
                    return false;
                }
                barIndex -= _trackFirstMeasureNumber;
            }

            // try to find out the number of staffs required 
            if (isFirstMeasure)
            {
                var attributes = element.GetElementsByTagName("attributes");
                if (attributes.Length > 0)
                {
                    var stavesElements = attributes[0].GetElementsByTagName("staves");
                    if (stavesElements.Length > 0)
                    {
                        var staves = Std.ParseInt(stavesElements[0].InnerText);
                        track.EnsureStaveCount(staves);
                    }
                }
            }


            // create empty bars to the current index
            Bar[] bars = new Bar[track.Staves.Count];
            MasterBar masterBar = null;
            for (int b = track.Staves[0].Bars.Count; b <= barIndex; b++)
            {
                for (int s = 0; s < track.Staves.Count; s++)
                {
                    var bar = bars[s] = new Bar();
                    if (track.Staves[s].Bars.Count > 0)
                    {
                        var previousBar = track.Staves[s].Bars[track.Staves[s].Bars.Count - 1];
                        bar.Clef = previousBar.Clef;
                    }
                    masterBar = GetOrCreateMasterBar(barIndex);
                    track.AddBarToStaff(s, bar);

                    for (int v = 0; v < _maxVoices; v++)
                    {
                        var emptyVoice = new Voice();
                        bar.AddVoice(emptyVoice);
                        var emptyBeat = new Beat { IsEmpty = true };
                        emptyVoice.AddBeat(emptyBeat);
                    }
                }
            }

            var attributesParsed = false;

            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "note":
                            ParseNoteBeat(c, bars);
                            break;
                        case "forward":
                            ParseForward(c, bars);
                            break;
                        case "direction":
                            ParseDirection(c, masterBar);
                            break;
                        case "attributes":
                            if (!attributesParsed)
                            {
                                ParseAttributes(c, bars, masterBar);
                                attributesParsed = true;
                            }
                            break;
                        case "harmony":
                            ParseHarmony(c, track);
                            break;
                        case "sound":
                            // TODO
                            break;
                        case "barline":
                            ParseBarline(c, masterBar);
                            break;
                    }
                }
            }

            return true;
        }

        private Beat GetOrCreateBeat(XmlNode element, Bar[] bars, bool chord)
        {
            int voiceIndex = 0;
            var voiceNodes = element.GetElementsByTagName("voice");
            if (voiceNodes.Length > 0)
            {
                voiceIndex = Std.ParseInt(voiceNodes[0].InnerText) - 1;
            }

            var previousBeatWasPulled = _previousBeatWasPulled;
            _previousBeatWasPulled = false;
            var staffElement = element.GetElementsByTagName("staff");
            int staff = 1;
            if (staffElement.Length > 0)
            {
                staff = Std.ParseInt(staffElement[0].InnerText);

                // in case we have a beam with a staff-jump we pull the note to the previous staff
                if ((_isBeamContinue || previousBeatWasPulled) && _previousBeat.Voice.Bar.Staff.Index != staff - 1)
                {
                    staff = _previousBeat.Voice.Bar.Staff.Index + 1;
                    _previousBeatWasPulled = true;
                }

                var staffId = bars[0].Staff.Track.Index + "-" + staff;
                if (!_voiceOfStaff.ContainsKey(staffId))
                {
                    _voiceOfStaff[staffId] = voiceIndex;
                }
                voiceIndex -= _voiceOfStaff[staffId];
            }
            var bar = bars[staff - 1];

            Beat beat;
            var voice = GetOrCreateVoice(bar, voiceIndex);
            if (chord || (voice.Beats.Count == 1 && voice.IsEmpty))
            {
                beat = voice.Beats[voice.Beats.Count - 1];
            }
            else
            {
                beat = new Beat();
                beat.IsEmpty = false;
                voice.AddBeat(beat);
            }

            _isBeamContinue = false;
            _previousBeat = beat;

            return beat;
        }

        private void ParseForward(XmlNode element, Bar[] bars)
        {
            var beat = GetOrCreateBeat(element, bars, false);
            var durationInDivisions = Std.ParseInt(element.FindChildElement("duration").InnerText);

            var duration = (durationInDivisions * (int)Duration.Quarter) / (float)_divisionsPerQuarterNote;

            var durations = new[]
            {
                (int) Duration.SixtyFourth,
                (int) Duration.ThirtySecond,
                (int) Duration.Sixteenth,
                (int) Duration.Eighth,
                (int) Duration.Quarter,
                (int) Duration.Half,
                (int) Duration.Whole
            };
            foreach (var d in durations)
            {
                if (duration >= d)
                {
                    beat.Duration = (Duration)d;
                    duration -= d;
                    break;
                }
            }

            if (duration > 0)
            {
                // TODO: Handle remaining duration 
                // (additional beats, dotted durations,...)
            }

            beat.IsEmpty = false;
        }

        private void ParseStaffDetails(XmlNode element, Track track)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "staff-lines":
                            track.Tuning = new int[Std.ParseInt(c.InnerText)];
                            break;
                        case "staff-tuning":
                            ParseStaffTuning(c, track);
                            break;
                    }
                }
            }

            if (IsEmptyTuning(track.Tuning))
            {
                track.Tuning = new int[0];
            }
        }

        private void ParseStaffTuning(XmlNode element, Track track)
        {
            var line = Std.ParseInt(element.GetAttribute("line"));
            string tuningStep = "C";
            string tuningOctave = "";
            int tuningAlter = 0;
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "tuning-step":
                            tuningStep = c.InnerText;
                            break;
                        case "tuning-alter":
                            tuningAlter = Std.ParseInt(c.InnerText);
                            break;
                        case "tuning-octave":
                            tuningOctave = c.InnerText;
                            break;
                    }
                }
            }

            track.Tuning[track.Tuning.Length - line] = TuningParser.GetTuningForText(tuningStep + tuningOctave) + tuningAlter;
        }

        private string _currentChord;
        private int _divisionsPerQuarterNote;

        private void ParseHarmony(XmlNode element, Track track)
        {
            var root = element.FindChildElement("root");
            var rootStep = root.FindChildElement("root-step").InnerText;
            var kind = element.FindChildElement("kind").InnerText;

            var chord = new Chord();
            chord.Name = rootStep;
            // TODO: find proper names for the rest
            //switch (kind)
            //{
            //    // triads
            //    case "major":
            //        break;
            //    case "minor":
            //        chord.Name += "m";
            //        break;
            //    // Sevenths
            //    case "augmented":
            //        break;
            //    case "diminished":
            //        break;
            //    case "dominant":
            //        break;
            //    case "major-seventh":
            //        chord.Name += "7M";
            //        break;
            //    case "minor-seventh":
            //        chord.Name += "m7";
            //        break;
            //    case "diminished-seventh":
            //        break;
            //    case "augmented-seventh":
            //        break;
            //    case "half-diminished":
            //        break;
            //    case "major-minor":
            //        break;
            //    // Sixths
            //    case "major-sixth":
            //        break;
            //    case "minor-sixth":
            //        break;
            //    // Ninths
            //    case "dominant-ninth":
            //        break;
            //    case "major-ninth":
            //        break;
            //    case "minor-ninth":
            //        break;
            //    // 11ths
            //    case "dominant-11th":
            //        break;
            //    case "major-11th":
            //        break;
            //    case "minor-11th":
            //        break;
            //    // 13ths
            //    case "dominant-13th":
            //        break;
            //    case "major-13th":
            //        break;
            //    case "minor-13th":
            //        break;
            //    // Suspended
            //    case "suspended-second":
            //        break;
            //    case "suspended-fourth":
            //        break;
            //    // Functional sixths
            //    case "Neapolitan":
            //        break;
            //    case "Italian":
            //        break;
            //    case "French":
            //        break;
            //    case "German":
            //        break;
            //    // Other
            //    case "pedal":
            //        break;
            //    case "power":
            //        break;
            //    case "Tristan":
            //        break;
            //}

            //var degree = element.GetElementsByTagName("degree");
            //if (degree.Length > 0)
            //{
            //    var degreeValue = Std.GetNodeValue(degree[0].GetElementsByTagName("degree-value")[0]);
            //    var degreeAlter = Std.GetNodeValue(degree[0].GetElementsByTagName("degree-alter")[0]);
            //    var degreeType = Std.GetNodeValue(degree[0].GetElementsByTagName("degree-type")[0]);

            //    if (!string.IsNullOrEmpty(degreeType))
            //    {
            //        chord.Name += degreeType;
            //    }

            //    if (!string.IsNullOrEmpty(degreeValue))
            //    {
            //        chord.Name += "#" + degreeValue;
            //    }
            //}


            _currentChord = Std.NewGuid();
            track.Chords[_currentChord] = chord;
        }

        private void ParseBarline(XmlNode element, MasterBar masterBar)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "repeat":
                            ParseRepeat(c, masterBar);
                            break;
                        case "ending":
                            ParseEnding(c, masterBar);
                            break;
                    }
                }
            }
        }

        private void ParseEnding(XmlNode element, MasterBar masterBar)
        {
            var number = Std.ParseInt(element.GetAttribute("number"));
            if (number > 0)
            {
                --number;
                masterBar.AlternateEndings |= (byte)(0x01 << number);
            }
        }

        private void ParseRepeat(XmlNode element, MasterBar masterBar)
        {
            var direction = element.GetAttribute("direction");
            var times = Std.ParseInt(element.GetAttribute("times"));
            if (times < 0)
            {
                times = 2;
            }

            if (direction == "backward")
            {
                masterBar.RepeatCount = times;
            }
            else if (direction == "forward")
            {
                masterBar.IsRepeatStart = true;
            }
        }

        private FastDictionary<string, int> _voiceOfStaff = new FastDictionary<string, int>();
        private bool _isBeamContinue;
        private bool _previousBeatWasPulled;
        private Beat _previousBeat;

        private void ParseNoteBeat(XmlNode element, Bar[] bars)
        {
            var chord = element.GetElementsByTagName("chord").Length > 0;
            var beat = GetOrCreateBeat(element, bars, chord);

            beat.ChordId = _currentChord;
            _currentChord = null;

            var note = new Note();
            beat.Voice.IsEmpty = false;
            beat.IsEmpty = false;
            beat.AddNote(note);

            beat.Dots = 0;
            foreach (var c in element.ChildNodes)
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
                            if (beat.IsRest)
                            {
                                // unit: divisions per quarter note
                                var duration = Std.ParseInt(c.InnerText);
                                switch (duration)
                                {
                                    case 1:
                                        beat.Duration = Duration.Whole;
                                        break;
                                    case 2:
                                        beat.Duration = Duration.Half;
                                        break;
                                    case 4:
                                        beat.Duration = Duration.Quarter;
                                        break;
                                    case 8:
                                        beat.Duration = Duration.Eighth;
                                        break;
                                    case 16:
                                        beat.Duration = Duration.Sixteenth;
                                        break;
                                    case 32:
                                        beat.Duration = Duration.ThirtySecond;
                                        break;
                                    case 64:
                                        beat.Duration = Duration.SixtyFourth;
                                        break;
                                    default:
                                        beat.Duration = Duration.Quarter;
                                        break;
                                }
                            }
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
                            beat.Duration = GetDuration(c.InnerText);
                            if (beat.GraceType != GraceType.None && beat.Duration < Duration.Sixteenth)
                            {
                                beat.Duration = Duration.Eighth;
                            }
                            break;
                        case "dot":
                            beat.Dots++;
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
                            var beamMode = c.InnerText;
                            if (beamMode == "continue")
                            {
                                _isBeamContinue = true;
                            }
                            break;
                        case "notations":
                            ParseNotations(c, beat, note);
                            break;
                        case "lyric":
                            ParseLyric(c, beat);
                            break;
                        // "full-note"
                        case "pitch":
                            ParsePitch(c, note);
                            break;
                        case "unpitched":
                            ParseUnpitched(c, note);
                            break;
                        case "rest":
                            beat.IsEmpty = false;
                            beat.Notes = new FastList<Note>();
                            break;
                    }
                }
            }

            // check if new note is duplicate on string
            if (note.IsStringed)
            {
                for (int i = 0; i < beat.Notes.Count; i++)
                {
                    if (beat.Notes[i].String == note.String && beat.Notes[i] != note)
                    {
                        beat.RemoveNote(note);
                        break;
                    }
                }
            }
        }

        private Duration GetDuration(string text)
        {
            switch (text)
            {
                case "256th":
                case "128th":
                case "64th":
                    return Duration.SixtyFourth;
                case "32nd":
                    return Duration.ThirtySecond;
                case "16th":
                    return Duration.Sixteenth;
                case "eighth":
                    return Duration.Eighth;
                case "quarter":
                    return Duration.Quarter;
                case "half":
                    return Duration.Half;
                case "long":
                case "breve":
                case "whole":
                    return Duration.Whole;
            }

            return Duration.Quarter;
        }

        private void ParseLyric(XmlNode element, Beat beat)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "text":
                            if (!string.IsNullOrEmpty(beat.Text))
                            {
                                beat.Text += " " + c.InnerText;
                            }
                            else
                            {
                                beat.Text = c.InnerText;
                            }
                            break;
                    }
                }
            }
        }

        private void ParseAccidental(XmlNode element, Note note)
        {
            switch (element.InnerText)
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
                case "double-sharp":
                    break;
                case "sharp-sharp":
                    break;
                case "flat-flat":
                    break;
                case "natural-sharp":
                    break;
                case "natural-flat":
                    break;
                case "quarter-flat":
                    break;
                case "quarter-sharp":
                    break;
                case "three-quarters-flat":
                    break;
                case "three-quarters-sharp":
                    break;
            }
        }

        private static void ParseTied(XmlNode element, Note note)
        {
            if (note.Beat.GraceType != GraceType.None) return;

            if (element.GetAttribute("type") == "start")
            {
                note.IsTieOrigin = true;
            }
            else
            {
                note.IsTieDestination = true;
            }
        }

        private void ParseNotations(XmlNode element, Beat beat, Note note)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "articulations":
                            ParseArticulations(c, note);
                            break;
                        case "tied":
                            ParseTied(c, note);
                            break;
                        case "slide":
                        case "glissando":
                            if (c.GetAttribute("type") == "start")
                            {
                                note.SlideType = SlideType.Shift;
                            }
                            break;
                        case "dynamics":
                            ParseDynamics(c, beat);
                            break;
                        case "technical":
                            ParseTechnical(c, note);
                            break;
                        case "ornaments":
                            ParseOrnaments(c, note);
                            break;
                        case "slur":
                            if (c.GetAttribute("type") == "start")
                            {
                                beat.IsLegatoOrigin = true;
                            }
                            break;
                    }
                }
            }
        }

        private void ParseOrnaments(XmlNode element, Note note)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "tremolo":
                            var tremoloSpeed = Std.ParseInt(c.InnerText);
                            switch (tremoloSpeed)
                            {
                                case 1:
                                    note.Beat.TremoloSpeed = Duration.Eighth;
                                    break;
                                case 2:
                                    note.Beat.TremoloSpeed = Duration.Sixteenth;
                                    break;
                                case 3:
                                    note.Beat.TremoloSpeed = Duration.ThirtySecond;
                                    break;
                            }
                            break;
                    }
                }
            }
        }

        private void ParseTechnical(XmlNode element, Note note)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "string":
                            note.String = Std.ParseInt(c.InnerText);
                            if (note.String != int.MinValue)
                            {
                                note.String = note.Beat.Voice.Bar.Staff.Track.Tuning.Length - note.String + 1;
                            }
                            break;
                        case "fret":
                            note.Fret = Std.ParseInt(c.InnerText);
                            break;
                    }
                }
            }

            if (note.String == int.MinValue || note.Fret == int.MinValue)
            {
                note.String = -1;
                note.Fret = -1;
            }
        }

        private void ParseArticulations(XmlNode element, Note note)
        {
            foreach (var c in element.ChildNodes)
            {
                switch (c.LocalName)
                {
                    case "accent":
                        note.Accentuated = AccentuationType.Normal;
                        break;
                    case "strong-accent":
                        note.Accentuated = AccentuationType.Heavy;
                        break;
                    case "staccato":
                    case "detached-legato":
                        note.IsStaccato = true;
                        break;
                }
            }
        }

        private void ParseDynamics(XmlNode element, Beat beat)
        {
            foreach (var c in element.ChildNodes)
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
            }
        }

        private void ParseTimeModification(XmlNode element, Beat beat)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "actual-notes":
                            beat.TupletNumerator = Std.ParseInt(c.InnerText);
                            break;
                        case "normal-notes":
                            beat.TupletDenominator = Std.ParseInt(c.InnerText);
                            break;
                            //case "normal-type":
                            //    break;
                            //case "normal-dot":
                            //    break;
                    }
                }
            }
        }

        private void ParseUnpitched(XmlNode element, Note note)
        {
            string step = null;
            int semitones = 0;
            int octave = 0;
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "display-step":
                            step = c.InnerText;
                            break;
                        case "display-alter":
                            semitones = Std.ParseInt(c.InnerText);
                            break;
                        case "display-octave":
                            // 0-9, 4 for middle C
                            octave = Std.ParseInt(c.InnerText);
                            break;
                    }
                }
            }

            var value = octave * 12 + TuningParser.GetToneForText(step) + semitones;

            note.Octave = (value / 12);
            note.Tone = value - (note.Octave * 12);
        }

        private void ParsePitch(XmlNode element, Note note)
        {
            string step = null;
            float semitones = 0;
            int octave = 0;
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "step":
                            step = c.InnerText;
                            break;
                        case "alter":
                            semitones = Std.ParseFloat(c.InnerText);
                            if (float.IsNaN(semitones))
                            {
                                semitones = 0;
                            }
                            break;
                        case "octave":
                            // 0-9, 4 for middle C
                            octave = Std.ParseInt(c.InnerText);
                            break;
                    }
                }
            }

            var value = octave * 12 + TuningParser.GetToneForText(step) + (int)semitones;

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

        private void ParseDirection(XmlNode element, MasterBar masterBar)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "sound":
                            var tempo = c.GetAttribute("tempo");
                            if (!string.IsNullOrEmpty(tempo))
                            {
                                var tempoAutomation = new Automation();
                                tempoAutomation.IsLinear = true;
                                tempoAutomation.Type = AutomationType.Tempo;
                                tempoAutomation.Value = Std.ParseInt(tempo);
                                masterBar.TempoAutomation = tempoAutomation;
                            }
                            break;
                        case "direction-type":
                            var directionType = c.FirstElement;
                            switch (directionType.LocalName)
                            {
                                case "words":
                                    masterBar.Section = new Section();
                                    masterBar.Section.Text = directionType.InnerText;
                                    break;
                                case "metronome":
                                    ParseMetronome(c.FirstElement, masterBar);
                                    break;
                            }
                            break;
                    }
                }
            }
        }

        private void ParseMetronome(XmlNode element, MasterBar masterBar)
        {
            var unit = Duration.Quarter;
            int perMinute = 120;
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "beat-unit":
                            unit = GetDuration(c.InnerText);
                            break;
                        case "per-minute":
                            perMinute = Std.ParseInt(c.InnerText);
                            break;
                    }
                }
            }

            var tempoAutomation = masterBar.TempoAutomation = new Automation();
            tempoAutomation.Type = AutomationType.Tempo;
            tempoAutomation.Value = perMinute * ((int) unit / 4);
        }

        private void ParseAttributes(XmlNode element, Bar[] bars, MasterBar masterBar)
        {
            int number;
            bool hasTime = false;
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "divisions":
                            _divisionsPerQuarterNote = Std.ParseInt(c.InnerText);
                            break;
                        case "key":
                            ParseKey(c, masterBar);
                            break;
                        case "time":
                            ParseTime(c, masterBar);
                            hasTime = true;
                            break;
                        case "clef":
                            number = Std.ParseInt(c.GetAttribute("number"));
                            if (number == int.MinValue)
                            {
                                number = 1;
                            }
                            ParseClef(c, bars[number - 1]);
                            break;
                        case "staff-details":
                            number = Std.ParseInt(c.GetAttribute("number"));
                            if (number == int.MinValue)
                            {
                                number = 1;
                            }
                            ParseStaffDetails(c, bars[number - 1].Staff.Track);
                            break;
                    }
                }
            }

            if (!hasTime)
            {
                masterBar.TimeSignatureCommon = true;
            }
        }

        private void ParseClef(XmlNode element, Bar bar)
        {
            string sign = null;
            int line = 0;
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "sign":
                            sign = c.InnerText;
                            break;
                        case "line":
                            line = Std.ParseInt(c.InnerText);
                            break;
                        case "clef-octave-change":
                            switch (Std.ParseInt(c.InnerText))
                            {
                                case -2:
                                    bar.ClefOttavia = ClefOttavia._15mb;
                                    break;
                                case -1:
                                    bar.ClefOttavia = ClefOttavia._8vb;
                                    break;
                                case 1:
                                    bar.ClefOttavia = ClefOttavia._8va;
                                    break;
                                case 2:
                                    bar.ClefOttavia = ClefOttavia._15mb;
                                    break;
                            }
                            break;
                    }
                }
            }

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
                default:
                    bar.Clef = Clef.G2;
                    break;
            }
        }

        private void ParseTime(XmlNode element, MasterBar masterBar)
        {
            if (element.GetAttribute("symbol") == "common")
            {
                masterBar.TimeSignatureCommon = true;
            }
            bool beatsParsed = false;
            bool beatTypeParsed = false;
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    var v = c.InnerText;
                    switch (c.LocalName)
                    {
                        case "beats":
                            if (!beatsParsed)
                            {
                                if (!v.Contains("+")) // compound TS
                                {
                                    masterBar.TimeSignatureNumerator = Std.ParseInt(v);
                                }
                                else
                                {
                                    masterBar.TimeSignatureNumerator = 4;
                                }
                                beatsParsed = true;
                            }
                            break;
                        case "beat-type":
                            if (!beatTypeParsed)
                            {
                                if (!v.Contains("+")) // compound TS
                                {
                                    masterBar.TimeSignatureDenominator = Std.ParseInt(v);
                                }
                                else
                                {
                                    masterBar.TimeSignatureDenominator = 4;
                                }
                                beatTypeParsed = true;
                            }
                            break;
                    }
                }
            }
        }

        private void ParseKey(XmlNode element, MasterBar masterBar)
        {
            int fifths = int.MinValue;
            int keyStep = int.MinValue;
            int keyAlter = int.MinValue;
            string mode = null;
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "fifths":
                            fifths = Std.ParseInt(c.InnerText);
                            break;
                        case "key-step":
                            keyStep = Std.ParseInt(c.InnerText);
                            break;
                        case "key-alter":
                            keyAlter = Std.ParseInt(c.InnerText);
                            break;
                        case "mode":
                            mode = c.InnerText;
                            break;
                    }
                }
            }

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

        private void ParseIdentification(XmlNode element)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "creator":
                            if (c.GetAttribute("type") == "composer")
                            {
                                _score.Words = c.InnerText;
                            }
                            break;
                        case "rights":
                            if (!string.IsNullOrEmpty(_score.Copyright))
                            {
                                _score.Copyright += "\n";
                            }
                            _score.Copyright += c.InnerText;
                            break;
                    }
                }
            }
        }

        private void ParsePartList(XmlNode element)
        {
            foreach (var c in element.ChildNodes)
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
            }

        }

        private void ParseScorePart(XmlNode element)
        {
            string id = element.GetAttribute("id");
            var track = new Track(1);
            _trackById[id] = track;
            _score.AddTrack(track);
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "part-name":
                            track.Name = c.InnerText;
                            break;
                        case "part-abbreviation":
                            track.ShortName = c.InnerText;
                            break;
                        case "midi-instrument":
                            ParseMidiInstrument(c, track);
                            break;
                    }
                }
            }

            if (IsEmptyTuning(track.Tuning))
            {
                track.Tuning = new int[0];
            }
        }

        private bool IsEmptyTuning(int[] tuning)
        {
            if (tuning == null)
            {
                return true;
            }

            for (int i = 0; i < tuning.Length; i++)
            {
                if (tuning[i] != 0)
                {
                    return false;
                }
            }
            return true;
        }

        private void ParseMidiInstrument(XmlNode element, Track track)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "midi-channel":
                            track.PlaybackInfo.PrimaryChannel = Std.ParseInt(c.InnerText);
                            break;
                        case "midi-program":
                            track.PlaybackInfo.Program = Std.ParseInt(c.InnerText);
                            break;
                        case "midi-volume":
                            track.PlaybackInfo.Volume = Std.ParseInt(c.InnerText);
                            break;
                    }
                }
            }
        }


    }
}