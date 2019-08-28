using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.Util;

namespace AlphaTab
{
    /// <summary>
    /// The core settings control the general behavior of alphatab like
    /// what modules are active.
    /// </summary>
    public partial class CoreSettings
    {
        /// <summary>
        /// The engine which should be used to render the the tablature.
        /// <ul>
        ///  <li><strong>default</strong> - Platform specific default engine</li>
        ///  <li><strong>html5</strong> - HTML5 Canvas</li>
        ///  <li><strong>svg</strong> -  SVG </li>
        /// </ul>
        /// </summary>
        public string Engine { get; set; } = "default";

        /// <summary>
        /// The log level to use within alphaTab
        /// </summary>
        public LogLevel LogLevel { get; set; } = LogLevel.Info;

        /// <summary>
        /// Gets or sets whether the rendering should be done in a worker if possible.
        /// </summary>
        public bool UseWorkers { get; set; } = true;

        /// <summary>
        /// Gets or sets whether in the <see cref="BoundsLookup"/> also the
        /// position and area of each individual note is provided.
        /// </summary>
        public bool IncludeNoteBounds { get; set; } = false;
    }

    /// <summary>
    /// Lists all layout modes that are supported.
    /// </summary>
    public enum LayoutMode
    {
        /// <summary>
        /// Bars are aligned in rows using a fixed width.
        /// </summary>
        Page,

        /// <summary>
        /// Bars are aligned horizontally in one row
        /// </summary>
        Horizontal
    }

    /// <summary>
    /// Lists all stave profiles controlling which staves are shown.
    /// </summary>
    public enum StaveProfile
    {
        /// <summary>
        /// The profile is auto detected by the track configurations.
        /// </summary>
        Default,

        /// <summary>
        /// Standard music notation and guitar tablature are rendered.
        /// </summary>
        ScoreTab,

        /// <summary>
        /// Only standard music notation is rendered.
        /// </summary>
        Score,

        /// <summary>
        /// Only guitar tablature is rendered.
        /// </summary>
        Tab,

        /// <summary>
        /// Only guitar tablature is rendered, but also rests and time signatures are not shown.
        /// This profile is typically used in mulit-track scenarios.
        /// </summary>
        TabMixed,
    }

    /// <summary>
    /// The display settings control how the general layout and display of alphaTab is done.
    /// </summary>
    public class DisplaySettings
    {
        /// <summary>
        /// Sets the zoom level of the rendered notation
        /// </summary>
        public float Scale { get; set; } = 1.0f;

        /// <summary>
        /// The default stretch force to use for layouting.
        /// </summary>
        public float StretchForce { get; set; } = 1.0f;

        /// <summary>
        /// The layouting mode used to arrange the the notation.
        /// </summary>
        public LayoutMode LayoutMode { get; set; } = LayoutMode.Page;

        /// <summary>
        /// The stave profile to use.
        /// </summary>
        public StaveProfile StaveProfile { get; set; } = StaveProfile.Default;

        /// <summary>
        /// Limit the displayed bars per row.
        /// </summary>
        public int BarsPerRow { get; set; } = -1;

        /// <summary>
        /// The bar start number to start layouting with. Note that this is the bar number and not an index!
        /// </summary>
        public int StartBar { get; set; } = 1;

        /// <summary>
        /// The amount of bars to render overall.
        /// </summary>
        public int BarCount { get; set; } = -1;

        /// <summary>
        /// The number of bars that should be rendered per partial. This setting is not used by all layouts.
        /// </summary>
        public int BarCountPerPartial { get; set; } = 10;

        /// <summary>
        /// Gets or sets the resources used during rendering. This defines all fonts and colors used.
        /// </summary>
        public RenderingResources RenderingResources { get; } = new RenderingResources();

        /// <summary>
        /// Gets or sets the padding between the music notation and the border.
        /// </summary>
        public float[] Padding { get; set; }
    }

    /// <summary>
    /// Lists the different modes on how rhythm notation is shown on the tab staff.
    /// </summary>
    public enum TabRhythmMode
    {
        /// <summary>
        /// Rhythm notation is hidden.
        /// </summary>
        Hidden,

        /// <summary>
        /// Rhythm notation is shown with individual beams per beat.
        /// </summary>
        ShowWithBeams,

        /// <summary>
        /// Rhythm notation is shown and behaves like normal score notation with connected bars.
        /// </summary>
        ShowWithBars
    }

    /// <summary>
    /// The notation settings control how various music notation elements are shown and behaving
    /// </summary>
    public class NotationSettings
    {
        /// <summary>
        /// Gets or sets the mode to use for display and play music notation elements.
        /// </summary>
        public NotationMode NotationMode { get; set; } = NotationMode.GuitarPro;

        /// <summary>
        /// Gets or sets the fingering mode to use.
        /// </summary>
        public FingeringMode FingeringMode { get; set; } = FingeringMode.ScoreDefault;

        /// <summary>
        /// Whether to display the song information or not.
        /// </summary>
        public bool HideInfo { get; set; } = false;

        /// <summary>
        /// Whether to display the tuning information or not.
        /// </summary>
        public bool HideTuning { get; set; } = false;

        /// <summary>
        /// Whether to display the track names in the accolade or not.
        /// </summary>
        public bool HideTrackNames { get; set; } = false;

        /// <summary>
        /// Whether to display the chord diagrams or not.
        /// </summary>
        public bool HideChordDiagram { get; set; } = false;

        /// <summary>
        /// Whether to show rhythm notation in the guitar tablature.
        /// </summary>
        public TabRhythmMode RhythmMode { get; set; } = TabRhythmMode.Hidden;

        /// <summary>
        /// The height of the rythm bars.
        /// </summary>
        public float RhythmHeight { get; set; } = 15;

