package alphaTab.platform.android

import alphaTab.*
import alphaTab.collections.DoubleList
import alphaTab.core.ecmaScript.Error
import alphaTab.model.Score
import alphaTab.rendering.IScoreRenderer
import alphaTab.rendering.RenderFinishedEventArgs
import alphaTab.rendering.ScoreRenderer
import alphaTab.rendering.utils.BoundsLookup
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
internal class AndroidThreadScoreRenderer : IScoreRenderer, Runnable {
    private val _uiInvoke: ( action: (() -> Unit) ) -> Unit

    private val _workerThread: Thread
    private val _workerQueue: BlockingQueue<() -> Unit>
    private val _threadStartedEvent: Semaphore
    private var _isCancelled = false
    public lateinit var renderer: ScoreRenderer
    private var _width: Double = 0.0

    public constructor(settings: Settings, uiInvoke: ( action: (() -> Unit) ) -> Unit) {
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
        renderer = ScoreRenderer(settings)
        renderer.partialRenderFinished.on {
            _uiInvoke { onPartialRenderFinished(it) }
        }
        renderer.partialLayoutFinished.on {
            _uiInvoke { onPartialLayoutFinished(it) }
        }
        renderer.renderFinished.on {
            _uiInvoke { onRenderFinished(it) }
        }
        renderer.postRenderFinished.on {
            _uiInvoke { onPostFinished(renderer.boundsLookup) }
        }
        renderer.preRender.on {
            _uiInvoke { onPreRender(it) }
        }
        renderer.error.on {
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
                renderer.width = value
            } else {
                _workerQueue.add { renderer.width = value }
            }
        }

    override fun render() {
        if (checkAccess()) {
            renderer.render()
        } else {
            _workerQueue.add { render() }
        }
    }

    override fun renderResult(resultId:String) {
        if (checkAccess()) {
            renderer.renderResult(resultId)
        } else {
            _workerQueue.add { renderResult(resultId) }
        }
    }

    override fun resizeRender() {
        if (checkAccess()) {
            renderer.resizeRender()
        } else {
            _workerQueue.add { resizeRender() }
        }
    }

    override fun renderScore(score: Score?, trackIndexes: DoubleList?) {
        if (checkAccess()) {
            renderer.renderScore(score, trackIndexes)
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
            renderer.updateSettings(settings)
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

    override val partialLayoutFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        EventEmitterOfT()

    private fun onPartialLayoutFinished(args: RenderFinishedEventArgs) {
        (partialLayoutFinished as EventEmitterOfT).trigger(args)
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
