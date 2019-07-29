#if ANDROID
using System;
using AlphaTab.UI;
using Android.Animation;
using Android.Views;
using Android.Widget;

namespace AlphaTab.Platform.CSharp.Xamarin.Android
{
    class ViewContainer : IContainer
    {
        public View View { get; set; }

        public ViewContainer(View view)
        {
            View = view;
        }

        public float Top
        {
            get => View.Top;
            set => View.Top = (int)value;
        }

        public float Left
        {
            get => View.Left;
            set => View.Left = (int)value;
        }

        public float Width
        {
            get => View.Width - View.PaddingLeft - View.PaddingRight;
            set => View.LayoutParameters.Width = (int)value + View.PaddingLeft + View.PaddingRight;
        }

        public float Height
        {
            get => View.Height - View.PaddingTop - View.PaddingBottom;
            set => View.LayoutParameters.Height = (int) value + View.PaddingTop + View.PaddingBottom;
        }

        public bool IsVisible => View.Visibility == ViewStates.Visible && View.Width > 0;

        public float ScrollLeft
        {
            get => View is ScrollView scroll ? scroll.ScrollX : 0;
            set
            {
                if (View is ScrollView scroll)
                {
                    scroll.ScrollX = (int)value;
                }
            }
        }

        public float ScrollTop
        {
            get => View is ScrollView scroll ? scroll.ScrollY : 0;
            set
            {
                if (View is ScrollView scroll)
                {
                    scroll.ScrollY = (int)value;
                }
            }
        }

        public void AppendChild(IContainer child)
        {
            if (View is ViewGroup g)
            {
                g.AddView(((ViewContainer)child).View);
            }
        }

        public event Action Scroll
        {
            add
            {
                if (View is ScrollView scroll)
                {
                    scroll.ScrollChange += (sender, args) => value();
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
                View.LayoutChange += (o, e) => value();
            }
            remove
            {
            }
        }

        private ObjectAnimator _animation;

        public void StopAnimation()
        {
            if (_animation != null)
            {
                _animation.Cancel();
                _animation.Dispose();
            }
        }

        public void TransitionToX(double duration, float x)
        {
            _animation = ObjectAnimator.OfFloat(View, "translationX", x);
            _animation.SetDuration((long) duration);
            _animation.Start();
        }


        public event Action<IMouseEventArgs> MouseDown
        {
            add
            {
                View.Touch += (sender, args) =>
                {
                    if (args.Event.PointerCount == 1 && args.Event.Action == MotionEventActions.Down)
                    {
                        value(new AndroidMouseEventArgs(args));
                        args.Handled = true;
                    }
                };
            }
            remove
            {
            }
        }

        public event Action<IMouseEventArgs> MouseMove
        {
            add
            {
                View.Touch += (sender, args) =>
                {
                    if (args.Event.PointerCount == 1 && args.Event.Action == MotionEventActions.Move)
                    {
                        value(new AndroidMouseEventArgs(args));
                    }
                };
            }
            remove
            {
            }
        }

        public event Action<IMouseEventArgs> MouseUp
        {
            add
            {
                View.Touch += (sender, args) =>
                {
                    if (args.Event.PointerCount == 1 && args.Event.Action == MotionEventActions.Up)
                    {
                        value(new AndroidMouseEventArgs(args));
                    }
                };
            }
            remove
            {
            }
        }

        public void Clear()
        {
            if (View is ViewGroup g)
            {
                g.RemoveAllViews();
            }
        }
    }
}
#endif