/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

using AlphaTab.Collections;
using AlphaTab.Util;

namespace AlphaTab
{
    /// <summary>
    /// Lists all modes on how alphaTab can handle the display and playback of music notation. 
    /// </summary>
    public enum DisplayMode
    {
        /// <summary>
        /// Music elements will be displayed and played as in Guitar Pro. 
        /// </summary>
        GuitarPro,
        /// <summary>
        /// Music elements will be displayed and played as in traditional songbooks.
        /// Changes:
        /// 1. Bends
        ///     For bends additional grace beats are introduced. 
        ///     Bends are categorized into gradual and fast bends. 
        ///         - Gradual bends are indicated by beat text "grad" or "grad.". Bend will sound along the beat duration. 
        ///         - Fast bends are done right before the next note. If the next note is tied even on-beat of the next note.
        /// 2. Whammy Bars
        ///     Dips are shown as simple annotation over the beats
        ///     Whammy Bars are categorized into gradual and fast. 
        ///         - Gradual whammys are indicated by beat text "grad" or "grad.". Whammys will sound along the beat duration. 
        ///         - Fast whammys are done right the beat.
        /// 3. Let Ring
        ///     Tied notes with let ring are not shown in standard notation
        ///     Let ring does not cause a longer playback, duration is defined via tied notes. 
        /// </summary>
        SongBook
    }

    /// <summary>
    /// Lists all modes on how fingerings should be displayed.
    /// </summary>
    public enum FingeringMode
    {
        /// <summary>
        /// Fingerings will be shown in the standard notation staff. 
        /// </summary>
        Score,
        /// <summary>
        /// Fingerings will be shown in a effect band above the tabs in case
        /// they have only a single note on the beat.
        /// </summary>
        SingleNoteEffectBand
    }

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
        /// The initial size of the canvas during loading or the width for particular layouts (e.g. page layout).
        /// </summary>
        public int Width { get; set; }

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
        /// Gets or sets the height factor for slurs. The factor is multiplied with the distance
        /// between slur start and end.
        /// </summary>
        public float SlurHeightFactor { get; set; }

        /// <summary>
        /// Gets or sets the bend duration in milliseconds for songbook bends. 
        /// </summary>
        public int SongBookBendDuration { get; set; }

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
                settings.Width = -1;
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
                settings.SlurHeightFactor = 0.3f;

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

                settings.SongBookBendDuration = 75;

                SetDefaults(settings);

                return settings;
            }
        }
    }

    /// <summary>
    /// This object defines the details on how to generate the vibrato effects. 
    /// </summary>
    public class VibratoPlaybackSettings
    {
        /// <summary>
        /// Gets or sets the wavelength of the note-wide vibrato in midi ticks. 
        /// </summary>
        public int NoteWideLength { get; set; }
        /// <summary>
        /// Gets or sets the amplitude for the note-wide vibrato in semitones. 
        /// </summary>
        public int NoteWideAmplitude { get; set; }

        /// <summary>
        /// Gets or sets the wavelength of the note-slight vibrato in midi ticks. 
        /// </summary>
        public int NoteSlightLength { get; set; }
        /// <summary>
        /// Gets or sets the amplitude for the note-slight vibrato in semitones. 
        /// </summary>
        public int NoteSlightAmplitude { get; set; }

        /// <summary>
        /// Gets or sets the wavelength of the beat-wide vibrato in midi ticks. 
        /// </summary>
        public int BeatWideLength { get; set; }
        /// <summary>
        /// Gets or sets the amplitude for the beat-wide vibrato in semitones. 
        /// </summary>
        public int BeatWideAmplitude { get; set; }

        /// <summary>
        /// Gets or sets the wavelength of the beat-slight vibrato in midi ticks. 
        /// </summary>
        public int BeatSlightLength { get; set; }
        /// <summary>
        /// Gets or sets the amplitude for the beat-slight vibrato in semitones. 
        /// </summary>
        public int BeatSlightAmplitude { get; set; }
    }

    /// <summary>
    /// Represents the layout specific settings. 
    /// </summary>
    public class LayoutSettings
    {
        /// <summary>
        /// The layouting mode used to arrange the the notation.
        /// <ul>
        ///  <li><strong>page</strong> - Bars are aligned in rows using a fixed width</li>
        ///  <li><strong>horizontal</strong> - Bars are aligned horizontally in one row</li>
        /// </ul>
        /// </summary>
        public string Mode { get; set; }

        /// <summary>
        /// Additional layout mode specific settings.
        /// <strong>mode=page</strong>
        /// <ul>
        ///  <li><strong>barsPerRow</strong> - Limit the displayed bars per row, <em>-1 for sized based limit</em> (integer, default:-1)</li>
        ///  <li><strong>start</strong> - The bar start index to start layouting with (integer: default: 0)</li>
        ///  <li><strong>count</strong> - The amount of bars to render overall, <em>-1 for all till the end</em>  (integer, default:-1)</li>
        ///  <li><strong>hideInfo</strong> - Render the song information or not (boolean, default:false)</li>
        ///  <li><strong>hideTuning</strong> - Render the tuning information or not (boolean, default:false)</li>
        ///  <li><strong>hideTrackNames</strong> - Render the track names or not (boolean, default:false)</li>
        /// </ul>
        /// <strong>mode=horizontal</strong>
        /// <ul>
        ///  <li><strong>start</strong> - The bar start index to start layouting with (integer: default: 0)</li>
        ///  <li><strong>count</strong> - The amount of bars to render overall, <em>-1 for all till the end</em>  (integer, default:-1)</li>
        ///  <li><strong>hideTrackNames</strong> - Render the track names or not (boolean, default:false)</li>
        /// </ul>
        /// </summary>
        public FastDictionary<string, object> AdditionalSettings { get; set; }

        internal T Get<T>(string key, T def)
        {
            if (AdditionalSettings.ContainsKey(key.ToLower()))
            {
                return (T)(AdditionalSettings[key.ToLower()]);
            }
            return def;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="LayoutSettings"/> class.
        /// </summary>
        public LayoutSettings()
        {
            AdditionalSettings = new FastDictionary<string, object>();
        }

        internal static LayoutSettings Defaults
        {
            get
            {
                var settings = new LayoutSettings();
                settings.Mode = "page";
                return settings;
            }
        }
    }

    /// <summary>
    /// Represents the stave specific settings. 
    /// </summary>
    public class StaveSettings
    {
        /// <summary>
        /// The stave profile name as it is registered in <see cref="Environment.StaveProfiles"/>
        /// Default Profiles: 
        /// <ul>
        ///  <li><strong>score-tab</strong> - Standard music notation and guitar tablature are rendered (default)</li>
        ///  <li><strong>score</strong> - Only standard music notation is rendered</li>
        ///  <li><strong>tab</strong> - Only guitar tablature is rendered</li>
        /// </ul>
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Additional stave sspecific settings
        /// <strong>id=tab</strong>
        /// <ul>
        ///  <li><strong>rhythm</strong> - Renders rhythm beams to tablature notes</li>
        /// </ul>
        /// </summary>
        public FastDictionary<string, object> AdditionalSettings { get; set; }

        public StaveSettings(string id)
        {
            Id = id;
            AdditionalSettings = new FastDictionary<string, object>();
        }

        public T Get<T>(string key, T def)
        {
            if (AdditionalSettings.ContainsKey(key.ToLower()))
            {
                return (T)(AdditionalSettings[key.ToLower()]);
            }
            return def;
        }


    }
}
