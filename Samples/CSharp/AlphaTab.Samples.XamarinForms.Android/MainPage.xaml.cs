using System;
using AlphaTab.Importer;
using AlphaTab.Model;
using SkiaSharp;

namespace AlphaTab.Samples.XamarinForms.Android
{
    public partial class MainPage
    {
        private static Type Deploy = typeof(SKSurface);

        private Score _score;
        public MainPage()
        {
            InitializeComponent();
            BindingContext = this;

            byte[] canon;
            using (var stream = typeof(MainPage).Assembly.GetManifestResourceStream("AlphaTab.Samples.XamarinForms.Android.Resources.Canon.gp5"))
            {
                canon = new byte[stream.Length];
                stream.Read(canon, 0, canon.Length);
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
