package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_RestEvent extends alphaTab.test.audio.FlatMidiEventGenerator_ChannelMidiEvent
{
    public override function ToString() : system.CsString 
    {
        return "Rest: " + super.ToString();

    }

    public override function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_ChannelMidiEvent(cast(obj));

    }

    public function new() 
    {
        super();
    }

}
