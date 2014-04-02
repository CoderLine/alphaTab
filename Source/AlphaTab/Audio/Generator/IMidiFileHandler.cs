using AlphaTab.Model;

namespace AlphaTab.Audio.Generator
{
    /// <summary>
    /// A handler is responsible for writing midi events to a custom structure
    /// </summary>
    public interface IMidiFileHandler
    {
        void AddTimeSignature(int tick, int timeSignatureNumerator, int timeSignatureDenominator);
        void AddRest(int track, int tick, int channel);
        void AddNote(int track, int start, int length, byte key, DynamicValue dynamicValue, byte channel);
        void AddControlChange(int track, int tick, byte channel, byte controller, byte value);
        void AddProgramChange(int track, int tick, byte channel, byte program);
        void AddTempo(int tick, int tempo);
        void AddBend(int track, int tick, byte channel, byte value);
        void AddMetronome(int start, int length);
    }
}
