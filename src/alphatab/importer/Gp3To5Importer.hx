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
package alphatab.importer;

import alphatab.model.AccentuationType;
import alphatab.model.Automation;
import alphatab.model.AutomationType;
import alphatab.model.Bar;
import alphatab.model.Beat;
import alphatab.model.BendPoint;
import alphatab.model.BrushType;
import alphatab.model.Chord;
import alphatab.model.Duration;
import alphatab.model.DynamicValue;
import alphatab.model.GraceType;
import alphatab.model.HarmonicType;
import alphatab.model.MasterBar;
import alphatab.model.Note;
import alphatab.model.PickStrokeType;
import alphatab.model.PlaybackInformation;
import alphatab.model.Score;
import alphatab.model.Section;
import alphatab.model.SlideType;
import alphatab.model.Track;
import alphatab.model.TripletFeel;
import alphatab.model.VibratoType;
import alphatab.model.Voice;
import haxe.io.Bytes;

/**
 * This ScoreImporter can read Guitar Pro 3 to 5 files.
 */
class Gp3To5Importer extends ScoreImporter
{
    private static inline var VERSION_STRING = "FICHIER GUITAR PRO ";
    
    #if unit public #else private #end var _versionNumber:Int;
    
    // temporary data for building the model
    private var _score:Score;
    
    private var _tempo:Int;
    private var _keySignature:Int;
    private var _octave:Int;
    private var _globalTripletFeel:TripletFeel;
    
    private var _lyricsIndex:Array<Int>;
    private var _lyrics:Array<String>;
    private var _lyricsTrack:Int;
    
    private var _barCount:Int;
    private var _trackCount:Int;
    
    private var _beatTapping:Bool;
    
    private var _playbackInfos:Array<PlaybackInformation>;
    
    public function new() 
    {         
        super();
        _globalTripletFeel = NoTripletFeel;
    }
   
    public override function readScore():Score 
    {
        readVersion();
        
        _score = new Score();
        
        // basic song info
        readScoreInformation();
                
        // triplet feel before Gp5
        if (_versionNumber < 500)
        {
            _globalTripletFeel = readBool() ? Triplet8th : NoTripletFeel;
        }
        
        // beat lyrics
        if (_versionNumber >= 400)
        {
            readLyrics();
        }
        
        // rse master settings since GP5.1
        if (_versionNumber >= 510)
        {
            // master volume (4)
            // master effect (4)
            // master equalizer (10)
            // master equalizer preset (1)
            skip(19); 
        }
                
        // page setup since GP5
        if (_versionNumber >= 500)
        {
            readPageSetup();
            _score.tempoLabel = readStringIntByte();
        }
        
        // tempo stuff
        _score.tempo = readInt32();
        if (_versionNumber >= 510)
        {
            readBool(); // hide tempo?
        }
        // keysignature and octave
        _keySignature = readInt32();
        if (_versionNumber >= 400)
        {
            _octave = readUInt8();
        }

        readPlaybackInfos();
        
        // repetition stuff
        if (_versionNumber >= 500)
        {
            // "Coda" bar index (2)
            // "Double Coda" bar index (2)
            // "Segno" bar index (2)
            // "Segno Segno" bar index (2)
            // "Fine" bar index (2)
            // "Da Capo" bar index (2)
            // "Da Capo al Coda" bar index (2)
            // "Da Capo al Double Coda" bar index (2)
            // "Da Capo al Fine" bar index (2)
            // "Da Segno" bar index (2)
            // "Da Segno al Coda" bar index (2)
            // "Da Segno al Double Coda" bar index (2)
            // "Da Segno al Fine "bar index (2)
            // "Da Segno Segno" bar index (2)
            // "Da Segno Segno al Coda" bar index (2)
            // "Da Segno Segno al Double Coda" bar index (2)
            // "Da Segno Segno al Fine" bar index (2)
            // "Da Coda" bar index (2)
            // "Da Double Coda" bar index (2)
            skip(38);
            // unknown (4)
            skip(4);
        }
        
        // contents
        _barCount = readInt32();
        _trackCount = readInt32();
        
        readMasterBars();
        readTracks();
        readBars();
        
        finish(_score);
        
        return _score;
    }

    
    #if unit public #else private #end function readVersion()
    {
        var version = readStringByteLength(30);
        
        if (!StringTools.startsWith(version, VERSION_STRING))
        {
            throw ScoreImporter.UNSUPPORTED_FORMAT; 
        }

        version = version.substr(VERSION_STRING.length + 1);
        var dot:Int = version.indexOf(".");
        // assert(dot != -1)
        
        _versionNumber = (100 * Std.parseInt(version.substr(0, dot))) + 
                            Std.parseInt(version.substr(dot + 1));
                            
    }
    
