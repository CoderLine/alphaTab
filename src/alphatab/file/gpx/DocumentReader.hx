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

import alphatab.io.Byte;
import haxe.xml.Fast;
import alphatab.model.Padding;
import alphatab.file.gpx.score.GpxAutomation;
import alphatab.file.gpx.score.GpxBar;
import alphatab.file.gpx.score.GpxBeat;
import alphatab.file.gpx.score.GpxDocument;
import alphatab.file.gpx.score.GpxMasterBar;
import alphatab.file.gpx.score.GpxNote;
import alphatab.file.gpx.score.GpxRhythm;
import alphatab.file.gpx.score.GpxScore;
import alphatab.file.gpx.score.GpxTrack;
import alphatab.file.gpx.score.GpxVoice;

class DocumentReader 
{
    private var _xmlDocument:Xml;
    private var _dom:Fast;
    private var _gpxDocument:GpxDocument;
    
    public function new(stream:Array<Byte>)
    {
        var str = "";
        for(i in stream)
        {
            str += String.fromCharCode(i);
        }
        
        _xmlDocument = Xml.parse(str);
        _dom = new Fast(_xmlDocument.firstElement());
        _gpxDocument = new GpxDocument();    
    }
    
    public function read() : GpxDocument
    {
        if(_xmlDocument != null) 
        {
            readScore();
            readAutomations();
            readTracks();
            readMasterBars();
            readBars();
            readVoices();
            readBeats();
            readNotes();
            readRhythms();
        }
        return _gpxDocument;
    }
    
    public function readScore() 
    {
        if(_dom.hasNode.Score)
        {
            var scoreNode = _dom.node.Score;
            _gpxDocument.score.title = scoreNode.node.Title.innerData;    
            _gpxDocument.score.subTitle = scoreNode.node.SubTitle.innerData;    
            _gpxDocument.score.artist = scoreNode.node.Artist.innerData;    
            _gpxDocument.score.album = scoreNode.node.Album.innerData;    
            _gpxDocument.score.words = scoreNode.node.Words.innerData;    
            _gpxDocument.score.music = scoreNode.node.Music.innerData;    
            _gpxDocument.score.wordsAndMusic = scoreNode.node.WordsAndMusic.innerData;    
            _gpxDocument.score.copyright = scoreNode.node.Copyright.innerData;    
            _gpxDocument.score.tabber = scoreNode.node.Tabber.innerData;    
            _gpxDocument.score.instructions = scoreNode.node.Instructions.innerData;    
            _gpxDocument.score.notices = scoreNode.node.Notices.innerData;    
            
            _gpxDocument.score.pageSetup.width = Std.parseInt(scoreNode.node.PageSetup.node.Width.innerData);
            _gpxDocument.score.pageSetup.height = Std.parseInt(scoreNode.node.PageSetup.node.Height.innerData);
            _gpxDocument.score.pageSetup.orientation = scoreNode.node.PageSetup.node.Orientation.innerData;
            _gpxDocument.score.pageSetup.margin = new Padding(
                Std.parseInt(scoreNode.node.PageSetup.node.RightMargin.innerData),
                Std.parseInt(scoreNode.node.PageSetup.node.TopMargin.innerData),
                Std.parseInt(scoreNode.node.PageSetup.node.LeftMargin.innerData),
                Std.parseInt(scoreNode.node.PageSetup.node.BottomMargin.innerData));
            _gpxDocument.score.pageSetup.scale = Std.parseFloat(scoreNode.node.PageSetup.node.Scale.innerData);
        }
    }
    
    public function readAutomations() 
    {
        if(_dom.hasNode.MasterTrack && _dom.node.MasterTrack.hasNode.Automations)
        {
            for(automationNode in _dom.node.MasterTrack.node.Automations.nodes.Automation)
            {
                var automation:GpxAutomation = new GpxAutomation();
                automation.type = automationNode.node.Type.innerData;
                automation.barId = Std.parseInt(automationNode.node.Bar.innerData);
                automation.value = toIntArray(automationNode.node.Value.innerData);
                automation.linear = toBool(automationNode.node.Linear.innerData);
                automation.position = Std.parseInt(automationNode.node.Position.innerData);
                automation.visible = toBool(automationNode.node.Visible.innerData);
                _gpxDocument.automations.push(automation);
            }
        }
    }
    
    private function toBool(str:String)
    {
        return str.toLowerCase() == "true";
    }
    
    private function toIntArray(str:String)
    {
        return toIntArray2(str, " ");
    }
    
    private function toIntArray2(str:String, sep:String)
    {
        var lst = new Array<Int>();
        for(part in str.split(sep))
        {
            lst.push(Std.parseInt(part));
        }
        return lst;
    }
        
    public function readTracks() 
    {
        if(_dom.hasNode.Tracks)
        {
            for(trackNode in _dom.node.Tracks.nodes.Track)
            {
                var track = new GpxTrack();
                track.id = Std.parseInt(trackNode.att.id);
                track.name = trackNode.node.Name.innerData;
                track.color = toIntArray(trackNode.node.Color.innerData);
                
                if(trackNode.hasNode.GeneralMidi)
                {
                    var gmNode = trackNode.node.GeneralMidi;
                    track.gmProgram = Std.parseInt(gmNode.node.Program.innerData);
                    track.gmChannel1 = Std.parseInt(gmNode.node.PrimaryChannel.innerData);
                    track.gmChannel2 = Std.parseInt(gmNode.node.SecondaryChannel.innerData);
                }
                
                if(trackNode.hasNode.Properties)
                {
                    for(propertyNode in trackNode.node.Properties.nodes.Property)
                    {
                        if(propertyNode.att.name == "Tuning")
                        {
                            track.tunningPitches = toIntArray(propertyNode.node.Pitches.innerData);
                        }
                    }
                }
                _gpxDocument.tracks.push(track);
            }
        }
    }
    
