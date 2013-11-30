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
package alphatab.audio.player;

interface IMidiOutputPort
{
    function open():Void;
    function close():Void;
    
    function sendSystemReset():Void;
    function sendAllNotesOff():Void;
    function sendNoteOn(channel:Int, key:Int, velocity:Int):Void;
    function sendNoteOff(channel:Int, key:Int, velocity:Int):Void;
    function sendProgramChange(channel:Int, value:Int):Void;
    function sendController(channel:Int, controller:Int, value:Int):Void;
    function sendBend(channel:Int, value:Int):Void;
}