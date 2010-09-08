/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package net.alphatab.model;

/**
 * A duration.
 */
class Duration
{
	public static inline var QUARTER_TIME:Int = 960;
	
	public static inline var WHOLE:Int = 1;
	public static inline var HALF:Int = 2;
	public static inline var QUARTER:Int = 4;
	public static inline var EIGHTH:Int = 8;
	public static inline var SIXTEENTH:Int = 16;
	public static inline var THIRTY_SECOND:Int = 32;
	public static inline var SIXTY_FOURTH:Int = 64;
	
	public var value:Int;
	public var isDotted:Bool;
	public var isDoubleDotted:Bool;
	public var tuplet:Tuplet;
	
	public function time() : Int
	{
		var time:Int = Math.floor(Duration.QUARTER_TIME * (4.0/value));
		if(isDotted)
		{
			time += Math.floor(time/2);
		}			
		else if(isDoubleDotted)
		{
			time += Math.floor((time/4)*3);
		}
		return tuplet.convertTime(time);
	}
	
	public function index() : Int
	{
		var index:Int = 0;
		var value:Int = value;
		while((value = (value >> 1)) > 0)
		{
			index++;
		}	
		return index;
	}
	
	public function new(factory:SongFactory)
	{
		value = Duration.QUARTER;
		isDotted = false;
		isDoubleDotted = false;
		tuplet = factory.newTuplet();
	}
	
	public function copy(duration:Duration) : Void
	{
		duration.value = value;
		duration.isDotted = isDotted;
		duration.isDoubleDotted = isDoubleDotted;
		tuplet.copy(duration.tuplet);
	}
	
	public static function fromTime(factory:SongFactory, time:Int, minimum:Duration, diff:Int) : Duration
	{
		var duration:Duration = minimum.clone(factory);
		var tmp:Duration = factory.newDuration();
		tmp.value = WHOLE;
		tmp.isDotted = true;
		var finish:Bool = false;
		while(!finish)
		{
			var tmpTime:Int = tmp.time();
			if(tmpTime - diff <= time)
			{
				if(Math.abs(tmpTime-time) < Math.abs(duration.time() - time))
				{
					duration = tmp.clone(factory);
				}
			}
			if(tmp.isDotted)
			{
				tmp.isDotted = false;
			}
			else if(tmp.tuplet.equals(Tuplet.NORMAL))
			{
				tmp.tuplet.enters = 3;
				tmp.tuplet.times = 2;
			}
			else
			{
				tmp.value = tmp.value*2;
				tmp.isDotted = true;
				tmp.tuplet.enters = 1;
				tmp.tuplet.times = 1;
			}
			if(tmp.value > Duration.SIXTY_FOURTH)
			{
				finish = true;
			}
		}
		return duration;
	}
	
	public function clone(factory:SongFactory) : Duration
	{
		var duration:Duration = factory.newDuration();
		duration.value = value;
		duration.isDotted = isDotted;
		duration.isDoubleDotted = isDoubleDotted;
		duration.tuplet = tuplet.clone(factory);
		return duration;
	}
	
	public function equals(other:Duration) : Bool
	{
		if(other == null) return false;
		if(this == other) return true;
		return other.value == value && 
				other.isDotted == isDotted && 
				other.isDoubleDotted == isDoubleDotted && 
				other.tuplet.equals(tuplet);
	}

}