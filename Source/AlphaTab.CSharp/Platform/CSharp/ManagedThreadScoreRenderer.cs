using System;
using System.Collections.Concurrent;
using System.Threading;
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
        private ManualResetEventSlim _threadStartedEvent;
        private CancellationTokenSource _workerCancellationToken;
        private ScoreRenderer _renderer;

        public BoundsLookup BoundsLookup { get; private set; }

        public ManagedThreadScoreRenderer(Settings settings, Action<Action> uiInvoke)
        {
            _uiInvoke = uiInvoke;
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
            while (_workerQueue.TryTake(out var action, Timeout.Infinite, _workerCancellationToken.Token))
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
            _renderer.PartialRenderFinished += result => _uiInvoke(() => OnPartialRenderFinished(result));
            _renderer.RenderFinished += result => _uiInvoke(() => OnRenderFinished(result));
            _renderer.PostRenderFinished += () => _uiInvoke(() => OnPostFinished(_renderer.BoundsLookup));
            _renderer.PreRender += () => _uiInvoke(OnPreRender);
            _renderer.Error += (s, e) => _uiInvoke(() => OnError(s, e));
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

        public void Invalidate()
        {
            if (CheckAccess())
            {
                _renderer.Invalidate();
            }
            else
            {
                _workerQueue.Add(() => Invalidate());
            }
        }

        public void Resize(int width)
        {
            if (CheckAccess())
            {
                _renderer.Resize(width);
            }
            else
            {
                _workerQueue.Add(() => Resize(width));
            }
        }

        public void Render(Score score, int[] trackIndexes)
        {
            if (CheckAccess())
            {
                _renderer.Render(score, trackIndexes);
            }
            else
            {
                _workerQueue.Add(() => Render(score, trackIndexes));
            }
        }

        public event Action PreRender;

        protected virtual void OnPreRender()
        {
            var handler = PreRender;
            if (handler != null)
            {
                handler();
            }
        }

        public event Action<RenderFinishedEventArgs> PartialRenderFinished;

        protected virtual void OnPartialRenderFinished(RenderFinishedEventArgs obj)
        {
            var handler = PartialRenderFinished;
            if (handler != null)
            {
                handler(obj);
            }
        }

        public event Action<RenderFinishedEventArgs> RenderFinished;

        protected virtual void OnRenderFinished(RenderFinishedEventArgs obj)
        {
            var handler = RenderFinished;
            if (handler != null)
            {
                handler(obj);
            }
        }

        public event Action<string, Exception> Error;

        protected virtual void OnError(string type, Exception details)
        {
            var handler = Error;
            if (handler != null)
            {
                handler(type, details);
            }
        }

        public event Action PostRenderFinished;

        protected virtual void OnPostRenderFinished()
        {
            var handler = PostRenderFinished;
            if (handler != null)
            {
                handler();
            }
        }
    }
}
