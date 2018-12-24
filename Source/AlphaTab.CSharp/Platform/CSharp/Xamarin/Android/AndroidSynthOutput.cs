#if ANDROID
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
using System.Threading;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Ds;
using Android.Media;
using Encoding = Android.Media.Encoding;

namespace AlphaTab.Platform.CSharp.Xamarin.Android
{
    class AndroidSynthOutput : ISynthOutput
    {
        private const int BufferSize = 4096;
        private const int BufferCount = 10;
        private const int PreferredSampleRate = 44100;

        private AudioTrack _audioTrack;
        private CircularSampleBuffer _circularBuffer;
        private bool _finished;
        private Thread _playThread;
        private CancellationTokenSource _playThreadCancellationTokenSource;

        public int SampleRate => PreferredSampleRate;

        public void Open()
        {
            _finished = false;
            _circularBuffer = new CircularSampleBuffer(BufferSize * BufferCount);

            Ready();
        }

        public void Play()
        {
            if (_audioTrack != null)
            {
                Pause();
            }

            var attributes = new AudioAttributes.Builder()
                .SetContentType(AudioContentType.Music)
                .SetFlags(AudioFlags.None)
                .SetLegacyStreamType(Stream.Music)
                .SetUsage(AudioUsageKind.Media)
                .Build();

            var format = new AudioFormat.Builder()
                .SetSampleRate(PreferredSampleRate)
                .SetEncoding(Encoding.PcmFloat)
                .SetChannelMask(ChannelOut.Stereo)
                .Build();

            _circularBuffer.Clear();

            RequestBuffers();
            _finished = false;
            _audioTrack = new AudioTrack(attributes, format, 
                AudioTrack.GetMinBufferSize(format.SampleRate, format.ChannelMask, format.Encoding)
                , AudioTrackMode.Stream, 1);
            _audioTrack.SetVolume(1);
            _audioTrack.Play();

            _playThreadCancellationTokenSource = new CancellationTokenSource();
            _playThread = new Thread(PlayThread);
            _playThread.Start();
        }

        private void PlayThread()
        {
            var track = _audioTrack;

            while (track != null && track.PlayState == PlayState.Playing &&
                   !_playThreadCancellationTokenSource.IsCancellationRequested)
            {
                GenerateSound(track);
            }
        }

        private void GenerateSound(AudioTrack track)
        {
            var samples = BufferSize * 2 /*stereo*/;

            if (_circularBuffer.Count < samples)
            {
                if (_finished)
                {
                    Finished();
                }
            }
            else
            {
                var buffer = new SampleArray(samples);
                _circularBuffer.Read(buffer, 0, buffer.Length);

                track.Write(buffer.Samples, 0, buffer.Samples.Length, WriteMode.Blocking);

                SamplesPlayed(samples / 2);
            }

            if (!_finished)
            {
                RequestBuffers();
            }
        }

        public void Pause()
        {
            if (_audioTrack != null)
            {
                _audioTrack.Stop();
                _playThreadCancellationTokenSource.Cancel();
                _playThread.Join();
                
                _audioTrack.Dispose();
                _audioTrack = null;
            }
        }

        public void SequencerFinished()
        {
            _finished = true;
        }

        public void AddSamples(SampleArray f)
        {
            _circularBuffer.Write(f, 0, f.Length);
        }

        public void ResetSamples()
        {
            _circularBuffer.Clear();
        }

        private void RequestBuffers()
        {
            // if we fall under the half of buffers
            // we request one half
            const int count = (BufferCount / 2) * BufferSize;
            if (_circularBuffer.Count < count && SampleRequest != null)
            {
                for (int i = 0; i < BufferCount / 2; i++)
                {
                    SampleRequest();
                }
            }
        }

        public void Activate()
        {
            // Nothing to do (maybe asking for runtime permissions if needed?)
        }

        public event Action Ready;
        public event Action<int> SamplesPlayed;
        public event Action SampleRequest;
        public event Action Finished;
    }
}
#endif