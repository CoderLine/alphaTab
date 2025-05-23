using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using System.Windows.Shapes;
using AlphaTab.Synth;
using AlphaTab.Platform;
using AlphaTab.Platform.CSharp;
using AlphaTab.Platform.Skia.AlphaSkiaBridge;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using Point = System.Windows.Point;
using Image = System.Windows.Controls.Image;

namespace AlphaTab.Wpf
{
    internal class WpfUiFacade : ManagedUiFacade<AlphaTab>
    {
        private readonly ScrollViewer _scrollViewer;

        private readonly Dictionary<string, Image> _resultIdToElementLookup =
            new Dictionary<string, Image>();

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
            control.Settings.Core.EnableLazyLoading = false;
            api.Settings = control.Settings;
            control.SettingsChanged += OnSettingsChanged;
        }

        private void OnSettingsChanged(Settings s)
        {
            s.Core.EnableLazyLoading = false;
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

        public override IAlphaSynth? CreateBackingTrackPlayer()
        {
            return new BackingTrackPlayer(
                new NAudioBackingTrackOutput(BeginInvoke),
                Api.Settings.Player.BufferTimeInMilliseconds
            );
        }

        public override void Destroy()
        {
            SettingsContainer.SettingsChanged -= OnSettingsChanged;
            _scrollViewer.Content = null;
        }

        public override IContainer CreateCanvasElement()
        {
            var canvas = new Canvas
            {
                VerticalAlignment = VerticalAlignment.Top
            };
            return new FrameworkElementContainer(canvas);
        }

        public override void InitialRender()
        {
            Api.Renderer.PreRender.On(_ => { _resultIdToElementLookup.Clear(); });
            base.InitialRender();
        }

        public override void TriggerEvent(IContainer container, string eventName,
            object? details = null, IMouseEventArgs? originalEvent = null)
        {
        }

        public override void BeginUpdateRenderResults(RenderFinishedEventArgs? r)
        {
            SettingsContainer.Dispatcher?.BeginInvoke(
                (Action<RenderFinishedEventArgs?>)(renderResult =>
                {
                    if (renderResult == null ||
                        !_resultIdToElementLookup.TryGetValue(renderResult.Id, out var placeholder))
                    {
                        return;
                    }

                    var body = renderResult.RenderResult;

                    ImageSource? source = null;
                    if (body is string)
                    {
                        // TODO: svg support
                        return;
                    }

                    if (body is AlphaSkiaImage skiaImage)
                    {
                        using (skiaImage)
                        {
                            source = AlphaSkiaImageSource.Create(skiaImage);
                        }
                    }
                    else if (body is System.Drawing.Bitmap image)
                    {
                        using (image)
                        {
                            source = GdiImageSource.Create(image);
                        }
                    }

                    placeholder.Source = source;
                }), r);
        }

        public override void BeginAppendRenderResults(RenderFinishedEventArgs? r)
        {
            SettingsContainer.Dispatcher?.BeginInvoke(
                (Action<RenderFinishedEventArgs?>)(renderResult =>
                {
                    var panel = (Panel)((FrameworkElementContainer)Api.CanvasElement).Control;

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
                        if (TotalResultCount.TryPeek(out var counter))
                        {
                            Image placeholder;
                            if (counter.Count < panel.Children.Count)
                            {
                                placeholder = (Image)panel.Children[counter.Count];
                            }
                            else
                            {
                                placeholder = new Image
                                {
                                    Stretch = Stretch.None,
                                    SnapsToDevicePixels = true
                                };
                                panel.Children.Add(placeholder);
                            }

                            Canvas.SetLeft(placeholder, renderResult.X);
                            Canvas.SetTop(placeholder, renderResult.Y);
                            placeholder.Width = renderResult.Width;
                            placeholder.Height = renderResult.Height;
                            _resultIdToElementLookup[renderResult.Id] = placeholder;

                            counter.Count++;
                        }
                    }
                }),
                r);
        }

        public override void DestroyCursors()
        {
            var element = (Panel)((FrameworkElementContainer)Api.CanvasElement).Control.Parent;
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

            var barCursor = new Rectangle
            {
                IsHitTestVisible = false
            };

            barCursor.SetBinding(Shape.FillProperty, new Binding(nameof(SettingsContainer.BarCursorFill))
            {
                Source = SettingsContainer
            });

            var beatCursor = new Rectangle
            {
                IsHitTestVisible = false,
                Width = 3
            };
            beatCursor.SetBinding(Shape.FillProperty, new Binding(nameof(SettingsContainer.BeatCursorFill))
            {
                Source = SettingsContainer
            });

            cursorWrapper.Children.Add(selectionWrapper);
            cursorWrapper.Children.Add(barCursor);
            cursorWrapper.Children.Add(beatCursor);

            // add cursors to UI
            var element = (Panel)((FrameworkElementContainer)Api.CanvasElement).Control.Parent;
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

        public override void HighlightElements(string groupId, double masterBarIndex)
        {
        }

        public override IContainer CreateSelectionElement()
        {
            var selection = new Rectangle
            {
                Fill = SettingsContainer.SelectionFill,
                IsHitTestVisible = false
            };
            selection.SetBinding(Shape.FillProperty,
                new Binding(nameof(SettingsContainer.SelectionFill))
                {
                    Source = SettingsContainer
                });
            return new FrameworkElementContainer(selection);
        }

        public override IContainer GetScrollContainer()
        {
            return new FrameworkElementContainer(_scrollViewer);
        }

        public override Bounds GetOffset(IContainer? relativeTo, IContainer container)
        {
            var containerWpf = ((FrameworkElementContainer)container).Control;

            var canvas = ((FrameworkElementContainer)Api.CanvasElement).Control;
            var position = containerWpf.TranslatePoint(new Point(0, 0), canvas);

            if (relativeTo != null &&
                ((FrameworkElementContainer)relativeTo).Control is ScrollViewer sv)
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

        public override void ScrollToY(IContainer scrollElement, double offset, double speed)
        {
            if (((FrameworkElementContainer)scrollElement).Control is ScrollViewer s)
            {
                s.ScrollToVerticalOffset(offset);
            }

            //scrollElementWpf.BeginAnimation(ScrollViewer.VerticalOffsetProperty,
            //    new DoubleAnimation(offset, new System.Windows.Duration(TimeSpan.FromMilliseconds(speed))));
        }

        public override void ScrollToX(IContainer scrollElement, double offset, double speed)
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
