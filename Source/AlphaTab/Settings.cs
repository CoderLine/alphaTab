using System.Runtime.CompilerServices;
using AlphaTab.Collections;

namespace AlphaTab
{
    /// <summary>
    /// This public class contains instance specific settings for alphaTab
    /// </summary>
    public class Settings
    {
        /// <summary>
        /// Sets the zoom level of the rendered notation
        /// </summary>
        [IntrinsicProperty]
        public float Scale { get; set; }

        /// <summary>
        /// The initial size of the canvas during loading or the width when {@see autoSize} set to false
        /// </summary>
        [IntrinsicProperty]
        public int Width { get; set; }

        /// <summary>
        /// The initial size of the canvas during loading or the fixed height on some layouts. 
        /// </summary>
        [IntrinsicProperty]
        public int Height { get; set; }

        /// <summary>
        /// The engine which should be used to render the the tablature. 
        /// <ul>
        ///  <li><strong>default</strong> - Platform specific default engine</li>
        ///  <li><strong>html5</strong> - Canvas with VRML Fallback</li>
        ///  <li><strong>svg</strong> -  SVG </li>
        /// </ul>
        /// </summary>
        [IntrinsicProperty]
        public string Engine { get; set; }

        /// <summary>
        /// The layout specific settings
        /// </summary>
        [IntrinsicProperty]
        public LayoutSettings Layout { get; set; }

        /// <summary>
        /// The staves to create for each row.
        /// </summary>
        [IntrinsicProperty]
        public FastList<StaveSettings> Staves { get; set; }

        public static Settings Defaults
        {
            get
            {
                var settings = new Settings();

                settings.Scale = 1.0f;
                settings.Width = 600;
                settings.Height = 200;
                settings.Engine = "default";

                settings.Layout = LayoutSettings.Defaults;

                settings.Staves = new FastList<StaveSettings>();

                settings.Staves.Add(new StaveSettings("marker"));
                //settings.staves.Add(new StaveSettings("triplet-feel"));
                settings.Staves.Add(new StaveSettings("tempo"));
                settings.Staves.Add(new StaveSettings("text"));
                settings.Staves.Add(new StaveSettings("chords"));
                settings.Staves.Add(new StaveSettings("trill"));
                settings.Staves.Add(new StaveSettings("beat-vibrato"));
                settings.Staves.Add(new StaveSettings("note-vibrato"));
                settings.Staves.Add(new StaveSettings("alternate-endings"));

                settings.Staves.Add(new StaveSettings("score"));

                settings.Staves.Add(new StaveSettings("crescendo"));
                settings.Staves.Add(new StaveSettings("dynamics"));
                settings.Staves.Add(new StaveSettings("trill"));
                settings.Staves.Add(new StaveSettings("beat-vibrato"));
                settings.Staves.Add(new StaveSettings("note-vibrato"));
                settings.Staves.Add(new StaveSettings("tap"));
                settings.Staves.Add(new StaveSettings("fade-in"));
                settings.Staves.Add(new StaveSettings("let-ring"));
                settings.Staves.Add(new StaveSettings("palm-mute"));

                settings.Staves.Add(new StaveSettings("tab"));

                settings.Staves.Add(new StaveSettings("pick-stroke"));
                //settings.staves.Add(new StaveSettings("fingering"));

                return settings;
            }
        }

#if JavaScript
        [System.Runtime.CompilerServices.InlineCodeAttribute("{property} in {json}")]
        private static bool JsonExists(dynamic json, string property)
        {
            return false;
        }

        [InlineCode("Object.keys({json})")]
        private static string[] JsonKeys(dynamic json)
        {
            return null;
        }

        public static Settings fromJson(dynamic json)
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
#endif

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
        [IntrinsicProperty]
        public string Mode { get; set; }

        /// <summary>
        /// Additional layout mode specific settings.
        /// <strong>mode=page</strong>
        /// <ul>
        ///  <li><strong>autoSize</strong> - Whether the width of the canvas should be automatically determined by the used layout. (bool, default:true)</li>
        ///  <li><strong>barsPerRow</strong> - Limit the displayed bars per row, <em>-1 for sized based limit<em> (integer, default:-1)</li>
        ///  <li><strong>spacingScale</strong> - Control how closely glyphs are spaced (float, default:1.0f)</li>
        ///  <li><strong>start</strong> - The bar start index to start layouting with (integer: default: 0)</li>
        ///  <li><strong>count</strong> - The amount of bars to render overall, <em>-1 for all till the end</em>  (integer, default:-1)</li>
        ///  <li><strong>hideInfo</strong> - Render the song information or not (boolean, default:true)</li>
        /// </ul>
        /// <strong>mode=horizontal</strong>
        /// <ul>
        ///  <li><strong>start</strong> - The bar start index to start layouting with (integer: default: 0)</li>
        ///  <li><strong>count</strong> - The amount of bars to render overall, <em>-1 for all till the end</em>  (integer, default:-1)</li>
        /// </ul>
        /// </summary>
        [IntrinsicProperty]
        public FastDictionary<string, object> AdditionalSettings { get; set; }

        [IncludeGenericArguments(false)]
        public T Get<T>(string key, T def)
        {
            if (AdditionalSettings.ContainsKey(key))
            {
                return (T)(AdditionalSettings[key]);
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
        /// The stave identifier.
        /// Default Staves: 
        /// <ul>
        ///  <li><strong>marker</strong> - Renders section markers</li>
        ///  <li><strong>triplet-feel</strong> - Renders triplet feel indicators</li>
        ///  <li><strong>tempo</strong> - Renders a tempo identifier</li>
        ///  <li><strong>text</strong> - Renders custom text annotations</li>
        ///  <li><strong>chords</strong> - Renders chord names</li>
        ///  <li><strong>beat-vibrato</strong> - Renders beat vibrato symbols</li>
        ///  <li><strong>note-vibrato</strong> - Renders note vibrato symbols</li>
        ///  <li><strong>tuplet</strong> - Renders tuplet indicators</li>
        ///  <li><strong>score</strong> - Renders default music notation</li>
        ///  <li><strong>crescendo</strong> - Renders crescendo and decresencod</li>
        ///  <li><strong>dynamics</strong> - Renders dynamics markers</li>
        ///  <li><strong>tap</strong> - Renders tap/slap/pop indicators</li>
        ///  <li><strong>fade-in</strong> - Renders fade-in indicators</li>
        ///  <li><strong>let-ring</strong> - Renders let-ring indicators</li>
        ///  <li><strong>palm-mute</strong> - Renders palm-mute indicators</li>
        ///  <li><strong>tab</strong> - Renders guitar tablature</li>
        ///  <li><strong>fingering</strong> - Renders finger indicators</li>
        /// </ul>
        /// </summary>
        [IntrinsicProperty]
        public string Id { get; set; }

        /// <summary>
        /// Additional stave specific settings
        /// <strong>id=tab</strong>
        /// <ul>
        ///  <li><strong>rhythm</strong> - Renders rhythm beams to tablature notes</li>
        /// </ul>
        /// </summary>
        [IntrinsicProperty]
        public FastDictionary<string, object> AdditionalSettings { get; set; }

        public StaveSettings(string id)
        {
            Id = id;
            AdditionalSettings = new FastDictionary<string, object>();
        }
    }
}
