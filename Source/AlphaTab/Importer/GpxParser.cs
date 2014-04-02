using System.Collections.Generic;
using System.Text;
using System.Xml;
using AlphaTab.Model;

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
        private const float BendPointValueFactor = 12.0f / 300.0f;

        public Score Score { get; set; }


        private Dictionary<string, List<Automation>> _automations;
        private string[] _tracksMapping;
        private Dictionary<string, Track> _tracksById; // contains tracks by their id

        private List<MasterBar> _masterBars; // contains all masterbars in correct order
        private List<string[]> _barsOfMasterBar; // contains ids of bars placed at this masterbar over all tracks (sequencially)

        private Dictionary<string, Bar> _barsById; // contains bars by their id
        private Dictionary<string, string[]> _voicesOfBar; // contains ids of voices stored in a bar (key = bar id)

        private Dictionary<string, Voice> _voiceById; // contains voices by their id
        private Dictionary<string, string[]> _beatsOfVoice; // contains ids of beats stored in a voice (key = voice id) 

        private Dictionary<string, string> _rhythmOfBeat; // contains ids of rhythm used by a beat (key = beat id)
        private Dictionary<string, Beat> _beatById; // contains beats by their id

        private Dictionary<string, GpxRhythm> _rhythmById; // contains rhythms by their id

        private Dictionary<string, Note> _noteById; // contains notes by their id
        private Dictionary<string, string[]> _notesOfBeat; // contains ids of notes stored in a beat (key = beat id);
        private Dictionary<string, bool> _tappedNotes; // contains a flag indicating whether a note is tapped (key = note id);


        public void ParseXml(string xml)
        {
            _automations = new Dictionary<string, List<Automation>>();
            _tracksMapping = new string[0];
            _tracksById = new Dictionary<string, Track>();
            _masterBars = new List<MasterBar>();
            _barsOfMasterBar = new List<string[]>();
            _voicesOfBar = new Dictionary<string, string[]>();
            _barsById = new Dictionary<string, Bar>();
            _voiceById = new Dictionary<string, Voice>();
            _beatsOfVoice = new Dictionary<string, string[]>();
            _beatById = new Dictionary<string, Beat>();
            _rhythmOfBeat = new Dictionary<string, string>();
            _rhythmById = new Dictionary<string, GpxRhythm>();
            _notesOfBeat = new Dictionary<string, string[]>();
            _noteById = new Dictionary<string, Note>();
            _tappedNotes = new Dictionary<string, bool>();

            var dom = new XmlDocument();
            dom.LoadXml(xml);
            ParseDom(dom);
        }

        #region Xml Parsing

        private void ParseDom(XmlDocument dom)
        {
            var root = dom.DocumentElement;
            if (root == null) return;

            // the XML uses IDs for referring elements within the 
            // model. Therefore we do the parsing in 2 steps:
            // - at first we read all model elements and store them by ID in a lookup table
            // - after that we need to join up the information. 
            if (root.Name == "GPIF")
            {
                Score = new Score();

                // parse all children
                foreach (XmlNode n in root.ChildNodes)
                {
                    if (n.NodeType == XmlNodeType.Element)
                    {
                        switch (n.Name)
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

            BuildModel();
        }

        //
        // <Score>...</Score>
        // 

        private void ParseScoreNode(XmlNode element)
        {
            foreach (XmlNode c in element.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
                                Score.Words = GetValue(c.FirstChild);
                                Score.Music = GetValue(c.FirstChild);
                            }
                            break;
                        case "Copyright":
                            Score.Copyright = GetValue(c.FirstChild);
                            break;
                        case "Tabber":
                            Score.Tab = GetValue(c.FirstChild);
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
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
                    {
                        case "Automations":
                            ParseAutomations(c);
                            break;
                        case "Tracks":
                            _tracksMapping = GetValue(c).Split(' ');
                            break;
                    }
                }
            }
        }

        private void ParseAutomations(XmlNode node)
        {
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
                    {
                        case "Automation":
                            ParseAutomation(c);
                            break;
                    }
                }
            }
        }

        private void ParseAutomation(XmlNode node)
        {
            string type = null;
            bool isLinear = false;
            string barId = null;
            float ratioPosition = 0;
            float value = 0;
            int reference = 0;
            string text = null;

            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
                            ratioPosition = float.Parse(GetValue(c));
                            break;
                        case "Value":
                            var parts = GetValue(c).Split(' ');
                            value = float.Parse(parts[0]);
                            reference = int.Parse(parts[1]);
                            break;
                        case "Text":
                            text = GetValue(c);
                            break;
                    }
                }
            }

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
                    _automations[barId] = new List<Automation>();
                }
                _automations[barId].Add(automation);
            }
        }

        //
        // <Tracks>...</Tracks>
        //  

        private void ParseTracksNode(XmlNode node)
        {
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            var track = new Track();
            var trackId = node.Attributes["id"].Value;

            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            }

            _tracksById[trackId] = track;
        }

        private void ParseDiagramCollection(Track track, XmlNode node)
        {
            var items = FindChildElement(node, "Items");
            foreach (XmlNode c in items.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
                    {
                        case "Item":
                            ParseDiagramItem(track, c);
                            break;
                    }
                }
            }
        }

        private void ParseDiagramItem(Track track, XmlNode node)
        {
            var chord = new Chord();
            var chordId = node.Attributes["id"].Value;
            chord.Name = node.Attributes["name"].Value;
            track.Chords[chordId] = chord;
        }

        private XmlElement FindChildElement(XmlNode node, string name)
        {
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element && c.Name == name)
                {
                    return (XmlElement)c;
                }
            }
            return null;
        }

        private void ParseTrackProperties(Track track, XmlNode node)
        {
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            var propertyName = node.Attributes["name"].Value;
            switch (propertyName)
            {
                case "Tuning":
                    var tuningParts = GetValue(FindChildElement(node, "Pitches")).Split(' ');
                    var tuning = new int[tuningParts.Length];
                    for (int i = 0; i < tuning.Length; i++)
                    {
                        tuning[tuning.Length - 1 - i] = int.Parse(tuningParts[i]);
                    }
                    track.Tuning = new List<int>(tuning);
                    break;
                case "DiagramCollection":
                    ParseDiagramCollection(track, node);
                    break;
                case "CapoFret":
                    track.Capo = int.Parse(GetValue(FindChildElement(node, "Fret")));
                    break;
            }
        }

        private void ParseGeneralMidi(Track track, XmlNode node)
        {
            track.PlaybackInfo.Port = int.Parse(GetValue(FindChildElement(node, "Port")));
            track.PlaybackInfo.Program = int.Parse(GetValue(FindChildElement(node, "Program")));
            track.PlaybackInfo.PrimaryChannel = int.Parse(GetValue(FindChildElement(node, "PrimaryChannel")));
            track.PlaybackInfo.SecondaryChannel = int.Parse(GetValue(FindChildElement(node, "SecondaryChannel")));

            track.IsPercussion = (node.Attributes != null && node.Attributes["table"] != null &&
                                  node.Attributes["table"].Value == "Percussion");
        }

        //
        // <MasterBars>...</MasterBars>
        //  

        private void ParseMasterBarsNode(XmlNode node)
        {
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
                    {
                        case "Time":
                            var timeParts = GetValue(c).Split('/');
                            masterBar.TimeSignatureNumerator = int.Parse(timeParts[0]);
                            masterBar.TimeSignatureDenominator = int.Parse(timeParts[1]);
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
                            if (c.Attributes["start"].Value.ToLower() == "true")
                            {
                                masterBar.IsRepeatStart = true;
                            }
                            if (c.Attributes["end"].Value.ToLower() == "true" && c.Attributes["count"].Value != null)
                            {
                                masterBar.RepeatCount = int.Parse(c.Attributes["count"].Value);
                            }
                            break;
                        // TODO case "Directions": // Coda segno etc. 
                        case "AlternateEndings":
                            var alternateEndings = GetValue(c).Split(' ');
                            var i = 0;
                            for (int k = 0; k < alternateEndings.Length; k++)
                            {
                                i |= 1 << (-1 + int.Parse(alternateEndings[i]));
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
                            masterBar.KeySignature = int.Parse(GetValue(FindChildElement(c, "AccidentalCount")));
                            break;
                    }
                }
            }
            _masterBars.Add(masterBar);
        }

        //
        // <Bars>...</Bars>
        //  

        private void ParseBars(XmlNode node)
        {
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            var barId = node.Attributes["id"].Value;

            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            }

            _barsById[barId] = bar;
        }

        //
        // <Voices>...</Voices>
        // 

        private void ParseVoices(XmlNode node)
        {
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            var voiceId = node.Attributes["id"].Value;

            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
                    {
                        case "Beats":
                            _beatsOfVoice[voiceId] = GetValue(c).Split(' ');
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
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            var beatId = node.Attributes["id"].Value;

            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
                    {
                        case "Notes":
                            _notesOfBeat[beatId] = GetValue(c).Split(' ');
                            break;
                        case "Rhythm":
                            _rhythmOfBeat[beatId] = c.Attributes["ref"].Value;
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
            }

            _beatById[beatId] = beat;
        }

        private void ParseBeatProperties(XmlNode node, Beat beat)
        {
            bool isWhammy = false;
            BendPoint whammyOrigin = null;
            int? whammyMiddleValue = null;
            int? whammyMiddleOffset1 = null;
            int? whammyMiddleOffset2 = null;
            BendPoint whammyDestination = null;

            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
                    {
                        case "Property":
                            var name = c.Attributes["name"].Value;
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
                                    whammyOrigin.Value =
                                        (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointValueFactor);
                                    break;
                                case "WhammyBarOriginOffset":
                                    if (whammyOrigin == null) whammyOrigin = new BendPoint();
                                    whammyOrigin.Offset =
                                        (int)
                                            (float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointPositionFactor);
                                    break;

                                case "WhammyBarMiddleValue":
                                    whammyMiddleValue =
                                        (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointValueFactor);
                                    break;

                                case "WhammyBarMiddleOffset1":
                                    whammyMiddleOffset1 =
                                        (int)
                                            (float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointPositionFactor);
                                    break;
                                case "WhammyBarMiddleOffset2":
                                    whammyMiddleOffset2 =
                                        (int)
                                            (float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointPositionFactor);
                                    break;

                                case "WhammyBarDestinationValue":
                                    if (whammyDestination == null)
                                        whammyDestination = new BendPoint(BendPoint.MaxPosition);
                                    whammyDestination.Value =
                                        (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointValueFactor);
                                    break;

                                case "WhammyBarDestinationOffset":
                                    if (whammyDestination == null) whammyDestination = new BendPoint();
                                    whammyDestination.Offset =
                                        (int)
                                            (float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointPositionFactor);

                                    break;
                            }
                            break;
                    }
                }
            }

            if (isWhammy)
            {
                if (whammyOrigin == null) whammyOrigin = new BendPoint();
                if (whammyDestination == null) whammyDestination = new BendPoint(BendPoint.MaxPosition);
                var whammy = new List<BendPoint>();
                whammy.Add(whammyOrigin);
                if (whammyMiddleOffset1.HasValue && whammyMiddleValue.HasValue)
                {
                    whammy.Add(new BendPoint(whammyMiddleOffset1.Value, whammyMiddleValue.Value));
                }
                if (whammyMiddleOffset2.HasValue && whammyMiddleValue.HasValue)
                {
                    whammy.Add(new BendPoint(whammyMiddleOffset2.Value, whammyMiddleValue.Value));
                }

                if (!whammyMiddleOffset1.HasValue && !whammyMiddleOffset2.HasValue && whammyMiddleValue.HasValue)
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

        private void ParseNotes(XmlNode node)
        {
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            var noteId = node.Attributes["id"].Value;

            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
                            note.TrillValue = int.Parse(GetValue(c));
                            note.TrillSpeed = Duration.Sixteenth;
                            break;
                        case "Accent":
                            var accentFlags = int.Parse(GetValue(c));
                            if ((accentFlags & 0x01) != 0)
                                note.IsStaccato = true;
                            if ((accentFlags & 0x04) != 0)
                                note.Accentuated = AccentuationType.Heavy;
                            if ((accentFlags & 0x08) != 0)
                                note.Accentuated = AccentuationType.Normal;
                            break;
                        case "Tie":
                            if (c.Attributes["origin"].Value.ToLower() == "true")
                            {
                                note.IsTieOrigin = true;
                            }
                            if (c.Attributes["destination"].Value.ToLower() == "true")
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
                    }
                }
            }

            _noteById[noteId] = note;
        }

        private void ParseNoteProperties(XmlNode node, Note note, string noteId)
        {
            bool isBended = false;
            BendPoint bendOrigin = null;
            int? bendMiddleValue = null;
            int? bendMiddleOffset1 = null;
            int? bendMiddleOffset2 = null;
            BendPoint bendDestination = null;

            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
                    {
                        case "Property":
                            var name = c.Attributes["name"].Value;
                            switch (name)
                            {
                                case "String":
                                    note.String = int.Parse(GetValue(FindChildElement(c, "String"))) + 1;
                                    break;
                                case "Fret":
                                    note.Fret = int.Parse(GetValue(FindChildElement(c, "Fret")));
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
                                        note.HarmonicValue = float.Parse(GetValue(hfret));
                                    }
                                    break;
                                // case "Muted": 
                                case "PalmMuted":
                                    if (FindChildElement(c, "Enable") != null)
                                        note.IsPalmMute = true;
                                    break;
                                // case "Element": 
                                // case "Variation": 
                                // case "Tone": 
                                case "Octave":
                                    note.Octave = int.Parse(GetValue(FindChildElement(c, "Number")));
                                    break;
                                case "Bended":
                                    isBended = true;
                                    break;

                                case "BendOriginValue":
                                    if (bendOrigin == null) bendOrigin = new BendPoint();
                                    bendOrigin.Value = (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointValueFactor);
                                    break;
                                case "BendOriginOffset":
                                    if (bendOrigin == null) bendOrigin = new BendPoint();
                                    bendOrigin.Offset = (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointPositionFactor);
                                    break;

                                case "BendMiddleValue":
                                    bendMiddleValue = (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointValueFactor);
                                    break;

                                case "BendMiddleOffset1":
                                    bendMiddleOffset1 = (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointPositionFactor);
                                    break;
                                case "BendMiddleOffset2":
                                    bendMiddleOffset2 = (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointPositionFactor);
                                    break;

                                case "BendDestinationValue":
                                    if (bendDestination == null) bendDestination = new BendPoint(BendPoint.MaxPosition);
                                    bendDestination.Value = (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointValueFactor);
                                    break;

                                case "BendDestinationOffset":
                                    if (bendDestination == null) bendDestination = new BendPoint();
                                    bendDestination.Offset = (int)(float.Parse(GetValue(FindChildElement(c, "Float"))) * BendPointPositionFactor);
                                    break;

                                case "HopoOrigin":
                                    if (FindChildElement(c, "Enable") != null)
                                        note.IsHammerPullOrigin = true;
                                    break;
                                case "HopoDestination":
                                // NOTE: gets automatically calculated 
                                // if (FindChildElement(node, "Enable") != null)
                                //     note.isHammerPullDestination = true;
                                case "Slide":
                                    var slideFlags = int.Parse(GetValue(FindChildElement(c, "Flags")));
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
            }

            if (isBended)
            {
                if (bendOrigin == null) bendOrigin = new BendPoint();
                if (bendDestination == null) bendDestination = new BendPoint(BendPoint.MaxPosition);
                var bend = new List<BendPoint>();
                bend.Add(bendOrigin);
                if (bendMiddleOffset1.HasValue && bendMiddleValue.HasValue)
                {
                    bend.Add(new BendPoint(bendMiddleOffset1.Value, bendMiddleValue.Value));
                }
                if (bendMiddleOffset2.HasValue && bendMiddleValue.HasValue)
                {
                    bend.Add(new BendPoint(bendMiddleOffset2.Value, bendMiddleValue.Value));
                }

                if (!bendMiddleOffset1.HasValue && !bendMiddleOffset2.HasValue && bendMiddleValue.HasValue)
                {
                    bend.Add(new BendPoint(BendPoint.MaxPosition / 2, bendMiddleValue.Value));
                }
                bend.Add(bendDestination);
                note.BendPoints = bend;
            }
        }

        private void ParseRhythms(XmlNode node)
        {
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
            var rhythm = new GpxRhythm();
            var rhythmId = node["id"].Value;
            foreach (XmlNode c in node.ChildNodes)
            {
                if (c.NodeType == XmlNodeType.Element)
                {
                    switch (c.Name)
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
                            rhythm.TupletNumerator = int.Parse(c.Attributes["num"].Value);
                            rhythm.TupletDenominator = int.Parse(c.Attributes["den"].Value);
                            break;
                        case "AugmentationDot":
                            rhythm.Dots = int.Parse(c.Attributes["cound"].Value);
                            break;
                    }
                }
            }

            _rhythmById[rhythmId] = rhythm;
        }

        private string GetValue(XmlNode n)
        {
            if (n.NodeType == XmlNodeType.Element || n.NodeType == XmlNodeType.Document)
            {
                var txt = new StringBuilder();
                foreach (XmlNode childNode in n.ChildNodes)
                {
                    txt.Append(GetValue(childNode));
                }
                return txt.ToString().Trim();
            }
            return n.Value;
        }

        #endregion

        #region Model Building

        private void BuildModel()
        {
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

            // build tracks (not all, only those used by the score)
            var trackIndex = 0;
            foreach (var trackId in _tracksMapping)
            {
                var track = _tracksById[trackId];
                Score.AddTrack(track);
            
                // iterate all bar definitions for the masterbars
                // and add the correct bar to the track
                foreach (var barIds in _barsOfMasterBar)
                {
                    var barId = barIds[trackIndex];
                    if (barId != InvalidId)
                    {
                        track.AddBar(_barsById[barId]);
                    }
                }
            
                trackIndex++;
            }

            // build automations
            foreach (var barId in _automations.Keys)
            {
                var bar = _barsById[barId];
                foreach (var v in bar.Voices)
                {
                    if (v.Beats.Count > 0)
                    {
                        foreach (var automation in _automations[barId])
                        {
                            v.Beats[0].Automations.Add(automation);
                        }
                    }
                }
            } 

             // build score
            foreach (var masterBar in _masterBars)
            {
                Score.AddMasterBar(masterBar);
            }

             // build automations
            foreach (var barId in _automations.Keys)
            {
                var automations = _automations[barId];
                var bar = _barsById[barId];
                foreach (var automation in automations)
                {
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