    private function readScoreInformation() : Void
    {
        _score.title = readStringIntUnused();
        _score.subTitle = readStringIntUnused();
        _score.artist = readStringIntUnused();
        _score.album = readStringIntUnused();
        _score.words = readStringIntUnused();

        if (_versionNumber >= 500)
        {
            _score.music = readStringIntUnused();
        }
        else
        {
            _score.music = _score.words;
        }
        
        _score.copyright = readStringIntUnused();
        _score.tab = readStringIntUnused();
        _score.instructions = readStringIntUnused();
        
        var noticeLines = readInt32();
        var notice:StringBuf = new StringBuf();
        for (i in 0 ... noticeLines)
        {
            if (i > 0)
            {
                notice.add("\n");
            }
            notice.add(readStringIntUnused());
        }
        _score.notices = notice.toString();
    }
    
    private function readLyrics()
    {
        _lyrics = new Array<String>();
        _lyricsIndex  = new Array<Int>();
        
        _lyricsTrack = readInt32();
        for ( i in 0 ... 5)
        {
            _lyricsIndex.push(readInt32() - 1);
            _lyrics.push(readStringInt());
        }
    }
    
    private function readPageSetup()
    {
        // Page Width (4)
        // Page Heigth (4)
        // Padding Left (4)
        // Padding Right (4)
        // Padding Top (4)
        // Padding Bottom (4)
        // Size Proportion(4)
        // Header and Footer display flags (2)
        skip(30);
        // title format
        // subtitle format
        // artist format
        // album format
        // words format
        // music format
        // words and music format
        // copyright format
        // pagenumber format
        for (i in 0 ... 10)
        {
            readStringIntByte();
        }
    }
    
    private function readPlaybackInfos()
    {
        _playbackInfos = new Array<PlaybackInformation>();
        for (i in 0 ... 64)
        {
            var info:PlaybackInformation = new PlaybackInformation();
            info.primaryChannel = i;
            info.secondaryChannel = i;
            info.program = readInt32();
            
            info.volume = readUInt8();
            info.balance = readUInt8();
            // chorus (1)
            // reverb (1)
            // phaser (1)
            // tremolo (1)
            // compatibility (2)
            skip(6);
            
            _playbackInfos.push(info);
        }
    }
    
    private function readMasterBars()
    {
        for (i in 0 ... _barCount)
        {
            readMasterBar();
        }        
    }
    
    private function readMasterBar()
    {
        var previousMasterBar:MasterBar = null;
        if (_score.masterBars.length > 0)
        {
            previousMasterBar = _score.masterBars[_score.masterBars.length - 1];
        }
        
        var newMasterBar:MasterBar = new MasterBar();
        var flags = readUInt8();
        
        // time signature
        if ( (flags & 0x01) != 0 )
        {
            newMasterBar.timeSignatureNumerator = readUInt8();
        }
        else if(previousMasterBar != null)
        {
            newMasterBar.timeSignatureNumerator = previousMasterBar.timeSignatureNumerator;
        } 
        if ( (flags & 0x02) != 0 )
        {
            newMasterBar.timeSignatureDenominator = readUInt8();
        }
        else if(previousMasterBar != null)
        {
            newMasterBar.timeSignatureDenominator = previousMasterBar.timeSignatureDenominator;
        }
                
        // repeatings
        newMasterBar.isRepeatStart = (flags & 0x04) != 0;
        if (  (flags & 0x08) != 0 )
        {
            if (_versionNumber >= 500)
            {
                newMasterBar.repeatCount = readUInt8();
            }
            else
            {
                newMasterBar.repeatCount = 1;
            }
        }
        
        // marker
        if ( (flags & 0x20) != 0 )
        {
            var section:Section = new Section();
            section.text = readStringIntByte();
            section.marker = "";
            readColor();
            newMasterBar.section = section;
        }
        
        // alternate endings
        if ( (flags & 0x10) != 0 && _versionNumber < 500 )
        {
            var currentMasterBar:MasterBar = previousMasterBar;
            // get the already existing alternatives to ignore them 
            var existentAlternatives:Int = 0;
            while (currentMasterBar != null)
            {
                // found another repeat ending?
                if ( currentMasterBar.isRepeatEnd() && currentMasterBar != previousMasterBar)
                    break;
                // found the opening?
                if (currentMasterBar.isRepeatStart) 
                    break;
                
                existentAlternatives |= currentMasterBar.alternateEndings;
            }
            
            // now calculate the alternative for this bar
            var repeatAlternative:Int = 0;
            var repeatMask = readUInt8();
            for (i in 0 ... 8)
            {
                // only add the repeating if it is not existing
                var repeating = (1 << i);
                if (repeatMask > i && (existentAlternatives & repeating) == 0)
                {
                    repeatAlternative |=  repeating;
                }
            }
            
            newMasterBar.alternateEndings = repeatAlternative;
        }

        
        // keysignature
        if ( (flags & 0x40) != 0)
        {
            newMasterBar.keySignature = _data.readInt8();
            _data.readByte(); // keysignature type
        }
        else if(previousMasterBar != null)
        {
            newMasterBar.keySignature = previousMasterBar.keySignature;
        }
        
        
        if ((_versionNumber >= 500) && ((flags & 0x03) != 0))
        {
            skip(4);
        }
        
        // better alternate ending mask in GP5
        if ( (_versionNumber >= 500) && ((flags & 0x10) == 0))
        {
            newMasterBar.alternateEndings = readUInt8();
        }
        
        // tripletfeel
        if ( _versionNumber >= 500)
        {
            var tripletFeel = readUInt8();
            switch(tripletFeel)
            {
                case 1:
                    newMasterBar.tripletFeel = Triplet8th;
                case 2:
                    newMasterBar.tripletFeel = Triplet16th;
            }
            
            _data.readByte();
        }
        else 
        {
            newMasterBar.tripletFeel = _globalTripletFeel;
        }

        
        newMasterBar.isDoubleBar = (flags & 0x80) != 0;
    
        _score.addMasterBar(newMasterBar);
    }
    
