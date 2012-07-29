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
package alphatab.file.musicxml;
import alphatab.file.alphatex.AlphaTexParser;
import alphatab.file.FileFormatException;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.GuitarString;
import alphatab.model.HeaderFooterElements;
import alphatab.model.Measure;
import alphatab.model.MeasureClef;
import alphatab.model.MeasureHeader;
import alphatab.model.SongFactory;
import alphatab.model.Track;
import alphatab.model.Tuning;
import alphatab.model.Voice;
import haxe.xml.Fast;

import alphatab.file.SongReader;
import alphatab.io.DataInputStream;
import alphatab.model.Song;

// TODO: If clef is TAB we should read tablature notation
class MusicXmlReader extends SongReader
{
	private var _dom:Fast;
	private var _idToTrack:Hash<Track>;
	
    public override function readSong() : Song
    {
		try
		{
			_voiceOffsetDetected = false;
			var xml = Xml.parse(this.data.readString(this.data.length()));
			_dom = new Fast(xml.firstElement());
		}
		catch (e:Dynamic)
		{
			throw new FileFormatException("not a valid xml file");
		}	
			
		_idToTrack = new Hash<Track>();
		if (_dom.name == "score-partwise")
		{
			return parsePartwise();
		}
		else if (_dom.name == "score-timewise")
		{
			return parseTimewise();
		}
		else
		{
			throw new FileFormatException("this xml file is no musicxml file");
		}
	}
	    
    	
	private function parsePartwise() : Song
	{
		var song = factory.newSong();
        song.tempo = 120;
        song.tempoName = "";
        song.hideTempo = false;
		
		song.pageSetup = factory.newPageSetup();
		scoreHeader(song);
		
		var parts = _dom.nodes.part;
		
		for (p in parts)
		{
			parsePart(song, p);
		}
		
		return song;
	}
	
	private function parsePart(song:Song, p:Fast)
	{
		var track = _idToTrack.get(p.att.id);
		
		var measures = p.nodes.measure;
		var i = 0;
		for (m in measures)
		{
			var h = getOrCreateMeasureHeader(song, i++);
			
			parseHeader(h, m);
			parseMeasure(track, h, m);
		}
	}
	
	private function parseHeader(h:MeasureHeader, m:Fast)
	{
		if (m.hasNode.attributes)
		{
			var att = m.node.attributes;
			if (att.hasNode.key)
			{
				h.keySignature = Std.parseInt(att.node.key.node.fifths.innerData);
			}
			if (att.hasNode.time)
			{
				h.timeSignature.numerator = Std.parseInt(att.node.time.node.beats.innerData);
				h.timeSignature.denominator.value = Std.parseInt(att.node.time.node.resolve("beat-type").innerData);
			}
		}		
		
		if (m.hasNode.direction)
		{
			var dir = m.node.direction;
			if (dir.hasNode.sound)
			{
				if (dir.node.sound.has.tempo)
				{
					h.tempo.value = Std.parseInt(dir.node.sound.att.tempo);
				}
			}
		}
	}
	
	private function parseMeasure(t:Track, h:MeasureHeader, m:Fast)
	{
		var measure = factory.newMeasure(h);
		t.addMeasure(measure);
		if (m.hasNode.attributes)
		{
			var att = m.node.attributes;
			if(att.hasNode.clef)
			{
				var clef = att.node.clef.node.sign.innerData + att.node.clef.node.line.innerData;
				if (clef == "G2")
				{
					measure.clef = MeasureClef.Treble;
				}
				else if (clef == "F4")
				{
					measure.clef = MeasureClef.Bass;
				}
				else if (clef == "C3")
				{
					measure.clef = MeasureClef.Tenor;
				}
				else if (clef == "C4")
				{
					measure.clef = MeasureClef.Alto;
				}
			}
		}
		
		for (n in m.elements)
		{
			if (n.name == "note")
			{
				parseNote(n, measure, t);
			}
			else if (n.name == "harmony")
			{
				parseHarmony(n);
			}
		}
	}
	
	private var _nextBeatChord:String;
	private function parseHarmony(n:Fast)
	{
		if (n.hasNode.root)
		{
			var step = n.node.root.node.resolve("root-step").innerData;
			if (n.hasNode.kind)
			{
				var kind = n.node.kind.innerData;
				switch(kind)
				{
					case "minor": 
						step += "m";
					case "major":
						step += "";					
					case "dominant":
						step += String.fromCharCode(8311); // superscript 7
					default:
						step += kind;
				}
			}
			_nextBeatChord = step;
		}
		else
		{
			_nextBeatChord = null;
		}
	}

