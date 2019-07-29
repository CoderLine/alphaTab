using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Midi.Event
{
    internal class MetaDataEvent : MetaEvent
    {
        public byte[] Data { get; private set; }

        public MetaDataEvent(int delta, byte status, byte metaId, byte[] data)
            : base(delta, status, metaId, 0)
        {
            Data = data;
        }

        public override void WriteTo(IWriteable s)
        {
            s.WriteByte(0xFF);
            s.WriteByte((byte)MetaStatus);

            var l = Data.Length;
            MidiFile.WriteVariableInt(s, l);
            s.Write(Data, 0, Data.Length);
        }
    }
}
