using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2.Chunks
{
    internal class ZoneChunk : Chunk
    {
        private RawZoneData[] _zoneData;

        public ZoneChunk(string id, int size, IReadable input)
            : base(id, size)
        {
            _zoneData = new RawZoneData[(int)(size / 4.0)];

            RawZoneData lastZone = null;
            for (var x = 0; x < _zoneData.Length; x++)
            {
                var z = new RawZoneData();
                z.GeneratorIndex = input.ReadUInt16LE();
                z.ModulatorIndex = input.ReadUInt16LE();
                if (lastZone != null)
                {
                    lastZone.GeneratorCount = Platform.Platform.ToUInt16(z.GeneratorIndex - lastZone.GeneratorIndex);
                    lastZone.ModulatorCount = Platform.Platform.ToUInt16(z.ModulatorIndex - lastZone.ModulatorIndex);
                }

                _zoneData[x] = z;
                lastZone = z;
            }
        }

        public Zone[] ToZones(Modulator[] modulators, Generator[] generators)
        {
            var zones = new Zone[_zoneData.Length - 1];
            for (var x = 0; x < zones.Length; x++)
            {
                var rawZone = _zoneData[x];
                var zone = new Zone();
                zone.Generators = new Generator[rawZone.GeneratorCount];
                Platform.Platform.ArrayCopy(generators,
                    rawZone.GeneratorIndex,
                    zone.Generators,
                    0,
                    rawZone.GeneratorCount);
                zone.Modulators = new Modulator[rawZone.ModulatorCount];
                Platform.Platform.ArrayCopy(modulators,
                    rawZone.ModulatorIndex,
                    zone.Modulators,
                    0,
                    rawZone.ModulatorCount);
                zones[x] = zone;
            }

            return zones;
        }
    }

    internal class RawZoneData
    {
        public int GeneratorIndex { get; set; }
        public int ModulatorIndex { get; set; }
        public int GeneratorCount { get; set; }
        public int ModulatorCount { get; set; }
    }
}
