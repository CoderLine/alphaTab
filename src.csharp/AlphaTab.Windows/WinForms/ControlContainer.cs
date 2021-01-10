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
                    Control.MouseDown += (sender, args) => value(new WinFormsMouseEventArgs(Control, args));
                },
                value => { }
            );

            MouseMove = new DelegatedEventEmitter<IMouseEventArgs>(
                value =>
                {
                    Control.MouseMove += (sender, args) => value(new WinFormsMouseEventArgs(Control, args));
                },
                value => { }
            );

            MouseUp = new DelegatedEventEmitter<IMouseEventArgs>(
                value =>
                {
                    Control.MouseUp += (sender, args) => value(new WinFormsMouseEventArgs(Control, args));
                },
                value => { }
            );
        }

        public double Top
        {
            get => Control.Top;
            set => Control.Top = (int)value;
        }

        public double Left
        {
            get => Control.Left;
            set => Control.Left = (int)value;
        }

        public double Width
        {
            get => Control.ClientSize.Width - Control.Padding.Horizontal;
            set => Control.Width = (int)value + Control.Padding.Horizontal;
        }


        public double Height
        {
            get => Control.ClientSize.Height - Control.Padding.Vertical;
            set => Control.Height = (int)value + Control.Padding.Vertical;
        }

        public bool IsVisible => Control.Visible && Control.Width > 0;

        public double ScrollLeft
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

        public double ScrollTop
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

        public void StopAnimation()
        {
            //Control.BeginAnimation(Canvas.LeftProperty, null);
        }

        public void TransitionToX(double duration, double x)
        {
            // TODO: Animation
            Control.Left = (int)x;

            //Control.BeginAnimation(Canvas.LeftProperty,
            //    new DoubleAnimation(x, new Duration(TimeSpan.FromMilliseconds(duration))));
        }

        public void Clear()
        {
            Control.Controls.Clear();
        }

        public IEventEmitter Resize { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseDown { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseMove { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseUp { get; set; }
    }
}
