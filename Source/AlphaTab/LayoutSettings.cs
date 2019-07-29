using AlphaTab.Collections;

namespace AlphaTab
{
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
            if (AdditionalSettings.ContainsKey(key))
            {
                return (T)(AdditionalSettings[key]);
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
}