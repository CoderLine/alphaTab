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
using AlphaTab.Audio.Synth.Bank;
using AlphaTab.Audio.Synth.Bank.Patch;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.Collections;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Synth.Synthesis
{
    public class SynthEvent
    {
        public int EventIndex { get; set; }
        public MidiEvent Event { get; set; }
        public bool IsMetronome { get; set; }
        public double Time { get; set; }

        public SynthEvent(int eventIndex, MidiEvent e)
        {
            EventIndex = eventIndex;
            Event = e;
        }

        public static SynthEvent NewMetronomeEvent(int eventIndex, int metronomeLength)
        {
            var x = new SynthEvent(eventIndex, null);
            x.IsMetronome = true;
            return x;
        }
    }

    public class Synthesizer
    {
        private readonly VoiceManager _voiceManager;
        private readonly SynthParameters[] _synthChannels;

        private readonly Patch[] _layerList;
        private readonly LinkedList<SynthEvent> _midiEventQueue;
        private readonly int[] _midiEventCounts;

        private int _metronomeChannel;
        private FastDictionary<int, bool> _mutedChannels;
        private FastDictionary<int, bool> _soloChannels;
        private bool _isAnySolo;
        private float _syn;

        /// <summary>
        /// The size of the individual sub buffers in samples
        /// </summary>
        public int MicroBufferSize { get; private set; }

        /// <summary>
        /// The number of sub buffers
        /// </summary>
        public int MicroBufferCount { get; private set; }

        /// <summary>
        /// Gets or sets the overall buffer of samples consisting of multiple microbuffers. 
        /// </summary>
        public SampleArray SampleBuffer { get; set; }

        /// <summary>
        /// The patch bank that holds all of the currently loaded instrument patches
        /// </summary>
        public PatchBank SoundBank { get; private set; }

        /// <summary>
        /// The number of samples per second produced per channel
        /// </summary>
        public int SampleRate { get; private set; }

        /// <summary>
        /// The master volume 
        /// </summary>
        public float MasterVolume { get; set; }


        /// <summary>
        /// The metronome volume 
        /// </summary>
        public float MetronomeVolume
        {
            get { return _synthChannels[_metronomeChannel].MixVolume; }
            set { _synthChannels[_metronomeChannel].MixVolume = value; }
        }

        public Synthesizer(int sampleRate, int audioChannels, int bufferSize, int bufferCount, int polyphony)
        {
            var MinSampleRate = 8000;
            var MaxSampleRate = 96000;
            //
            // Setup synth parameters
            MasterVolume = 1;

            SampleRate = SynthHelper.ClampI(sampleRate, MinSampleRate, MaxSampleRate);
            MicroBufferSize = SynthHelper.ClampI(bufferSize, (int)(SynthConstants.MinBufferSize * sampleRate), (int)(SynthConstants.MaxBufferSize * sampleRate));
            MicroBufferSize = (int)(Math.Ceiling(MicroBufferSize / (double)SynthConstants.DefaultBlockSize) * SynthConstants.DefaultBlockSize); //ensure multiple of block size
            MicroBufferCount = (Math.Max(1, bufferCount));
            SampleBuffer = new SampleArray((MicroBufferSize * MicroBufferCount * audioChannels));

            // Setup Controllers
            _synthChannels = new SynthParameters[SynthConstants.DefaultChannelCount];
            for (int x = 0; x < _synthChannels.Length; x++)
            {
                _synthChannels[x] = new SynthParameters(this);
            }

            // setup metronome channel
            _metronomeChannel = _synthChannels.Length - 1;

            // Create synth voices
            _voiceManager = new VoiceManager(SynthHelper.ClampI(polyphony, SynthConstants.MinPolyphony, SynthConstants.MaxPolyphony));

            // Create midi containers
            _midiEventQueue = new LinkedList<SynthEvent>();
            _midiEventCounts = new int[MicroBufferCount];
            _layerList = new Patch[15];

            _mutedChannels = new FastDictionary<int, bool>();
            _soloChannels = new FastDictionary<int, bool>();

            ResetSynthControls();
        }

        public void LoadBank(PatchBank bank)
        {
            UnloadBank();
            SoundBank = bank;
        }

        public void UnloadBank()
        {
            if (SoundBank != null)
            {
                NoteOffAll(true);
                _voiceManager.UnloadPatches();
                SoundBank = null;
            }
        }

        public void ResetSynthControls()
        {
            foreach (SynthParameters parameters in _synthChannels)
            {
                parameters.ResetControllers();
            }
            _synthChannels[MidiHelper.DrumChannel].BankSelect = PatchBank.DrumBank;
            ReleaseAllHoldPedals();

            _synthChannels[_metronomeChannel].Volume.Coarse = 128;
            _synthChannels[_metronomeChannel].UpdateCurrentVolumeFromVolume();
            _synthChannels[_metronomeChannel].BankSelect = PatchBank.DrumBank;
            //_synthChannels[_metronomeChannel].MixVolume = 0;
        }

        public void ResetPrograms()
        {
            foreach (SynthParameters parameters in _synthChannels)
            {
                parameters.Program = 0;
            }
        }

        public void Synthesize()
        {
            SampleBuffer.Clear();
            FillWorkingBuffer();
        }

        private void FillWorkingBuffer()
        {
            /*Break the process loop into sections representing the smallest timeframe before the midi controls need to be updated
            the bigger the timeframe the more efficent the process is, but playback quality will be reduced.*/
            var sampleIndex = 0;
            var anySolo = _isAnySolo;
            for (int x = 0; x < MicroBufferCount; x++)
            {
                if (_midiEventQueue.Length > 0)
                {
                    for (int i = 0; i < _midiEventCounts[x]; i++)
                    {
                        var m = _midiEventQueue.RemoveLast();
                        if (m.IsMetronome)
                        {
                            NoteOff(_metronomeChannel, 37);
                            NoteOn(_metronomeChannel, 37, 95);
                        }
                        else
                        {
                            ProcessMidiMessage(m.Event);
                        }
                    }
                }
                //voice processing loop
                var node = _voiceManager.ActiveVoices.First; //node used to traverse the active voices
                while (node != null)
                {
                    var channel = node.Value.VoiceParams.Channel;
                    // channel is muted if it is either explicitley muted, or another channel is set to solo but not this one. 
                    var isChannelMuted = _mutedChannels.ContainsKey(channel) ||
                                         (anySolo && !_soloChannels.ContainsKey(channel));
                    node.Value.Process(sampleIndex, sampleIndex + MicroBufferSize * SynthConstants.AudioChannels, isChannelMuted);
                    //if an active voice has stopped remove it from the list
                    if (node.Value.VoiceParams.State == VoiceStateEnum.Stopped)
                    {
                        var delnode = node; //node used to remove inactive voices
                        node = node.Next;
                        _voiceManager.RemoveVoiceFromRegistry(delnode.Value);
                        _voiceManager.ActiveVoices.Remove(delnode);
                        _voiceManager.FreeVoices.AddFirst(delnode.Value);
                    }
                    else
                    {
                        node = node.Next;
                    }
                }
                sampleIndex += MicroBufferSize * SynthConstants.AudioChannels;
            }
            Platform.Platform.ClearIntArray(_midiEventCounts);
        }

        #region Midi Handling

        public void NoteOn(int channel, int note, int velocity)
        {
            // Get the correct instrument depending if it is a drum or not
            var sChan = _synthChannels[channel];
            Patch inst = SoundBank.GetPatchByNumber(sChan.BankSelect, sChan.Program);
            if (inst == null)
                return;
            // A NoteOn can trigger multiple voices via layers
            int layerCount;
            if (inst is MultiPatch)
            {
                layerCount = ((MultiPatch)inst).FindPatches(channel, note, velocity, _layerList);
            }
            else
            {
                layerCount = 1;
                _layerList[0] = inst;
            }

            // If a key with the same note value exists, stop it
            if (_voiceManager.Registry[channel][note] != null)
            {
                var node = _voiceManager.Registry[channel][note];
                while (node != null)
                {
                    node.Value.Stop();
                    node = node.Next;
                }
                _voiceManager.RemoveFromRegistry(channel, note);
            }
            // Check exclusive groups
            for (var x = 0; x < layerCount; x++)
            {
                bool notseen = true;
                for (int i = x - 1; i >= 0; i--)
                {
                    if (_layerList[x].ExclusiveGroupTarget == _layerList[i].ExclusiveGroupTarget)
                    {
                        notseen = false;
                        break;
                    }
                }
                if (_layerList[x].ExclusiveGroupTarget != 0 && notseen)
                {
                    var node = _voiceManager.ActiveVoices.First;
                    while (node != null)
                    {
                        if (_layerList[x].ExclusiveGroupTarget == node.Value.Patch.ExclusiveGroup)
                        {
                            node.Value.Stop();
                            _voiceManager.RemoveVoiceFromRegistry(node.Value);
                        }
                        node = node.Next;
                    }
                }
            }
            // Assign a voice to each layer
            for (int x = 0; x < layerCount; x++)
            {
                Voice voice = _voiceManager.GetFreeVoice();
                if (voice == null)// out of voices and skipping is enabled
                    break;
                voice.Configure(channel, note, velocity, _layerList[x], _synthChannels[channel]);
                _voiceManager.AddToRegistry(voice);
                _voiceManager.ActiveVoices.AddLast(voice);
                voice.Start();
            }
            // Clear layer list
            for (int x = 0; x < layerCount; x++)
                _layerList[x] = null;

        }

        public void NoteOff(int channel, int note)
        {
            if (_synthChannels[channel].HoldPedal)
            {
                var node = _voiceManager.Registry[channel][note];
                while (node != null)
                {
                    node.Value.VoiceParams.NoteOffPending = true;
                    node = node.Next;
                }
            }
            else
            {
                var node = _voiceManager.Registry[channel][note];
                while (node != null)
                {
                    node.Value.Stop();
                    node = node.Next;
                }
                _voiceManager.RemoveFromRegistry(channel, note);
            }
        }

        public void NoteOffAll(bool immediate)
        {
            var node = _voiceManager.ActiveVoices.First;
            if (immediate)
            {//if immediate ignore hold pedals and clear the entire registry
                _voiceManager.ClearRegistry();
                while (node != null)
                {
                    node.Value.StopImmediately();
                    var delnode = node;
                    node = node.Next;
                    _voiceManager.ActiveVoices.Remove(delnode);
                    _voiceManager.FreeVoices.AddFirst(delnode.Value);
                }
            }
            else
            {//otherwise we have to check for hold pedals and double check the registry before removing the voice
                while (node != null)
                {
                    VoiceParameters voiceParams = node.Value.VoiceParams;
                    if (voiceParams.State == VoiceStateEnum.Playing)
                    {
                        //if hold pedal is enabled do not stop the voice
                        if (_synthChannels[voiceParams.Channel].HoldPedal)
                        {
                            voiceParams.NoteOffPending = true;
                        }
                        else
                        {
                            node.Value.Stop();
                            _voiceManager.RemoveVoiceFromRegistry(node.Value);
                        }
                    }
                    node = node.Next;
                }
            }
        }

        public void NoteOffAllChannel(int channel, bool immediate)
        {
            var node = _voiceManager.ActiveVoices.First;
            while (node != null)
            {
                if (channel == node.Value.VoiceParams.Channel)
                {
                    if (immediate)
                    {
                        node.Value.StopImmediately();
                        var delnode = node;
                        node = node.Next;
                        _voiceManager.ActiveVoices.Remove(delnode);
                        _voiceManager.FreeVoices.AddFirst(delnode.Value);
                    }
                    else
                    {
                        //if hold pedal is enabled do not stop the voice
                        if (_synthChannels[channel].HoldPedal)
                            node.Value.VoiceParams.NoteOffPending = true;
                        else
                            node.Value.Stop();
                        node = node.Next;
                    }
                }
            }
        }

        public void ProcessMidiMessage(MidiEvent e)
        {
            var command = e.Command;
            var channel = e.Channel;
            var data1 = e.Data1;
            var data2 = e.Data2;
            switch (command)
            {
                case MidiEventTypeEnum.NoteOff:
                    NoteOff(channel, data1);
                    break;
                case MidiEventTypeEnum.NoteOn:
                    if (data2 == 0)
                        NoteOff(channel, data1);
                    else
                        NoteOn(channel, data1, data2);
                    break;
                case MidiEventTypeEnum.NoteAftertouch:
                    //synth uses channel after touch instead
                    break;
                case MidiEventTypeEnum.Controller:
                    switch ((ControllerTypeEnum)data1)
                    {
                        case ControllerTypeEnum.BankSelectCoarse: //Bank select coarse
                            if (channel == MidiHelper.DrumChannel)
                                data2 += PatchBank.DrumBank;
                            if (SoundBank.IsBankLoaded(data2))
                                _synthChannels[channel].BankSelect = (byte)data2;
                            else
                                _synthChannels[channel].BankSelect = (byte)((channel == MidiHelper.DrumChannel) ? PatchBank.DrumBank : 0);
                            break;
                        case ControllerTypeEnum.ModulationCoarse: //Modulation wheel coarse
                            _synthChannels[channel].ModRange.Coarse = (byte)data2;
                            _synthChannels[channel].UpdateCurrentMod();
                            break;
                        case ControllerTypeEnum.ModulationFine: //Modulation wheel fine
                            _synthChannels[channel].ModRange.Fine = (byte)data2;
                            _synthChannels[channel].UpdateCurrentMod();
                            break;
                        case ControllerTypeEnum.VolumeCoarse: //Channel volume coarse
                            _synthChannels[channel].Volume.Coarse = (byte)data2;
                            _synthChannels[channel].UpdateCurrentVolumeFromVolume();
                            break;
                        case ControllerTypeEnum.VolumeFine: //Channel volume fine
                            _synthChannels[channel].Volume.Fine = (byte)data2;
                            _synthChannels[channel].UpdateCurrentVolumeFromVolume();
                            break;
                        case ControllerTypeEnum.PanCoarse: //Pan coarse
                            _synthChannels[channel].Pan.Coarse = (byte)data2;
                            _synthChannels[channel].UpdateCurrentPan();
                            break;
                        case ControllerTypeEnum.PanFine: //Pan fine
                            _synthChannels[channel].Pan.Fine = (byte)data2;
                            _synthChannels[channel].UpdateCurrentPan();
                            break;
                        case ControllerTypeEnum.ExpressionControllerCoarse: //Expression coarse
                            _synthChannels[channel].Expression.Coarse = (byte)data2;
                            _synthChannels[channel].UpdateCurrentVolumeFromExpression();
                            break;
                        case ControllerTypeEnum.ExpressionControllerFine: //Expression fine
                            _synthChannels[channel].Expression.Fine = (byte)data2;
                            _synthChannels[channel].UpdateCurrentVolumeFromExpression();
                            break;
                        case ControllerTypeEnum.HoldPedal: //Hold pedal
                            if (_synthChannels[channel].HoldPedal && !(data2 > 63)) //if hold pedal is released stop any voices with pending release tags
                                ReleaseHoldPedal(channel);
                            _synthChannels[channel].HoldPedal = data2 > 63;
                            break;
                        case ControllerTypeEnum.LegatoPedal: //Legato Pedal
                            _synthChannels[channel].LegatoPedal = data2 > 63;
                            break;
                        case ControllerTypeEnum.NonRegisteredParameterCourse: //NRPN Coarse Select   //fix for invalid DataEntry after unsupported NRPN events
                            _synthChannels[channel].Rpn.Combined = 0x3FFF; //todo implement NRPN
                            break;
                        case ControllerTypeEnum.NonRegisteredParameterFine: //NRPN Fine Select     //fix for invalid DataEntry after unsupported NRPN events
                            _synthChannels[channel].Rpn.Combined = 0x3FFF; //todo implement NRPN
                            break;
                        case ControllerTypeEnum.RegisteredParameterCourse: //RPN Coarse Select
                            _synthChannels[channel].Rpn.Coarse = (byte)data2;
                            break;
                        case ControllerTypeEnum.RegisteredParameterFine: //RPN Fine Select
                            _synthChannels[channel].Rpn.Fine = (byte)data2;
                            break;
                        case ControllerTypeEnum.AllNotesOff: //Note Off All
                            NoteOffAll(false);
                            break;
                        case ControllerTypeEnum.DataEntryCoarse: //DataEntry Coarse
                            switch (_synthChannels[channel].Rpn.Combined)
                            {
                                case 0: //change semitone, pitchwheel
                                    _synthChannels[channel].PitchBendRangeCoarse = (byte)data2;
                                    _synthChannels[channel].UpdateCurrentPitch();
                                    break;
                                case 1: //master fine tune coarse
                                    _synthChannels[channel].MasterFineTune.Coarse = (byte)data2;
                                    break;
                                case 2: //master coarse tune coarse
                                    _synthChannels[channel].MasterCoarseTune = (short)(data2 - 64);
                                    break;
                            }
                            break;
                        case ControllerTypeEnum.DataEntryFine: //DataEntry Fine
                            switch (_synthChannels[channel].Rpn.Combined)
                            {
                                case 0: //change cents, pitchwheel
                                    _synthChannels[channel].PitchBendRangeFine = (byte)data2;
                                    _synthChannels[channel].UpdateCurrentPitch();
                                    break;
                                case 1: //master fine tune fine
                                    _synthChannels[channel].MasterFineTune.Fine = (byte)data2;
                                    break;
                            }
                            break;
                        case ControllerTypeEnum.ResetControllers: //Reset All
                            _synthChannels[channel].Expression.Combined = 0x3FFF;
                            _synthChannels[channel].ModRange.Combined = 0;
                            if (_synthChannels[channel].HoldPedal)
                                ReleaseHoldPedal(channel);
                            _synthChannels[channel].HoldPedal = false;
                            _synthChannels[channel].LegatoPedal = false;
                            _synthChannels[channel].Rpn.Combined = 0x3FFF;
                            _synthChannels[channel].PitchBend.Combined = 0x2000;
                            _synthChannels[channel].ChannelAfterTouch = 0;
                            _synthChannels[channel].UpdateCurrentPitch(); //because pitchBend was reset
                            _synthChannels[channel].UpdateCurrentVolumeFromExpression(); //because expression was reset
                            break;
                        default:
                            return;
                    }
                    break;
                case MidiEventTypeEnum.ProgramChange: //Program Change
                    _synthChannels[channel].Program = (byte)data1;
                    break;
                case MidiEventTypeEnum.ChannelAftertouch: //Channel Aftertouch
                    _synthChannels[channel].ChannelAfterTouch = (byte)data2;
                    break;
                case MidiEventTypeEnum.PitchBend: //Pitch Bend
                    _synthChannels[channel].PitchBend.Coarse = (byte)data2;
                    _synthChannels[channel].PitchBend.Fine = (byte)data1;
                    _synthChannels[channel].UpdateCurrentPitch();
                    break;
            }
            OnMidiEventProcessed(e);
        }

        public event Action<MidiEvent> MidiEventProcessed;
        private void OnMidiEventProcessed(MidiEvent e)
        {
            var handler = MidiEventProcessed;
            if (handler != null)
            {
                handler(e);
            }
        }

        private void ReleaseAllHoldPedals()
        {
            LinkedListNode<Voice> node = _voiceManager.ActiveVoices.First;
            while (node != null)
            {
                if (node.Value.VoiceParams.NoteOffPending)
                {
                    node.Value.Stop();
                    _voiceManager.RemoveVoiceFromRegistry(node.Value);
                }
                node = node.Next;
            }
        }

        private void ReleaseHoldPedal(int channel)
        {
            LinkedListNode<Voice> node = _voiceManager.ActiveVoices.First;
            while (node != null)
            {
                if (node.Value.VoiceParams.Channel == channel && node.Value.VoiceParams.NoteOffPending)
                {
                    node.Value.Stop();
                    _voiceManager.RemoveVoiceFromRegistry(node.Value);
                }
                node = node.Next;
            }
        }


        #endregion

        public void DispatchEvent(int i, SynthEvent synthEvent)
        {
            _midiEventQueue.AddFirst(synthEvent);
            _midiEventCounts[i]++;
        }

        public void SetChannelMute(int channel, bool mute)
        {
            if (mute)
            {
                _mutedChannels[channel] = true;
            }
            else
            {
                _mutedChannels.Remove(channel);
            }
        }

        public void ResetChannelStates()
        {
            _mutedChannels = new FastDictionary<int, bool>();
            _soloChannels = new FastDictionary<int, bool>();
            _isAnySolo = false;
        }

        public void SetChannelSolo(int channel, bool solo)
        {
            if (solo)
            {
                _soloChannels[channel] = true;
            }
            else
            {
                _soloChannels.Remove(channel);
            }

            _isAnySolo = _soloChannels.Count > 0;
        }

        public void SetChannelProgram(int channel, byte program)
        {
            if (channel < 0 || channel >= _synthChannels.Length) return;
            _synthChannels[channel].Program = (byte)program;
        }

        public void SetChannelVolume(int channel, double volume)
        {
            if (channel < 0 || channel >= _synthChannels.Length) return;
            _synthChannels[channel].MixVolume = (float)volume;
        }
    }
}
