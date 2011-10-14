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

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.io.*;

import javax.swing.JOptionPane;

import javax.sound.midi.ControllerEventListener;
import javax.sound.midi.InvalidMidiDataException;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.MidiUnavailableException;
import javax.sound.midi.Sequence;
import javax.sound.midi.Sequencer;
import javax.sound.midi.ShortMessage;
import javax.sound.midi.Transmitter;
import javax.swing.BorderFactory;
import javax.swing.JApplet;
import javax.swing.JLabel;

import netscape.javascript.JSObject;

public class MidiPlayer extends JApplet
{
    private Sequence          _sequence;
    private Sequencer         _sequencer;
    private long              _lastTick;
    private String            _updateFunction;
	private int 			  _metronomeTrack;

    @Override
    public void init()
    {
        super.init();
        _updateFunction = getParameter("onTickChanged");
        try
        {
            _sequencer = MidiSystem.getSequencer();
            _sequencer.open();

            Transmitter tickTransmitter = _sequencer.getTransmitter();
            TickNotifierReceiver tickReceiver = new TickNotifierReceiver(
                    tickTransmitter.getReceiver());
            tickTransmitter.setReceiver(tickReceiver);

            tickReceiver
                    .addControllerEventListener(new ControllerEventListener()
                    {
                        @Override
                        public void controlChange(ShortMessage event)
                        {
                            if (_sequencer.isRunning())
                            {
                                switch (event.getCommand())
                                {
                                    case 0x80:// Noteon
                                    case 0x90:// noteof
                                        notifyPosition(_sequencer
                                                .getTickPosition());
                                    break;
                                }
                            }
                        }
                    });
        }
        catch (MidiUnavailableException e)
        {
            e.printStackTrace();
        }
    }

    private void notifyPosition(long tickPosition)
    {
        if (_lastTick == tickPosition || _updateFunction == null) return;
        JSObject.getWindow(this).call(_updateFunction,
                new String[] { new Long(tickPosition).toString() });
    }

    public void updateSongData(String commands)
    {
        try
        {
            _sequence = MidiSequenceParser.parse(commands);
            _sequencer.setSequence(_sequence);
			_metronomeTrack = MidiSequenceParser.getMetronomeTrack();
        }
        catch (Throwable e)
        {
            //JOptionPane.showMessageDialog(null,"MidiPlayer Error: \n" + e.toString());
			//e.printStackTrace();
        }
    }

	public void setMetronomeEnabled(boolean enabled)
	{
		_sequencer.setTrackMute(_metronomeTrack, !enabled);
	}

	public void isMetronomeEnabled()
	{
		_sequencer.getTrackMute(_metronomeTrack);
	}

    public void play()
    {
        _sequencer.start();
    }

    public void pause()
    {
        _sequencer.stop();
    }

    public void stop()
    {
        _sequencer.stop();
        _sequencer.setTickPosition(0);
    }

    public void goTo(int tickPosition) 
    {
		boolean running = _sequencer.isRunning();
		if(running) 
		{
			_sequencer.stop();
		}
        _sequencer.setTickPosition(tickPosition);
		if(running) 
		{
			_sequencer.start();
		}
        
    }
}