    private function readTracks()
    {
        for (i in 0 ... _trackCount)
        {
            readTrack();
        }
    }
    
    private function readTrack()
    {
        var newTrack = new Track();
        _score.addTrack(newTrack);
		
        
        var flags = readUInt8();
        newTrack.name = readStringByteLength(40);
        newTrack.isPercussion = (flags & 0x01) != 0;

        var stringCount = readInt32();
        for ( i in 0 ... 7)
        {
            var tuning = readInt32();
            if (stringCount > i)
            {
                newTrack.tuning.push(tuning);
            }
        }
        
        var port = readInt32();
        var index = readInt32() - 1;
        var effectChannel = readInt32() - 1;
        skip(4); // Fretcount
        if (index >= 0 && index < _playbackInfos.length)
        {
            var info:PlaybackInformation = _playbackInfos[index];
            info.port = port;
            info.isSolo = (flags & 0x10) != 0;
            info.isMute = (flags & 0x20) != 0;
            info.secondaryChannel = effectChannel;
            
            newTrack.playbackInfo = info;
        }
        
        newTrack.capo = readInt32();
        skip(4); // Color
        
        if (_versionNumber >= 500)
        {
            // flags for 
            //  0x01 -> show tablature
            //  0x02 -> show standard notation
            readUInt8(); 
            // flags for
            //  0x02 -> auto let ring
            //  0x04 -> auto brush
            readUInt8();
            
            // unknown
            skip(43);
        }
        
        // unknown
        if (_versionNumber >= 510)
        {
            skip(4);
            readStringIntByte();
            readStringIntByte();
        }
        
    }
    
    private function readBars()
    {
        for ( b in 0 ... _barCount)
		{
			for (t in 0 ... _trackCount)
			{
                readBar(_score.tracks[t]);
            }
        }
    }
    
    private function readBar(track:Track)
    {
        var newBar:Bar = new Bar();
        track.addBar(newBar);
        
        var voiceCount = 1;
        if (_versionNumber >= 500)
        {
            _data.readByte();
            voiceCount = 2;
        }
        
        for ( v in 0 ... voiceCount)
        {
            readVoice(track, newBar);
        }
        
    }
    
