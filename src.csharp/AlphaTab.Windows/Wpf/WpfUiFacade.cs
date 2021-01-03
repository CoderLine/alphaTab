using System;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using AlphaTab.Synth;
using AlphaTab.Platform;
using AlphaTab.Platform.CSharp;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using SkiaSharp;
using Point = System.Windows.Point;
using Image = System.Windows.Controls.Image;

namespace AlphaTab.Wpf
{
    internal class WpfUiFacade : ManagedUiFacade<AlphaTab>
    {
        private readonly ScrollViewer _scrollViewer;
        private event Action? InternalRootContainerBecameVisible;

        public override IContainer RootContainer { get; }

        public override IEventEmitter RootContainerBecameVisible { get; }

        public WpfUiFacade(ScrollViewer scrollViewer)
        {
            _scrollViewer = scrollViewer;
            RootContainer = new FrameworkElementContainer(scrollViewer);
            RootContainerBecameVisible = new DelegatedEventEmitter(
                value =>
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
                                InternalRootContainerBecameVisible?.Invoke();
                                InternalRootContainerBecameVisible = null;
                            }
                        }

                        void OnVisibilityChanged(object sender,
                            DependencyPropertyChangedEventArgs e)
                        {
                            _scrollViewer.IsVisibleChanged -= OnVisibilityChanged;
                            _scrollViewer.SizeChanged -= OnSizeChanged;
                            if (_scrollViewer.IsVisible && _scrollViewer.ActualWidth > 0)
                            {
                                InternalRootContainerBecameVisible?.Invoke();
                                InternalRootContainerBecameVisible = null;
                            }
                        }

