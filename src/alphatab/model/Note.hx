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
 * Describes a single note. 
 */
class Note
{
    public var duration(default,default):Int;
    public var tuplet(default,default):Int;
    public var value(default,default):Int;
    public var velocity(default,default):Int;
    public var string(default,default):Int;
    public var isTiedNote(default,default):Bool;
    public var effect(default,default):NoteEffect;
    public var voice(default,default):Voice;
    public var durationPercent(default,default):Float;
    public var swapAccidentals(default,default):Bool;
    
    
    private var _realValue:Int;
    public function realValue() : Int
    {
        if (_realValue == -1)
        {
            _realValue = value + voice.beat.measure.track.strings[string - 1].value;
        }
        return _realValue;
    }
    
    public function new(factory:SongFactory)
    {
        _realValue = -1;
        value = 0;
        velocity = Velocities.DEFAULT;
        string = 1;
        isTiedNote = false;
        swapAccidentals = false;
        effect = factory.newNoteEffect();
    }

}