    public function readMasterBars()
    {
        if(_dom.hasNode.MasterBars)
        {
            var masterBarNodes = _dom.node.MasterBars.nodes.MasterBar;
            for(masterBarNode in masterBarNodes)
            {
                var masterBar = new GpxMasterBar();
                masterBar.barIds = toIntArray(masterBarNode.node.Bars.innerData);
                masterBar.time = toIntArray2(masterBarNode.node.Time.innerData, "/");
                
                if(masterBarNode.hasNode.Repeat)
                {
                    var repeatNode = masterBarNode.node.Repeat;
                    masterBar.repeatStart = toBool(repeatNode.att.start);
                    if(toBool(repeatNode.att.end))
                    {
                        masterBar.repeatCount = Std.parseInt(repeatNode.att.count);
                    }
                }
                _gpxDocument.masterBars.push(masterBar);
            }
        }
    }
    
    public function readBars()
    {
        if(_dom.hasNode.Bars)
        {
            for(barNode in _dom.node.Bars.nodes.Bar)
            {
                var bar = new GpxBar();
                bar.id = Std.parseInt(barNode.att.id);
                bar.voiceIds = toIntArray(barNode.node.Voices.innerData);
                bar.clef = barNode.node.Clef.innerData;
                bar.simileMark = barNode.hasNode.SimileMark ? barNode.node.SimileMark.innerData : null;
                _gpxDocument.bars.push(bar);
            }
        }
    }
    
    public function readVoices()
    {
        if(_dom.hasNode.Voices)
        {
            for(voiceNode in _dom.node.Voices.nodes.Voice)
            {
                var voice = new GpxVoice();
                voice.id = Std.parseInt(voiceNode.att.id);
                voice.beatIds = toIntArray(voiceNode.node.Beats.innerData);
                _gpxDocument.voices.push(voice);
            }
        }
    }
    
    public function readBeats()
    {
        if(_dom.hasNode.Beats)
        {
            for(beatNode in _dom.node.Beats.nodes.Beat)
            {
                var beat = new GpxBeat();
                beat.id = Std.parseInt(beatNode.att.id);
                beat.dyn = beatNode.node.Dynamic.innerData;
                beat.rhythmId = Std.parseInt(beatNode.node.Rhythm.att.ref);
                if (beatNode.hasNode.Notes)
                {
                    beat.noteIds = toIntArray(beatNode.node.Notes.innerData);
                }
                else
                {
                    beat.noteIds = [];
                }
                
                _gpxDocument.beats.push(beat);
            }
        }
    }
    
     public function readNotes()
     {
         if(_dom.hasNode.Notes)
         {
             for(noteNode in _dom.node.Notes.nodes.Note)
             {
                 var note = new GpxNote();
                 note.id = Std.parseInt(noteNode.att.id);
                 
                 note.tieDestination =  (noteNode.hasNode.Tie) 
                                     ? toBool(noteNode.node.Tie.att.destination) 
                                     : false;
                 note.vibrato = noteNode.hasNode.Vibrato;
                 
                 var propertyNodes = noteNode.node.Properties.nodes.Property;
                 for(propertyNode in propertyNodes)
                 {
                     var name = propertyNode.att.name;
                     if(name == "String")
                    {
                        note.string = Std.parseInt(propertyNode.node.String.innerData);
                    }
                    else if(name == "Fret")
                    {
                        note.fret = Std.parseInt(propertyNode.node.Fret.innerData);
                    }
                    else if(name == "Midi")
                    {
                        note.midiNumber = Std.parseInt(propertyNode.node.Number.innerData);
                    }
                    else if(name == "Tone")
                    {
                        note.tone = Std.parseInt(propertyNode.node.Step.innerData);
                    }
                    else if(name == "Octave")
                    {
                        note.octave = Std.parseInt(propertyNode.node.Number.innerData);
                    }
                    else if(name == "Element")
                    {
                        note.element = Std.parseInt(propertyNode.node.Element.innerData);
                    }
                    else if(name == "Variation")
                    {
                        note.variation = Std.parseInt(propertyNode.node.Variation.innerData);
                    }
                    else if(name == "Muted")
                    {
                        note.mutedEnabled = propertyNode.hasNode.Enable;
                    }
                    else if(name == "PalmMuted")
                    {
                        note.palmMutedEnabled = propertyNode.hasNode.Enable;
                    }
                    else if(name == "Slide")
                    {
                        note.slide = true;
                    }
                 }
                 
                 _gpxDocument.notes.push( note );
             }
         }
     } 
    
    public function readRhythms()
    {
        if(_dom.hasNode.Rhythms)
        {
            for(rhythmNode in _dom.node.Rhythms.nodes.Rhythm)
            {
                var rhythm = new GpxRhythm();
                rhythm.id = Std.parseInt(rhythmNode.att.id);
                rhythm.noteValue = rhythmNode.node.NoteValue.innerData;
                
                if(rhythmNode.hasNode.PrimaryTuplet)
                {
                    rhythm.primaryTupletDen = Std.parseInt(rhythmNode.node.PrimaryTuplet.att.den);
                    rhythm.primaryTupletNum = Std.parseInt(rhythmNode.node.PrimaryTuplet.att.num);
                }
                else
                {
                    rhythm.primaryTupletDen = 1;
                    rhythm.primaryTupletNum = 1;
                }
                
                rhythm.augmentationDotCount = (rhythmNode.hasNode.AugmentationDot)
                                            ? Std.parseInt(rhythmNode.node.AugmentationDot.att.count)
                                            : 0;
                _gpxDocument.rhythms.push(rhythm);
            }
        }
    }
    
}
