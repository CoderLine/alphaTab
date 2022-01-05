package alphaTab.platform.android

import alphaTab.*
import alphaTab.EventEmitter
import alphaTab.collections.List
import alphaTab.core.ecmaScript.Error
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.midi.MidiEventType
import alphaTab.midi.MidiFile
import alphaTab.synth.*
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
class AndroidThreadAlphaSynthWorkerPlayer : IAlphaSynth, Runnable {
    private val _uiInvoke: (action: (() -> Unit)) -> Unit

    private val _workerThread: Thread
    private val _workerQueue: BlockingQueue<() -> Unit>
    private val _threadStartedEvent: Semaphore
    private var _isCancelled = false

    private lateinit var player: AlphaSynth
    private val _output: ISynthOutput
    private var _logLevel: LogLevel

    constructor(
        logLevel: LogLevel,
        output: ISynthOutput,
        uiInvoke: (action: (() -> Unit)) -> Unit
    ) {
        _logLevel = logLevel
        _output = output
        _uiInvoke = uiInvoke
        _threadStartedEvent = Semaphore(1)
        _threadStartedEvent.acquire()
        _workerQueue = LinkedBlockingQueue()

        _workerThread = Thread(this)
        _workerThread.name = "alphaTabRenderThread"
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
            do {
                val item = _workerQueue.poll(500, TimeUnit.MILLISECONDS)
                if (!_isCancelled && item != null) {
                    item()
                }
            } while (!_isCancelled)
        } catch (e: InterruptedException) {
            // finished
        }
    }

    private fun initialize() {
        player = AlphaSynth(_output)
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

        _uiInvoke { onReady() }
    }

    override val isReady: Boolean
        get() = player.isReady

    override val isReadyForPlayback: Boolean
        get() = player.isReadyForPlayback

    override val state: PlayerState
        get() = player.state

    override var logLevel: LogLevel
        get() = _logLevel
        set(value) {
            _logLevel = value
            _workerQueue.add { player.logLevel = value }
        }

    override var masterVolume: Double
        get() = player.masterVolume
        set(value) {
            _workerQueue.add { player.masterVolume = value }
        }

    override var countInVolume: Double
        get() = player.countInVolume
        set(value) {
            _workerQueue.add { player.countInVolume = value }
        }

    override var midiEventsPlayedFilter: List<MidiEventType>
        get() = player.midiEventsPlayedFilter
        set(value) {
            _workerQueue.add { player.midiEventsPlayedFilter = value }
        }

    override var metronomeVolume: Double
        get() = player.metronomeVolume
        set(value) {
            _workerQueue.add { player.metronomeVolume = value }
        }

    override var playbackSpeed: Double
        get() = player.playbackSpeed
        set(value) {
            _workerQueue.add { player.playbackSpeed = value }
        }

    override var tickPosition: Double
        get() = player.tickPosition
        set(value) {
            _workerQueue.add { player.tickPosition = value }
        }

    override var timePosition: Double
        get() = player.timePosition
        set(value) {
            _workerQueue.add { player.timePosition = value }
        }


    override var playbackRange: PlaybackRange?
        get() = player.playbackRange
        set(value) {
            _workerQueue.add { player.playbackRange = value }
        }


    override var isLooping: Boolean
        get() = player.isLooping
        set(value) {
            _workerQueue.add { player.isLooping = value }
        }


    override fun play(): Boolean {
        if (state == PlayerState.Playing || !isReadyForPlayback) {
            return false
        }

        _workerQueue.add { player.play() }
        return true
    }

    override fun pause() {
        _workerQueue.add { player.pause() }
    }

    override fun playOneTimeMidiFile(midi: MidiFile) {
        _workerQueue.add { player.playOneTimeMidiFile(midi) }
    }

    override fun playPause() {
        _workerQueue.add { player.playPause() }
    }

    override fun stop() {
        _workerQueue.add { player.stop() }
    }

    override fun resetSoundFonts() {
        _workerQueue.add { player.resetSoundFonts() }
    }

    override fun loadSoundFont(data: Uint8Array, append: Boolean) {
        _workerQueue.add { player.loadSoundFont(data, append) }
    }

    override fun loadMidiFile(midi: MidiFile) {
        _workerQueue.add { player.loadMidiFile(midi) }
    }

    override fun setChannelMute(channel: Double, mute: Boolean) {
        _workerQueue.add { player.setChannelMute(channel, mute) }
    }

    override fun resetChannelStates() {
        _workerQueue.add { player.resetChannelStates() }
    }

    override fun setChannelSolo(channel: Double, solo: Boolean) {
        _workerQueue.add { player.setChannelSolo(channel, solo) }
    }

    override fun setChannelVolume(channel: Double, volume: Double) {
        _workerQueue.add { player.setChannelVolume(channel, volume) }
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
}
