package alphaTab.platform.android

import android.media.*
import java.util.*
import java.util.concurrent.*
import kotlin.contracts.ExperimentalContracts

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
    }

    private fun writeSamples() {
        while (!_stopped) {
            if (_track.playState == AudioTrack.PLAYSTATE_PLAYING) {
                val samplesFromBuffer = _output.read(_buffer, 0, _buffer.size)
                if (_previousPosition == -1) {
                    _previousPosition = _track.playbackHeadPosition
                    _track.getTimestamp(_timestamp)
                }
                _track.write(_buffer, 0, samplesFromBuffer, AudioTrack.WRITE_BLOCKING)
            } else {
                _playingSemaphore.acquire() // wait for playing to start
                _playingSemaphore.release() // release semaphore for others
            }
        }
    }

    fun close() {
        _playingSemaphore.release() // proceed thread
        _stopped = true
        _track.stop()
        _writeThread!!.interrupt()
        _writeThread!!.join()
        _track.release()
        _updateTimer.shutdown()
    }

    fun play() {
        if(_track.playState != AudioTrack.PLAYSTATE_PLAYING) {
            _previousPosition = _track.playbackHeadPosition
            _track.play()
            _stopped = false

            _updateSchedule = _updateTimer.scheduleAtFixedRate(
                {
                    this@AndroidAudioWorker.onUpdatePlayedSamples()
                }, 0L, 50L, TimeUnit.MILLISECONDS
            )

            _writeThread = Thread {
                this@AndroidAudioWorker.writeSamples()
            }
            _writeThread!!.name = "alphaTab Audio Worker";
            _writeThread!!.start()
            _playingSemaphore.release() // proceed thread
        }
    }


    fun pause() {
        if(_track.playState == AudioTrack.PLAYSTATE_PLAYING) {
            _track.pause()
            _playingSemaphore.acquire() // block thread
            _updateSchedule?.cancel(true)
        }
    }

    private var _previousPosition: Int = -1
    private val _timestamp = AudioTimestamp()
    private val _lastTimestampUpdate: Long = -1L;

    private fun onUpdatePlayedSamples() {
        val sinceUpdateInMillis = (System.nanoTime() - _lastTimestampUpdate) / 10e6
        if (sinceUpdateInMillis >= 10000) {
            if (!_track.getTimestamp(_timestamp)) {
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

        val playedSamples = samplePosition - _previousPosition
        if (playedSamples < 0) {
            return
        }

        _previousPosition = samplePosition
        _output.onSamplesPlayed(playedSamples)
    }
}
