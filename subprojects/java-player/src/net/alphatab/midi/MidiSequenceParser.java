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

import java.util.List;
import java.util.ArrayList;

import javax.swing.JOptionPane;

import javax.sound.midi.InvalidMidiDataException;
import javax.sound.midi.MidiEvent;
import javax.sound.midi.MidiMessage;
import javax.sound.midi.Sequence;
import javax.sound.midi.Track;

import java.lang.StackTraceElement;

public class MidiSequenceParser
{
	private static Sequence _sequence;
	private static List<Track> _tracks;

	private static int _metronomeTrack;

	public static int getMetronomeTrack()
	{
		return _metronomeTrack;
	}

	private static Track getTrack(int index)
	{
		if(index < _tracks.size()) {
			return _tracks.get(index);
		}
		// create more tracks if needed
		while(_tracks.size() <= index)
		{
			_tracks.add(_sequence.createTrack());
		}
		return _tracks.get(index);
	}

    public static Sequence parse(String commands) throws InvalidMidiDataException
    {
        String[] commandList = commands.split(";");
        _sequence = new Sequence(Sequence.PPQ, 960);
        _tracks = new ArrayList<Track>();

		_metronomeTrack = Integer.parseInt(commandList[0], 16);

        for(int i = 1; i < commandList.length; i++)
        {
            try
            {
                String command = commandList[i];
                String[] parts = command.split("\\|");

                int track = Integer.parseInt(parts[0], 16);
                long tick = Long.parseLong(parts[1], 16);

                String eventData = parts[2];

                MidiMessage message = null;
                if(eventData.charAt(0) == '0')
                {// noteOn
                    message = MidiMessageUtils.noteOn(Integer.parseInt(eventData.substring(1,2), 16), // Channel
                            Integer.parseInt(eventData.substring(2,4), 16), // Note
                            Integer.parseInt(eventData.substring(4,6), 16)); // Velocity
                }
                else if(eventData.charAt(0) == '1')
                { // noteOff
                    message = MidiMessageUtils.noteOff(Integer.parseInt(eventData.substring(1,2), 16), // Channel
                            Integer.parseInt(eventData.substring(2,4), 16), // Note
                            Integer.parseInt(eventData.substring(4,6), 16)); // Velocity
                }
                else if(eventData.charAt(0) == '2')
                { // controlChange
                    message = MidiMessageUtils.controlChange(Integer.parseInt(eventData.substring(1,2), 16), // Channel
                            Integer.parseInt(eventData.substring(2,4), 16), // Controller
                            Integer.parseInt(eventData.substring(4,6), 16)); // Value
                }
                else if(eventData.charAt(0) == '3')
                { // programChange
                    message = MidiMessageUtils.programChange(Integer.parseInt(eventData.substring(1,2), 16), // Channel
                            Integer.parseInt(eventData.substring(2,4), 16)); // Instrument
                }
                else if(eventData.charAt(0) == '4')
                { // pitchBend
                    message = MidiMessageUtils.pitchBend(Integer.parseInt(eventData.substring(1,2), 16), // Channel
                            Integer.parseInt(eventData.substring(2,4), 16)); // Value
                }
                else if(eventData.charAt(0) == '5')
                { // tempoInUsq
                    message = MidiMessageUtils.tempoInUSQ(Integer.parseInt(eventData.substring(1), 16)); // Usq
                }
                else if(eventData.charAt(0) == '6')
                { // timeSignature
                    String[] timeParts = eventData.substring(1).split(",");
                    message = MidiMessageUtils.timeSignature(Integer.parseInt(timeParts[0]), // numerator
                            Integer.parseInt(timeParts[1]), // denominatorIndex
                            Integer.parseInt(timeParts[2])); // denominatorValue
                }
                else if(eventData.charAt(0) == '7')
                {// Rest message
                    message = MidiMessageUtils.rest();
                }

                getTrack(track).add(new MidiEvent(message, tick));
            }
            catch(Throwable e)
            {
                StackTraceElement[] elements = e.getStackTrace();
                String combinedOutput="MidiSequenceParser Error:\n";
                for(int eCount=0; eCount<elements.length; eCount++) {
                 combinedOutput += "\n" + elements[eCount].toString();
                }

				//JOptionPane.showMessageDialog(null, combinedOutput);
                //throw new InvalidMidiDataException("Error Parse command " + i + ": " + e.toString() + "\n" + );
            }
        }

        return _sequence;
    }

}
