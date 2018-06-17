/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Platform.Model;
using AlphaTab.Util;
using AlphaTab.IO;

namespace AlphaTab.Importer
{
    class Gp3To5Importer : ScoreImporter
    {
        private const string VersionString = "FICHIER GUITAR PRO ";

        private int _versionNumber;

        private Score _score;

        private TripletFeel _globalTripletFeel;

        private int _lyricsTrack;
        private FastList<Lyrics> _lyrics;

        private int _barCount;
        private int _trackCount;

        private FastList<PlaybackInformation> _playbackInfos;

        public override string Name { get { return "Guitar Pro 3-5"; } }

        public override Score ReadScore()
        {
            ReadVersion();

            _score = new Score();

            // basic song info
            ReadScoreInformation();

            // triplet feel before Gp5
            if (_versionNumber < 500)
            {
                _globalTripletFeel = Data.GpReadBool() ? TripletFeel.Triplet8th : TripletFeel.NoTripletFeel;
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
                Data.Skip(19);
            }

            // page setup since GP5
            if (_versionNumber >= 500)
            {
                ReadPageSetup();
                _score.TempoLabel = Data.GpReadStringIntByte();
            }

            // tempo stuff
            _score.Tempo = Data.ReadInt32BE();
            if (_versionNumber >= 510)
            {
                Data.GpReadBool(); // hide tempo?
            }
            // keysignature and octave
            /* var keySignature = */
            Data.ReadInt32BE();
            if (_versionNumber >= 400)
            {
                /* octave = */
                Data.ReadByte();
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
                Data.Skip(38);
                // unknown (4)
                Data.Skip(4);
            }

            // contents
            _barCount = Data.ReadInt32BE();
            _trackCount = Data.ReadInt32BE();

            ReadMasterBars();
            ReadTracks();
            ReadBars();

            _score.Finish(Settings);
            if (_lyrics != null && _lyricsTrack >= 0)
            {
                _score.Tracks[_lyricsTrack].ApplyLyrics(_lyrics);
            }

            return _score;
        }

        public void ReadVersion()
        {
            string version = Data.GpReadStringByteLength(30);
            if (!version.StartsWith("FICHIER GUITAR PRO "))
            {
                throw new UnsupportedFormatException();
            }

            version = version.Substring(VersionString.Length + 1);
            int dot = version.IndexOf('.');

            _versionNumber = (100 * Platform.Platform.ParseInt(version.Substring(0, dot))) + Platform.Platform.ParseInt(version.Substring(dot + 1));

            Logger.Info(Name, "Guitar Pro version " + version + " detected");
        }

        public void ReadScoreInformation()
        {
            _score.Title = Data.GpReadStringIntUnused();
            _score.SubTitle = Data.GpReadStringIntUnused();
            _score.Artist = Data.GpReadStringIntUnused();
            _score.Album = Data.GpReadStringIntUnused();
            _score.Words = Data.GpReadStringIntUnused();

            _score.Music = (_versionNumber >= 500) ? Data.GpReadStringIntUnused() : _score.Words;

            _score.Copyright = Data.GpReadStringIntUnused();
            _score.Tab = Data.GpReadStringIntUnused();
            _score.Instructions = Data.GpReadStringIntUnused();
            int noticeLines = Data.ReadInt32BE();
            var notice = new StringBuilder();
            for (int i = 0; i < noticeLines; i++)
            {
                if (i > 0) notice.AppendLine();
                notice.Append(Data.GpReadStringIntUnused());
            }
            _score.Notices = notice.ToString();
        }

