using AlphaTab.Collections;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.Util;

namespace AlphaTab
{
    /// <summary>
    /// This public class contains instance specific settings for alphaTab
    /// </summary>
    public partial class Settings
    {
        /// <summary>
        /// Sets the zoom level of the rendered notation
        /// </summary>
        public float Scale { get; set; }

        /// <summary>
        /// The engine which should be used to render the the tablature.
        /// <ul>
        ///  <li><strong>default</strong> - Platform specific default engine</li>
        ///  <li><strong>html5</strong> - HTML5 Canvas</li>
        ///  <li><strong>svg</strong> -  SVG </li>
        /// </ul>
        /// </summary>
        public string Engine { get; set; }

        /// <summary>
        /// The layout specific settings
        /// </summary>
        public LayoutSettings Layout { get; set; }

        /// <summary>
        /// Specific settings for importers. Keys are specific for the importers.
        /// <strong>General</strong>
        /// <ul>
        ///  <li><strong>encoding</strong> - The text encoding to use when decoding strings (string, default:utf-8)</li>
        /// </ul>
        /// <strong>MusicXML</strong>
        /// <ul>
        ///  <li><strong>musicxmlMergePartGroups</strong> - If part-groups should be merged into a single track (boolean, default:false)</li>
        /// </ul>
        /// </summary>
        public FastDictionary<string, object> ImporterSettings { get; set; }

        /// <summary>
        /// The default stretch force to use for layouting.
        /// </summary>
        public float StretchForce { get; set; }

        /// <summary>
        /// Forces the fingering rendering to use always the piano finger stýle where
        /// fingers are rendered as 1-5 instead of p,i,m,a,c and T,1,2,3,4.
        /// </summary>
        public bool ForcePianoFingering { get; set; }

        /// <summary>
        /// The staves that should be shown in the music sheet.
        /// This is one of the profiles registered in the <see cref="Environment.StaveProfiles"/>
        /// </summary>
        public StaveSettings Staves { get; set; }

        /// <summary>
        /// The transposition pitch offsets for the individual tracks.
        /// They apply to rendering and playback.
        /// </summary>
        public int[] TranspositionPitches { get; set; }

        /// <summary>
        /// The transposition pitch offsets for the individual tracks.
        /// They apply to rendering only.
        /// </summary>
        public int[] DisplayTranspositionPitches { get; set; }

        /// <summary>
        /// The log level to use within alphaTab
        /// </summary>
        public LogLevel LogLevel { get; set; }

        /// <summary>
        /// If set to true the guitar tabs on grace beats are rendered smaller.
        /// </summary>
        public bool SmallGraceTabNotes { get; set; }

        /// <summary>
        /// If set to true bend arrows expand to the end of the last tied note
        /// of the string. Otherwise they end on the next beat.
        /// </summary>
        public bool ExtendBendArrowsOnTiedNotes { get; set; }

        /// <summary>
        /// If set to true the note heads on tied notes
        /// will have parenthesis if they are preceeded by bends.
        /// </summary>
        public bool ShowParenthesisForTiedBends { get; set; }

        /// <summary>
        /// If set to true a tab number will be shown in case
        /// a bend is increased on a tied note.
        /// </summary>
        public bool ShowTabNoteOnTiedBend { get; set; }

        /// <summary>
        /// Gets or sets the mode to use for display and play music notation elements.
        /// </summary>
        public DisplayMode DisplayMode { get; set; }

        /// <summary>
        /// Gets or sets the fingering mode to use.
        /// </summary>
        public FingeringMode FingeringMode { get; set; }

        /// <summary>
        /// If set to true, 0 is shown on dive whammy bars.
        /// </summary>
        public bool ShowZeroOnDiveWhammy { get; set; }

        /// <summary>
        /// If set to true, line effects (like w/bar, let-ring etc)
        /// are drawn until the end of the beat instead of the start.
        /// </summary>
        public bool ExtendLineEffectsToBeatEnd { get; set; }

        /// <summary>
        /// Gets or sets the settings on how the vibrato audio is generated.
        /// </summary>
        public VibratoPlaybackSettings Vibrato { get; set; }

        /// <summary>
        /// Gets or sets whether the triplet feel should be applied/played during audio playback.
        /// </summary>
        public bool PlayTripletFeel { get; set; }

        /// <summary>
        /// Gets or sets the height for slurs. The factor is multiplied with the a logarithmic distance
        /// between slur start and end.
        /// </summary>
        public float SlurHeight { get; set; }

