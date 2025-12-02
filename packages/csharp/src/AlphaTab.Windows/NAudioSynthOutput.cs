using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using AlphaTab.Core;
using AlphaTab.Synth;
using AlphaTab.Synth.Ds;
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
        private const int PreferredSampleRate = 44100;
        private const int DirectSoundLatency = 40;

        private DirectSoundOut? _context;
        private CircularSampleBuffer _circularBuffer;
        private int _bufferCount;
        private int _requestedBufferCount;
        private ISynthOutputDevice? _device;

        /// <inheritdoc />
        public double SampleRate => PreferredSampleRate;

        /// <summary>
        /// Initializes a new instance of the <see cref="NAudioSynthOutput"/> class.
        /// </summary>
        public NAudioSynthOutput()
            : base(PreferredSampleRate, (int)SynthConstants.AudioChannels)
        {
            _circularBuffer = null!;
        }

        /// <inheritdoc />
        public void Activate()
        {
        }


        /// <inheritdoc />
        public void Open(double bufferTimeInMilliseconds)
        {
            _context = new DirectSoundOut(DirectSoundLatency);
            _context.Init(this);

            // NAudio introduces another level of buffering and latency
            // we've seen that this can cause our buffers to deplete
            // as a mitigation we buffer a lot more
            _bufferCount = (int)(
                (bufferTimeInMilliseconds * PreferredSampleRate) /
                1000 /
                BufferSize
            ) * 4;
            _circularBuffer = new CircularSampleBuffer(BufferSize * _bufferCount);

            ((EventEmitter)Ready).Trigger();
        }

        /// <inheritdoc />
        public void Destroy()
        {
            Dispose();
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
            _context!.Stop();
            _circularBuffer.Clear();
            _context.Dispose();
        }

        /// <inheritdoc />
        public void Play()
        {
            RequestBuffers();
            _context!.Play();
        }

        /// <inheritdoc />
        public void Pause()
        {
            _context!.Pause();
        }

        /// <inheritdoc />
        public void AddSamples(Float32Array f)
        {
            _circularBuffer.Write(f, 0, f.Length);
            _requestedBufferCount--;
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
            var halfBufferCount = _bufferCount / 2;
            var halfSamples = halfBufferCount * BufferSize;
            // Issue #631: it can happen that requestBuffers is called multiple times
            // before we already get samples via addSamples, therefore we need to
            // remember how many buffers have been requested, and consider them as available.
            var bufferedSamples = _circularBuffer.Count + _requestedBufferCount * BufferSize;

            if (bufferedSamples < halfSamples)
            {
                for (var i = 0; i < halfBufferCount; i++)
                {
                    ((EventEmitter)SampleRequest).Trigger();
                    _requestedBufferCount++;
                }
            }
        }

        /// <inheritdoc />
        public override int Read(float[] buffer, int offset, int count)
        {
            var read = new Float32Array(count);

            var samplesFromBuffer = (int)_circularBuffer.Read(read, 0,
                System.Math.Min(read.Length, _circularBuffer.Count));

            Buffer.BlockCopy(read.Data.Array!, read.Data.Offset, buffer, offset * sizeof(float),
                samplesFromBuffer * sizeof(float));

            ((EventEmitterOfT<double>)SamplesPlayed).Trigger(samplesFromBuffer /
                                                             SynthConstants.AudioChannels);

            RequestBuffers();


            return count;
        }

        /// <inheritdoc />
        public IEventEmitter Ready { get; } = new EventEmitter();

        /// <inheritdoc />
        public IEventEmitterOfT<double> SamplesPlayed { get; } = new EventEmitterOfT<double>();

        /// <inheritdoc />
        public IEventEmitter SampleRequest { get; } = new EventEmitter();

        /// <inheritdoc />
        public Task<IList<ISynthOutputDevice>> EnumerateOutputDevices()
        {
            return Task.FromResult(EnumerateDirectSoundOutputDevices());
        }

        internal static IList<ISynthOutputDevice> EnumerateDirectSoundOutputDevices()
        {
            var defaultPlayback = DirectSoundOut.DSDEVID_DefaultPlayback;
            GetDeviceID(ref defaultPlayback, out Guid realDefault);

            return
                DirectSoundOut.Devices
                    .Where(d => d.Guid != Guid.Empty)
                    .Map(d => (ISynthOutputDevice)new NAudioOutputDevice(d,
                        realDefault))
            ;
        }

        [DllImport("dsound.dll", CharSet = CharSet.Unicode,
            CallingConvention = CallingConvention.StdCall, SetLastError = true,
            PreserveSig = false)]
        private static extern void GetDeviceID(ref Guid pGuidSrc, out Guid pGuidDest);


        /// <inheritdoc />
        public Task SetOutputDevice(ISynthOutputDevice? device)
        {
            if (_context != null)
            {
                _context.Stop();
                _circularBuffer.Clear();
                _context.Dispose();
            }

            _context = new DirectSoundOut(
                device == null
                    ? DirectSoundOut.DSDEVID_DefaultPlayback
                    : ((NAudioOutputDevice)device).Device.Guid,
                DirectSoundLatency);
            _device = device;
            _context.Init(this);

            return Task.CompletedTask;
        }

        /// <inheritdoc />
        public Task<ISynthOutputDevice?> GetOutputDevice()
        {
            return Task.FromResult(_device);
        }
    }

    internal class NAudioOutputDevice : ISynthOutputDevice
    {
        public DirectSoundDeviceInfo Device { get; }

        public NAudioOutputDevice(DirectSoundDeviceInfo device, Guid defaultDevice)
        {
            Device = device;
            IsDefault = device.Guid == defaultDevice;
        }

        public string DeviceId => Device.Guid.ToString("N");
        public string Label => Device.Description;
        public bool IsDefault { get; }
    }
}
