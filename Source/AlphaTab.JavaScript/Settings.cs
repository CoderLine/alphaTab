/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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

        public dynamic ToJson()
        {
            dynamic json = Std.NewObject();

            json.scale = Scale;
            json.width = Width;
            json.height = Height;
            json.engine = Engine;
            json.stretchForce = StretchForce;
            json.forcePianoFingering = ForcePianoFingering;

            json.scriptFile = ScriptFile;
            json.fontDirectory = FontDirectory;

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

        public static Settings FromJson(dynamic json)
        {
            if (Std.InstanceOf<Settings>(json))
            {
                return (Settings)json;
            }

            var settings = Defaults;
            settings.ScriptFile = Environment.ScriptFile;

            FillFromJson(settings, json);

            return settings;
        }

        public static void FillFromJson(Settings settings, dynamic json)
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

            if (!json)
            {
                return;
            }

            if (Std.JsonExists(json, "scale")) settings.Scale = json.scale;
            if (Std.JsonExists(json, "width")) settings.Width = json.width;
            if (Std.JsonExists(json, "height")) settings.Height = json.height;
            if (Std.JsonExists(json, "engine")) settings.Engine = json.engine;
            if (Std.JsonExists(json, "stretchForce")) settings.StretchForce = json.stretchForce;
            if (Std.JsonExists(json, "forcePianoFingering")) settings.ForcePianoFingering = json.forcePianoFingering;

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

            if (Std.JsonExists(json, "staves"))
            {
                var val = json.staves;
                if (JsContext.@typeof(val) == "string")
                {
                    settings.Staves = new StaveSettings(val);
                }
                else
                {
                    if (val.id)
                    {
                        var staveSettings = new StaveSettings(val.id);
                        if (val.additionalSettings)
                        {
                            string[] keys2 = Std.JsonKeys(val.additionalSettings);
                            foreach (var key2 in keys2)
                            {
                                staveSettings.AdditionalSettings[key2] = val.additionalSettings[key2];
                            }
                        }
                        settings.Staves = staveSettings;
                    }
                }
            }
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
                        layout.AdditionalSettings[key] = json.additionalSettings[key];
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
