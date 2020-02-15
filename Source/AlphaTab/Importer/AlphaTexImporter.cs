﻿using System;
using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Util;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This importer can parse alphaTex markup into a score structure.
    /// </summary>
    internal class AlphaTexImporter : ScoreImporter
    {
        private const int Eof = 0;
        private int _trackChannel;
        private Score _score;
        private Track _currentTrack;
        private Staff _currentStaff;

        private int _ch;
        private int _curChPos;

        private AlphaTexSymbols _sy;
        private object _syData;

        private bool _allowNegatives;
        private bool _allowTuning;

        private Duration _currentDuration;
        private int _currentTuplet;
        private FastDictionary<int, FastList<Lyrics>> _lyrics;

        public AlphaTexImporter()
        {
            _trackChannel = 0;
        }


        public override string Name => "AlphaTex";

        public override Score ReadScore()
        {
            try
            {
                _allowTuning = true;
                _lyrics = new FastDictionary<int, FastList<Lyrics>>();
                CreateDefaultScore();
                _curChPos = 0;
                _currentDuration = Duration.Quarter;
                _currentTuplet = 1;
                NextChar();
                NewSy();
                if (_sy == AlphaTexSymbols.LowerThan)
                {
                    // potential XML, stop parsing (alphaTex never starts with <)
                    throw new UnsupportedFormatException("Unknown start sign <");
                }

                Score();

                Consolidate();

                _score.Finish(Settings);
                _score.RebuildRepeatGroups();

                foreach (var track in _lyrics)
                {
                    _score.Tracks[track].ApplyLyrics(_lyrics[track]);
                }

                return _score;
            }
            catch (AlphaTexException e)
            {
                throw new UnsupportedFormatException(e.Message);
            }
        }

        private void Consolidate()
        {
            // the number of bars per staff and track could be inconsistent,
            // we need to ensure all staffs of all tracks have the correct number of bars
            foreach (var track in _score.Tracks)
            {
                foreach (var staff in track.Staves)
                {
                    while (staff.Bars.Count < _score.MasterBars.Count)
                    {
                        var bar = NewBar(staff);
                        var emptyBeat = new Beat();
                        emptyBeat.IsEmpty = true;
                        bar.Voices[0].AddBeat(emptyBeat);
                    }
                }
            }
        }

        private void Error(string nonterm, AlphaTexSymbols expected, bool symbolError = true)
        {
            AlphaTexException e;
            if (symbolError)
            {
                e = AlphaTexException.SymbolError(_curChPos, nonterm, expected, _sy);
            }
            else
            {
                e = AlphaTexException.SymbolError(_curChPos, nonterm, expected, expected, _syData);
            }

            Logger.Error(Name, e.Message);
            throw e;
        }

        private void ErrorMessage(string message)
        {
            var e = AlphaTexException.ErrorMessage(_curChPos, message);
            Logger.Error(Name, e.Message);
            throw e;
        }

        /// <summary>
        /// Initializes the song with some required default values.
        /// </summary>
        /// <returns></returns>
        private void CreateDefaultScore()
        {
            _score = new Score();
            _score.Tempo = 120;
            _score.TempoLabel = "";

            NewTrack();
        }

        private void NewTrack()
        {
            _currentTrack = new Track(1);

            _currentTrack.PlaybackInfo.Program = 25;
            _currentTrack.PlaybackInfo.PrimaryChannel = _trackChannel++;
            _currentTrack.PlaybackInfo.SecondaryChannel = _trackChannel++;

            _currentStaff = _currentTrack.Staves[0];
            _currentStaff.DisplayTranspositionPitch = -12;
            _currentStaff.Tuning = Tuning.GetDefaultTuningFor(6).Tunings;

            _score.AddTrack(_currentTrack);
            _lyrics[_currentTrack.Index] = new FastList<Lyrics>();
        }

        /// <summary>
        /// Converts a clef string into the clef value.
        /// </summary>
        /// <param name="str">the string to convert</param>
        /// <returns>the clef value</returns>
        private Clef ParseClefFromString(string str)
        {
            switch (str.ToLower())
            {
                case "g2":
                case "treble":
                    return Clef.G2;
                case "f4":
                case "bass":
                    return Clef.F4;
                case "c3":
                case "tenor":
                    return Clef.C3;
                case "c4":
                case "alto":
                    return Clef.C4;
                case "n":
                case "neutral":
                    return Clef.Neutral;
                default:
                    return Clef.G2; // error("clef-value", AlphaTexSymbols.String, false);
            }
        }


        /// <summary>
        /// Converts a clef tuning into the clef value.
        /// </summary>
        /// <param name="i">the tuning value to convert</param>
        /// <returns>the clef value</returns>
        private Clef ParseClefFromInt(int i)
        {
            switch (i)
            {
                case 43:
                    return Clef.G2;
                case 65:
                    return Clef.F4;
                case 48:
                    return Clef.C3;
                case 60:
                    return Clef.C4;
                default:
                    return Clef.G2;
            }
        }

        private TripletFeel ParseTripletFeelFromString(string str)
        {
            switch (str.ToLower())
            {
                case "no":
                case "none":
                    return TripletFeel.NoTripletFeel;
                case "t16":
                case "triplet-16th":
                    return TripletFeel.Triplet16th;
                case "t8":
                case "triplet-8th":
                    return TripletFeel.Triplet8th;
                case "d16":
                case "dotted-16th":
                    return TripletFeel.Dotted16th;
                case "d8":
                case "dotted-8th":
                    return TripletFeel.Dotted8th;
                case "s16":
                case "scottish-16th":
                    return TripletFeel.Scottish16th;
                case "s8":
                case "scottish-8th":
                    return TripletFeel.Scottish8th;
                default:
                    return TripletFeel.NoTripletFeel;
            }
        }

        private TripletFeel ParseTripletFeelFromInt(int i)
        {
            switch (i)
            {
                case 0:
                    return TripletFeel.NoTripletFeel;
                case 1:
                    return TripletFeel.Triplet16th;
                case 2:
                    return TripletFeel.Triplet8th;
                case 3:
                    return TripletFeel.Dotted16th;
                case 4:
                    return TripletFeel.Dotted8th;
                case 5:
                    return TripletFeel.Scottish16th;
                case 6:
                    return TripletFeel.Scottish8th;
                default:
                    return TripletFeel.NoTripletFeel;
            }
        }

        /// <summary>
        /// Converts a keysignature string into the assocciated value.
        /// </summary>
        /// <param name="str">the string to convert</param>
        /// <returns>the assocciated keysignature value</returns>
        private int ParseKeySignature(string str)
        {
            switch (str.ToLower())
            {
                case "cb": return -7;
                case "gb": return -6;
                case "db": return -5;
                case "ab": return -4;
                case "eb": return -3;
                case "bb": return -2;
                case "f": return -1;
                case "c": return 0;
                case "g": return 1;
                case "d": return 2;
                case "a": return 3;
                case "e": return 4;
                case "b": return 5;
                case "f#": return 6;
                case "c#": return 7;
                default: return 0; // error("keysignature-value", AlphaTexSymbols.String, false); return 0
            }
        }

        /// <summary>
        /// Reads the next character of the source stream.
        /// </summary>
        private void NextChar()
        {
            var b = Data.ReadByte();
            if (b == -1)
            {
                _ch = Eof;
            }
            else
            {
                _ch = b;
                _curChPos++;
            }
        }

        /// <summary>
        /// Reads the next terminal symbol.
        /// </summary>
        private void NewSy()
        {
            _sy = AlphaTexSymbols.No;
            do
            {
                if (_ch == Eof)
                {
                    _sy = AlphaTexSymbols.Eof;
                }
                else if (Platform.Platform.IsWhiteSpace(_ch))
                {
                    // skip whitespaces
                    NextChar();
                }
                else if (_ch == 0x2F /* / */)
                {
                    NextChar();
                    if (_ch == 0x2F /* / */)
                    {
                        // single line comment
                        while (_ch != 0x0D /* \r */ && _ch != 0x0A /* \n */ && _ch != Eof)
                        {
                            NextChar();
                        }
                    }
                    else if (_ch == 0x2A /* * */)
                    {
                        // multiline comment
                        while (_ch != Eof)
                        {
                            if (_ch == 0x2A /* * */) // possible end
                            {
                                NextChar();
                                if (_ch == 0x2F /* / */)
                                {
                                    NextChar();
                                    break;
                                }
                            }
                            else
                            {
                                NextChar();
                            }
                        }
                    }
                    else
                    {
                        Error("symbol", AlphaTexSymbols.String, false);
                    }
                }
                else if (_ch == 0x22 /* " */ || _ch == 0x27 /* ' */)
                {
                    var startChar = _ch;
                    NextChar();
                    var s = new StringBuilder();
                    _sy = AlphaTexSymbols.String;
                    while (_ch != startChar && _ch != Eof)
                    {
                        s.AppendChar(_ch);
                        NextChar();
                    }

                    _syData = s.ToString();
                    NextChar();
                }
                else if (_ch == 0x2D /* - */) // negative number
                {
                    // is number?
                    if (_allowNegatives && IsDigit(_ch))
                    {
                        var number = ReadNumber();
                        _sy = AlphaTexSymbols.Number;
                        _syData = number;
                    }
                    else
                    {
                        _sy = AlphaTexSymbols.String;
                        _syData = ReadName();
                    }
                }
                else if (_ch == 0x2E /* . */)
                {
                    _sy = AlphaTexSymbols.Dot;
                    NextChar();
                }
                else if (_ch == 0x3A /* : */)
                {
                    _sy = AlphaTexSymbols.DoubleDot;
                    NextChar();
                }
                else if (_ch == 0x28 /* ( */)
                {
                    _sy = AlphaTexSymbols.LParensis;
                    NextChar();
                }
                else if (_ch == 0x5C /* \ */)
                {
                    NextChar();
                    var name = ReadName();
                    _sy = AlphaTexSymbols.MetaCommand;
                    _syData = name;
                }
                else if (_ch == 0x29 /* ) */)
                {
                    _sy = AlphaTexSymbols.RParensis;
                    NextChar();
                }
                else if (_ch == 0x7B /* { */)
                {
                    _sy = AlphaTexSymbols.LBrace;
                    NextChar();
                }
                else if (_ch == 0x7D /* } */)
                {
                    _sy = AlphaTexSymbols.RBrace;
                    NextChar();
                }
                else if (_ch == 0x7C /* | */)
                {
                    _sy = AlphaTexSymbols.Pipe;
                    NextChar();
                }
                else if (_ch == 0x2A /* * */)
                {
                    _sy = AlphaTexSymbols.Multiply;
                    NextChar();
                }
                else if (_ch == 0x3C /* < */)
                {
                    _sy = AlphaTexSymbols.LowerThan;
                    NextChar();
                }
                else if (IsDigit(_ch))
                {
                    var number = ReadNumber();
                    _sy = AlphaTexSymbols.Number;
                    _syData = number;
                }
                else if (IsLetter(_ch))
                {
                    var name = ReadName();
                    var tuning = _allowTuning ? TuningParser.Parse(name) : null;
                    if (tuning != null)
                    {
                        _sy = AlphaTexSymbols.Tuning;
                        _syData = tuning;
                    }
                    else
                    {
                        _sy = AlphaTexSymbols.String;
                        _syData = name;
                    }
                }
                else
                {
                    Error("symbol", AlphaTexSymbols.String, false);
                }
            } while (_sy == AlphaTexSymbols.No);
        }

        /// <summary>
        /// Checks if the given character is a letter.
        /// (no control characters, whitespaces, numbers or dots)
        /// </summary>
        /// <param name="code">the character</param>
        /// <returns>true if the given character is a letter, otherwise false.</returns>
        private static bool IsLetter(int code)
        {
            // no control characters, whitespaces, numbers or dots
            return !IsTerminal(code) && (
                       code >= 0x21 && code <= 0x2F ||
                       code >= 0x3A && code <= 0x7E ||
                       code > 0x80); /* Unicode Symbols */
        }

        /// <summary>
        /// Checks if the given charater is a non terminal.
        /// </summary>
        /// <param name="ch">the character</param>
        /// <returns>true if the given character is a terminal, otherwise false.</returns>
        private static bool IsTerminal(int ch)
        {
            return ch == 0x2E /* . */ ||
                   ch == 0x7B /* { */ ||
                   ch == 0x7D /* } */ ||
                   ch == 0x5B /* [ */ ||
                   ch == 0x5D /* ] */ ||
                   ch == 0x28 /* ( */ ||
                   ch == 0x29 /* ) */ ||
                   ch == 0x7C /* | */ ||
                   ch == 0x27 /* ' */ ||
                   ch == 0x22 /* " */ ||
                   ch == 0x5C /* \ */;
        }

        /// <summary>
        /// Checks if the given character is a digit.
        /// </summary>
        /// <param name="code">the character</param>
        /// <returns>true if the given character is a digit, otherwise false.</returns>
        private bool IsDigit(int code)
        {
            return code >= 0x30 && code <= 0x39 || /*0-9*/
                   code == 0x2D /* - */ && _allowNegatives; // allow - if negatives
        }

        /// <summary>
        /// Reads a string from the stream.
        /// </summary>
        /// <returns>the read string.</returns>
        private string ReadName()
        {
            var str = new StringBuilder();
            do
            {
                str.AppendChar(_ch);
                NextChar();
            } while (IsLetter(_ch) || IsDigit(_ch) || _ch == 0x23);

            return str.ToString();
        }

        /// <summary>
        /// Reads a number from the stream.
        /// </summary>
        /// <returns>the read number.</returns>
        private int ReadNumber()
        {
            var str = new StringBuilder();
            do
            {
                str.AppendChar(_ch);
                NextChar();
            } while (IsDigit(_ch));

            return Platform.Platform.ParseInt(str.ToString());
        }

        #region Recursive Decent Parser

        private void Score()
        {
            MetaData();
            Bars();
        }

        private void MetaData()
        {
            var anyMeta = false;
            var continueReading = true;
            while (_sy == AlphaTexSymbols.MetaCommand && continueReading)
            {
                var syData = _syData.ToString().ToLower();
                switch (syData)
                {
                    case "title":
                        NewSy();
                        if (_sy == AlphaTexSymbols.String)
                        {
                            _score.Title = _syData.ToString();
                        }
                        else
                        {
                            Error("title", AlphaTexSymbols.String);
                        }

                        NewSy();
                        anyMeta = true;
                        break;
                    case "subtitle":
                        NewSy();
                        if (_sy == AlphaTexSymbols.String)
                        {
                            _score.SubTitle = _syData.ToString();
                        }
                        else
                        {
                            Error("subtitle", AlphaTexSymbols.String);
                        }

                        NewSy();
                        anyMeta = true;
                        break;
                    case "artist":
                        NewSy();
                        if (_sy == AlphaTexSymbols.String)
                        {
                            _score.Artist = _syData.ToString();
                        }
                        else
                        {
                            Error("artist", AlphaTexSymbols.String);
                        }

                        NewSy();
                        anyMeta = true;
                        break;
                    case "album":
                        NewSy();
                        if (_sy == AlphaTexSymbols.String)
                        {
                            _score.Album = _syData.ToString();
                        }
                        else
                        {
                            Error("album", AlphaTexSymbols.String);
                        }

                        NewSy();
                        anyMeta = true;
                        break;
                    case "words":
                        NewSy();
                        if (_sy == AlphaTexSymbols.String)
                        {
                            _score.Words = _syData.ToString();
                        }
                        else
                        {
                            Error("words", AlphaTexSymbols.String);
                        }

                        NewSy();
                        anyMeta = true;
                        break;
                    case "music":
                        NewSy();
                        if (_sy == AlphaTexSymbols.String)
                        {
                            _score.Music = _syData.ToString();
                        }
                        else
                        {
                            Error("music", AlphaTexSymbols.String);
                        }

                        NewSy();
                        anyMeta = true;
                        break;
                    case "copyright":
                        NewSy();
                        if (_sy == AlphaTexSymbols.String)
                        {
                            _score.Copyright = _syData.ToString();
                        }
                        else
                        {
                            Error("copyright", AlphaTexSymbols.String);
                        }

                        NewSy();
                        anyMeta = true;
                        break;
                    case "tempo":
                        NewSy();
                        if (_sy == AlphaTexSymbols.Number)
                        {
                            _score.Tempo = (int)_syData;
                        }
                        else
                        {
                            Error("tempo", AlphaTexSymbols.Number);
                        }

                        NewSy();
                        anyMeta = true;
                        break;
                    default:
                        if (HandleStaffMeta())
                        {
                            anyMeta = true;
                        }
                        else if (anyMeta)
                        {
                            // invalid meta encountered
                            Error("metaDataTags", AlphaTexSymbols.String, false);
                        }
                        else
                        {
                            // fall forward to bar meta if unknown score meta was found
                            continueReading = false;
                        }

                        break;
                }
            }

            if (anyMeta)
            {
                if (_sy != AlphaTexSymbols.Dot)
                {
                    Error("song", AlphaTexSymbols.Dot);
                }

                NewSy();
            }
            else if (_sy == AlphaTexSymbols.Dot)
            {
                NewSy();
            }
        }

        private bool HandleStaffMeta()
        {
            var syData = _syData.ToString().ToLower();
            switch (syData)
            {
                case "capo":
                    NewSy();
                    if (_sy == AlphaTexSymbols.Number)
                    {
                        _currentStaff.Capo = (int)_syData;
                    }
                    else
                    {
                        Error("capo", AlphaTexSymbols.Number);
                    }

                    NewSy();
                    return true;
                case "tuning":
                    NewSy();
                    var strings = _currentStaff.Tuning.Length;
                    switch (_sy)
                    {
                        case AlphaTexSymbols.String:
                            var text = _syData.ToString().ToLower();
                            if (text == "piano" || text == "none" || text == "voice")
                            {
                                // clear tuning
                                _currentStaff.Tuning = new int[0];
                            }
                            else
                            {
                                Error("tuning", AlphaTexSymbols.Tuning);
                            }

                            NewSy();
                            break;
                        case AlphaTexSymbols.Tuning:
                            var tuning = new FastList<int>();
                            do
                            {
                                var t = (TuningParseResult)_syData;
                                tuning.Add(t.RealValue);
                                NewSy();
                            } while (_sy == AlphaTexSymbols.Tuning);

                            _currentStaff.Tuning = tuning.ToArray();
                            break;
                        default:
                            Error("tuning", AlphaTexSymbols.Tuning);
                            break;
                    }

                    if (strings != _currentStaff.Tuning.Length && _currentStaff.Chords.Count > 0)
                    {
                        ErrorMessage("Tuning must be defined before any chord");
                    }

                    return true;
                case "instrument":
                    NewSy();
                    if (_sy == AlphaTexSymbols.Number)
                    {
                        var instrument = (int)_syData;
                        if (instrument >= 0 && instrument <= 128)
                        {
                            _currentTrack.PlaybackInfo.Program = (int)_syData;
                        }
                        else
                        {
                            Error("instrument", AlphaTexSymbols.Number, false);
                        }
                    }
                    else if (_sy == AlphaTexSymbols.String) // Name
                    {
                        var instrumentName = _syData.ToString().ToLower();
                        _currentTrack.PlaybackInfo.Program = GeneralMidi.GetValue(instrumentName);
                    }
                    else
                    {
                        Error("instrument", AlphaTexSymbols.Number);
                    }

                    _currentStaff.DisplayTranspositionPitch =
                        GeneralMidi.IsGuitar(_currentTrack.PlaybackInfo.Program) ? -12 : 0;

                    NewSy();
                    return true;
                case "lyrics":
                    NewSy();

                    var lyrics = new Lyrics();
                    lyrics.StartBar = 0;
                    lyrics.Text = "";

                    if (_sy == AlphaTexSymbols.Number) // Name
                    {
                        lyrics.StartBar = (int)_syData;
                        NewSy();
                    }

                    if (_sy == AlphaTexSymbols.String)
                    {
                        lyrics.Text = (string)_syData;
                        NewSy();
                    }
                    else
                    {
                        Error("lyrics", AlphaTexSymbols.String);
                    }

                    _lyrics[_currentTrack.Index].Add(lyrics);
                    return true;
                case "chord":
                    NewSy();
                    var chord = new Chord();

                    ChordProperties(chord);

                    if (_sy == AlphaTexSymbols.String) // Name
                    {
                        chord.Name = (string)_syData;
                        NewSy();
                    }
                    else
                    {
                        Error("chord-name", AlphaTexSymbols.Number);
                    }


                    for (var i = 0; i < _currentStaff.Tuning.Length; i++)
                    {
                        if (_sy == AlphaTexSymbols.Number)
                        {
                            chord.Strings.Add((int)_syData);
                        }
                        else if (_sy == AlphaTexSymbols.String && _syData.ToString().ToLower() == "x")
                        {
                            chord.Strings.Add(-1);
                        }

                        NewSy();
                    }

                    _currentStaff.AddChord(chord.Name.ToLower(), chord);
                    return true;
                default:
                    return false;
            }
        }

        private void ChordProperties(Chord chord)
        {
            if (_sy != AlphaTexSymbols.LBrace)
            {
                return;
            }

            NewSy();

            while (_sy == AlphaTexSymbols.String)
            {
                switch (_syData.ToString().ToLower())
                {
                    case "firstfret":
                        NewSy();
                        switch (_sy)
                        {
                            case AlphaTexSymbols.Number:
                                chord.FirstFret = (int)_syData;
                                break;
                            default:
                                Error("chord-firstfret", AlphaTexSymbols.Number);
                                break;
                        }

                        NewSy();
                        break;
                    case "showdiagram":
                        NewSy();

                        switch (_sy)
                        {
                            case AlphaTexSymbols.String:
                                chord.ShowDiagram = _syData.ToString().ToLower() != "false";
                                break;
                            case AlphaTexSymbols.Number:
                                chord.ShowDiagram = (int)_syData != 0;
                                break;
                            default:
                                Error("chord-showdiagram", AlphaTexSymbols.String);
                                break;
                        }

                        NewSy();
                        break;
                    case "showfingering":
                        NewSy();

                        switch (_sy)
                        {
                            case AlphaTexSymbols.String:
                                chord.ShowDiagram = _syData.ToString().ToLower() != "false";
                                break;
                            case AlphaTexSymbols.Number:
                                chord.ShowFingering = (int)_syData != 0;
                                break;
                            default:
                                Error("chord-showfingering", AlphaTexSymbols.String);
                                break;
                        }

                        NewSy();
                        break;
                    case "showname":
                        NewSy();

                        switch (_sy)
                        {
                            case AlphaTexSymbols.String:
                                chord.ShowName = _syData.ToString().ToLower() != "false";
                                break;
                            case AlphaTexSymbols.Number:
                                chord.ShowName = (int)_syData != 0;
                                break;
                            default:
                                Error("chord-showname", AlphaTexSymbols.String);
                                break;
                        }

                        NewSy();
                        break;
                    case "barre":
                        NewSy();

                        while (_sy == AlphaTexSymbols.Number)
                        {
                            chord.BarreFrets.Add((int)_syData);
                            NewSy();
                        }

                        break;
                    default:
                        Error("chord-properties", AlphaTexSymbols.String, false);
                        break;
                }
            }

            if (_sy != AlphaTexSymbols.RBrace)
            {
                Error("chord-properties", AlphaTexSymbols.RBrace);
            }

            NewSy();
        }

        private void Bars()
        {
            Bar();
            while (_sy != AlphaTexSymbols.Eof)
            {
                // read pipe from last bar
                if (_sy != AlphaTexSymbols.Pipe)
                {
                    Error("bar", AlphaTexSymbols.Pipe);
                }

                NewSy();

                Bar();
            }
        }

        private void TrackStaffMeta()
        {
            if (_sy == AlphaTexSymbols.MetaCommand)
            {
                var syData = _syData.ToString().ToLower();
                if (syData == "track")
                {
                    NewSy();

                    // new track starting? - if no masterbars it's the \track of the initial track.
                    if (_score.MasterBars.Count > 0)
                    {
                        NewTrack();
                    }

                    // name
                    if (_sy == AlphaTexSymbols.String)
                    {
                        _currentTrack.Name = _syData.ToString();
                        NewSy();
                    }

                    // short name
                    if (_sy == AlphaTexSymbols.String)
                    {
                        _currentTrack.ShortName = _syData.ToString();
                        NewSy();
                    }
                }

                syData = _syData.ToString().ToLower();
                if (syData == "staff")
                {
                    NewSy();
                    if (_currentTrack.Staves[0].Bars.Count > 0)
                    {
                        _currentTrack.EnsureStaveCount(_currentTrack.Staves.Count + 1);

                        _currentStaff = _currentTrack.Staves[_currentTrack.Staves.Count - 1];
                    }

                    StaffProperties();
                }
            }
        }

        private void StaffProperties()
        {
            if (_sy != AlphaTexSymbols.LBrace)
            {
                return;
            }

            NewSy();

            var showStandardNotation = false;
            var showTabs = false;

            while (_sy == AlphaTexSymbols.String)
            {
                switch (_syData.ToString().ToLower())
                {
                    case "score":
                        showStandardNotation = true;
                        NewSy();
                        break;
                    case "tabs":
                        showTabs = true;
                        NewSy();
                        break;
                    default:
                        Error("staff-properties", AlphaTexSymbols.String, false);
                        break;
                }
            }

            if (showStandardNotation || showTabs)
            {
                _currentStaff.ShowStandardNotation = showStandardNotation;
                _currentStaff.ShowTablature = showTabs;
            }

            if (_sy != AlphaTexSymbols.RBrace)
            {
                Error("staff-properties", AlphaTexSymbols.RBrace);
            }

            NewSy();
        }

        private void Bar()
        {
            TrackStaffMeta();

            var bar = NewBar(_currentStaff);
            if (_currentStaff.Bars.Count > _score.MasterBars.Count)
            {
                var master = new MasterBar();
                _score.AddMasterBar(master);
                if (master.Index > 0)
                {
                    master.KeySignature = master.PreviousMasterBar.KeySignature;
                    master.KeySignatureType = master.PreviousMasterBar.KeySignatureType;
                    master.TimeSignatureDenominator = master.PreviousMasterBar.TimeSignatureDenominator;
                    master.TimeSignatureNumerator = master.PreviousMasterBar.TimeSignatureNumerator;
                    master.TripletFeel = master.PreviousMasterBar.TripletFeel;
                }
            }

            BarMeta(bar);

            var voice = bar.Voices[0];

            while (_sy != AlphaTexSymbols.Pipe && _sy != AlphaTexSymbols.Eof)
            {
                Beat(voice);
            }

            if (voice.Beats.Count == 0)
            {
                var emptyBeat = new Beat();
                emptyBeat.IsEmpty = true;
                voice.AddBeat(emptyBeat);
            }
        }

        private Bar NewBar(Staff staff)
        {
            var bar = new Bar();
            staff.AddBar(bar);
            if (bar.Index > 0)
            {
                bar.Clef = bar.PreviousBar.Clef;
            }

            var voice = new Voice();
            bar.AddVoice(voice);
            return bar;
        }

        private void Beat(Voice voice)
        {
            // duration specifier?
            BeatDuration();

            var beat = new Beat();
            voice.AddBeat(beat);

            if (voice.Bar.MasterBar.TempoAutomation != null && voice.Beats.Count == 1)
            {
                beat.Automations.Add(voice.Bar.MasterBar.TempoAutomation);
            }

            // notes
            if (_sy == AlphaTexSymbols.LParensis)
            {
                NewSy();

                Note(beat);
                while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof)
                {
                    Note(beat);
                }

                if (_sy != AlphaTexSymbols.RParensis)
                {
                    Error("note-list", AlphaTexSymbols.RParensis);
                }

                NewSy();
            }
            // rest
            else if (_sy == AlphaTexSymbols.String && _syData.ToString().ToLower() == "r")
            {
                // rest voice -> no notes
                NewSy();
            }
            else
            {
                Note(beat);
            }

            // new duration
            if (_sy == AlphaTexSymbols.Dot)
            {
                _allowNegatives = true;
                NewSy();
                _allowNegatives = false;
                if (_sy != AlphaTexSymbols.Number)
                {
                    Error("duration", AlphaTexSymbols.Number);
                }

                _currentDuration = ParseDuration((int)_syData);
                NewSy();
            }

            beat.Duration = _currentDuration;
            if (_currentTuplet != 1 && !beat.HasTuplet)
            {
                ApplyTuplet(beat, _currentTuplet);
            }

            // beat multiplier (repeat beat n times)
            var beatRepeat = 1;
            if (_sy == AlphaTexSymbols.Multiply)
            {
                NewSy();

                // multiplier count
                if (_sy != AlphaTexSymbols.Number)
                {
                    Error("multiplier", AlphaTexSymbols.Number);
                }
                else
                {
                    beatRepeat = (int)_syData;
                }

                NewSy();
            }

            BeatEffects(beat);

            for (var i = 0; i < beatRepeat - 1; i++)
            {
                voice.AddBeat(beat.Clone());
            }
        }

        private void BeatDuration()
        {
            if (_sy != AlphaTexSymbols.DoubleDot)
            {
                return;
            }

            _allowNegatives = true;
            NewSy();
            _allowNegatives = false;
            if (_sy != AlphaTexSymbols.Number)
            {
                Error("duration", AlphaTexSymbols.Number);
            }

            _currentDuration = ParseDuration((int)_syData);
            _currentTuplet = 1;
            NewSy();

            if (_sy != AlphaTexSymbols.LBrace)
            {
                return;
            }

            NewSy();

            while (_sy == AlphaTexSymbols.String)
            {
                var effect = _syData.ToString().ToLower();
                switch (effect)
                {
                    case "tu":
                        NewSy();
                        if (_sy != AlphaTexSymbols.Number)
                        {
                            Error("duration-tuplet", AlphaTexSymbols.Number);
                        }

                        _currentTuplet = (int)_syData;
                        NewSy();
                        break;
                    default:
                        Error("beat-duration", AlphaTexSymbols.String, false);
                        break;
                }
            }

            if (_sy != AlphaTexSymbols.RBrace)
            {
                Error("beat-duration", AlphaTexSymbols.RBrace);
            }

            NewSy();
        }

        private void BeatEffects(Beat beat)
        {
            if (_sy != AlphaTexSymbols.LBrace)
            {
                return;
            }

            NewSy();

            while (_sy == AlphaTexSymbols.String)
            {
                _syData = _syData.ToString().ToLower();
                if (!ApplyBeatEffect(beat))
                {
                    Error("beat-effects", AlphaTexSymbols.String, false);
                }
            }

            if (_sy != AlphaTexSymbols.RBrace)
            {
                Error("beat-effects", AlphaTexSymbols.RBrace);
            }

            NewSy();
        }


        /// <summary>
        /// Tries to apply a beat effect to the given beat.
        /// </summary>
        /// <returns>true if a effect could be applied, otherwise false</returns>
        private bool ApplyBeatEffect(Beat beat)
        {
            var syData = _syData.ToString().ToLower();
            if (syData == "f")
            {
                beat.FadeIn = true;
                NewSy();
                return true;
            }

            if (syData == "v")
            {
                beat.Vibrato = VibratoType.Slight;
                NewSy();
                return true;
            }

            if (syData == "s")
            {
                beat.Slap = true;
                NewSy();
                return true;
            }

            if (syData == "p")
            {
                beat.Pop = true;
                NewSy();
                return true;
            }

            if (syData == "tt")
            {
                beat.Tap = true;
                NewSy();
                return true;
            }

            if (syData == "dd")
            {
                beat.Dots = 2;
                NewSy();
                return true;
            }

            if (syData == "d")
            {
                beat.Dots = 1;
                NewSy();
                return true;
            }

            if (syData == "su")
            {
                beat.PickStroke = PickStroke.Up;
                NewSy();
                return true;
            }

            if (syData == "sd")
            {
                beat.PickStroke = PickStroke.Down;
                NewSy();
                return true;
            }

            if (syData == "tu")
            {
                NewSy();
                if (_sy != AlphaTexSymbols.Number)
                {
                    Error("tuplet", AlphaTexSymbols.Number);
                    return false;
                }

                ApplyTuplet(beat, (int)_syData);
                NewSy();
                return true;
            }

            if (syData == "tb" || syData == "tbe")
            {
                var exact = syData == "tbe";
                // read points
                NewSy();
                if (_sy != AlphaTexSymbols.LParensis)
                {
                    Error("tremolobar-effect", AlphaTexSymbols.LParensis);
                    return false;
                }

                _allowNegatives = true;

                NewSy();
                while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof)
                {
                    int offset;
                    int value;

                    if (exact)
                    {
                        if (_sy != AlphaTexSymbols.Number)
                        {
                            Error("tremolobar-effect", AlphaTexSymbols.Number);
                            return false;
                        }

                        offset = (int)_syData;

                        NewSy();
                        if (_sy != AlphaTexSymbols.Number)
                        {
                            Error("tremolobar-effect", AlphaTexSymbols.Number);
                            return false;
                        }

                        value = (int)_syData;
                    }
                    else
                    {
                        if (_sy != AlphaTexSymbols.Number)
                        {
                            Error("tremolobar-effect", AlphaTexSymbols.Number);
                            return false;
                        }

                        offset = 0;
                        value = (int)_syData;
                    }

                    beat.AddWhammyBarPoint(new BendPoint(offset, value));

                    NewSy();
                }

                while (beat.WhammyBarPoints.Count > 60)
                {
                    beat.RemoveWhammyBarPoint(beat.WhammyBarPoints.Count - 1);
                }

                // set positions
                if (!exact)
                {
                    var count = beat.WhammyBarPoints.Count;
                    var step = 60 / count;
                    var i = 0;
                    while (i < count)
                    {
                        beat.WhammyBarPoints[i].Offset = Math.Min(60, i * step);
                        i++;
                    }
                }
                else
                {
                    beat.WhammyBarPoints.Sort((a, b) => a.Offset - b.Offset);
                }

                _allowNegatives = false;

                if (_sy != AlphaTexSymbols.RParensis)
                {
                    Error("tremolobar-effect", AlphaTexSymbols.RParensis);
                    return false;
                }

                NewSy();
                return true;
            }

            if (syData == "ch")
            {
                NewSy();

                var chordName = _syData.ToString();
                var chordId = chordName.ToLower();
                if (!_currentStaff.Chords.ContainsKey(chordId))
                {
                    var chord = new Chord();
                    chord.ShowDiagram = false;
                    chord.Name = chordName;
                    _currentStaff.AddChord(chordId, chord);
                }

                beat.ChordId = chordId;
                NewSy();
                return true;
            }


            if (syData == "gr")
            {
                NewSy();
                if (_syData.ToString().ToLower() == "ob")
                {
                    beat.GraceType = GraceType.OnBeat;
                    NewSy();
                }
                else if (_syData.ToString().ToLower() == "b")
                {
                    beat.GraceType = GraceType.BendGrace;
                    NewSy();
                }
                else
                {
                    beat.GraceType = GraceType.BeforeBeat;
                }

                return true;
            }

            if (syData == "dy")
            {
                NewSy();
                switch (_syData.ToString().ToLower())
                {
                    case "ppp":
                        beat.Dynamics = DynamicValue.PPP;
                        break;
                    case "pp":
                        beat.Dynamics = DynamicValue.PP;
                        break;
                    case "p":
                        beat.Dynamics = DynamicValue.P;
                        break;
                    case "mp":
                        beat.Dynamics = DynamicValue.MP;
                        break;
                    case "mf":
                        beat.Dynamics = DynamicValue.MF;
                        break;
                    case "f":
                        beat.Dynamics = DynamicValue.F;
                        break;
                    case "ff":
                        beat.Dynamics = DynamicValue.FF;
                        break;
                    case "fff":
                        beat.Dynamics = DynamicValue.FFF;
                        break;
                }
                NewSy();
                return true;
            }

            if (syData == "cre")
            {
                beat.Crescendo = CrescendoType.Crescendo;
                NewSy();
                return true;
            }
            
            if (syData == "dec")
            {
                beat.Crescendo = CrescendoType.Decrescendo;
                NewSy();
                return true;
            }

            if (syData == "tp")
            {
                NewSy();
                var duration = Duration.Eighth;
                if (_sy == AlphaTexSymbols.Number)
                {
                    switch ((int)_syData)
                    {
                        case 8:
                            duration = Duration.Eighth;
                            break;
                        case 16:
                            duration = Duration.Sixteenth;
                            break;
                        case 32:
                            duration = Duration.ThirtySecond;
                            break;
                        default:
                            duration = Duration.Eighth;
                            break;
                    }

                    NewSy();
                }

                beat.TremoloSpeed = duration;

                return true;
            }

            return false;
        }

        private void ApplyTuplet(Beat beat, int tuplet)
        {
            switch (tuplet)
            {
                case 3:
                    beat.TupletNumerator = 3;
                    beat.TupletDenominator = 2;
                    break;
                case 5:
                    beat.TupletNumerator = 5;
                    beat.TupletDenominator = 4;
                    break;
                case 6:
                    beat.TupletNumerator = 6;
                    beat.TupletDenominator = 4;
                    break;
                case 7:
                    beat.TupletNumerator = 7;
                    beat.TupletDenominator = 4;
                    break;
                case 9:
                    beat.TupletNumerator = 9;
                    beat.TupletDenominator = 8;
                    break;
                case 10:
                    beat.TupletNumerator = 10;
                    beat.TupletDenominator = 8;
                    break;
                case 11:
                    beat.TupletNumerator = 11;
                    beat.TupletDenominator = 8;
                    break;
                case 12:
                    beat.TupletNumerator = 12;
                    beat.TupletDenominator = 8;
                    break;
                default:
                    beat.TupletNumerator = 1;
                    beat.TupletDenominator = 1;
                    break;
            }
        }

        private void Note(Beat beat)
        {
            // fret.string

            var isDead = _syData.ToString() == "x";
            var isTie = _syData.ToString() == "-";
            var fret = -1;
            var octave = -1;
            var tone = -1;
            switch (_sy)
            {
                case AlphaTexSymbols.Number:
                    fret = (int)_syData;
                    break;
                case AlphaTexSymbols.String:
                    if (isTie || isDead)
                    {
                        fret = 0;
                    }
                    else
                    {
                        Error("note-fret", AlphaTexSymbols.Number);
                    }

                    break;
                case AlphaTexSymbols.Tuning:
                    var tuning = (TuningParseResult)_syData;
                    octave = tuning.Octave;
                    tone = tuning.NoteValue;
                    break;
                default:
                    Error("note-fret", AlphaTexSymbols.Number);
                    break;
            }

            NewSy(); // Fret done

            var isFretted = octave == -1 && _currentStaff.Tuning.Length > 0;

            var @string = -1;
            if (isFretted)
            {
                // Fret [Dot] String

                if (_sy != AlphaTexSymbols.Dot)
                {
                    Error("note", AlphaTexSymbols.Dot);
                }

                NewSy(); // dot done

                if (_sy != AlphaTexSymbols.Number)
                {
                    Error("note-string", AlphaTexSymbols.Number);
                }

                @string = (int)_syData;
                if (@string < 1 || @string > _currentStaff.Tuning.Length)
                {
                    Error("note-string", AlphaTexSymbols.Number, false);
                }

                NewSy(); // string done
            }

            // read effects
            var note = new Note();
            if (isFretted)
            {
                note.String = _currentStaff.Tuning.Length - (@string - 1);
                note.IsDead = isDead;
                note.IsTieDestination = isTie;
                if (!isTie)
                {
                    note.Fret = fret;
                }
            }
            else
            {
                note.Octave = octave;
                note.Tone = tone;
                note.IsTieDestination = isTie;
            }

            beat.AddNote(note);

            NoteEffects(note);
        }

        private void NoteEffects(Note note)
        {
            if (_sy != AlphaTexSymbols.LBrace)
            {
                return;
            }

            NewSy();

            while (_sy == AlphaTexSymbols.String)
            {
                var syData = _syData.ToString().ToLower();
                _syData = syData;
                if (syData == "b" || syData == "be")
                {
                    var exact = (string)_syData == "be";
                    // read points
                    NewSy();
                    if (_sy != AlphaTexSymbols.LParensis)
                    {
                        Error("bend-effect", AlphaTexSymbols.LParensis);
                    }

                    NewSy();
                    while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof)
                    {
                        var offset = 0;
                        var value = 0;
                        if (exact)
                        {
                            if (_sy != AlphaTexSymbols.Number)
                            {
                                Error("bend-effect-value", AlphaTexSymbols.Number);
                            }

                            offset = (int)_syData;

                            NewSy();
                            if (_sy != AlphaTexSymbols.Number)
                            {
                                Error("bend-effect-value", AlphaTexSymbols.Number);
                            }

                            value = (int)_syData;
                        }
                        else
                        {
                            if (_sy != AlphaTexSymbols.Number)
                            {
                                Error("bend-effect-value", AlphaTexSymbols.Number);
                            }

                            value = (int)_syData;
                        }

                        note.AddBendPoint(new BendPoint(offset, value));
                        NewSy();
                    }

                    while (note.BendPoints.Count > 60)
                    {
                        note.BendPoints.RemoveAt(note.BendPoints.Count - 1);
                    }

                    // set positions
                    if (exact)
                    {
                        note.BendPoints.Sort((a, b) => a.Offset - b.Offset);
                    }
                    else
                    {
                        var count = note.BendPoints.Count;
                        var step = 60 / (count - 1);
                        var i = 0;
                        while (i < count)
                        {
                            note.BendPoints[i].Offset = Math.Min(60, i * step);
                            i++;
                        }
                    }


                    if (_sy != AlphaTexSymbols.RParensis)
                    {
                        Error("bend-effect", AlphaTexSymbols.RParensis);
                    }

                    NewSy();
                }
                else if (syData == "nh")
                {
                    note.HarmonicType = HarmonicType.Natural;
                    NewSy();
                }
                else if (syData == "ah")
                {
                    // todo: Artificial Key
                    note.HarmonicType = HarmonicType.Artificial;
                    NewSy();
                }
                else if (syData == "th")
                {
                    // todo: store tapped fret in data
                    note.HarmonicType = HarmonicType.Tap;
                    NewSy();
                }
                else if (syData == "ph")
                {
                    note.HarmonicType = HarmonicType.Pinch;
                    NewSy();
                }
                else if (syData == "sh")
                {
                    note.HarmonicType = HarmonicType.Semi;
                    NewSy();
                }
                else if (syData == "tr")
                {
                    NewSy();
                    if (_sy != AlphaTexSymbols.Number)
                    {
                        Error("trill-effect", AlphaTexSymbols.Number);
                    }

                    var fret = (int)_syData;
                    NewSy();

                    var duration = Duration.Sixteenth;
                    if (_sy == AlphaTexSymbols.Number)
                    {
                        switch ((int)_syData)
                        {
                            case 16:
                                duration = Duration.Sixteenth;
                                break;
                            case 32:
                                duration = Duration.ThirtySecond;
                                break;
                            case 64:
                                duration = Duration.SixtyFourth;
                                break;
                            default:
                                duration = Duration.Sixteenth;
                                break;
                        }

                        NewSy();
                    }

                    note.TrillValue = fret + note.StringTuning;
                    note.TrillSpeed = duration;
                }
                else if (syData == "v")
                {
                    NewSy();
                    note.Vibrato = VibratoType.Slight;
                }
                else if (syData == "sl")
                {
                    NewSy();
                    note.SlideOutType = SlideOutType.Legato;
                }
                else if (syData == "ss")
                {
                    NewSy();
                    note.SlideOutType = SlideOutType.Shift;
                }
                else if (syData == "sib")
                {
                    NewSy();
                    note.SlideInType = SlideInType.IntoFromBelow;
                }
                else if (syData == "sia")
                {
                    NewSy();
                    note.SlideInType = SlideInType.IntoFromAbove;
                }
                else if (syData == "sou")
                {
                    NewSy();
                    note.SlideOutType = SlideOutType.OutUp;
                }
                else if (syData == "sod")
                {
                    NewSy();
                    note.SlideOutType = SlideOutType.OutDown;
                }
                else if (syData == "psd")
                {
                    NewSy();
                    note.SlideOutType = SlideOutType.PickSlideDown;
                }
                else if (syData == "psu")
                {
                    NewSy();
                    note.SlideOutType = SlideOutType.PickSlideUp;
                }
                else if (syData == "h")
                {
                    NewSy();
                    note.IsHammerPullOrigin = true;
                }
                else if (syData == "g")
                {
                    NewSy();
                    note.IsGhost = true;
                }
                else if (syData == "ac")
                {
                    NewSy();
                    note.Accentuated = AccentuationType.Normal;
                }
                else if (syData == "hac")
                {
                    NewSy();
                    note.Accentuated = AccentuationType.Heavy;
                }
                else if (syData == "pm")
                {
                    NewSy();
                    note.IsPalmMute = true;
                }
                else if (syData == "st")
                {
                    NewSy();
                    note.IsStaccato = true;
                }
                else if (syData == "lr")
                {
                    NewSy();
                    note.IsLetRing = true;
                }
                else if (syData == "x")
                {
                    NewSy();
                    note.Fret = 0;
                    note.IsDead = true;
                }
                else if (syData == "-" || syData == "t")
                {
                    NewSy();
                    note.IsTieDestination = true;
                }
                else if (syData == "lf")
                {
                    NewSy();
                    var finger = Fingers.Thumb;
                    if (_sy == AlphaTexSymbols.Number)
                    {
                        finger = ToFinger((int)_syData);
                        NewSy();
                    }

                    note.LeftHandFinger = finger;
                }
                else if (syData == "rf")
                {
                    NewSy();
                    var finger = Fingers.Thumb;
                    if (_sy == AlphaTexSymbols.Number)
                    {
                        finger = ToFinger((int)_syData);
                        NewSy();
                    }

                    note.RightHandFinger = finger;
                }
                else if (ApplyBeatEffect(note.Beat)) // also try beat effects
                {
                    // Success
                }
                else
                {
                    Error(syData, AlphaTexSymbols.String, false);
                }
            }

            if (_sy != AlphaTexSymbols.RBrace)
            {
                Error("note-effect", AlphaTexSymbols.RBrace, false);
            }

            NewSy();
        }

        private Fingers ToFinger(int syData)
        {
            switch (syData)
            {
                case 1:
                    return Fingers.Thumb;
                case 2:
                    return Fingers.IndexFinger;
                case 3:
                    return Fingers.MiddleFinger;
                case 4:
                    return Fingers.AnnularFinger;
                case 5:
                    return Fingers.LittleFinger;
            }

            return Fingers.Thumb;
        }

        private Duration ParseDuration(int duration)
        {
            switch (duration)
            {
                case -4: return Duration.QuadrupleWhole;
                case -2: return Duration.DoubleWhole;
                case 1: return Duration.Whole;
                case 2: return Duration.Half;
                case 4: return Duration.Quarter;
                case 8: return Duration.Eighth;
                case 16: return Duration.Sixteenth;
                case 32: return Duration.ThirtySecond;
                case 64: return Duration.SixtyFourth;
                case 128: return Duration.OneHundredTwentyEighth;
                default: return Duration.Quarter;
            }
        }

        private void BarMeta(Bar bar)
        {
            var master = bar.MasterBar;
            while (_sy == AlphaTexSymbols.MetaCommand)
            {
                var syData = _syData.ToString().ToLower();
                if (syData == "ts")
                {
                    NewSy();
                    if (_sy != AlphaTexSymbols.Number)
                    {
                        Error("timesignature-numerator", AlphaTexSymbols.Number);
                    }

                    master.TimeSignatureNumerator = (int)_syData;
                    NewSy();
                    if (_sy != AlphaTexSymbols.Number)
                    {
                        Error("timesignature-denominator", AlphaTexSymbols.Number);
                    }

                    master.TimeSignatureDenominator = (int)_syData;
                    NewSy();
                }
                else if (syData == "ro")
                {
                    master.IsRepeatStart = true;
                    NewSy();
                }
                else if (syData == "rc")
                {
                    NewSy();
                    if (_sy != AlphaTexSymbols.Number)
                    {
                        Error("repeatclose", AlphaTexSymbols.Number);
                    }

                    master.RepeatCount = (int)_syData;
                    NewSy();
                }
                else if (syData == "ks")
                {
                    NewSy();
                    if (_sy != AlphaTexSymbols.String)
                    {
                        Error("keysignature", AlphaTexSymbols.String);
                    }

                    master.KeySignature = (KeySignature)ParseKeySignature(_syData.ToString().ToLower());
                    NewSy();
                }
                else if (syData == "clef")
                {
                    NewSy();
                    switch (_sy)
                    {
                        case AlphaTexSymbols.String:
                            bar.Clef = ParseClefFromString(_syData.ToString().ToLower());
                            break;
                        case AlphaTexSymbols.Number:
                            bar.Clef = ParseClefFromInt((int)_syData);
                            break;
                        case AlphaTexSymbols.Tuning:
                            var parseResult = (TuningParseResult)_syData;
                            bar.Clef = ParseClefFromInt(parseResult.RealValue);
                            break;
                        default:
                            Error("clef", AlphaTexSymbols.String);
                            break;
                    }

                    NewSy();
                }
                else if (syData == "tempo")
                {
                    NewSy();
                    if (_sy != AlphaTexSymbols.Number)
                    {
                        Error("tempo", AlphaTexSymbols.Number);
                    }

                    var tempoAutomation = new Automation();
                    tempoAutomation.IsLinear = true;
                    tempoAutomation.Type = AutomationType.Tempo;
                    tempoAutomation.Value = (float)_syData;
                    master.TempoAutomation = tempoAutomation;
                    NewSy();
                }
                else if (syData == "section")
                {
                    NewSy();
                    if (_sy != AlphaTexSymbols.String)
                    {
                        Error("section", AlphaTexSymbols.String);
                    }

                    var text = (string)_syData;
                    NewSy();
                    var marker = "";
                    if (_sy == AlphaTexSymbols.String)
                    {
                        marker = text;
                        text = (string)_syData;
                        NewSy();
                    }

                    var section = new Section();
                    section.Marker = marker;
                    section.Text = text;
                    master.Section = section;
                }
                else if (syData == "tf")
                {
                    _allowTuning = false;
                    NewSy();
                    _allowTuning = true;

                    switch (_sy)
                    {
                        case AlphaTexSymbols.String:
                            master.TripletFeel = ParseTripletFeelFromString(_syData.ToString().ToLower());
                            break;
                        case AlphaTexSymbols.Number:
                            master.TripletFeel = ParseTripletFeelFromInt((int)_syData);
                            break;
                        default:
                            Error("triplet-feel", AlphaTexSymbols.String);
                            break;
                    }

                    NewSy();
                }
                else if (syData == "ac")
                {
                    master.IsAnacrusis = true;
                    NewSy();
                }
                else
                {
                    if (bar.Index == 0 && !HandleStaffMeta())
                    {
                        Error("measure-effects", AlphaTexSymbols.String, false);
                    }
                }
            }
        }

        #endregion
    }
}
