using System;
using AlphaTab.Collections;
using AlphaTab.Haxe;
using AlphaTab.Haxe.Js;
using AlphaTab.Util;
using Phase;

namespace AlphaTab
{
    public partial class CoreSettings
    {
        /// <summary>
        /// Gets or sets the script file url that will be used to spawn the workers.
        /// </summary>
        [JsonName("scriptFile")]
        public string ScriptFile { get; set; }

        /// <summary>
        /// Gets or sets the url to the fonts that will be used to generate the alphaTab font style.
        /// </summary>
        [JsonName("fontDirectory")]
        public string FontDirectory { get; set; }

        /// <summary>
        /// Gets or sets whether lazy loading for displayed elements is enabled.
        /// </summary>
        [JsonName("lazy")]
        public bool EnableLazyLoading { get; set; } = true;

        public CoreSettings()
        {
            var global = Lib.Global;
            if (global.document && global.ALPHATAB_ROOT)
            {
                ScriptFile = global.ALPHATAB_ROOT;
                ScriptFile = EnsureFullUrl(ScriptFile);
                ScriptFile = AppendScriptName(ScriptFile);
            }
            else
            {
                ScriptFile = Environment.ScriptFile;
            }

            if (global.document && global.ALPHATAB_FONT)
            {
                FontDirectory = global.ALPHATAB_FONT;
                FontDirectory = EnsureFullUrl(FontDirectory);
            }
            else
            {
                FontDirectory = ScriptFile;
                if (!string.IsNullOrEmpty(FontDirectory))
                {
                    var lastSlash = FontDirectory.LastIndexOf('/');
                    if (lastSlash >= 0)
                    {
                        FontDirectory = FontDirectory.Substring(0, lastSlash) + "/Font/";
                    }
                }
            }
        }

        private static string EnsureFullUrl(string relativeUrl)
        {
            var global = Lib.Global;
            if (!relativeUrl.StartsWith("http") && !relativeUrl.StartsWith("https") && !relativeUrl.StartsWith("file"))
            {
                var root = new StringBuilder();
                root.Append(global.location.protocol);
                root.Append("//");
                if (global.location.hostname)
                {
                    root.Append(global.location.hostname);
                }

                if (global.location.port)
                {
                    root.Append(":");
                    root.Append(global.location.port);
                }

                // as it is not clearly defined how slashes are treated in the location object
                // better be safe than sorry here
                string directory = global.location.pathname.split("/").slice(0, -1).join("/");
                if (directory.Length > 0)
                {
                    if (!directory.StartsWith("/"))
                    {
                        root.Append("/");
                    }

                    root.Append(directory);
                }


                if (!relativeUrl.StartsWith("/"))
                {
                    root.Append("/");
                }

                root.Append(relativeUrl);

                return root.ToString();
            }

            return relativeUrl;
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

    }

    public partial class PlayerSettings
    {
        /// <summary>
        /// Gets or sets the URl of the sound font to be loaded.
        /// </summary>
        [JsonName("soundFont")]
        public string SoundFontFile { get; set; }

        /// <summary>
        /// Gets or sets the element that should be used for scrolling.
        /// </summary>
        [JsonName("scrollElement")]
        public string ScrollElement { get; set; } = "html,body";
    }

    /// <summary>
    /// This public class contains instance specific settings for alphaTab
    /// </summary>
    public partial class Settings
    {
        public static Settings FromJson(dynamic json)
        {
            return null; // dynamically implemented via macro
        }

        public static object ToJson(Settings settings)
        {
            return null; // dynamically implemented via macro
        }

        public void FillFromDataAttributes(dynamic dataAttributes)
        {
            var keys = Script.Write<string[]>("untyped __js__(\"Object.keys({0})\", dataAttributes)");
            foreach (var key in keys)
            {
                object value;
                try
                {
                    value = Json.Parse(dataAttributes[key]);
                }
                catch
                {
                    value = dataAttributes[key];
                }
                SetProperty(key.ToLower(), value);
            }
        }

        public bool SetProperty(string property, dynamic value)
        {
            // dynamically implemented via macro
            return false;
        }

    }
}
