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
                new Gp3To5Importer(), new GpxImporter(), new Gp7Importer(), new AlphaTexImporter(),
                new MusicXmlImporter()
            };
        }

        /// <summary>
        /// Initializes the importer with the given data and settings.
        /// </summary>
        /// <param name="data"></param>
        /// <param name="settings"></param>
        public void Init(IReadable data, Settings settings)
        {
            Data = data;
            Settings = settings;
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
