using Android.App;
using Android.Content.PM;
using Android.OS;
using SkiaSharp;

namespace AlphaTab.Samples.XamarinForms.Android
{
	[Activity (Label = "AlphaTab.Samples.XamarinForms", Icon = "@drawable/icon", Theme="@style/MainTheme", MainLauncher = true, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation)]
	public class MainActivity : global::Xamarin.Forms.Platform.Android.FormsAppCompatActivity
	{
		protected override void OnCreate (Bundle bundle)
		{
			TabLayoutResource = Resource.Layout.Tabbar;
			ToolbarResource = Resource.Layout.Toolbar;

            base.OnCreate (bundle);
		    var newImage = SKSurface.Create((int)30, (int)30, SKImageInfo.PlatformColorType, SKAlphaType.Premul);


            global::Xamarin.Forms.Forms.Init (this, bundle);
			LoadApplication (new App ());
		}
	}
}

