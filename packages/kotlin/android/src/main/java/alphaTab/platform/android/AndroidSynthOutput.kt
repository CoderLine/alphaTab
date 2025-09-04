package alphaTab.platform.android

import alphaTab.*
import alphaTab.EventEmitter
import alphaTab.EventEmitterOfT
import alphaTab.collections.List
import alphaTab.synth.ISynthOutput
import alphaTab.synth.ds.CircularSampleBuffer
import kotlin.contracts.ExperimentalContracts
import alphaTab.core.ecmaScript.Float32Array
import alphaTab.synth.ISynthOutputDevice
import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Deferred
import kotlin.math.min

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal class AndroidSynthOutput(
    private val context: Context,
    private val synthInvoke: (action: (() -> Unit)) -> Unit
) : ISynthOutput {
    companion object {
        private const val BufferSize = 4096
        private const val PreferredSampleRate = 44100
    }

    private var _device: ISynthOutputDevice? = null
    private var _bufferCount = 0
    private var _requestedBufferCount = 0

    private lateinit var _audioContext: AndroidAudioWorker
    private lateinit var _circularBuffer: CircularSampleBuffer

    override val sampleRate: Double
        get() = PreferredSampleRate.toDouble()

    override fun activate() {
    }

    override fun open(bufferTimeInMilliseconds: Double) {
        _bufferCount = (bufferTimeInMilliseconds * PreferredSampleRate /
            1000 /
            BufferSize).toInt()
        _circularBuffer = CircularSampleBuffer((BufferSize * _bufferCount).toDouble())

        _audioContext = AndroidAudioWorker(
            this,
            PreferredSampleRate,
            BufferSize
        )

        onReady()
    }

    private fun onReady() {
        synthInvoke {
            (ready as EventEmitter).trigger()
        }
    }

    override fun destroy() {
        _audioContext.close()
        _circularBuffer.clear()
    }

    override fun play() {
        requestBuffers()
        _audioContext.play()
    }

    override fun pause() {
        _audioContext.pause()
    }

    override fun addSamples(samples: Float32Array) {
        _circularBuffer.write(samples, 0.0, samples.length)
        _requestedBufferCount--

    }

    override fun resetSamples() {
        _circularBuffer.clear()
    }

    private fun requestBuffers() {
        // if we fall under the half of buffers
        // we request one half
        val halfBufferCount = _bufferCount / 2
        val halfSamples = halfBufferCount * BufferSize
        // Issue #631: it can happen that requestBuffers is called multiple times
        // before we already get samples via addSamples, therefore we need to
        // remember how many buffers have been requested, and consider them as available.
        val bufferedSamples = _circularBuffer.count + _requestedBufferCount * BufferSize
        if (bufferedSamples < halfSamples) {
            for (i in 0 until halfBufferCount) {
                onSampleRequest()
                _requestedBufferCount++
            }
        }
    }

    private fun onSampleRequest() {
        synthInvoke {
            (sampleRequest as EventEmitter).trigger()
        }
    }

    internal fun onSamplesPlayed(samples: Int) {
        synthInvoke {
            (samplesPlayed as EventEmitterOfT<Double>).trigger(samples.toDouble())
        }
    }

    fun read(buffer: FloatArray, offset: Int, sampleCount: Int): Int {
        val read = Float32Array(sampleCount.toDouble())
        val actual = _circularBuffer.read(read, 0.0, min(read.length, _circularBuffer.count))

        read.data.copyInto(buffer, offset, 0, sampleCount)
        requestBuffers()

        return actual.toInt()
    }

    override val ready: IEventEmitter = EventEmitter()
    override val samplesPlayed: IEventEmitterOfT<Double> = EventEmitterOfT()
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

    override suspend fun setOutputDevice(device: ISynthOutputDevice?): Unit {
        _audioContext.setOutputDevice((device as AndroidOutputDevice?)?.device)
        _device = device
    }

    override suspend fun getOutputDevice(): ISynthOutputDevice? {
        return _device
    }
}

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal class AndroidOutputDevice(val device: AudioDeviceInfo) : ISynthOutputDevice {
    override val deviceId: String
        get() = device.id.toString()
    override val label: String
        get() = device.productName.toString()
    override val isDefault: Boolean
        get() = false
}
