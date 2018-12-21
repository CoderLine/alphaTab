#if NET472
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
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Ds;
using NAudio.Wave;

namespace AlphaTab.Platform.CSharp.Wpf
{
    class NAudioSynthOutput : WaveProvider32, ISynthOutput
    {
        private const int BufferSize = 4096;
        private const int BufferCount = 10;
        private const int PreferredSampleRate = 44100;

        private DirectSoundOut _context;

        private CircularSampleBuffer _circularBuffer;

        private bool _finished;

        public int SampleRate
        {
            get { return PreferredSampleRate; }
        }

        public NAudioSynthOutput()
            : base(PreferredSampleRate, 2)
        {
        }

        public void Activate()
        {
        }

        public void Open()
        {
            _finished = false;
            _circularBuffer = new CircularSampleBuffer(BufferSize * BufferCount);

            _context = new DirectSoundOut(100);
            _context.Init(this);

            Ready();
        }

        public void Close()
        {
            _finished = true;
            _context.Stop();
            _circularBuffer.Clear();
            _context.Dispose();
        }

        public void Play()
        {
            RequestBuffers();
            _finished = false;
            _context.Play();
        }

        public void Pause()
        {
            _context.Pause();
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

        public override int Read(float[] buffer, int offset, int count)
        {
            if (_circularBuffer.Count < count)
            {
                if (_finished)
                {
                    Finished();
                }
            }
            else
            {
                var read = new SampleArray(count);
                _circularBuffer.Read(read, 0, read.Length);

                for (int i = 0; i < count; i++)
                {
                    buffer[offset + i] = read[i];
                }

                var samples = count / 2;
                SamplesPlayed(samples);
            }

            if (!_finished)
            {
                RequestBuffers();
            }

            return count;
        }

        public event Action Ready;
        public event Action<int> SamplesPlayed;
        public event Action SampleRequest;
        public event Action Finished;
    }
}
#endif