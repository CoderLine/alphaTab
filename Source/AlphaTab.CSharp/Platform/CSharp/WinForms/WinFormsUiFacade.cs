#if NET472
using System;
using System.Collections.Concurrent;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using AlphaTab.Audio.Synth;
using AlphaTab.Platform.CSharp.Wpf;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.UI;
using SkiaSharp;
using Cursors = AlphaTab.UI.Cursors;

namespace AlphaTab.Platform.CSharp.WinForms
{
    internal class WinFormsUiFacade : IUiFacade<AlphaTabControl>
    {
        private AlphaTabApi<AlphaTabControl> _api;
        private AlphaTabControl _control;
        private readonly AlphaTabLayoutPanel _layoutPanel;
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
                    void OnSizeChanged(object sender, EventArgs e)
                    {
                        _control.VisibleChanged -= OnVisibilityChanged;
                        _control.SizeChanged -= OnSizeChanged;
                        if (_control.Visible && _control.Width > 0)
                        {
                            if (_rootContainerBecameVisible != null)
                            {
                                _rootContainerBecameVisible();
                            }

                            _rootContainerBecameVisible = null;
                        }
                    }
                    void OnVisibilityChanged(object sender, EventArgs e)
                    {
                        _control.VisibleChanged -= OnVisibilityChanged;
                        _control.SizeChanged -= OnSizeChanged;
                        if (_control.Visible && _control.Width > 0)
                        {
                            if (_rootContainerBecameVisible != null)
                            {
                                _rootContainerBecameVisible();
                            }

                            _rootContainerBecameVisible = null;
                        }
                    }
                    _rootContainerBecameVisible += value;
                    _control.VisibleChanged += OnVisibilityChanged;
                    _control.SizeChanged += OnSizeChanged;
                }
            }
            remove => _rootContainerBecameVisible -= value;
        }


        public WinFormsUiFacade(AlphaTabControl scrollViewer, AlphaTabLayoutPanel layoutPanel)
        {
            _control = scrollViewer;
            _layoutPanel = layoutPanel;
            RootContainer = new ControlContainer(scrollViewer);
        }

        public void Initialize(AlphaTabApi<AlphaTabControl> api, AlphaTabControl control)
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
            _layoutPanel.Controls.Clear();
        }

        public IContainer CreateCanvasElement()
        {
            return new ControlContainer(_layoutPanel);
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
            _control.BeginInvoke((Action<RenderFinishedEventArgs>)(renderResult =>
            {
                var panel = _layoutPanel;

                // null result indicates that the rendering finished
                if (renderResult == null)
                {
                    _totalResultCount.TryDequeue(out var counter);
                    // so we remove elements that might be from a previous render session
                    while (panel.Controls.Count > counter.Count)
                    {
                        var control = panel.Controls[panel.Controls.Count - 1];
                        panel.Controls.RemoveAt(panel.Controls.Count - 1);
                        control.Dispose();
                    }
                }
                // NOTE: here we try to replace existing children
                else
                {
                    var body = renderResult.RenderResult;

                    Bitmap source = null;
                    if (body is string svg)
                    {
                        // TODO: svg support
                        return;
                    }
                    else if (body is SKImage skiaImage)
                    {
                        using (skiaImage)
                        {
                            source = SkiaUtil.ToBitmap(skiaImage);
                        }
                    }
                    else if (body is System.Drawing.Bitmap image)
                    {
                        source = image;
                    }

                    if (source != null)
                    {
                        _totalResultCount.TryPeek(out var counter);
                        if (counter.Count < panel.Controls.Count)
                        {
                            var img = (PictureBox)panel.Controls[counter.Count];
                            img.Width = (int)renderResult.Width;
                            img.Height = (int)renderResult.Height;
                            var oldImg = img.Image;
                            img.Image = source;
                            if (oldImg != null)
                            {
                                oldImg.Dispose();
                            }
                        }
                        else
                        {
                            var img = new PictureBox
                            {
                                AutoSize = false,
                                BackColor = _layoutPanel.ForeColor,
                                Width = (int)renderResult.Width,
                                Height = (int)renderResult.Height,
                                Image = source,
                                Padding = Padding.Empty,
                                Margin = Padding.Empty,
                                BorderStyle = BorderStyle.None
                            };
                            panel.Controls.Add(img);
                        }
                        counter.Count++;
                    }
                }
            }), r);
        }

        public IScoreRenderer CreateWorkerRenderer()
        {
            return new ManagedThreadScoreRenderer(_api.Settings, a =>
            {
                if (_control.InvokeRequired)
                {
                    _control.BeginInvoke(a);
                }
                else
                {
                    a();
                }
            });
        }

        public IAlphaSynth CreateWorkerPlayer()
        {
            var player = new ManagedThreadAlphaSynthWorkerApi(new NAudioSynthOutput(), _api.Settings.LogLevel, a =>
            {
                if (_control.InvokeRequired)
                {
                    _control.BeginInvoke(a);
                }
                else
                {
                    a();
                }
            });

            player.Ready += () =>
            {
                using (var sf =
 typeof(WpfUiFacade).Assembly.GetManifestResourceStream(typeof(GdiCanvas), "default.sf2"))
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
            // no cursors for winforms, why? - It lacks of proper transparency support
            // maybe if somebody asks for it.  it's worth an investigation.
            return null;
        }

        public void BeginInvoke(Action action)
        {
            _control.BeginInvoke(action);
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
            return new ControlContainer(_control);
        }

        public Bounds GetOffset(IContainer relativeTo, IContainer container)
        {
            var containerWinForms = ((ControlContainer)container).Control;

            var left = 0;
            var top = 0;

            var c = containerWinForms;
            while(c != null && c != _layoutPanel)
            {
                left += c.Left;
                top += c.Top;
                c = c.Parent;
            }

            return new Bounds
            {
                X = left,
                Y = top,
                W = containerWinForms.Width,
                H = containerWinForms.Height
            };
        }

        public void ScrollToY(IContainer scrollElement, int offset, int speed)
        {
            var c = ((ControlContainer) scrollElement).Control;
            c.AutoScrollOffset = new Point(c.AutoScrollOffset.X, offset);
        }

        public void ScrollToX(IContainer scrollElement, int offset, int speed)
        {
            var c = ((ControlContainer)scrollElement).Control;
            c.AutoScrollOffset = new Point(offset, c.AutoScrollOffset.Y);
        }
    }
}
#endif
