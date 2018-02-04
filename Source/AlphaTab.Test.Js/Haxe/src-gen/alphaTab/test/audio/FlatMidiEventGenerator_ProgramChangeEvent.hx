package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_ProgramChangeEvent extends alphaTab.test.audio.FlatMidiEventGenerator_ChannelMidiEvent
{
    public var Program(default, default) : system.Byte;

    public override function ToString() : system.CsString 
    {
        return "ProgramChange: " + super.ToString() + " Program[" + Program + "]";

    }

    private function Equals_FlatMidiEventGenerator_ProgramChangeEvent(other : alphaTab.test.audio.FlatMidiEventGenerator_ProgramChangeEvent) : system.Boolean 
    {
        return super.Equals_FlatMidiEventGenerator_ChannelMidiEvent(other) && Program.ToInt32_IFormatProvider(null) == other.Program.ToInt32_IFormatProvider(null);

    }

    public override function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_ProgramChangeEvent(cast(obj));

    }

    public override function GetHashCode() : system.Int32 
    {
        {
            return (super.GetHashCode() * 397) ^ Program.GetHashCode();

        }
    }

    public function new() 
    {
        super();
    }

}
