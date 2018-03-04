/*
 * This file is part of alphaSynth.
 * Copyright (c) 2014, T3866, PerryCodes, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Audio.Synth.IO;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Synth.Midi
{
    public class MidiFile
    {
        public int Division { get; private set; }
        public MidiTrackFormat TrackFormat { get; private set; }
        public MidiTimeFormat TimingStandard { get; private set; }
        public MidiTrack[] Tracks { get; private set; }

        public MidiFile()
        {
            Division = 0;
            TrackFormat = 0;
            TimingStandard = 0;
        }

        public void CombineTracks()
        {
            var finalTrack = MergeTracks();
            var absEvents = new MidiEvent[Tracks.Length][];

            for (int i = 0; i < Tracks.Length; i++)
            {
                absEvents[i] = new MidiEvent[Tracks[i].MidiEvents.Length];
                var totalDeltaTime = 0;
                for (int j = 0; j < Tracks[i].MidiEvents.Length; j++)
                {
                    absEvents[i][j] = Tracks[i].MidiEvents[j];
                    totalDeltaTime += absEvents[i][j].DeltaTime;
                    absEvents[i][j].DeltaTime = totalDeltaTime;
                }
            }

            var eventCount = 0;
            var delta = 0;
            var nextdelta = int.MaxValue;
            var counters = new int[absEvents.Length];
            Platform.Platform.ClearIntArray(counters);
            while (eventCount < finalTrack.MidiEvents.Length)
            {
                for (int x = 0; x < absEvents.Length; x++)
                {
                    while (counters[x] < absEvents[x].Length && absEvents[x][counters[x]].DeltaTime == delta)
                    {
                        finalTrack.MidiEvents[eventCount] = absEvents[x][counters[x]];
                        eventCount++;
                        counters[x]++;
                    }
                    if (counters[x] < absEvents[x].Length && absEvents[x][counters[x]].DeltaTime < nextdelta)
                        nextdelta = absEvents[x][counters[x]].DeltaTime;
                }
                delta = nextdelta;
                nextdelta = int.MaxValue;
            }
            finalTrack.EndTime = finalTrack.MidiEvents[finalTrack.MidiEvents.Length - 1].DeltaTime;
            var deltaDiff = 0;
            for (int x = 0; x < finalTrack.MidiEvents.Length; x++)
            {
                var oldTime = finalTrack.MidiEvents[x].DeltaTime;
                finalTrack.MidiEvents[x].DeltaTime -= deltaDiff;
                deltaDiff = oldTime;
            }

            Tracks = new MidiTrack[] { finalTrack };
            TrackFormat = MidiTrackFormat.SingleTrack;
        }

        public MidiTrack MergeTracks()
        {
            var eventCount = 0;
            var notesPlayed = 0;
            var programsUsed = new FastList<byte>();
            var drumProgramsUsed = new FastList<byte>();
            var channelsUsed = new FastList<byte>();
            for (int x = 0; x < Tracks.Length; x++)
            {
                eventCount += Tracks[x].MidiEvents.Length;
                notesPlayed += Tracks[x].NoteOnCount;

                for (int i = 0; i < Tracks[x].Instruments.Length; i++)
                {
                    var p = Tracks[x].Instruments[i];
                    if (programsUsed.IndexOf(p) == -1)
                        programsUsed.Add(p);
                }
                for (int i = 0; i < Tracks[x].DrumInstruments.Length; i++)
                {
                    var p = Tracks[x].DrumInstruments[i];
                    if (drumProgramsUsed.IndexOf(p) == -1)
                        drumProgramsUsed.Add(p);
                }

                for (int i = 0; i < Tracks[x].ActiveChannels.Length; i++)
                {
                    var p = Tracks[x].ActiveChannels[i];
                    if (channelsUsed.IndexOf(p) == -1)
                        channelsUsed.Add(p);
                }
            }

            var track = new MidiTrack(programsUsed.ToArray(),
                                                drumProgramsUsed.ToArray(),
                                                channelsUsed.ToArray(),
                                                new MidiEvent[eventCount]);
            track.NoteOnCount = notesPlayed;
            return track;
        }

        public void Load(IReadable input)
        {
            if (!FindHead(input, 500))
                throw new Exception("Invalid midi file : MThd chunk could not be found.");
            ReadHeader(input);
            for (int x = 0; x < Tracks.Length; x++)
            {
                Tracks[x] = ReadTrack(input);
            }
        }

        private bool FindHead(IReadable input, int attempts)
        {
            var match = 0;
            while (attempts > 0)
            {
                switch (input.ReadByte())
                {
                    case 'M':
                        match = 1;
                        break;
                    case 'T':
                        match = match == 1 ? 2 : 0;
                        break;
                    case 'h':
                        match = match == 2 ? 3 : 0;
                        break;
                    case 'd':
                        if (match == 3) return true;
                        match = 0;
                        break;
                }
                attempts--;
            }
            return false;
        }

        private void ReadHeader(IReadable input)
        {
            if (input.ReadInt32BE() != 6)
                throw new Exception("Midi header is invalid.");
            TrackFormat = (MidiTrackFormat)input.ReadInt16BE();
            Tracks = new MidiTrack[input.ReadInt16BE()];
            var div = input.ReadInt16BE();
            Division = div & 0x7FFF;
            TimingStandard = ((div & 0x8000) > 0) ? MidiTimeFormat.FramesPerSecond : MidiTimeFormat.TicksPerBeat;
        }

        private MidiTrack ReadTrack(IReadable input)
        {
            var instList = new FastList<Byte>();
            var drumList = new FastList<Byte>();
            var channelList = new FastList<Byte>();
            var eventList = new FastList<MidiEvent>();
            var noteOnCount = 0;
            var totalTime = 0;
            while (input.Read8BitChars(4) != "MTrk")
            {
                var length = input.ReadInt32BE();
                while (length > 0)
                {
                    length--;
                    input.ReadByte();
                }
            }

            var endPosition = input.ReadInt32BE() + input.Position;
            var prevStatus = 0;
            while (input.Position < endPosition)
            {
                var delta = ReadVariableLength(input);
                totalTime += delta;
                var status = input.ReadByte();
                if (status >= 0x80 && status <= 0xEF)
                {//voice message
                    prevStatus = status;
                    eventList.Add(ReadVoiceMessage(input, delta, (byte)status, (byte)input.ReadByte()));
                    noteOnCount = TrackVoiceStats(eventList[eventList.Count - 1], instList, drumList, channelList, noteOnCount);
                }
                else if (status >= 0xF0 && status <= 0xF7)
                {//system common message
                    prevStatus = 0;
                    eventList.Add(ReadSystemCommonMessage(input, delta, (byte)status));
                }
                else if (status >= 0xF8 && status <= 0xFF)
                {//realtime message
                    eventList.Add(ReadRealTimeMessage(input, delta, (byte)status));
                }
                else
                {//data bytes
                    if (prevStatus == 0)
                    {//if no running status continue to next status byte
                        while ((status & 0x80) != 0x80)
                        {
                            status = input.ReadByte();
                        }
                        if (status >= 0x80 && status <= 0xEF)
                        {//voice message
                            prevStatus = status;
                            eventList.Add(ReadVoiceMessage(input, delta, (byte)status, (byte)input.ReadByte()));
                            noteOnCount = TrackVoiceStats(eventList[eventList.Count - 1], instList, drumList, channelList, noteOnCount);
                        }
                        else if (status >= 0xF0 && status <= 0xF7)
                        {//system common message
                            eventList.Add(ReadSystemCommonMessage(input, delta, (byte)status));
                        }
                        else if (status >= 0xF8 && status <= 0xFF)
                        {//realtime message
                            eventList.Add(ReadRealTimeMessage(input, delta, (byte)status));
                        }
                    }
                    else
                    {//otherwise apply running status
                        eventList.Add(ReadVoiceMessage(input, delta, (byte)prevStatus, (byte)status));
                        noteOnCount = TrackVoiceStats(eventList[eventList.Count - 1], instList, drumList, channelList, noteOnCount);
                    }
                }
            }

            if (input.Position != endPosition)
                throw new Exception("The track length was invalid for the current MTrk chunk.");
            if (channelList.IndexOf(MidiHelper.DrumChannel) != -1)
            {
                if (drumList.IndexOf(0) == -1)
                    drumList.Add(0);
            }
            else
            {
                if (instList.IndexOf(0) == -1)
                    instList.Add(0);
            }
            var track = new MidiTrack(instList.ToArray(),
                drumList.ToArray(),
                channelList.ToArray(),
                eventList.ToArray());
            track.NoteOnCount = noteOnCount;
            track.EndTime = totalTime;
            return track;
        }

        private static MidiEvent ReadMetaMessage(IReadable input, int delta, byte status)
        {
            var metaStatus = input.ReadByte();
            switch ((MetaEventTypeEnum)metaStatus)
            {
                case MetaEventTypeEnum.SequenceNumber:
                    {
                        var count = input.ReadByte();
                        if (count == 0)
                            return new MetaNumberEvent(delta, status, (byte)metaStatus, -1);
                        else if (count == 2)
                        {
                            return new MetaNumberEvent(delta, status, (byte)metaStatus, input.ReadInt16BE());
                        }
                        else
                            throw new Exception("Invalid sequence number event.");
                    }
                case MetaEventTypeEnum.TextEvent:
                    return new MetaTextEvent(delta, status, (byte)metaStatus, ReadString(input));
                case MetaEventTypeEnum.CopyrightNotice:
                    return new MetaTextEvent(delta, status, (byte)metaStatus, ReadString(input));
                case MetaEventTypeEnum.SequenceOrTrackName:
                    return new MetaTextEvent(delta, status, (byte)metaStatus, ReadString(input));
                case MetaEventTypeEnum.InstrumentName:
                    return new MetaTextEvent(delta, status, (byte)metaStatus, ReadString(input));
                case MetaEventTypeEnum.LyricText:
                    return new MetaTextEvent(delta, status, (byte)metaStatus, ReadString(input));
                case MetaEventTypeEnum.MarkerText:
                    return new MetaTextEvent(delta, status, (byte)metaStatus, ReadString(input));
                case MetaEventTypeEnum.CuePoint:
                    return new MetaTextEvent(delta, status, (byte)metaStatus, ReadString(input));
                case MetaEventTypeEnum.PatchName:
                    return new MetaTextEvent(delta, status, (byte)metaStatus, ReadString(input));
                case MetaEventTypeEnum.PortName:
                    return new MetaTextEvent(delta, status, (byte)metaStatus, ReadString(input));
                case MetaEventTypeEnum.MidiChannel:
                    if (input.ReadByte() != 1)
                        throw new Exception("Invalid midi channel event. Expected size of 1.");
                    return new MetaEvent(delta, status, (byte)metaStatus, (byte)input.ReadByte());
                case MetaEventTypeEnum.MidiPort:
                    if (input.ReadByte() != 1)
                        throw new Exception("Invalid midi port event. Expected size of 1.");
                    return new MetaEvent(delta, status, (byte)metaStatus, (byte)input.ReadByte());
                case MetaEventTypeEnum.EndOfTrack:
                    return new MetaEvent(delta, status, (byte)metaStatus, (byte)input.ReadByte());
                case MetaEventTypeEnum.Tempo:
                    if (input.ReadByte() != 3)
                        throw new Exception("Invalid tempo event. Expected size of 3.");
                    return new MetaNumberEvent(delta, status, (byte)metaStatus, (input.ReadByte() << 16) | (input.ReadByte() << 8) | input.ReadByte());
                case MetaEventTypeEnum.SmpteOffset:
                    if (input.ReadByte() != 5)
                        throw new Exception("Invalid smpte event. Expected size of 5.");
                    return new MetaTextEvent(delta, status, (byte)metaStatus, input.ReadByte() + ":" + input.ReadByte() + ":" + input.ReadByte() + ":" + input.ReadByte() + ":" + input.ReadByte());
                case MetaEventTypeEnum.TimeSignature:
                    if (input.ReadByte() != 4)
                        throw new Exception("Invalid time signature event. Expected size of 4.");
                    return new MetaDataEvent(delta, status, (byte)metaStatus, new byte[] { (byte) input.ReadByte(), (byte)input.ReadByte(), (byte)input.ReadByte(), (byte)input.ReadByte() });
                case MetaEventTypeEnum.KeySignature:
                    if (input.ReadByte() != 2)
                        throw new Exception("Invalid key signature event. Expected size of 2.");
                    return new MetaTextEvent(delta, status, (byte)metaStatus, input.ReadByte() + ":" + input.ReadByte());
                case MetaEventTypeEnum.SequencerSpecific:
                    var length = ReadVariableLength(input);
                    var data = input.ReadByteArray(length);
                    return new MetaDataEvent(delta, status, (byte)metaStatus, data);
            }
            throw new Exception("Not a valid meta message Status: " + status + " Meta: " + metaStatus);
        }

        private static MidiEvent ReadRealTimeMessage(IReadable input, int delta, byte status)
        {
            switch ((RealTimeTypeEnum)status)
            {
                case RealTimeTypeEnum.MidiClock:
                    return new RealTimeEvent(delta, status, 0, 0);
                case RealTimeTypeEnum.MidiTick:
                    return new RealTimeEvent(delta, status, 0, 0);
                case RealTimeTypeEnum.MidiStart:
                    return new RealTimeEvent(delta, status, 0, 0);
                case RealTimeTypeEnum.MidiContinue:
                    return new RealTimeEvent(delta, status, 0, 0);
                case RealTimeTypeEnum.MidiStop:
                    return new RealTimeEvent(delta, status, 0, 0);
                case RealTimeTypeEnum.ActiveSense:
                    return new RealTimeEvent(delta, status, 0, 0);
                case RealTimeTypeEnum.Reset:
                    return ReadMetaMessage(input, delta, status);
                default:
                    throw new Exception("The real time message was invalid or unsupported : " + status);
            }
        }

        private static MidiEvent ReadSystemCommonMessage(IReadable input, int delta, byte status)
        {
            switch ((SystemCommonTypeEnum)status)
            {
                case SystemCommonTypeEnum.SystemExclusive2:
                case SystemCommonTypeEnum.SystemExclusive:
                    {
                        var maker = input.ReadInt16BE();
                        if (maker == 0x0)
                        {
                            maker = input.ReadInt16BE();
                        }
                        else if (maker == 0xF7)
                            return null;
                        var data = new FastList<byte>();
                        var b = input.ReadByte();
                        while (b != 0xF7)
                        {
                            data.Add((byte)b);
                            b = input.ReadByte();
                        }
                        return new SystemExclusiveEvent(delta, status, maker, data.ToArray());
                    }
                case SystemCommonTypeEnum.MtcQuarterFrame:
                    return new SystemCommonEvent(delta, status, (byte)input.ReadByte(), 0);
                case SystemCommonTypeEnum.SongPosition:
                    return new SystemCommonEvent(delta, status, (byte)input.ReadByte(), (byte)input.ReadByte());
                case SystemCommonTypeEnum.SongSelect:
                    return new SystemCommonEvent(delta, status, (byte)input.ReadByte(), 0);
                case SystemCommonTypeEnum.TuneRequest:
                    return new SystemCommonEvent(delta, status, 0, 0);
                default:
                    throw new Exception("The system common message was invalid or unsupported : " + status);
            }
        }

        private static MidiEvent ReadVoiceMessage(IReadable input, int delta, byte status, byte data1)
        {
            switch ((MidiEventTypeEnum)(status & 0xF0))
            {
                case MidiEventTypeEnum.NoteOff:
                    return new MidiEvent(delta, status, data1, (byte)input.ReadByte());
                case MidiEventTypeEnum.NoteOn:
                    var velocity = input.ReadByte();
                    if (velocity == 0)
                        status = (byte)((status & 0x0F) | 0x80);
                    return new MidiEvent(delta, status, data1, (byte)velocity);
                case MidiEventTypeEnum.NoteAftertouch:
                    return new MidiEvent(delta, status, data1, (byte)input.ReadByte());
                case MidiEventTypeEnum.Controller:
                    return new MidiEvent(delta, status, data1, (byte)input.ReadByte());
                case MidiEventTypeEnum.ProgramChange:
                    return new MidiEvent(delta, status, data1, 0);
                case MidiEventTypeEnum.ChannelAftertouch:
                    return new MidiEvent(delta, status, data1, 0);
                case MidiEventTypeEnum.PitchBend:
                    return new MidiEvent(delta, status, data1, (byte)input.ReadByte());
                default:
                    throw new Exception("The status provided was not that of a voice message.");
            }
        }

        private static int TrackVoiceStats(MidiEvent midiEvent, FastList<byte> instList, FastList<byte> drumList, FastList<byte> channelList, int noteOnCount)
        {
            if (midiEvent.Command == MidiEventTypeEnum.NoteOn)
            {
                var chan = midiEvent.Channel;
                if (channelList.IndexOf((byte)chan) == -1)
                    channelList.Add((byte)chan);
                noteOnCount++;
            }
            else if (midiEvent.Command == MidiEventTypeEnum.ProgramChange)
            {
                var chan = midiEvent.Channel;
                var prog = midiEvent.Data1;
                if (chan == MidiHelper.DrumChannel)
                {
                    if (drumList.IndexOf((byte)prog) == -1)
                        drumList.Add((byte)prog);
                }
                else
                {
                    if (instList.IndexOf((byte)prog) == -1)
                        instList.Add((byte)prog);
                }
            }
            return noteOnCount;
        }

        private static int ReadVariableLength(IReadable input)
        {
            var value = 0;
            int next;
            do
            {
                next = input.ReadByte();
                value = value << 7;
                value = value | (next & 0x7F);
            } while ((next & 0x80) == 0x80);
            return value;
        }

        private static string ReadString(IReadable input)
        {
            var length = ReadVariableLength(input);
            return input.Read8BitChars(length); // TODO: check for correct string encoding
        }
    }

    public enum MidiTrackFormat
    {
        SingleTrack = 0,
        MultiTrack = 1,
        MultiSong = 2
    }

    public enum MidiTimeFormat
    {
        TicksPerBeat = 0,
        FramesPerSecond = 1
    }
}
