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
import alphatab.io.Byte;
import alphatab.model.TimeSignature;

interface MidiSequenceHandler 
{
    function getInfoTrack():Int;
    
    function getMetronomeTrack():Int;
    
    function addControlChange(tick:Int, track:Int, channel:Byte, controller:Byte, value:Byte):Void;
    
    function addNoteOff(tick:Int, track:Int, channel:Byte, note:Byte, velocity:Byte):Void;
    
    function addNoteOn(tick:Int, track:Int, channel:Byte, note:Byte, velocity:Byte):Void;
    
    function addRest(tick:Int, track:Int, channel:Byte):Void;
    
    function addPitchBend(tick:Int, track:Int, channel:Byte, value:Byte):Void;
    
    function addProgramChange(tick:Int, track:Int, channel:Byte, instrument:Byte):Void;
    
    function addTempoInUSQ(tick:Int, track:Int, usq:Int):Void;
    
    function addTimeSignature(tick:Int, track:Int, timeSignature:TimeSignature):Void;
    
    function notifyFinish():Void;
}