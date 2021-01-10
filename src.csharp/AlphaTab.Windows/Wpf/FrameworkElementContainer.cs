using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Animation;
using AlphaTab.Platform;

namespace AlphaTab.Wpf
{
    internal class FrameworkElementContainer : IContainer
    {
        public FrameworkElement Control { get; }

        public FrameworkElementContainer(FrameworkElement control)
        {
            Control = control;

            Resize = new DelegatedEventEmitter(
                value => { Control.SizeChanged += (sender, args) => value(); },
                value => { }
            );

            MouseDown = new DelegatedEventEmitter<IMouseEventArgs>(
                value =>
                {
                    Control.MouseDown += (sender, args) => value(new WpfMouseEventArgs(args));
                },
                value => { }
            );

            MouseMove = new DelegatedEventEmitter<IMouseEventArgs>(
                value =>
                {
                    Control.MouseMove += (sender, args) => value(new WpfMouseEventArgs(args));
                },
                value => { }
            );

            MouseUp = new DelegatedEventEmitter<IMouseEventArgs>(
                value =>
                {
                    Control.MouseUp += (sender, args) => value(new WpfMouseEventArgs(args));
                },
                value => { }
            );
        }

        public double Top
        {
            get => (float) Canvas.GetTop(Control);
            set => Canvas.SetTop(Control, value);
        }

        public double Left
        {
            get => (float) Canvas.GetLeft(Control);
            set => Canvas.SetLeft(Control, value);
        }

        public double Width
        {
            get => (float) Control.ActualWidth;
            set => Control.Width = value;
        }


        public double Height
        {
            get => (float) Control.ActualHeight;
            set => Control.Height = value;
        }

        public bool IsVisible => Control.IsVisible && Control.ActualWidth > 0;

        public double ScrollLeft
        {
            get => Control is ScrollViewer scroll ? (float) scroll.HorizontalOffset : 0;

            set
            {
                if (Control is ScrollViewer scroll)
                {
                    scroll.ScrollToHorizontalOffset(value);
                }
            }
        }

        public double ScrollTop
        {
            get => Control is ScrollViewer scroll ? (float) scroll.VerticalOffset : 0;

            set
            {
                if (Control is ScrollViewer scroll)
                {
                    scroll.ScrollToVerticalOffset(value);
                }
            }
        }

        public void AppendChild(IContainer child)
        {
            if (Control is Panel p)
            {
                p.Children.Add(((FrameworkElementContainer) child).Control);
            }
            else if (Control is ScrollViewer s && s.Content is ContentControl sc)
            {
                sc.Content = ((FrameworkElementContainer) child).Control;
            }
            else if (Control is ScrollViewer ss && ss.Content is Decorator d)
            {
                d.Child = ((FrameworkElementContainer) child).Control;
            }
            else if (Control is ScrollViewer sss && sss.Content is Panel pp)
            {
                pp.Children.Add(((FrameworkElementContainer) child).Control);
            }
            else if (Control is ContentControl c)
            {
                c.Content = ((FrameworkElementContainer) child).Control;
            }
        }


        public void StopAnimation()
        {
            Control.BeginAnimation(Canvas.LeftProperty, null);
        }

        public void TransitionToX(double duration, double x)
        {
            Control.BeginAnimation(Canvas.LeftProperty,
                new DoubleAnimation(x, new Duration(TimeSpan.FromMilliseconds(duration))));
        }


        public void Clear()
        {
            if (Control is Panel p)
            {
                p.Children.Clear();
            }
        }

        public IEventEmitter Resize { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseDown { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseMove { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseUp { get; set; }
    }
}
