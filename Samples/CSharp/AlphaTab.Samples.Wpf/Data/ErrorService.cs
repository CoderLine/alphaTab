using System;
using System.Windows;
using AlphaTab.Samples.Wpf.ViewModel;

namespace AlphaTab.Samples.Wpf.Data
{
    /// <summary>
    /// This error service implementation shows errors as messageboxes on the main window
    /// </summary>
    public class ErrorService : IErrorService
    {
        public void OpenFailed(Exception e)
        {
            ViewModelBase.InvokeOnUi(() =>
            {
                MessageBox.Show(Application.Current.MainWindow, e.Message, "An error during opening the file occured",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            });
        }
    }
}