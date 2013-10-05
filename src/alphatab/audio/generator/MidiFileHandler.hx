package alphatab.audio.generator;
import alphatab.audio.model.MidiFile;
import alphatab.model.DynamicValue;

class MidiFileHandler
{
    public static inline var Volume:Int = 0x07;
    public static inline var Balance:Int = 0x0A;
    public static inline var Expression:Int = 0x0B;
    
    public static inline var DefaultMetronomeKey:Int = 0x25;
    public static inline var DefaultDurationDead:Int = 30;
    public static inline var DefaultDurationPalmMute:Int = 80;

        
    private var _midiFile:MidiFile;
    public function new(midiFile:MidiFile) 
    {
        _midiFile = midiFile;
    }
    
    public function addTimeSignature(tick:Int, timeSignatureNumerator:Int, timeSignatureDenominator:Int)
    {
        
    }
    
    public function addRest(track:Int, start:Int, channel:Int)
    {
        
    }
    
    public function addNote(track:Int, start:Int, length:Int, key:Int, dynamicValue:DynamicValue, channel:Int)
    {
        
    }
    
    public function addControlChange(track:Int, tick:Int, channel:Int, controller:Int, value:Int)
    {
        
    }    
    
    public function addProgramChange(track:Int, tick:Int, channel:Int, program:Int)
    {
        
    }    
    
    public function addTempo(tick:Int, tempo:Int)
    {
        
    }
    
}