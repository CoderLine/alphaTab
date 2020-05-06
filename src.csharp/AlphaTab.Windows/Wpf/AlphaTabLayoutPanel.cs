using System.Windows;
using System.Windows.Controls;

namespace AlphaTab.Wpf
{
    internal class AlphaTabLayoutPanel : Panel
    {
        protected override Size MeasureOverride(Size availableSize)
        {
            foreach (UIElement? child in InternalChildren)
            {
                child?.Measure(availableSize);
            }
            return new Size
            {
                Width = double.IsInfinity(availableSize.Width) ? MinWidth : availableSize.Width,
                Height = double.IsInfinity(availableSize.Height) ? MinHeight : availableSize.Height
            };
        }

        protected override Size ArrangeOverride(Size finalSize)
        {
            var xChild = 0.0;
            var yChild = 0.0;

            var rowHeight = 0.0;

            foreach (UIElement? child in InternalChildren)
            {
                if (child != null)
                {
                    child.Arrange(new Rect(xChild, yChild, child.DesiredSize.Width,
                        child.DesiredSize.Height));

                    xChild += child.DesiredSize.Width;
                    if (child.DesiredSize.Height > rowHeight)
                    {
                        rowHeight = child.DesiredSize.Height;
                    }

                    if (xChild >= finalSize.Width)
                    {
                        xChild = 0;
                        yChild += rowHeight;
                        rowHeight = 0;
                    }
                }
            }

            return finalSize;
        }
    }
}
