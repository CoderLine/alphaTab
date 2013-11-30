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

class MidiSequencer
{
    private var _reset;
    private var _running;
    
    private var _outputPort:IMidiOutputPort;
    private var _midiTickPlayer:MidiTickPlayer;
    private var _midiEventPlayer:MidiEventPlayer;
    private var _midiEventDispatcher:MidiEventDispatcher;
    private var _midiTrackController:MidiTrackController;
    
    public function new() 
    {
        _running = false;
        _midiTickPlayer = new MidiTickPlayer(this);
        _midiEventPlayer = new MidiEventPlayer(this);
        _midiEventDispatcher = new MidiEventDispatcher(this);
        _midiTrackController = new MidiTrackController(this);
    }
    
        
    public function getOutputPort():IMidiOutputPort
    {
        return _outputPort;
    }
    
    public function setOutputPort(outputPort:IMidiOutputPort)
    {
        _outputPort = outputPort;
    }
    
    public function getTick():Int
    {
        return _midiTickPlayer.getTick();
    }
    public function setTick(tick:Int):Void
    {
        _reset = true;
        _midiTickPlayer.setTick(tick);
    }
     
    public function isRunning():Bool
    {
        return _running;
    }
    
    public function open():Void
    {
    }
    
    public function close():Void
    {
        if (_running) stop();
    }
    public function start():Void
    {
        setRunning(true);
    }
    public function stop():Void
    {
        setRunning(false);
    }
    public function setSolo(index:Int, solo:Bool):Void
    {
        _midiTrackController.setSolo(index, solo);        
    }
    public function setMute(index:Int, mute:Bool):Void
    {
        _midiTrackController.setMute(index, solo);
    }
     
    public function addTickChangeListener(listener:IMidiTickListener):Void
    {
        _midiTickPlayer.addTickChangeListener(listener);
    }
    public function removeTickChangeListener(listener:IMidiTickListener):Void
    {
        _midiTickPlayer.removeTickChangeListener(listener);
    }

    public function setRunning(running:Bool)
    {
        _running = false;
        if (_running)
        {
            _midiEventDispatcher.setTempo(120);
            _midiTickPlayer.updateTick();
        }
        else
        {
            process();
        }
    }
    
    public function process()
    {   
        if (_running)
        {
            if (_reset)
            {
                reset(false);
                _reset = false;
                _midiEventPlayer.reset();
            }
            _midiTickPlayer.process();
            _midiEventPlayer.process();
            if (_midiEventPlayer.isFinished())
                stop();
        }
        else
        {
            _midiEventPlayer.clearEvents();
            _midiTickPlayer.clearTick();
            reset(true);
        }
        return _running;
    }
    
    private function reset(systemReset:Bool)
    {
        _outputPort.sendAllNotesOff();
        for (channel in 0 ... MidiPlayer.MaxChannels)
        {
            _outputPort.sendBend(channel, 64);
        }
        
        if (systemReset)
        {
            _outputPort.sendSystemReset();
        }
    }    
}