        public void ReadLyrics()
        {
            _lyrics = new FastList<Lyrics>();

            _lyricsTrack = Data.ReadInt32BE() - 1;
            for (int i = 0; i < 5; i++)
            {
                var lyrics = new Lyrics();
                lyrics.StartBar = Data.ReadInt32BE() - 1;
                lyrics.Text = Data.GpReadStringInt();
                _lyrics.Add(lyrics);
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
            Data.Skip(30);
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
                Data.GpReadStringIntByte();
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
                info.Program = Data.ReadInt32BE();

                info.Volume = Data.ReadByte();
                info.Balance = Data.ReadByte();
                Data.Skip(6);

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
            int flags = Data.ReadByte();

            // time signature
            if ((flags & 0x01) != 0)
            {
                newMasterBar.TimeSignatureNumerator = Data.ReadByte();
            }
            else if (previousMasterBar != null)
            {
                newMasterBar.TimeSignatureNumerator = previousMasterBar.TimeSignatureNumerator;
            }
            if ((flags & 0x02) != 0)
            {
                newMasterBar.TimeSignatureDenominator = Data.ReadByte();
            }
            else if (previousMasterBar != null)
            {
                newMasterBar.TimeSignatureDenominator = previousMasterBar.TimeSignatureDenominator;
            }

            // repeatings
            newMasterBar.IsRepeatStart = (flags & 0x04) != 0;
            if ((flags & 0x08) != 0)
            {
                newMasterBar.RepeatCount = Data.ReadByte() + (_versionNumber >= 500 ? 0 : 1);
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
                    var repeatMask = Data.ReadByte();
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
                    newMasterBar.AlternateEndings = (byte)Data.ReadByte();
                }
            }

            // marker
            if ((flags & 0x20) != 0)
            {
                Section section = new Section();
                section.Text = Data.GpReadStringIntByte();
                section.Marker = "";
                Data.GpReadColor();
                newMasterBar.Section = section;
            }

            // keysignature
            if ((flags & 0x40) != 0)
            {
                newMasterBar.KeySignature = Data.ReadSignedByte();
                newMasterBar.KeySignatureType = (KeySignatureType)Data.ReadByte();
            }
            else if (previousMasterBar != null)
            {
                newMasterBar.KeySignature = previousMasterBar.KeySignature;
                newMasterBar.KeySignatureType = previousMasterBar.KeySignatureType;
            }

            if ((_versionNumber >= 500) && ((flags & 0x03) != 0))
            {
                Data.Skip(4);
            }

            // better alternate ending mask in GP5
            if ((_versionNumber >= 500) && ((flags & 0x10) == 0))
            {
                newMasterBar.AlternateEndings = (byte)Data.ReadByte();
            }

            // tripletfeel
            if (_versionNumber >= 500)
            {
                var tripletFeel = Data.ReadByte();
                switch (tripletFeel)
                {
                    case 1:
                        newMasterBar.TripletFeel = TripletFeel.Triplet8th;
                        break;
                    case 2:
                        newMasterBar.TripletFeel = TripletFeel.Triplet16th;
                        break;
                }

                Data.ReadByte();
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
            var newTrack = new Track(1);
            _score.AddTrack(newTrack);

            var mainStaff = newTrack.Staves[0];

            var flags = Data.ReadByte();
            newTrack.Name = Data.GpReadStringByteLength(40);
            if ((flags & 0x01) != 0)
            {
                mainStaff.StaffKind = StaffKind.Percussion;
            }

            var stringCount = Data.ReadInt32BE();
            var tuning = new FastList<int>();
            for (int i = 0; i < 7; i++)
            {
                var stringTuning = Data.ReadInt32BE();
                if (stringCount > i)
                {
                    tuning.Add(stringTuning);
                }
            }
            mainStaff.Tuning = tuning.ToArray();

            var port = Data.ReadInt32BE();
            var index = Data.ReadInt32BE() - 1;
            var effectChannel = Data.ReadInt32BE() - 1;
            Data.Skip(4); // Fretcount
            if (index >= 0 && index < _playbackInfos.Count)
            {
                var info = _playbackInfos[index];
                info.Port = port;
                info.IsSolo = (flags & 0x10) != 0;
                info.IsMute = (flags & 0x20) != 0;
                info.SecondaryChannel = effectChannel;

                if (GeneralMidi.IsGuitar(info.Program))
                {
                    mainStaff.DisplayTranspositionPitch = -12;
                }

                newTrack.PlaybackInfo = info;
            }

            mainStaff.Capo = Data.ReadInt32BE();
            newTrack.Color = Data.GpReadColor();

            if (_versionNumber >= 500)
            {
                // flags for 
                //  0x01 -> show tablature
                //  0x02 -> show standard notation
                Data.ReadByte();
                // flags for
                //  0x02 -> auto let ring
                //  0x04 -> auto brush
                Data.ReadByte();

                // unknown
                Data.Skip(43);
            }

            // unknown
            if (_versionNumber >= 510)
            {
                Data.Skip(4);
                Data.GpReadStringIntByte();
                Data.GpReadStringIntByte();
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
            var mainStaff = track.Staves[0];

            if (mainStaff.StaffKind == StaffKind.Percussion)
            {
                newBar.Clef = Clef.Neutral;
            }

            mainStaff.AddBar(newBar);

            var voiceCount = 1;
            if (_versionNumber >= 500)
            {
                Data.ReadByte();
                voiceCount = 2;
            }

            for (int v = 0; v < voiceCount; v++)
            {
                ReadVoice(track, newBar);
            }
        }

        public void ReadVoice(Track track, Bar bar)
        {
            var beatCount = Data.ReadInt32BE();
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
            var flags = Data.ReadByte();

            if ((flags & 0x01) != 0)
            {
                newBeat.Dots = 1;
            }

            if ((flags & 0x40) != 0)
            {
                var type = Data.ReadByte();
                newBeat.IsEmpty = (type & 0x02) == 0;
            }
            voice.AddBeat(newBeat);

            var duration = Data.ReadSignedByte();
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
                newBeat.TupletNumerator = Data.ReadInt32BE();
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
                newBeat.Text = Data.GpReadStringIntUnused();
            }

            if ((flags & 0x08) != 0)
            {
                ReadBeatEffects(newBeat);
            }

            if ((flags & 0x10) != 0)
            {
                ReadMixTableChange(newBeat);
            }

            var stringFlags = Data.ReadByte();
            for (int i = 6; i >= 0; i--)
            {
                if ((stringFlags & (1 << i)) != 0 && (6 - i) < bar.Staff.Tuning.Length)
                {
                    ReadNote(track, bar, voice, newBeat, (6 - i));
                }
            }

            if (_versionNumber >= 500)
            {
                Data.ReadByte();
                var flag = Data.ReadByte();
                if ((flag & 0x08) != 0)
                {
                    Data.ReadByte();
                }
            }
        }

        public void ReadChord(Beat beat)
        {
            var chord = new Chord();
            var chordId = Platform.Platform.NewGuid();
            if (_versionNumber >= 500)
            {
                Data.Skip(17);
                chord.Name = Data.GpReadStringByteLength(21);
                Data.Skip(4);
                chord.FirstFret = Data.ReadInt32BE();
                for (int i = 0; i < 7; i++)
                {
                    var fret = Data.ReadInt32BE();
                    if (i < beat.Voice.Bar.Staff.Tuning.Length)
                    {
                        chord.Strings.Add(fret);
                    }
                }

                var numberOfBarres = Data.ReadByte();
                var barreFrets = new byte[5];
                Data.Read(barreFrets, 0, barreFrets.Length);
                for (int i = 0; i < numberOfBarres; i++)
                {
                    chord.BarreFrets.Add(barreFrets[i]);
                }

                Data.Skip(26);
            }
            else
            {
                if (Data.ReadByte() != 0) // mode1?
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
                        Data.Skip(16);
                        chord.Name = (Data.GpReadStringByteLength(21));
                        // Unused (2)
                        // Fifth (1)
                        // Ninth (1)
                        // Eleventh (1)
                        Data.Skip(4);
                        chord.FirstFret = (Data.ReadInt32BE());
                        for (int i = 0; i < 7; i++)
                        {
                            var fret = Data.ReadInt32BE();
                            if (i < beat.Voice.Bar.Staff.Tuning.Length)
                            {
                                chord.Strings.Add(fret);
                            }
                        }

                        var numberOfBarres = Data.ReadByte();
                        var barreFrets = new byte[5];
                        Data.Read(barreFrets, 0, barreFrets.Length);
                        for (int i = 0; i < numberOfBarres; i++)
                        {
                            chord.BarreFrets.Add(barreFrets[i]);
                        }

                        // Barree end (5)
                        // Omission1,3,5,7,9,11,13 (7)
                        // Unused (1)
                        // Fingering (7)
                        // Show Diagram Fingering (1)
                        // ??
                        Data.Skip(26);
                    }
                    else
                    {
                        // unknown
                        Data.Skip(25);
                        chord.Name = Data.GpReadStringByteLength(34);
                        chord.FirstFret = Data.ReadInt32BE();
                        for (int i = 0; i < 6; i++)
                        {
                            var fret = Data.ReadInt32BE();
                            if (i < beat.Voice.Bar.Staff.Tuning.Length)
                            {
                                chord.Strings.Add(fret);
                            }
                        }
                        // unknown
                        Data.Skip(36);
                    }
                }
                else
                {
                    int strings = _versionNumber >= 406 ? 7 : 6;

                    chord.Name = Data.GpReadStringIntByte();
                    chord.FirstFret = Data.ReadInt32BE();
                    if (chord.FirstFret > 0)
                    {
                        for (int i = 0; i < strings; i++)
                        {
                            var fret = Data.ReadInt32BE();
                            if (i < beat.Voice.Bar.Staff.Tuning.Length)
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
                beat.Voice.Bar.Staff.Chords[beat.ChordId] = chord;
            }
        }

        public void ReadBeatEffects(Beat beat)
        {
            var flags = Data.ReadByte();
            var flags2 = 0;
            if (_versionNumber >= 400)
            {
                flags2 = Data.ReadByte();
            }

            beat.FadeIn = (flags & 0x10) != 0;
            if ( (_versionNumber < 400 && (flags & 0x01) != 0) || (flags & 0x02) != 0)
            {
                beat.Vibrato = VibratoType.Slight;
            }
            beat.HasRasgueado = (flags2 & 0x01) != 0;

            if ((flags & 0x20) != 0 && _versionNumber >= 400)
            {
                var slapPop = Data.ReadSignedByte();
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
                var slapPop = Data.ReadSignedByte();
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
                Data.Skip(4);
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
                    strokeDown = Data.ReadByte();
                    strokeUp = Data.ReadByte();
                }
                else
                {
                    strokeUp = Data.ReadByte();
                    strokeDown = Data.ReadByte();
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
                switch (Data.ReadSignedByte())
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
            Data.ReadByte(); // type
            Data.ReadInt32BE(); // value
            var pointCount = Data.ReadInt32BE();
            if (pointCount > 0)
            {
                for (int i = 0; i < pointCount; i++)
                {
                    var point = new BendPoint();
                    point.Offset = Data.ReadInt32BE(); // 0...60
                    point.Value = Data.ReadInt32BE() / BendStep; // 0..12 (amount of quarters)
                    Data.GpReadBool(); // vibrato
                    beat.AddWhammyBarPoint(point);
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
            tableChange.Instrument = Data.ReadSignedByte();
            if (_versionNumber >= 500)
            {
                Data.Skip(16); // Rse Info 
            }
            tableChange.Volume = Data.ReadSignedByte();
            tableChange.Balance = Data.ReadSignedByte();
            var chorus = Data.ReadSignedByte();
            var reverb = Data.ReadSignedByte();
            var phaser = Data.ReadSignedByte();
            var tremolo = Data.ReadSignedByte();
            if (_versionNumber >= 500)
            {
                tableChange.TempoName = Data.GpReadStringIntByte();
            }
            tableChange.Tempo = Data.ReadInt32BE();

            // durations
            if (tableChange.Volume >= 0)
            {
                Data.ReadByte();
            }

            if (tableChange.Balance >= 0)
            {
                Data.ReadByte();
            }

            if (chorus >= 0)
            {
                Data.ReadByte();
            }

            if (reverb >= 0)
            {
                Data.ReadByte();
            }

            if (phaser >= 0)
            {
                Data.ReadByte();
            }

            if (tremolo >= 0)
            {
                Data.ReadByte();
            }

            if (tableChange.Tempo >= 0)
            {
                tableChange.Duration = Data.ReadSignedByte();
                if (_versionNumber >= 510)
                {
                    Data.ReadByte(); // hideTempo (bool)
                }
            }

            if (_versionNumber >= 400)
            {
                Data.ReadByte(); // all tracks flag
            }

            // unknown
            if (_versionNumber >= 500)
            {
                Data.ReadByte();
            }
            // unknown
            if (_versionNumber >= 510)
            {
                Data.GpReadStringIntByte();
                Data.GpReadStringIntByte();
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
            newNote.String = bar.Staff.Tuning.Length - stringIndex;

            var flags = Data.ReadByte();
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
                var noteType = Data.ReadByte();
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
                Data.ReadByte(); // duration 
                Data.ReadByte();  // tuplet
            }

            if ((flags & 0x10) != 0)
            {
                var dynamicNumber = Data.ReadSignedByte();
                newNote.Dynamic = ToDynamicValue(dynamicNumber);
                beat.Dynamic = newNote.Dynamic;
            }

            if ((flags & 0x20) != 0)
            {
                newNote.Fret = Data.ReadSignedByte();
            }

            if ((flags & 0x80) != 0)
            {
                newNote.LeftHandFinger = (Fingers)Data.ReadSignedByte();
                newNote.RightHandFinger = (Fingers)Data.ReadSignedByte();
                newNote.IsFingering = true;
            }

            if (_versionNumber >= 500)
            {
                if ((flags & 0x01) != 0)
                {
                    newNote.DurationPercent = Data.GpReadDouble();
                }
                var flags2 = Data.ReadByte();
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
            var flags = Data.ReadByte();
            var flags2 = 0;
            if (_versionNumber >= 400)
            {
                flags2 = Data.ReadByte();
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
            Data.ReadByte(); // type
            Data.ReadInt32BE(); // value
            var pointCount = Data.ReadInt32BE();
            if (pointCount > 0)
            {
                for (int i = 0; i < pointCount; i++)
                {
                    var point = new BendPoint();
                    point.Offset = Data.ReadInt32BE(); // 0...60
                    point.Value = Data.ReadInt32BE() / BendStep; // 0..12 (amount of quarters)
                    Data.GpReadBool(); // vibrato
                    note.AddBendPoint(point);
                }
            }
        }

        public void ReadGrace(Voice voice, Note note)
        {
            var graceBeat = new Beat();
            var graceNote = new Note();
            graceNote.String = note.String;
            graceNote.Fret = Data.ReadSignedByte();
            graceBeat.Duration = Duration.ThirtySecond;
            graceBeat.Dynamic = ToDynamicValue(Data.ReadSignedByte());
            var transition = Data.ReadSignedByte();
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
            Data.Skip(1); // duration

            if (_versionNumber < 500)
            {
                graceBeat.GraceType = GraceType.BeforeBeat;
            }
            else
            {
                var flags = Data.ReadByte();
                graceNote.IsDead = (flags & 0x01) != 0;
                graceBeat.GraceType = (flags & 0x02) != 0 ? GraceType.OnBeat : GraceType.BeforeBeat;
            }

            graceBeat.AddNote(graceNote);
            voice.AddGraceBeat(graceBeat);
        }

        public void ReadTremoloPicking(Beat beat)
        {
            var speed = Data.ReadByte();
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
                var type = Data.ReadSignedByte();
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
                var type = Data.ReadSignedByte();
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
            var type = Data.ReadByte();
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
                        var harmonicTone = Data.ReadByte();
                        var harmonicKey = Data.ReadByte();
                        var harmonicOctaveOffset = Data.ReadByte();
                        note.HarmonicType = HarmonicType.Artificial;
                        // ReSharper restore UnusedVariable
                        break;
                    // TODO: how to calculate the harmonic value? 
                    case 3:
                        note.HarmonicType = HarmonicType.Tap;
                        note.HarmonicValue = DeltaFretToHarmonicValue(Data.ReadByte());
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
            note.TrillValue = Data.ReadByte() + note.StringTuning;
            switch (Data.ReadByte())
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

    }
}
