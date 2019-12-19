using AlphaTab.Platform.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.Util;

namespace AlphaTab
{
    /// <summary>
    /// This public class contains central definitions for controlling the visual appearance.
    /// </summary>
    [JsonSerializable]
    public class RenderingResources
    {
        /// <summary>
        /// Gets or sets the font to use for displaying the songs copyright information in the header of the music sheet.
        /// </summary>
        [JsonName("copyrightFont")]
        public Font CopyrightFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying the songs title in the header of the music sheet.
        /// </summary>
        [JsonName("titleFont")]
        public Font TitleFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying the songs subtitle in the header of the music sheet.
        /// </summary>
        [JsonName("subTitleFont")]
        public Font SubTitleFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying the lyrics information in the header of the music sheet.
        /// </summary>
        [JsonName("wordsFont")]
        public Font WordsFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying certain effect related elements in the music sheet.
        /// </summary>
        [JsonName("effectFont")]
        public Font EffectFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying the fretboard numbers in chord diagrams.
        /// </summary>
        [JsonName("fretboardNumberFont")]
        public Font FretboardNumberFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying the guitar tablature numbers in the music sheet.
        /// </summary>
        [JsonName("tablatureFont")]
        public Font TablatureFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for grace notation related texts in the music sheet.
        /// </summary>
        [JsonName("graceFont")]
        public Font GraceFont { get; set; }

        /// <summary>
        /// Gets or sets the color to use for rendering the lines of staves.
        /// </summary>
        [JsonName("staffLineColor")]
        public Color StaffLineColor { get; set; }

