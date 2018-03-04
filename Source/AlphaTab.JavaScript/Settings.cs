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

using System;
using AlphaTab.Collections;
using AlphaTab.Platform;
using Phase;

namespace AlphaTab
{
    /// <summary>
    /// This public class contains instance specific settings for alphaTab
    /// </summary>
    public partial class Settings
    {
        public string ScriptFile
        {
            get; set;
        }

        public string FontDirectory
        {
            get; set;
        }

        public bool DisableLazyLoading
        {
            get; set;
        }

        public bool UseWebWorker
        {
            get; set;
        }

        public bool EnablePlayer
        {
            get; set;
        }

        public string SoundFontFile
        {
            get; set;
        }

        public bool EnableCursor
        {
            get; set;
        }

        public int ScrollOffsetX
        {
            get; set;
        }

        public int ScrollOffsetY
        {
            get; set;
        }

        public bool EnableSeekByClick
        {
            get; set;
        }

        public string ScrollMode
        {
            get; set;
        }

        public int ScrollSpeed
        {
            get; set;
        }

        public string ScrollElement
        {
            get; set;
        }


        public int BeatCursorWidth
        {
            get; set;
        }

        private static void SetDefaults(Settings settings)
        {
            settings.UseWebWorker = true;
            settings.ScrollMode = "vertical";
            settings.ScrollSpeed = 300;
            settings.ScrollElement = "html,body";
            settings.BeatCursorWidth = 3;
        }

        public static void FillPlayerOptions(Settings settings, dynamic json, bool setDefaults, FastDictionary<string, object> dataAttributes = null)
        {
            if (Platform.Platform.JsonExists(json, "cursor"))
            {
                settings.EnableCursor = json.cursor;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("cursor"))
            {
                settings.EnableCursor = (bool)dataAttributes["cursor"];
            }
            else if(setDefaults)
            {
                settings.EnableCursor = true;
            }

            if (settings.EnableCursor)
            {
                if (Platform.Platform.JsonExists(json, "playerOffset"))
                {
                    FillCursorOffset(settings, json.playerOffset);
                }
                else if (dataAttributes != null && dataAttributes.ContainsKey("playerOffset"))
                {
                    FillCursorOffset(settings, dataAttributes["playerOffset"]);
                }
            }

            if (Platform.Platform.JsonExists(json, "handleClick"))
            {
                settings.EnableSeekByClick = json.handleClick;
            }
            else if(setDefaults)
            {
                settings.EnableSeekByClick = true;
            }

            if (Platform.Platform.JsonExists(json, "autoScroll"))
            {
                settings.ScrollMode = json.autoScroll;
            }
            else if(setDefaults)
            {
                settings.ScrollMode = "vertical";
            }

            if (Platform.Platform.JsonExists(json, "scrollSpeed"))
            {
                settings.ScrollSpeed = json.scrollSpeed;
            }
            else if(setDefaults)
            {
                settings.ScrollSpeed = 300;
            }

            if (Platform.Platform.JsonExists(json, "scrollSpeed"))
            {
                settings.ScrollElement = json.scrollSpeed;
            }
            else if(setDefaults)
            {
                settings.ScrollElement = "html,body";
            }

            if (Platform.Platform.JsonExists(json, "beatCursorWidth"))
            {
                settings.BeatCursorWidth = json.beatCursorWidth;
            }
            else if(setDefaults)
            {
                settings.BeatCursorWidth = 3;
            }
        }

        public dynamic ToJson()
        {
            dynamic json = Platform.Platform.NewObject();

            json.useWorker = UseWebWorker;
            json.scale = Scale;
            json.width = Width;
            json.engine = Engine;
            json.stretchForce = StretchForce;
            json.forcePianoFingering = ForcePianoFingering;
            json.transpositionPitches = TranspositionPitches;
            json.displayTranspositionPitches = DisplayTranspositionPitches;

            json.scriptFile = ScriptFile;
            json.fontDirectory = FontDirectory;
            json.lazy = DisableLazyLoading;

            json.layout = Platform.Platform.NewObject();
            json.layout.mode = Layout.Mode;
            json.layout.additionalSettings = Platform.Platform.NewObject();
            foreach (string setting in Layout.AdditionalSettings)
            {
                json.layout.additionalSettings[setting] = Layout.AdditionalSettings[setting];
            }

            json.staves = Platform.Platform.NewObject();
            json.staves.id = Staves.Id;
            json.staves.additionalSettings = Platform.Platform.NewObject();

            foreach (var additionalSetting in Staves.AdditionalSettings)
            {
                json.staves.additionalSettings[additionalSetting] = Staves.AdditionalSettings[additionalSetting];
            }

            return json;
        }

