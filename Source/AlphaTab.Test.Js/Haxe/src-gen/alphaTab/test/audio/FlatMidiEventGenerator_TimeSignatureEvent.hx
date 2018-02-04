package alphaTab.test.audio;

using system.HaxeExtensions;
class FlatMidiEventGenerator_TimeSignatureEvent extends alphaTab.test.audio.FlatMidiEventGenerator_MidiEvent
{
    public var Numerator(default, default) : system.Int32;

    public var Denominator(default, default) : system.Int32;

    public override function ToString() : system.CsString 
    {
        return "TimeSignature: " + super.ToString() + " Numerator[" + Numerator + "] Denominator[" + Denominator + "]";

    }

    private function Equals_FlatMidiEventGenerator_TimeSignatureEvent(other : alphaTab.test.audio.FlatMidiEventGenerator_TimeSignatureEvent) : system.Boolean 
    {
        return super.Equals_FlatMidiEventGenerator_MidiEvent(other) && Numerator == other.Numerator && Denominator == other.Denominator;

    }

    public override function Equals_Object(obj : system.Object) : system.Boolean 
    {
        if (system.ObjectExtensions.ReferenceEquals(null, obj))
        return false;

        if (system.ObjectExtensions.ReferenceEquals(this, obj))
        return true;

        if (system.ObjectExtensions.GetType(obj) != system.ObjectExtensions.GetType(this))
        return false;

        return Equals_FlatMidiEventGenerator_TimeSignatureEvent(cast(obj));

    }

    public override function GetHashCode() : system.Int32 
    {
        {
            var hashCode : system.Int32 = super.GetHashCode();
            hashCode = (hashCode * 397) ^ Numerator;
            hashCode = (hashCode * 397) ^ Denominator;
            return hashCode;

        }
    }

    public function new() 
    {
        super();
    }

}
