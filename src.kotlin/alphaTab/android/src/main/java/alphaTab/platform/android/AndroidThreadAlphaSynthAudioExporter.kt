package alphaTab.platform.android

import alphaTab.AlphaTabError
import alphaTab.AlphaTabErrorType
import alphaTab.collections.DoubleDoubleMap
import alphaTab.collections.List
import alphaTab.midi.MidiFile
import alphaTab.synth.AlphaSynthAudioExporter
import alphaTab.synth.AudioExportChunk
import alphaTab.synth.AudioExportOptions
import alphaTab.synth.BackingTrackSyncPoint
import alphaTab.synth.IAudioExporterWorker
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Deferred
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
internal class AndroidThreadAlphaSynthAudioExporter(
    private val worker: AndroidThreadAlphaSynthWorkerPlayer,
    private val ownsWorker: Boolean
) : IAudioExporterWorker {

    private var _exporter: AlphaSynthAudioExporter? = null
    private var _deferred: Deferred<*>? = null

    override fun initialize(
        options: AudioExportOptions,
        midi: MidiFile,
        syncPoints: List<BackingTrackSyncPoint>,
        transpositionPitches: DoubleDoubleMap
    ): Deferred<Unit> {
        return dispatchAsyncOnWorkerThread {
            val player = worker.player
                ?: throw AlphaTabError(
                    AlphaTabErrorType.General,
                    "The player was destroyed prematurely"
                )
            _exporter = player.exportAudio(
                options,
                midi,
                syncPoints,
                transpositionPitches
            )
        }
    }

    override fun render(milliseconds: Double): Deferred<AudioExportChunk?> {
        return dispatchAsyncOnWorkerThread {
            val exporter = _exporter
                ?: throw AlphaTabError(
                    AlphaTabErrorType.General,
                    "The exporter was destroyed prematurely"
                )
            exporter.render(milliseconds)
        }
    }

    override fun destroy() {
        _exporter = null
        if (ownsWorker) {
            worker.destroy()
        }
    }

    override fun close() {
        destroy()
    }

    private fun <T> dispatchAsyncOnWorkerThread(action: () -> T): Deferred<T> {
        if (_deferred != null) {
            throw AlphaTabError(
                AlphaTabErrorType.General,
                "There is already an ongoing operation, wait for previous operation to complete before proceeding"
            );
        }

        val deferred = CompletableDeferred<T>()
        _deferred = deferred
        worker.addToWorker {
            try {
                deferred.complete(action())
            } catch (e: Throwable) {
                deferred.completeExceptionally(e)
            } finally {
                _deferred = null
            }
        }
        return deferred
    }

}
