#if ANDROID
using Android.Content;
using Android.Views;

namespace AlphaTab.Platform.CSharp.Xamarin.Android
{
    class AlphaTabLayoutPanel : ViewGroup
    {
        public AlphaTabLayoutPanel(Context context) : base(context)
        {
        }

        protected override void OnMeasure(int widthMeasureSpec, int heightMeasureSpec)
        {
            var childCount = ChildCount;
            for (int i = 0; i < childCount; i++)
            {
                var child = GetChildAt(i);
                child.Measure(widthMeasureSpec, heightMeasureSpec);
            }

            SetMeasuredDimension(MinimumWidth, MinimumHeight);
        }

        protected override void OnLayout(bool changed, int l, int t, int r, int b)
        {
            var xChild = l;
            var yChild = t;

            var rowHeight = 0;
            var childCount = ChildCount;

            for (int i = 0; i < childCount; i++)
            {
                var child = GetChildAt(i);
                child.Layout(xChild, yChild, xChild + child.MeasuredWidth, yChild + child.MeasuredHeight);

                xChild += child.MeasuredWidth;
                if (child.MeasuredHeight > rowHeight)
                {
                    rowHeight = child.MeasuredHeight;
                }

                if (xChild >= r)
                {
                    xChild = l;
                    yChild += rowHeight;
                    rowHeight = 0;
                }
            }
        }
    }
}
#endif