    private function readVoice(track:Track, bar:Bar)
    {
        var beatCount = readInt32();
        if (beatCount == 0)
        {
            return;
        }
        
        var newVoice:Voice = new Voice();
        bar.addVoice(newVoice);
        
        for ( i in 0 ... beatCount)
        {
            readBeat(track, bar, newVoice);
        }
        
    }
    
    
    private function readBeat(track:Track, bar:Bar, voice:Voice)
    {
        var newBeat:Beat = new Beat();
        voice.addBeat(newBeat);
        var flags:Int = readUInt8();
        
        if ( (flags & 0x01) != 0)
        {
            newBeat.dots = 1;
        }
        
        if ( (flags & 0x40) != 0)
        {
            readUInt8(); // isEmpty
        }
        
        var duration = _data.readInt8();
        switch(duration)
        {
            case -2:
                newBeat.duration = Duration.Whole;
            case -1:
                newBeat.duration = Duration.Half;
            case 0:
                newBeat.duration = Duration.Quarter;
            case 1:
                newBeat.duration = Duration.Eighth;
            case 2:
                newBeat.duration = Duration.Sixteenth;
            case 3:
                newBeat.duration = Duration.ThirtySecond;
            case 4:
                newBeat.duration = Duration.SixtyFourth;
            default:
                newBeat.duration = Duration.Quarter;
        }
        
        if ( (flags & 0x20) != 0)
        {
            newBeat.tupletNumerator = readInt32();
            switch(newBeat.tupletNumerator)
            {
                case 1:
                    newBeat.tupletDenominator = 1;
                case 3:
                    newBeat.tupletDenominator = 2;
                case 5,6,7:
                    newBeat.tupletDenominator = 4;
                case 9,10,11,12,13:
                    newBeat.tupletDenominator = 8;
                case 2, 4, 8:
                default:
                    newBeat.tupletNumerator = 1;
                    newBeat.tupletDenominator = 1;
            }
        }

        if ( (flags & 0x02) != 0)
        {
            readChord(newBeat);
        }
        
        if ( (flags & 0x04) != 0)
        {
            newBeat.text = readStringIntUnused();
        }
        
        if ( (flags & 0x08) != 0)
        {
            readBeatEffects(newBeat);
        }
        
        if ( (flags & 0x10) != 0)
        {
            readMixTableChange(newBeat);
        }
        
        var stringFlags = readUInt8();
        var i = 6;
        while (i >= 0)
        {
            if ((stringFlags & (1 << i)) != 0 && (6 - i) < track.tuning.length)
            {
                readNote(track, bar, voice, newBeat, (6 - i));
            }

            i--;
        }
        
        if (_versionNumber >= 500)
        {
            readUInt8();
            var flag = readUInt8();
            if ( (flag & 0x08) != 0)
            {
                readUInt8();
            }
        }
        
    }
    
    private function readChord(beat:Beat)
    {
        var chord:Chord = new Chord();
        if (_versionNumber >= 500)
        {
            skip(17);
            chord.name = readStringByteLength(21);
            skip(4);
            chord.firstFret = readInt32();
            for (i in 0 ... 7) 
            {
                var fret = readInt32();
                if (i < chord.strings.length) 
                {
                    chord.strings.push(fret);
                }
            }
            skip(32);
        }
        else
        {
            if ( readUInt8() != 0) // mode1?
            {
                // gp4
                if (_versionNumber >= 400)
                {
                    // Sharp (1)
                    // Unused (3)
                    // Root (1)
                    // Major/Minor (1)
                    // Nin,Eleven or Thirteen (1)
                    // Bass (4)
                    // Diminished/Augmented (4)
                    // Add (1)
                    skip(16);
                    chord.name = (readStringByteLength(21));
                    // Unused (2)
                    // Fifth (1)
                    // Ninth (1)
                    // Eleventh (1)
                    skip(4);
                    chord.firstFret = (readInt32());
                    for (i in 0 ... 7) 
                    {
                        var fret = readInt32();
                        if (i < chord.strings.length) 
                        {
                            chord.strings.push(fret);
                        }
                    }
                    // number of barres (1)
                    // Fret of the barre (5)
                    // Barree end (5)
                    // Omission1,3,5,7,9,11,13 (7)
                    // Unused (1)
                    // Fingering (7)
                    // Show Diagram Fingering (1)
                    // ??
                    skip(32);
                }
                else
                {
                    // unknown
                    skip(25);
                    chord.name = readStringByteLength(34);
                    chord.firstFret = readInt32();
                    for (i in 0 ... 6)
                    {
                        var fret = readInt32();
                        chord.strings.push(fret);
                    }
                    // unknown
                    skip(36);
                }
            }
            else
            {
                var strings:Int;
                if (_versionNumber >= 406)
                {
                    strings = 7;
                }
                else
                {
                    strings = 6;
                }
            
                chord.name = readStringIntByte();
                chord.firstFret = readInt32();
                if (chord.firstFret > 0)
                {
                    for (i in 0 ... strings) 
                    {
                        var fret = readInt32();
                        if (i < chord.strings.length) 
                        {
                            chord.strings.push(fret);
                        }
                    }
                }
            }
        }
        
    
        if (chord.name.length > 0)
        {
            beat.chord = chord;
        }
    }
    