        /// <summary>
        /// Gets or sets the bend duration in milliseconds for songbook bends.
        /// </summary>
        public int SongBookBendDuration { get; set; }

        /// <summary>
        /// Gets or sets the duration of whammy dips in milliseconds for songbook whammys.
        /// </summary>
        public int SongBookDipDuration { get; set; }

        /// <summary>
        /// Gets or sets whether in the <see cref="BoundsLookup"/> also the
        /// position and area of each individual note is provided.
        /// </summary>
        public bool IncludeNoteBounds { get; set; }

        /// <summary>
        /// Gets or sets whether the rendering should be done in a worker if possible.
        /// </summary>
        public bool UseWorkers { get; set; }

        /// <summary>
        /// Gets or sets whether the player should be enabled.
        /// </summary>
        public bool EnablePlayer { get; set; }

        /// <summary>
        /// Gets or sets whether playback cursors should be displayed.
        /// </summary>
        public bool EnableCursor { get; set; }

        /// <summary>
        /// Gets or sets the width of the beat cursor in pixels.
        /// </summary>
        public int BeatCursorWidth { get; set; }

        /// <summary>
        /// Gets or sets the X-offset to add when scrolling.
        /// </summary>
        public int ScrollOffsetX
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the Y-offset to add when scrolling
        /// </summary>
        public int ScrollOffsetY
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the mode how to scroll.
        /// </summary>
        public ScrollMode ScrollMode
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets how fast the scrolling to the new position should happen (in milliseconds)
        /// </summary>
        public int ScrollSpeed
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the resources used during rendering. This defines all fonts and colors used.
        /// </summary>
        public RenderingResources RenderingResources { get; set; }

        /// <summary>
        /// Gets the default settings for the songbook display mode.
        /// </summary>
        public static Settings SongBook
        {
            get
            {
                var settings = Defaults;
                settings.DisplayMode = DisplayMode.SongBook;
                settings.ApplySongBookDefaults();
                return settings;
            }
        }

        private void ApplySongBookDefaults()
        {
            SmallGraceTabNotes = false;
            FingeringMode = FingeringMode.SingleNoteEffectBand;
            ExtendBendArrowsOnTiedNotes = false;
            ShowParenthesisForTiedBends = false;
            ShowTabNoteOnTiedBend = false;
            ShowZeroOnDiveWhammy = true;
        }

        /// <summary>
        /// Gets the default settings.
        /// </summary>
        public static Settings Defaults
        {
            get
            {
                var settings = new Settings();

                settings.Scale = 1.0f;
                settings.StretchForce = 1;
                settings.Engine = "default";
                settings.TranspositionPitches = new int[0];
                settings.DisplayTranspositionPitches = new int[0];
                settings.SmallGraceTabNotes = true;
                settings.ExtendBendArrowsOnTiedNotes = true;
                settings.ShowParenthesisForTiedBends = true;
                settings.ShowTabNoteOnTiedBend = true;
                settings.DisplayMode = DisplayMode.GuitarPro;
                settings.FingeringMode = FingeringMode.Score;
                settings.ShowZeroOnDiveWhammy = false;
                settings.ExtendLineEffectsToBeatEnd = false;
                settings.SlurHeight = 7f;

                settings.ImporterSettings = new FastDictionary<string, object>();

                settings.Layout = LayoutSettings.Defaults;

                settings.Staves = new StaveSettings("default");
                settings.LogLevel = LogLevel.Info;

                settings.Vibrato = new VibratoPlaybackSettings();
                settings.Vibrato.NoteSlightAmplitude = 2;
                settings.Vibrato.NoteWideAmplitude = 2;
                settings.Vibrato.NoteSlightLength = 480;
                settings.Vibrato.NoteWideLength = 480;

                settings.Vibrato.BeatSlightAmplitude = 3;
                settings.Vibrato.BeatWideAmplitude = 3;
                settings.Vibrato.BeatSlightLength = 240;
                settings.Vibrato.BeatWideLength = 240;

                settings.PlayTripletFeel = true;

                settings.SongBookBendDuration = 75;
                settings.SongBookDipDuration = 150;
                settings.IncludeNoteBounds = false;

                settings.UseWorkers = true;
                settings.BeatCursorWidth = 3;
                settings.ScrollMode = ScrollMode.Continuous;
                settings.ScrollSpeed = 300;

                settings.RenderingResources = new RenderingResources();

                SetDefaults(settings);

                return settings;
            }
        }
    }
}
