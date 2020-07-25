using System.Windows;
using AlphaTab.Model;
using AlphaTab.Samples.Wpf.ViewModel;
using Microsoft.Win32;

namespace AlphaTab.Samples.Wpf.Data
{
    /// <summary>
    /// This DialogService implementation opens uses WPF dialogs
    /// </summary>
    public class DialogService : IDialogService
    {
        public string OpenFile()
        {
            var dialog = new OpenFileDialog
            {
                Filter = "Supported Files (*.gp3, *.gp4, *.gp5, *.gpx, *.gp)|*.gp3;*.gp4;*.gp5;*.gpx;*.gp"
            };
            if (dialog.ShowDialog(Application.Current.MainWindow).GetValueOrDefault())
            {
                return dialog.FileName;
            }
            return null;
        }

        public void ShowScoreInfo(Score score)
        {
            var viewModel = new ScoreInfoViewModel(score);
            var window = new ScoreInfoWindow();
            window.DataContext = viewModel;
            window.ShowDialog();
        }
    }
}