    private function readBeatEffects(beat:Beat)
    {
        var flags = readUInt8();
        var flags2 = 0;
        if ( _versionNumber >= 400)
        {
            flags2 = readUInt8();
        }
        
        beat.fadeIn = (flags & 0x10) != 0;
        if ( (flags & 0x02) != 0)
        {
            beat.vibrato = VibratoType.Slight;
        }
        beat.hasRasgueado = (flags2 & 0x01) != 0;            
        
        
        if ( (flags & 0x20) != 0 && _versionNumber >= 400)
        {
            var slapPop = _data.readInt8();
            switch(slapPop)
            {
                case 1:
                    _beatTapping = true;
                case 2:
                    beat.slap = true;
                case 3:
                    beat.pop = true;
            }
        }
        else if ( (flags & 0x20) != 0)
        {
            var slapPop = _data.readInt8();
            switch(slapPop)
            {
                case 1:
                    _beatTapping = true;
                case 2:
                    beat.slap = true;
                case 3:
                    beat.pop = true;
            }
            skip(4);
        }
        
        if ( (flags2 & 0x04) != 0)
        {
            readTremoloBarEffect(beat);
        }
        
        
        if ( (flags & 0x40) != 0)
        {
            var strokeUp : Int;
            var strokeDown :Int;
            
            if ( _versionNumber < 500)
            {
                strokeDown = readUInt8();
                strokeUp = readUInt8();
            }
            else
            {
                strokeUp = readUInt8();
                strokeDown = readUInt8();
            }
            
            if (strokeUp > 0)
            {
                beat.brushType = BrushType.BrushUp;
                beat.brushDuration = toStrokeValue(strokeUp);
            }
            else if (strokeDown > 0)
            {
                beat.brushType = BrushType.BrushDown;
                beat.brushDuration = toStrokeValue(strokeDown);
            }
        }
        
        if ( (flags2 & 0x02) != 0)
        {
            switch(_data.readInt8())
            {
                case 0:
                    beat.pickStroke = PickStrokeType.None;
                case 1: 
                    beat.pickStroke = PickStrokeType.Up;
                case 2:
                    beat.pickStroke = PickStrokeType.Down;
            }
        }
    }
    
    private function readTremoloBarEffect(beat:Beat)
    {
        _data.readByte(); // type
        readInt32(); // value
        var pointCount = readInt32();
        if (pointCount > 0)
        {
            for (i in 0 ... pointCount) 
            {
                var point = new BendPoint();
                point.offset = readInt32(); // 0...60
                point.value = Std.int(readInt32() / BEND_STEP); // 0..12 (amount of quarters)
                readBool(); // vibrato
                beat.whammyBarPoints.push(point);
            } 
        }
    }
    private function toStrokeValue(value:Int) : Int
    {
        switch(value)
        {
            case 1:
                return 30;
            case 2:
                return 30;
            case 3:
                return 60;
            case 4:
                return 120;
            case 5:
                return 240;
            case 6:
                return 480;
            default:
                return 0;
        }
    }
    
    private function readMixTableChange(beat:Beat)
    {
        var tableChange:MixTableChange = new MixTableChange();
        tableChange.instrument = _data.readInt8();
        if (_versionNumber >= 500)
        {
            skip(16); // Rse Info 
        }
        tableChange.volume = _data.readInt8();
        tableChange.balance = _data.readInt8();
        var chorus = _data.readInt8();
        var reverb = _data.readInt8();
        var phaser = _data.readInt8();
        var tremolo = _data.readInt8();
        if (_versionNumber >= 500)
        {
            tableChange.tempoName = readStringIntByte();
        }
        tableChange.tempo = readInt32();
        
        // durations
        if (tableChange.volume >= 0) 
        {
            _data.readByte();
        }
            
        if (tableChange.balance >= 0) 
        {
             _data.readByte();
        }

        if (chorus >= 0) 
        {
            _data.readByte();
        }
            
        if (reverb >= 0) 
        {
            _data.readByte();
        }
            
        if (phaser >= 0) 
        {
            _data.readByte();
        }
            
        if (tremolo >= 0) 
        {
            _data.readByte();
        }
            
        if (tableChange.tempo >= 0) 
        {
            tableChange.duration = _data.readInt8();
            if (_versionNumber >= 510)
            {
                _data.readByte(); // hideTempo (bool)
            }
        }
        
        if (_versionNumber >= 400)
        {
            _data.readByte(); // all tracks flag
        }
        
        // unknown
        if (_versionNumber >= 500)
        {
            _data.readByte();
        }
        // unknown
        if (_versionNumber >= 510)
        {
            readStringIntByte();
            readStringIntByte();
        }
        
        if (tableChange.volume >= 0)
        {
            var volumeAutomation = new Automation();
            volumeAutomation.isLinear = true;
            volumeAutomation.type = AutomationType.Volume;
            volumeAutomation.value = tableChange.volume;
            beat.automations.push(volumeAutomation);
        }
        
        if (tableChange.balance >= 0)
        {
            var balanceAutomation = new Automation();
            balanceAutomation.isLinear = true;
            balanceAutomation.type = AutomationType.Balance;
            balanceAutomation.value = tableChange.balance;
            beat.automations.push(balanceAutomation);
        }
        
        if (tableChange.instrument >= 0)
        {
            var instrumentAutomation = new Automation();
            instrumentAutomation.isLinear = true;
            instrumentAutomation.type = AutomationType.Instrument;
            instrumentAutomation.value = tableChange.instrument;
            beat.automations.push(instrumentAutomation);
        }
        
        if (tableChange.tempo >= 0)
        {
            var tempoAutomation = new Automation();
            tempoAutomation.isLinear = true;
            tempoAutomation.type = AutomationType.Tempo;
            tempoAutomation.value = tableChange.tempo;
            beat.automations.push(tempoAutomation);
        }
    }
    
