using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AlphaTab.Core.EcmaScript;
using AlphaTab.Model;
using AlphaTab.Synth;
using NAudio.Wave;

namespace AlphaTab
{
    internal class NAudioBackingTrackOutput : IBackingTrackSynthOutput, IDisposable
    {
        private readonly Action<Action> _invokeUi;
        private const int PreferredSampleRate = 44100;
        private const int DirectSoundLatency = 40;

        /// <inheritdoc />
        public double SampleRate => PreferredSampleRate;

        private ISynthOutputDevice? _device;
        private StreamMediaFoundationReader? _audioFileReader;
        private DirectSoundOut? _context;
        private Task? _timeUpdateTask;
        private CancellationTokenSource? _timeUpdateTaskCancellation;

        public double MasterVolume
        {
            get => _context!.Volume;
            set => _context!.Volume = (float)value;
        }

        public NAudioBackingTrackOutput(Action<Action> invokeUi)
        {
            _invokeUi = invokeUi;
        }

        public double BackingTrackDuration => _audioFileReader?.TotalTime.TotalMilliseconds ?? 0;

        // not yet supported, NAudio is a bit tricky here, maybe we migrate to another lib?
        public double PlaybackRate { get; set; }

        public void SeekTo(double time)
        {
            _audioFileReader!.CurrentTime = TimeSpan.FromMilliseconds(time);
        }


        public void LoadBackingTrack(BackingTrack backingTrack)
        {
            _audioFileReader?.Dispose();
            _context?.Dispose();

            _audioFileReader = new StreamMediaFoundationReader(new System.IO.MemoryStream(
                backingTrack.RawAudioFile!.Buffer.Raw,
                (int)backingTrack.RawAudioFile!.ByteOffset,
                (int)backingTrack.RawAudioFile.Length
            ));

            _context = new DirectSoundOut(DirectSoundLatency);
            _context.Init(_audioFileReader);
        }

        public void Open(double bufferTimeInMilliseconds)
        {
            ((EventEmitter)Ready).Trigger();
        }

        public void Destroy()
        {
            Dispose();
        }

        public void Dispose()
        {
            Close();
        }

        private void Close()
        {
            var cancel = _timeUpdateTaskCancellation;
            if (cancel != null)
            {
                cancel.Cancel();
                _timeUpdateTask!.Wait(TimeSpan.FromSeconds(5));
                _timeUpdateTask?.Dispose();
                cancel.Dispose();
            }

            var context = _context;
            if (context != null)
            {
                context.Stop();
                context.Dispose();
            }

            _audioFileReader?.Dispose();
        }

        private void UpdatePosition()
        {
            var timePos = _context!.PlaybackPosition.TotalMilliseconds;
            _invokeUi(() => { ((EventEmitterOfT<double>)TimeUpdate).Trigger(timePos); });
        }

        public void Play()
        {
            _context!.Play();
            _timeUpdateTaskCancellation = new CancellationTokenSource();
            var token = _timeUpdateTaskCancellation.Token;
            _timeUpdateTask = Task.Run(async () =>
            {
                try
                {
                    while (!token.IsCancellationRequested)
                    {
                        UpdatePosition();
                        await Task.Delay(50, token);
                    }
                }
                catch
                {
                    // ignore
                }
            }, token);
        }

        public void Pause()
        {
            _context!.Pause();
            _timeUpdateTaskCancellation!.Cancel();
        }

        public void AddSamples(Float32Array samples)
        {
        }

        public void ResetSamples()
        {
        }

        public void Activate()
        {
        }

        /// <inheritdoc />
        public IEventEmitter Ready { get; } = new EventEmitter();

        /// <inheritdoc />
        public IEventEmitterOfT<double> SamplesPlayed { get; } = new EventEmitterOfT<double>();

        /// <inheritdoc />
        public IEventEmitterOfT<double> TimeUpdate { get; } = new EventEmitterOfT<double>();

        /// <inheritdoc />
        public IEventEmitter SampleRequest { get; } = new EventEmitter();

        /// <inheritdoc />
        public Task<IList<ISynthOutputDevice>> EnumerateOutputDevices()
        {
            return Task.FromResult(NAudioSynthOutput.EnumerateDirectSoundOutputDevices());
        }

        /// <inheritdoc />
        public Task SetOutputDevice(ISynthOutputDevice? device)
        {
            var wasPlaying = _timeUpdateTaskCancellation != null;
            Pause();
            _timeUpdateTask?.Wait();
            _context?.Dispose();

            _context = new DirectSoundOut(
                device == null
                    ? DirectSoundOut.DSDEVID_DefaultPlayback
                    : ((NAudioOutputDevice)device).Device.Guid,
                DirectSoundLatency);
            _device = device;
            _context.Init(_audioFileReader);
            if (wasPlaying)
            {
                Play();
            }

            return Task.CompletedTask;
        }

        /// <inheritdoc />
        public Task<ISynthOutputDevice?> GetOutputDevice()
        {
            return Task.FromResult(_device);
        }
    }
}
