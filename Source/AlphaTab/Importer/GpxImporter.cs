using AlphaTab.Model;
using AlphaTab.Util;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This ScoreImporter can read Guitar Pro 6 (gpx) files.
    /// </summary>
    internal class GpxImporter : ScoreImporter
    {
        public override string Name => "Guitar Pro 6";

        public override Score ReadScore()
        {
            // at first we need to load the binary file system
            // from the GPX container
            Logger.Info(Name, "Loading GPX filesystem");
            var fileSystem = new GpxFileSystem();
            fileSystem.FileFilter = s =>
                    s.EndsWith(GpxFileSystem.ScoreGpif)
                    || s.EndsWith(GpxFileSystem.BinaryStylesheet)
                    || s.EndsWith(GpxFileSystem.PartConfiguration)
                ;
            fileSystem.Load(Data);
            Logger.Info(Name, "GPX filesystem loaded");

            string xml = null;
            byte[] binaryStylesheet = null;
            byte[] partConfiguration = null;
            foreach (var entry in fileSystem.Files)
            {
                switch (entry.FileName)
                {
                    case GpxFileSystem.ScoreGpif:
                        xml = Platform.Platform.ToString(entry.Data, Settings.Importer.Encoding);
                        break;
                    case GpxFileSystem.BinaryStylesheet:
                        binaryStylesheet = entry.Data;
                        break;
                    case GpxFileSystem.PartConfiguration:
                        partConfiguration = entry.Data;
                        break;
                }
            }

            // lets set the fileSystem to null, maybe the garbage collector will come along
            // and kick the fileSystem binary data before we finish parsing
            fileSystem.Files = null;
            fileSystem = null;

            // the score.gpif file within this filesystem stores
            // the score information as XML we need to parse.
            Logger.Info(Name, "Start Parsing score.gpif");
            var gpifParser = new GpifParser();
            gpifParser.ParseXml(xml, Settings);
            Logger.Info(Name, "score.gpif parsed");

            var score = gpifParser.Score;

            if (binaryStylesheet != null)
            {
                Logger.Info(Name, "Start Parsing BinaryStylesheet");
                var stylesheetParser = new BinaryStylesheetParser();
                stylesheetParser.Parse(binaryStylesheet);
                if (stylesheetParser.Stylesheet != null)
                {
                    stylesheetParser.Stylesheet.Apply(score);
                }

                Logger.Info(Name, "BinaryStylesheet parsed");
            }

            if (partConfiguration != null)
            {
                Logger.Info(Name, "Start Parsing Part Configuration");
                var partConfigurationParser = new PartConfigurationParser();
                partConfigurationParser.Parse(partConfiguration);
                if (partConfigurationParser.Configuration != null)
                {
                    partConfigurationParser.Configuration.Apply(score);
                }

                Logger.Info(Name, "Part Configuration parsed");
            }

            return score;
        }
    }
}
