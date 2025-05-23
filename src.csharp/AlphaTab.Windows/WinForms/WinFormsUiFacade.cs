﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using AlphaTab.Synth;
using AlphaTab.Platform;
using AlphaTab.Platform.CSharp;
using AlphaTab.Platform.Skia.AlphaSkiaBridge;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.WinForms
{
    internal class WinFormsUiFacade : ManagedUiFacade<AlphaTabControl>
    {
        private readonly AlphaTabLayoutPanel _layoutPanel;

        private readonly Dictionary<string, PictureBox> _resultIdToElementLookup =
            new Dictionary<string, PictureBox>();

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
            api.SettingsUpdated.On(OnSettingsUpdated);
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

        public override IAlphaSynth CreateBackingTrackPlayer()
        {
            return new BackingTrackPlayer(
                new NAudioBackingTrackOutput(BeginInvoke),
                Api.Settings.Player.BufferTimeInMilliseconds
            );
        }

        public override void Destroy()
        {
            SettingsContainer.SettingsChanged -= OnSettingsChanged;
            _layoutPanel.Controls.Clear();
            Api.SettingsUpdated.Off(OnSettingsUpdated);
        }

        public override IContainer CreateCanvasElement()
        {
            return new ControlContainer(_layoutPanel);
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
            SettingsContainer.BeginInvoke((Action<RenderFinishedEventArgs?>)(renderResult =>
            {

                if (renderResult == null ||
                    !_resultIdToElementLookup.TryGetValue(renderResult.Id, out var placeholder))
                {
                    return;
                }

                var body = renderResult.RenderResult;

                Bitmap? source = null;
                switch (body)
                {
                    case string _:
                        // TODO: svg support
                        return;
                    case AlphaSkiaImage skiaImage:
                        using (skiaImage)
                        {
                            source = AlphaSkiaUtil.ToBitmap(skiaImage);
                        }

                        break;
                    case Bitmap image:
                        source = image;
                        break;
                }

                var oldImage = placeholder.Image;
                placeholder.Image = source;
                oldImage?.Dispose();
            }), r);
        }

        public override void BeginAppendRenderResults(RenderFinishedEventArgs? r)
        {
            SettingsContainer.BeginInvoke((Action<RenderFinishedEventArgs?>)(renderResult =>
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
                    if (TotalResultCount.TryPeek(out var counter))
                    {
                        PictureBox placeholder;
                        if (counter.Count < panel.Controls.Count)
                        {
                            placeholder = (PictureBox)panel.Controls[counter.Count];
                        }
                        else
                        {
                            placeholder = new PictureBox
                            {
                                AutoSize = false,
                                BackColor = _layoutPanel.ForeColor,
                                Padding = Padding.Empty,
                                Margin = Padding.Empty,
                                BorderStyle = BorderStyle.None
                            };
                            panel.Controls.Add(placeholder);
                        }

                        placeholder.Left = (int)renderResult.X;
                        placeholder.Top = (int)renderResult.Y;
                        placeholder.Width = (int)renderResult.Width;
                        placeholder.Height = (int)renderResult.Height;

                        _resultIdToElementLookup[renderResult.Id] = placeholder;
                        Api.Renderer.RenderResult(renderResult.Id);

                        counter.Count++;
                    }
                }
            }), r);
        }

        private void OnSettingsUpdated()
        {
            foreach (Control control in _layoutPanel.Controls)
            {
                control.BackColor = _layoutPanel.ForeColor;
            }
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

        public override void HighlightElements(string groupId, double masterBarIndex)
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
            var containerWinForms = ((ControlContainer)container).Control;

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
            var c = ((ControlContainer)scrollElement).Control;
            c.AutoScrollOffset = new Point(c.AutoScrollOffset.X, (int)offset);
        }

        public override void ScrollToX(IContainer scrollElement, double offset, double speed)
        {
            var c = ((ControlContainer)scrollElement).Control;
            c.AutoScrollOffset = new Point((int)offset, c.AutoScrollOffset.Y);
        }
    }
}
