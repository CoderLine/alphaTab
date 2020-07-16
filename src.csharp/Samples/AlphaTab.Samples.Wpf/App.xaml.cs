using System.Globalization;
using System.Threading;
using System.Windows;
using System.Windows.Markup;
using AlphaTab.Samples.Wpf.ViewModel;

namespace AlphaTab.Samples.Wpf
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App
    {
        public static void InitializeCultures()
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("en-us");
            Thread.CurrentThread.CurrentUICulture = new CultureInfo("en-us");

            FrameworkElement.LanguageProperty.OverrideMetadata(typeof(FrameworkElement), new FrameworkPropertyMetadata(
                XmlLanguage.GetLanguage(CultureInfo.CurrentCulture.IetfLanguageTag)));
        }

        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            ViewModelBase.Initialize();
        }
    }
}
