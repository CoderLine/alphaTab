/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;

class GsDuration
{
	public static inline var QuarterTime:Int = 960;
	public static inline var Whole:Int = 1;
	public static inline var Half:Int = 2;
	public static inline var Quarter:Int = 4;
	public static inline var Eighth:Int = 8;
	public static inline var Sixteenth:Int = 16;
	public static inline var ThirtySecond:Int = 32;
	public static inline var SixtyFourth:Int = 64;
	
	public var Value:Int;
	public var IsDotted:Bool;
	public var IsDoubleDotted:Bool;
	public var Triplet:GsTriplet;
	
	public function Time() : Int
	{
		var time:Int = Math.floor(GsDuration.QuarterTime * (4.0/this.Value));
		if(this.IsDotted)
		{
			time += Math.floor(time/2);
		}			
		else if(this.IsDoubleDotted)
		{
			time += Math.floor((time/4)*3);
		}
		return this.Triplet.ConvertTime(time);
	}
	
	public function Index() : Int
	{
		var index:Int = 0;
		var value:Int = this.Value;
		while((value = (value >> 1)) > 0)
		{
			index++;
		}	
		return index;
	}
	
	public function new(factory:GsSongFactory)
	{
		this.Value = GsDuration.Quarter;
		this.IsDotted = false;
		this.IsDoubleDotted = false;
		this.Triplet = factory.NewTriplet();
	}
	
	public function Copy(duration:GsDuration) : Void
	{
		duration.Value = this.Value;
		duration.IsDotted = this.IsDotted;
		duration.IsDoubleDotted = this.IsDoubleDotted;
		this.Triplet.Copy(duration.Triplet);
	}
	
	public static function FromTime(factory:GsSongFactory, time:Int, minimum:GsDuration, diff:Int) : GsDuration
	{
		var duration:GsDuration = minimum.Clone(factory);
		var tmp:GsDuration = factory.NewDuration();
		tmp.Value = Whole;
		tmp.IsDotted = true;
		var finish:Bool = false;
		while(!finish)
		{
			var tmpTime:Int = tmp.Time();
			if(tmpTime - diff <= time)
			{
				if(Math.abs(tmpTime-time) < Math.abs(duration.Time() - time))
				{
					duration = tmp.Clone(factory);
				}
			}
			if(tmp.IsDotted)
			{
				tmp.IsDotted = false;
			}
			else if(tmp.Triplet.Equals(GsTriplet.Normal))
			{
				tmp.Triplet.Enters = 3;
				tmp.Triplet.Times = 2;
			}
			else
			{
				tmp.Value = tmp.Value*2;
				tmp.IsDotted = true;
				tmp.Triplet.Enters = 1;
				tmp.Triplet.Times = 1;
			}
			if(tmp.Value > GsDuration.SixtyFourth)
			{
				finish = true;
			}
		}
		return duration;
	}
	
	public function Clone(factory:GsSongFactory) : GsDuration
	{
		var duration:GsDuration = factory.NewDuration();
		duration.Value = this.Value;
		duration.IsDotted = this.IsDotted;
		duration.IsDoubleDotted = this.IsDoubleDotted;
		duration.Triplet = this.Triplet.Clone(factory);
		return duration;
	}
	
	public function Equals(other:GsDuration) : Bool
	{
		if(other == null) return false;
		if(this == other) return true;
		return other.Value == this.Value && 
				other.IsDotted == this.IsDotted && 
				other.IsDoubleDotted == this.IsDoubleDotted && 
				other.Triplet.Equals(this.Triplet);
	}

}