                        InternalRootContainerBecameVisible += value;
                        _scrollViewer.IsVisibleChanged += OnVisibilityChanged;
                        _scrollViewer.SizeChanged += OnSizeChanged;
                    }
                },
                value => { InternalRootContainerBecameVisible -= value; }
            );
        }

        protected override Stream? OpenDefaultSoundFont()
        {
            return typeof(NAudioSynthOutput).Assembly.GetManifestResourceStream(
                typeof(NAudioSynthOutput), "default.sf2");
        }

        public override void Initialize(AlphaTabApiBase<AlphaTab> api, AlphaTab control)
        {
            base.Initialize(api, control);
            api.Settings = control.Settings;
            control.SettingsChanged += OnSettingsChanged;
        }

        private void OnSettingsChanged(Settings s)
        {
            Api.Settings = s;
            Api.UpdateSettings();
            Api.Render();
        }

        protected override void RenderTracks()
        {
            SettingsContainer.RenderTracks();
        }

        protected override ISynthOutput CreateSynthOutput()
        {
            return new NAudioSynthOutput();
        }

        public override void Destroy()
        {
            SettingsContainer.SettingsChanged -= OnSettingsChanged;
            _scrollViewer.Content = null;
        }

        public override IContainer CreateCanvasElement()
        {
            var canvas = new WrapPanel
            {
                VerticalAlignment = VerticalAlignment.Top,
                Orientation = Orientation.Horizontal
            };
            return new FrameworkElementContainer(canvas);
        }

        public override void TriggerEvent(IContainer container, string eventName,
            object? details = null, IMouseEventArgs? originalEvent = null)
        {
        }

        public override void BeginAppendRenderResults(RenderFinishedEventArgs? r)
        {
            SettingsContainer.Dispatcher?.BeginInvoke(
                (Action<RenderFinishedEventArgs>) (renderResult =>
                {
                    var panel = (WrapPanel) ((FrameworkElementContainer) Api.CanvasElement).Control;

                    // null result indicates that the rendering finished
                    if (renderResult == null)
                    {
                        if (TotalResultCount.TryDequeue(out var counter))
                        {
                            // so we remove elements that might be from a previous render session
                            while (panel.Children.Count > counter.Count)
                            {
                                panel.Children.RemoveAt(panel.Children.Count - 1);
                            }
                        }
                    }
                    // NOTE: here we try to replace existing children
                    else
                    {
                        var body = renderResult.RenderResult;

                        ImageSource? source = null;
                        if (body is string)
                        {
                            // TODO: svg support
                            return;
                        }

                        if (body is SKImage skiaImage)
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
                            if (TotalResultCount.TryPeek(out var counter))
                            {
                                if (counter.Count < panel.Children.Count)
                                {
                                    var img = (Image) panel.Children[counter.Count];
                                    img.Width = renderResult.Width;
                                    img.Height = renderResult.Height;
                                    img.Stretch = Stretch.None;
                                    img.SnapsToDevicePixels = true;
                                    img.Source = source;
                                }
                                else
                                {
                                    var img = new Image
                                    {
                                        Width = renderResult.Width,
                                        Height = renderResult.Height,
                                        Source = source
                                    };
                                    panel.Children.Add(img);
                                }

                                counter.Count++;
                            }
                        }
                    }
                }),
                r);
        }

        public override void DestroyCursors()
        {
            var element = (Panel) ((FrameworkElementContainer) Api.CanvasElement).Control.Parent;
            var cursors = element.Children.OfType<Canvas>()
                .FirstOrDefault(c => "at-cursors".Equals(c.Tag));
            if (cursors != null)
            {
                element.Children.Remove(cursors);
            }
        }

        public override Cursors CreateCursors()
        {
            var cursorWrapper = new Canvas
            {
                Tag = "at-cursors",
                HorizontalAlignment = HorizontalAlignment.Left,
                VerticalAlignment = VerticalAlignment.Top
            };

            var selectionWrapper = new Canvas();

            var barCursor = new System.Windows.Shapes.Rectangle
            {
                Fill = SettingsContainer.BarCursorFill,
                IsHitTestVisible = false
            };

            var beatCursor = new System.Windows.Shapes.Rectangle
            {
                Fill = SettingsContainer.BeatCursorFill,
                IsHitTestVisible = false,
                Width = 3
            };

            cursorWrapper.Children.Add(selectionWrapper);
            cursorWrapper.Children.Add(barCursor);
            cursorWrapper.Children.Add(beatCursor);

            // add cursors to UI
            var element = (Panel) ((FrameworkElementContainer) Api.CanvasElement).Control.Parent;
            element.Children.Insert(0, cursorWrapper);

            return new Cursors(
                new FrameworkElementContainer(cursorWrapper),
                new FrameworkElementContainer(barCursor),
                new FrameworkElementContainer(beatCursor),
                new FrameworkElementContainer(selectionWrapper)
            );
        }

        public override void BeginInvoke(Action action)
        {
            SettingsContainer.Dispatcher?.BeginInvoke(action);
        }

        public override void RemoveHighlights()
        {
        }

        public override void HighlightElements(string groupId)
        {
        }

        public override IContainer CreateSelectionElement()
        {
            var selection = new System.Windows.Shapes.Rectangle
            {
                Fill = SettingsContainer.SelectionFill,
                IsHitTestVisible = false
            };
            return new FrameworkElementContainer(selection);
        }

        public override IContainer GetScrollContainer()
        {
            return new FrameworkElementContainer(_scrollViewer);
        }

        public override Bounds GetOffset(IContainer? relativeTo, IContainer container)
        {
            var containerWpf = ((FrameworkElementContainer) container).Control;

            var canvas = ((FrameworkElementContainer) Api.CanvasElement).Control;
            var position = containerWpf.TranslatePoint(new Point(0, 0), canvas);

            if (relativeTo != null &&
                ((FrameworkElementContainer) relativeTo).Control is ScrollViewer sv)
            {
                position.Y -= sv.VerticalOffset;
                position.X -= sv.HorizontalOffset;
            }

            return new Bounds
            {
                X = (float) position.X,
                Y = (float) position.Y,
                W = (float) containerWpf.ActualWidth,
                H = (float) containerWpf.ActualHeight
            };
        }

        public override void ScrollToY(IContainer scrollElement, double offset, double speed)
        {
            if (((FrameworkElementContainer) scrollElement).Control is ScrollViewer s)
            {
                s.ScrollToVerticalOffset(offset);
            }

            //scrollElementWpf.BeginAnimation(ScrollViewer.VerticalOffsetProperty,
            //    new DoubleAnimation(offset, new System.Windows.Duration(TimeSpan.FromMilliseconds(speed))));
        }

        public override void ScrollToX(IContainer scrollElement, double offset, double speed)
        {
            if (((FrameworkElementContainer) scrollElement).Control is ScrollViewer s)
            {
                s.ScrollToHorizontalOffset(offset);
            }

            //var scrollElementWpf = ((FrameworkElementContainer)scrollElement).Control;
            //scrollElementWpf.BeginAnimation(ScrollViewer.HorizontalOffsetProperty,
            //    new DoubleAnimation(offset, new System.Windows.Duration(TimeSpan.FromMilliseconds(speed))));
        }
    }
}
