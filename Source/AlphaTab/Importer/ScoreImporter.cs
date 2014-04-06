using AlphaTab.IO;
using AlphaTab.Model;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This is the base public class for creating new song importers which 
    /// enable reading scores from any binary datasource
    /// </summary>
    abstract public class ScoreImporter
    {
        protected MemoryStream _data;

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
                new AlphaTexImporter()
            };
        }

        public virtual void Init(MemoryStream data)
        {
            _data = data;
        }

        public abstract Score ReadScore();
    }
}
