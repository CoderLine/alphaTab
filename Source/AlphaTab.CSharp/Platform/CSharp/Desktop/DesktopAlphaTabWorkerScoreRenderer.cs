#if NET471
/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using System;
using System.Threading;
using System.Windows.Threading;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Platform.CSharp.Wpf
{
    class DesktopAlphaTabWorkerScoreRenderer<T> : IScoreRenderer
    {
        private readonly AlphaTabApi<T> _api;
        private readonly Action<Action> _uiInvoke;

        private readonly Thread _workerThread;
        private Dispatcher _threadDispatcher;
        private ManualResetEventSlim _threadStartedEvent;
        private ScoreRenderer _renderer;

        public BoundsLookup BoundsLookup { get; private set; }

        public DesktopAlphaTabWorkerScoreRenderer(AlphaTabApi<T> api, Settings settings, Action<Action> uiInvoke)
        {
            _api = api;
            _uiInvoke = uiInvoke;
            _threadStartedEvent = new ManualResetEventSlim(false);

            _workerThread = new Thread(DoWork);
            _workerThread.IsBackground = true;
            _workerThread.Start();

            _threadStartedEvent.Wait();
            _threadDispatcher.BeginInvoke(new Action<Settings>(Initialize), settings);
            _threadStartedEvent.Dispose();
            _threadStartedEvent = null;
        }


        private void DoWork()
        {
            _threadDispatcher = Dispatcher.CurrentDispatcher;
            _threadStartedEvent.Set();
            Dispatcher.Run();
        }

        private void Initialize(Settings settings)
        {
            _renderer = new ScoreRenderer(settings);
            _renderer.PartialRenderFinished += result => _uiInvoke(() => OnPartialRenderFinished(result));
            _renderer.RenderFinished += result => _uiInvoke(() => OnRenderFinished(result));
            _renderer.PostRenderFinished += () => _uiInvoke(() => OnPostFinished(_renderer.BoundsLookup));
            _renderer.PreRender += () => _uiInvoke(OnPreRender);
            _renderer.Error += (s, e) => _uiInvoke(()=> OnError(s,e));
        }

        private void OnPostFinished(BoundsLookup boundsLookup)
        {
            BoundsLookup = boundsLookup;
            OnPostRenderFinished();
        }

        public void Destroy()
        {
            _threadDispatcher.InvokeShutdown();
            _workerThread.Join();
        }

        public void UpdateSettings(Settings settings)
        {
            if (_threadDispatcher.CheckAccess())
            {
                _renderer.UpdateSettings(settings);
            }
            else
            {
                _threadDispatcher.BeginInvoke(new Action<Settings>(UpdateSettings), settings);
            }
        }

        public void Invalidate()
        {
            if (_threadDispatcher.CheckAccess())
            {
                _renderer.Invalidate();
            }
            else
            {
                _threadDispatcher.BeginInvoke(new Action(Invalidate));
            }
        }

        public void Resize(int width)
        {
            if (_threadDispatcher.CheckAccess())
            {
                _renderer.Resize(width);
            }
            else
            {
                _threadDispatcher.BeginInvoke(new Action<int>(Resize), width);
            }
        }

        public void Render(Score score, int[] trackIndexes)
        {
            if (_threadDispatcher.CheckAccess())
            {
                _renderer.Render(score, trackIndexes);
            }
            else
            {
                _threadDispatcher.BeginInvoke(new Action<Score, int[]>(Render), score, trackIndexes);
            }
        }

        public event Action PreRender;
        protected virtual void OnPreRender()
        {
            var handler = PreRender;
            if (handler != null) handler();
        }

        public event Action<RenderFinishedEventArgs> PartialRenderFinished;
        protected virtual void OnPartialRenderFinished(RenderFinishedEventArgs obj)
        {
            var handler = PartialRenderFinished;
            if (handler != null) handler(obj);
        }

        public event Action<RenderFinishedEventArgs> RenderFinished;
        protected virtual void OnRenderFinished(RenderFinishedEventArgs obj)
        {
            var handler = RenderFinished;
            if (handler != null) handler(obj);
        }

        public event Action<string, Exception> Error;
        protected virtual void OnError(string type, Exception details)
        {
            var handler = Error;
            if (handler != null) handler(type, details);
        }

        public event Action PostRenderFinished;
        protected virtual void OnPostRenderFinished()
        {
            var handler = PostRenderFinished;
            if (handler != null) handler();
        }
    }
}
#endif