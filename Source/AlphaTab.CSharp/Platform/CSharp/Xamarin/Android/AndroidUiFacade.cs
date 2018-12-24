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
using System.IO;
using AlphaTab.Audio.Synth;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.UI;
using Android.Graphics;
using Android.Views;
using Android.Widget;
using SkiaSharp;

namespace AlphaTab.Platform.CSharp.Xamarin.Android
{
    class AndroidUiFacade : IUiFacade<AlphaTab>
    {
        private AlphaTab _control;
        private float _displayDensity;
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
                    void OnLayoutChange(object sender, EventArgs e)
                    {
                        _control.LayoutChange -= OnLayoutChange;
                        if (_control.Visibility == ViewStates.Visible && _control.Width > 0)
                        {
                            _rootContainerBecameVisible?.Invoke();
                            _rootContainerBecameVisible = null;
                        }
                    }
                    _rootContainerBecameVisible += value;
                    _control.LayoutChange += OnLayoutChange;
                }
            }
            remove => _rootContainerBecameVisible -= value;
        }

        public AndroidUiFacade(AlphaTab scrollViewer, AlphaTabLayoutPanel layoutPanel)
        {
            using (var metrics = scrollViewer.Context.Resources.DisplayMetrics)
            {
                _displayDensity = metrics.Density;
            }

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
            _layoutPanel.RemoveAllViews();
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
            _control.Post(() =>
            {
                var panel = _layoutPanel;

                // null result indicates that the rendering finished
                if (renderResult == null)
                {
                    _totalResultCount.TryDequeue(out var counter);
                    // so we remove elements that might be from a previous render session
                    while (panel.ChildCount > counter.Count)
                    {
                        var view = panel.GetChildAt(panel.ChildCount - 1);
                        panel.RemoveView(view);
                        view.Dispose();
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

                            byte[] imageBytes;
                            using (var data = image.Encode(SKEncodedImageFormat.Png, 100))
                            {
                                imageBytes = data.ToArray();
                            }

                            var view = new ImageView(_control.Context);
                            view.SetMinimumWidth((int)(renderResult.Width * _displayDensity));
                            view.SetMinimumHeight((int)(renderResult.Height * _displayDensity));
                            view.SetMaxWidth((int)(renderResult.Width * _displayDensity));
                            view.SetMaxHeight((int)(renderResult.Width * _displayDensity));
                            view.SetImageBitmap(BitmapFactory.DecodeByteArray(imageBytes, 0, imageBytes.Length));

                            panel.AddView(view);
                            counter.Count++;
                        }
                    }

                }
            });
        }


        public IScoreRenderer CreateWorkerRenderer()
        {
            return new ManagedThreadScoreRenderer<AlphaTab>(_api, _api.Settings, a =>
            {
                _control.Post(a);
            });
        }

        public IAlphaSynth CreateWorkerPlayer()
        {
            var player = new ManagedThreadAlphaSynthWorkerApi(new AndroidSynthOutput(), _api.Settings.LogLevel, a =>
            {
                _control.Post(a);
            });

            player.Ready += () =>
            {
                using (var sf = typeof(AndroidUiFacade).Assembly.GetManifestResourceStream(typeof(SkiaCanvas), "default.sf2"))
                using (var ms = new MemoryStream())
                {
                    sf.CopyTo(ms);
                    player.LoadSoundFont(ms.ToArray());
                }
            };
            return player;
        }

        public Cursors CreateCursors()
        {
            // TODO: 
            return null;
        }

        public void BeginInvoke(Action action)
        {
            _control.Post(action);
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
            var view = ((ViewContainer)container).View;

            int left = 0;
            int top = 0;

            var c = view;
            while (c != null && c != _layoutPanel)
            {
                left += c.Left;
                top += c.Top;
                c = c.Parent as View;
            }

            return new Bounds
            {
                X = left,
                Y = top,
                W = view.Width,
                H = view.Height
            };
        }

        public void ScrollToY(IContainer scrollElement, int offset, int speed)
        {
            var c = ((ViewContainer)scrollElement).View;
            if (c is ScrollView s)
            {
                s.ScrollY = offset;
            }
        }

        public void ScrollToX(IContainer scrollElement, int offset, int speed)
        {
            var c = ((ViewContainer)scrollElement).View;
            if (c is ScrollView s)
            {
                s.ScrollX = offset;
            }
        }
    }

}
#endif