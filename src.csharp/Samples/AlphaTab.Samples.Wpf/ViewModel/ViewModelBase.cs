using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Threading;
using JetBrains.Annotations;

namespace AlphaTab.Samples.Wpf.ViewModel
{
    public class ViewModelBase : INotifyPropertyChanged
    {
        public static Dispatcher UiDispatcher { get; private set; }

        public static void Initialize()
        {
            UiDispatcher = Dispatcher.CurrentDispatcher;
        }

        public static void InvokeOnUi(Action action)
        {
            if (UiDispatcher.CheckAccess())
            {
                action();
            }
            else
            {
                UiDispatcher.BeginInvoke(action);
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        [NotifyPropertyChangedInvocator]
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            var handler = PropertyChanged;
            if (handler != null)
            {
                InvokeOnUi(() =>
                {
                    handler(this, new PropertyChangedEventArgs(propertyName));
                });
            }
        }
    }
}