        /// <summary>
        /// Gets or sets the color to use for rendering bar separators, the accolade and repeat signs.
        /// </summary>
        [JsonName("barSeparatorColor")]
        public Color BarSeparatorColor { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying the bar numbers above the music sheet.
        /// </summary>
        [JsonName("barNumberFont")]
        public Font BarNumberFont { get; set; }

        /// <summary>
        /// Gets or sets the color to use for displaying the bar numbers above the music sheet.
        /// </summary>
        [JsonName("barNumberColor")]
        public Color BarNumberColor { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying finger information in the music sheet.
        /// </summary>
        [JsonName("fingeringFont")]
        public Font FingeringFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for section marker labels shown above the music sheet.
        /// </summary>
        [JsonName("markerFont")]
        public Font MarkerFont { get; set; }

        /// <summary>
        /// Gets or sets the color to use for music notation elements of the primary voice.
        /// </summary>
        [JsonName("mainGlyphColor")]
        public Color MainGlyphColor { get; set; }

        /// <summary>
        /// Gets or sets the color to use for music notation elements of the secondary voices.
        /// </summary>
        [JsonName("secondaryGlyphColor")]
        public Color SecondaryGlyphColor { get; set; }

        /// <summary>
        /// Gets or sets the color to use for displaying the song information above the music sheet.
        /// </summary>
        [JsonName("scoreInfoColor")]
        public Color ScoreInfoColor { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="RenderingResources"/> class.
        /// </summary>
        public RenderingResources()
        {
            const string sansFont = "Arial";
            const string serifFont = "Georgia";

            EffectFont = new Font(serifFont, 12, FontStyle.Italic);
            CopyrightFont = new Font(sansFont, 12, FontStyle.Bold);
            FretboardNumberFont = new Font(sansFont, 11);

            TitleFont = new Font(serifFont, 32);
            SubTitleFont = new Font(serifFont, 20);
            WordsFont = new Font(serifFont, 15);

            TablatureFont = new Font(sansFont, 13);
            GraceFont = new Font(sansFont, 11);

            StaffLineColor = new Color(165, 165, 165);
            BarSeparatorColor = new Color(34, 34, 17);

            BarNumberFont = new Font(sansFont, 11);
            BarNumberColor = new Color(200, 0, 0);

            FingeringFont = new Font(serifFont, 14);
            MarkerFont = new Font(serifFont, 14, FontStyle.Bold);

            ScoreInfoColor = new Color(0, 0, 0);
            MainGlyphColor = new Color(0, 0, 0);
            SecondaryGlyphColor = new Color(0, 0, 0, 100);
        }
    }

    /// <summary>
    /// The core settings control the general behavior of alphatab like
    /// what modules are active.
    /// </summary>
    [JsonSerializable]
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
        [JsonName("engine")]
        public string Engine { get; set; } = "default";

        /// <summary>
        /// The log level to use within alphaTab
        /// </summary>
        [JsonName("logLevel", "logging")]
        public LogLevel LogLevel { get; set; } = LogLevel.Info;

        /// <summary>
        /// Gets or sets whether the rendering should be done in a worker if possible.
        /// </summary>
        [JsonName("useWorkers")]
        public bool UseWorkers { get; set; } = true;

        /// <summary>
        /// Gets or sets whether in the <see cref="BoundsLookup"/> also the
        /// position and area of each individual note is provided.
        /// </summary>
        [JsonName("includeNoteBounds")]
        public bool IncludeNoteBounds { get; set; } = false;
    }

    /// <summary>
    /// Lists all layout modes that are supported.
    /// </summary>
    [JsonSerializable]
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
    [JsonSerializable]
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
    [JsonSerializable]
    public class DisplaySettings
    {
        /// <summary>
        /// Sets the zoom level of the rendered notation
        /// </summary>
        [JsonName("scale")]
        public float Scale { get; set; } = 1.0f;

        /// <summary>
        /// The default stretch force to use for layouting.
        /// </summary>
        [JsonName("stretchForce")]
        public float StretchForce { get; set; } = 1.0f;

        /// <summary>
        /// The layouting mode used to arrange the the notation.
        /// </summary>
        [JsonName("layoutMode")]
        public LayoutMode LayoutMode { get; set; } = LayoutMode.Page;

        /// <summary>
        /// The stave profile to use.
        /// </summary>
        [JsonName("staveProfile")]
        public StaveProfile StaveProfile { get; set; } = StaveProfile.Default;

        /// <summary>
        /// Limit the displayed bars per row.
        /// </summary>
        [JsonName("barPerRow")]
        public int BarsPerRow { get; set; } = -1;

        /// <summary>
        /// The bar start number to start layouting with. Note that this is the bar number and not an index!
        /// </summary>
        [JsonName("startBar")]
        public int StartBar { get; set; } = 1;

        /// <summary>
        /// The amount of bars to render overall.
        /// </summary>
        [JsonName("barCount")]
        public int BarCount { get; set; } = -1;

        /// <summary>
        /// The number of bars that should be rendered per partial. This setting is not used by all layouts.
        /// </summary>
        [JsonName("barCountPerPartial")]
        public int BarCountPerPartial { get; set; } = 10;

        /// <summary>
        /// Gets or sets the resources used during rendering. This defines all fonts and colors used.
        /// </summary>
        [JsonName("resources")]
        public RenderingResources RenderingResources { get; } = new RenderingResources();

        /// <summary>
        /// Gets or sets the padding between the music notation and the border.
        /// </summary>
        [JsonName("padding")]
        public float[] Padding { get; set; }
    }

    /// <summary>
    /// Lists the different modes on how rhythm notation is shown on the tab staff.
    /// </summary>
    [JsonSerializable]
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
    [JsonSerializable]
    public class NotationSettings
    {
        /// <summary>
        /// Gets or sets the mode to use for display and play music notation elements.
        /// </summary>
        [JsonName("notationMode")]
        public NotationMode NotationMode { get; set; } = NotationMode.GuitarPro;

        /// <summary>
        /// Gets or sets the fingering mode to use.
        /// </summary>
        [JsonName("fingeringMode")]
        public FingeringMode FingeringMode { get; set; } = FingeringMode.ScoreDefault;

        /// <summary>
        /// Whether to display the song information or not.
        /// </summary>
        [JsonName("hideInfo")]
        public bool HideInfo { get; set; } = false;

        /// <summary>
        /// Whether to display the tuning information or not.
        /// </summary>
        [JsonName("hideTuning")]
        public bool HideTuning { get; set; } = false;

        /// <summary>
        /// Whether to display the track names in the accolade or not.
        /// </summary>
        [JsonName("hideTrackNames")]
        public bool HideTrackNames { get; set; } = false;

        /// <summary>
        /// Whether to display the chord diagrams or not.
        /// </summary>
        [JsonName("hideChordDiagram")]
        public bool HideChordDiagram { get; set; } = false;

        /// <summary>
        /// Whether to show rhythm notation in the guitar tablature.
        /// </summary>
        [JsonName("rhythmMode")]
        public TabRhythmMode RhythmMode { get; set; } = TabRhythmMode.Hidden;

        /// <summary>
        /// The height of the rythm bars.
        /// </summary>
        [JsonName("rhythmHeight")]
        public float RhythmHeight { get; set; } = 15;

        /// <summary>
        /// The transposition pitch offsets for the individual tracks.
        /// They apply to rendering and playback.
        /// </summary>
        [JsonName("transpositionPitches")]
        public int[] TranspositionPitches { get; set; } = new int[0];

        /// <summary>
        /// The transposition pitch offsets for the individual tracks.
        /// They apply to rendering only.
        /// </summary>
        [JsonName("displayTranspositionPitches")]
        public int[] DisplayTranspositionPitches { get; set; } = new int[0];

        /// <summary>
        /// If set to true the guitar tabs on grace beats are rendered smaller.
        /// </summary>
        [JsonName("smallGraceTabNotes")]
        public bool SmallGraceTabNotes { get; set; } = true;

        /// <summary>
        /// If set to true bend arrows expand to the end of the last tied note
        /// of the string. Otherwise they end on the next beat.
        /// </summary>
        [JsonName("extendBendArrowsOnTiedNotes")]
        public bool ExtendBendArrowsOnTiedNotes { get; set; } = true;

        /// <summary>
        /// If set to true the note heads on tied notes
        /// will have parenthesis if they are preceeded by bends.
        /// </summary>
        [JsonName("showParenthesisForTiedBends")]
        public bool ShowParenthesisForTiedBends { get; set; } = true;

        /// <summary>
        /// If set to true a tab number will be shown in case
        /// a bend is increased on a tied note.
        /// </summary>
        [JsonName("showTabNoteOnTiedBend")]
        public bool ShowTabNoteOnTiedBend { get; set; } = true;

        /// <summary>
        /// If set to true, 0 is shown on dive whammy bars.
        /// </summary>
        [JsonName("showZeroOnDiveWhammy")]
        public bool ShowZeroOnDiveWhammy { get; set; } = false;

        /// <summary>
        /// If set to true, line effects (like w/bar, let-ring etc)
        /// are drawn until the end of the beat instead of the start.
        /// </summary>
        [JsonName("extendLineEffectsToBeatEnd")]
        public bool ExtendLineEffectsToBeatEnd { get; set; } = false;

        /// <summary>
        /// Gets or sets whether the triplet feel should be applied/played during audio playback.
        /// </summary>
        public bool PlayTripletFeel { get; set; } = true;

        /// <summary>
        /// Gets or sets the height for slurs. The factor is multiplied with the a logarithmic distance
        /// between slur start and end.
        /// </summary>
        [JsonName("slurHeight")]
        public float SlurHeight { get; set; } = 7.0f;

        /// <summary>
        /// Gets or sets the bend duration in milliseconds for songbook bends.
        /// </summary>
        [JsonName("songBookBendDuration")]
        public int SongBookBendDuration { get; set; } = 75;

        /// <summary>
        /// Gets or sets the duration of whammy dips in milliseconds for songbook whammys.
        /// </summary>
        [JsonName("songBookDipDuration")]
        public int SongBookDipDuration { get; set; } = 150;

        /// <summary>
        /// Gets or sets the settings on how the vibrato audio is generated.
        /// </summary>
        [JsonName("vibrato")]
        public VibratoPlaybackSettings Vibrato { get; } = new VibratoPlaybackSettings();
    }

    /// <summary>
    /// This object defines the details on how to generate the vibrato effects.
    /// </summary>
    [JsonSerializable]
    public class VibratoPlaybackSettings
    {
        /// <summary>
        /// Gets or sets the wavelength of the note-wide vibrato in midi ticks.
        /// </summary>
        [JsonName("noteWideLength")]
        public int NoteWideLength { get; set; } = 480;

        /// <summary>
        /// Gets or sets the amplitude for the note-wide vibrato in semitones.
        /// </summary>
        [JsonName("noteWideAmplitude")]
        public int NoteWideAmplitude { get; set; } = 2;

        /// <summary>
        /// Gets or sets the wavelength of the note-slight vibrato in midi ticks.
        /// </summary>
        [JsonName("noteSlightLength")]
        public int NoteSlightLength { get; set; } = 480;

        /// <summary>
        /// Gets or sets the amplitude for the note-slight vibrato in semitones.
        /// </summary>
        [JsonName("noteSlightAmplitude")]
        public int NoteSlightAmplitude { get; set; } = 2;

        /// <summary>
        /// Gets or sets the wavelength of the beat-wide vibrato in midi ticks.
        /// </summary>
        [JsonName("beatWideLength")]
        public int BeatWideLength { get; set; } = 240;

        /// <summary>
        /// Gets or sets the amplitude for the beat-wide vibrato in semitones.
        /// </summary>
        [JsonName("beatWideAmplitude")]
        public int BeatWideAmplitude { get; set; } = 3;

        /// <summary>
        /// Gets or sets the wavelength of the beat-slight vibrato in midi ticks.
        /// </summary>
        [JsonName("beatSlightLength")]
        public int BeatSlightLength { get; set; } = 240;

        /// <summary>
        /// Gets or sets the amplitude for the beat-slight vibrato in semitones.
        /// </summary>
        [JsonName("beatSlightAmplitude")]
        public int BeatSlightAmplitude { get; set; } = 3;
    }

    /// <summary>
    /// All settings related to importers that decode file formats.
    /// </summary>
    [JsonSerializable]
    public class ImporterSettings
    {
        /// <summary>
        /// The text encoding to use when decoding strings. By default UTF-8 is used.
        /// </summary>
        [JsonName("encoding")]
        public string Encoding { get; set; } = "utf-8";

        /// <summary>
        /// If part-groups should be merged into a single track.
        /// </summary>
        [JsonName("mergePartGroupsInMusicXml")]
        public bool MergePartGroupsInMusicXml { get; set; } = false;
    }

    /// <summary>
    /// Contains all player related settings.
    /// </summary>
    [JsonSerializable]
    public partial class PlayerSettings
    {
        /// <summary>
        /// Gets or sets whether the player should be enabled.
        /// </summary>
        [JsonName("enable")]
        public bool EnablePlayer { get; set; } = false;

        /// <summary>
        /// Gets or sets whether playback cursors should be displayed.
        /// </summary>
        [JsonName("cursor")]
        public bool EnableCursor { get; set; } = true;

        /// <summary>
        /// Gets or sets the X-offset to add when scrolling.
        /// </summary>
        [JsonName("scrollOffsetX")]
        public int ScrollOffsetX { get; set; } = 0;

        /// <summary>
        /// Gets or sets the Y-offset to add when scrolling
        /// </summary>
        [JsonName("scrollOffsetY")]
        public int ScrollOffsetY { get; set; } = 0;

        /// <summary>
        /// Gets or sets the mode how to scroll.
        /// </summary>
        [JsonName("scrollMode")]

        public ScrollMode ScrollMode { get; set; } = ScrollMode.Continuous;

        /// <summary>
        /// Gets or sets how fast the scrolling to the new position should happen (in milliseconds)
        /// </summary>
        [JsonName("scrollSpeed")]
        public int ScrollSpeed { get; set; } = 300;
    }

    /// <summary>
    /// This public class contains instance specific settings for alphaTab
    /// </summary>
    [JsonSerializable]
    public partial class Settings
    {
        /// <summary>
        /// The core settings control the general behavior of alphatab like
        /// what modules are active.
        /// </summary>
        [JsonName("core", "")]
        public CoreSettings Core { get; } = new CoreSettings();

        /// <summary>
        /// The display settings control how the general layout and display of alphaTab is done.
        /// </summary>
        [JsonName("display", "")]
        public DisplaySettings Display { get; } = new DisplaySettings();

        /// <summary>
        /// The notation settings control how various music notation elements are shown and behaving.
        /// </summary>
        [JsonName("notation")]
        public NotationSettings Notation { get; } = new NotationSettings();

        /// <summary>
        ///All settings related to importers that decode file formats.
        /// </summary>
        [JsonName("importer")]
        public ImporterSettings Importer { get; } = new ImporterSettings();

        /// <summary>
        /// Contains all player related settings
        /// </summary>
        [JsonName("player")]
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
