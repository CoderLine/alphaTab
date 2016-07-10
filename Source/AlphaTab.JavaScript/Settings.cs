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
using SharpKit.JavaScript;

namespace AlphaTab
{
    /// <summary>
    /// This public class contains instance specific settings for alphaTab
    /// </summary>
    public partial class Settings
    {
       

        public dynamic ToJson()
        {
            dynamic json = Std.NewObject();

            json.scale = Scale;
            json.width = Width;
            json.height = Height;
            json.engine = Engine;
            json.stretchForce = StretchForce;
            json.forcePianoFingering = ForcePianoFingering;

            json.layout = Std.NewObject();
            json.layout.mode = Layout.Mode;
            json.layout.additionalSettings = Std.NewObject();
            foreach (string setting in Layout.AdditionalSettings)
            {
                json.layout.additionalSettings[setting] = Layout.AdditionalSettings[setting];
            }

            FastList<dynamic> staves = new FastList<dynamic>();
            json.staves = staves;

            foreach (var staff in Staves)
            {
                var s = Std.NewObject();
                s.id = staff.Id;
                s.additionalSettings = Std.NewObject();
                foreach (var additionalSetting in staff.AdditionalSettings)
                {
                    s.additionalSettings[additionalSetting] = staff.AdditionalSettings[additionalSetting];
                }
                staves.Add(s);
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

            FillFromJson(settings, json);

            return settings;
        }
        public static void FillFromJson(Settings settings, dynamic json)
        {
            if (!json) return;
            if (Std.JsonExists(json, "scale")) settings.Scale = json.scale;
            if (Std.JsonExists(json, "width")) settings.Width = json.width;
            if (Std.JsonExists(json, "height")) settings.Height = json.height;
            if (Std.JsonExists(json, "engine")) settings.Engine = json.engine;
            if (Std.JsonExists(json, "stretchForce")) settings.StretchForce = json.stretchForce;
            if (Std.JsonExists(json, "forcePianoFingering")) settings.ForcePianoFingering = json.forcePianoFingering;

            if (Std.JsonExists(json, "layout"))
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
                        string[] keys = Std.JsonKeys(json.layout.additionalSettings);
                        foreach (var key in keys)
                        {
                            settings.Layout.AdditionalSettings[key] = json.layout.additionalSettings[key];
                        }
                    }
                }
            }

            if (Std.JsonExists(json, "staves"))
            {
                settings.Staves = new FastList<StaveSettings>();
                string[] keys = Std.JsonKeys(json.staves);
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
                                string[] keys2 = Std.JsonKeys(val.additionalSettings);
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
        }
    }
}
