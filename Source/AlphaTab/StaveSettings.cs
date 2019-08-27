using AlphaTab.Collections;

namespace AlphaTab
{
    /// <summary>
    /// Represents the stave specific settings.
    /// </summary>
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
        /// Additional staffe specific settings
        /// <strong>id=tab</strong>
        /// <ul>
        ///  <li><strong>rhythm</strong> - Renders rhythm beams to tablature notes</li>
        /// </ul>
        /// </summary>
        public FastDictionary<string, object> AdditionalSettings { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="StaveSettings"/> class.
        /// </summary>
        /// <param name="id">The id of the settings defining the display mode.</param>
        public StaveSettings(string id)
        {
            Id = id;
            AdditionalSettings = new FastDictionary<string, object>();
        }

        /// <summary>
        /// Gets the staff layout specific setting using the given key.
        /// </summary>
        /// <typeparam name="T">The data type fo the stored value.</typeparam>
        /// <param name="key">The key of the setting.</param>
        /// <param name="def">The default value to return if no setting was specified.</param>
        /// <returns>The user defined setting for the given key, or <paramref name="def"/> if the user did not specify a custom setting.</returns>
        public T Get<T>(string key, T def)
        {
            if (AdditionalSettings.ContainsKey(key.ToLower()))
            {
                return (T)AdditionalSettings[key.ToLower()];
            }

            if (AdditionalSettings.ContainsKey(key))
            {
                return (T)AdditionalSettings[key];
            }

            return def;
        }
    }
}
