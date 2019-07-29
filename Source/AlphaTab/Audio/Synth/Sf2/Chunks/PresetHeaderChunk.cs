using System;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2.Chunks
{
    class PresetHeaderChunk : Chunk
    {
        private readonly RawPreset[] _rawPresets;

        public PresetHeaderChunk(string id, int size, IReadable input)
            : base(id, size)
        {
            if (size % 38 != 0)
                throw new Exception("Invalid SoundFont. The preset chunk was invalid.");

            _rawPresets = new RawPreset[((int)(size / 38.0))];
            RawPreset lastPreset = null;
            for (int x = 0; x < _rawPresets.Length; x++)
            {
                var p = new RawPreset();
                p.Name = input.Read8BitStringLength(20);
                p.PatchNumber = input.ReadUInt16LE();
                p.BankNumber = input.ReadUInt16LE();
                p.StartPresetZoneIndex = input.ReadUInt16LE();
                p.Library = input.ReadInt32LE();
                p.Genre = input.ReadInt32LE();
                p.Morphology = input.ReadInt32LE();
                if (lastPreset != null)
                {
                    lastPreset.EndPresetZoneIndex = Platform.Platform.ToUInt16((p.StartPresetZoneIndex - 1));
                }
                _rawPresets[x] = p;
                lastPreset = p;
            }
        }

        public PresetHeader[] ToPresets(Zone[] presetZones)
        {
            var presets = new PresetHeader[(_rawPresets.Length - 1)];
            for (int x = 0; x < presets.Length; x++)
            {
                var rawPreset = _rawPresets[x];
                var p = new PresetHeader();
                p.BankNumber = rawPreset.BankNumber;
                p.Genre = rawPreset.Genre;
                p.Library = rawPreset.Library;
                p.Morphology = rawPreset.Morphology;
                p.Name = rawPreset.Name;
                p.PatchNumber = rawPreset.PatchNumber;
                p.Zones = new Zone[(rawPreset.EndPresetZoneIndex - rawPreset.StartPresetZoneIndex + 1)];
                Platform.Platform.ArrayCopy(presetZones, rawPreset.StartPresetZoneIndex, p.Zones, 0, p.Zones.Length);
                presets[x] = p;
            }
            return presets;
        }
    }

    class RawPreset
    {
        public string Name { get; set; }
        public int PatchNumber { get; set; }
        public int BankNumber { get; set; }
        public int StartPresetZoneIndex { get; set; }
        public int EndPresetZoneIndex { get; set; }
        public int Library { get; set; }
        public int Genre { get; set; }
        public int Morphology { get; set; }
    }
}