    private function readNote(track:Track, bar:Bar, voice:Voice, beat:Beat, stringIndex:Int)
    {
        var newNote = new Note();
        newNote.string = track.tuning.length - stringIndex;
        newNote.tapping = _beatTapping;
        
        var flags = readUInt8();
        if ( (flags & 0x02) != 0 )
        {
            newNote.accentuated = AccentuationType.Heavy;
        }
        else if ( (flags & 0x40) != 0)
        {
            newNote.accentuated = AccentuationType.Normal;
        }
        
        newNote.isGhost = ( (flags & 0x04) != 0);
        if ( (flags & 0x20) != 0) 
        {
            var noteType:Int = readUInt8();
            if (noteType == 3)
            {
                newNote.isDead = true;
            }
            else if (noteType == 2)
            {
                newNote.isTieDestination = true;
            }
        }
        
        if ( (flags & 0x10) != 0 ) 
        {
            var dynamicNumber = _data.readInt8();
            newNote.dynamicValue = toDynamicValue(dynamicNumber);
        }
        
        if ( (flags & 0x20) != 0)
        {
            newNote.fret = _data.readInt8();
        }
        
        if ( (flags & 0x80) != 0)
        {
            newNote.leftHandFinger = _data.readInt8();
            newNote.rightHandFinger = _data.readInt8();
            newNote.isFingering = true;
        }
        
        if (_versionNumber >= 500)
        {
            if ((flags & 0x01) != 0)
            {
                newNote.durationPercent = readDouble();
            }
            var flags2 = _data.readByte();
            newNote.swapAccidentals = (flags2 & 0x02) != 0;
        }
        
        if ( (flags & 0x08) != 0)
        {
            readNoteEffects(track, voice, beat, newNote);
        }

        beat.addNote(newNote);
    }
    
    private function toDynamicValue(value:Int)
    {
        switch(value + 1)
        {
            case 1:
                return DynamicValue.PPP;
            case 2:
                return DynamicValue.PP;
            case 3:
                return DynamicValue.P;
            case 4:
                return DynamicValue.MP;
            case 5:
                return DynamicValue.MF;
            case 7:
                return DynamicValue.F;
            case 8:
                return DynamicValue.FF;
            case 9:
                return DynamicValue.FFF;
            default:
                return DynamicValue.F;
        }
    }
    
    private function readNoteEffects(track:Track, voice:Voice, beat:Beat, note:Note)
    {
        var flags = readUInt8();
        var flags2 = 0;
        if (_versionNumber >= 400)
        {
            flags2 = readUInt8();            
        }
        
        if ( (flags & 0x01) != 0)
        {
            readBend(note);
        }
        
        if ( (flags & 0x10) != 0)
        {
            readGrace(voice, note);
        }
        
        if ( (flags2 & 0x04) != 0)
        {
            readTremoloPicking(beat);
        }
        
        if (  (flags2 & 0x08) != 0 )
        {
            readSlide(note);
        }
        else if ( _versionNumber < 400)
        {
            if ( (flags & 0x04) != 0)
            {
                note.slideType = SlideType.Shift;
            }
        }
        
        if ( (flags2 & 0x10) != 0)
        {
            readArtificialHarmonic(note);
        }
        else if ( _versionNumber < 400)
        {
            if ( (flags & 0x04) != 0)
            {
                note.harmonicType = HarmonicType.Natural;
                note.harmonicValue = deltaFretToHarmonicValue(note.fret);
            }
            if ((flags & 0x08) != 0)
            {
                note.harmonicType = HarmonicType.Artificial;
            }
        }
        
        if ( (flags2 & 0x20) != 0)
        {
            readTrill(note);
        }
        
        note.isLetRing = (flags & 0x08) != 0;
        note.isHammerPullOrigin = (flags & 0x02) != 0;
        if ( (flags2 & 0x40) != 0)
        {
            note.vibrato = VibratoType.Slight;
        }
        note.isPalmMute = (flags2 & 0x02) != 0;
        note.isStaccato = (flags2 & 0x01) != 0;
    }
    
    private static inline var BEND_STEP:Float = 25; // 25 per Quarter Note
    private function readBend(note:Note) : Void
    {
        _data.readByte(); // type
        readInt32(); // value
        var pointCount = readInt32();
        if (pointCount > 0)
        {
            for (i in 0 ... pointCount) 
            {
                var point = new BendPoint();
                point.offset = readInt32(); // 0...60
                point.value = Std.int(readInt32() / BEND_STEP); // 0..12 (amount of quarters)
                readBool(); // vibrato
                note.bendPoints.push(point);
            } 
        }
    }
    
