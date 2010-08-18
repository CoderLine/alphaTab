package net.alphatab.midi;

import java.util.ArrayList;

import javax.sound.midi.ControllerEventListener;
import javax.sound.midi.MidiMessage;
import javax.sound.midi.Receiver;
import javax.sound.midi.ShortMessage;

public class TickNotifierReceiver implements Receiver
{
    private ArrayList<ControllerEventListener> _controllerEventListeners = new ArrayList<ControllerEventListener>();

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
        if (_old != null) _old.send(message, timeStamp);
    }
    
    public void addControllerEventListener(ControllerEventListener listener) {
        synchronized(_controllerEventListeners) {
            _controllerEventListeners.add(listener);
        }
    }


    public void removeControllerEventListener(ControllerEventListener listener, int[] controllers) {
        synchronized(_controllerEventListeners) {
            _controllerEventListeners.remove(_controllerEventListeners);
        }
    }

}
