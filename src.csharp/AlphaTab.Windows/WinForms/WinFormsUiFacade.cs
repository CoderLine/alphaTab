using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using AlphaTab.Synth;
using AlphaTab.Platform;
using AlphaTab.Platform.CSharp;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using SkiaSharp;

namespace AlphaTab.WinForms
{
    internal class WinFormsUiFacade : ManagedUiFacade<AlphaTabControl>
    {
        private readonly AlphaTabLayoutPanel _layoutPanel;
        private event Action? InternalRootContainerBecameVisible;

        public override IContainer RootContainer { get; }
        public override IEventEmitter RootContainerBecameVisible { get; }

        public WinFormsUiFacade(AlphaTabControl scrollViewer, AlphaTabLayoutPanel layoutPanel)
        {
            _layoutPanel = layoutPanel;
            RootContainer = new ControlContainer(scrollViewer);
            RootContainerBecameVisible = new DelegatedEventEmitter(
                value =>
                {
                    if (RootContainer.IsVisible)
                    {
                        value();
                    }
                    else
                    {
                        void OnSizeChanged(object? sender, EventArgs e)
                        {
                            SettingsContainer.VisibleChanged -= OnVisibilityChanged;
                            SettingsContainer.SizeChanged -= OnSizeChanged;
                            if (SettingsContainer.Visible && SettingsContainer.Width > 0)
                            {
                                InternalRootContainerBecameVisible?.Invoke();
                                InternalRootContainerBecameVisible = null;
                            }
                        }

                        void OnVisibilityChanged(object? sender, EventArgs e)
                        {
                            SettingsContainer.VisibleChanged -= OnVisibilityChanged;
                            SettingsContainer.SizeChanged -= OnSizeChanged;
                            if (SettingsContainer.Visible && SettingsContainer.Width > 0)
                            {
                                InternalRootContainerBecameVisible?.Invoke();

                                InternalRootContainerBecameVisible = null;
                            }
                        }

                        InternalRootContainerBecameVisible += value;
                        SettingsContainer.VisibleChanged += OnVisibilityChanged;
                        SettingsContainer.SizeChanged += OnSizeChanged;
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

        public override void Initialize(AlphaTabApiBase<AlphaTabControl> api,
            AlphaTabControl control)
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
            _layoutPanel.Controls.Clear();
        }

        public override IContainer CreateCanvasElement()
        {
            return new ControlContainer(_layoutPanel);
        }

        public override void TriggerEvent(IContainer container, string eventName,
            object? details = null, IMouseEventArgs? originalEvent = null)
        {
        }

        public override void BeginAppendRenderResults(RenderFinishedEventArgs? r)
        {
            SettingsContainer.BeginInvoke((Action<RenderFinishedEventArgs>) (renderResult =>
            {
                var panel = _layoutPanel;

                // null result indicates that the rendering finished
                if (renderResult == null)
                {
                    if (TotalResultCount.TryDequeue(out var counter))
                    {
                        // so we remove elements that might be from a previous render session
                        while (panel.Controls.Count > counter.Count)
                        {
                            var control = panel.Controls[^1];
                            panel.Controls.RemoveAt(panel.Controls.Count - 1);
                            control.Dispose();
                        }
                    }
                }
                // NOTE: here we try to replace existing children
                else
                {
                    var body = renderResult.RenderResult;

                    Bitmap? source = null;
                    if (body is string)
                    {
                        // TODO: svg support
                        return;
                    }

                    if (body is SKImage skiaImage)
                    {
                        using (skiaImage)
                        {
                            source = SkiaUtil.ToBitmap(skiaImage);
                        }
                    }
                    else if (body is Bitmap image)
                    {
                        source = image;
                    }

                    if (source != null)
                    {
                        if (TotalResultCount.TryPeek(out var counter))
                        {
                            if (counter.Count < panel.Controls.Count)
                            {
                                var img = (PictureBox) panel.Controls[counter.Count];
                                img.Width = (int) renderResult.Width;
                                img.Height = (int) renderResult.Height;
                                var oldImg = img.Image;
                                img.Image = source;
                                oldImg?.Dispose();
                            }
                            else
                            {
                                var img = new PictureBox
                                {
                                    AutoSize = false,
                                    BackColor = _layoutPanel.ForeColor,
                                    Width = (int) renderResult.Width,
                                    Height = (int) renderResult.Height,
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
                }
            }), r);
        }


        public override void DestroyCursors()
        {
        }

        public override Platform.Cursors? CreateCursors()
        {
            // no cursors for winforms, why? - It lacks of proper transparency support
            // maybe if somebody asks for it, it's worth an investigation.
            return null;
        }

        public override void BeginInvoke(Action action)
        {
            SettingsContainer.BeginInvoke(action);
        }

        public override void RemoveHighlights()
        {
        }

        public override void HighlightElements(string groupId)
        {
        }

        public override IContainer? CreateSelectionElement()
        {
            return null;
        }

        public override IContainer GetScrollContainer()
        {
            return new ControlContainer(SettingsContainer);
        }

        public override Bounds GetOffset(IContainer? relativeTo, IContainer container)
        {
            var containerWinForms = ((ControlContainer) container).Control;

            var left = 0;
            var top = 0;

            var c = containerWinForms;
            while (c != null && c != _layoutPanel)
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

        public override void ScrollToY(IContainer scrollElement, double offset, double speed)
        {
            var c = ((ControlContainer) scrollElement).Control;
            c.AutoScrollOffset = new Point(c.AutoScrollOffset.X, (int) offset);
        }

        public override void ScrollToX(IContainer scrollElement, double offset, double speed)
        {
            var c = ((ControlContainer) scrollElement).Control;
            c.AutoScrollOffset = new Point((int) offset, c.AutoScrollOffset.Y);
        }
    }
}
