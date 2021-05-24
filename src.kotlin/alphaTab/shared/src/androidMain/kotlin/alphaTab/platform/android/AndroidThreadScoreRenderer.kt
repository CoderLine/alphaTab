package alphaTab.platform.android

import alphaTab.*
import alphaTab.core.IDoubleList
import alphaTab.core.ecmaScript.Error
import alphaTab.model.JsonConverter
import alphaTab.model.Score
import alphaTab.rendering.IScoreRenderer
import alphaTab.rendering.RenderFinishedEventArgs
import alphaTab.rendering.ScoreRenderer
import alphaTab.rendering.utils.BoundsLookup
import system.Action
import system.ActionOfT
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AndroidThreadScoreRenderer : IScoreRenderer, Runnable {
    private val _uiInvoke: ActionOfT<Action>

    private val _workerThread: Thread
    private val _workerQueue: BlockingQueue<Action>
    private val _threadStartedEvent: Semaphore
    private var _isCancelled = false
    private lateinit var _renderer: ScoreRenderer
    private var _width: Double = 0.0

    public constructor(settings: Settings, uiInvoke: ActionOfT<Action>) {
        _uiInvoke = uiInvoke
        _threadStartedEvent = Semaphore(1)
        _threadStartedEvent.acquire()
        _workerQueue = LinkedBlockingQueue()

        _workerThread = Thread(this)
        _workerThread.name = "alphaTabRenderThread"
        _workerThread.isDaemon = true
        _workerThread.start()

        _threadStartedEvent.acquire()

        _workerQueue.add { initialize(settings) }
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

    private fun initialize(settings: Settings) {
        _renderer = ScoreRenderer(settings)
        _renderer.partialRenderFinished.on {
            _uiInvoke { onPartialRenderFinished(it) }
        }
        _renderer.renderFinished.on {
            _uiInvoke { onRenderFinished(it) }
        }
        _renderer.postRenderFinished.on {
            _uiInvoke { onPostFinished(_renderer.boundsLookup) }
        }
        _renderer.preRender.on {
            _uiInvoke { onPreRender(it) }
        }
        _renderer.error.on {
            _uiInvoke { onError(it) }
        }
    }

    private fun onPostFinished(boundsLookup: BoundsLookup?) {
        this.boundsLookup = boundsLookup
        onPostRenderFinished()
    }

    override var boundsLookup: BoundsLookup? = null
    override var width: Double
        get() = _width
        set(value) {
            _width = value
            if (checkAccess()) {
                _renderer.width = value
            } else {
                _workerQueue.add { _renderer.width = value }
            }
        }

    override fun render() {
        if (checkAccess()) {
            _renderer.render()
        } else {
            _workerQueue.add { render() }
        }
    }

    override fun resizeRender() {
        if (checkAccess()) {
            _renderer.resizeRender()
        } else {
            _workerQueue.add { resizeRender() }
        }
    }

    override fun renderScore(score: Score, trackIndexes: IDoubleList) {
        if (checkAccess()) {
            _renderer.renderScore(score, trackIndexes)
        } else {
            _workerQueue.add {
                renderScore(
                    score,
                    trackIndexes
                )
            }
        }
    }

    override fun updateSettings(settings: Settings) {
        if (checkAccess()) {
            _renderer.updateSettings(settings)
        } else {
            _workerQueue.add { updateSettings(settings) }
        }
    }

    private fun checkAccess(): Boolean {
        return Thread.currentThread().id == _workerThread.id
    }

    override fun destroy() {
        _isCancelled = true
        _workerThread.interrupt()
        _workerThread.join()
    }

    override val preRender: IEventEmitterOfT<Boolean> = EventEmitterOfT()
    private fun onPreRender(isResize: Boolean) {
        (preRender as EventEmitterOfT).trigger(isResize)
    }

    override val renderFinished: IEventEmitterOfT<RenderFinishedEventArgs> = EventEmitterOfT()
    private fun onRenderFinished(args: RenderFinishedEventArgs) {
        (renderFinished as EventEmitterOfT).trigger(args)
    }

    override val partialRenderFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        EventEmitterOfT()

    private fun onPartialRenderFinished(args: RenderFinishedEventArgs) {
        (partialRenderFinished as EventEmitterOfT).trigger(args)
    }

    override val postRenderFinished: IEventEmitter = EventEmitter()
    private fun onPostRenderFinished() {
        (postRenderFinished as EventEmitter).trigger()
    }

    override val error: IEventEmitterOfT<Error> = EventEmitterOfT()
    private fun onError(e: Error) {
        (error as EventEmitterOfT).trigger(e)
    }
}