        public static Settings FromJson(dynamic json, FastDictionary<string, object> dataAttributes)
        {
            if (json is Settings)
            {
                return (Settings)json;
            }

            var settings = Defaults;
            settings.ScriptFile = Environment.ScriptFile;

            FillFromJson(settings, json, dataAttributes);

            return settings;
        }

        public static void FillFromJson(Settings settings, dynamic json, FastDictionary<string, object> dataAttributes)
        {
            var global = Script.Write<dynamic>("js.Lib.global");
            if (global.document && global.ALPHATAB_ROOT)
            {
                settings.ScriptFile = global.ALPHATAB_ROOT;
                settings.ScriptFile = EnsureFullUrl(settings.ScriptFile);
                settings.ScriptFile = AppendScriptName(settings.ScriptFile);
            }
            else
            {
                settings.ScriptFile = Environment.ScriptFile;
            }

            if (global.document && global.ALPHATAB_FONT)
            {
                settings.FontDirectory = global.ALPHATAB_FONT;
                settings.FontDirectory = EnsureFullUrl(settings.FontDirectory);
            }
            else
            {
                settings.FontDirectory = settings.ScriptFile;
                if (!string.IsNullOrEmpty(settings.FontDirectory))
                {
                    var lastSlash = settings.FontDirectory.LastIndexOf('/');
                    if (lastSlash >= 0)
                    {
                        settings.FontDirectory = settings.FontDirectory.Substring(0, lastSlash) + "/Font/";
                    }
                }
            }


            if (Platform.Platform.JsonExists(json, "useWorker"))
            {
                settings.UseWebWorker = json.useWorker;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("useWorker"))
            {
                settings.UseWebWorker = dataAttributes["useWorker"].IsTruthy();
            }
            if (Platform.Platform.JsonExists(json, "scale"))
            {
                settings.Scale = json.scale;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("scale"))
            {
                settings.Scale = dataAttributes["scale"].As<float>();
            }
            if (Platform.Platform.JsonExists(json, "width"))
            {
                settings.Width = json.width;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("width"))
            {
                settings.Width = dataAttributes["width"].As<int>();
            }
            if (Platform.Platform.JsonExists(json, "engine"))
            {
                settings.Engine = json.engine;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("engine"))
            {
                settings.Engine = dataAttributes["engine"].As<string>();
            }
            if (Platform.Platform.JsonExists(json, "stretchForce"))
            {
                settings.StretchForce = json.stretchForce;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("stretchForce"))
            {
                settings.StretchForce = dataAttributes["stretchForce"].As<float>();
            }
            if (Platform.Platform.JsonExists(json, "forcePianoFingering"))
            {
                settings.ForcePianoFingering = json.forcePianoFingering;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("forcePianoFingering"))
            {
                settings.ForcePianoFingering = dataAttributes["forcePianoFingering"].As<bool>();
            }
            if (Platform.Platform.JsonExists(json, "lazy"))
            {
                settings.DisableLazyLoading = !json.lazy;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("lazy"))
            {
                settings.DisableLazyLoading = !dataAttributes["lazy"].IsTruthy();
            }
            if (Platform.Platform.JsonExists(json, "transpositionPitches"))
            {
                settings.TranspositionPitches = json.transpositionPitches;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("transpositionPitches"))
            {
                var pitchOffsets = dataAttributes["transpositionPitches"];
                if (pitchOffsets != null && pitchOffsets.Member<bool>("length"))
                {
                    settings.TranspositionPitches = (int[])pitchOffsets;
                }
            }

            if (Platform.Platform.JsonExists(json, "displayTranspositionPitches"))
            {
                settings.DisplayTranspositionPitches = json.displayTranspositionPitches;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("displayTranspositionPitches"))
            {
                var pitchOffsets = dataAttributes["displayTranspositionPitches"];
                if (pitchOffsets != null && pitchOffsets.Member<bool>("length"))
                {
                    settings.DisplayTranspositionPitches = (int[])pitchOffsets;
                }
            }

            if (Platform.Platform.JsonExists(json, "scriptFile"))
            {
                settings.ScriptFile = EnsureFullUrl(json.scriptFile);
                settings.ScriptFile = AppendScriptName(settings.ScriptFile);
            }

            if (Platform.Platform.JsonExists(json, "fontDirectory"))
            {
                settings.FontDirectory = EnsureFullUrl(json.fontDirectory);
            }

            if (Platform.Platform.JsonExists(json, "layout"))
            {
                settings.Layout = LayoutFromJson(json.layout);
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("layout"))
            {
                settings.Layout = LayoutFromJson(dataAttributes["layout"]);
            }

            if (dataAttributes != null)
            {
                foreach (var key in dataAttributes)
                {
                    if (key.StartsWith("layout"))
                    {
                        var property = key.Substring(6);
                        settings.Layout.AdditionalSettings[property.ToLower()] = dataAttributes[key];
                    }
                }
            }

            if (Platform.Platform.JsonExists(json, "staves"))
            {
                settings.Staves = StavesFromJson(json.staves);
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("staves"))
            {
                settings.Staves = StavesFromJson(dataAttributes["staves"]);
            }

            if (dataAttributes != null)
            {
                foreach (var key in dataAttributes)
                {
                    if (key.StartsWith("staves"))
                    {
                        var property = key.Substring(6);
                        settings.Staves.AdditionalSettings[property.ToLower()] = dataAttributes[key];
                    }
                }
            }

            if (Platform.Platform.JsonExists(json, "player"))
            {
                settings.EnablePlayer = true;
                settings.SoundFontFile = json.player;
            }
            else if (dataAttributes != null && dataAttributes.ContainsKey("player"))
            {
                settings.EnablePlayer = true;
                settings.SoundFontFile = (string)dataAttributes["player"];
            }

            if (settings.EnablePlayer)
            {
                FillPlayerOptions(settings, json, true, dataAttributes);
            }
        }

