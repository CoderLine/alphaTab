#if ANDROID
/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Collections.Concurrent;
using System.Linq;
using AlphaTab.Audio.Synth;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.UI;
using SkiaSharp;
using Xamarin.Forms;

namespace AlphaTab.Platform.CSharp.Xamarin.Forms
{
    class XamarinFormsUiFacade : IUiFacade<AlphaTab>
    {
        private AlphaTab _control;
        private readonly AlphaTabLayoutPanel _layoutPanel;
        private AlphaTabApi<AlphaTab> _api;
        private event Action _rootContainerBecameVisible;
        private readonly ConcurrentQueue<Counter> _totalResultCount = new ConcurrentQueue<Counter>();

        public bool AreWorkersSupported => true;
        public bool CanRender => true;
        public event Action CanRenderChanged;
        public int ResizeThrottle => 25;
        public IContainer RootContainer { get; }

        public event Action RootContainerBecameVisible
        {
            add
            {
                if (RootContainer.IsVisible)
                {
                    value();
                }
                else
                {
                    void OnSizeChanged(object sender, EventArgs e)
                    {
                        _control.SizeChanged -= OnSizeChanged;
                        if (_control.IsVisible && _control.Width > 0)
                        {
                            _rootContainerBecameVisible?.Invoke();
                            _rootContainerBecameVisible = null;
                        }
                    }
                    _rootContainerBecameVisible += value;
                    _control.SizeChanged += OnSizeChanged;
                }
            }
            remove => _rootContainerBecameVisible -= value;
        }

        public XamarinFormsUiFacade(AlphaTab scrollViewer, AlphaTabLayoutPanel layoutPanel)
        {
            _control = scrollViewer;
            _layoutPanel = layoutPanel;
            RootContainer = new ViewContainer(scrollViewer);
        }

        public void Initialize(AlphaTabApi<AlphaTab> api, AlphaTab control)
        {
            _api = api;
            _control = control;
            api.Settings = control.Settings;
            control.SettingsChanged += OnSettingsChanged;
        }

        private void OnSettingsChanged(Settings s)
        {
            _api.Settings = s;
            _api.UpdateSettings();
            _api.Render();
        }

        public void Destroy()
        {
            _control.SettingsChanged -= OnSettingsChanged;
            _layoutPanel.Children.Clear();
        }

        public IContainer CreateCanvasElement()
        {
            return new ViewContainer(_layoutPanel);
        }

        public void TriggerEvent(IContainer container, string eventName, object details = null)
        {
        }

        private class Counter
        {
            public int Count;
        }

        public void InitialRender()
        {
            _api.Renderer.PreRender += () =>
            {
                _totalResultCount.Enqueue(new Counter());
            };
            RootContainerBecameVisible += () =>
            {
                // rendering was possibly delayed due to invisible element
                // in this case we need the correct width for autosize
                if (_api.AutoSize)
                {
                    _api.Settings.Width = (int)RootContainer.Width;
                    _api.Renderer.UpdateSettings(_api.Settings);
                }
                _control.RenderTracks();
            };

        }

        public void BeginAppendRenderResults(RenderFinishedEventArgs renderResult)
        {
            Device.BeginInvokeOnMainThread(() =>
            {
                var panel = _layoutPanel;

                // null result indicates that the rendering finished
                if (renderResult == null)
                {
                    _totalResultCount.TryDequeue(out var counter);
                    // so we remove elements that might be from a previous render session
                    while (panel.Children.Count > counter.Count)
                    {
                        var view = panel.Children.Last();
                        panel.Children.Remove(view);
                    }
                }
                // NOTE: here we try to replace existing children 
                else
                {
                    var body = renderResult.RenderResult;

                    if (body is SKImage image)
                    {
                        using (image)
                        {
                            _totalResultCount.TryPeek(out var counter);

                            panel.Children.Add(new Image
                            {
                                Source = new SkImageSource(image),
                                WidthRequest = renderResult.Width,
                                HeightRequest = renderResult.Height
                            });

                            counter.Count++;
                        }
                    }

                }
            });
        }


        public IScoreRenderer CreateWorkerRenderer()
        {
            return new ManagedThreadScoreRenderer<AlphaTab>(_api, _api.Settings, Device.BeginInvokeOnMainThread);
        }

        public IAlphaSynth CreateWorkerPlayer()
        {
            // TODO
            return null;
        }

        public Cursors CreateCursors()
        {
            // TODO: 
            return null;
        }

        public void BeginInvoke(Action action)
        {
            Device.BeginInvokeOnMainThread(action);
        }

        public void RemoveHighlights()
        {
        }

        public void HighlightElements(string groupId)
        {
        }

        public IContainer CreateSelectionElement()
        {
            return null;
        }

        public IContainer GetScrollContainer()
        {
            return new ViewContainer(_control);
        }

        public Bounds GetOffset(IContainer relativeTo, IContainer container)
        {
            // TODO
            return new Bounds();
        }

        public void ScrollToY(IContainer scrollElement, int offset, int speed)
        {
            var c = ((ViewContainer)scrollElement).View;
            if (c is ScrollView s)
            {
                s.ScrollToAsync(s.ScrollX, offset, true);
            }
        }

        public void ScrollToX(IContainer scrollElement, int offset, int speed)
        {
            var c = ((ViewContainer)scrollElement).View;
            if (c is ScrollView s)
            {
                s.ScrollToAsync(offset, s.ScrollY, true);
            }
        }
    }
}
#endif