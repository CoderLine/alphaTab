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
	 * All masterbars repeated within this group
	 */
	public var masterBars:Array<MasterBar>;
	
	/**
	 * a list of masterbars which open the group. 
	 */
	public var openings:Array<MasterBar>;
		
	/**
	 * a list of masterbars which close the group. 
	 */
	public var closings:Array<MasterBar>; 
	
	/**
	 * true if the repeat group was closed well
	 */
	public var isClosed:Bool;
	
	
	public function new() 
	{
		masterBars = new Array<MasterBar>();
		closings = new Array<MasterBar>();
		openings = new Array<MasterBar>();
		isClosed = false;
	}
	
	public function addMasterBar(masterBar:MasterBar)
	{
		if (openings.length == 0)
		{
			openings.push(masterBar);
		}
		
		masterBars.push(masterBar);
		masterBar.repeatGroup = this;
		
		if (masterBar.isRepeatEnd())
		{
			closings.push(masterBar);
			isClosed = true;
		}
		// a new item after the header was closed? -> repeat alternative reopens the group
		else if (isClosed) 
		{
			isClosed = false;
			openings.push(masterBar);
		}
	}
}