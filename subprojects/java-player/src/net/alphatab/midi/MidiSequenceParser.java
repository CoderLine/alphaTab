package net.alphatab.midi;

import java.util.List;
import java.util.ArrayList;

import javax.swing.JOptionPane;

import javax.sound.midi.InvalidMidiDataException;
import javax.sound.midi.MidiEvent;
import javax.sound.midi.MidiMessage;
import javax.sound.midi.Sequence;
import javax.sound.midi.Track;

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
            String command = commandList[i];
            String[] parts = command.split("\\|");
			
            int track = Integer.parseInt(parts[0], 16);
            int tick = Integer.parseInt(parts[1], 16);
			
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
            { // systemReset
                message = MidiMessageUtils.systemReset();
            }
            else if(eventData.charAt(0) == '6')
            { // tempoInUsq
                message = MidiMessageUtils.tempoInUSQ(Integer.parseInt(eventData.substring(1), 16)); // Usq
            }
            else if(eventData.charAt(0) == '7')
            { // timeSignature
				String[] timeParts = eventData.substring(1).split(",");
                message = MidiMessageUtils.timeSignature(Integer.parseInt(timeParts[0]), // numerator
                        Integer.parseInt(timeParts[1]), // denominatorIndex
                        Integer.parseInt(timeParts[2])); // denominatorValue
            }
            
			getTrack(track).add(new MidiEvent(message, tick));
        }
            
        return _sequence;
    }

}
