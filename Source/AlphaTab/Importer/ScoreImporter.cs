using AlphaTab.IO;
using AlphaTab.Model;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This is the base public class for creating new song importers which 
    /// enable reading scores from any binary datasource
    /// </summary>
    public abstract class ScoreImporter
    {
        /// <summary>
        /// The raw data to read from. 
        /// </summary>
        protected IReadable Data;
        /// <summary>
        /// The settings to use during the import. 
        /// </summary>
        protected Settings Settings;

        /**
         * Gets all default ScoreImporters
         * @return
         */
        public static ScoreImporter[] BuildImporters()
        {
            return new ScoreImporter[]
            {
                new Gp3To5Importer(),
                new GpxImporter(),
                new Gp7Importer(), 
                new AlphaTexImporter(),
                new MusicXmlImporter()
            };
        }

        /// <summary>
        /// Initializes the importer with the given data and settings. 
        /// </summary>
        /// <param name="data"></param>
        /// <param name="settings"></param>
        public void Init(IReadable data, Settings settings = null)
        {
            Data = data;
            Settings = settings;
        }

        /// <summary>
        /// Gets the importer specific setting using the specified key. 
        /// </summary>
        /// <param name="key">The key of the setting to load the value for.</param>
        /// <param name="defaultValue">The default value to load if no setting was specified. </param>
        /// <returns>The importer setting specified by the user, or the given defaultValue if the key was not contained.</returns>
        protected T GetSetting<T>(string key, T defaultValue = default(T))
        {
            key = key.ToLower();
            if (Settings == null || Settings.ImporterSettings == null || !Settings.ImporterSettings.ContainsKey(key))
            {
                return defaultValue;
            }

            return (T)Settings.ImporterSettings[key];
        }

        /// <summary>
        /// Get the human readable name of the importer. 
        /// </summary>
        public abstract string Name { get; }

        /// <summary>
        /// Reads the <see cref="Score"/> contained in the data. 
        /// </summary>
        /// <returns>The score that was contained in the data. </returns>
        public abstract Score ReadScore();
    }
}
