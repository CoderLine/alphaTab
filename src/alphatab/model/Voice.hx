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
    public var beat(default,default):Beat;
    public var duration(default,default):Duration;
    public var notes(default,default):Array<Note>;
    public var index(default,default):Int;
    public var direction(default,default):Int;
    public var isEmpty(default,default):Bool;
    
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
    
    public function clone(factory:SongFactory)  : Voice
    {
        var clone = factory.newVoice(index);
        clone.duration = duration.clone(factory);
        clone.index = index;
        clone.direction = direction;
        clone.isEmpty = isEmpty;
        
        for (n in notes)
        {
            clone.addNote(n.clone(factory));
        }
        return clone;
    }
    
    public function addNote(note:Note) : Void
    {
        note.voice = this;
        this.notes.push(note);
        isEmpty = false;
    }

}