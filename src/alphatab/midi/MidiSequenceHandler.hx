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
package alphatab.midi;
import alphatab.model.TimeSignature;

interface MidiSequenceHandler 
{
    var infoTrack:Int;
    
    var metronomeTrack:Int;
    
    function addControlChange(tick:Int, track:Int, channel:Int, controller:Int, value:Int):Void;
    
    function addNoteOff(tick:Int, track:Int, channel:Int, note:Int, velocity:Int):Void;
    
    function addNoteOn(tick:Int, track:Int, channel:Int, note:Int, velocity:Int):Void;
    
    function addPitchBend(tick:Int, track:Int, channel:Int, value:Int):Void;
    
    function addProgramChange(tick:Int, track:Int, channel:Int, instrument:Int):Void;
    
    function addTempoInUSQ(tick:Int, track:Int, usq:Int):Void;
    
    function addTimeSignature(tick:Int, track:Int, timeSignature:TimeSignature):Void;
    
    function notifyFinish():Void;
}