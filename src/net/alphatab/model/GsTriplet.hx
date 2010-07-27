/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsTriplet
{
	public static inline var Normal:GsTriplet = new GsTriplet();
	
	public var Enters:Int;
	public var Times:Int;
	
	public function new()
	{
		this.Enters = 1;
		this.Times = 1;
	}
	
	public function Copy(triplet:GsTriplet) : Void
	{
		triplet.Enters = this.Enters;
		triplet.Times = this.Times;
	}
	
	public function ConvertTime(time:Int) : Int
	{
		return Math.floor(time * this.Times / this.Enters);
	}
	
	public function Equals(triplet:GsTriplet) : Bool
	{
		return this.Enters == triplet.Enters && this.Times == triplet.Times;
	}
		
	public function Clone(factory:GsSongFactory) : GsTriplet
	{
		var triplet:GsTriplet = factory.NewTriplet();
		Copy(triplet);
		return triplet;
	}
}