using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlphaTab.Collections;
using AlphaTab.Synth;

namespace AlphaTab.Platform.CSharp;

internal class ManagedThreadAlphaSynthAudioExporter : IAudioExporterWorker
{
    private static int _nextExporterId = 1;
    private readonly ManagedThreadAlphaSynthWorkerApi _worker;
    private readonly int _exporterId;
    private readonly bool _ownsWorker;
    private TaskCompletionSource<int>? _promise;

    public ManagedThreadAlphaSynthAudioExporter(ManagedThreadAlphaSynthWorkerApi synthWorker,
        bool ownsWorker)
    {
        _exporterId = _nextExporterId++;
        _worker = synthWorker;
        _ownsWorker = ownsWorker;
    }

    private readonly Map<int, AlphaSynthAudioExporter> _exporter = new();

    private async Task DispatchAsyncOnWorkerThread(Action action)
    {
        if (_promise != null)
        {
            throw new AlphaTabError(
                AlphaTabErrorType.General,
                "There is already an ongoing operation, wait for previous operation to complete before proceeding"
            );
        }

        _promise = new TaskCompletionSource<int>();
        try
        {
            _worker.DispatchOnWorkerThread(() =>
            {
                try
                {
                    action();
                    _promise.SetResult(1);
                }
                catch (Error e)
                {
                    _promise.SetException(e);
                }
            });

            await _promise.Task;
        }
        finally
        {
            _promise = null;
        }
    }

    public async Task Initialize(
        AudioExportOptions options,
        Midi.MidiFile midi,
        IList<BackingTrackSyncPoint> syncPoints,
        IValueTypeMap<double, double> transpositionPitches)
    {
        await DispatchAsyncOnWorkerThread(() =>
        {
            var exporter = _worker.Player.ExportAudio(
                options,
                midi,
                syncPoints,
                transpositionPitches
            );
            _exporter.Set(_exporterId, exporter);
        });
    }

    public async Task<AudioExportChunk?> Render(double milliseconds)
    {
        AudioExportChunk? chunk = null;
        await DispatchAsyncOnWorkerThread(() =>
        {
            if (!_exporter.Has(_exporterId))
            {
                throw new AlphaTabError(AlphaTabErrorType.General,
                    "Exporter was already destroyed");
            }

            var exporter = _exporter.Get(_exporterId);
            chunk = exporter.Render(milliseconds);
        });
        return chunk;
    }

    public void Destroy()
    {
        _exporter.Delete(_exporterId);
        if (_ownsWorker)
        {
            _worker.Destroy();
        }
    }

    public void Dispose()
    {
        Destroy();
    }
}
