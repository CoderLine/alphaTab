package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_TrackEndEvent extends alphaTab.test.audio.FlatMidiEventGenerator_TrackMidiEvent
{
    public override function ToString() : system.CsString 
    {
        return "End of Track " + super.ToString();

    }

    public function new() 
    {
        super();
    }

}
