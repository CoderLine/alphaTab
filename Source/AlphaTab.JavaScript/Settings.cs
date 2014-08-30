using System.Runtime.CompilerServices;
using AlphaTab.Collections;

namespace AlphaTab
{
    /// <summary>
    /// This public class contains instance specific settings for alphaTab
    /// </summary>
    public partial class Settings
    {
        [InlineCodeAttribute("{property} in {json}")]
        private static bool JsonExists(dynamic json, string property)
        {
            return false;
        }

        [InlineCode("Object.keys({json})")]
        private static string[] JsonKeys(dynamic json)
        {
            return null;
        }

        public static Settings FromJson(dynamic json)
        {
            if (json is Settings)
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
                if (json.layout is string)
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
                    if (val is string)
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
                        }
                    }
                }
            }

            return settings;
        }
    }
}
