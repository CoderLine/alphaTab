using System;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2.Chunks
{
    internal class InstrumentChunk : Chunk
    {
        private RawInstrument[] _rawInstruments;

        public InstrumentChunk(string id, int size, IReadable input)
            : base(id, size)
        {
            if (size % 22 != 0)
            {
                throw new Exception("Invalid SoundFont. The preset chunk was invalid.");
            }

            _rawInstruments = new RawInstrument[(int)(size / 22.0)];
            RawInstrument lastInstrument = null;
            for (var x = 0; x < _rawInstruments.Length; x++)
            {
                var i = new RawInstrument();
                i.Name = input.Read8BitStringLength(20);
                i.StartInstrumentZoneIndex = input.ReadUInt16LE();
                if (lastInstrument != null)
                {
                    lastInstrument.EndInstrumentZoneIndex = Platform.Platform.ToUInt16(i.StartInstrumentZoneIndex - 1);
                }

                _rawInstruments[x] = i;
                lastInstrument = i;
            }
        }

        public Instrument[] ToInstruments(Zone[] zones)
        {
            var inst = new Instrument[_rawInstruments.Length - 1];
            for (var x = 0; x < inst.Length; x++)
            {
                var rawInst = _rawInstruments[x];
                var i = new Instrument();
                i.Name = rawInst.Name;
                i.Zones = new Zone[rawInst.EndInstrumentZoneIndex - rawInst.StartInstrumentZoneIndex + 1];
                Platform.Platform.ArrayCopy(zones, rawInst.StartInstrumentZoneIndex, i.Zones, 0, i.Zones.Length);
                inst[x] = i;
            }

            return inst;
        }
    }

    internal class RawInstrument
    {
        public string Name { get; set; }
        public int StartInstrumentZoneIndex { get; set; }
        public int EndInstrumentZoneIndex { get; set; }
    }
}
