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

namespace AlphaTab.Audio.Synth.Ds
{
    public class CircularSampleBuffer
    {
        private SampleArray _buffer;
        private int _writePosition;
        private int _readPosition;
        private int _sampleCount;

        public CircularSampleBuffer(int size)
        {
            _buffer = new SampleArray(size);
            _writePosition = 0;
            _readPosition = 0;
            _sampleCount = 0;
        }

        public int Count
        {
            get { return _sampleCount; }
        }

        public void Clear()
        {
            _readPosition = 0;
            _writePosition = 0;
            _sampleCount = 0;
            _buffer = new SampleArray(_buffer.Length);
        }

        public int Write(SampleArray data, int offset, int count)
        {
            var samplesWritten = 0;
            if (count > _buffer.Length - _sampleCount)
            {
                count = _buffer.Length - _sampleCount;
            }

            var writeToEnd = Math.Min(_buffer.Length - _writePosition, count);
            SampleArray.Blit(data, offset, _buffer, _writePosition, writeToEnd);
            _writePosition += writeToEnd;
            _writePosition %= _buffer.Length;
            samplesWritten += writeToEnd;
            if (samplesWritten < count)
            {
                SampleArray.Blit(data, offset + samplesWritten, _buffer, _writePosition, count - samplesWritten);
                _writePosition += (count - samplesWritten);
                samplesWritten = count;
            }
            _sampleCount += samplesWritten;
            return samplesWritten;
        }

        public int Read(SampleArray data, int offset, int count)
        {
            if (count > _sampleCount)
            {
                count = _sampleCount;
            }
            var samplesRead = 0;
            var readToEnd = Math.Min(_buffer.Length - _readPosition, count);
            SampleArray.Blit(_buffer, _readPosition, data, offset, readToEnd);
            samplesRead += readToEnd;
            _readPosition += readToEnd;
            _readPosition %= _buffer.Length;

            if (samplesRead < count)
            {
                SampleArray.Blit(_buffer, _readPosition, data, offset + samplesRead, count - samplesRead);
                _readPosition += (count - samplesRead);
                samplesRead = count;
            }

            _sampleCount -= samplesRead;
            return samplesRead;
        }
    }
}