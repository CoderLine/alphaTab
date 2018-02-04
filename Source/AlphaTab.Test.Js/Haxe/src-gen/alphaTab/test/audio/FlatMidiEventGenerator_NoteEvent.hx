package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_NoteEvent extends alphaTab.test.audio.FlatMidiEventGenerator_ChannelMidiEvent
{
    public var Length(default, default) : system.Int32;

    public var Key(default, default) : system.Byte;

    public var DynamicValue(default, default) : alphaTab.model.DynamicValue;

    public override function ToString() : system.CsString 
    {
        return "Note: " + super.ToString() + " Length[" + Length + "] Key[" + Key + "] Dynamic[" + DynamicValue + "]";

    }

    private function Equals_FlatMidiEventGenerator_NoteEvent(other : alphaTab.test.audio.FlatMidiEventGenerator_NoteEvent) : system.Boolean 
    {
        return super.Equals_FlatMidiEventGenerator_ChannelMidiEvent(other) && Length == other.Length && Key.ToInt32_IFormatProvider(null) == other.Key.ToInt32_IFormatProvider(null) && DynamicValue == other.DynamicValue;

    }

    public override function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_NoteEvent(cast(obj));

    }

    public override function GetHashCode() : system.Int32 
    {
        {
            var hashCode : system.Int32 = super.GetHashCode();
            hashCode = (hashCode * 397) ^ Length;
            hashCode = (hashCode * 397) ^ Key.GetHashCode();
            hashCode = (hashCode * 397) ^ DynamicValue.ToInt32_IFormatProvider(null);
            return hashCode;

        }
    }

    public function new() 
    {
        super();
    }

}