        /// <summary>
        /// The transposition pitch offsets for the individual tracks.
        /// They apply to rendering and playback.
        /// </summary>
        public int[] TranspositionPitches { get; set; } = new int[0];

        /// <summary>
        /// The transposition pitch offsets for the individual tracks.
        /// They apply to rendering only.
        /// </summary>
        public int[] DisplayTranspositionPitches { get; set; } = new int[0];

        /// <summary>
        /// If set to true the guitar tabs on grace beats are rendered smaller.
        /// </summary>
        public bool SmallGraceTabNotes { get; set; } = true;

        /// <summary>
        /// If set to true bend arrows expand to the end of the last tied note
        /// of the string. Otherwise they end on the next beat.
        /// </summary>
        public bool ExtendBendArrowsOnTiedNotes { get; set; } = true;

        /// <summary>
        /// If set to true the note heads on tied notes
        /// will have parenthesis if they are preceeded by bends.
        /// </summary>
        public bool ShowParenthesisForTiedBends { get; set; } = true;

        /// <summary>
        /// If set to true a tab number will be shown in case
        /// a bend is increased on a tied note.
        /// </summary>
        public bool ShowTabNoteOnTiedBend { get; set; } = true;

        /// <summary>
        /// If set to true, 0 is shown on dive whammy bars.
        /// </summary>
        public bool ShowZeroOnDiveWhammy { get; set; } = false;

        /// <summary>
        /// If set to true, line effects (like w/bar, let-ring etc)
        /// are drawn until the end of the beat instead of the start.
        /// </summary>
        public bool ExtendLineEffectsToBeatEnd { get; set; } = false;

        /// <summary>
        /// Gets or sets whether the triplet feel should be applied/played during audio playback.
        /// </summary>
        public bool PlayTripletFeel { get; set; } = true;

        /// <summary>
        /// Gets or sets the height for slurs. The factor is multiplied with the a logarithmic distance
        /// between slur start and end.
        /// </summary>
        public float SlurHeight { get; set; } = 7.0f;

        /// <summary>
        /// Gets or sets the bend duration in milliseconds for songbook bends.
        /// </summary>
        public int SongBookBendDuration { get; set; } = 75;

        /// <summary>
        /// Gets or sets the duration of whammy dips in milliseconds for songbook whammys.
        /// </summary>
        public int SongBookDipDuration { get; set; } = 150;

        /// <summary>
        /// Gets or sets the settings on how the vibrato audio is generated.
        /// </summary>
        public VibratoPlaybackSettings Vibrato { get; } = new VibratoPlaybackSettings();
    }

    /// <summary>
    /// All settings related to importers that decode file formats.
    /// </summary>
    public class ImporterSettings
    {
        /// <summary>
        /// The text encoding to use when decoding strings. By default UTF-8 is used.
        /// </summary>
        public string Encoding { get; set; } = "utf-8";

        /// <summary>
        /// If part-groups should be merged into a single track.
        /// </summary>
        public bool MergePartGroupsInMusicXml { get; set; } = false;
    }

    /// <summary>
    /// Contains all player related settings.
    /// </summary>
    public partial class PlayerSettings
    {
        /// <summary>
        /// Gets or sets whether the player should be enabled.
        /// </summary>
        public bool EnablePlayer { get; set; } = false;

        /// <summary>
        /// Gets or sets whether playback cursors should be displayed.
        /// </summary>
        public bool EnableCursor { get; set; } = true;

        /// <summary>
        /// Gets or sets the X-offset to add when scrolling.
        /// </summary>
        public int ScrollOffsetX { get; set; } = 0;

        /// <summary>
        /// Gets or sets the Y-offset to add when scrolling
        /// </summary>
        public int ScrollOffsetY { get; set; } = 0;

        /// <summary>
        /// Gets or sets the mode how to scroll.
        /// </summary>
        public ScrollMode ScrollMode { get; set; } = ScrollMode.Continuous;

        /// <summary>
        /// Gets or sets how fast the scrolling to the new position should happen (in milliseconds)
        /// </summary>
        public int ScrollSpeed { get; set; } = 300;
    }

    /// <summary>
    /// This public class contains instance specific settings for alphaTab
    /// </summary>
    public partial class Settings
    {
        /// <summary>
        /// The core settings control the general behavior of alphatab like
        /// what modules are active.
        /// </summary>
        public CoreSettings Core { get; } = new CoreSettings();

        /// <summary>
        /// The display settings control how the general layout and display of alphaTab is done.
        /// </summary>
        public DisplaySettings Display { get; } = new DisplaySettings();

        /// <summary>
        /// The notation settings control how various music notation elements are shown and behaving.
        /// </summary>
        public NotationSettings Notation { get; } = new NotationSettings();

        /// <summary>
        ///All settings related to importers that decode file formats.
        /// </summary>
        public ImporterSettings Importer { get; } = new ImporterSettings();

        /// <summary>
        /// Contains all player related settings
        /// </summary>
        public PlayerSettings Player { get; } = new PlayerSettings();

        /// <summary>
        /// Gets the default settings for the songbook display mode.
        /// </summary>
        public static Settings SongBook
        {
            get
            {
                var settings = new Settings();
                settings.Notation.NotationMode = NotationMode.SongBook;
                settings.Notation.SmallGraceTabNotes = false;
                settings.Notation.FingeringMode = FingeringMode.SingleNoteEffectBand;
                settings.Notation.ExtendBendArrowsOnTiedNotes = false;
                settings.Notation.ShowParenthesisForTiedBends = false;
                settings.Notation.ShowTabNoteOnTiedBend = false;
                settings.Notation.ShowZeroOnDiveWhammy = true;
                return settings;
            }
        }
    }
}
