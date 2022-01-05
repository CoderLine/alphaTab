package alphaTab.platform.android

import android.media.*
import java.util.concurrent.Semaphore
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AndroidAudioWorker(
    private val _output: AndroidSynthOutput,
    sampleRate: Int,
    bufferSizeInSamples: Int
) : Runnable, AudioTrack.OnPlaybackPositionUpdateListener {
    private var _track: AudioTrack
    private var _writeThread: Thread? = null
    private var _buffer: FloatArray
    private var _stopped: Boolean = false
    private val _playingSemaphore: Semaphore = Semaphore(1)

    init {
        val bufferSizeInBytes = bufferSizeInSamples * 4 /*sizeof(float)*/;

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
        _track.setPlaybackPositionUpdateListener(this)
        _playingSemaphore.acquire()
    }

    override fun run() {
        while (!_stopped) {
            if (_track.playState == AudioTrack.PLAYSTATE_PLAYING) {
                _output.read(_buffer, 0, _buffer.size)
                if (_previousPosition == -1) {
                    _previousPosition = _track.playbackHeadPosition
                    _track.getTimestamp(_timestamp)
                }
                _track.write(_buffer, 0, _buffer.size, AudioTrack.WRITE_BLOCKING)
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
    }

    fun play() {
        _previousPosition = _track.playbackHeadPosition
        _track.play()
        _stopped = false
        _writeThread = Thread(this)
        _writeThread!!.name = "alphaTab Audio Worker";
        _writeThread!!.start()
        _playingSemaphore.release() // proceed thread
    }

    fun pause() {
        _track.pause()
        _playingSemaphore.acquire() // block thread
    }

    override fun onMarkerReached(track: AudioTrack?) {
    }

    private var _previousPosition: Int = -1
    private val _timestamp = AudioTimestamp()
    private val _lastTimestampUpdate: Long = -1L;

    override fun onPeriodicNotification(track: AudioTrack?) {
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
