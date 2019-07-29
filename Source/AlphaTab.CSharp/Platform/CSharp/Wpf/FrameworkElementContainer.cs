#if NET472
using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Animation;
using AlphaTab.UI;

namespace AlphaTab.Platform.CSharp.Wpf
{
    internal class FrameworkElementContainer : IContainer
    {
        public FrameworkElement Control { get; }

        public FrameworkElementContainer(FrameworkElement control)
        {
            Control = control;
        }

        public float Top
        {
            get => (float)Canvas.GetTop(Control);
            set => Canvas.SetTop(Control, value);
        }

        public float Left
        {
            get => (float)Canvas.GetLeft(Control);
            set => Canvas.SetLeft(Control, value);
        }

        public float Width
        {
            get => (float)Control.ActualWidth;
            set => Control.Width = value;
        }


        public float Height
        {
            get => (float)Control.ActualHeight;
            set => Control.Height = value;
        }

        public bool IsVisible => Control.IsVisible && Control.ActualWidth > 0;

        public float ScrollLeft
        {
            get => Control is ScrollViewer scroll ? (float)scroll.HorizontalOffset : 0;
            set
            {
                if (Control is ScrollViewer scroll)
                {
                    scroll.ScrollToHorizontalOffset(value);
                }
            }
        }

        public float ScrollTop
        {
            get => Control is ScrollViewer scroll ? (float)scroll.VerticalOffset : 0;
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
        }

        public event Action Scroll
        {
            add
            {
                if (Control is ScrollViewer scroll)
                {
                    scroll.ScrollChanged += (sender, args) => value();
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
                Control.SizeChanged += (sender, args) => value();
            }
            remove
            {
            }
        }

        public void StopAnimation()
        {
            Control.BeginAnimation(Canvas.LeftProperty, null);
        }

        public void TransitionToX(double duration, float x)
        {
            Control.BeginAnimation(Canvas.LeftProperty,
                new DoubleAnimation(x, new Duration(TimeSpan.FromMilliseconds(duration))));
        }


        public event Action<IMouseEventArgs> MouseDown
        {
            add
            {
                Control.MouseDown += (sender, args) => value(new WpfMouseEventArgs(args));
            }
            remove
            {
            }
        }

        public event Action<IMouseEventArgs> MouseMove
        {
            add
            {
                Control.MouseMove += (sender, args) => value(new WpfMouseEventArgs(args));
            }
            remove
            {
            }
        }

        public event Action<IMouseEventArgs> MouseUp
        {
            add
            {
                Control.MouseUp += (sender, args) => value(new WpfMouseEventArgs(args));
            }
            remove
            {
            }
        }

        public void Clear()
        {
            if (Control is Panel p)
            {
                p.Children.Clear();
            }
        }
    }
}
#endif
