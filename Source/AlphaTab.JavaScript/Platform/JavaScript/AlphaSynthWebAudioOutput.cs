﻿using System;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Haxe.Js.Html.Audio;

namespace AlphaTab.Platform.JavaScript
{
    /// <summary>
    /// This class implements a HTML5 Web Audio API based audio output device
    /// for alphaSynth. It can be controlled via a JS API.
    /// </summary>
    internal class AlphaSynthWebAudioOutput : ISynthOutput
    {
        private const int BufferSize = 4096;
        private const int BufferCount = 10;
        private const float PreferredSampleRate = 44100;

        private AudioContext _context;
        private AudioBuffer _buffer;
        private AudioBufferSourceNode _source;
        private ScriptProcessorNode _audioNode;

        private CircularSampleBuffer _circularBuffer;

        private bool _finished;
        public int SampleRate => (int)_context.SampleRate;

        public void Open()
        {
            _finished = false;

            PatchIosSampleRate();

            _circularBuffer = new CircularSampleBuffer(BufferSize * BufferCount);
            _context = new AudioContext();

            // possible fix for Web Audio in iOS 9 (issue #4)
            dynamic ctx = _context;
            if (ctx.state == "suspended")
            {
                Action<Event> resume = null;
                resume = e =>
                {
                    ctx.resume();
                    Browser.Window.SetTimeout((Action)(() =>
                        {
                            if (ctx.state == "running")
                            {
                                Browser.Document.Body.RemoveEventListener("touchend", resume, false);
                                Browser.Document.Body.RemoveEventListener("click", resume, false);
                            }
                        }),
                        0);
                };
                Browser.Document.Body.AddEventListener("touchend", resume, false);
                Browser.Document.Body.AddEventListener("click", resume, false);
            }

            Ready();
        }

        public void Activate()
        {
            if (_context != null)
            {
                dynamic ctx = _context;
                ctx.resume();
            }
        }

        private void PatchIosSampleRate()
        {
            string ua = Browser.Navigator.UserAgent;
            if (ua.Contains("iPhone") || ua.Contains("iPad"))
            {
                var context = new AudioContext();

                var buffer = context.CreateBuffer(1, 1, PreferredSampleRate);
                var dummy = context.CreateBufferSource();
                dummy.Buffer = buffer;
                dummy.Connect(context.Destination);
                dummy.Start(0);
                dummy.Disconnect(0);

                context.Close();
            }
        }

        public void Play()
        {
            dynamic ctx = _context;
            if (ctx.state == "suspended" || ctx.state == "interrupted")
            {
                ctx.resume();
            }

            // create an empty buffer source (silence)
            _buffer = _context.CreateBuffer(2, BufferSize, _context.SampleRate);

            // create a script processor node which will replace the silence with the generated audio
            _audioNode = _context.CreateScriptProcessor(BufferSize, 0, 2);
            _audioNode.OnAudioProcess = (Action<AudioProcessingEvent>)GenerateSound;

            _circularBuffer.Clear();

            RequestBuffers();
            _finished = false;
            _source = _context.CreateBufferSource();
            _source.Buffer = _buffer;
            _source.Loop = true;
            _source.Connect(_audioNode, 0, 0);
            _source.Start(0);
            _audioNode.Connect(_context.Destination, 0, 0);
        }

        public void Pause()
        {
            if (_source != null)
            {
                _source.Stop(0);
                _source.Disconnect(0);
            }

            _source = null;
            if (_audioNode != null)
            {
                _audioNode.Disconnect(0);
            }

            _audioNode = null;
        }

        public void SequencerFinished()
        {
            _finished = true;
        }

        public void AddSamples(float[] f)
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
                for (var i = 0; i < BufferCount / 2; i++)
                {
                    SampleRequest();
                }
            }
        }

        private void GenerateSound(AudioProcessingEvent e)
        {
            var left = e.OutputBuffer.GetChannelData(0);
            var right = e.OutputBuffer.GetChannelData(1);
            var samples = left.Length + right.Length;
            if (_circularBuffer.Count < samples)
            {
                if (_finished)
                {
                    Finished();
                }
            }
            else
            {
                var buffer = new float[samples];
                _circularBuffer.Read(buffer, 0, buffer.Length);

                var s = 0;
                for (var i = 0; i < left.Length; i++)
                {
                    left[i] = buffer[s++];
                    right[i] = buffer[s++];
                }

                SamplesPlayed(left.Length);
            }


            if (!_finished)
            {
                RequestBuffers();
            }
        }


        public event Action Ready;
        public event Action<int> SamplesPlayed;
        public event Action SampleRequest;
        public event Action Finished;
    }
}
