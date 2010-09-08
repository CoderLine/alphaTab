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
package net.alphatab.tablature.model;
import net.alphatab.model.SongFactory;
import net.alphatab.model.Track;
import net.alphatab.tablature.ViewLayout;

/**
 * This track implementation extends the default track with drawing and layouting features. 
 */
class TrackImpl extends Track
{	
	public var previousBeat:BeatImpl;
	public var tabHeight:Int;
	public var scoreHeight:Int;

	public function new(factory:SongFactory) 
	{
		super(factory);
	}

	public function update(layout:ViewLayout):Void
	{
		tabHeight = Math.round((stringCount() - 1) * layout.stringSpacing);
		scoreHeight = Math.round(layout.scoreLineSpacing * 4);
	}	
}