#if ANDROID
using Xamarin.Forms;

namespace AlphaTab.Platform.CSharp.Xamarin.Forms
{
    class AlphaTabLayoutPanel : Layout<View>
    {
        protected override SizeRequest OnMeasure(double widthConstraint, double heightConstraint)
        {
            foreach (var child in Children)
            {
                child.Measure(double.PositiveInfinity, double.PositiveInfinity);
            }
            return new SizeRequest(new Size(WidthRequest, HeightRequest));
        }

        protected override void LayoutChildren(double x, double y, double width, double height)
        {
            var xChild = x;
            var yChild = y;

            var rowHeight = 0.0;

            foreach (var child in Children)
            {
                LayoutChildIntoBoundingRegion(child, new Rectangle(new Point(xChild, yChild), new Size(child.WidthRequest, child.HeightRequest)));

                xChild += child.WidthRequest;
                if (child.HeightRequest > rowHeight)
                {
                    rowHeight = child.HeightRequest;
                }

                if (xChild >= width)
                {
                    xChild = x;
                    yChild += rowHeight;
                    rowHeight = 0;
                }
            }
        }
    }
}
#endif
