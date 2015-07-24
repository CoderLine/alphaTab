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
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Importer
{
    public class Gp3To5Importer : ScoreImporter
    {
        private const string VersionString = "FICHIER GUITAR PRO ";

        private int _versionNumber;

        private Score _score;

        private TripletFeel _globalTripletFeel;

        private FastList<int> _lyricsIndex;
        private FastList<string> _lyrics;

        private int _barCount;
        private int _trackCount;

        private FastList<PlaybackInformation> _playbackInfos;

        public override Score ReadScore()
        {
            ReadVersion();

            _score = new Score();

            // basic song info
            ReadScoreInformation();

            // triplet feel before Gp5
            if (_versionNumber < 500)
            {
                _globalTripletFeel = ReadBool() ? TripletFeel.Triplet8th : TripletFeel.NoTripletFeel;
            }

            // beat lyrics
            if (_versionNumber >= 400)
            {
                ReadLyrics();
            }

            // rse master settings since GP5.1
            if (_versionNumber >= 510)
            {
                // master volume (4)
                // master effect (4)
                // master equalizer (10)
                // master equalizer preset (1)
                _data.Skip(19);
            }

            // page setup since GP5
            if (_versionNumber >= 500)
            {
                ReadPageSetup();
                _score.TempoLabel = ReadStringIntByte();
            }

            // tempo stuff
            _score.Tempo = ReadInt32();
            if (_versionNumber >= 510)
            {
                ReadBool(); // hide tempo?
            }
            // keysignature and octave
            /* var keySignature = */
            ReadInt32();
            if (_versionNumber >= 400)
            {
                /* octave = */
                _data.ReadByte();
            }

            ReadPlaybackInfos();

            // repetition stuff
            if (_versionNumber >= 500)
            {
                // "Coda" bar index (2)
                // "Double Coda" bar index (2)
                // "Segno" bar index (2)
                // "Segno Segno" bar index (2)
                // "Fine" bar index (2)
                // "Da Capo" bar index (2)
                // "Da Capo al Coda" bar index (2)
                // "Da Capo al Double Coda" bar index (2)
                // "Da Capo al Fine" bar index (2)
                // "Da Segno" bar index (2)
                // "Da Segno al Coda" bar index (2)
                // "Da Segno al Double Coda" bar index (2)
                // "Da Segno al Fine "bar index (2)
                // "Da Segno Segno" bar index (2)
                // "Da Segno Segno al Coda" bar index (2)
                // "Da Segno Segno al Double Coda" bar index (2)
                // "Da Segno Segno al Fine" bar index (2)
                // "Da Coda" bar index (2)
                // "Da Double Coda" bar index (2)
                _data.Skip(38);
                // unknown (4)
                _data.Skip(4);
            }

            // contents
            _barCount = ReadInt32();
            _trackCount = ReadInt32();

            ReadMasterBars();
            ReadTracks();
            ReadBars();

            _score.Finish();

            return _score;
        }

        public void ReadVersion()
        {
            string version = ReadStringByteLength(30);
            if (!version.StartsWith("FICHIER GUITAR PRO "))
            {
                throw new UnsupportedFormatException();
            }

            version = version.Substring(VersionString.Length + 1);
            int dot = version.IndexOf('.');

            _versionNumber = (100 * Std.ParseInt(version.Substring(0, dot))) + Std.ParseInt(version.Substring(dot + 1));
        }

        public void ReadScoreInformation()
        {
            _score.Title = ReadStringIntUnused();
            _score.SubTitle = ReadStringIntUnused();
            _score.Artist = ReadStringIntUnused();
            _score.Album = ReadStringIntUnused();
            _score.Words = ReadStringIntUnused();

            _score.Music = (_versionNumber >= 500) ? ReadStringIntUnused() : _score.Words;

            _score.Copyright = ReadStringIntUnused();
            _score.Tab = ReadStringIntUnused();
            _score.Instructions = ReadStringIntUnused();
            int noticeLines = ReadInt32();
            var notice = new StringBuilder();
            for (int i = 0; i < noticeLines; i++)
            {
                if (i > 0) notice.AppendLine();
                notice.Append(ReadStringIntUnused());
            }
            _score.Notices = notice.ToString();
        }

        public void ReadLyrics()
        {
            _lyrics = new FastList<string>();
            _lyricsIndex = new FastList<int>();

            ReadInt32();
            for (int i = 0; i < 5; i++)
            {
                _lyricsIndex.Add(ReadInt32() - 1);
                _lyrics.Add(ReadStringInt());
            }
        }

        public void ReadPageSetup()
        {
            // Page Width (4)
            // Page Heigth (4)
            // Padding Left (4)
            // Padding Right (4)
            // Padding Top (4)
            // Padding Bottom (4)
            // Size Proportion(4)
            // Header and Footer display flags (2)
            _data.Skip(30);
            // title format
            // subtitle format
            // artist format
            // album format
            // words format
            // music format
            // words and music format
            // copyright format
            // pagpublic enumber format
            for (int i = 0; i < 10; i++)
            {
                ReadStringIntByte();
            }
        }

        public void ReadPlaybackInfos()
        {
            _playbackInfos = new FastList<PlaybackInformation>();
            for (int i = 0; i < 64; i++)
            {
                PlaybackInformation info = new PlaybackInformation();
                info.PrimaryChannel = i;
                info.SecondaryChannel = i;
                info.Program = ReadInt32();

                info.Volume = _data.ReadByte();
                info.Balance = _data.ReadByte();
                _data.Skip(6);

                _playbackInfos.Add(info);
            }
        }

        public void ReadMasterBars()
        {
            for (int i = 0; i < _barCount; i++)
            {
                ReadMasterBar();
            }
        }

        public void ReadMasterBar()
        {
            MasterBar previousMasterBar = default(MasterBar);
            if (_score.MasterBars.Count > 0)
            {
                previousMasterBar = _score.MasterBars[_score.MasterBars.Count - 1];
            }

            MasterBar newMasterBar = new MasterBar();
            int flags = _data.ReadByte();

            // time signature
            if ((flags & 0x01) != 0)
            {
                newMasterBar.TimeSignatureNumerator = _data.ReadByte();
            }
            else if (previousMasterBar != null)
            {
                newMasterBar.TimeSignatureNumerator = previousMasterBar.TimeSignatureNumerator;
            }
            if ((flags & 0x02) != 0)
            {
                newMasterBar.TimeSignatureDenominator = _data.ReadByte();
            }
            else if (previousMasterBar != null)
            {
                newMasterBar.TimeSignatureDenominator = previousMasterBar.TimeSignatureDenominator;
            }

            // repeatings
            newMasterBar.IsRepeatStart = (flags & 0x04) != 0;
            if ((flags & 0x08) != 0)
            {
                newMasterBar.RepeatCount = _data.ReadByte() + (_versionNumber >= 500 ? 0 : 1);
            }

            // alternate endings
            if ((flags & 0x10) != 0)
            {
                if (_versionNumber < 500)
                {
                    MasterBar currentMasterBar = previousMasterBar;
                    // get the already existing alternatives to ignore them 
                    int existentAlternatives = 0;
                    while (currentMasterBar != null)
                    {
                        // found another repeat ending?
                        if (currentMasterBar.IsRepeatEnd && currentMasterBar != previousMasterBar)
                            break;
                        // found the opening?
                        if (currentMasterBar.IsRepeatStart)
                            break;

                        existentAlternatives |= currentMasterBar.AlternateEndings;

                        currentMasterBar = currentMasterBar.PreviousMasterBar;
                    }

                    // now calculate the alternative for this bar
                    var repeatAlternative = 0;
                    var repeatMask = _data.ReadByte();
                    for (var i = 0; i < 8; i++)
                    {
                        // only add the repeating if it is not existing
                        var repeating = (1 << i);
                        if (repeatMask > i && (existentAlternatives & repeating) == 0)
                        {
                            repeatAlternative |= repeating;
                        }
                    }


                    newMasterBar.AlternateEndings = (byte)repeatAlternative;
                }
                else
                {
                    newMasterBar.AlternateEndings = (byte)_data.ReadByte();
                }
            }

            // marker
            if ((flags & 0x20) != 0)
            {
                Section section = new Section();
                section.Text = ReadStringIntByte();
                section.Marker = "";
                ReadColor();
                newMasterBar.Section = section;
            }

            // keysignature
            if ((flags & 0x40) != 0)
            {
                newMasterBar.KeySignature = _data.ReadSignedByte();
                _data.ReadByte(); // keysignature type
            }
            else if (previousMasterBar != null)
            {
                newMasterBar.KeySignature = previousMasterBar.KeySignature;
            }

            if ((_versionNumber >= 500) && ((flags & 0x03) != 0))
            {
                _data.Skip(4);
            }

            // better alternate ending mask in GP5
            if ((_versionNumber >= 500) && ((flags & 0x10) == 0))
            {
                newMasterBar.AlternateEndings = (byte)_data.ReadByte();
            }

            // tripletfeel
            if (_versionNumber >= 500)
            {
                var tripletFeel = _data.ReadByte();
                switch (tripletFeel)
                {
                    case 1:
                        newMasterBar.TripletFeel = TripletFeel.Triplet8th;
                        break;
                    case 2:
                        newMasterBar.TripletFeel = TripletFeel.Triplet16th;
                        break;
                }

                _data.ReadByte();
            }
            else
            {
                newMasterBar.TripletFeel = _globalTripletFeel;
            }

            newMasterBar.IsDoubleBar = (flags & 0x80) != 0;
            _score.AddMasterBar(newMasterBar);
        }

        public void ReadTracks()
        {
            for (int i = 0; i < _trackCount; i++)
            {
                ReadTrack();
            }
        }

        public void ReadTrack()
        {
            var newTrack = new Track();
            _score.AddTrack(newTrack);


            var flags = _data.ReadByte();
            newTrack.Name = ReadStringByteLength(40);
            newTrack.IsPercussion = (flags & 0x01) != 0;

            var stringCount = ReadInt32();
            var tuning = new FastList<int>();
            for (int i = 0; i < 7; i++)
            {
                var stringTuning = ReadInt32();
                if (stringCount > i)
                {
                    tuning.Add(stringTuning);
                }
            }
            newTrack.Tuning = tuning.ToArray();

            var port = ReadInt32();
            var index = ReadInt32() - 1;
            var effectChannel = ReadInt32() - 1;
            _data.Skip(4); // Fretcount
            if (index >= 0 && index < _playbackInfos.Count)
            {
                var info = _playbackInfos[index];
                info.Port = port;
                info.IsSolo = (flags & 0x10) != 0;
                info.IsMute = (flags & 0x20) != 0;
                info.SecondaryChannel = effectChannel;

                newTrack.PlaybackInfo = info;
            }

            newTrack.Capo = ReadInt32();
            newTrack.Color = ReadColor();

            if (_versionNumber >= 500)
            {
                // flags for 
                //  0x01 -> show tablature
                //  0x02 -> show standard notation
                _data.ReadByte();
                // flags for
                //  0x02 -> auto let ring
                //  0x04 -> auto brush
                _data.ReadByte();

                // unknown
                _data.Skip(43);
            }

            // unknown
            if (_versionNumber >= 510)
            {
                _data.Skip(4);
                ReadStringIntByte();
                ReadStringIntByte();
            }
        }

        public void ReadBars()
        {
            for (int i = 0; i < _barCount; i++)
            {
                for (int t = 0; t < _trackCount; t++)
                {
                    ReadBar(_score.Tracks[t]);
                }
            }
        }

        public void ReadBar(Track track)
        {
            var newBar = new Bar();
            if (track.IsPercussion)
            {
                newBar.Clef = Clef.Neutral;
            }
            track.AddBar(newBar);

            var voiceCount = 1;
            if (_versionNumber >= 500)
            {
                _data.ReadByte();
                voiceCount = 2;
            }

            for (int v = 0; v < voiceCount; v++)
            {
                ReadVoice(track, newBar);
            }
        }

        public void ReadVoice(Track track, Bar bar)
        {
            var beatCount = ReadInt32();
            if (beatCount == 0)
            {
                return;
            }

            var newVoice = new Voice();
            bar.AddVoice(newVoice);

            for (int i = 0; i < beatCount; i++)
            {
                ReadBeat(track, bar, newVoice);
            }
        }

        public void ReadBeat(Track track, Bar bar, Voice voice)
        {
            var newBeat = new Beat();
            var flags = _data.ReadByte();

            if ((flags & 0x01) != 0)
            {
                newBeat.Dots = 1;
            }

            if ((flags & 0x40) != 0)
            {
                var type = _data.ReadByte();
                newBeat.IsEmpty = (type & 0x02) == 0;
            }
            voice.AddBeat(newBeat);

            var duration = _data.ReadSignedByte();
            switch (duration)
            {
                case -2:
                    newBeat.Duration = Duration.Whole;
                    break;
                case -1:
                    newBeat.Duration = Duration.Half;
                    break;
                case 0:
                    newBeat.Duration = Duration.Quarter;
                    break;
                case 1:
                    newBeat.Duration = Duration.Eighth;
                    break;
                case 2:
                    newBeat.Duration = Duration.Sixteenth;
                    break;
                case 3:
                    newBeat.Duration = Duration.ThirtySecond;
                    break;
                case 4:
                    newBeat.Duration = Duration.SixtyFourth;
                    break;
                default:
                    newBeat.Duration = Duration.Quarter;
                    break;
            }

            if ((flags & 0x20) != 0)
            {
                newBeat.TupletNumerator = ReadInt32();
                switch (newBeat.TupletNumerator)
                {
                    case 1:
                        newBeat.TupletDenominator = 1;
                        break;
                    case 3:
                        newBeat.TupletDenominator = 2;
                        break;
                    case 5:
                    case 6:
                    case 7:
                        newBeat.TupletDenominator = 4;
                        break;
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                        newBeat.TupletDenominator = 8;
                        break;
                    case 2:
                    case 4:
                    case 8:
                        break;
                    default:
                        newBeat.TupletNumerator = 1;
                        newBeat.TupletDenominator = 1;
                        break;
                }
            }

            if ((flags & 0x02) != 0)
            {
                ReadChord(newBeat);
            }

            if ((flags & 0x04) != 0)
            {
                newBeat.Text = ReadStringIntUnused();
            }

            if ((flags & 0x08) != 0)
            {
                ReadBeatEffects(newBeat);
            }

            if ((flags & 0x10) != 0)
            {
                ReadMixTableChange(newBeat);
            }

            var stringFlags = _data.ReadByte();
            for (int i = 6; i >= 0; i--)
            {
                if ((stringFlags & (1 << i)) != 0 && (6 - i) < track.Tuning.Length)
                {
                    ReadNote(track, bar, voice, newBeat, (6 - i));
                }
            }

            if (_versionNumber >= 500)
            {
                _data.ReadByte();
                var flag = _data.ReadByte();
                if ((flag & 0x08) != 0)
                {
                    _data.ReadByte();
                }
            }
        }

        public void ReadChord(Beat beat)
        {
            var chord = new Chord();
            var chordId = Std.NewGuid();
            if (_versionNumber >= 500)
            {
                _data.Skip(17);
                chord.Name = ReadStringByteLength(21);
                _data.Skip(4);
                chord.FirstFret = ReadInt32();
                for (int i = 0; i < 7; i++)
                {
                    var fret = ReadInt32();
                    if (i < chord.Strings.Count)
                    {
                        chord.Strings.Add(fret);
                    }
                }
                _data.Skip(32);
            }
            else
            {
                if (_data.ReadByte() != 0) // mode1?
                {
                    // gp4
                    if (_versionNumber >= 400)
                    {
                        // Sharp (1)
                        // Unused (3)
                        // Root (1)
                        // Major/Minor (1)
                        // Nin,Eleven or Thirteen (1)
                        // Bass (4)
                        // Diminished/Augmented (4)
                        // Add (1)
                        _data.Skip(16);
                        chord.Name = (ReadStringByteLength(21));
                        // Unused (2)
                        // Fifth (1)
                        // Ninth (1)
                        // Eleventh (1)
                        _data.Skip(4);
                        chord.FirstFret = (ReadInt32());
                        for (int i = 0; i < 7; i++)
                        {
                            var fret = ReadInt32();
                            if (i < chord.Strings.Count)
                            {
                                chord.Strings.Add(fret);
                            }
                        }
                        // number of barres (1)
                        // Fret of the barre (5)
                        // Barree end (5)
                        // Omission1,3,5,7,9,11,13 (7)
                        // Unused (1)
                        // Fingering (7)
                        // Show Diagram Fingering (1)
                        // ??
                        _data.Skip(32);
                    }
                    else
                    {
                        // unknown
                        _data.Skip(25);
                        chord.Name = ReadStringByteLength(34);
                        chord.FirstFret = ReadInt32();
                        for (int i = 0; i < 6; i++)
                        {
                            var fret = ReadInt32();
                            chord.Strings.Add(fret);
                        }
                        // unknown
                        _data.Skip(36);
                    }
                }
                else
                {
                    int strings = _versionNumber >= 406 ? 7 : 6;

                    chord.Name = ReadStringIntByte();
                    chord.FirstFret = ReadInt32();
                    if (chord.FirstFret > 0)
                    {
                        for (int i = 0; i < strings; i++)
                        {
                            var fret = ReadInt32();
                            if (i < chord.Strings.Count)
                            {
                                chord.Strings.Add(fret);
                            }
                        }
                    }
                }
            }


            if (!string.IsNullOrEmpty(chord.Name))
            {
                beat.ChordId = chordId;
                beat.Voice.Bar.Track.Chords[beat.ChordId] = chord;
            }
        }

        public void ReadBeatEffects(Beat beat)
        {
            var flags = _data.ReadByte();
            var flags2 = 0;
            if (_versionNumber >= 400)
            {
                flags2 = _data.ReadByte();
            }

            beat.FadeIn = (flags & 0x10) != 0;
            if ((flags & 0x01) != 0 || (flags & 0x02) != 0)
            {
                beat.Vibrato = VibratoType.Slight;
            }
            beat.HasRasgueado = (flags2 & 0x01) != 0;

            if ((flags & 0x20) != 0 && _versionNumber >= 400)
            {
                var slapPop = _data.ReadSignedByte();
                switch (slapPop)
                {
                    case 1:
                        beat.Tap = true;
                        break;
                    case 2:
                        beat.Slap = true;
                        break;
                    case 3:
                        beat.Pop = true;
                        break;
                }
            }
            else if ((flags & 0x20) != 0)
            {
                var slapPop = _data.ReadSignedByte();
                switch (slapPop)
                {
                    case 1:
                        beat.Tap = true;
                        break;
                    case 2:
                        beat.Slap = true;
                        break;
                    case 3:
                        beat.Pop = true;
                        break;
                }
                _data.Skip(4);
            }

            if ((flags2 & 0x04) != 0)
            {
                ReadTremoloBarEffect(beat);
            }

            if ((flags & 0x40) != 0)
            {
                int strokeUp;
                int strokeDown;

                if (_versionNumber < 500)
                {
                    strokeDown = _data.ReadByte();
                    strokeUp = _data.ReadByte();
                }
                else
                {
                    strokeUp = _data.ReadByte();
                    strokeDown = _data.ReadByte();
                }

                if (strokeUp > 0)
                {
                    beat.BrushType = BrushType.BrushUp;
                    beat.BrushDuration = ToStrokeValue(strokeUp);
                }
                else if (strokeDown > 0)
                {
                    beat.BrushType = BrushType.BrushDown;
                    beat.BrushDuration = ToStrokeValue(strokeDown);
                }
            }

            if ((flags2 & 0x02) != 0)
            {
                switch (_data.ReadSignedByte())
                {
                    case 0:
                        beat.PickStroke = PickStrokeType.None;
                        break;
                    case 1:
                        beat.PickStroke = PickStrokeType.Up;
                        break;
                    case 2:
                        beat.PickStroke = PickStrokeType.Down;
                        break;
                }
            }
        }

        public void ReadTremoloBarEffect(Beat beat)
        {
            _data.ReadByte(); // type
            ReadInt32(); // value
            var pointCount = ReadInt32();
            if (pointCount > 0)
            {
                for (int i = 0; i < pointCount; i++)
                {
                    var point = new BendPoint();
                    point.Offset = ReadInt32(); // 0...60
                    point.Value = ReadInt32() / BendStep; // 0..12 (amount of quarters)
                    ReadBool(); // vibrato
                    beat.WhammyBarPoints.Add(point);
                }
            }
        }

        private static int ToStrokeValue(int value)
        {
            switch (value)
            {
                case 1:
                    return 30;
                case 2:
                    return 30;
                case 3:
                    return 60;
                case 4:
                    return 120;
                case 5:
                    return 240;
                case 6:
                    return 480;
                default:
                    return 0;
            }
        }

        public void ReadMixTableChange(Beat beat)
        {
            var tableChange = new MixTableChange();
            tableChange.Instrument = _data.ReadByte();
            if (_versionNumber >= 500)
            {
                _data.Skip(16); // Rse Info 
            }
            tableChange.Volume = _data.ReadSignedByte();
            tableChange.Balance = _data.ReadSignedByte();
            var chorus = _data.ReadSignedByte();
            var reverb = _data.ReadSignedByte();
            var phaser = _data.ReadSignedByte();
            var tremolo = _data.ReadSignedByte();
            if (_versionNumber >= 500)
            {
                tableChange.TempoName = ReadStringIntByte();
            }
            tableChange.Tempo = ReadInt32();

            // durations
            if (tableChange.Volume >= 0)
            {
                _data.ReadByte();
            }

            if (tableChange.Balance >= 0)
            {
                _data.ReadByte();
            }

            if (chorus >= 0)
            {
                _data.ReadByte();
            }

            if (reverb >= 0)
            {
                _data.ReadByte();
            }

            if (phaser >= 0)
            {
                _data.ReadByte();
            }

            if (tremolo >= 0)
            {
                _data.ReadByte();
            }

            if (tableChange.Tempo >= 0)
            {
                tableChange.Duration = _data.ReadSignedByte();
                if (_versionNumber >= 510)
                {
                    _data.ReadByte(); // hideTempo (bool)
                }
            }

            if (_versionNumber >= 400)
            {
                _data.ReadByte(); // all tracks flag
            }

            // unknown
            if (_versionNumber >= 500)
            {
                _data.ReadByte();
            }
            // unknown
            if (_versionNumber >= 510)
            {
                ReadStringIntByte();
                ReadStringIntByte();
            }

            if (tableChange.Volume >= 0)
            {
                var volumeAutomation = new Automation();
                volumeAutomation.IsLinear = true;
                volumeAutomation.Type = AutomationType.Volume;
                volumeAutomation.Value = tableChange.Volume;
                beat.Automations.Add(volumeAutomation);
            }

            if (tableChange.Balance >= 0)
            {
                var balanceAutomation = new Automation();
                balanceAutomation.IsLinear = true;
                balanceAutomation.Type = AutomationType.Balance;
                balanceAutomation.Value = tableChange.Balance;
                beat.Automations.Add(balanceAutomation);
            }

            if (tableChange.Instrument >= 0)
            {
                var instrumentAutomation = new Automation();
                instrumentAutomation.IsLinear = true;
                instrumentAutomation.Type = AutomationType.Instrument;
                instrumentAutomation.Value = tableChange.Instrument;
                beat.Automations.Add(instrumentAutomation);
            }

            if (tableChange.Tempo >= 0)
            {
                var tempoAutomation = new Automation();
                tempoAutomation.IsLinear = true;
                tempoAutomation.Type = AutomationType.Tempo;
                tempoAutomation.Value = tableChange.Tempo;
                beat.Automations.Add(tempoAutomation);

                beat.Voice.Bar.MasterBar.TempoAutomation = tempoAutomation;
            }
        }

        public void ReadNote(Track track, Bar bar, Voice voice, Beat beat, int stringIndex)
        {
            var newNote = new Note();
            newNote.String = track.Tuning.Length - stringIndex;

            var flags = _data.ReadByte();
            if ((flags & 0x02) != 0)
            {
                newNote.Accentuated = AccentuationType.Heavy;
            }
            else if ((flags & 0x40) != 0)
            {
                newNote.Accentuated = AccentuationType.Normal;
            }

            newNote.IsGhost = ((flags & 0x04) != 0);
            if ((flags & 0x20) != 0)
            {
                var noteType = _data.ReadByte();
                if (noteType == 3)
                {
                    newNote.IsDead = true;
                }
                else if (noteType == 2)
                {
                    newNote.IsTieDestination = true;
                }
            }

            if ((flags & 0x01) != 0 && _versionNumber < 500)
            {
                _data.ReadByte(); // duration 
                _data.ReadByte();  // tuplet
            }

            if ((flags & 0x10) != 0)
            {
                var dynamicNumber = _data.ReadSignedByte();
                newNote.Dynamic = ToDynamicValue(dynamicNumber);
                beat.Dynamic = newNote.Dynamic;
            }

            if ((flags & 0x20) != 0)
            {
                newNote.Fret = _data.ReadSignedByte();
            }

            if ((flags & 0x80) != 0)
            {
                newNote.LeftHandFinger = (Fingers)_data.ReadSignedByte();
                newNote.RightHandFinger = (Fingers)_data.ReadSignedByte();
                newNote.IsFingering = true;
            }

            if (_versionNumber >= 500)
            {
                if ((flags & 0x01) != 0)
                {
                    newNote.DurationPercent = ReadDouble();
                }
                var flags2 = _data.ReadByte();
                newNote.AccidentalMode = (flags2 & 0x02) != 0
                    ? NoteAccidentalMode.SwapAccidentals
                    : NoteAccidentalMode.Default;
            }

            beat.AddNote(newNote);
            if ((flags & 0x08) != 0)
            {
                ReadNoteEffects(track, voice, beat, newNote);
            }
        }

        public DynamicValue ToDynamicValue(int value)
        {
            switch (value)
            {
                case 1:
                    return DynamicValue.PPP;
                case 2:
                    return DynamicValue.PP;
                case 3:
                    return DynamicValue.P;
                case 4:
                    return DynamicValue.MP;
                case 5:
                    return DynamicValue.MF;
                case 6:
                    return DynamicValue.F;
                case 7:
                    return DynamicValue.FF;
                case 8:
                    return DynamicValue.FFF;
                default:
                    return DynamicValue.F;
            }
        }

        public void ReadNoteEffects(Track track, Voice voice, Beat beat, Note note)
        {
            var flags = _data.ReadByte();
            var flags2 = 0;
            if (_versionNumber >= 400)
            {
                flags2 = _data.ReadByte();
            }

            if ((flags & 0x01) != 0)
            {
                ReadBend(note);
            }

            if ((flags & 0x10) != 0)
            {
                ReadGrace(voice, note);
            }

            if ((flags2 & 0x04) != 0)
            {
                ReadTremoloPicking(beat);
            }

            if ((flags2 & 0x08) != 0)
            {
                ReadSlide(note);
            }
            else if (_versionNumber < 400)
            {
                if ((flags & 0x04) != 0)
                {
                    note.SlideType = SlideType.Shift;
                }
            }

            if ((flags2 & 0x10) != 0)
            {
                ReadArtificialHarmonic(note);
            }
            else if (_versionNumber < 400)
            {
                if ((flags & 0x04) != 0)
                {
                    note.HarmonicType = HarmonicType.Natural;
                    note.HarmonicValue = DeltaFretToHarmonicValue(note.Fret);
                }
                if ((flags & 0x08) != 0)
                {
                    note.HarmonicType = HarmonicType.Artificial;
                }
            }

            if ((flags2 & 0x20) != 0)
            {
                ReadTrill(note);
            }

            note.IsLetRing = (flags & 0x08) != 0;
            note.IsHammerPullOrigin = (flags & 0x02) != 0;
            if ((flags2 & 0x40) != 0)
            {
                note.Vibrato = VibratoType.Slight;
            }
            note.IsPalmMute = (flags2 & 0x02) != 0;
            note.IsStaccato = (flags2 & 0x01) != 0;
        }

        private const int BendStep = 25;
        public void ReadBend(Note note)
        {
            _data.ReadByte(); // type
            ReadInt32(); // value
            var pointCount = ReadInt32();
            if (pointCount > 0)
            {
                for (int i = 0; i < pointCount; i++)
                {
                    var point = new BendPoint();
                    point.Offset = ReadInt32(); // 0...60
                    point.Value = ReadInt32() / BendStep; // 0..12 (amount of quarters)
                    ReadBool(); // vibrato
                    note.BendPoints.Add(point);
                }
            }
        }

        public void ReadGrace(Voice voice, Note note)
        {
            var graceBeat = new Beat();
            var graceNote = new Note();
            graceNote.String = note.String;
            graceNote.Fret = _data.ReadSignedByte();
            graceBeat.Duration = Duration.ThirtySecond;
            graceBeat.Dynamic = ToDynamicValue(_data.ReadSignedByte());
            var transition = _data.ReadSignedByte();
            switch (transition)
            {
                case 0: // none
                    break;
                case 1:
                    graceNote.SlideType = SlideType.Legato;
                    graceNote.SlideTarget = note;
                    break;
                case 2: // bend
                    break;
                case 3: // hammer
                    graceNote.IsHammerPullOrigin = true;
                    break;
            }
            graceNote.Dynamic = graceBeat.Dynamic;
            _data.Skip(1); // duration

            if (_versionNumber < 500)
            {
                graceBeat.GraceType = GraceType.BeforeBeat;
            }
            else
            {
                var flags = _data.ReadByte();
                graceNote.IsDead = (flags & 0x01) != 0;
                graceBeat.GraceType = (flags & 0x02) != 0 ? GraceType.OnBeat : GraceType.BeforeBeat;
            }

            graceBeat.AddNote(graceNote);
            voice.AddGraceBeat(graceBeat);
        }

        public void ReadTremoloPicking(Beat beat)
        {
            var speed = _data.ReadByte();
            switch (speed)
            {
                case 1:
                    beat.TremoloSpeed = Duration.Eighth;
                    break;
                case 2:
                    beat.TremoloSpeed = Duration.Sixteenth;
                    break;
                case 3:
                    beat.TremoloSpeed = Duration.ThirtySecond;
                    break;
            }
        }

        public void ReadSlide(Note note)
        {
            if (_versionNumber >= 500)
            {
                var type = _data.ReadSignedByte();
                switch (type)
                {
                    case 1:
                        note.SlideType = SlideType.Shift;
                        break;
                    case 2:
                        note.SlideType = SlideType.Legato;
                        break;
                    case 4:
                        note.SlideType = SlideType.OutDown;
                        break;
                    case 8:
                        note.SlideType = SlideType.OutUp;
                        break;
                    case 16:
                        note.SlideType = SlideType.IntoFromBelow;
                        break;
                    case 32:
                        note.SlideType = SlideType.IntoFromAbove;
                        break;
                    default:
                        note.SlideType = SlideType.None;
                        break;
                }
            }
            else
            {
                var type = _data.ReadSignedByte();
                switch (type)
                {
                    case 1:
                        note.SlideType = SlideType.Shift;
                        break;
                    case 2:
                        note.SlideType = SlideType.Legato;
                        break;
                    case 3:
                        note.SlideType = SlideType.OutDown;
                        break;
                    case 4:
                        note.SlideType = SlideType.OutUp;
                        break;
                    case -1:
                        note.SlideType = SlideType.IntoFromBelow;
                        break;
                    case -2:
                        note.SlideType = SlideType.IntoFromAbove;
                        break;
                    default:
                        note.SlideType = SlideType.None;
                        break;
                }
            }
        }

        public void ReadArtificialHarmonic(Note note)
        {
            var type = _data.ReadByte();
            if (_versionNumber >= 500)
            {
                switch (type)
                {
                    case 1:
                        note.HarmonicType = HarmonicType.Natural;
                        note.HarmonicValue = DeltaFretToHarmonicValue(note.Fret);
                        break;
                    case 2:
                        // ReSharper disable UnusedVariable
                        var harmonicTone = _data.ReadByte();
                        var harmonicKey = _data.ReadByte();
                        var harmonicOctaveOffset = _data.ReadByte();
                        note.HarmonicType = HarmonicType.Artificial;
                        // ReSharper restore UnusedVariable
                        break;
                    // TODO: how to calculate the harmonic value? 
                    case 3:
                        note.HarmonicType = HarmonicType.Tap;
                        note.HarmonicValue = DeltaFretToHarmonicValue(_data.ReadByte());
                        break;
                    case 4:
                        note.HarmonicType = HarmonicType.Pinch;
                        note.HarmonicValue = 12;
                        break;
                    case 5:
                        note.HarmonicType = HarmonicType.Semi;
                        note.HarmonicValue = 12;
                        break;
                }
            }
            else if (_versionNumber >= 400)
            {
                switch (type)
                {
                    case 1:
                        note.HarmonicType = HarmonicType.Natural;
                        break;
                    case 3:
                        note.HarmonicType = HarmonicType.Tap;
                        break;
                    case 4:
                        note.HarmonicType = HarmonicType.Pinch;
                        break;
                    case 5:
                        note.HarmonicType = HarmonicType.Semi;
                        break;
                    case 15:
                        note.HarmonicType = HarmonicType.Artificial;
                        break;
                    case 17:
                        note.HarmonicType = HarmonicType.Artificial;
                        break;
                    case 22:
                        note.HarmonicType = HarmonicType.Artificial;
                        break;
                }
            }
        }

        public float DeltaFretToHarmonicValue(int deltaFret)
        {
            switch (deltaFret)
            {
                case 2:
                    return 2.4f;
                case 3:
                    return 3.2f;
                case 4:
                case 5:
                case 7:
                case 9:
                case 12:
                case 16:
                case 17:
                case 19:
                case 24:
                    return deltaFret;
                case 8:
                    return 8.2f;
                case 10:
                    return 9.6f;
                case 14:
                case 15:
                    return 14.7f;
                case 21:
                case 22:
                    return 21.7f;
                default:
                    return 12;
            }
        }

        public void ReadTrill(Note note)
        {
            note.TrillValue = _data.ReadByte() + note.StringTuning;
            switch (_data.ReadByte())
            {
                case 1:
                    note.TrillSpeed = Duration.Sixteenth;
                    break;
                case 2:
                    note.TrillSpeed = Duration.ThirtySecond;
                    break;
                case 3:
                    note.TrillSpeed = Duration.SixtyFourth;
                    break;
            }
        }

        // TODO: use native features to convert byte array to double
        public double ReadDouble()
        {
            var bytes = new byte[8];
            _data.Read(bytes, 0, bytes.Length);

            var sign = 1 - ((bytes[0] >> 7) << 1); // sign = bit 0
            var exp = (((bytes[0] << 4) & 0x7FF) | (bytes[1] >> 4)) - 1023; // exponent = bits 1..11
            var sig = GetDoubleSig(bytes);
            if (sig == 0 && exp == -1023)
                return 0.0;
            return sign * (1.0 + Math.Pow(2, -52) * sig) * Math.Pow(2, exp);
        }

        public int GetDoubleSig(byte[] bytes)
        {
            return (int)((((bytes[1] & 0xF) << 16) | (bytes[2] << 8) | bytes[3]) * 4294967296.0 +
                   (bytes[4] >> 7) * 2147483648 +
                   (((bytes[4] & 0x7F) << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]));
        }

        public Color ReadColor()
        {
            byte r = (byte)_data.ReadByte();
            byte g = (byte)_data.ReadByte();
            byte b = (byte)_data.ReadByte();
            _data.Skip(1); // alpha?
            return new Color(r, g, b);
        }


        public bool ReadBool()
        {
            return _data.ReadByte() != 0;
        }

        public int ReadInt32()
        {
            var bytes = new byte[4];
            _data.Read(bytes, 0, 4);
            return bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24;
        }

        /// <summary>
        ///  Skips an integer (4byte) and reads a string using 
        ///  a bytesize
        /// </summary>
        /// <returns></returns>
        public string ReadStringIntUnused()
        {
            _data.Skip(4);
            return ReadString(_data.ReadByte());
        }

        /// <summary>
        /// Reads an integer as size, and then the string itself
        /// </summary>
        /// <returns></returns>
        public string ReadStringInt()
        {
            return ReadString(ReadInt32());
        }

        /// <summary>
        /// Reads an integer as size, skips a byte and reads the string itself
        /// </summary>
        /// <returns></returns>
        public string ReadStringIntByte()
        {
            var length = ReadInt32() - 1;
            _data.ReadByte();
            return ReadString(length);
        }


        public string ReadString(int length)
        {
            byte[] b = new byte[length];
            _data.Read(b, 0, b.Length);
            return Std.ToString(b);
        }

        /// <summary>
        /// Reads a byte as size and the string itself.
        /// Additionally it is ensured the specified amount of bytes is read. 
        /// </summary>
        /// <param name="length">the amount of bytes to read</param>
        /// <returns></returns>
        public string ReadStringByteLength(int length)
        {
            var stringLength = _data.ReadByte();
            var s = ReadString(stringLength);
            if (stringLength < length)
            {
                _data.Skip(length - stringLength);
            }
            return s;
        }
    }
}
