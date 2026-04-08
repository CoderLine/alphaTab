using System;
using System.Collections.Concurrent;
using System.Threading;
using AlphaTab.Platform.Worker;

namespace AlphaTab.Platform.CSharp;

internal abstract class ManagedThreadWorkerBase<T> : IAlphaTabWorker<T>
{
    private readonly Action<Action> _postToMain;
    private readonly Thread _workerThread;
    private readonly BlockingCollection<Action> _workerQueue;
    private readonly CancellationTokenSource _workerCancellationToken;
    private readonly ManualResetEventSlim? _threadStartedEvent;
    private readonly ConcurrentDictionary<Action<MessageEvent<T>>,Action<MessageEvent<T>>> _listenerInsideWorker = new();
    private readonly ConcurrentDictionary<Action<MessageEvent<T>>,Action<MessageEvent<T>>> _listenerOutsideWorker = new();

    protected ManagedThreadWorkerBase(Action<Action> postToMain)
    {
        _postToMain = postToMain;
        _threadStartedEvent = new ManualResetEventSlim(false);
        _workerQueue = new BlockingCollection<Action>();
        _workerCancellationToken = new CancellationTokenSource();

        _workerThread = new Thread(DoWork)
        {
            IsBackground = true
        };
        _workerThread.Start();

        _threadStartedEvent.Wait();
        _threadStartedEvent.Dispose();
        _threadStartedEvent = null;
    }

    protected abstract void OnStartInsideWorker();

    private void DoWork()
    {
        _threadStartedEvent.Set();
        OnStartInsideWorker();
        while (_workerQueue.TryTake(out var action, Timeout.Infinite,
                   _workerCancellationToken.Token))
        {
            if (_workerCancellationToken.IsCancellationRequested)
            {
                break;
            }

            action();
        }
    }


    public void PostMessage(T message)
    {
        var ev = new MessageEvent<T>(message);
        if (Thread.CurrentThread.ManagedThreadId == _workerThread.ManagedThreadId)
        {
            // Inside Worker -> Post to main
            _postToMain(() =>
            {
                foreach (var listener in _listenerOutsideWorker)
                {
                    listener.Value(ev);
                }
            });
        }
        else
        {
            // Outside Worker -> Post to worker
            PostToWorker(() =>
            {
                foreach (var listener in _listenerInsideWorker)
                {
                    listener.Value(ev);
                }
            });
        }
    }

    public void PostToWorker(Action action)
    {
        _workerQueue.Add(action);
    }

    public void AddEventListener(string @event, Action<MessageEvent<T>> handler)
    {
        if (@event != "message") return;
        var listeners = Thread.CurrentThread.ManagedThreadId == _workerThread.ManagedThreadId
            ? _listenerInsideWorker
            : _listenerOutsideWorker;
        listeners[handler] = handler;
    }

    public void RemoveEventListener(string @event, Action<MessageEvent<T>> handler)
    {
        if (@event != "message") return;
        var listeners = Thread.CurrentThread.ManagedThreadId == _workerThread.ManagedThreadId
            ? _listenerInsideWorker
            : _listenerOutsideWorker;
        listeners.TryRemove(handler, out _);
    }

    public virtual void Terminate()
    {
        _workerCancellationToken.Cancel();
        _workerThread.Join();
        while (_workerQueue.Count > 0)
        {
            _workerQueue.Take();
        }
    }
}

internal class ManagedThreadAlphaTabRendererWorker :
    ManagedThreadWorkerBase<IAlphaTabWorkerMessage>,
    IAlphaTabRenderingWorker,
    IAlphaTabWorkerGlobalScope<IAlphaTabWorkerMessage>
{
    private static readonly ConcurrentDictionary<int, ManagedThreadAlphaTabRendererWorker>
        WorkerLookup = new();

    public static ManagedThreadAlphaTabRendererWorker? CurrentThreadWorker =>
        WorkerLookup.TryGetValue(Thread.CurrentThread.ManagedThreadId, out var v) ? v : null;

    public ManagedThreadAlphaTabRendererWorker(Action<Action> postToMain) : base(postToMain)
    {
    }

    protected override void OnStartInsideWorker()
    {
        WorkerLookup[Thread.CurrentThread.ManagedThreadId] = this;
        AlphaTabWebWorker.Init();
    }
}

internal class ManagedThreadAlphaSynthWorker :
    ManagedThreadWorkerBase<IAlphaSynthWorkerMessage>,
    IAlphaSynthWorker,
    IAlphaTabWorkerGlobalScope<IAlphaSynthWorkerMessage>
{
    private static readonly ConcurrentDictionary<int, ManagedThreadAlphaSynthWorker>
        WorkerLookup = new();

    public static ManagedThreadAlphaSynthWorker? CurrentThreadWorker =>
        WorkerLookup.TryGetValue(Thread.CurrentThread.ManagedThreadId, out var v) ? v : null;

    public ManagedThreadAlphaSynthWorker(Action<Action> postToMain) : base(postToMain)
    {
    }

    protected override void OnStartInsideWorker()
    {
        WorkerLookup[Thread.CurrentThread.ManagedThreadId] = this;
        AlphaSynthWebWorker.Init();
    }
}
