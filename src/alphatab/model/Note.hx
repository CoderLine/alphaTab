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
    public var duration:Int;
    public var tuplet:Int;
    public var value:Int;
    public var velocity:Int;
    public var string:Int;
    public var isTiedNote:Bool;
    public var effect:NoteEffect;
    public var voice:Voice;
    public var durationPercent:Float;
    
    
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
        effect = factory.newNoteEffect();
    }

}