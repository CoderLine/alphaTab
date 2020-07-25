using System.Windows;
using AlphaTab.Samples.Wpf.Data;
using AlphaTab.Samples.Wpf.ViewModel;

namespace AlphaTab.Samples.Wpf
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow
    {
        public MainWindow()
        {
            InitializeComponent();

            // ensure the UI is using en-us as culture
            // we need this culture for correct WPF path string generation
            // in a German culture it could happen that we have a , as a decimal separator.
            App.InitializeCultures();

            // create a our viewmodel for databinding
            var viewModel = new MainViewModel(new DialogService(), new ErrorService());
            DataContext = viewModel;
        }

        private void OnPlayPauseClick(object sender, RoutedEventArgs e)
        {
            TablatureControl.Api.PlayPause();
        }
    }
}
