/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsTimeSignature
{
	public var Denominator:GsDuration;
	public var Numerator:Int;
	
	public function new(factory:GsSongFactory)
	{
		Numerator = 4;
		Denominator = factory.NewDuration();
	}
	
	public function Copy(timeSignature:GsTimeSignature) : Void
	{
		timeSignature.Numerator = this.Numerator;
		this.Denominator.Copy(timeSignature.Denominator);
	}

}