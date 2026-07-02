package alphaTab.platform.android

import alphaTab.core.ecmaScript.MessageEvent
import alphaTab.platform.worker.AlphaSynthWebWorker
import alphaTab.platform.worker.AlphaTabWebWorker
import alphaTab.platform.worker.IAlphaSynthWorker
import alphaTab.platform.worker.IAlphaSynthWorkerMessage
import alphaTab.platform.worker.IAlphaTabRenderingWorker
import alphaTab.platform.worker.IAlphaTabWorker
import alphaTab.platform.worker.IAlphaTabWorkerGlobalScope
import alphaTab.platform.worker.IAlphaTabWorkerMessage
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.Semaphore
import kotlin.contracts.ExperimentalContracts

@OptIn(ExperimentalContracts::class, ExperimentalUnsignedTypes::class)
internal abstract class JavaThreadWorkerBase<T> : IAlphaTabWorker<T>, Runnable {
    private val _postToMain: (action: () -> Unit) -> Unit
    protected val workerThread: Thread
    private val _workerQueue = LinkedBlockingQueue<() -> Unit>()
    private var _isCancelled = false
    private val _threadStartedEvent = Semaphore(1)
    private val _listenerInsideWorker =
        ConcurrentHashMap<(ev: MessageEvent<T>) -> Unit, (ev: MessageEvent<T>) -> Unit>()
    private val _listenerOutsideWorker =
        ConcurrentHashMap<(ev: MessageEvent<T>) -> Unit, (ev: MessageEvent<T>) -> Unit>()

    protected constructor(postToMain: (action: () -> Unit) -> Unit) {
        _postToMain = postToMain;

        workerThread = Thread(this)
        workerThread.isDaemon = true
        workerThread.start()

        _threadStartedEvent.acquire()
    }

    protected abstract fun onStartInsideWorker()

    override fun run() {
        _threadStartedEvent.release();
        onStartInsideWorker();
        while (!_isCancelled) {
            try {
                val item = _workerQueue.take();
                if (!_isCancelled && item != null) {
                    item()
                }
            } catch (_: InterruptedException) {
                Thread.currentThread().interrupt()
                break;
            }
        }
    }

    override fun postMessage(message: T) {
        val ev = MessageEvent(message);
        if (Thread.currentThread().id == workerThread.id) {
            // Inside Worker -> Post to main
            _postToMain(
                {
                    for (listener in _listenerOutsideWorker) {
                        listener.value(ev);
                    }
                });
        } else {
            // Outside Worker -> Post to worker
            postToWorker(
                {
                    for (listener in _listenerInsideWorker) {
                        listener.value(ev);
                    }
                });
        }
    }

    public fun postToWorker(action: () -> Unit) {
        _workerQueue.add(action);
    }

    public override fun addEventListener(event: String, handler: (ev: MessageEvent<T>) -> Unit) {
        if (event != "message") {
            return;
        }
        val listeners = if (Thread.currentThread().id == workerThread.id) {
            _listenerInsideWorker
        } else {
            _listenerOutsideWorker
        };
        listeners[handler] = handler;
    }

    override fun removeEventListener(event: String, handler: (arg1: MessageEvent<T>) -> Unit) {
        if (event != "message") {
            return;
        }
        val listeners = if (Thread.currentThread().id == workerThread.id) {
            _listenerInsideWorker
        } else {
            _listenerOutsideWorker
        };
        listeners.remove(handler);
    }

    override fun terminate() {
        _isCancelled = true
        workerThread.interrupt()
        workerThread.join()
        _workerQueue.clear()
    }
}

@OptIn(ExperimentalContracts::class, ExperimentalUnsignedTypes::class)
internal class JavaThreadAlphaTabRendererWorker(postToMain: (action: () -> Unit) -> Unit) :
    JavaThreadWorkerBase<IAlphaTabWorkerMessage>(postToMain),
    IAlphaTabRenderingWorker,
    IAlphaTabWorkerGlobalScope<IAlphaTabWorkerMessage> {
    companion object {
        private val workerLookup = ConcurrentHashMap<Long, JavaThreadAlphaTabRendererWorker>()

        val currentThreadWorker: JavaThreadAlphaTabRendererWorker?
            get() {
                return workerLookup.getOrDefault(Thread.currentThread().id, null)
            }
    }

    @OptIn(ExperimentalContracts::class, ExperimentalUnsignedTypes::class)
    override fun onStartInsideWorker() {
        workerLookup[Thread.currentThread().id] = this;
        AlphaTabWebWorker.init();
    }

    override fun terminate() {
        super.terminate()
        workerLookup.remove(workerThread.id)
    }
}

@OptIn(ExperimentalContracts::class, ExperimentalUnsignedTypes::class)
internal class JavaThreadAlphaSynthWorker(postToMain: (action: () -> Unit) -> Unit) :
    JavaThreadWorkerBase<IAlphaSynthWorkerMessage>(postToMain),
    IAlphaSynthWorker,
    IAlphaTabWorkerGlobalScope<IAlphaSynthWorkerMessage> {
    companion object {
        private val workerLookup = ConcurrentHashMap<Long, JavaThreadAlphaSynthWorker>()

        val currentThreadWorker: JavaThreadAlphaSynthWorker?
            get() {
                return workerLookup.getOrDefault(Thread.currentThread().id, null)
            }
    }

    @OptIn(ExperimentalContracts::class, ExperimentalUnsignedTypes::class)
    override fun onStartInsideWorker() {
        workerLookup[Thread.currentThread().id] = this;
        AlphaSynthWebWorker.init();
    }

    override fun terminate() {
        super.terminate()
        workerLookup.remove(workerThread.id)
    }
}
