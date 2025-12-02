package alphaTab.platform.android

import alphaTab.EventEmitter
import alphaTab.EventEmitterOfT
import alphaTab.IEventEmitter
import alphaTab.IEventEmitterOfT
import alphaTab.collections.List
import alphaTab.core.ecmaScript.Float32Array
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.model.BackingTrack
import alphaTab.synth.IBackingTrackSynthOutput
import alphaTab.synth.ISynthOutputDevice
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaDataSource
import android.media.MediaPlayer
import android.os.Build
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledExecutorService
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
class AndroidBackingTrackSynthOutput(
    private val context: Context,
    private val synthInvoke: (action: (() -> Unit)) -> Unit
) : IBackingTrackSynthOutput {
    companion object {
        private const val PREFERRED_SAMPLE_RATE = 44100
    }

    private var _masterVolume = 1.0

    private var _player: MediaPlayer = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        MediaPlayer(context)
    } else {
        MediaPlayer()
    }

    override var masterVolume: Double
        get() = _masterVolume
        set(value) {
            _masterVolume = value
            _player.setVolume(value.toFloat(), value.toFloat())
        }

    private var _device: ISynthOutputDevice? = null
    private val _updateTimer: ScheduledExecutorService = Executors.newScheduledThreadPool(1)
    private var _updateSchedule: ScheduledFuture<*>? = null

    override val sampleRate: Double
        get() = PREFERRED_SAMPLE_RATE.toDouble()

    override val backingTrackDuration: Double
        get() = _player.duration.toDouble()

    override var playbackRate: Double
        get() {
            return _player.playbackParams.speed.toDouble()
        }
        set(value) {
            _player.playbackParams = _player.playbackParams.setSpeed(value.toFloat())
        }

    override fun seekTo(time: Double) {
        _player.seekTo(time.toInt())
    }

    override fun loadBackingTrack(backingTrack: BackingTrack) {
        _player.reset()
        _player.setAudioAttributes(
            AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .build()
        )
        _player.setDataSource(
            Uint8ArrayMediaDataSource(
                backingTrack.rawAudioFile!!,
            )
        )
        _player.prepare()
    }

    override fun open(bufferTimeInMilliseconds: Double) {
        (ready as EventEmitter).trigger()
    }

    override fun destroy() {
        _updateTimer.shutdown()
        _player.reset()
        _player.release()
    }

    private fun updatePosition() {
        val timePos = _player.currentPosition
        synthInvoke {
            (timeUpdate as EventEmitterOfT<Double>).trigger(timePos.toDouble())
        }
    }

    override fun play() {
        _player.start()
        _updateSchedule = _updateTimer.scheduleWithFixedDelay(
            {
                updatePosition()
            }, 0L, 50L, TimeUnit.MILLISECONDS
        )
    }

    override fun pause() {
        _player.pause()
        _updateSchedule?.cancel(true)
    }

    override fun addSamples(samples: Float32Array) {
    }

    override fun resetSamples() {
    }

    override fun activate() {
    }

    override val ready: IEventEmitter = EventEmitter()
    override val samplesPlayed: IEventEmitterOfT<Double> = EventEmitterOfT()
    override val timeUpdate: IEventEmitterOfT<Double> = EventEmitterOfT()
    override val sampleRequest: IEventEmitter = EventEmitter()

    override suspend fun enumerateOutputDevices(): List<ISynthOutputDevice> {
        val audioService = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager?
            ?: return List()

        return List(
            audioService.getDevices(AudioManager.GET_DEVICES_OUTPUTS).filter {
                it.isSink
            }.map { AndroidOutputDevice(it) }
        )
    }

    override suspend fun setOutputDevice(device: ISynthOutputDevice?) {
        val preferredDevice = (device as AndroidOutputDevice?)?.device
        if (preferredDevice != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                _player.preferredDevice = preferredDevice
            }
        }
        _device = device
    }

    override suspend fun getOutputDevice(): ISynthOutputDevice? {
        return _device
    }
}

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal class Uint8ArrayMediaDataSource(private val data: Uint8Array) : MediaDataSource() {
    override fun close() {
    }

    override fun readAt(position: Long, buffer: ByteArray, offset: Int, size: Int): Int {
        if (position >= this.size) {
            return -1
        }

        var readSize = size
        if (position + size > data.length) {
            readSize = (data.length - position).toInt()
        }

        data.buffer.asByteArray().copyInto(
            buffer,
            offset,
            position.toInt(),
            (position + readSize).toInt()
        )
        return readSize
    }

    override fun getSize(): Long {
        return data.length.toLong()
    }
}
