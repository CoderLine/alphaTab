using System.Windows;
using System.Windows.Input;

namespace AlphaTab.Samples.Wpf
{
    /// <summary>
    /// Interaction logic for ScoreInfoWindow.xaml
    /// </summary>
    public partial class ScoreInfoWindow
    {
        public ScoreInfoWindow()
        {
            InitializeComponent();
        }

        private void OnOkClick(object sender, RoutedEventArgs e)
        {
            DialogResult = true;
        }

        protected override void OnPreviewKeyDown(KeyEventArgs e)
        {
            base.OnPreviewKeyDown(e);
            if (e.Key == Key.Escape)
            {
                DialogResult = false;
                e.Handled = true;
            }
        }

    }
}
