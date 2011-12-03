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
 *  
 *  This code is based on the code of TuxGuitar. 
 *      Copyright: J.Jørgen von Bargen, Julian Casadesus <julian@casadesus.com.ar>
 *      http://tuxguitar.herac.com.ar/
 */
package alphatab.file.gpx;

import alphatab.model.PageSetup;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Voice;
import alphatab.model.Measure;
import alphatab.model.Song;
import alphatab.model.SongFactory;
import alphatab.model.Velocities;
import alphatab.file.gpx.score.GpxDrumkit;
import alphatab.file.gpx.score.GpxDocument;
import alphatab.file.gpx.score.GpxBar;
import alphatab.file.gpx.score.GpxBeat;
import alphatab.file.gpx.score.GpxNote;
import alphatab.file.gpx.score.GpxRhythm;


class DocumentParser 
{
    private var _factory:SongFactory;
    private var _document:GpxDocument;
    
    public function new(factory:SongFactory, document:GpxDocument)
    {
        _factory = factory;
        _document = document;
    }
    
    public function parse() : Song
    {
        var song = _factory.newSong();
        song.tempo = 120;
        song.tempoName = "";
        song.hideTempo = false;
        song.pageSetup = _factory.newPageSetup();
        
        parseScore(song);
        parseTracks(song);
        parseMasterBars(song);
        
        return song;
    }
    
    private function parseScore(song:Song)
    {
        song.title = _document.score.title;
        song.artist = _document.score.artist;
        song.album = _document.score.album;
        song.words = _document.score.wordsAndMusic;
        song.music = _document.score.wordsAndMusic;
        song.copyright = _document.score.copyright;
        song.tab = _document.score.tabber;
        song.notice = _document.score.notices;
        
        song.pageSetup.pageSize.x = _document.score.pageSetup.width;
        song.pageSetup.pageSize.y = _document.score.pageSetup.height;
        song.pageSetup.pageMargin = _document.score.pageSetup.margin;
        song.pageSetup.scoreSizeProportion = _document.score.pageSetup.scale;
    }
    
    private function parseTracks(song:Song)
    {
        var i = 0;
        for(gpxTrack in _document.tracks)
        {
            var track = _factory.newTrack();
            track.number = i+1;
            track.name = gpxTrack.name;
            track.channel.instrument(gpxTrack.gmProgram);
            track.channel.channel = gpxTrack.gmChannel1;
            track.channel.effectChannel = gpxTrack.gmChannel2;
            
            if(gpxTrack.tunningPitches != null)
            {
                var s = 1;
                while(s <= gpxTrack.tunningPitches.length)
                {
                    track.strings.push(newString(s, gpxTrack.tunningPitches[gpxTrack.tunningPitches.length - s]));
                    s++;
                }
            }
            else 
            {
                track.strings.push(newString(1, 64));
                track.strings.push(newString(2, 59));
                track.strings.push(newString(3, 55));
                track.strings.push(newString(4, 50));
                track.strings.push(newString(5, 45));
                track.strings.push(newString(6, 40));
            }
            
            if(gpxTrack.color != null && gpxTrack.color.length == 3)
            {
                track.color.r = gpxTrack.color[0];
                track.color.g = gpxTrack.color[1];
                track.color.b = gpxTrack.color[2];
            }
            
            song.addTrack(track);
            i++;
        }
    }
    
