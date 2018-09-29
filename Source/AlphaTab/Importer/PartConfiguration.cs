using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Model;

namespace AlphaTab.Importer
{
    class PartConfiguration
    {
        public class Part
        {
            public bool IsMultiRest { get; set; }

            public FastList<TrackConfiguration> Tracks
            {
                get;
                set;
            }

            public Part()
            {
                Tracks = new FastList<TrackConfiguration>();
            }
        }

        public class TrackConfiguration
        {
            public bool IsVisible { get; set; }
            public bool ShowSlash { get; set; }
            public bool ShowStandardNotation { get; set; }
            public bool ShowTablature { get; set; }
        }

        public FastList<Part> Parts { get; set; }
        public int ZoomLevel { get; set; }
        public int Layout { get; set; }

        public PartConfiguration()
        {
            Parts = new FastList<Part>();
        }

        public void Apply(Score score)
        {
            var staffIndex = 0;
            var trackIndex = 0;

            // the PartConfiguration is really twisted compared to how the score structure looks like. 
            // the first part typically contains the settings for the first staff of all tracks. 
            // but then there is 1 part with 1 track for each other staff of the tracks. 
            // So the structure in the PartConfig appears to be:
            // Parts[0].Tracks = { Track1-Staff1, Track2-Staff1, Track3-Staff1, Track4-Staff1, .. }
            // Parts[1].Tracks = { Track1-Staff2 }
            // Parts[2].Tracks = { Track2-Staff2 }
            // Parts[3].Tracks = { Track3-Staff2 }
            // Parts[4].Tracks = { Track4-Staff2 }
            //
            // even if a track has only 1 staff, there are 2 staff configurations stored.
            // I hope Arobas never changes this in the format as the PartConfiguration is not versionized. 

            foreach (var part in Parts)
            {
                foreach (var trackConfig in part.Tracks)
                {
                    if (trackIndex < score.Tracks.Count)
                    {
                        var track = score.Tracks[trackIndex];
                        if (staffIndex < track.Staves.Count)
                        {
                            var staff = track.Staves[staffIndex];
                            staff.ShowTablature = trackConfig.ShowTablature;
                            staff.ShowStandardNotation = trackConfig.ShowStandardNotation;
                        }
                    }

                    trackIndex++;
                    if (trackIndex >= score.Tracks.Count)
                    {
                        staffIndex++;
                        trackIndex = 0;
                    }
                }
            }
        }
    }

    class PartConfigurationParser
    {
        public PartConfiguration Configuration { get; private set; }

        public void Parse(byte[] partConfigurationData)
        {
            Configuration = new PartConfiguration();

            ParsePartConfiguration(partConfigurationData);
        }

        private void ParsePartConfiguration(byte[] partConfigurationData)
        {
            var readable = ByteBuffer.FromBuffer(partConfigurationData);
            var entryCount = readable.ReadInt32BE();

            for (int i = 0; i < entryCount; i++)
            {
                var part = new PartConfiguration.Part();
                Configuration.Parts.Add(part);
                part.IsMultiRest = readable.GpReadBool();

                var groupCount = readable.ReadInt32BE();
                for (int j = 0; j < groupCount; j++)
                {
                    var flags = readable.ReadByte();
                    // enable at least standard notation
                    if (flags == 0)
                    {
                        flags = 1;
                    }

                    part.Tracks.Add(new PartConfiguration.TrackConfiguration
                    {
                        ShowStandardNotation = (flags & 0x01) != 0,
                        ShowTablature = (flags & 0x02) != 0,
                        ShowSlash = (flags & 0x04) != 0,
                    });
                }
            }
        }
    }
}
