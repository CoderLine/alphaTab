using System;
using System.IO;
using AlphaTab.Importer;
using AlphaTab.Model;
using Android.App;
using Java.IO;
using SkiaSharp;
using Xamarin.Forms;

namespace AlphaTab.Samples.XamarinForms.Android
{
    public partial class MainPage
    {
        private Score _score;
        public MainPage()
        {
            InitializeComponent();
            BindingContext = this;

            byte[] canon;
            using (var stream = Forms.Context.Assets.Open("Canon.gp5"))
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
            AlphaTabControl.Tracks = new[]
            {
                _score.Tracks[0]
            };
        }
    }
}
