using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using AlphaTab.Model;
using Color = System.Windows.Media.Color;

namespace AlphaTab.Wpf
{
    /// <summary>
    /// A WPF UI control to display an instance of alphaTab via <see cref="Image"/>
    /// controls.
    /// </summary>
    public class AlphaTab : Control
    {
        static AlphaTab()
        {
            DefaultStyleKeyProperty.OverrideMetadata(typeof(AlphaTab),
                new FrameworkPropertyMetadata(typeof(AlphaTab)));
        }

        private ScrollViewer _scrollView;

        #region Tracks

        /// <summary>
        /// Identifies the <see cref="Tracks"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty TracksProperty =
            DependencyProperty.Register("Tracks", typeof(IEnumerable<Track>), typeof(AlphaTab),
                new PropertyMetadata(default(IEnumerable<Track>), OnTracksChanged));

        private static void OnTracksChanged(DependencyObject d,
            DependencyPropertyChangedEventArgs e)
        {
            var observable = e.OldValue as INotifyCollectionChanged;
            if (observable != null)
            {
                ((AlphaTab) d).UnregisterObservableCollection(observable);
            }

            observable = e.NewValue as INotifyCollectionChanged;
            if (observable != null)
            {
                ((AlphaTab) d).RegisterObservableCollection(observable);
            }

            ((AlphaTab) d).RenderTracks();
        }

        private void RegisterObservableCollection(INotifyCollectionChanged collection)
        {
            collection.CollectionChanged += OnTracksChanged;
        }

        private void UnregisterObservableCollection(INotifyCollectionChanged collection)
        {
            collection.CollectionChanged -= OnTracksChanged;
        }

        private void OnTracksChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            RenderTracks();
        }

        /// <see cref="AlphaTabApiBase{TSettings}.Tracks"/>
        public IEnumerable<Track> Tracks
        {
            get => (IEnumerable<Track>) GetValue(TracksProperty);
            set => SetValue(TracksProperty, value);
        }

        #endregion

        #region Settings

        /// <summary>
        /// Identifies the <see cref="Settings"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty SettingsProperty = DependencyProperty.Register(
            "Settings", typeof(Settings), typeof(AlphaTab),
            new PropertyMetadata(new Settings(), OnSettingsChanged));

        private static void OnSettingsChanged(DependencyObject d,
            DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab) d).SettingsChanged?.Invoke((Settings) e.NewValue);
        }

        /// <see cref="AlphaTabApiBase{TSettings}.Settings"/>
        public Settings Settings
        {
            get => (Settings) GetValue(SettingsProperty);
            set => SetValue(SettingsProperty, value);
        }

        #endregion

        #region BarCursorFill

        /// <summary>
        /// Identifies the <see cref="BarCursorFill"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty BarCursorFillProperty =
            DependencyProperty.Register(
                "BarCursorFill", typeof(Brush), typeof(AlphaTab),
                new PropertyMetadata(new SolidColorBrush(Color.FromArgb(64, 255, 242, 0))));

        /// <summary>
        /// Gets or sets the brush used for filling the bar cursor.
        /// </summary>
        public Brush BarCursorFill
        {
            get => (Brush) GetValue(BarCursorFillProperty);
            set => SetValue(BarCursorFillProperty, value);
        }

        #endregion

        #region BeatCursorFill

        /// <summary>
        /// Identifies the <see cref="BeatCursorFill"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty BeatCursorFillProperty =
            DependencyProperty.Register(
                "BeatCursorFill", typeof(Brush), typeof(AlphaTab),
                new PropertyMetadata(new SolidColorBrush(Color.FromArgb(191, 64, 64, 255))));

        /// <summary>
        /// Gets or sets the brush used for filling the beat cursor.
        /// </summary>
        public Brush BeatCursorFill
        {
            get => (Brush) GetValue(BeatCursorFillProperty);
            set => SetValue(BeatCursorFillProperty, value);
        }

        #endregion

        #region SelectionFill

        /// <summary>
        /// Identifies the <see cref="SelectionFill"/> dependency property.
        /// </summary>
        public static readonly DependencyProperty SelectionCursorFillProperty =
            DependencyProperty.Register(
                "SelectionFill", typeof(Brush), typeof(AlphaTab),
                new PropertyMetadata(new SolidColorBrush(Color.FromArgb(25, 64, 64, 255))));

        /// <summary>
        /// Gets or sets the brush used to fill the elements that highlight the selected area.
        /// </summary>
        public Brush SelectionFill
        {
            get => (Brush) GetValue(SelectionCursorFillProperty);
            set => SetValue(SelectionCursorFillProperty, value);
        }

        #endregion

        /// <summary>
        /// Gets the alphaTab API object.
        /// </summary>
        public AlphaTabApiBase<AlphaTab> Api { get; private set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="AlphaTab"/> class.
        /// </summary>
        public AlphaTab()
        {
            _scrollView = null!;
            Api = null!;

            SnapsToDevicePixels = true;
            Settings = new Settings();
            Settings.Player.EnablePlayer = true;
            Settings.Player.EnableCursor = true;
        }

        /// <inheritdoc />
        public override void OnApplyTemplate()
        {
            base.OnApplyTemplate();
            _scrollView = (ScrollViewer) Template.FindName("PART_ScrollView", this);
            Api = new AlphaTabApiBase<AlphaTab>(new WpfUiFacade(_scrollView), this);
        }

        /// <summary>
        /// Initiates a rendering of the currently configured tracks if the API object is ready.
        /// </summary>
        public void RenderTracks()
        {
            if (Api == null)
            {
                return;
            }

            if (Tracks == null)
            {
                return;
            }

            Score? score = null;
            var trackIndexes = new List<double>();
            foreach (var track in Tracks)
            {
                if (score == null)
                {
                    score = track.Score;
                }

                if (score == track.Score)
                {
                    trackIndexes.Add(track.Index);
                }
            }

            if (score != null)
            {
                Api.RenderScore(score, trackIndexes);
            }
        }

        /// <summary>
        /// Fired when the settings object changed.
        /// </summary>
        /// <remarks>
        /// Only fires when the whole object changes but not if individual properties changed.
        /// </remarks>
        public event Action<Settings>? SettingsChanged;
    }
}
