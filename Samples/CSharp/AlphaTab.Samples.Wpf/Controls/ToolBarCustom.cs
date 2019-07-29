using System.Windows;
using System.Windows.Controls;

namespace AlphaTab.Samples.Wpf.Controls
{
    /// <summary>
    /// A custom toolbar with hidden overflow button
    /// </summary>
    public class ToolBarCustom : ToolBar
    {
        public ToolBarCustom()
        {
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            var overflowGrid = Template.FindName("OverflowGrid", this) as FrameworkElement;
            if (overflowGrid != null)
            {
                overflowGrid.Visibility = Visibility.Collapsed;
            }
        }
    }
}