        private static void FillCursorOffset(Settings settings, object playerOffset)
        {
            if (Platform.Platform.TypeOf(playerOffset) == "number")
            {
                settings.ScrollOffsetX = (int)playerOffset;
                settings.ScrollOffsetY = (int)playerOffset;
            }
            else if (Platform.Platform.JsonExists(playerOffset, "length"))
            {
                var offsets = (int[])playerOffset;
                settings.ScrollOffsetX = offsets[0];
                settings.ScrollOffsetY = offsets[1];
            }
        }

        private static StaveSettings StavesFromJson(dynamic json)
        {
            StaveSettings staveSettings;
            if (Script.Write<bool>("untyped __typeof__(json) == \"string\""))
            {
                staveSettings = new StaveSettings(json);
            }
            else if (json.id)
            {
                staveSettings = new StaveSettings(json.id);
                if (json.additionalSettings)
                {
                    string[] keys2 = Platform.Platform.JsonKeys(json.additionalSettings);
                    foreach (var key2 in keys2)
                    {
                        staveSettings.AdditionalSettings[key2.ToLower()] = json.additionalSettings[key2];
                    }
                }
            }
            else
            {
                return new StaveSettings("score-tab");
            }
            return staveSettings;
        }

        public static LayoutSettings LayoutFromJson(dynamic json)
        {
            var layout = new LayoutSettings();
            if (Script.Write<bool>("untyped __typeof__(json) == \"string\""))
            {
                layout.Mode = json;
            }
            else
            {
                if (json.mode) layout.Mode = json.mode;
                if (json.additionalSettings)
                {
                    string[] keys = Platform.Platform.JsonKeys(json.additionalSettings);
                    foreach (var key in keys)
                    {
                        layout.AdditionalSettings[key.ToLower()] = json.additionalSettings[key];
                    }
                }
            }
            return layout;
        }

        private static string AppendScriptName(string url)
        {
            // append script name 
            if (!string.IsNullOrEmpty(url) && !url.EndsWith(".js"))
            {
                if (!url.EndsWith("/"))
                {
                    url += "/";
                }
                url += "AlphaTab.js";
            }
            return url;
        }

        private static string EnsureFullUrl(string relativeUrl)
        {
            var global = Script.Write<dynamic>("js.Lib.global");
            if (!relativeUrl.StartsWith("http") && !relativeUrl.StartsWith("https"))
            {
                var root = new StringBuilder();
                root.Append(global.location.protocol);
                root.Append("//");
                root.Append(global.location.hostName);
                if (global.location.port)
                {
                    root.Append(":");
                    root.Append(global.location.port);
                }
                root.Append(relativeUrl);
                if (!relativeUrl.EndsWith("/"))
                {
                    root.Append("/");
                }
                return root.ToString();
            }

            return relativeUrl;
        }
    }
}
