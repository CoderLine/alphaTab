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
import alphatab.audio.MidiUtils;

class MidiTickPlayer
{   
    private var _tempo:Int;
    private var _lastTime:Int;
    private var _time:Int;
    private var _tick:Int;
    private var _tickChanged:Bool;
    private var _sequencer:MidiSequencer;
    private var _midiTickListener:Array<IMidiTickListener>;
    
    public function getTempo()
    {
        return _tempo;
    }
    
    public function setTempo(tempo:Int)
    {
        _tempo = tempo;
    }
    
    public function getTick() : Int
    {
        return _tick;
    }
    
    public function setTick(tick:Int)
    {
        _tick = tick;
        updateTick();
    }
    
    public function updateTick()
    {
        _tickChanged = true;
    }
    
    public function clearTick()
    {
        _tick = 0;
    }
    
    public function process()
    {
        _lastTime = time;
        _time = Std.int(Date.now().getTime());
        if (!_tickChanged)
        {
            _tick += Std.int(MidiUtils.QuarterTime * (_tempo * (_time - _lastTime) / 60.0) / 1000.o);
            onTickChanged(_tick);
        }
        _tickChanged = false;        
    }
    
    public function new(sequencer:MidiSequencer) 
    {
        _sequencer = sequencer;
        _midiTickListener = new Array<IMidiTickListener>();
    }
    
         
    public function addTickChangeListener(listener:IMidiTickListener):Void
    {
        _midiTickListener.push(listener);
    }
    
    public function removeTickChangeListener(listener:IMidiTickListener):Void
    {
        _midiTickListener.remove(listener);
    }
    
}