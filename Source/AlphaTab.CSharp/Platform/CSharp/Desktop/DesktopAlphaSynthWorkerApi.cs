#if NET472
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
using AlphaTab.Audio.Synth;
using AlphaTab.Util;

namespace AlphaTab.Platform.CSharp.Wpf
{
    class DesktopAlphaSynthWorkerApi : AlphaSynthWorkerApiBase
    {
        private readonly Action<Action> _uiInvoke;
        private readonly Thread _workerThread;
        private Dispatcher _threadDispatcher;
        private readonly ManualResetEventSlim _threadStartedEvent;

        public DesktopAlphaSynthWorkerApi(ISynthOutput output, LogLevel logLevel, Action<Action> uiInvoke)
        : base(output, logLevel)
        {
            _uiInvoke = uiInvoke;

            _threadStartedEvent = new ManualResetEventSlim(false);

            _workerThread = new Thread(DoWork);
            _workerThread.IsBackground = true;
            _workerThread.Start();

            _threadStartedEvent.Wait();
            _threadDispatcher.BeginInvoke(new Action(Initialize));
            _threadStartedEvent.Dispose();
            _threadStartedEvent = null;
        }

        public override void Destroy()
        {
            _threadDispatcher.Invoke(() => Player.Destroy());
            _threadDispatcher.InvokeShutdown();
            _workerThread.Join();
        }

        protected override void DispatchOnUiThread(Action action)
        {
            _uiInvoke(action);
        }

        protected override void DispatchOnWorkerThread(Action action)
        {
            if (_threadDispatcher.CheckAccess())
            {
                action();
            }
            else
            {
                _threadDispatcher.BeginInvoke(action);
            }
        }

        private void DoWork()
        {
            _threadDispatcher = Dispatcher.CurrentDispatcher;
            _threadStartedEvent.Set();
            Dispatcher.Run();
        }
    }
}
#endif