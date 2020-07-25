using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using AlphaTab.Core;
using AlphaTab.Core.EcmaScript;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Platform.CSharp
{
    internal class ManagedThreadScoreRenderer : IScoreRenderer
    {
        private readonly Action<Action> _uiInvoke;

        private readonly Thread _workerThread;
        private BlockingCollection<Action> _workerQueue;
        private ManualResetEventSlim? _threadStartedEvent;
        private CancellationTokenSource _workerCancellationToken;
        private ScoreRenderer _renderer;
        private double _width;

        public BoundsLookup? BoundsLookup { get; private set; }

        public ManagedThreadScoreRenderer(Settings settings, Action<Action> uiInvoke)
        {
            _uiInvoke = uiInvoke;
            _renderer = null!;
            _threadStartedEvent = new ManualResetEventSlim(false);
            _workerQueue = new BlockingCollection<Action>();
            _workerCancellationToken = new CancellationTokenSource();

            _workerThread = new Thread(DoWork);
            _workerThread.IsBackground = true;
            _workerThread.Start();

            _threadStartedEvent.Wait();

            _workerQueue.Add(() => Initialize(settings));
            _threadStartedEvent.Dispose();
            _threadStartedEvent = null;
        }


        private void DoWork()
        {
            _threadStartedEvent.Set();
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

        private void Initialize(Settings settings)
        {
            _renderer = new ScoreRenderer(settings);
            _renderer.PartialRenderFinished.On(result =>
                _uiInvoke(() => OnPartialRenderFinished(result)));
            _renderer.RenderFinished.On(result => _uiInvoke(() => OnRenderFinished(result)));
            _renderer.PostRenderFinished.On(() =>
                _uiInvoke(() => OnPostFinished(_renderer.BoundsLookup)));
            _renderer.PreRender.On(resize => _uiInvoke(() => OnPreRender(resize)));
            _renderer.Error.On(e => _uiInvoke(() => OnError(e)));
        }

        private void OnPostFinished(BoundsLookup boundsLookup)
        {
            BoundsLookup = boundsLookup;
            OnPostRenderFinished();
        }

        public void Destroy()
        {
            _workerCancellationToken.Cancel();
            _workerThread.Join();
        }

        public void UpdateSettings(Settings settings)
        {
            if (CheckAccess())
            {
                _renderer.UpdateSettings(settings);
            }
            else
            {
                _workerQueue.Add(() => UpdateSettings(settings));
            }
        }

        private bool CheckAccess()
        {
            return Thread.CurrentThread == _workerThread;
        }

        public void Render()
        {
            if (CheckAccess())
            {
                _renderer.Render();
            }
            else
            {
                _workerQueue.Add(Render);
            }
        }

        public double Width
        {
            get => _width;
            set
            {
                _width = value;
                if (CheckAccess())
                {
                    _renderer.Width = value;
                }
                else
                {
                    _workerQueue.Add(() => _renderer.Width = value);
                }
            }
        }

        public void ResizeRender()
        {
            if (CheckAccess())
            {
                _renderer.ResizeRender();
            }
            else
            {
                _workerQueue.Add(ResizeRender);
            }
        }

        public void RenderScore(Score score, IList<double> trackIndexes)
        {
            if (CheckAccess())
            {
                _renderer.RenderScore(score, trackIndexes);
            }
            else
            {
                _workerQueue.Add(() => RenderScore(score, trackIndexes));
            }
        }

        public IEventEmitterOfT<bool> PreRender { get; } = new EventEmitterOfT<bool>();

        protected virtual void OnPreRender(bool isResize)
        {
            ((EventEmitterOfT<bool>) PreRender).Trigger(isResize);
        }

        public IEventEmitterOfT<RenderFinishedEventArgs> PartialRenderFinished { get; } =
            new EventEmitterOfT<RenderFinishedEventArgs>();

        protected virtual void OnPartialRenderFinished(RenderFinishedEventArgs obj)
        {
            ((EventEmitterOfT<RenderFinishedEventArgs>) PartialRenderFinished).Trigger(obj);
        }

        public IEventEmitterOfT<RenderFinishedEventArgs> RenderFinished { get; } =
            new EventEmitterOfT<RenderFinishedEventArgs>();

        protected virtual void OnRenderFinished(RenderFinishedEventArgs obj)
        {
            ((EventEmitterOfT<RenderFinishedEventArgs>) RenderFinished).Trigger(obj);
        }

        public IEventEmitterOfT<Error> Error { get; } = new EventEmitterOfT<Error>();

        protected virtual void OnError(Error details)
        {
            ((EventEmitterOfT<Error>) Error).Trigger(details);
        }

        public IEventEmitter PostRenderFinished { get; } = new EventEmitter();

        protected virtual void OnPostRenderFinished()
        {
            ((EventEmitter) PostRenderFinished).Trigger();
        }
    }
}
