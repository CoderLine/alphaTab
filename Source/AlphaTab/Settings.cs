/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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

                settings.Layout = LayoutSettings.Defaults;

                settings.Staves = new StaveSettings("default");

                SetDefaults(settings);

                return settings;
            }
        }
    }

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

        public T Get<T>(string key, T def)
        {
            if (AdditionalSettings.ContainsKey(key.ToLower()))
            {
                return (T)(AdditionalSettings[key.ToLower()]);
            }
            return def;
        }

        public LayoutSettings()
        {
            AdditionalSettings = new FastDictionary<string, object>();
        }

        public static LayoutSettings Defaults
        {
            get
            {
                var settings = new LayoutSettings();
                settings.Mode = "page";
                return settings;
            }
        }
    }

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
