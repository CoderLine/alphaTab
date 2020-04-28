using System;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Core.EcmaScript;
using NAudio.Wave;

namespace AlphaTab
{
    /// <summary>
    /// A <see cref="ISynthOutput"/> implementation that uses NAudio to play the
    /// sound via Directout.
    /// </summary>
    public class NAudioSynthOutput : WaveProvider32, ISynthOutput, IDisposable
    {
        private const int BufferSize = 4096;
        private const int BufferCount = 10;
        private const int PreferredSampleRate = 44100;

        private DirectSoundOut _context;
        private CircularSampleBuffer _circularBuffer;
        private bool _finished;

        /// <inheritdoc />
        public double SampleRate => PreferredSampleRate;

        /// <summary>
        /// Initializes a new instance of the <see cref="NAudioSynthOutput"/> class.
        /// </summary>
        public NAudioSynthOutput()
            : base(PreferredSampleRate, 2)
        {
        }

        /// <inheritdoc />
        public void Activate()
        {
        }


        /// <inheritdoc />
        public void Open()
        {
            _finished = false;
            _circularBuffer = new CircularSampleBuffer(BufferSize * BufferCount);

            _context = new DirectSoundOut(100);
            _context.Init(this);

            ((EventEmitter) Ready).Trigger();
        }

        /// <inheritdoc />
        public void Dispose()
        {
            Close();
        }

        /// <summary>
        /// Closes the synth output and disposes all resources.
        /// </summary>
        public void Close()
        {
            _finished = true;
            _context.Stop();
            _circularBuffer.Clear();
            _context.Dispose();
        }

        /// <inheritdoc />
        public void Play()
        {
            RequestBuffers();
            _finished = false;
            _context.Play();
        }

        /// <inheritdoc />
        public void Pause()
        {
            _context.Pause();
        }

        /// <inheritdoc />
        public void SequencerFinished()
        {
            _finished = true;
        }

        /// <inheritdoc />
        public void AddSamples(Float32Array f)
        {
            _circularBuffer.Write(f, 0, f.Length);
        }

        /// <inheritdoc />
        public void ResetSamples()
        {
            _circularBuffer.Clear();
        }

        private void RequestBuffers()
        {
            // if we fall under the half of buffers
            // we request one half
            const int count = BufferCount / 2 * BufferSize;
            if (_circularBuffer.Count < count && SampleRequest != null)
            {
                for (var i = 0; i < BufferCount / 2; i++)
                {
                    ((EventEmitter) SampleRequest).Trigger();
                }
            }
        }

        /// <inheritdoc />
        public override int Read(float[] buffer, int offset, int count)
        {
            if (_circularBuffer.Count < count)
            {
                if (_finished)
                {
                    ((EventEmitter) Finished).Trigger();
                }
            }
            else
            {
                var read = new Float32Array(count);
                _circularBuffer.Read(read, 0, read.Length);

                Buffer.BlockCopy(read.Data, 0, buffer, offset * sizeof(float),
                    count * sizeof(float));

                var samples = count / 2;
                ((EventEmitterOfT<double>) SamplesPlayed).Trigger(samples);
            }

            if (!_finished)
            {
                RequestBuffers();
            }

            return count;
        }

        /// <inheritdoc />
        public IEventEmitter Ready { get; } = new EventEmitter();

        /// <inheritdoc />
        public IEventEmitterOfT<double> SamplesPlayed { get; } = new EventEmitterOfT<double>();

        /// <inheritdoc />
        public IEventEmitter SampleRequest { get; } = new EventEmitter();

        /// <inheritdoc />
        public IEventEmitter Finished { get; } = new EventEmitter();
    }
}
