package alphatab.importer;

/**
 * A mixtablechange describes several track changes. 
 */
class MixTableChange 
{
    public var volume:Int;
    public var balance:Int;
    public var instrument:Int;
    public var tempoName:String;
    public var tempo:Int;
    public var duration:Int;
    
    public function new()
    {
        volume = -1;
        balance = -1;
        instrument = -1;
        tempoName = null;
        tempo = -1;
        duration = 0;
    }
}