    private function parseMasterBars(song:Song)
    {
        var start = Duration.QUARTER_TIME;
        
        var i = 0;
        for(mbar in _document.masterBars)
        {
            var tempoAutomation = _document.getAutomation("Tempo", i);
            
            var measureHeader = _factory.newMeasureHeader();
            measureHeader.start = start;
            measureHeader.number = i + 1;
            measureHeader.isRepeatOpen = mbar.repeatStart;
            measureHeader.repeatClose = mbar.repeatCount;
            if(mbar.time != null && mbar.time.length == 2)
            {
                measureHeader.timeSignature.numerator = mbar.time[0];
                measureHeader.timeSignature.denominator.value = mbar.time[1];
            }
            if(tempoAutomation != null && tempoAutomation.value.length == 2)
            {
                var tempo = tempoAutomation.value[0];
                if(tempoAutomation.value[1] == 1)
                {
                    tempo = Math.floor(tempo / 2);
                }
                else if(tempoAutomation.value[1] == 3)
                {
                    tempo = Math.floor(tempo + (tempo / 2));
                }
                else if(tempoAutomation.value[1] == 4)
                {
                    tempo = Math.floor(tempo * 2);
                }
                else if(tempoAutomation.value[1] == 5)
                {
                    tempo = Math.floor(tempo + (tempo * 2));
                }
                measureHeader.tempo.value = tempo;
            }
            song.addMeasureHeader(measureHeader);
            
            var t = 0;
            while(t < song.tracks.length)
            {
                var track = song.tracks[t];
                var measure = _factory.newMeasure(measureHeader);
                
                track.addMeasure(measure);
                
                var masterBarIndex = i;
                var gpxBar = ( t < mbar.barIds.length ? _document.getBar(mbar.barIds[t]) : null);
                while(gpxBar != null && gpxBar.simileMark != null)
                {
                    var gpxMark = gpxBar.simileMark;
                    if(gpxMark == "Simple")
                    {
                        masterBarIndex = masterBarIndex - 1;
                    }
                    else if(gpxMark == "FirstOfDouble" || gpxMark == "SecondOfDouble")
                    {
                        masterBarIndex = masterBarIndex - 2;
                    }
                    
                    if(masterBarIndex >= 0)
                    {
                        var masterBarCopy = _document.masterBars[masterBarIndex];
                        gpxBar = (t < masterBarCopy.barIds.length ? _document.getBar(masterBarCopy.barIds[t]) : null);
                    }
                    else
                    {
                        gpxBar = null;
                    }
                }
                
                if(gpxBar != null)
                {
                    parseBar(gpxBar, measure);
                }
                t++;
            }
            
            start += measureHeader.length();                        
            i++;
        }
    }
    
    private function parseBar(bar:GpxBar, measure:Measure)
    {
        var voiceIds = bar.voiceIds;
        var v = 0; 
        while(v < Beat.MAX_VOICES)
        {
            if(voiceIds.length > v)
            {
                if(voiceIds[v] >= 0)
                {
                    var gpxVoice = _document.getVoice(voiceIds[v]);
                    if(gpxVoice != null) 
                    {
                        var start = measure.start();
                        var b = 0;
                        while(b < gpxVoice.beatIds.length)
                        {
                            var gpxBeat = _document.getBeat(gpxVoice.beatIds[b]);
                            var rhythm = _document.getRhythm(gpxBeat.rhythmId);
                            
                            var beat:Beat = getBeat(measure, start);
                            var voice:Voice = beat.voices[v % beat.voices.length];
                            voice.isEmpty = false;
                            
                            parseRhythm(rhythm, voice.duration);
                            if(gpxBeat.noteIds != null)
                            {
                                var velocity = parseDynamic(gpxBeat);
                                
                                var n = 0;
                                while(n < gpxBeat.noteIds.length)
                                {
                                    var gpxNote = _document.getNote(gpxBeat.noteIds[n]);
                                    if(gpxNote != null)
                                    {
                                        parseNote(gpxNote, voice, velocity);
                                    }
                                    n++;
                                }
                            }
                            start += voice.duration.time();
                            
                            b++;
                        }
                    }
                }
            }
            v++;
        }
    }
    
    private function parseNote(gpxNote:GpxNote, voice:Voice, velocity:Int)
    {
        var value = -1;
        var string = -1;
        if(gpxNote.string >= 0 && gpxNote.fret >= 0)
        {
            value = gpxNote.fret;
            string = voice.beat.measure.track.stringCount() - gpxNote.string;
        }
        else
        {
            var gmValue = -1;
            if(gpxNote.midiNumber >= 0)
            {
                gmValue = gpxNote.midiNumber;
            }
            else if(gpxNote.tone >= 0 && gpxNote.octave >= 0)
            {
                gmValue = (gpxNote.tone + ((12 * gpxNote.octave) -12));
            }
            else if(gpxNote.element >= 0)
            {
                var i = 0; 
                while(i < GpxDrumkit.DRUMKITS.length)
                {
                    if(GpxDrumkit.DRUMKITS[i].element == gpxNote.element 
                       && GpxDrumkit.DRUMKITS[i].variation == gpxNote.variation)
                    {
                        gmValue = GpxDrumkit.DRUMKITS[i].midiValue;
                    }
                    i++;
                }
            }
            
            if(gmValue >= 0)
            {
                var stringAlternative = getStringFor(voice.beat, gmValue);
                if(stringAlternative != null)
                {
                    value = gmValue - stringAlternative.value;
                    string = stringAlternative.number;
                }
            }
        }
        
        if(value >= 0 && string > 0)
        {
            var note = _factory.newNote();
            note.value = value;
            note.string = string;
            note.isTiedNote = gpxNote.tieDestination;
            note.velocity = velocity;
            note.effect.vibrato = gpxNote.vibrato;
            note.effect.slide = gpxNote.slide;
            note.effect.deadNote = gpxNote.mutedEnabled;
            note.effect.palmMute = gpxNote.palmMutedEnabled;
            
            voice.addNote(note);
        }
    }
    
