#if NET472
using System;
using System.Drawing;
using System.Windows.Forms;
using AlphaTab.UI;

namespace AlphaTab.Platform.CSharp.WinForms
{
    internal class ControlContainer : IContainer
    {
        public Control Control { get; }

        public ControlContainer(Control control)
        {
            Control = control;
        }

        public float Top
        {
            get => Control.Top;
            set => Control.Top = (int)value;
        }

        public float Left
        {
            get => Control.Left;
            set => Control.Left = (int)value;
        }

        public float Width
        {
            get => Control.ClientSize.Width - Control.Padding.Horizontal;
            set => Control.Width = (int)value + Control.Padding.Horizontal;
        }


        public float Height
        {
            get => Control.ClientSize.Height - Control.Padding.Vertical;
            set => Control.Height = (int)value + Control.Padding.Vertical;
        }

        public bool IsVisible => Control.Visible && Control.Width > 0;

        public float ScrollLeft
        {
            get => Control is ScrollableControl scroll ? scroll.AutoScrollPosition.X : 0;
            set
            {
                if (Control is ScrollableControl scroll)
                {
                    scroll.AutoScrollPosition = new Point((int)value, scroll.AutoScrollPosition.Y);
                }
            }
        }

        public float ScrollTop
        {
            get => Control is ScrollableControl scroll ? scroll.VerticalScroll.Value : 0;
            set
            {
                if (Control is ScrollableControl scroll)
                {
                    scroll.AutoScrollPosition = new Point(scroll.AutoScrollPosition.X, (int)value);
                }
            }
        }
        public void AppendChild(IContainer child)
        {
            Control.Controls.Add(((ControlContainer)child).Control);
        }

        public event Action Scroll
        {
            add
            {
                if (Control is ScrollableControl scroll)
                {
                    scroll.Scroll += (sender, args) => value();
                }
            }
            remove
            {
            }
        }

        public event Action Resize
        {
            add
            {
                Control.Resize += (sender, args) => value();
            }
            remove
            {
            }
        }

        public void StopAnimation()
        {
            //Control.BeginAnimation(Canvas.LeftProperty, null);
        }

        public void TransitionToX(double duration, float x)
        {
            // TODO: Animation
            Control.Left = (int)x;

            //Control.BeginAnimation(Canvas.LeftProperty,
            //    new DoubleAnimation(x, new Duration(TimeSpan.FromMilliseconds(duration))));
        }


        public event Action<IMouseEventArgs> MouseDown
        {
            add
            {
                Control.MouseDown += (sender, args) => value(new WinFormsMouseEventArgs(Control, args));
            }
            remove
            {
            }
        }

        public event Action<IMouseEventArgs> MouseMove
        {
            add
            {
                Control.MouseMove += (sender, args) => value(new WinFormsMouseEventArgs(Control, args));
            }
            remove
            {
            }
        }

        public event Action<IMouseEventArgs> MouseUp
        {
            add
            {
                Control.MouseUp += (sender, args) => value(new WinFormsMouseEventArgs(Control, args));
            }
            remove
            {
            }
        }

        public void Clear()
        {
            Control.Controls.Clear();
        }
    }
}
#endif
