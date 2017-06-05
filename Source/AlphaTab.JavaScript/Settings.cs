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

using System;
using AlphaTab.Collections;
using AlphaTab.Platform;
using SharpKit.Html;
using SharpKit.JavaScript;

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

        public dynamic ToJson()
        {
            dynamic json = Std.NewObject();

            json.scale = Scale;
            json.width = Width;
            json.height = Height;
            json.engine = Engine;
            json.stretchForce = StretchForce;
            json.forcePianoFingering = ForcePianoFingering;
            json.pitchOffsets = PitchOffsets;

            json.scriptFile = ScriptFile;
            json.fontDirectory = FontDirectory;
            json.lazy = DisableLazyLoading;

            json.layout = Std.NewObject();
            json.layout.mode = Layout.Mode;
            json.layout.additionalSettings = Std.NewObject();
            foreach (string setting in Layout.AdditionalSettings)
            {
                json.layout.additionalSettings[setting] = Layout.AdditionalSettings[setting];
            }

            json.staves = Std.NewObject();
            json.staves.id = Staves.Id;
            json.staves.additionalSettings = Std.NewObject();

            foreach (var additionalSetting in Staves.AdditionalSettings)
            {
                json.staves.additionalSettings[additionalSetting] = Staves.AdditionalSettings[additionalSetting];
            }

            return json;
        }

        public static Settings FromJson(dynamic json, FastDictionary<string, object> dataAttributes)
        {
            if (Std.InstanceOf<Settings>(json))
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
            if (HtmlContext.self.document.As<bool>() && HtmlContext.self.window.Member("ALPHATAB_ROOT").As<bool>())
            {
                settings.ScriptFile = HtmlContext.self.window.Member("ALPHATAB_ROOT").As<string>();
                settings.ScriptFile = EnsureFullUrl(settings.ScriptFile);
                settings.ScriptFile = AppendScriptName(settings.ScriptFile);
            }
            else
            {
                settings.ScriptFile = Environment.ScriptFile;
            }

            if (HtmlContext.self.document.As<bool>() && HtmlContext.self.window.Member("ALPHATAB_FONT").As<bool>())
            {
                settings.FontDirectory = HtmlContext.self.window.Member("ALPHATAB_FONT").As<string>();
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

            if (Std.JsonExists(json, "scale")) settings.Scale = json.scale;
            if (Std.JsonExists(json, "width")) settings.Width = json.width;
            if (Std.JsonExists(json, "height")) settings.Height = json.height;
            if (Std.JsonExists(json, "engine")) settings.Engine = json.engine;
            if (Std.JsonExists(json, "stretchForce")) settings.StretchForce = json.stretchForce;
            if (Std.JsonExists(json, "forcePianoFingering")) settings.ForcePianoFingering = json.forcePianoFingering;
            if (Std.JsonExists(json, "lazy")) settings.DisableLazyLoading = !json.lazy;
            if (Std.JsonExists(json, "pitchOffsets")) settings.PitchOffsets = json.pitchOffsets;
            else if(dataAttributes != null && dataAttributes.ContainsKey("pitches"))
            {
                var pitchOffsets = dataAttributes["pitches"];
                if (pitchOffsets != null && Std.InstanceOf<JsArray>(pitchOffsets))
                {
                    settings.PitchOffsets = pitchOffsets.As<int[]>();
                }
            }

            if (Std.JsonExists(json, "scriptFile"))
            {
                settings.ScriptFile = EnsureFullUrl(json.scriptFile);
                settings.ScriptFile = AppendScriptName(settings.ScriptFile);
            }

            if (Std.JsonExists(json, "fontDirectory"))
            {
                settings.FontDirectory = EnsureFullUrl(json.fontDirectory);
            }

            if (Std.JsonExists(json, "layout"))
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

            if (Std.JsonExists(json, "staves"))
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
        }

        private static StaveSettings StavesFromJson(dynamic json)
        {
            StaveSettings staveSettings ;
            if (JsContext.@typeof(json) == "string")
            {
                staveSettings = new StaveSettings(json);
            }
            else if (json.id)
            {
                staveSettings = new StaveSettings(json.id);
                if (json.additionalSettings)
                {
                    string[] keys2 = Std.JsonKeys(json.additionalSettings);
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
            if (JsContext.@typeof(json) == "string")
            {
                layout.Mode = json;
            }
            else
            {
                if (json.mode) layout.Mode = json.mode;
                if (json.additionalSettings)
                {
                    string[] keys = Std.JsonKeys(json.additionalSettings);
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
            if (!relativeUrl.StartsWith("http") && !relativeUrl.StartsWith("https"))
            {
                var root = new StringBuilder();
                root.Append(HtmlContext.window.location.protocol);
                root.Append("//");
                root.Append(HtmlContext.window.location.hostname);
                if (HtmlContext.window.location.port.As<bool>())
                {
                    root.Append(":");
                    root.Append(HtmlContext.window.location.port);
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