    private function readGrace(voice:Voice, note:Note)
    {
        var graceBeat = new Beat();
        var graceNote = new Note();
        graceNote.string = note.string;
        graceNote.fret = _data.readInt8();		
        graceBeat.duration = Duration.ThirtySecond;
		skip(1); // Dynamic
		var transition = _data.readInt8();
		switch (transition) 
		{
            case 0: // none
            case 1:
				graceNote.slideType = SlideType.Legato;
				graceNote.slideTarget = note;
            case 2: // bend
            case 3: // hammer
				graceNote.isHammerPullOrigin = true;
				note.isHammerPullDestination = true;
				note.hammerPullOrigin = graceNote;
        }
        skip(1); // duration

        if (_versionNumber < 500)
        {
            graceBeat.graceType = GraceType.BeforeBeat;
        }
        else
        {
            var flags = readUInt8();
			graceNote.isDead = (flags & 0x01) != 0;
            if ( ((flags & 0x02) != 0)) 
            {
                graceBeat.graceType = GraceType.OnBeat;
            }
            else
            {
                graceBeat.graceType = GraceType.BeforeBeat;
            }
        }
        
        graceBeat.addNote(graceNote);
        voice.addGraceBeat(graceBeat); 
    }
    
    private function readTremoloPicking(beat:Beat)
    {
		var speed = readUInt8();
		switch(speed)
		{
			case 1: beat.tremoloSpeed = Duration.Eighth;
			case 2: beat.tremoloSpeed = Duration.Sixteenth;
			case 3: beat.tremoloSpeed = Duration.ThirtySecond;
		}
    }
    
    private function readSlide(note:Note)
    {
        if (_versionNumber >= 500)
        {
            var type:Int = readUInt8();
            switch (type) 
            {
                case 1:
                    note.slideType = SlideType.Shift;
                case 2:
                    note.slideType = SlideType.Legato;
                case 4:
                    note.slideType = SlideType.OutDown;
                case 8:
                    note.slideType = SlideType.OutUp;
                case 16:
                    note.slideType = SlideType.IntoFromBelow;
                case 32:
                    note.slideType = SlideType.IntoFromAbove;
                default:
                    note.slideType = SlideType.None;
            }
        }
        else
        {
            var type:Int = _data.readInt8();
            switch (type) 
            {
                case 1:
                    note.slideType = SlideType.Shift;
                case 2:
                    note.slideType = SlideType.Legato;
                case 3:
                    note.slideType = SlideType.OutDown;
                case 4:
                    note.slideType = SlideType.OutUp;
                case -1:
                    note.slideType = SlideType.IntoFromBelow;
                case -2:
                    note.slideType = SlideType.IntoFromAbove;
                default:
                    note.slideType = SlideType.None;
            }
        }
    }
   
    private function readArtificialHarmonic(note:Note) : Void
    {
        var type:Int = readUInt8();
        if (_versionNumber >= 500)
        {
            switch (type) 
            {
                case 1:
                    note.harmonicType = HarmonicType.Natural;
                    note.harmonicValue = deltaFretToHarmonicValue(note.fret);
                case 2:
                    var harmonicTone = readUInt8();
                    var harmonicKey = readUInt8();
                    var harmonicOctaveOffset = readUInt8();
                    note.harmonicType = HarmonicType.Artificial;
                    
                    // TODO: how to calculate the harmonic value? 
                case 3:
                    note.harmonicType = HarmonicType.Tap;
                    note.harmonicValue = deltaFretToHarmonicValue(readUInt8());
                case 4:
                    note.harmonicType = HarmonicType.Pinch;
                    note.harmonicValue = 12;
                case 5:
                    note.harmonicType = HarmonicType.Semi;
                    note.harmonicValue = 12;
            }
        }
        else if (_versionNumber >= 400)
        {
            switch (type) 
            {
                case 1:
                    note.harmonicType = HarmonicType.Natural;
                    note.harmonicValue = deltaFretToHarmonicValue(note.fret);
                case 3:
                    note.harmonicType = HarmonicType.Tap;
                case 4:
                    note.harmonicType = HarmonicType.Pinch;
                    note.harmonicValue = 12;
                case 5:
                    note.harmonicType = HarmonicType.Semi;
                    note.harmonicValue = 12;
                // TODO: check Artificial harmonic values
                case 15: 
                    note.harmonicType = HarmonicType.Artificial;
                    note.harmonicValue = deltaFretToHarmonicValue(note.fret + 5);
                case 17: 
                    note.harmonicType = HarmonicType.Artificial;
                    note.harmonicValue = deltaFretToHarmonicValue(note.fret + 7);
                case 22: 
                    note.harmonicType = HarmonicType.Artificial;
                    note.harmonicValue = deltaFretToHarmonicValue(note.fret + 12);
                default:
            }
        }
    }
    
