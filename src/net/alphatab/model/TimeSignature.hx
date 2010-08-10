package net.alphatab.model;

/**
 * A time signature.
 */
class TimeSignature
{
	public var denominator:Duration;
	public var numerator:Int;
	
	public function new(factory:SongFactory)
	{
		numerator = 4;
		denominator = factory.newDuration();
	}
	
	public function copy(timeSignature:TimeSignature) : Void
	{
		timeSignature.numerator = this.numerator;
		denominator.copy(timeSignature.denominator);
	}

}