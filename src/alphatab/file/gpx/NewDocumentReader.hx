// /*
//  * This file is part of alphaTab.
//  *
//  *  alphaTab is free software: you can redistribute it and/or modify
//  *  it under the terms of the GNU General Public License as published by
//  *  the Free Software Foundation, either version 3 of the License, or
//  *  (at your option) any later version.
//  *
//  *  alphaTab is distributed in the hope that it will be useful,
//  *  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  *  GNU General Public License for more details.
//  *
//  *  You should have received a copy of the GNU General Public License
//  *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
//  *  
//  *  This code is based on the code of TuxGuitar. 
//  *      Copyright: J.Jørgen von Bargen, Julian Casadesus <julian@casadesus.com.ar>
//  *      http://tuxguitar.herac.com.ar/
//  */
// package alphatab.file.gpx;

// import alphatab.model.Song;
// import alphatab.model.SongFactory;

// /**
//  * This reader transforms a GPIF xml document into 
//  * a songmodel. 
//  */
// class NewDocumentReader
// {
//     private var _dom:Fast;
//     private var _gpxDocument:GpxDocument;
//     private var _factory:SongFactory;
//     private var _song:Song;
//     
//     private var _automations:Array<GpxAutomation>;
//     private var _barToTrack:Hash<Track>;
//     private var _barToHeader:Hash<MeasureHeader>;
//     private var _voiceToMeasure:Hash<Measure>;
//     private var _voiceIndexes:Hash<Int>;
//     private var _beatToVoice:Hash<Voice>;
//     
//     public function new(stream:Array<Int>, factory:SongFactory)
//     {
//         var str = "";
//         for(i in stream)
//         {
//             str += String.fromCharCode(i);
//         }
//         
//         _factory = factory;
//         _dom = new Fast( Xml.parse(str).firstElement());
//     }
//     
//     public function read() : Song
//     {
//         _automations = new GpxAutomation();
//         _barToHeader = new Hash<MeasureHeader>();
//         _barToTrack = new Hash<MeasureHeader>();
//         _voiceToMeasure = new Hash<MeasureHeader>();
//         _voiceIndexes = new Hash<Int>();
//         _beatToVoice = new Hash<Int>();
//         
//         _song = _factory.newSong();
//         _song.tempo = 120;
//         _song.tempoName = "";
//         _song.hideTempo = false;
//         _song.pageSetup = _factory.newPageSetup();
//         
//         // song info
//         readScore();
//         // mixtablechanges
//         readAutomations();
//         // tracks
//         readTracks();
//         // measureheaders
//         readMasterBars();
//         // measures
//         readBars();
//         // voices 
//         readVoices();
//         
//         return song;
//     }
//     
//     private function readVoices()
//     {
//         if(dom.hasNode.Voices)
//         {
//             for(voiceNode in dom.node.Voices.nodes.Voice)
//             {
//                 var voice = _factory.newVoice(_voiceIndexes.get(voiceNode.att.id));
//                 var beats = toIntArray(voiceNode.node.Beats.innerData);
//                 for(beat in beats)
//                 {
//                     _beatToVoice.set(beat, voice);
//                 }
//             }
//         }
//     }
//         
//     private function getAutomation(type:String, bar:Int)
//     {
//         for(automation in _automations)
//         {
//             if(automation.type == type && bar == automation.barId)
//             {
//                 return automation;
//             }
//         }
//         return null;
//     }
//     
//     private function readBars()
//     {
//         if(dom.hasNode.Bars)
//         {
//             for(barNode in dom.node.Bars.nodes.Bar)
//             {
//                 var id = barNode.att.id;
//                 var measureHeader = _measureHeaderForBar.get(id);
//                 var track = _barToTrack.get(id);
//                 if(measureHeader != null && track != null)
//                 {
//                     var measure = _factory.newMeasure(measureHeader);
//                     track.addMeasure(measure);
//                     var voices = toIntArray(barNode.node.Voices.innerData);
//                     var index = 0;
//                     for(voice in voices)
//                     {
//                         if(voice > 0)
//                         {
//                             _voiceIndexes = index;
//                             _voiceToMeasure.set(Std.string(voice), measure);
//                         }
//                         index++;
//                     }
//                     var clef = barNode.node.Clef.innerData;
//                     if(clef == "G2")
//                     {
//                         measure.clef = MeasureClef.Treble;
//                     }
//                     else if(clef == "F4")
//                     {
//                         measure.clef = MeasureClef.Bass;
//                     }
//                     else if(clef == "C3")
//                     {
//                         measure.clef = MeasureClef.Alto;
//                     }
//                     else if(clef == "C4")
//                     {
//                         measure.clef = MeasureClef.Tenor;
//                     }
//                 }
//             }
//         }
//     }
//     
//     private function readMasterBars()
//     {
//         if(dom.hasNode.MasterBars)
//         {
//             var masterBarNodes = dom.node.MasterBars.nodes.MasterBar;
//             for(masterBarNode in masterBarNodes)
//             {
//                 var i = _song.measureHeaders.length;
//                 var header = _factory.newMeasureHeader();
//                 _song.addMeasureHeader(header);
//                 // general
//                 header.number = i+1;
//                 header.start = 0;
//                 header.tempo.value = song.tempo;
//                 header.tripletFeel = TripletFeel.None;
//                 
//                 // time signature
//                 var time =  toIntArray(masterBarNode.node.Time.innerData, "/");
//                 header.timeSignature.numerator = time[0];
//                 header.timeSignature.denominator.value = time[1];
//                 
//                 if(masterBarNode.hasNode.Repeat)
//                 {
//                     var repeatNode = masterBarNode.node.Repeat;
//                     header.isRepeatOpen = toBool(repeatNode.att.start);
//                     if(toBool(repeatNode.att.end))
//                     {
//                         header.repeatClose = Std.parseInt(repeatNode.att.count);
//                     }
//                 }
//                 
//                 // store lookup for assigning bars
//                 var i = 0;
//                 var bars = toIntArray(masterBarNode.node.Bars.innerData);
//                 for(bar in bars)
//                 {
//                     _barToTrack.set(Std.String(bars), _song.tracks[i]);
//                     _barToHeader.set(Std.String(bars), header);
//                     i++;
//                 }
//             }
//         }
//     }
//     
//     private function readTracks() 
//     {
//         if(dom.hasNode.Tracks)
//         {
//             for(trackNode in dom.node.Tracks.nodes.Track)
//             {
//                 var track = _factory.newTrack();                
//                 _song.addTrack(track);
//                 
//                 track.number = _song.tracks.length;
//                 track.name = trackNode.node.Name.innerData;
//                 var color = toIntArray(trackNode.node.Color.innerData);
//                 track.track.color.r = color[0];
//                 track.track.color.g = color[1];
//                 track.track.color.b = color[2];
//                 
//                 if(trackNode.hasNode.GeneralMidi)
//                 {
//                     var gmNode = trackNode.node.GeneralMidi;
//                     track.channel.instrument(Std.parseInt(gmNode.node.Program.innerData));
//                     track.channel.channel = Std.parseInt(gmNode.node.PrimaryChannel.innerData);
//                     track.channel.effectChannel = Std.parseInt(gmNode.node.SecondaryChannel.innerData);
//                 }
//                 
//                 // TODO: per tracks lyrics
//                 /*if(trackNode.hasNode.Lyrics)
//                 {
//                     var lyrics = _factory.newLyrics();
//                     for(lineNode in trackNode.node.Lyrics.node.Line)
//                     {
//                         var line = _factory.newLyricLine();
//                         lyrics.lines.push(line);
//                         line.startingMeasure = Std.parseInt(lineNode.node.Offset.innerData);
//                         line.lyrics = lineNode.node.Text.innerData;
//                     }
//                     track.lyrics = lyrics;
//                 }*/                
//                 
//                 if(trackNode.hasNode.Properties)
//                 {
//                     for(propertyNode in trackNode.node.Properties.nodes.Property)
//                     {
//                         if(propertyNode.att.name == "Tuning")
//                         {
//                             var pitches = toIntArray(propertyNode.node.Pitches.innerData);
//                             var s = 1;
//                             while(s <= pitches.length)
//                             {
//                                 track.track.strings.push(newString(s, pitches[pitches.length - s]));
//                                 s++;
//                             }
//                         }
//                     }
//                 }
//                 
//                 // create default tuning
//                 if(track.track.strings.length == 0)
//                 {
//                     track.track.strings.push(newString(1, 64));
//                     track.track.strings.push(newString(2, 59));
//                     track.track.strings.push(newString(3, 55));
//                     track.track.strings.push(newString(4, 50));
//                     track.track.strings.push(newString(5, 45));
//                     track.track.strings.push(newString(6, 40));
//                 }
//             }
//         }
//     }
//     
//     public function readAutomations() 
//     {
//         // preread automations for later accessing
//         if(dom.hasNode.MasterTrack && dom.node.MasterTrack.hasNode.Automations)
//         {
//             for(automationNode in dom.node.MasterTrack.node.Automations.nodes.Automation)
//             {
//                 var automation:GpxAutomation = new GpxAutomation();
//                 automation.type = automationNode.node.Type.innerData;
//                 automation.barId = Std.parseInt(automationNode.node.Bar.innerData);
//                 automation.value = toIntArray(automationNode.node.Value.innerData);
//                 automation.linear = toBool(automationNode.node.Linear.innerData);
//                 automation.position = Std.parseInt(automationNode.node.Position.innerData);
//                 automation.visible = toBool(automationNode.node.Visible.innerData);
//                 _automations.push(automation);
//             }
//         }
//     }
//     
//     private function readScore()
//     {
//         var scoreNode = dom.node.Score;
//         song.title = scoreNode.node.Title.innerData;    
//         song.subtitle = scoreNode.node.SubTitle.innerData;  
//         song.artist = scoreNode.node.Artist.innerData;  
//         song.album = scoreNode.node.Album.innerData;    
//         song.words = scoreNode.node.Words.innerData;    
//         song.music = scoreNode.node.Music.innerData;    
//         song.copyright = scoreNode.node.Copyright.innerData;    
//         song.tab = scoreNode.node.Tabber.innerData; 
//         song.instructions = scoreNode.node.Instructions.innerData;  
//         song.notice = scoreNode.node.Notices.innerData; 
//         
//         song.pageSetup.pageSize.x = Std.parseInt(scoreNode.node.PageSetup.node.Width.innerData);
//         song.pageSetup.pageSize.y  = Std.parseInt(scoreNode.node.PageSetup.node.Height.innerData);
//         //gpxDocument.song.pageSetup.orientation = scoreNode.node.PageSetup.node.Orientation.innerData;
//         song.pageSetup.pageMargin = new Padding(
//             Std.parseInt(scoreNode.node.PageSetup.node.RightMargin.innerData),
//             Std.parseInt(scoreNode.node.PageSetup.node.TopMargin.innerData),
//             Std.parseInt(scoreNode.node.PageSetup.node.LeftMargin.innerData),
//             Std.parseInt(scoreNode.node.PageSetup.node.BottomMargin.innerData));
//         song.pageSetup.scoreSizeProportion = Std.parseFloat(scoreNode.node.PageSetup.node.Scale.innerData);
//     }
//     
//     private function toIntArray(str:String, sep:String = " ")
//     {
//         var lst = new Array<Int>();
//         for(part in str.split(sep))
//         {
//             lst.push(Std.parseInt(part));
//         }
//         return lst;
//     }
//     
//     private function toBool(str:String) : Bool
//     {
//         return str.toLowerCase() == "true";
//     }
// }