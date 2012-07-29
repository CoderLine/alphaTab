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
package alphatab.model;

/**
 * This class can store the information about a group of measures which are repeated
 */
class RepeatGroup 
{
	/**
	 * All measureHeaders repeated within this group
	 */
	public var measureHeaders:Array<MeasureHeader>;
	
	/**
	 * a list of measure headers which open the group. 
	 */
	public var openings:Array<MeasureHeader>;
		
	/**
	 * a list of measure headers which close the group. 
	 */
	public var closings:Array<MeasureHeader>; 
	
	/**
	 * true if the repeat group was closed well
	 */
	public var isClosed:Bool;
	
	
	public function new() 
	{
		measureHeaders = new Array<MeasureHeader>();
		closings = new Array<MeasureHeader>();
		openings = new Array<MeasureHeader>();
		isClosed = false;
	}
	
	public function addMeasureHeader(h:MeasureHeader)
	{
		if (openings.length == 0)
		{
			openings.push(h);
		}
		
		measureHeaders.push(h);
		h.repeatGroup = this;
		
		if (h.repeatClose > 0)
		{
			closings.push(h);
			isClosed = true;
		}
		// a new item after the header was closed? -> repeat alternative reopens the group
		else if (isClosed) 
		{
			isClosed = false;
			openings.push(h);
		}
		
	}
	
}