    private function parseRhythm(gpxRhythm:GpxRhythm, duration:Duration)
    {
        duration.isDotted = gpxRhythm.augmentationDotCount == 1;
        duration.isDoubleDotted = gpxRhythm.augmentationDotCount == 2;
        duration.tuplet.times = gpxRhythm.primaryTupletDen;
        duration.tuplet.enters = gpxRhythm.primaryTupletNum;
        if(gpxRhythm.noteValue == "Whole")
        {
            duration.value = Duration.WHOLE;
        }
        else if(gpxRhythm.noteValue == "Half")
        {
            duration.value = Duration.HALF;
        }
        else if(gpxRhythm.noteValue == "Quarter")
        {
            duration.value = Duration.QUARTER;
        }
        else if(gpxRhythm.noteValue == "Eighth")
        {
            duration.value = Duration.EIGHTH;
        }
        else if(gpxRhythm.noteValue == "16th")
        {
            duration.value = Duration.SIXTEENTH;
        }
        else if(gpxRhythm.noteValue == "32nd")
        {
            duration.value = Duration.THIRTY_SECOND;
        }
        else if(gpxRhythm.noteValue == "64th")
        {
            duration.value = Duration.SIXTY_FOURTH;
        }
    }
    
    private function parseDynamic(beat:GpxBeat)
    {
        var velocity = Velocities.DEFAULT;
        if(beat.dyn != null)
        {
            if(beat.dyn == "PPP")
            {
                velocity = Velocities.PIANO_PIANISSIMO;
            }
            else if(beat.dyn == "PP")
            {
                velocity = Velocities.PIANISSIMO;
            }
            else if(beat.dyn == "P")
            {
                velocity = Velocities.PIANO;
            }
            else if(beat.dyn == "MP")
            {
                velocity = Velocities.MEZZO_PIANO;
            }
            else if(beat.dyn == "MF")
            {
                velocity = Velocities.MEZZO_FORTE;
            }
            else if(beat.dyn == "F")
            {
                velocity = Velocities.FORTE;
            }
            else if(beat.dyn == "FF")
            {
                velocity = Velocities.FORTISSIMO;
            }
            else if(beat.dyn == "FFF")
            {
                velocity = Velocities.FORTE_FORTISSIMO;
            }
        }
        return velocity;
    }
    
    private function getBeat(measure:Measure, start:Int)
    {
        var count = measure.beatCount();
        var i = 0;
        while(i < count)
        {
            var currentBeat = measure.beats[i];
            if(currentBeat.start == start)
            {
                return currentBeat;
            }
            i++;
        }
        var newBeat = _factory.newBeat();
        newBeat.start = start;
        measure.addBeat(newBeat);
        return newBeat;
    }
    
    private function getStringFor(beat:Beat, value:Int)
    {
        var strings = beat.measure.track.strings;
        var i = 0; 
        while(i < strings.length)
        {
            var string = strings[i];
            if(value >= string.value)
            {
                var emptyString = true;
                var v = 0;
                for(voice in beat.voices)
                {
                    for(note in voice.notes)
                    {
                        if(note.string == string.number)
                        {
                            emptyString = false;
                            break;
                        }
                    }
                }
                if(emptyString)
                {
                    return string;
                }
            }
            i++;
        }
        return null;
    }
    
    private function newString(num:Int, tuning:Int)
    {
        var str = _factory.newString();
        str.number = num;
        str.value = tuning;
        return str;        
    }
    
}
