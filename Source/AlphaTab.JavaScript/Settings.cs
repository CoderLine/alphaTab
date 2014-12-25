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
using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Rendering.Staves;
using SharpKit.JavaScript;

namespace AlphaTab
{
    /// <summary>
    /// This public class contains instance specific settings for alphaTab
    /// </summary>
    public partial class Settings
    {
        [JsMethod(InlineCodeExpression = "property in json", Export = false)]
        private static bool JsonExists(dynamic json, string property)
        {
            return false;
        }

        [JsMethod(InlineCodeExpression = "Object.keys(json)", Export = false)]
        private static string[] JsonKeys(dynamic json)
        {
            return null;
        }

        public static Settings FromJson(dynamic json)
        {
            if (Std.InstanceOf<Settings>(json))
            {
                return (Settings)json;
            }

            var settings = Defaults;

            if (!json) return settings;
            if (JsonExists(json, "scale")) settings.Scale = json.scale;
            if (JsonExists(json, "width")) settings.Width = json.width;
            if (JsonExists(json, "height")) settings.Height = json.height;
            if (JsonExists(json, "engine")) settings.Engine = json.engine;

            if (JsonExists(json, "layout"))
            {
                if (JsContext.@typeof(json.layout) == "string")
                {
                    settings.Layout.Mode = json.layout;
                }
                else
                {
                    if (json.layout.mode) settings.Layout.Mode = json.layout.mode;
                    if (json.layout.additionalSettings)
                    {
                        string[] keys = JsonKeys(json.layout.additionalSettings);
                        foreach (var key in keys)
                        {
                            settings.Layout.AdditionalSettings[key] = json.layout.additionalSettings[key];
                        }
                    }
                }
            }

            if (JsonExists(json, "staves"))
            {
                settings.Staves = new FastList<StaveSettings>();
                string[] keys = JsonKeys(json.staves);
                foreach (var key in keys)
                {
                    var val = json.staves[key];
                    if (JsContext.@typeof(val) == "string")
                    {
                        settings.Staves.Add(new StaveSettings(val));
                    }
                    else
                    {
                        if (val.id)
                        {
                            var staveSettings = new StaveSettings(val.id);
                            if (val.additionalSettings)
                            {
                                string[] keys2 = JsonKeys(val.additionalSettings);
                                foreach (var key2 in keys2)
                                {
                                    staveSettings.AdditionalSettings[key2] = val.additionalSettings[key2];
                                }
                            }
                            settings.Staves.Add(staveSettings);
                        }
                    }
                }
            }

            return settings;
        }
    }
}
