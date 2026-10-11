using System;
using System.Drawing;
using System.Windows.Forms;
using AlphaTab.Platform;

namespace AlphaTab.WinForms
{
    internal class ControlContainer : IContainer
    {
        public Control Control { get; }

        public ControlContainer(Control control)
        {
            Control = control;

            Resize = new DelegatedEventEmitter(
                value => { Control.Resize += (sender, args) => value(); },
                value => { }
            );

            MouseDown = new DelegatedEventEmitter<IMouseEventArgs>(
                value =>
                {
                    AttachMouseHandlers();
                    _mouseDown += value;
                },
                value => { _mouseDown -= value; }
            );

            MouseMove = new DelegatedEventEmitter<IMouseEventArgs>(
                value =>
                {
                    AttachMouseHandlers();
                    _mouseMove += value;
                },
                value => { _mouseMove -= value; }
            );

            MouseUp = new DelegatedEventEmitter<IMouseEventArgs>(
                value =>
                {
                    AttachMouseHandlers();
                    _mouseUp += value;
                },
                value => { _mouseUp -= value; }
            );
        }

        private Action<IMouseEventArgs>? _mouseDown;
        private Action<IMouseEventArgs>? _mouseMove;
        private Action<IMouseEventArgs>? _mouseUp;
        private bool _mouseHandlersAttached;
        private bool _isPressed;

        private void AttachMouseHandlers()
        {
            if (_mouseHandlersAttached)
            {
                return;
            }

            _mouseHandlersAttached = true;

            // WinForms captures the mouse on press, so releases outside the control are delivered here.
            // Losing that capture (e.g. alt-tab, a modal dialog) ends the press without a MouseUp.
            Control.MouseDown += (sender, args) =>
            {
                if (args.Button == MouseButtons.Left)
                {
                    _isPressed = true;
                }

                _mouseDown?.Invoke(new WinFormsMouseEventArgs(Control, args));
            };

            Control.MouseMove += (sender, args) => _mouseMove?.Invoke(new WinFormsMouseEventArgs(Control, args));

            Control.MouseUp += (sender, args) =>
            {
                if (args.Button == MouseButtons.Left)
                {
                    _isPressed = false;
                }

                _mouseUp?.Invoke(new WinFormsMouseEventArgs(Control, args));
            };

            Control.MouseCaptureChanged += (sender, args) =>
            {
                if (!_isPressed || Control.Capture)
                {
                    return;
                }

                // deferred: a regular release may drop the capture before its MouseUp is raised
                Control.BeginInvoke(() =>
                {
                    if (!_isPressed)
                    {
                        return;
                    }

                    _isPressed = false;
                    var location = Control.PointToClient(Cursor.Position);
                    _mouseUp?.Invoke(new WinFormsMouseEventArgs(Control,
                        new MouseEventArgs(MouseButtons.Left, 0, location.X, location.Y, 0)));
                });
            };
        }

        public double Width
        {
            get => Control.ClientSize.Width - Control.Padding.Horizontal;
            set => Control.BeginInvoke(() =>
            {
                Control.Width = (int)value + Control.Padding.Horizontal;
            });
        }


        public double Height
        {
            get => Control.ClientSize.Height - Control.Padding.Vertical;
            set => Control.BeginInvoke(() =>
            {
                Control.Height = (int)value + Control.Padding.Vertical;
            });
        }

        public bool IsVisible => Control.Visible && Control.Width > 0;

        public double ScrollLeft
        {
            get => Control is ScrollableControl scroll ? scroll.AutoScrollPosition.X : 0;
            set
            {
                Control.BeginInvoke(() =>
                {
                    if (Control is ScrollableControl scroll)
                    {
                        scroll.AutoScrollPosition =
                            new Point((int)value, scroll.AutoScrollPosition.Y);
                    }
                });
            }
        }

        public double ScrollTop
        {
            get => Control is ScrollableControl scroll ? scroll.VerticalScroll.Value : 0;
            set
            {
                Control.BeginInvoke(() =>
                {
                    if (Control is ScrollableControl scroll)
                    {
                        scroll.AutoScrollPosition =
                            new Point(scroll.AutoScrollPosition.X, (int)value);
                    }
                });
            }
        }
        public void AppendChild(IContainer child)
        {
            Control.BeginInvoke(() => { Control.Controls.Add(((ControlContainer)child).Control); });
        }

        public void StopAnimation()
        {
        }

        public void TransitionToX(double duration, double x)
        {
            Control.BeginInvoke(() => { Control.Left = (int)x; });
        }

        public void Clear()
        {
            Control.BeginInvoke(() => { Control.Controls.Clear(); });
        }

        public void SetBounds(double x, double y, double w, double h)
        {
            Control.BeginInvoke(() =>
            {
                Control.Left = (int)x;
                Control.Top = (int)y;
                Control.Width = (int)w;
                Control.Height = (int)h;
            });
        }

        public IEventEmitter Resize { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseDown { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseMove { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseUp { get; set; }
    }
}
