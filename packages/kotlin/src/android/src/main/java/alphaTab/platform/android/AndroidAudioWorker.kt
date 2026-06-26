package alphaTab.platform.android

import android.media.*
import java.util.concurrent.*
import java.util.concurrent.atomic.AtomicLong
import kotlin.contracts.ExperimentalContracts
import kotlin.math.max
import kotlin.math.min

@ExperimentalContracts
@ExperimentalUnsignedTypes
internal class AndroidAudioWorker(
    private val _output: AndroidSynthOutput,
    sampleRate: Int,
    bufferSizeInSamples: Int
) {
    private var _updateSchedule: ScheduledFuture<*>? = null
    private var _track: AudioTrack
    private var _writeThread: Thread? = null
    private var _buffer: FloatArray
    private var _stopped: Boolean = false
    private val _playingSemaphore: Semaphore = Semaphore(1)
    private val _updateTimer: ScheduledExecutorService

    init {
        val bufferSizeInBytes = bufferSizeInSamples * 4 /*sizeof(float)*/

        _buffer = FloatArray(bufferSizeInSamples)
        _track = AudioTrack(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build(),
            AudioFormat.Builder()
                .setSampleRate(sampleRate)
                .setEncoding(AudioFormat.ENCODING_PCM_FLOAT)
                .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
                .build(),
            bufferSizeInBytes,
            AudioTrack.MODE_STREAM,
            AudioManager.AUDIO_SESSION_ID_GENERATE
        )

        _track.positionNotificationPeriod = bufferSizeInSamples
        _playingSemaphore.acquire()

        _updateTimer = Executors.newScheduledThreadPool(1)

        _writeThread = Thread {
            this@AndroidAudioWorker.writeSamples()
        }
        _writeThread!!.name = "alphaTab Audio Worker"
        _writeThread!!.start()
    }

    fun setOutputDevice(device: AudioDeviceInfo?) {
        _track.preferredDevice = device
    }

    private fun writeSamples() {
        while (!_stopped) {
            try {
                if (_track.playState == AudioTrack.PLAYSTATE_PLAYING) {
                    val samplesFromBuffer = _output.read(_buffer, 0, _buffer.size)
                    if (_previousPosition == -1) {
                        _previousPosition = _track.playbackHeadPosition
                        _startPosition = _previousPosition
                        _track.getTimestamp(_timestamp)
                    }
                    val silenceFloats = _buffer.size - samplesFromBuffer
                    if (silenceFloats > 0) {
                        _buffer.fill(0f, samplesFromBuffer, _buffer.size)
                    }
                    // write() may return less than requested (or a negative AudioTrack.ERROR_*
                    // code) when the track is paused/stopped/disconnected mid-write. Only credit
                    // counters for what actually landed in the track to keep them in sync with
                    // playbackHeadPosition.
                    val floatsWritten = _track.write(
                        _buffer, 0, _buffer.size, AudioTrack.WRITE_BLOCKING
                    )
                    if (floatsWritten > 0) {
                        val realFloatsWritten = min(floatsWritten, samplesFromBuffer)
                        val silenceFloatsWritten = floatsWritten - realFloatsWritten
                        _totalFramesWrittenToTrack.addAndGet((floatsWritten / 2).toLong())
                        if (silenceFloatsWritten > 0) {
                            _silenceFramesWrittenToTrack.addAndGet((silenceFloatsWritten / 2).toLong())
                        }
                    }
                } else {
                    _playingSemaphore.acquire() // wait for playing to start
                    _playingSemaphore.release() // release semaphore for others
                }
            } catch (_: InterruptedException) {
                Thread.currentThread().interrupt()
                break;
            }
        }
    }

    fun close() {
        _stopped = true
        _playingSemaphore.release() // proceed thread
        _track.stop()
        _writeThread!!.interrupt()
        _writeThread!!.join()
        _track.release()
        _updateTimer.shutdown()
    }

    fun play() {
        if (_track.playState != AudioTrack.PLAYSTATE_PLAYING) {
            _previousPosition = -1
            _startPosition = -1
            _totalFramesWrittenToTrack.set(0)
            _silenceFramesWrittenToTrack.set(0)
            _silenceFramesAccountedAsPlayed = 0
            _lastTimestampUpdateNanos = -1L
            _timestamp.nanoTime = 0
            _timestamp.framePosition = 0
            _track.play()
            _stopped = false

            _updateSchedule = _updateTimer.scheduleWithFixedDelay(
                {
                    this@AndroidAudioWorker.onUpdatePlayedSamples()
                }, 0L, 50L, TimeUnit.MILLISECONDS
            )

            _playingSemaphore.release() // proceed thread
        }
    }


    fun pause() {
        if (_track.playState == AudioTrack.PLAYSTATE_PLAYING) {
            _track.pause()
            _playingSemaphore.acquire() // block thread
            _updateSchedule?.cancel(true)
        }
    }

    @Volatile private var _previousPosition: Int = -1
    @Volatile private var _startPosition: Int = -1
    private val _totalFramesWrittenToTrack = AtomicLong(0)
    private val _silenceFramesWrittenToTrack = AtomicLong(0)
    private var _silenceFramesAccountedAsPlayed: Long = 0
    private val _timestamp = AudioTimestamp()
    private var _lastTimestampUpdateNanos: Long = -1L

    private fun onUpdatePlayedSamples() {
        val now = System.nanoTime()
        val sinceUpdateMs =
            if (_lastTimestampUpdateNanos == -1L) Long.MAX_VALUE
            else (now - _lastTimestampUpdateNanos) / 1_000_000L
        if (sinceUpdateMs >= 10_000L) {
            if (_track.getTimestamp(_timestamp)) {
                _lastTimestampUpdateNanos = now
            } else {
                _timestamp.nanoTime = 0
                _timestamp.framePosition = 0
            }
        }

        var samplePosition = _track.playbackHeadPosition
        if (_timestamp.nanoTime > 0) { // do we have a timestamp?
            samplePosition = (_timestamp.framePosition +
                (System.nanoTime() - _timestamp.nanoTime) * _track.sampleRate / 1e9).toInt()
        }

        if (_previousPosition == -1) {
            return
        }

        val rawDelta = samplePosition - _previousPosition
        if (rawDelta < 0) {
            return
        }
        _previousPosition = samplePosition

        val silenceWritten = _silenceFramesWrittenToTrack.get()
        if (silenceWritten == 0L) {
            // Happy path: synth has kept the ring buffer fed the entire session — no silence
            // has ever been queued. Behavior is bit-identical to the pre-fix logic.
            if (rawDelta > 0) {
                _output.onSamplesPlayed(rawDelta)
            }
            return
        }

        // Slow path: writer has silence-padded at least once this session. Compensate for
        // silence the head has now crossed; mathematically equivalent to capping the
        // cumulative reported count at the cumulative real frames written.
        val totalWritten = _totalFramesWrittenToTrack.get()
        val realWritten = totalWritten - silenceWritten
        val headFromStart = (samplePosition - _startPosition).toLong()
        val silencePlayedCum = max(0L, headFromStart - realWritten)
        val silenceCrossedThisTick = silencePlayedCum - _silenceFramesAccountedAsPlayed
        _silenceFramesAccountedAsPlayed = silencePlayedCum

        val realDelta = rawDelta.toLong() - silenceCrossedThisTick
        if (realDelta > 0) {
            _output.onSamplesPlayed(realDelta.toInt())
        }
    }
}