    private function deltaFretToHarmonicValue(deltaFret:Int) : Float
    {
        switch(deltaFret)
        {
            case 2:
                return 2.4;
            case 3:
                return 3.2;
            case 4, 5, 7, 9, 12, 16, 17, 19, 24:
                return deltaFret;
            case 8:
                return 8.2;
            case 10:
                return 9.6;
            case 14,15:
                return 14.7;
            case 21,22:
                return 21.7;
            default: 
                return 12;
        }
    }
    
    private function readTrill(note:Note) : Void
    {
        note.trillFret = readUInt8();
        note.trillSpeed = 1 + readUInt8();
    }
    
    // Some special reading methods
    #if unit public #else private #end function readDouble() : Float
    {
        var bytes =  Bytes.alloc(8);
        _data.readBytes(bytes, 0, 8);
        
        var indices:Array<Int>;
        if (!_data.bigEndian)
        {
            indices = [7, 6, 5, 4, 3, 2, 1, 0];
        }
        else
        {
            indices = [0, 1, 2, 3, 4, 5, 6, 7];
        }
        
        var sign = 1 - ((bytes.get(indices[0]) >> 7) << 1); // sign = bit 0
        var exp = (((bytes.get(indices[0]) << 4) & 0x7FF) | (bytes.get(indices[1]) >> 4)) - 1023; // exponent = bits 1..11
        var sig = getDoubleSig(bytes, indices);
        if (sig == 0 && exp == -1023)
            return 0.0;
        return sign*(1.0 + Math.pow(2, -52)*sig)*Math.pow(2, exp);
    } 
    
    #if (js)
    private function getDoubleSig(bytes:Bytes, indices:Array<Int>) : Int
    {
        // This crazy toString() stuff works around the fact that js ints are
        // only 32 bits and signed, giving us 31 bits to work with
        var sig = untyped 
        {
            parseInt(((((bytes.get(indices[1])&0xF) << 16) | (bytes.get(indices[2]) << 8) | bytes.get(indices[3]) ) * Math.pow(2, 32)).toString(2), 2) +
            parseInt(((bytes.get(indices[4]) >> 7) * Math.pow(2,31)).toString(2), 2) +
            parseInt((((bytes.get(indices[4])&0x7F) << 24) | (bytes.get(indices[5]) << 16) | (bytes.get(indices[6]) << 8) | bytes.get(indices[7])).toString(2), 2);    // significand = bits 12..63
        }
        return sig;
    }
    #else
    // only works on 32bit integer runtimes (neko only has 31bit + sign) 
    private function getDoubleSig(bytes:Bytes, indices:Array<Int>) : Int
    {
        return ((bytes.get(indices[1]) & 0x0F) << 48) | (bytes.get(indices[2]) << 40) | (bytes.get(indices[3]) << 32)
               | (bytes.get(indices[4]) << 24) | (bytes.get(indices[5]) << 16) | (bytes.get(indices[6]) << 8) | bytes.get(indices[7]);
    }
    #end

    
    #if unit public #else private #end function readColor() : Void
    {
        readUInt8();
        readUInt8();
        readUInt8();
        readUInt8(); // alpha?
    }
    
    private inline function readBool()
    {
        return _data.readByte() != 0;
    }
    
    private inline function readUInt8()
    {
        return _data.readByte();
    }
    
    public function readInt32() 
    {
        var ch1 = _data.readByte();
        var ch2 = _data.readByte();
        var ch3 = _data.readByte();
        var ch4 = _data.readByte();
        return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
	}
    
    /**
     * Skips an integer (4byte) and reads a string using 
     * a bytesize
     */
    #if unit public #else private #end function readStringIntUnused() : String
    {
        skip(4);
        return _data.readString(_data.readByte());
    }
    
    /**
     * Reads an integer as size, and then the string itself
     */
    #if unit public #else private #end inline function readStringInt() : String
    {
        return _data.readString(readInt32());
    }
    
    /**
     * Reads an integer as size, skips a byte and reads the string itself
     */
    #if unit public #else private #end function readStringIntByte() : String
    {
        var length = readInt32() - 1;
        _data.readByte();
        return _data.readString(length);
    }
    
    /**
     * Reads a byte as size and the string itself 
     * Additionally it is ensured the specified amount of bytes is read. 
     * @param	length the amount of bytes to read
     */
    #if unit public #else private #end function readStringByteLength(length:Int) : String
    {
        var stringLength = readUInt8();
        var string = _data.readString(stringLength);
        if (stringLength < length)
        {
            skip( length - stringLength );
        }
        return string;
    }
    
    private inline function skip(count:Int)
    {
        _data.read(count);
    }
}