	private var _voiceOffsetDetected:Bool;
	private var _voiceOffset:Int;
	private function parseNote(n:Fast, measure:Measure, t:Track)
	{
		var beat:Beat = null;
		var voice = 0;
		if (n.hasNode.voice)
		{
			// HACK: Some MusicXML Files use 1 as first voice, others 0. 
			// Just use the first voice for detection
			voice = Std.parseInt(n.node.voice.innerData);
			if (!_voiceOffsetDetected)
			{
				_voiceOffset = voice;
				_voiceOffsetDetected = true;
			}

			voice -= _voiceOffset;
		}
		
		// is rest?
		if (n.hasNode.rest)
		{
			beat = factory.newBeat();
			if (_nextBeatChord != null)
			{
				beat.setChord(factory.newChord(t.stringCount()));
				beat.effect.chord.name = _nextBeatChord;
				_nextBeatChord = null;
			}
			measure.addBeat(beat);
			beat.ensureVoices(voice + 1, factory);
			beat.voices[voice].isEmpty = false;
			if (n.hasNode.type)
			{
				beat.voices[voice].duration.value = toDuration(n.node.type.innerData);
			}
			else
			{
				beat.voices[voice].duration.value = Duration.QUARTER;
			}
			
			if (n.hasNode.dot)
			{
				beat.voices[voice].duration.isDotted = true;
			}
		}
		else
		{
			var note = factory.newNote();

			// is chord?
			if (n.hasNode.chord)
			{
				beat = measure.beats[measure.beatCount() - 1];
				beat.ensureVoices(voice + 1, factory);
				beat.voices[voice].isEmpty = false;
			}
			else
			{
				beat = factory.newBeat();
				if (_nextBeatChord != null)
				{
					beat.setChord(factory.newChord(t.stringCount()));
					beat.effect.chord.name = _nextBeatChord;
					_nextBeatChord = null;
				}
				measure.addBeat(beat);
				beat.ensureVoices(voice + 1, factory);
				beat.voices[voice].isEmpty = false;
				if (n.hasNode.type)
				{
					beat.voices[voice].duration.value = toDuration(n.node.type.innerData);
				}
				else
				{
					beat.voices[voice].duration.value = Duration.QUARTER;
				}
				if (n.hasNode.dot)
				{
					beat.voices[voice].duration.isDotted = true;
				}
			}
			
			
			note.effect = factory.newNoteEffect();
			
			var fullNoteName = n.node.pitch.node.step.innerData + n.node.pitch.node.octave.innerData;
			var fullNoteValue = Tuning.getTuningForText(fullNoteName);
			 
			note.string = findStringForValue(t, beat.voices[voice], fullNoteValue);
			note.value = fullNoteValue - t.strings[note.string - 1].value;
			
			beat.voices[voice].addNote(note);
		}
	}
	
	private function findStringForValue(t:Track, voice:Voice, value:Int) : Int
	{
		// find strings which are already taken
		var takenStrings = new Array<Int>();
		for (n in voice.notes)
		{
			takenStrings.push(n.string);
		}
		
		// find a string where the note matches into 0 to 14
		for (s in t.strings)
		{
			if (!Lambda.has(takenStrings, s.number))
			{
				var min = s.value;
				var max = s.value + 14;
				
				if (value >= min && value <= max)
				{
					return s.number;
				}
			}
		}
		
		return 1; // first string 				
	}
	
	private function toDuration(s:String) : Int
	{
		switch(s)
		{
			case "whole": return Duration.WHOLE;
			case "half": return Duration.HALF;
			case "quarter": return Duration.QUARTER;
			case "eighth": return Duration.EIGHTH;
			case "16th": return Duration.SIXTEENTH;
			case "32nd": return Duration.THIRTY_SECOND;
			case "64th": return Duration.SIXTY_FOURTH;
			default: return Duration.QUARTER;
		}
	}
	
	private function getOrCreateMeasureHeader(song:Song, index:Int)
	{
		if (index >= song.measureHeaders.length)
		{
			var missing = (index - song.measureHeaders.length) + 1;
			
			for (i in 0 ... missing)
			{
				var header = factory.newMeasureHeader();
				header.number = song.measureHeaders.length + 1; 
				header.start = 0;
				song.addMeasureHeader(header);
			}
			
		}
		return song.measureHeaders[index];
	}
	
	private function scoreHeader(song:Song) 
	{
		if (_dom.hasNode.resolve("movement-title"))
		{
			song.title = _dom.node.resolve("movement-title").innerData;
		}
		if (_dom.hasNode.identification)
		{
			var creators = _dom.node.identification.nodes.creator;
			for (c in creators)
			{
				if (c.has.type)
				{
					switch(c.att.type)
					{
						case "artist":
							song.artist = c.innerData;
						case "poet":
							song.words = c.innerData;
					}
				}
			}
		}
		
		var scoreParts = _dom.node.resolve("part-list").nodes.resolve("score-part");
		var i = 0;
		for (p in scoreParts)
		{
			var track = factory.newTrack();
			_idToTrack.set(p.att.id, track);
			
			track.number = i++;
			track.channel.instrument(25);
			createDefaultStrings(track.strings);
			
			track.name = p.node.resolve("part-name").innerData;
			
			if (p.hasNode.resolve("midi-instrument"))
			{
				var midi = p.node.resolve("midi-instrument");
				if (midi.hasNode.resolve("midi-channel"))
				{
					track.channel.channel = Std.parseInt(midi.node.resolve("midi-channel").innerData);
					track.channel.effectChannel = track.channel.channel;
				}
				if (midi.hasNode.resolve("midi-program"))
				{
					track.channel.instrument(Std.parseInt(midi.node.resolve("midi-program").innerData));
				}
				if (midi.hasNode.volume)
				{
					track.channel.volume = Std.parseInt(midi.node.volume.innerData);
				}
				if (midi.hasNode.pan)
				{
					track.channel.balance = Std.parseInt(midi.node.pan.innerData);
				}
			}
			
			song.addTrack(track);
		}
	}
	
	private function parseTimewise() : Song
	{
		throw new FileFormatException("score-timewise not yet supported");
		return null;
	}	
}