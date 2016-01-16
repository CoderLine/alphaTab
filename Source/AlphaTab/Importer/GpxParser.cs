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
using AlphaTab.Xml;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This structure represents a duration within a gpx model.
    /// </summary>
    public class GpxRhythm
    {
        public int Dots { get; set; }
        public int TupletDenominator { get; set; }
        public int TupletNumerator { get; set; }
        public Duration Value { get; set; }

        public GpxRhythm()
        {
            TupletDenominator = 1;
            TupletNumerator = 1;
            Value = Duration.Quarter;
        }
    }

    /// <summary>
    /// This public class can parse a score.gpif xml file into the model structure
    /// </summary>
    public class GpxParser
    {
        private const string InvalidId = "-1";
        /// <summary>
        /// GPX range: 0-100
        /// Internal range: 0 - 60
        /// </summary>
        private const float BendPointPositionFactor = 60.0f / 100.0f;
        /// <summary>
        /// GPX Range: 0-300      
        /// Internal Range: 0-12
        /// </summary>
        private const float BendPointValueFactor = 12f / 300f;

        public Score Score { get; set; }


        private FastDictionary<string, FastList<Automation>> _automations;
        private string[] _tracksMapping;
        private FastDictionary<string, Track> _tracksById; // contains tracks by their id

        private FastList<MasterBar> _masterBars; // contains all masterbars in correct order
        private FastList<string[]> _barsOfMasterBar; // contains ids of bars placed at this masterbar over all tracks (sequencially)

        private FastDictionary<string, Bar> _barsById; // contains bars by their id
        private FastDictionary<string, string[]> _voicesOfBar; // contains ids of voices stored in a bar (key = bar id)

        private FastDictionary<string, Voice> _voiceById; // contains voices by their id
        private FastDictionary<string, string[]> _beatsOfVoice; // contains ids of beats stored in a voice (key = voice id) 

        private FastDictionary<string, string> _rhythmOfBeat; // contains ids of rhythm used by a beat (key = beat id)
        private FastDictionary<string, Beat> _beatById; // contains beats by their id

        private FastDictionary<string, GpxRhythm> _rhythmById; // contains rhythms by their id

        private FastDictionary<string, Note> _noteById; // contains notes by their id
        private FastDictionary<string, string[]> _notesOfBeat; // contains ids of notes stored in a beat (key = beat id);
        private FastDictionary<string, bool> _tappedNotes; // contains a flag indicating whether a note is tapped (key = note id);


        public void ParseXml(string xml)
        {
            _automations = new FastDictionary<string, FastList<Automation>>();
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
            _rhythmById = new FastDictionary<string, GpxRhythm>();
            _notesOfBeat = new FastDictionary<string, string[]>();
            _noteById = new FastDictionary<string, Note>();
            _tappedNotes = new FastDictionary<string, bool>();

            ParseDom(Std.LoadXml(xml));
        }

        #region Xml Parsing

        private void ParseDom(IXmlDocument dom)
        {
            var root = dom.DocumentElement;
            if (root == null) return;

            // the XML uses IDs for referring elements within the 
            // model. Therefore we do the parsing in 2 steps:
            // - at first we read all model elements and store them by ID in a lookup table
            // - after that we need to join up the information. 
            if (root.LocalName == "GPIF")
            {
                Score = new Score();

                // parse all children
                root.IterateChildren(n =>
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
                });
            }
            else
            {
                throw new UnsupportedFormatException();
            }

            BuildModel();
        }

        //
        // <Score>...</Score>
        // 

        private void ParseScoreNode(IXmlNode element)
        {
            element.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Title":
                            Score.Title = GetValue(c.FirstChild);
                            break;
                        case "SubTitle":
                            Score.SubTitle = GetValue(c.FirstChild);
                            break;
                        case "Artist":
                            Score.Artist = GetValue(c.FirstChild);
                            break;
                        case "Album":
                            Score.Album = GetValue(c.FirstChild);
                            break;
                        case "Words":
                            Score.Words = GetValue(c.FirstChild);
                            break;
                        case "Music":
                            Score.Music = GetValue(c.FirstChild);
                            break;
                        case "WordsAndMusic":
                            if (c.FirstChild != null && c.FirstChild.ToString() != "")
                            {
                                var wordsAndMusic = GetValue(c.FirstChild);
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
                            Score.Copyright = GetValue(c.FirstChild);
                            break;
                        case "Tabber":
                            Score.Tab = GetValue(c.FirstChild);
                            break;
                        case "Instructions":
                            Score.Instructions = GetValue(c.FirstChild);
                            break;
                        case "Notices":
                            Score.Notices = GetValue(c.FirstChild);
                            break;
                    }
                }
            });
        }

        //
        // <MasterTrack>...</MasterTrack>
        //  

        private void ParseMasterTrackNode(IXmlNode node)
        {
            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Automations":
                            ParseAutomations(c);
                            break;
                        case "Tracks":
                            _tracksMapping = GetValue(c).Split(' ');
                            break;
                    }
                }
            });
        }

        private void ParseAutomations(IXmlNode node)
        {
            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Automation":
                            ParseAutomation(c);
                            break;
                    }
                }
            });
        }

        private void ParseAutomation(IXmlNode node)
        {
            string type = null;
            bool isLinear = false;
            string barId = null;
            float ratioPosition = 0;
            float value = 0;
            int reference = 0;
            string text = null;

            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Type":
                            type = GetValue(c);
                            break;
                        case "Linear":
                            isLinear = GetValue(c).ToLower() == "true";
                            break;
                        case "Bar":
                            barId = GetValue(c);
                            break;
                        case "Position":
                            ratioPosition = Std.ParseFloat(GetValue(c));
                            break;
                        case "Value":
                            var parts = GetValue(c).Split(' ');
                            value = Std.ParseFloat(parts[0]);
                            reference = Std.ParseInt(parts[1]);
                            break;
                        case "Text":
                            text = GetValue(c);
                            break;
                    }
                }
            });

            if (type == null) return;
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
                if (!_automations.ContainsKey(barId))
                {
                    _automations[barId] = new FastList<Automation>();
                }
                _automations[barId].Add(automation);
            }
        }

        //
        // <Tracks>...</Tracks>
        //  

        private void ParseTracksNode(IXmlNode node)
        {
            node.IterateChildren(c =>
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
            });
        }

        private void ParseTrack(IXmlNode node)
        {
            var track = new Track();
            var trackId = node.Attributes.Get("id").Value;

            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Name":
                            track.Name = GetValue(c);
                            break;
                        case "ShortName":
                            track.ShortName = GetValue(c);
                            break;
                        //TODO: case "Lyrics": parseLyrics(track, c);
                        case "Properties":
                            ParseTrackProperties(track, c);
                            break;
                        case "GeneralMidi":
                            ParseGeneralMidi(track, c);
                            break;
                        case "PlaybackState":
                            var state = GetValue(c);
                            track.PlaybackInfo.IsSolo = state == "Solo";
                            track.PlaybackInfo.IsMute = state == "Mute";
                            break;
                    }
                }
            });

            _tracksById[trackId] = track;
        }

        private void ParseDiagramCollection(Track track, IXmlNode node)
        {
            var items = FindChildElement(node, "Items");
            items.IterateChildren(c =>
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
            });
        }

        private void ParseDiagramItem(Track track, IXmlNode node)
        {
            var chord = new Chord();
            var chordId = node.Attributes.Get("id").Value;
            chord.Name = node.Attributes.Get("name").Value;
            track.Chords[chordId] = chord;
        }

        private IXmlNode FindChildElement(IXmlNode node, string name)
        {
            for (int i = 0; i < node.ChildNodes.Count; i++)
            {
                var c = node.ChildNodes.Get(i);
                if (c != null && c.NodeType == XmlNodeType.Element && c.LocalName == name)
                {
                    return c;
                }
            }
            return null;
        }

        private void ParseTrackProperties(Track track, IXmlNode node)
        {
            node.IterateChildren(c =>
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
            });
        }

        private void ParseTrackProperty(Track track, IXmlNode node)
        {
            var propertyName = node.Attributes.Get("name").Value;
            switch (propertyName)
            {
                case "Tuning":
                    var tuningParts = GetValue(FindChildElement(node, "Pitches")).Split(' ');
                    var tuning = new int[tuningParts.Length];
                    for (int i = 0; i < tuning.Length; i++)
                    {
                        tuning[tuning.Length - 1 - i] = Std.ParseInt(tuningParts[i]);
                    }
                    track.Tuning = tuning;
                    break;
                case "DiagramCollection":
                    ParseDiagramCollection(track, node);
                    break;
                case "CapoFret":
                    track.Capo = Std.ParseInt(GetValue(FindChildElement(node, "Fret")));
                    break;
            }
        }

        private void ParseGeneralMidi(Track track, IXmlNode node)
        {
            track.PlaybackInfo.Port = Std.ParseInt(GetValue(FindChildElement(node, "Port")));
            track.PlaybackInfo.Program = Std.ParseInt(GetValue(FindChildElement(node, "Program")));
            track.PlaybackInfo.PrimaryChannel = Std.ParseInt(GetValue(FindChildElement(node, "PrimaryChannel")));
            track.PlaybackInfo.SecondaryChannel = Std.ParseInt(GetValue(FindChildElement(node, "SecondaryChannel")));

            track.IsPercussion = (node.Attributes.Get("table") != null &&
                                  node.Attributes.Get("table").Value == "Percussion");
        }

        //
        // <MasterBars>...</MasterBars>
        //  

        private void ParseMasterBarsNode(IXmlNode node)
        {
            node.IterateChildren(c =>
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
            });
        }

        private void ParseMasterBar(IXmlNode node)
        {
            var masterBar = new MasterBar();
            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Time":
                            var timeParts = GetValue(c).Split('/');
                            masterBar.TimeSignatureNumerator = Std.ParseInt(timeParts[0]);
                            masterBar.TimeSignatureDenominator = Std.ParseInt(timeParts[1]);
                            break;
                        case "DoubleBar":
                            masterBar.IsDoubleBar = true;
                            break;
                        case "Section":
                            masterBar.Section = new Section();
                            masterBar.Section.Marker = GetValue(FindChildElement(c, "Letter"));
                            masterBar.Section.Text = GetValue(FindChildElement(c, "Text"));
                            break;
                        case "Repeat":
                            if (c.Attributes.Get("start").Value.ToLower() == "true")
                            {
                                masterBar.IsRepeatStart = true;
                            }
                            if (c.Attributes.Get("end").Value.ToLower() == "true" && c.Attributes.Get("count").Value != null)
                            {
                                masterBar.RepeatCount = Std.ParseInt(c.Attributes.Get("count").Value);
                            }
                            break;
                        // TODO case "Directions": // Coda segno etc. 
                        case "AlternateEndings":
                            var alternateEndings = GetValue(c).Split(' ');
                            var i = 0;
                            for (int k = 0; k < alternateEndings.Length; k++)
                            {
                                i |= 1 << (-1 + Std.ParseInt(alternateEndings[k]));
                            }
                            masterBar.AlternateEndings = (byte)i;
                            break;
                        case "Bars":
                            _barsOfMasterBar.Add(GetValue(c).Split(' '));
                            break;
                        case "TripletFeel":
                            switch (GetValue(c))
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
                            masterBar.KeySignature = Std.ParseInt(GetValue(FindChildElement(c, "AccidentalCount")));
                            break;
                    }
                }
            });
            _masterBars.Add(masterBar);
        }

        //
        // <Bars>...</Bars>
        //  

        private void ParseBars(IXmlNode node)
        {
            node.IterateChildren(c =>
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
            });
        }

        private void ParseBar(IXmlNode node)
        {
            var bar = new Bar();
            var barId = node.Attributes.Get("id").Value;

            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Voices":
                            _voicesOfBar[barId] = GetValue(c).Split(' ');
                            break;
                        case "Clef":
                            switch (GetValue(c))
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
                            // case "SimileMark":
                    }
                }
            });

            _barsById[barId] = bar;
        }

        //
        // <Voices>...</Voices>
        // 

        private void ParseVoices(IXmlNode node)
        {
            node.IterateChildren(c =>
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
            });
        }

        private void ParseVoice(IXmlNode node)
        {
            var voice = new Voice();
            var voiceId = node.Attributes.Get("id").Value;

            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Beats":
                            _beatsOfVoice[voiceId] = GetValue(c).Split(' ');
                            break;
                    }
                }
            });

            _voiceById[voiceId] = voice;
        }

        //
        // <Beats>...</Beats>
        // 

        private void ParseBeats(IXmlNode node)
        {
            node.IterateChildren(c =>
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
            });
        }

        private void ParseBeat(IXmlNode node)
        {
            var beat = new Beat();
            var beatId = node.Attributes.Get("id").Value;

            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Notes":
                            _notesOfBeat[beatId] = GetValue(c).Split(' ');
                            break;
                        case "Rhythm":
                            _rhythmOfBeat[beatId] = c.Attributes.Get("ref").Value;
                            break;
                        case "Fadding":
                            if (GetValue(c) == "FadeIn")
                            {
                                beat.FadeIn = true;
                            }
                            break;
                        case "Tremolo":
                            switch (GetValue(c))
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
                            beat.ChordId = GetValue(c);
                            break;
                        case "Hairpin":
                            switch (GetValue(c))
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
                            if (GetValue(c) == "Up")
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
                        case "FreeText":
                            beat.Text = GetValue(c);
                            break;
                        case "Dynamic":
                            switch (GetValue(c))
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
                            switch (GetValue(c))
                            {
                                case "OnBeat":
                                    beat.GraceType = GraceType.OnBeat;
                                    break;
                                case "BeforeBeat":
                                    beat.GraceType = GraceType.BeforeBeat;
                                    break;
                            }
                            break;
                    }
                }
            });

            _beatById[beatId] = beat;
        }

        private void ParseBeatProperties(IXmlNode node, Beat beat)
        {
            bool isWhammy = false;
            BendPoint whammyOrigin = null;
            int? whammyMiddleValue = null;
            int? whammyMiddleOffset1 = null;
            int? whammyMiddleOffset2 = null;
            BendPoint whammyDestination = null;

            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Property":
                            var name = c.Attributes.Get("name").Value;
                            switch (name)
                            {
                                case "Brush":
                                    if (GetValue(FindChildElement(c, "Direction")) == "Up")
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
                                    if (GetValue(FindChildElement(c, "Direction")) == "Up")
                                    {
                                        beat.PickStroke = PickStrokeType.Up;
                                    }
                                    else
                                    {
                                        beat.PickStroke = PickStrokeType.Down;
                                    }
                                    break;
                                // TODO: brush duration
                                case "Slapped":
                                    if (FindChildElement(c, "Enable") != null)
                                        beat.Slap = true;
                                    break;
                                case "Popped":
                                    if (FindChildElement(c, "Enable") != null)
                                        beat.Pop = true;
                                    break;
                                case "VibratoWTremBar":
                                    switch (GetValue(FindChildElement(c, "Strength")))
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

                                case "WhammyBarOriginValue":
                                    if (whammyOrigin == null) whammyOrigin = new BendPoint();
                                    whammyOrigin.Value = ToBendValue(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;
                                case "WhammyBarOriginOffset":
                                    if (whammyOrigin == null) whammyOrigin = new BendPoint();
                                    whammyOrigin.Offset = ToBendOffset(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;

                                case "WhammyBarMiddleValue":
                                    whammyMiddleValue = ToBendValue(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;

                                case "WhammyBarMiddleOffset1":
                                    whammyMiddleOffset1 = ToBendOffset(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;
                                case "WhammyBarMiddleOffset2":
                                    whammyMiddleOffset2 = ToBendOffset(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;

                                case "WhammyBarDestinationValue":
                                    if (whammyDestination == null)
                                        whammyDestination = new BendPoint(BendPoint.MaxPosition);
                                    whammyDestination.Value = ToBendValue(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;

                                case "WhammyBarDestinationOffset":
                                    if (whammyDestination == null) whammyDestination = new BendPoint();
                                    whammyDestination.Offset = ToBendOffset(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));

                                    break;
                            }
                            break;
                    }
                }
            });

            if (isWhammy)
            {
                if (whammyOrigin == null) whammyOrigin = new BendPoint();
                if (whammyDestination == null) whammyDestination = new BendPoint(BendPoint.MaxPosition);
                var whammy = new FastList<BendPoint>();
                whammy.Add(whammyOrigin);

                if (whammyMiddleOffset1 != null && whammyMiddleValue != null)
                {
                    whammy.Add(new BendPoint(whammyMiddleOffset1.Value, whammyMiddleValue.Value));
                }
                if (whammyMiddleOffset2 != null && whammyMiddleValue != null)
                {
                    whammy.Add(new BendPoint(whammyMiddleOffset2.Value, whammyMiddleValue.Value));
                }

                if (whammyMiddleOffset1 == null && whammyMiddleOffset2 == null && whammyMiddleValue != null)
                {
                    whammy.Add(new BendPoint(BendPoint.MaxPosition / 2, whammyMiddleValue.Value));
                }
                whammy.Add(whammyDestination);
                beat.WhammyBarPoints = whammy;
            }
        }

        //
        // <Notes>...</Notes>
        // 

        private void ParseNotes(IXmlNode node)
        {
            node.IterateChildren(c =>
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
            });
        }

        private void ParseNote(IXmlNode node)
        {
            var note = new Note();
            var noteId = node.Attributes.Get("id").Value;

            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Properties":
                            ParseNoteProperties(c, note, noteId);
                            break;
                        case "AntiAccent":
                            if (GetValue(c).ToLower() == "normal")
                            {
                                note.IsGhost = true;
                            }
                            break;
                        case "LetRing":
                            note.IsLetRing = true;
                            break;
                        case "Trill":
                            note.TrillValue = Std.ParseInt(GetValue(c));
                            note.TrillSpeed = Duration.Sixteenth;
                            break;
                        case "Accent":
                            var accentFlags = Std.ParseInt(GetValue(c));
                            if ((accentFlags & 0x01) != 0)
                                note.IsStaccato = true;
                            if ((accentFlags & 0x04) != 0)
                                note.Accentuated = AccentuationType.Heavy;
                            if ((accentFlags & 0x08) != 0)
                                note.Accentuated = AccentuationType.Normal;
                            break;
                        case "Tie":
                            if (c.Attributes.Get("origin").Value.ToLower() == "true")
                            {
                                note.IsTieOrigin = true;
                            }
                            if (c.Attributes.Get("destination").Value.ToLower() == "true")
                            {
                                note.IsTieDestination = true;
                            }
                            break;
                        case "Vibrato":
                            switch (GetValue(c))
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
                            switch (GetValue(c))
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
                            switch (GetValue(c))
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
            });

            _noteById[noteId] = note;
        }

        private void ParseNoteProperties(IXmlNode node, Note note, string noteId)
        {
            bool isBended = false;
            BendPoint bendOrigin = null;
            int? bendMiddleValue = null;
            int? bendMiddleOffset1 = null;
            int? bendMiddleOffset2 = null;
            BendPoint bendDestination = null;

            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "Property":
                            var name = c.Attributes.Get("name").Value;
                            switch (name)
                            {
                                case "String":
                                    note.String = Std.ParseInt(GetValue(FindChildElement(c, "String"))) + 1;
                                    break;
                                case "Fret":
                                    note.Fret = Std.ParseInt(GetValue(FindChildElement(c, "Fret")));
                                    break;
                                case "Tapped":
                                    _tappedNotes[noteId] = true;
                                    break;
                                case "HarmonicType":
                                    var htype = FindChildElement(c, "HType");
                                    if (htype != null)
                                    {
                                        switch (GetValue(htype))
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
                                    var hfret = FindChildElement(c, "HFret");
                                    if (hfret != null)
                                    {
                                        note.HarmonicValue = Std.ParseFloat(GetValue(hfret));
                                    }
                                    break;
                                case "Muted":
                                    if (FindChildElement(c, "Enable") != null)
                                        note.IsDead = true;
                                    break;
                                case "PalmMuted":
                                    if (FindChildElement(c, "Enable") != null)
                                        note.IsPalmMute = true;
                                    break;
                                // case "Element": 
                                // case "Variation": 
                                // case "Tone": 
                                case "Octave":
                                    note.Octave = Std.ParseInt(GetValue(FindChildElement(c, "Number"))) - 1;
                                    break;
                                case "Tone":
                                    note.Tone = Std.ParseInt(GetValue(FindChildElement(c, "Step")));
                                    break;
                                case "Bended":
                                    isBended = true;
                                    break;

                                case "BendOriginValue":
                                    if (bendOrigin == null) bendOrigin = new BendPoint();
                                    bendOrigin.Value = ToBendValue(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;
                                case "BendOriginOffset":
                                    if (bendOrigin == null) bendOrigin = new BendPoint();
                                    bendOrigin.Offset = ToBendOffset(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;

                                case "BendMiddleValue":
                                    bendMiddleValue = ToBendValue(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;

                                case "BendMiddleOffset1":
                                    bendMiddleOffset1 = ToBendOffset(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;
                                case "BendMiddleOffset2":
                                    bendMiddleOffset2 = ToBendOffset(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;

                                case "BendDestinationValue":
                                    if (bendDestination == null) bendDestination = new BendPoint(BendPoint.MaxPosition);
                                    // NOTE: If we directly cast the expression of value to (int) it is 3 instead of 4, strange compiler
                                    // optimizations happening here: 
                                    // (int)(Std.ParseFloat(GetValue(FindChildElement(c, "Float")))* BendPointValueFactor) => (int)(100f * 0.04f) => 3
                                    // (Std.ParseFloat(GetValue(FindChildElement(c, "Float")))* BendPointValueFactor) => (100f * 0.04f) => 4.0
                                    bendDestination.Value = ToBendValue(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;

                                case "BendDestinationOffset":
                                    if (bendDestination == null) bendDestination = new BendPoint();
                                    bendDestination.Offset = ToBendOffset(Std.ParseFloat(GetValue(FindChildElement(c, "Float"))));
                                    break;

                                case "HopoOrigin":
                                    if (FindChildElement(c, "Enable") != null)
                                        note.IsHammerPullOrigin = true;
                                    break;
                                case "HopoDestination":
                                    // NOTE: gets automatically calculated 
                                    // if (FindChildElement(node, "Enable") != null)
                                    //     note.isHammerPullDestination = true;
                                    break;
                                case "Slide":
                                    var slideFlags = Std.ParseInt(GetValue(FindChildElement(c, "Flags")));
                                    if ((slideFlags & 0x01) != 0)
                                        note.SlideType = SlideType.Shift;
                                    if ((slideFlags & 0x02) != 0)
                                        note.SlideType = SlideType.Legato;
                                    if ((slideFlags & 0x04) != 0)
                                        note.SlideType = SlideType.OutDown;
                                    if ((slideFlags & 0x08) != 0)
                                        note.SlideType = SlideType.OutUp;
                                    if ((slideFlags & 0x10) != 0)
                                        note.SlideType = SlideType.IntoFromBelow;
                                    if ((slideFlags & 0x20) != 0)
                                        note.SlideType = SlideType.IntoFromAbove;
                                    break;
                            }
                            break;
                    }
                }
            });

            if (isBended)
            {
                if (bendOrigin == null) bendOrigin = new BendPoint();
                if (bendDestination == null) bendDestination = new BendPoint(BendPoint.MaxPosition);
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

        private int ToBendValue(float gpxValue)
        {
            // NOTE: strange IEEE behavior here: 
            // (int)(100f * 0.04f) => 3
            // (100f*0.04f) => 4.0f => (int)4.0f => 4
            var converted = gpxValue*BendPointValueFactor;
            return (int)(converted);
        }

        private int ToBendOffset(float gpxOffset)
        {
            var converted = gpxOffset * BendPointPositionFactor;
            return (int)(converted);
        }

        private void ParseRhythms(IXmlNode node)
        {
            node.IterateChildren(c =>
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
            });
        }

        private void ParseRhythm(IXmlNode node)
        {
            var rhythm = new GpxRhythm();
            var rhythmId = node.Attributes.Get("id").Value;
            node.IterateChildren(c =>
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.LocalName)
                    {
                        case "NoteValue":
                            switch (GetValue(c))
                            {
                                // case "Long":
                                // case "DoubleWhole":
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
                                    // case "128th":
                                    // case "256th":
                                    break;
                            }
                            break;
                        case "PrimaryTuplet":
                            rhythm.TupletNumerator = Std.ParseInt(c.Attributes.Get("num").Value);
                            rhythm.TupletDenominator = Std.ParseInt(c.Attributes.Get("den").Value);
                            break;
                        case "AugmentationDot":
                            rhythm.Dots = Std.ParseInt(c.Attributes.Get("count").Value);
                            break;
                    }
                }
            });

            _rhythmById[rhythmId] = rhythm;
        }

        private string GetValue(IXmlNode n)
        {
            return Std.GetNodeValue(n);
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

            // build tracks (not all, only those used by the score)
            var trackIndex = 0;
            foreach (var trackId in _tracksMapping)
            {
                var track = _tracksById[trackId];
                Score.AddTrack(track);

                // iterate all bar definitions for the masterbars
                // and add the correct bar to the track
                for (int i = 0, j = _barsOfMasterBar.Count; i < j; i++)
                {
                    var barIds = _barsOfMasterBar[i];
                    var barId = barIds[trackIndex];
                    if (barId != InvalidId)
                    {
                        track.AddBar(_barsById[barId]);
                    }
                }

                trackIndex++;
            }

            // build bars
            foreach (var barId in _barsById.Keys)
            {
                var bar = _barsById[barId];
                if (_voicesOfBar.ContainsKey(barId))
                {
                    // add voices to bars
                    foreach (var voiceId in _voicesOfBar[barId])
                    {
                        if (voiceId != InvalidId)
                        {
                            bar.AddVoice(_voiceById[voiceId]);
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
            }

            // build beats
            foreach (var beatId in _beatById.Keys)
            {
                var beat = _beatById[beatId];
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
                            beat.AddNote(_noteById[noteId]);
                            if (_tappedNotes.ContainsKey(noteId))
                            {
                                beat.Tap = true;
                            }
                        }
                    }
                }
            }

            // build voices
            foreach (var voiceId in _voiceById.Keys)
            {
                var voice = _voiceById[voiceId];
                if (_beatsOfVoice.ContainsKey(voiceId))
                {
                    // add beats to voices
                    foreach (var beatId in _beatsOfVoice[voiceId])
                    {
                        if (beatId != InvalidId)
                        {
                            // important! we clone the beat because beats get reused
                            // in gp6, our model needs to have unique beats.
                            voice.AddBeat(_beatById[beatId].Clone());
                        }
                    }
                }
            }


           

            // build automations
            foreach (var barId in _automations.Keys)
            {
                var bar = _barsById[barId];
                for (int i = 0, j = bar.Voices.Count; i < j; i++)
                {
                    var v = bar.Voices[i];
                    if (v.Beats.Count > 0)
                    {
                        for (int k = 0, l = _automations[barId].Count; k < l; k++)
                        {
                            var automation = _automations[barId][k];
                            v.Beats[0].Automations.Add(automation);
                        }
                    }
                }
            }


            // build automations
            foreach (var barId in _automations.Keys)
            {
                var automations = _automations[barId];
                var bar = _barsById[barId];
                for (int i = 0, j = automations.Count; i < j; i++)
                {
                    var automation = automations[i];
                    if (automation.Type == AutomationType.Tempo)
                    {
                        if (barId == "0") // // TODO find the correct first bar id
                        {
                            Score.Tempo = (int)(automation.Value);
                            Score.TempoLabel = automation.Text;
                        }

                        bar.MasterBar.TempoAutomation = automation;
                    }
                }
            }
        }

        #endregion
    }
}
