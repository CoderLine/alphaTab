﻿using System;
using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform.Model;
using AlphaTab.Xml;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This structure represents a duration within a gpif model.
    /// </summary>
    internal class GpifRhythm
    {
        public int Dots { get; set; }
        public int TupletDenominator { get; set; }
        public int TupletNumerator { get; set; }
        public Duration Value { get; set; }

        public GpifRhythm()
        {
            TupletDenominator = -1;
            TupletNumerator = -1;
            Value = Duration.Quarter;
        }
    }

    /// <summary>
    /// This public class can parse a score.gpif xml file into the model structure
    /// </summary>
    internal class GpifParser
    {
        private const string InvalidId = "-1";

        /// <summary>
        /// GPX range: 0-100
        /// Internal range: 0 - 60
        /// </summary>
        private const float BendPointPositionFactor = 60.0f / 100.0f;

        /// <summary>
        /// GPIF: 25 per quarternote
        /// Internal Range: 1 per quarter note
        /// </summary>
        private const double BendPointValueFactor = 1 / 25.0;

        public Score Score { get; set; }


        private FastDictionary<string, FastList<Automation>> _masterTrackAutomations;
        private string[] _tracksMapping;
        private FastDictionary<string, Track> _tracksById; // contains tracks by their id

        private FastList<MasterBar> _masterBars; // contains all masterbars in correct order

        private FastList<string[]>
            _barsOfMasterBar; // contains ids of bars placed at this masterbar over all tracks (sequencially)

        private FastDictionary<string, Bar> _barsById; // contains bars by their id
        private FastDictionary<string, string[]> _voicesOfBar; // contains ids of voices stored in a bar (key = bar id)

        private FastDictionary<string, Voice> _voiceById; // contains voices by their id

        private FastDictionary<string, string[]>
            _beatsOfVoice; // contains ids of beats stored in a voice (key = voice id)

        private FastDictionary<string, string> _rhythmOfBeat; // contains ids of rhythm used by a beat (key = beat id)
        private FastDictionary<string, Beat> _beatById; // contains beats by their id

        private FastDictionary<string, GpifRhythm> _rhythmById; // contains rhythms by their id

        private FastDictionary<string, Note> _noteById; // contains notes by their id

        private FastDictionary<string, string[]>
            _notesOfBeat; // contains ids of notes stored in a beat (key = beat id);

        private FastDictionary<string, bool>
            _tappedNotes; // contains a flag indicating whether a note is tapped (key = note id);

        private FastDictionary<string, FastList<Lyrics>> _lyricsByTrack;
        private bool _hasAnacrusis;

        public void ParseXml(string xml, Settings settings)
        {
            _masterTrackAutomations = new FastDictionary<string, FastList<Automation>>();
            _tracksMapping = new string[0];
            _tracksById = new FastDictionary<string, Track>();
            _masterBars = new FastList<MasterBar>();
            _barsOfMasterBar = new FastList<string[]>();
            _voicesOfBar = new FastDictionary<string, string[]>();
            _barsById = new FastDictionary<string, Bar>();
            _voiceById = new FastDictionary<string, Voice>();
            _beatsOfVoice = new FastDictionary<string, string[]>();
            _beatById = new FastDictionary<string, Beat>();
            _rhythmOfBeat = new FastDictionary<string, string>();
            _rhythmById = new FastDictionary<string, GpifRhythm>();
            _notesOfBeat = new FastDictionary<string, string[]>();
            _noteById = new FastDictionary<string, Note>();
            _tappedNotes = new FastDictionary<string, bool>();
            _lyricsByTrack = new FastDictionary<string, FastList<Lyrics>>();

            XmlDocument dom;
            try
            {
                dom = new XmlDocument(xml);
            }
            catch (Exception)
            {
                throw new UnsupportedFormatException();
            }

            ParseDom(dom);

            BuildModel();

            Score.Finish(settings);

            if (_lyricsByTrack.Count > 0)
            {
                foreach (var trackId in _lyricsByTrack)
                {
                    var track = _tracksById[trackId];
                    track.ApplyLyrics(_lyricsByTrack[trackId]);
                }
            }
        }

        #region Xml Parsing

        private void ParseDom(XmlDocument dom)
        {
            var root = dom.DocumentElement;
            if (root == null)
            {
                return;
            }

            // the XML uses IDs for referring elements within the
            // model. Therefore we do the parsing in 2 steps:
            // - at first we read all model elements and store them by ID in a lookup table
            // - after that we need to join up the information.
            if (root.LocalName == "GPIF")
            {
                Score = new Score();

                // parse all children
                foreach (var n in root.ChildNodes)
                {
                    if (n.NodeType == XmlNodeType.Element)
                    {
                        switch (n.LocalName)
                        {
                            case "Score":
                                ParseScoreNode(n);
                                break;
                            case "MasterTrack":
                                ParseMasterTrackNode(n);
                                break;
                            case "Tracks":
                                ParseTracksNode(n);
                                break;
                            case "MasterBars":
                                ParseMasterBarsNode(n);
                                break;
                            case "Bars":
                                ParseBars(n);
                                break;
                            case "Voices":
                                ParseVoices(n);
                                break;
                            case "Beats":
                                ParseBeats(n);
                                break;
                            case "Notes":
                                ParseNotes(n);
                                break;
                            case "Rhythms":
                                ParseRhythms(n);
                                break;
                        }
                    }
                }
            }
            else
            {
                throw new UnsupportedFormatException();
            }
        }

        //
        // <Score>...</Score>
        //

        private void ParseScoreNode(XmlNode element)
        {
            foreach (var c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Title":
                            Score.Title = c.FirstChild.InnerText;
                            break;
                        case "SubTitle":
                            Score.SubTitle = c.FirstChild.InnerText;
                            break;
                        case "Artist":
                            Score.Artist = c.FirstChild.InnerText;
                            break;
                        case "Album":
                            Score.Album = c.FirstChild.InnerText;
                            break;
                        case "Words":
                            Score.Words = c.FirstChild.InnerText;
                            break;
                        case "Music":
                            Score.Music = c.FirstChild.InnerText;
                            break;
                        case "WordsAndMusic":
                            if (c.FirstChild != null && c.FirstChild.InnerText != "")
                            {
                                var wordsAndMusic = c.FirstChild.InnerText;
                                if (!string.IsNullOrEmpty(wordsAndMusic) && string.IsNullOrEmpty(Score.Words))
                                {
                                    Score.Words = wordsAndMusic;
                                }

                                if (!string.IsNullOrEmpty(wordsAndMusic) && string.IsNullOrEmpty(Score.Music))
                                {
                                    Score.Music = wordsAndMusic;
                                }
                            }

                            break;
                        case "Copyright":
                            Score.Copyright = c.FirstChild.InnerText;
                            break;
                        case "Tabber":
                            Score.Tab = c.FirstChild.InnerText;
                            break;
                        case "Instructions":
                            Score.Instructions = c.FirstChild.InnerText;
                            break;
                        case "Notices":
                            Score.Notices = c.FirstChild.InnerText;
                            break;
                    }
                }
            }
        }

        //
        // <MasterTrack>...</MasterTrack>
        //

        private void ParseMasterTrackNode(XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Automations":
                            ParseAutomations(c, _masterTrackAutomations);
                            break;
                        case "Tracks":
                            _tracksMapping = c.InnerText.Split(' ');
                            break;
                        case "Anacrusis":
                            _hasAnacrusis = true;
                            break;
                    }
                }
            }
        }

        private void ParseAutomations(XmlNode node, FastDictionary<string, FastList<Automation>> automations)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Automation":
                            ParseAutomation(c, automations);
                            break;
                    }
                }
            }
        }

        private void ParseAutomation(XmlNode node, FastDictionary<string, FastList<Automation>> automations)
        {
            string type = null;
            var isLinear = false;
            string barId = null;
            float ratioPosition = 0;
            float value = 0;
            var reference = 0;
            string text = null;

            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Type":
                            type = c.InnerText;
                            break;
                        case "Linear":
                            isLinear = c.InnerText.ToLower() == "true";
                            break;
                        case "Bar":
                            barId = c.InnerText;
                            break;
                        case "Position":
                            ratioPosition = Platform.Platform.ParseFloat(c.InnerText);
                            break;
                        case "Value":
                            var parts = c.InnerText.Split(' ');
                            value = Platform.Platform.ParseFloat(parts[0]);
                            reference = Platform.Platform.ParseInt(parts[1]);
                            break;
                        case "Text":
                            text = c.InnerText;
                            break;
                    }
                }
            }

            if (type == null)
            {
                return;
            }

            Automation automation = null;
            switch (type)
            {
                case "Tempo":
                    automation = Automation.BuildTempoAutomation(isLinear, ratioPosition, value, reference);
                    break;
                // TODO: other automations
            }

            if (automation != null)
            {
                automation.Text = text;
            }

            if (barId != null)
            {
                if (!automations.ContainsKey(barId))
                {
                    automations[barId] = new FastList<Automation>();
                }

                automations[barId].Add(automation);
            }
        }

        //
        // <Tracks>...</Tracks>
        //

        private void ParseTracksNode(XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Track":
                            ParseTrack(c);
                            break;
                    }
                }
            }
        }

        private void ParseTrack(XmlNode node)
        {
            var track = new Track(1);
            var staff = track.Staves[0];
            staff.ShowStandardNotation = true;
            var trackId = node.GetAttribute("id");

            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Name":
                            track.Name = c.InnerText;
                            break;
                        case "Color":
                            var parts = c.InnerText.Split(' ');
                            if (parts.Length >= 3)
                            {
                                var r = Platform.Platform.ParseInt(parts[0]);
                                var g = Platform.Platform.ParseInt(parts[1]);
                                var b = Platform.Platform.ParseInt(parts[2]);
                                track.Color = new Color((byte)r, (byte)g, (byte)b);
                            }

                            break;
                        case "Instrument":
                            var instrumentName = c.GetAttribute("ref");
                            if (instrumentName.EndsWith("-gs") || instrumentName.EndsWith("GrandStaff"))
                            {
                                track.EnsureStaveCount(2);
                                track.Staves[1].ShowStandardNotation = true;
                            }

                            break;
                        case "InstrumentSet":
                            ParseInstrumentSet(track, c);
                            break;
                        case "ShortName":
                            track.ShortName = c.InnerText;
                            break;
                        case "Lyrics":
                            ParseLyrics(trackId, c);
                            break;
                        case "Properties":
                            ParseTrackProperties(track, c);
                            break;
                        case "GeneralMidi":
                        case "MidiConnection":
                        case "MIDISettings":
                            ParseGeneralMidi(track, c);
                            break;
                        case "Sounds":
                            ParseSounds(track, c);
                            break;
                        case "PlaybackState":
                            var state = c.InnerText;
                            track.PlaybackInfo.IsSolo = state == "Solo";
                            track.PlaybackInfo.IsMute = state == "Mute";
                            break;
                        case "PartSounding":
                            ParsePartSounding(track, c);
                            break;
                        case "Staves":
                            ParseStaves(track, c);
                            break;
                        case "Transpose":
                            ParseTranspose(track, c);
                            break;
                    }
                }
            }

            _tracksById[trackId] = track;
        }

        private void ParseInstrumentSet(Track track, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Type":
                            switch (c.InnerText)
                            {
                                case "drumKit":
                                    foreach (var staff in track.Staves)
                                    {
                                        staff.IsPercussion = true;
                                    }

                                    break;
                            }

                            if (c.InnerText == "drumKit")
                            {
                                foreach (var staff in track.Staves)
                                {
                                    staff.IsPercussion = true;
                                }
                            }

                            break;
                    }
                }
            }
        }

        private void ParseStaves(Track track, XmlNode node)
        {
            var staffIndex = 0;
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Staff":
                            track.EnsureStaveCount(staffIndex + 1);
                            var staff = track.Staves[staffIndex];
                            ParseStaff(staff, c);
                            staffIndex++;
                            break;
                    }
                }
            }
        }

        private void ParseStaff(Staff staff, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Properties":
                            ParseStaffProperties(staff, c);
                            break;
                    }
                }
            }
        }

        private void ParseStaffProperties(Staff staff, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Property":
                            ParseStaffProperty(staff, c);
                            break;
                    }
                }
            }
        }

        private void ParseStaffProperty(Staff staff, XmlNode node)
        {
            var propertyName = node.GetAttribute("name");
            switch (propertyName)
            {
                case "Tuning":
                    var tuningParts = node.FindChildElement("Pitches").InnerText.Split(' ');
                    var tuning = new int[tuningParts.Length];
                    for (var i = 0; i < tuning.Length; i++)
                    {
                        tuning[tuning.Length - 1 - i] = Platform.Platform.ParseInt(tuningParts[i]);
                    }

                    staff.Tuning = tuning;
                    if (!staff.IsPercussion)
                    {
                        staff.ShowTablature = true;
                    }

                    break;
                case "DiagramCollection":
                case "ChordCollection":
                    ParseDiagramCollection(staff, node);
                    break;
                case "CapoFret":
                    var capo = Platform.Platform.ParseInt(node.FindChildElement("Fret").InnerText);
                    staff.Capo = capo;
                    break;
            }
        }

        private void ParseLyrics(string trackId, XmlNode node)
        {
            var tracks = new FastList<Lyrics>();
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Line":
                            tracks.Add(ParseLyricsLine(c));
                            break;
                    }
                }
            }

            _lyricsByTrack[trackId] = tracks;
        }

        private Lyrics ParseLyricsLine(XmlNode node)
        {
            var lyrics = new Lyrics();
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Offset":
                            lyrics.StartBar = Platform.Platform.ParseInt(c.InnerText);
                            break;
                        case "Text":
                            lyrics.Text = c.InnerText;
                            break;
                    }
                }
            }

            return lyrics;
        }

        private void ParseDiagramCollection(Track track, XmlNode node)
        {
            var items = node.FindChildElement("Items");
            foreach (var c in items.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Item":
                            ParseDiagramItem(track, c);
                            break;
                    }
                }
            }
        }

        private void ParseDiagramCollection(Staff staff, XmlNode node)
        {
            var items = node.FindChildElement("Items");
            foreach (var c in items.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Item":
                            ParseDiagramItem(staff, c);
                            break;
                    }
                }
            }
        }

        private void ParseDiagramItem(Track track, XmlNode node)
        {
            var chord = new Chord();
            var chordId = node.GetAttribute("id");
            foreach (var staff in track.Staves)
            {
                staff.AddChord(chordId, chord);
            }

            ParseDiagramItem(chord, node);
        }

        private void ParseDiagramItem(Staff staff, XmlNode node)
        {
            var chord = new Chord();
            var chordId = node.GetAttribute("id");
            staff.AddChord(chordId, chord);
            ParseDiagramItem(chord, node);
        }

        private void ParseDiagramItem(Chord chord, XmlNode node)
        {
            chord.Name = node.GetAttribute("name");

            var diagram = node.FindChildElement("Diagram");
            var stringCount = Platform.Platform.ParseInt(diagram.GetAttribute("stringCount"));
            var baseFret = Platform.Platform.ParseInt(diagram.GetAttribute("baseFret"));
            chord.FirstFret = baseFret + 1;
            for (var i = 0; i < stringCount; i++)
            {
                chord.Strings.Add(-1);
            }

            foreach (var c in diagram.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Fret":
                            var guitarString = Platform.Platform.ParseInt(c.GetAttribute("string"));
                            chord.Strings[stringCount - guitarString - 1] =
                                baseFret + Platform.Platform.ParseInt(c.GetAttribute("fret"));
                            break;
                        case "Fingering":
                            var existingFingers = new FastDictionary<Fingers, bool>();

                            foreach (var p in c.ChildNodes)
                            {
                                if (p.NodeType == XmlNodeType.Element)
                                {
                                    switch (p.LocalName)
                                    {
                                        case "Position":
                                            var finger = Fingers.Unknown;
                                            var fret = baseFret + Platform.Platform.ParseInt(p.GetAttribute("fret"));
                                            switch (p.GetAttribute("finger"))
                                            {
                                                case "Index":
                                                    finger = Fingers.IndexFinger;
                                                    break;
                                                case "Middle":
                                                    finger = Fingers.MiddleFinger;
                                                    break;
                                                case "Rank":
                                                    finger = Fingers.AnnularFinger;
                                                    break;
                                                case "Pinky":
                                                    finger = Fingers.LittleFinger;
                                                    break;
                                                case "Thumb":
                                                    finger = Fingers.Thumb;
                                                    break;
                                                case "None":
                                                    break;
                                            }

                                            if (finger != Fingers.Unknown)
                                            {
                                                if (existingFingers.ContainsKey(finger))
                                                {
                                                    chord.BarreFrets.Add(fret);
                                                }
                                                else
                                                {
                                                    existingFingers[finger] = true;
                                                }
                                            }

                                            break;
                                    }
                                }
                            }

                            break;

                        case "Property":
                            switch (c.GetAttribute("name"))
                            {
                                case "ShowName":
                                    chord.ShowName = c.GetAttribute("value") == "true";
                                    break;
                                case "ShowDiagram":
                                    chord.ShowDiagram = c.GetAttribute("value") == "true";
                                    break;
                                case "ShowFingering":
                                    chord.ShowFingering = c.GetAttribute("value") == "true";
                                    break;
                            }

                            break;
                    }
                }
            }
        }


        private void ParseTrackProperties(Track track, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Property":
                            ParseTrackProperty(track, c);
                            break;
                    }
                }
            }
        }

        private void ParseTrackProperty(Track track, XmlNode node)
        {
            var propertyName = node.GetAttribute("name");
            switch (propertyName)
            {
                case "Tuning":
                    var tuningParts = node.FindChildElement("Pitches").InnerText.Split(' ');
                    var tuning = new int[tuningParts.Length];
                    for (var i = 0; i < tuning.Length; i++)
                    {
                        tuning[tuning.Length - 1 - i] = Platform.Platform.ParseInt(tuningParts[i]);
                    }

                    foreach (var staff in track.Staves)
                    {
                        staff.Tuning = tuning;
                        staff.ShowStandardNotation = true;
                        staff.ShowTablature = true;
                    }

                    break;
                case "DiagramCollection":
                case "ChordCollection":
                    ParseDiagramCollection(track, node);
                    break;
                case "CapoFret":
                    var capo = Platform.Platform.ParseInt(node.FindChildElement("Fret").InnerText);
                    foreach (var staff in track.Staves)
                    {
                        staff.Capo = capo;
                    }

                    break;
            }
        }

        private void ParseGeneralMidi(Track track, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Program":
                            track.PlaybackInfo.Program = Platform.Platform.ParseInt(c.InnerText);
                            break;
                        case "Port":
                            track.PlaybackInfo.Port = Platform.Platform.ParseInt(c.InnerText);
                            break;
                        case "PrimaryChannel":
                            track.PlaybackInfo.PrimaryChannel = Platform.Platform.ParseInt(c.InnerText);
                            break;
                        case "SecondaryChannel":
                            track.PlaybackInfo.SecondaryChannel = Platform.Platform.ParseInt(c.InnerText);
                            break;
                    }
                }
            }

            var isPercussion = node.GetAttribute("table") == "Percussion";
            if (isPercussion)
            {
                foreach (var staff in track.Staves)
                {
                    staff.IsPercussion = true;
                }
            }
        }

        private void ParseSounds(Track track, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Sound":
                            ParseSound(track, c);
                            break;
                    }
                }
            }
        }


        private void ParseSound(Track track, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "MIDI":
                            ParseSoundMidi(track, c);
                            break;
                    }
                }
            }
        }

        private void ParseSoundMidi(Track track, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Program":
                            track.PlaybackInfo.Program = Platform.Platform.ParseInt(c.InnerText);
                            break;
                    }
                }
            }
        }

        private void ParsePartSounding(Track track, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "TranspositionPitch":
                            foreach (var staff in track.Staves)
                            {
                                staff.DisplayTranspositionPitch = Platform.Platform.ParseInt(c.InnerText);
                            }

                            break;
                    }
                }
            }
        }

        private void ParseTranspose(Track track, XmlNode node)
        {
            var octave = 0;
            var chromatic = 0;
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Chromatic":
                            chromatic = Platform.Platform.ParseInt(c.InnerText);
                            break;
                        case "Octave":
                            octave = Platform.Platform.ParseInt(c.InnerText);
                            break;
                    }
                }
            }

            foreach (var staff in track.Staves)
            {
                staff.DisplayTranspositionPitch = octave * 12 + chromatic;
            }
        }

        //
        // <MasterBars>...</MasterBars>
        //

        private void ParseMasterBarsNode(XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "MasterBar":
                            ParseMasterBar(c);
                            break;
                    }
                }
            }
        }

        private void ParseMasterBar(XmlNode node)
        {
            var masterBar = new MasterBar();
            if (_masterBars.Count == 0 && _hasAnacrusis)
            {
                masterBar.IsAnacrusis = true;
            }

            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Time":
                            var timeParts = c.InnerText.Split('/');
                            masterBar.TimeSignatureNumerator = Platform.Platform.ParseInt(timeParts[0]);
                            masterBar.TimeSignatureDenominator = Platform.Platform.ParseInt(timeParts[1]);
                            break;
                        case "DoubleBar":
                            masterBar.IsDoubleBar = true;
                            break;
                        case "Section":
                            masterBar.Section = new Section();
                            masterBar.Section.Marker = c.FindChildElement("Letter").InnerText;
                            masterBar.Section.Text = c.FindChildElement("Text").InnerText;
                            break;
                        case "Repeat":
                            if (c.GetAttribute("start").ToLower() == "true")
                            {
                                masterBar.IsRepeatStart = true;
                            }

                            if (c.GetAttribute("end").ToLower() == "true" && c.GetAttribute("count") != null)
                            {
                                masterBar.RepeatCount = Platform.Platform.ParseInt(c.GetAttribute("count"));
                            }

                            break;
                        // TODO case "Directions": // Coda segno etc.
                        case "AlternateEndings":
                            var alternateEndings = c.InnerText.Split(' ');
                            var i = 0;
                            for (var k = 0; k < alternateEndings.Length; k++)
                            {
                                i |= 1 << (-1 + Platform.Platform.ParseInt(alternateEndings[k]));
                            }

                            masterBar.AlternateEndings = (byte)i;
                            break;
                        case "Bars":
                            _barsOfMasterBar.Add(c.InnerText.Split(' '));
                            break;
                        case "TripletFeel":
                            switch (c.InnerText)
                            {
                                case "NoTripletFeel":
                                    masterBar.TripletFeel = TripletFeel.NoTripletFeel;
                                    break;
                                case "Triplet8th":
                                    masterBar.TripletFeel = TripletFeel.Triplet8th;
                                    break;
                                case "Triplet16th":
                                    masterBar.TripletFeel = TripletFeel.Triplet16th;
                                    break;
                                case "Dotted8th":
                                    masterBar.TripletFeel = TripletFeel.Dotted8th;
                                    break;
                                case "Dotted16th":
                                    masterBar.TripletFeel = TripletFeel.Dotted16th;
                                    break;
                                case "Scottish8th":
                                    masterBar.TripletFeel = TripletFeel.Scottish8th;
                                    break;
                                case "Scottish16th":
                                    masterBar.TripletFeel = TripletFeel.Scottish16th;
                                    break;
                            }

                            break;
                        case "Key":
                            masterBar.KeySignature =
                                (KeySignature)Platform.Platform.ParseInt(
                                    c.FindChildElement("AccidentalCount").InnerText);
                            var mode = c.FindChildElement("Mode");
                            if (mode != null)
                            {
                                switch (mode.InnerText.ToLower())
                                {
                                    case "major":
                                        masterBar.KeySignatureType = KeySignatureType.Major;
                                        break;
                                    case "minor":
                                        masterBar.KeySignatureType = KeySignatureType.Minor;
                                        break;
                                }
                            }

                            break;
                        case "Fermatas":
                            ParseFermatas(masterBar, c);
                            break;
                    }
                }
            }

            _masterBars.Add(masterBar);
        }

        private void ParseFermatas(MasterBar masterBar, XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Fermata":
                            ParseFermata(masterBar, c);
                            break;
                    }
                }
            }
        }

        private void ParseFermata(MasterBar masterBar, XmlNode node)
        {
            var offset = 0;
            var fermata = new Fermata();
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Type":
                            switch (c.InnerText)
                            {
                                case "Short":
                                    fermata.Type = FermataType.Short;
                                    break;
                                case "Medium":
                                    fermata.Type = FermataType.Medium;
                                    break;
                                case "Long":
                                    fermata.Type = FermataType.Long;
                                    break;
                            }

                            break;
                        case "Length":
                            fermata.Length = Platform.Platform.ParseFloat(c.InnerText);
                            break;
                        case "Offset":
                            var parts = c.InnerText.Split('/');
                            if (parts.Length == 2)
                            {
                                float numerator = Platform.Platform.ParseInt(parts[0]);
                                float denominator = Platform.Platform.ParseInt(parts[1]);
                                offset = (int)(numerator / denominator * MidiUtils.QuarterTime);
                            }

                            break;
                    }
                }
            }

            masterBar.AddFermata(offset, fermata);
        }

        //
        // <Bars>...</Bars>
        //

        private void ParseBars(XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Bar":
                            ParseBar(c);
                            break;
                    }
                }
            }
        }

        private void ParseBar(XmlNode node)
        {
            var bar = new Bar();
            var barId = node.GetAttribute("id");

            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Voices":
                            _voicesOfBar[barId] = c.InnerText.Split(' ');
                            break;
                        case "Clef":
                            switch (c.InnerText)
                            {
                                case "Neutral":
                                    bar.Clef = Clef.Neutral;
                                    break;
                                case "G2":
                                    bar.Clef = Clef.G2;
                                    break;
                                case "F4":
                                    bar.Clef = Clef.F4;
                                    break;
                                case "C4":
                                    bar.Clef = Clef.C4;
                                    break;
                                case "C3":
                                    bar.Clef = Clef.C3;
                                    break;
                            }

                            break;
                        case "Ottavia":
                            switch (c.InnerText)
                            {
                                case "8va":
                                    bar.ClefOttava = Ottavia._8va;
                                    break;
                                case "15ma":
                                    bar.ClefOttava = Ottavia._15ma;
                                    break;
                                case "8vb":
                                    bar.ClefOttava = Ottavia._8vb;
                                    break;
                                case "15mb":
                                    bar.ClefOttava = Ottavia._15mb;
                                    break;
                            }

                            break;
                        case "SimileMark":
                            switch (c.InnerText)
                            {
                                case "Simple":
                                    bar.SimileMark = SimileMark.Simple;
                                    break;
                                case "FirstOfDouble":
                                    bar.SimileMark = SimileMark.FirstOfDouble;
                                    break;
                                case "SecondOfDouble":
                                    bar.SimileMark = SimileMark.SecondOfDouble;
                                    break;
                            }

                            break;
                    }
                }
            }

            _barsById[barId] = bar;
        }

        //
        // <Voices>...</Voices>
        //

        private void ParseVoices(XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Voice":
                            ParseVoice(c);
                            break;
                    }
                }
            }
        }

        private void ParseVoice(XmlNode node)
        {
            var voice = new Voice();
            var voiceId = node.GetAttribute("id");

            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Beats":
                            _beatsOfVoice[voiceId] = c.InnerText.Split(' ');
                            break;
                    }
                }
            }

            _voiceById[voiceId] = voice;
        }

        //
        // <Beats>...</Beats>
        //

        private void ParseBeats(XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Beat":
                            ParseBeat(c);
                            break;
                    }
                }
            }
        }

        private void ParseBeat(XmlNode node)
        {
            var beat = new Beat();
            var beatId = node.GetAttribute("id");

            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Notes":
                            _notesOfBeat[beatId] = c.InnerText.Split(' ');
                            break;
                        case "Rhythm":
                            _rhythmOfBeat[beatId] = c.GetAttribute("ref");
                            break;
                        case "Fadding":
                            if (c.InnerText == "FadeIn")
                            {
                                beat.FadeIn = true;
                            }

                            break;
                        case "Tremolo":
                            switch (c.InnerText)
                            {
                                case "1/2":
                                    beat.TremoloSpeed = Duration.Eighth;
                                    break;
                                case "1/4":
                                    beat.TremoloSpeed = Duration.Sixteenth;
                                    break;
                                case "1/8":
                                    beat.TremoloSpeed = Duration.ThirtySecond;
                                    break;
                            }

                            break;
                        case "Chord":
                            beat.ChordId = c.InnerText;
                            break;
                        case "Hairpin":
                            switch (c.InnerText)
                            {
                                case "Crescendo":
                                    beat.Crescendo = CrescendoType.Crescendo;
                                    break;
                                case "Decrescendo":
                                    beat.Crescendo = CrescendoType.Decrescendo;
                                    break;
                            }

                            break;
                        case "Arpeggio":
                            if (c.InnerText == "Up")
                            {
                                beat.BrushType = BrushType.ArpeggioUp;
                            }
                            else
                            {
                                beat.BrushType = BrushType.ArpeggioDown;
                            }

                            break;
                        // TODO: brushDuration
                        case "Properties":
                            ParseBeatProperties(c, beat);
                            break;
                        case "XProperties":
                            ParseBeatXProperties(c, beat);
                            break;
                        case "FreeText":
                            beat.Text = c.InnerText;
                            break;
                        case "Dynamic":
                            switch (c.InnerText)
                            {
                                case "PPP":
                                    beat.Dynamic = DynamicValue.PPP;
                                    break;
                                case "PP":
                                    beat.Dynamic = DynamicValue.PP;
                                    break;
                                case "P":
                                    beat.Dynamic = DynamicValue.P;
                                    break;
                                case "MP":
                                    beat.Dynamic = DynamicValue.MP;
                                    break;
                                case "MF":
                                    beat.Dynamic = DynamicValue.MF;
                                    break;
                                case "F":
                                    beat.Dynamic = DynamicValue.F;
                                    break;
                                case "FF":
                                    beat.Dynamic = DynamicValue.FF;
                                    break;
                                case "FFF":
                                    beat.Dynamic = DynamicValue.FFF;
                                    break;
                            }

                            break;
                        case "GraceNotes":
                            switch (c.InnerText)
                            {
                                case "OnBeat":
                                    beat.GraceType = GraceType.OnBeat;
                                    break;
                                case "BeforeBeat":
                                    beat.GraceType = GraceType.BeforeBeat;
                                    break;
                            }

                            break;
                        case "Legato":
                            if (c.GetAttribute("origin") == "true")
                            {
                                beat.IsLegatoOrigin = true;
                            }

                            break;
                        case "Whammy":

                            var whammyOrigin = new BendPoint();
                            whammyOrigin.Value =
                                ToBendValue(Platform.Platform.ParseFloat(c.GetAttribute("originValue")));
                            whammyOrigin.Offset =
                                ToBendOffset(Platform.Platform.ParseFloat(c.GetAttribute("originOffset")));
                            beat.AddWhammyBarPoint(whammyOrigin);

                            var whammyMiddle1 = new BendPoint();
                            whammyMiddle1.Value =
                                ToBendValue(Platform.Platform.ParseFloat(c.GetAttribute("middleValue")));
                            whammyMiddle1.Offset =
                                ToBendOffset(Platform.Platform.ParseFloat(c.GetAttribute("middleOffset1")));
                            beat.AddWhammyBarPoint(whammyMiddle1);


                            var whammyMiddle2 = new BendPoint();
                            whammyMiddle2.Value =
                                ToBendValue(Platform.Platform.ParseFloat(c.GetAttribute("middleValue")));
                            whammyMiddle2.Offset =
                                ToBendOffset(Platform.Platform.ParseFloat(c.GetAttribute("middleOffset2")));
                            beat.AddWhammyBarPoint(whammyMiddle2);

                            var whammyDestination = new BendPoint();
                            whammyDestination.Value =
                                ToBendValue(Platform.Platform.ParseFloat(c.GetAttribute("destinationValue")));
                            whammyDestination.Offset =
                                ToBendOffset(Platform.Platform.ParseFloat(c.GetAttribute("destinationOffset")));
                            beat.AddWhammyBarPoint(whammyDestination);
                            break;
                        case "Ottavia":
                            switch (c.InnerText)
                            {
                                case "8va":
                                    beat.Ottava = Ottavia._8va;
                                    break;
                                case "8vb":
                                    beat.Ottava = Ottavia._8vb;
                                    break;
                                case "15ma":
                                    beat.Ottava = Ottavia._15ma;
                                    break;
                                case "15mb":
                                    beat.Ottava = Ottavia._15mb;
                                    break;
                            }

                            break;
                    }
                }
            }

            _beatById[beatId] = beat;
        }

        private void ParseBeatXProperties(XmlNode node, Beat beat)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "XProperty":
                            var id = c.GetAttribute("id");
                            int val;
                            switch (id)
                            {
                                case "1124204545":
                                    val = Platform.Platform.ParseInt(c.FindChildElement("Int").InnerText);
                                    beat.InvertBeamDirection = val == 1;
                                    break;
                                case "687935489":
                                    val = Platform.Platform.ParseInt(c.FindChildElement("Int").InnerText);
                                    beat.BrushDuration = val;
                                    break;
                            }

                            break;
                    }
                }
            }
        }

        private void ParseBeatProperties(XmlNode node, Beat beat)
        {
            var isWhammy = false;
            BendPoint whammyOrigin = null;
            int? whammyMiddleValue = null;
            int? whammyMiddleOffset1 = null;
            int? whammyMiddleOffset2 = null;
            BendPoint whammyDestination = null;

            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Property":
                            var name = c.GetAttribute("name");
                            switch (name)
                            {
                                case "Brush":
                                    if (c.FindChildElement("Direction").InnerText == "Up")
                                    {
                                        beat.BrushType = BrushType.BrushUp;
                                    }
                                    else
                                    {
                                        beat.BrushType = BrushType.BrushDown;
                                    }

                                    break;
                                // TODO: brush duration
                                case "PickStroke":
                                    if (c.FindChildElement("Direction").InnerText == "Up")
                                    {
                                        beat.PickStroke = PickStroke.Up;
                                    }
                                    else
                                    {
                                        beat.PickStroke = PickStroke.Down;
                                    }

                                    break;
                                // TODO: brush duration
                                case "Slapped":
                                    if (c.FindChildElement("Enable") != null)
                                    {
                                        beat.Slap = true;
                                    }

                                    break;
                                case "Popped":
                                    if (c.FindChildElement("Enable") != null)
                                    {
                                        beat.Pop = true;
                                    }

                                    break;
                                case "VibratoWTremBar":
                                    switch (c.FindChildElement("Strength").InnerText)
                                    {
                                        case "Wide":
                                            beat.Vibrato = VibratoType.Wide;
                                            break;
                                        case "Slight":
                                            beat.Vibrato = VibratoType.Slight;
                                            break;
                                    }

                                    break;
                                case "WhammyBar":
                                    isWhammy = true;
                                    break;
                                case "WhammyBarExtend":
                                    // not clear what this is used for
                                    break;

                                case "WhammyBarOriginValue":
                                    if (whammyOrigin == null)
                                    {
                                        whammyOrigin = new BendPoint();
                                    }

                                    whammyOrigin.Value =
                                        ToBendValue(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;
                                case "WhammyBarOriginOffset":
                                    if (whammyOrigin == null)
                                    {
                                        whammyOrigin = new BendPoint();
                                    }

                                    whammyOrigin.Offset =
                                        ToBendOffset(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;

                                case "WhammyBarMiddleValue":
                                    whammyMiddleValue =
                                        ToBendValue(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;

                                case "WhammyBarMiddleOffset1":
                                    whammyMiddleOffset1 =
                                        ToBendOffset(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;
                                case "WhammyBarMiddleOffset2":
                                    whammyMiddleOffset2 =
                                        ToBendOffset(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;

                                case "WhammyBarDestinationValue":
                                    if (whammyDestination == null)
                                    {
                                        whammyDestination = new BendPoint(BendPoint.MaxPosition);
                                    }

                                    whammyDestination.Value =
                                        ToBendValue(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;

                                case "WhammyBarDestinationOffset":
                                    if (whammyDestination == null)
                                    {
                                        whammyDestination = new BendPoint();
                                    }

                                    whammyDestination.Offset =
                                        ToBendOffset(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));

                                    break;
                            }

                            break;
                    }
                }
            }

            if (isWhammy)
            {
                if (whammyOrigin == null)
                {
                    whammyOrigin = new BendPoint();
                }

                if (whammyDestination == null)
                {
                    whammyDestination = new BendPoint(BendPoint.MaxPosition);
                }

                beat.AddWhammyBarPoint(whammyOrigin);

                if (whammyMiddleOffset1 != null && whammyMiddleValue != null)
                {
                    beat.AddWhammyBarPoint(new BendPoint(whammyMiddleOffset1.Value, whammyMiddleValue.Value));
                }

                if (whammyMiddleOffset2 != null && whammyMiddleValue != null)
                {
                    beat.AddWhammyBarPoint(new BendPoint(whammyMiddleOffset2.Value, whammyMiddleValue.Value));
                }

                if (whammyMiddleOffset1 == null && whammyMiddleOffset2 == null && whammyMiddleValue != null)
                {
                    beat.AddWhammyBarPoint(new BendPoint(BendPoint.MaxPosition / 2, whammyMiddleValue.Value));
                }

                beat.AddWhammyBarPoint(whammyDestination);
            }
        }

        //
        // <Notes>...</Notes>
        //

        private void ParseNotes(XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Note":
                            ParseNote(c);
                            break;
                    }
                }
            }
        }

        private void ParseNote(XmlNode node)
        {
            var note = new Note();
            var noteId = node.GetAttribute("id");

            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Properties":
                            ParseNoteProperties(c, note, noteId);
                            break;
                        case "AntiAccent":
                            if (c.InnerText.ToLower() == "normal")
                            {
                                note.IsGhost = true;
                            }

                            break;
                        case "LetRing":
                            note.IsLetRing = true;
                            break;
                        case "Trill":
                            note.TrillValue = Platform.Platform.ParseInt(c.InnerText);
                            note.TrillSpeed = Duration.Sixteenth;
                            break;
                        case "Accent":
                            var accentFlags = Platform.Platform.ParseInt(c.InnerText);
                            if ((accentFlags & 0x01) != 0)
                            {
                                note.IsStaccato = true;
                            }

                            if ((accentFlags & 0x04) != 0)
                            {
                                note.Accentuated = AccentuationType.Heavy;
                            }

                            if ((accentFlags & 0x08) != 0)
                            {
                                note.Accentuated = AccentuationType.Normal;
                            }

                            break;
                        case "Tie":
                            if (c.GetAttribute("destination").ToLower() == "true")
                            {
                                note.IsTieDestination = true;
                            }

                            break;
                        case "Vibrato":
                            switch (c.InnerText)
                            {
                                case "Slight":
                                    note.Vibrato = VibratoType.Slight;
                                    break;
                                case "Wide":
                                    note.Vibrato = VibratoType.Wide;
                                    break;
                            }

                            break;
                        case "LeftFingering":
                            note.IsFingering = true;
                            switch (c.InnerText)
                            {
                                case "P":
                                    note.LeftHandFinger = Fingers.Thumb;
                                    break;
                                case "I":
                                    note.LeftHandFinger = Fingers.IndexFinger;
                                    break;
                                case "M":
                                    note.LeftHandFinger = Fingers.MiddleFinger;
                                    break;
                                case "A":
                                    note.LeftHandFinger = Fingers.AnnularFinger;
                                    break;
                                case "C":
                                    note.LeftHandFinger = Fingers.LittleFinger;
                                    break;
                            }

                            break;
                        case "RightFingering":
                            note.IsFingering = true;
                            switch (c.InnerText)
                            {
                                case "P":
                                    note.RightHandFinger = Fingers.Thumb;
                                    break;
                                case "I":
                                    note.RightHandFinger = Fingers.IndexFinger;
                                    break;
                                case "M":
                                    note.RightHandFinger = Fingers.MiddleFinger;
                                    break;
                                case "A":
                                    note.RightHandFinger = Fingers.AnnularFinger;
                                    break;
                                case "C":
                                    note.RightHandFinger = Fingers.LittleFinger;
                                    break;
                            }

                            break;
                    }
                }
            }

            _noteById[noteId] = note;
        }

        private void ParseNoteProperties(XmlNode node, Note note, string noteId)
        {
            var isBended = false;
            BendPoint bendOrigin = null;
            int? bendMiddleValue = null;
            int? bendMiddleOffset1 = null;
            int? bendMiddleOffset2 = null;
            BendPoint bendDestination = null;

            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Property":
                            var name = c.GetAttribute("name");
                            switch (name)
                            {
                                case "String":
                                    note.String = Platform.Platform.ParseInt(c.FindChildElement("String").InnerText) +
                                                  1;
                                    break;
                                case "Fret":
                                    note.Fret = Platform.Platform.ParseInt(c.FindChildElement("Fret").InnerText);
                                    break;
                                case "Element":
                                    note.Element = Platform.Platform.ParseInt(c.FindChildElement("Element").InnerText);
                                    break;
                                case "Variation":
                                    note.Variation =
                                        Platform.Platform.ParseInt(c.FindChildElement("Variation").InnerText);
                                    break;
                                case "Tapped":
                                    _tappedNotes[noteId] = true;
                                    break;
                                case "HarmonicType":
                                    var htype = c.FindChildElement("HType");
                                    if (htype != null)
                                    {
                                        switch (htype.InnerText)
                                        {
                                            case "NoHarmonic":
                                                note.HarmonicType = HarmonicType.None;
                                                break;
                                            case "Natural":
                                                note.HarmonicType = HarmonicType.Natural;
                                                break;
                                            case "Artificial":
                                                note.HarmonicType = HarmonicType.Artificial;
                                                break;
                                            case "Pinch":
                                                note.HarmonicType = HarmonicType.Pinch;
                                                break;
                                            case "Tap":
                                                note.HarmonicType = HarmonicType.Tap;
                                                break;
                                            case "Semi":
                                                note.HarmonicType = HarmonicType.Semi;
                                                break;
                                            case "Feedback":
                                                note.HarmonicType = HarmonicType.Feedback;
                                                break;
                                        }
                                    }

                                    break;
                                case "HarmonicFret":
                                    var hfret = c.FindChildElement("HFret");
                                    if (hfret != null)
                                    {
                                        note.HarmonicValue = Platform.Platform.ParseFloat(hfret.InnerText);
                                    }

                                    break;
                                case "Muted":
                                    if (c.FindChildElement("Enable") != null)
                                    {
                                        note.IsDead = true;
                                    }

                                    break;
                                case "PalmMuted":
                                    if (c.FindChildElement("Enable") != null)
                                    {
                                        note.IsPalmMute = true;
                                    }

                                    break;
                                // case "Element":
                                // case "Variation":
                                // case "Tone":
                                case "Octave":
                                    note.Octave = Platform.Platform.ParseInt(c.FindChildElement("Number").InnerText);
                                    break;
                                case "Tone":
                                    note.Tone = Platform.Platform.ParseInt(c.FindChildElement("Step").InnerText);
                                    break;
                                case "Bended":
                                    isBended = true;
                                    break;

                                case "BendOriginValue":
                                    if (bendOrigin == null)
                                    {
                                        bendOrigin = new BendPoint();
                                    }

                                    bendOrigin.Value =
                                        ToBendValue(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;
                                case "BendOriginOffset":
                                    if (bendOrigin == null)
                                    {
                                        bendOrigin = new BendPoint();
                                    }

                                    bendOrigin.Offset =
                                        ToBendOffset(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;

                                case "BendMiddleValue":
                                    bendMiddleValue =
                                        ToBendValue(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;

                                case "BendMiddleOffset1":
                                    bendMiddleOffset1 =
                                        ToBendOffset(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;
                                case "BendMiddleOffset2":
                                    bendMiddleOffset2 =
                                        ToBendOffset(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;

                                case "BendDestinationValue":
                                    if (bendDestination == null)
                                    {
                                        bendDestination = new BendPoint(BendPoint.MaxPosition);
                                    }

                                    // NOTE: If we directly cast the expression of value to (int) it is 3 instead of 4, strange compiler
                                    // optimizations happening here:
                                    // (int)(Platform.ParseFloat(GetValue(c.FindChildElement("Float")))* BendPointValueFactor) => (int)(100f * 0.04f) => 3
                                    // (Platform.ParseFloat(GetValue(c.FindChildElement("Float")))* BendPointValueFactor) => (100f * 0.04f) => 4.0
                                    bendDestination.Value =
                                        ToBendValue(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;

                                case "BendDestinationOffset":
                                    if (bendDestination == null)
                                    {
                                        bendDestination = new BendPoint();
                                    }

                                    bendDestination.Offset =
                                        ToBendOffset(
                                            Platform.Platform.ParseFloat(c.FindChildElement("Float").InnerText));
                                    break;

                                case "HopoOrigin":
                                    if (c.FindChildElement("Enable") != null)
                                    {
                                        note.IsHammerPullOrigin = true;
                                    }

                                    break;
                                case "HopoDestination":
                                    // NOTE: gets automatically calculated
                                    // if (FindChildElement(node, "Enable") != null)
                                    //     note.isHammerPullDestination = true;
                                    break;
                                case "Slide":
                                    var slideFlags = Platform.Platform.ParseInt(c.FindChildElement("Flags").InnerText);
                                    if ((slideFlags & 1) != 0)
                                    {
                                        note.SlideType = SlideType.Shift;
                                    }

                                    if ((slideFlags & 2) != 0)
                                    {
                                        note.SlideType = SlideType.Legato;
                                    }

                                    if ((slideFlags & 4) != 0)
                                    {
                                        note.SlideType = SlideType.OutDown;
                                    }

                                    if ((slideFlags & 8) != 0)
                                    {
                                        note.SlideType = SlideType.OutUp;
                                    }

                                    if ((slideFlags & 16) != 0)
                                    {
                                        note.SlideType = SlideType.IntoFromBelow;
                                    }

                                    if ((slideFlags & 32) != 0)
                                    {
                                        note.SlideType = SlideType.IntoFromAbove;
                                    }

                                    if ((slideFlags & 64) != 0)
                                    {
                                        note.SlideType = SlideType.PickSlideDown;
                                    }

                                    if ((slideFlags & 128) != 0)
                                    {
                                        note.SlideType = SlideType.PickSlideUp;
                                    }

                                    break;
                            }

                            break;
                    }
                }
            }

            if (isBended)
            {
                if (bendOrigin == null)
                {
                    bendOrigin = new BendPoint();
                }

                if (bendDestination == null)
                {
                    bendDestination = new BendPoint(BendPoint.MaxPosition);
                }

                note.AddBendPoint(bendOrigin);

                if (bendMiddleOffset1 != null && bendMiddleValue != null)
                {
                    note.AddBendPoint(new BendPoint(bendMiddleOffset1.Value, bendMiddleValue.Value));
                }

                if (bendMiddleOffset2 != null && bendMiddleValue != null)
                {
                    note.AddBendPoint(new BendPoint(bendMiddleOffset2.Value, bendMiddleValue.Value));
                }

                if (bendMiddleOffset1 == null && bendMiddleOffset2 == null && bendMiddleValue != null)
                {
                    note.AddBendPoint(new BendPoint(BendPoint.MaxPosition / 2, bendMiddleValue.Value));
                }

                note.AddBendPoint(bendDestination);
            }
        }

        private int ToBendValue(double gpxValue)
        {
            return (int)(gpxValue * BendPointValueFactor);
        }

        private int ToBendOffset(float gpxOffset)
        {
            var converted = gpxOffset * BendPointPositionFactor;
            return (int)converted;
        }

        private void ParseRhythms(XmlNode node)
        {
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Rhythm":
                            ParseRhythm(c);
                            break;
                    }
                }
            }
        }

        private void ParseRhythm(XmlNode node)
        {
            var rhythm = new GpifRhythm();
            var rhythmId = node.GetAttribute("id");
            foreach (var c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "NoteValue":
                            switch (c.InnerText)
                            {
                                case "Long":
                                    rhythm.Value = Duration.QuadrupleWhole;
                                    break;
                                case "DoubleWhole":
                                    rhythm.Value = Duration.DoubleWhole;
                                    break;
                                case "Whole":
                                    rhythm.Value = Duration.Whole;
                                    break;
                                case "Half":
                                    rhythm.Value = Duration.Half;
                                    break;
                                case "Quarter":
                                    rhythm.Value = Duration.Quarter;
                                    break;
                                case "Eighth":
                                    rhythm.Value = Duration.Eighth;
                                    break;
                                case "16th":
                                    rhythm.Value = Duration.Sixteenth;
                                    break;
                                case "32nd":
                                    rhythm.Value = Duration.ThirtySecond;
                                    break;
                                case "64th":
                                    rhythm.Value = Duration.SixtyFourth;
                                    break;
                                case "128th":
                                    rhythm.Value = Duration.OneHundredTwentyEighth;
                                    break;
                                case "256th":
                                    rhythm.Value = Duration.TwoHundredFiftySixth;
                                    break;
                            }

                            break;
                        case "PrimaryTuplet":
                            rhythm.TupletNumerator = Platform.Platform.ParseInt(c.GetAttribute("num"));
                            rhythm.TupletDenominator = Platform.Platform.ParseInt(c.GetAttribute("den"));
                            break;
                        case "AugmentationDot":
                            rhythm.Dots = Platform.Platform.ParseInt(c.GetAttribute("count"));
                            break;
                    }
                }
            }

            _rhythmById[rhythmId] = rhythm;
        }

        #endregion

        #region Model Building

        private void BuildModel()
        {
            // build score
            for (int i = 0, j = _masterBars.Count; i < j; i++)
            {
                var masterBar = _masterBars[i];
                Score.AddMasterBar(masterBar);
            }

            // add tracks to score
            foreach (var trackId in _tracksMapping)
            {
                if (string.IsNullOrEmpty(trackId))
                {
                    continue;
                }

                var track = _tracksById[trackId];
                Score.AddTrack(track);
            }

            // process all masterbars
            foreach (var barIds in _barsOfMasterBar)
            {
                // add all bars of masterbar vertically to all tracks
                var staffIndex = 0;
                for (int barIndex = 0, trackIndex = 0;
                    barIndex < barIds.Length && trackIndex < Score.Tracks.Count;
                    barIndex++)
                {
                    var barId = barIds[barIndex];
                    if (barId != InvalidId)
                    {
                        var bar = _barsById[barId];
                        var track = Score.Tracks[trackIndex];
                        var staff = track.Staves[staffIndex];
                        staff.AddBar(bar);


                        if (_voicesOfBar.ContainsKey(barId))
                        {
                            // add voices to bars
                            foreach (var voiceId in _voicesOfBar[barId])
                            {
                                if (voiceId != InvalidId)
                                {
                                    var voice = _voiceById[voiceId];
                                    bar.AddVoice(voice);

                                    if (_beatsOfVoice.ContainsKey(voiceId))
                                    {
                                        // add beats to voices
                                        foreach (var beatId in _beatsOfVoice[voiceId])
                                        {
                                            if (beatId != InvalidId)
                                            {
                                                // important! we clone the beat because beats get reused
                                                // in gp6, our model needs to have unique beats.
                                                var beat = _beatById[beatId].Clone();
                                                voice.AddBeat(beat);

                                                var rhythmId = _rhythmOfBeat[beatId];
                                                var rhythm = _rhythmById[rhythmId];

                                                // set beat duration
                                                beat.Duration = rhythm.Value;
                                                beat.Dots = rhythm.Dots;
                                                beat.TupletNumerator = rhythm.TupletNumerator;
                                                beat.TupletDenominator = rhythm.TupletDenominator;

                                                // add notes to beat
                                                if (_notesOfBeat.ContainsKey(beatId))
                                                {
                                                    foreach (var noteId in _notesOfBeat[beatId])
                                                    {
                                                        if (noteId != InvalidId)
                                                        {
                                                            beat.AddNote(_noteById[noteId].Clone());
                                                            if (_tappedNotes.ContainsKey(noteId))
                                                            {
                                                                beat.Tap = true;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    // invalid voice -> empty voice
                                    var voice = new Voice();
                                    bar.AddVoice(voice);

                                    var beat = new Beat();
                                    beat.IsEmpty = true;
                                    beat.Duration = Duration.Quarter;
                                    voice.AddBeat(beat);
                                }
                            }
                        }


                        // stave is full? -> next track
                        if (staffIndex == track.Staves.Count - 1)
                        {
                            trackIndex++;
                            staffIndex = 0;
                        }
                        else
                        {
                            staffIndex++;
                        }
                    }
                    else
                    {
                        // no bar for track
                        trackIndex++;
                    }
                }
            }

            // build masterbar automations
            foreach (var barIndex in _masterTrackAutomations)
            {
                var automations = _masterTrackAutomations[barIndex];
                var masterBar = Score.MasterBars[Platform.Platform.ParseInt(barIndex)];
                for (int i = 0, j = automations.Count; i < j; i++)
                {
                    var automation = automations[i];
                    if (automation.Type == AutomationType.Tempo)
                    {
                        if (barIndex == "0") // // TODO find the correct first bar id
                        {
                            Score.Tempo = (int)automation.Value;
                            if (automation.Text != null)
                            {
                                Score.TempoLabel = automation.Text;
                            }
                        }

                        masterBar.TempoAutomation = automation;
                    }
                }
            }
        }

        #endregion
    }
}
