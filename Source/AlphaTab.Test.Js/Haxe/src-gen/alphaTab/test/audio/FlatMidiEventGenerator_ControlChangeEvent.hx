package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_ControlChangeEvent extends alphaTab.test.audio.FlatMidiEventGenerator_ChannelMidiEvent
{
    public var Controller(default, default) : system.Byte;

    public var Value(default, default) : system.Byte;

    public override function ToString() : system.CsString 
    {
        return "ControlChange: " + super.ToString() + " Controller[" + Controller + "] Value[" + Value + "]";

    }

    private function Equals_FlatMidiEventGenerator_ControlChangeEvent(other : alphaTab.test.audio.FlatMidiEventGenerator_ControlChangeEvent) : system.Boolean 
    {
        return super.Equals_FlatMidiEventGenerator_ChannelMidiEvent(other) && Controller.ToInt32_IFormatProvider(null) == other.Controller.ToInt32_IFormatProvider(null) && Value.ToInt32_IFormatProvider(null) == other.Value.ToInt32_IFormatProvider(null);

    }

    public override function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_ControlChangeEvent(cast(obj));

    }

    public override function GetHashCode() : system.Int32 
    {
        {
            var hashCode : system.Int32 = super.GetHashCode();
            hashCode = (hashCode * 397) ^ Controller.GetHashCode();
            hashCode = (hashCode * 397) ^ Value.GetHashCode();
            return hashCode;

        }
    }

    public function new() 
    {
        super();
    }

}
