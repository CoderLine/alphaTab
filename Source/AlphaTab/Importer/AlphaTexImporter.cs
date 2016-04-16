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
using System;
using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This importer can parse alphaTex markup into a score structure. 
    /// </summary>
    public class AlphaTexImporter : ScoreImporter
    {
        private const int Eof = 0;
        private static readonly int[] TrackChannels = { 0, 1 };

        private Score _score;
        private Track _track;

        private int _ch;
        private int _curChPos;

        private AlphaTexSymbols _sy;
        private object _syData;

        private bool _allowNegatives;

        private Duration _currentDuration;

        public override Score ReadScore()
        {
            try
            {
                CreateDefaultScore();
                _curChPos = 0;
                _currentDuration = Duration.Quarter;
                NextChar();
                NewSy();
                Score();

                _score.Finish();
                return _score;
            }
            catch (Exception e)
            {
                if (Std.IsException<AlphaTexException>(e))
                {
                    throw;
                }
                throw new UnsupportedFormatException();
            }
        }

        private void Error(string nonterm, AlphaTexSymbols expected, bool symbolError = true)
        {
            if (symbolError)
            {
                throw new AlphaTexException(_curChPos, nonterm, expected, _sy);
            }
            throw new AlphaTexException(_curChPos, nonterm, expected, expected, _syData);
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

            _track = new Track();
            _track.PlaybackInfo.Program = 25;
            _track.PlaybackInfo.PrimaryChannel = TrackChannels[0];
            _track.PlaybackInfo.SecondaryChannel = TrackChannels[1];
            _track.Tuning = Tuning.GetDefaultTuningFor(6).Tunings;

            _score.AddTrack(_track);
        }

        /// <summary>
        /// Converts a clef string into the clef value.
        /// </summary>
        /// <param name="str">the string to convert</param>
        /// <returns>the clef value</returns>
        private Clef ParseClef(string str)
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
        /// Converts a keysignature string into the assocciated value.
        /// </summary>
        /// <param name="str">the string to convert</param>
        /// <returns>the assocciated keysignature value</returns>
        private int ParseKeySignature(String str)
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
        /// Converts a string into the associated tuning. 
        /// </summary>
        /// <param name="str">the tuning string</param>
        /// <returns>the tuning value.</returns>
        private int ParseTuning(String str)
        {
            var tuning = TuningParser.GetTuningForText(str);
            if (tuning < 0)
            {
                Error("tuning-value", AlphaTexSymbols.String, false);
            }
            return tuning;
        }

        /// <summary>
        /// Reads the next character of the source stream.
        /// </summary>
        private void NextChar()
        {
            var b = _data.ReadByte();
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
                else if (Std.IsWhiteSpace(_ch))
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
                    NextChar();
                    var s = new StringBuilder();
                    _sy = AlphaTexSymbols.String;
                    while (_ch != 0x22 /* " */ && _ch != 0x27 /* ' */ && _ch != Eof)
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
                else if (IsDigit(_ch))
                {
                    var number = ReadNumber();
                    _sy = AlphaTexSymbols.Number;
                    _syData = number;
                }
                else if (IsLetter(_ch))
                {
                    var name = ReadName();
                    if (TuningParser.IsTuning(name))
                    {
                        _sy = AlphaTexSymbols.Tuning;
                        _syData = name.ToLower();
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
                    (code >= 0x21 && code <= 0x2F) ||
                    (code >= 0x3A && code <= 0x7E) ||
                    (code > 0x80)); /* Unicode Symbols */
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
            return (code >= 0x30 && code <= 0x39) || /*0-9*/
                    (code == 0x2D /* - */ && _allowNegatives); // allow - if negatives
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
            } while (IsLetter(_ch) || IsDigit(_ch));
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
            return Std.ParseInt(str.ToString());
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
            while (_sy == AlphaTexSymbols.MetaCommand)
            {
                var syData = _syData.ToString().ToLower();
                if (syData == "title")
                {
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
                }
                else if (syData == "subtitle")
                {
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
                }
                else if (syData == "artist")
                {
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
                }
                else if (syData == "album")
                {
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
                }
                else if (syData == "words")
                {
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
                }
                else if (syData == "music")
                {
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
                }
                else if (syData == "copyright")
                {
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
                }
                else if (syData == "tempo")
                {
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
                }
                else if (syData == "capo")
                {
                    NewSy();
                    if (_sy == AlphaTexSymbols.Number)
                    {
                        _track.Capo = (int)_syData;
                    }
                    else
                    {
                        Error("capo", AlphaTexSymbols.Number);
                    }
                    NewSy();
                    anyMeta = true;
                }
                else if (syData == "tuning")
                {
                    NewSy();
                    if (_sy == AlphaTexSymbols.Tuning) // we require at least one tuning
                    {
                        var tuning = new FastList<int>();
                        do
                        {
                            tuning.Add(ParseTuning(_syData.ToString().ToLower()));
                            NewSy();
                        } while (_sy == AlphaTexSymbols.Tuning);
                        _track.Tuning = tuning.ToArray();
                    }
                    else
                    {
                        Error("tuning", AlphaTexSymbols.Tuning);
                    }
                    anyMeta = true;
                }
                else if (syData == "instrument")
                {
                    NewSy();
                    if (_sy == AlphaTexSymbols.Number)
                    {
                        var instrument = (int)(_syData);
                        if (instrument >= 0 && instrument <= 128)
                        {
                            _track.PlaybackInfo.Program = (int)_syData;
                        }
                        else
                        {
                            Error("instrument", AlphaTexSymbols.Number, false);
                        }
                    }
                    else if (_sy == AlphaTexSymbols.String) // Name
                    {
                        var instrumentName = _syData.ToString().ToLower();
                        _track.PlaybackInfo.Program = GeneralMidi.GetValue(instrumentName);
                    }
                    else
                    {
                        Error("instrument", AlphaTexSymbols.Number);
                    }
                    NewSy();
                    anyMeta = true;
                }
                else if(anyMeta)
                {
                    Error("metaDataTags", AlphaTexSymbols.String, false);
                }
                else
                {
                    // fall forward to bar meta if unknown score meta was found
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

        private void Bar()
        {
            var master = new MasterBar();
            _score.AddMasterBar(master);

            var bar = new Bar();
            _track.AddBar(bar);

            if (master.Index > 0)
            {
                master.KeySignature = master.PreviousMasterBar.KeySignature;
                master.TimeSignatureDenominator = master.PreviousMasterBar.TimeSignatureDenominator;
                master.TimeSignatureNumerator = master.PreviousMasterBar.TimeSignatureNumerator;
                bar.Clef = bar.PreviousBar.Clef;
            }
            BarMeta(bar);

            var voice = new Voice();
            bar.AddVoice(voice);

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

        private void Beat(Voice voice)
        {
            // duration specifier?
            if (_sy == AlphaTexSymbols.DoubleDot)
            {
                NewSy();
                if (_sy != AlphaTexSymbols.Number)
                {
                    Error("duration", AlphaTexSymbols.Number);
                }

                var duration = (int)_syData;
                switch (duration)
                {
                    case 1:
                    case 2:
                    case 4:
                    case 8:
                    case 16:
                    case 32:
                    case 64:
                        _currentDuration = ParseDuration((int)_syData);
                        break;
                    default:
                        Error("duration", AlphaTexSymbols.Number, false);
                        break;
                }

                NewSy();
                return;
            }

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
                NewSy();
                if (_sy != AlphaTexSymbols.Number)
                {
                    Error("duration", AlphaTexSymbols.Number);
                }

                var duration = (int)_syData;
                switch (duration)
                {
                    case 1:
                    case 2:
                    case 4:
                    case 8:
                    case 16:
                    case 32:
                    case 64:
                        _currentDuration = ParseDuration((int)_syData);
                        break;
                    default:
                        Error("duration", AlphaTexSymbols.Number, false);
                        break;
                }

                NewSy();
            }
            beat.Duration = _currentDuration;

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
                beat.PickStroke = PickStrokeType.Up;
                NewSy();
                return true;
            }
            if (syData == "sd")
            {
                beat.PickStroke = PickStrokeType.Down;
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
                var tuplet = (int)_syData;
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
                        beat.TupletNumerator = 8;
                        beat.TupletDenominator = 8;
                        break;
                }
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

                    beat.WhammyBarPoints.Add(new BendPoint(offset, value));

                    NewSy();
                }

                while (beat.WhammyBarPoints.Count > 60)
                {
                    beat.WhammyBarPoints.RemoveAt(beat.WhammyBarPoints.Count - 1);
                }

                // set positions
                if (!exact)
                {
                    var count = beat.WhammyBarPoints.Count;
                    var step = (60 / count);
                    var i = 0;
                    while (i < count)
                    {
                        beat.WhammyBarPoints[i].Offset = Math.Min(60, (i * step));
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

            if (syData == "gr") 
            {
                NewSy();
                if (_syData.ToString().ToLower() == "ob")
                {
                    beat.GraceType = GraceType.OnBeat;
                    NewSy();
                }
                else
                {
                    beat.GraceType = GraceType.BeforeBeat;
                }
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

        private void Note(Beat beat)
        {
            // fret.string
            var syData = _syData.ToString().ToLower();
            if (_sy != AlphaTexSymbols.Number && !(_sy == AlphaTexSymbols.String
                && (syData == "x" || syData == "-")))
            {
                Error("note-fret", AlphaTexSymbols.Number);
            }

            var isDead = syData == "x";
            var isTie = syData == "-";
            int fret = (int)(isDead || isTie ? 0 : _syData);
            NewSy(); // Fret done

            if (_sy != AlphaTexSymbols.Dot)
            {
                Error("note", AlphaTexSymbols.Dot);
            }
            NewSy(); // dot done

            if (_sy != AlphaTexSymbols.Number)
            {
                Error("note-string", AlphaTexSymbols.Number);
            }
            int @string = (int)_syData;
            if (@string < 1 || @string > _track.Tuning.Length)
            {
                Error("note-string", AlphaTexSymbols.Number, false);
            }
            NewSy(); // string done

            // read effects
            var note = new Note();
            beat.AddNote(note);
            note.String = _track.Tuning.Length - (@string - 1);
            note.IsDead = isDead;
            note.IsTieDestination = isTie;
            if (!isTie)
            {
                note.Fret = fret;
            }

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
                    var exact = _syData == "be";
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
                            note.BendPoints[i].Offset = Math.Min(60, (i * step));
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
                    int fret = (int)_syData;
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
                    note.SlideType = SlideType.Legato;
                }
                else if (syData == "ss")
                {
                    NewSy();
                    note.SlideType = SlideType.Shift;
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
                case 1: return Duration.Whole;
                case 2: return Duration.Half;
                case 4: return Duration.Quarter;
                case 8: return Duration.Eighth;
                case 16: return Duration.Sixteenth;
                case 32: return Duration.ThirtySecond;
                case 64: return Duration.SixtyFourth;
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
                }
                else if (syData == "ro")
                {
                    master.IsRepeatStart = true;
                }
                else if (syData == "rc")
                {
                    NewSy();
                    if (_sy != AlphaTexSymbols.Number)
                    {
                        Error("repeatclose", AlphaTexSymbols.Number);
                    }
                    master.RepeatCount = ((int)_syData) - 1;
                }
                else if (syData == "ks")
                {
                    NewSy();
                    if (_sy != AlphaTexSymbols.String)
                    {
                        Error("keysignature", AlphaTexSymbols.String);
                    }
                    master.KeySignature = ParseKeySignature(_syData.ToString().ToLower());
                }
                else if (syData == "clef")
                {
                    NewSy();
                    if (_sy != AlphaTexSymbols.String && _sy != AlphaTexSymbols.Tuning)
                    {
                        Error("clef", AlphaTexSymbols.String);
                    }
                    bar.Clef = ParseClef(_syData.ToString().ToLower());
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
                }
                else
                {
                    Error("measure-effects", AlphaTexSymbols.String, false);
                }
                NewSy();
            }
        }

        #endregion
    }

}