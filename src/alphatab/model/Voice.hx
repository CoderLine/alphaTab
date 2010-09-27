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
 * A voice contains multiple notes. 
 */
class Voice
{
	public var beat:Beat;
	public var duration:Duration;
	public var notes:Array<Note>;
	public var index:Int;
	public var direction:VoiceDirection;
	public var isEmpty:Bool;
	
	public function isRestVoice() : Bool
	{
		return notes.length == 0;
	}
	
	public function new(factory:SongFactory, index:Int)
	{
		duration = factory.newDuration();
		notes = new Array<Note>();
		this.index = index;
		direction = VoiceDirection.None;
		isEmpty = true;
	}
	
	public function addNote(note:Note) : Void
	{
		note.voice = this;
		this.notes.push(note);
		isEmpty = false;
	}

}