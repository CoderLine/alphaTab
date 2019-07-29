#if NET472
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using AlphaTab.Audio.Synth;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.UI;
using SkiaSharp;
using Point = System.Windows.Point;
using Image = System.Windows.Controls.Image;

namespace AlphaTab.Platform.CSharp.Wpf
{
    class WpfUiFacade : IUiFacade<AlphaTab>
    {
        private readonly ScrollViewer _scrollViewer;
        private AlphaTabApi<AlphaTab> _api;
        private AlphaTab _control;
        private event Action _rootContainerBecameVisible;
        private readonly ConcurrentQueue<Counter> _totalResultCount = new ConcurrentQueue<Counter>();

        public IContainer RootContainer { get; }

        public bool AreWorkersSupported => true;
        public bool CanRender => true;

        public int ResizeThrottle => 25;

        public event Action CanRenderChanged;

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
                    void OnSizeChanged(object sender, SizeChangedEventArgs e)
                    {
                        _scrollViewer.IsVisibleChanged -= OnVisibilityChanged;
                        _scrollViewer.SizeChanged -= OnSizeChanged;
                        if (_scrollViewer.IsVisible && _scrollViewer.ActualWidth > 0)
                        {
                            if (_rootContainerBecameVisible != null)
                            {
                                _rootContainerBecameVisible();
                            }

                            _rootContainerBecameVisible = null;
                        }
                    }
                    void OnVisibilityChanged(object sender, DependencyPropertyChangedEventArgs e)
                    {
                        _scrollViewer.IsVisibleChanged -= OnVisibilityChanged;
                        _scrollViewer.SizeChanged -= OnSizeChanged;
                        if (_scrollViewer.IsVisible && _scrollViewer.ActualWidth > 0)
                        {
                            if (_rootContainerBecameVisible != null)
                            {
                                _rootContainerBecameVisible();
                            }

                            _rootContainerBecameVisible = null;
                        }
                    }
                    _rootContainerBecameVisible += value;
                    _scrollViewer.IsVisibleChanged += OnVisibilityChanged;
                    _scrollViewer.SizeChanged += OnSizeChanged;
                }
            }
            remove => _rootContainerBecameVisible -= value;
        }


        public WpfUiFacade(ScrollViewer scrollViewer)
        {
            _scrollViewer = scrollViewer;
            RootContainer = new FrameworkElementContainer(scrollViewer);
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
            _scrollViewer.Content = null;
        }

        public IContainer CreateCanvasElement()
        {
            var canvas = new WrapPanel
            {
                VerticalAlignment = VerticalAlignment.Top,
                Orientation = Orientation.Horizontal,
                Opacity = 0.5
            };
            return new FrameworkElementContainer(canvas);
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

        public void BeginAppendRenderResults(RenderFinishedEventArgs r)
        {
            _control.Dispatcher.BeginInvoke((Action<RenderFinishedEventArgs>)(renderResult =>
            {
                var panel = (WrapPanel)((FrameworkElementContainer)_api.CanvasElement).Control;

                // null result indicates that the rendering finished
                if (renderResult == null)
                {
                    _totalResultCount.TryDequeue(out var counter);
                    // so we remove elements that might be from a previous render session
                    while (panel.Children.Count > counter.Count)
                    {
                        panel.Children.RemoveAt(panel.Children.Count - 1);
                    }
                }
                // NOTE: here we try to replace existing children 
                else
                {
                    var body = renderResult.RenderResult;

                    ImageSource source = null;
                    if (body is string svg)
                    {
                        // TODO: svg support
                        return;
                    }
                    else if (body is SKImage skiaImage)
                    {
                        using (skiaImage)
                        {
                            source = SkImageSource.Create(skiaImage);
                        }
                    }
                    else if (body is System.Drawing.Bitmap image)
                    {
                        using (image)
                        {
                            source = GdiImageSource.Create(image);
                        }
                    }

                    if (source != null)
                    {
                        _totalResultCount.TryPeek(out var counter);
                        if (counter.Count < panel.Children.Count)
                        {
                            Image img = (Image)(panel.Children[counter.Count]);
                            img.Width = renderResult.Width;
                            img.Height = renderResult.Height;
                            img.Stretch = Stretch.None;
                            img.SnapsToDevicePixels = true;
                            img.Source = source;
                        }
                        else
                        {
                            var img = new Image();
                            img.Width = renderResult.Width;
                            img.Height = renderResult.Height;
                            img.Source = source;
                            panel.Children.Add(img);
                        }
                        counter.Count++;
                    }
                }
            }), r);
        }

        public IScoreRenderer CreateWorkerRenderer()
        {
            return new ManagedThreadScoreRenderer<AlphaTab>(_api, _api.Settings, a =>
            {
                if (_control.Dispatcher.CheckAccess())
                {
                    a();
                }
                else
                {
                    _control.Dispatcher.BeginInvoke(a);
                }
            });
        }

        public IAlphaSynth CreateWorkerPlayer()
        {
            var player = new ManagedThreadAlphaSynthWorkerApi(new NAudioSynthOutput(), _api.Settings.LogLevel, a =>
            {
                if (_control.Dispatcher.CheckAccess())
                {
                    a();
                }
                else
                {
                    _control.Dispatcher.BeginInvoke(a);
                }
            });
            player.Ready += () =>
            {
                using (var sf = typeof(WpfUiFacade).Assembly.GetManifestResourceStream(typeof(GdiCanvas), "default.sf2"))
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
            var cursorWrapper = new Canvas();
            cursorWrapper.HorizontalAlignment = HorizontalAlignment.Left;
            cursorWrapper.VerticalAlignment = VerticalAlignment.Top;

            var selectionWrapper = new Canvas();

            var barCursor = new System.Windows.Shapes.Rectangle();
            barCursor.Fill = _control.BarCursorFill;
            barCursor.IsHitTestVisible = false;

            var beatCursor = new System.Windows.Shapes.Rectangle();
            beatCursor.Fill = _control.BeatCursorFill;
            beatCursor.IsHitTestVisible = false;

            cursorWrapper.Children.Add(selectionWrapper);
            cursorWrapper.Children.Add(barCursor);
            cursorWrapper.Children.Add(beatCursor);

            // add cursors to UI
            var element = (Panel)((FrameworkElementContainer)_api.CanvasElement).Control.Parent;
            element.Children.Insert(0, cursorWrapper);

            return new Cursors(
                new FrameworkElementContainer(cursorWrapper),
                new FrameworkElementContainer(barCursor),
                new FrameworkElementContainer(beatCursor),
                new FrameworkElementContainer(selectionWrapper)
            );
        }

        public void BeginInvoke(Action action)
        {
            _control.Dispatcher.BeginInvoke(action);
        }

        public void RemoveHighlights()
        {
        }

        public void HighlightElements(string groupId)
        {
        }

        public IContainer CreateSelectionElement()
        {
            var selection = new System.Windows.Shapes.Rectangle();
            selection.Fill = _control.SelectionFill;
            selection.IsHitTestVisible = false;
            return new FrameworkElementContainer(selection);
        }

        public IContainer GetScrollContainer()
        {
            return new FrameworkElementContainer(_scrollViewer);
        }

        public Bounds GetOffset(IContainer relativeTo, IContainer container)
        {
            var containerWpf = ((FrameworkElementContainer)container).Control;

            var canvas = ((FrameworkElementContainer)_api.CanvasElement).Control;
            var position = containerWpf.TranslatePoint(new Point(0, 0), canvas);

            if (relativeTo != null && ((FrameworkElementContainer)relativeTo).Control is ScrollViewer sv)
            {
                position.Y -= sv.VerticalOffset;
                position.X -= sv.HorizontalOffset;
            }

            return new Bounds
            {
                X = (float)position.X,
                Y = (float)position.Y,
                W = (float)containerWpf.ActualWidth,
                H = (float)containerWpf.ActualHeight
            };
        }

        public void ScrollToY(IContainer scrollElement, int offset, int speed)
        {
            if (((FrameworkElementContainer)scrollElement).Control is ScrollViewer s)
            {
                s.ScrollToVerticalOffset(offset);
            }

            //scrollElementWpf.BeginAnimation(ScrollViewer.VerticalOffsetProperty,
            //    new DoubleAnimation(offset, new System.Windows.Duration(TimeSpan.FromMilliseconds(speed))));
        }

        public void ScrollToX(IContainer scrollElement, int offset, int speed)
        {
            if (((FrameworkElementContainer)scrollElement).Control is ScrollViewer s)
            {
                s.ScrollToHorizontalOffset(offset);
            }

            //var scrollElementWpf = ((FrameworkElementContainer)scrollElement).Control;
            //scrollElementWpf.BeginAnimation(ScrollViewer.HorizontalOffsetProperty,
            //    new DoubleAnimation(offset, new System.Windows.Duration(TimeSpan.FromMilliseconds(speed))));
        }
    }
}
#endif