package alphaTab.platform.android

import alphaTab.*
import alphaTab.EventEmitter
import alphaTab.collections.List
import alphaTab.core.ecmaScript.Error
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.midi.MidiEventType
import alphaTab.midi.MidiFile
import alphaTab.synth.*
import android.util.Log
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal class AndroidThreadAlphaSynthWorkerPlayer : IAlphaSynth, Runnable {
    private val _uiInvoke: (action: (() -> Unit)) -> Unit

    private val _workerThread: Thread
    private val _workerQueue: BlockingQueue<() -> Unit>
    private val _threadStartedEvent: Semaphore
    private var _isCancelled = false

    private var _player: AlphaSynth? = null
    private val _output: ISynthOutput
    private var _logLevel: LogLevel
    private var _bufferTimeInMilliseconds: Double

    constructor(
        logLevel: LogLevel,
        output: ISynthOutput,
        uiInvoke: (action: (() -> Unit)) -> Unit,
        bufferTimeInMilliseconds: Double
    ) {
        _logLevel = logLevel
        _bufferTimeInMilliseconds = bufferTimeInMilliseconds
        _output = output
        _uiInvoke = uiInvoke
        _threadStartedEvent = Semaphore(1)
        _threadStartedEvent.acquire()
        _workerQueue = LinkedBlockingQueue()

        _workerThread = Thread(this)
        _workerThread.name = "alphaSynthWorkerThread"
        _workerThread.isDaemon = true
        _workerThread.start()

        _threadStartedEvent.acquire()

        _workerQueue.add { initialize() }
    }

    public fun addToWorker(action: () -> Unit) {
        _workerQueue.add(action)
    }

    override fun destroy() {
        _isCancelled = true
        _workerThread.interrupt()
        _workerThread.join()
    }

    override fun run() {
        _threadStartedEvent.release()
        try {
            Log.d("AlphaTab", "AlphaSynth worker started")
            do {
                val item = _workerQueue.poll(500, TimeUnit.MILLISECONDS)
                if (!_isCancelled && item != null) {
                    item()
                }
            } while (!_isCancelled)
        } catch (e: InterruptedException) {
            Log.d("AlphaTab", "AlphaSynth worker stopped")
            // finished
        }
    }

    private fun initialize() {
        val player = AlphaSynth(_output, _bufferTimeInMilliseconds)
        _player = player
        player.positionChanged.on {
            _uiInvoke { onPositionChanged(it) }
        }
        player.stateChanged.on {
            _uiInvoke { onStateChanged(it) }
        }
        player.finished.on {
            _uiInvoke { onFinished() }
        }
        player.soundFontLoaded.on {
            _uiInvoke { onSoundFontLoaded() }
        }
        player.soundFontLoadFailed.on {
            _uiInvoke { onSoundFontLoadFailed(it) }
        }
        player.midiLoaded.on {
            _uiInvoke { onMidiLoaded(it) }
        }
        player.midiLoadFailed.on {
            _uiInvoke { onMidiLoadFailed(it) }
        }
        player.readyForPlayback.on {
            _uiInvoke { onReadyForPlayback() }
        }
        player.midiEventsPlayed.on {
            _uiInvoke { onMidiEventsPlayed(it) }
        }
        player.playbackRangeChanged.on {
            _uiInvoke { onPlaybackRangeChanged(it) }
        }

        _uiInvoke { onReady() }
    }

    override val isReady: Boolean
        get() = _player?.isReady ?: false

    override val isReadyForPlayback: Boolean
        get() = _player?.isReadyForPlayback ?: false

    override val state: PlayerState
        get() = _player?.state ?: PlayerState.Paused

    override var logLevel: LogLevel
        get() = _logLevel
        set(value) {
            _logLevel = value
            _workerQueue.add { _player?.logLevel = value }
        }

    override var masterVolume: Double
        get() = _player?.masterVolume ?: 0.0
        set(value) {
            _workerQueue.add { _player?.masterVolume = value }
        }

    override var countInVolume: Double
        get() = _player?.countInVolume ?: 0.0
        set(value) {
            _workerQueue.add { _player?.countInVolume = value }
        }

    override var midiEventsPlayedFilter: List<MidiEventType>
        get() = _player?.midiEventsPlayedFilter ?: List()
        set(value) {
            _workerQueue.add { _player?.midiEventsPlayedFilter = value }
        }

    override var metronomeVolume: Double
        get() = _player?.metronomeVolume ?: 0.0
        set(value) {
            _workerQueue.add { _player?.metronomeVolume = value }
        }

    override var playbackSpeed: Double
        get() = _player?.playbackSpeed ?: 0.0
        set(value) {
            _workerQueue.add { _player?.playbackSpeed = value }
        }

    override var tickPosition: Double
        get() = _player?.tickPosition ?: 0.0
        set(value) {
            _workerQueue.add { _player?.tickPosition = value }
        }

    override var timePosition: Double
        get() = _player?.timePosition ?: 0.0
        set(value) {
            _workerQueue.add { _player?.timePosition = value }
        }


    override var playbackRange: PlaybackRange?
        get() = _player?.playbackRange
        set(value) {
            _workerQueue.add { _player?.playbackRange = value }
        }


    override var isLooping: Boolean
        get() = _player?.isLooping ?: false
        set(value) {
            _workerQueue.add { _player?.isLooping = value }
        }


    override fun play(): Boolean {
        if (state == PlayerState.Playing || !isReadyForPlayback) {
            return false
        }

        _workerQueue.add { _player?.play() }
        return true
    }

    override fun pause() {
        _workerQueue.add { _player?.pause() }
    }

    override fun playOneTimeMidiFile(midi: MidiFile) {
        _workerQueue.add { _player?.playOneTimeMidiFile(midi) }
    }

    override fun playPause() {
        _workerQueue.add { _player?.playPause() }
    }

    override fun stop() {
        _workerQueue.add { _player?.stop() }
    }

    override fun resetSoundFonts() {
        _workerQueue.add { _player?.resetSoundFonts() }
    }

    override fun loadSoundFont(data: Uint8Array, append: Boolean) {
        _workerQueue.add { _player?.loadSoundFont(data, append) }
    }

    override fun loadMidiFile(midi: MidiFile) {
        _workerQueue.add { _player?.loadMidiFile(midi) }
    }

    override fun setChannelMute(channel: Double, mute: Boolean) {
        _workerQueue.add { _player?.setChannelMute(channel, mute) }
    }

    override fun resetChannelStates() {
        _workerQueue.add { _player?.resetChannelStates() }
    }

    override fun setChannelSolo(channel: Double, solo: Boolean) {
        _workerQueue.add { _player?.setChannelSolo(channel, solo) }
    }

    override fun setChannelVolume(channel: Double, volume: Double) {
        _workerQueue.add { _player?.setChannelVolume(channel, volume) }
    }

    override val ready: IEventEmitter = EventEmitter()
    override val readyForPlayback: IEventEmitter = EventEmitter()
    override val finished: IEventEmitter = EventEmitter()
    override val soundFontLoaded: IEventEmitter = EventEmitter()
    override val soundFontLoadFailed: IEventEmitterOfT<Error> =
        EventEmitterOfT()
    override val midiLoaded: IEventEmitterOfT<PositionChangedEventArgs> =
        EventEmitterOfT()
    override val midiLoadFailed: IEventEmitterOfT<Error> =
        EventEmitterOfT()
    override val stateChanged: IEventEmitterOfT<PlayerStateChangedEventArgs> =
        EventEmitterOfT()
    override val positionChanged: IEventEmitterOfT<PositionChangedEventArgs> =
        EventEmitterOfT()
    override val midiEventsPlayed: IEventEmitterOfT<MidiEventsPlayedEventArgs> =
        EventEmitterOfT()
    override val playbackRangeChanged: IEventEmitterOfT<PlaybackRangeChangedEventArgs> =
        EventEmitterOfT()


    private fun onReady() {
        _uiInvoke { (ready as EventEmitter).trigger() }
    }

    private fun onReadyForPlayback() {
        _uiInvoke { (readyForPlayback as EventEmitter).trigger() }
    }

    private fun onFinished() {
        _uiInvoke { (finished as EventEmitter).trigger() }
    }

    private fun onSoundFontLoaded() {
        _uiInvoke { (soundFontLoaded as EventEmitter).trigger() }
    }

    private fun onSoundFontLoadFailed(e: Error) {
        _uiInvoke { (soundFontLoadFailed as EventEmitterOfT<Error>).trigger(e) }
    }

    private fun onMidiLoaded(args: PositionChangedEventArgs) {
        _uiInvoke { (midiLoaded as EventEmitterOfT<PositionChangedEventArgs>).trigger(args) }
    }

    private fun onMidiLoadFailed(e: Error) {
        _uiInvoke { (midiLoadFailed as EventEmitterOfT<Error>).trigger(e) }
    }

    private fun onMidiEventsPlayed(e: MidiEventsPlayedEventArgs) {
        _uiInvoke { (midiEventsPlayed as EventEmitterOfT<MidiEventsPlayedEventArgs>).trigger(e) }
    }

    private fun onStateChanged(obj: PlayerStateChangedEventArgs) {
        _uiInvoke { (stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(obj) }
    }

    private fun onPositionChanged(obj: PositionChangedEventArgs) {
        _uiInvoke { (positionChanged as EventEmitterOfT<PositionChangedEventArgs>).trigger(obj) }
    }

    private fun onPlaybackRangeChanged(obj: PlaybackRangeChangedEventArgs) {
        _uiInvoke { (playbackRangeChanged as EventEmitterOfT<PlaybackRangeChangedEventArgs>).trigger(obj) }
    }
}
