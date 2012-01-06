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
package net.alphatab.midi;

import java.util.ArrayList;

import javax.sound.midi.ControllerEventListener;
import javax.sound.midi.MidiMessage;
import javax.sound.midi.Receiver;
import javax.sound.midi.SysexMessage;
import javax.sound.midi.ShortMessage;

public class TickNotifierReceiver implements Receiver
{
    private ArrayList<ControllerEventListener> _controllerEventListeners = new ArrayList<ControllerEventListener>();
    private ArrayList<SysexEventListener> _sysexEventListeners = new ArrayList<SysexEventListener>();

    private Receiver _old;

    public TickNotifierReceiver(Receiver old)
    {
        _old = old;
    }

    @Override
    public void close()
    {
        if (_old != null) _old.close();
    }

    @Override
    public void send(MidiMessage message, long timeStamp)
    {
        if(message instanceof ShortMessage)
        {
            for(ControllerEventListener listener : _controllerEventListeners)
            {
                listener.controlChange((ShortMessage)message);
            }
        }
        if(message instanceof SysexMessage)
        {
            for(SysexEventListener listener : _sysexEventListeners)
            {
                listener.sysex((SysexMessage)message);
            }
            return;
        }
        if (_old != null) _old.send(message, timeStamp);
    }
    
    public void addControllerEventListener(ControllerEventListener listener) 
    {
        synchronized(_controllerEventListeners) 
        {
            _controllerEventListeners.add(listener);
        }
    }

    public void removeControllerEventListener(ControllerEventListener listener) 
    {
        synchronized(_controllerEventListeners) 
        {
            _controllerEventListeners.remove(listener);
        }
    }    
    
    public void addSysexEventListener(SysexEventListener listener) 
    {
        synchronized(_sysexEventListeners) 
        {
            _sysexEventListeners.add(listener);
        }
    }

    public void removeSysexEventListener(SysexEventListener listener) 
    {
        synchronized(_sysexEventListeners) 
        {
            _sysexEventListeners.remove(listener);
        }
    }

}
