using System.IO;
using AlphaTab.Importer;
using AlphaTab.Model;
using Android.App;
using Android.Content;
using Android.OS;
using Android.Util;
using Android.Views;

namespace AlphaTab.Samples.XamarinNative.Android
{
    [Activity(Label = "AlphaTab.Samples.XamarinNative.Android", MainLauncher = true, Icon = "@drawable/icon")]
    public class MainActivity : Activity
    {
        private Score _score;

        private Platform.CSharp.Xamarin.Android.AlphaTab _alphaTabControl;

        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);

            ActionBar.Hide();

            SetContentView(Resource.Layout.Main);

            _alphaTabControl = FindViewById<Platform.CSharp.Xamarin.Android.AlphaTab>(Resource.Id.AlphaTabControl);
            
            byte[] canon;
            using (var stream = Assets.Open("Canon.gp5"))
            {
                using (var ms = new MemoryStream())
                {
                    stream.CopyTo(ms);
                    canon = ms.ToArray();
                }
            }
            LoadScore(canon);
        }

        private void LoadScore(byte[] bytes)
        {
            _score = ScoreLoader.LoadScoreFromBytes(bytes);
            _alphaTabControl.Tracks = new[]
            {
                _score.Tracks[0]
            };
        }
    }
}

