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

        public double Width
        {
            get => (float)Control.ActualWidth;
            set => Control.Dispatcher.BeginInvoke((Action)(() => { Control.Width = value; }));
        }


        public double Height
        {
            get => (float)Control.ActualHeight;
            set => Control.Dispatcher.BeginInvoke((Action)(() => { Control.Height = value; }));
        }

        public bool IsVisible => Control.IsVisible && Control.ActualWidth > 0;

        public double ScrollLeft
        {
            get => Control is ScrollViewer scroll ? (float)scroll.HorizontalOffset : 0;

            set
            {
                Control.Dispatcher.BeginInvoke((Action)(() =>
                {
                    if (Control is ScrollViewer scroll)
                    {
                        scroll.ScrollToHorizontalOffset(value);
                    }
                }));
            }
        }

        public double ScrollTop
        {
            get => Control is ScrollViewer scroll ? (float)scroll.VerticalOffset : 0;

            set
            {
                Control.Dispatcher.BeginInvoke((Action)(() =>
                {
                    if (Control is ScrollViewer scroll)
                    {
                        scroll.ScrollToVerticalOffset(value);
                    }
                }));
            }
        }

        public void AppendChild(IContainer child)
        {
            Control.Dispatcher.BeginInvoke((Action)(() =>
            {
                if (Control is Panel p)
                {
                    p.Children.Add(((FrameworkElementContainer)child).Control);
                }
                else if (Control is ScrollViewer s && s.Content is ContentControl sc)
                {
                    sc.Content = ((FrameworkElementContainer)child).Control;
                }
                else if (Control is ScrollViewer ss && ss.Content is Decorator d)
                {
                    d.Child = ((FrameworkElementContainer)child).Control;
                }
                else if (Control is ScrollViewer sss && sss.Content is Panel pp)
                {
                    pp.Children.Add(((FrameworkElementContainer)child).Control);
                }
                else if (Control is ContentControl c)
                {
                    c.Content = ((FrameworkElementContainer)child).Control;
                }
            }));
        }


        private double _targetX = 0;
        public void StopAnimation()
        {
            Control.Dispatcher.BeginInvoke((Action)(() =>
            {
                Control.BeginAnimation(Canvas.LeftProperty, null);
                Canvas.SetLeft(Control, _targetX);
            }));
        }

        public void TransitionToX(double duration, double x)
        {
            _targetX = x;
            Control.Dispatcher.BeginInvoke((Action)(() =>
            {
                Control.BeginAnimation(Canvas.LeftProperty,
                    new DoubleAnimation(x, new Duration(TimeSpan.FromMilliseconds(duration))));
            }));
        }

        public void Clear()
        {
            Control.Dispatcher.BeginInvoke((Action)(() =>
            {
                if (Control is Panel p)
                {
                    p.Children.Clear();
                }
            }));
        }

        public void SetBounds(double x, double y, double w, double h)
        {
            Control.Dispatcher.BeginInvoke((Action)(() =>
            {
                Canvas.SetLeft(Control, x);
                Canvas.SetTop(Control, y);
                Control.Width = w;
                Control.Height = h;
            }));
        }

        public IEventEmitter Resize { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseDown { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseMove { get; set; }
        public IEventEmitterOfT<IMouseEventArgs> MouseUp { get; set; }
    }
}
