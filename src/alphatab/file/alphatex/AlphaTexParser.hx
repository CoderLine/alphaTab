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
package alphatab.file.alphatex;
import alphatab.file.FileFormatException;
import alphatab.file.SongReader;
import alphatab.file.guitarpro.Gp3Reader;
import alphatab.midi.GeneralMidi;
import alphatab.model.effects.BendEffect;
import alphatab.model.effects.BendPoint;
import alphatab.model.effects.HarmonicEffect;
import alphatab.model.effects.HarmonicType;
import alphatab.model.effects.TremoloPickingEffect;
import alphatab.model.effects.TrillEffect;
import alphatab.model.effects.GraceEffect;
import alphatab.model.effects.GraceEffectTransition;
import alphatab.model.Beat;
import alphatab.model.Velocities;
import alphatab.model.BeatStrokeDirection;
import alphatab.model.Duration;
import alphatab.model.GuitarString;
import alphatab.model.Measure;
import alphatab.model.MeasureClef;
import alphatab.model.MeasureHeader;
import alphatab.model.Note;
import alphatab.model.NoteEffect;
import alphatab.model.PageSetup;
import alphatab.model.SlideType;
import alphatab.model.Song;
import alphatab.model.Tempo;
import alphatab.model.Track;
import alphatab.model.Tuning;
import alphatab.model.Voice;

/**
 * This parser enables reading of alphaTex files.
 * @author Daniel Kuschny
 */
class AlphaTexParser extends SongReader  
{
    private static inline var EOL:String = String.fromCharCode(0);
    private static inline var TRACK_CHANNELS = [0, 1];
    
    private var _song:Song; 
    private var _track:Track; 
    
    private var _ch:String;
    private var _curChPos:Int;
    
    private var _sy:AlphaTexSymbols;
    private var _syData:Dynamic;
    
    private var _allowNegatives:Bool;
    
    private var _currentDuration:Int; 
    
    /**
     * Constructor.
     */
    public function new() 
    {
        super();
    }
    
    /**
     * Initializes the song with some required default values. 
     */
    private function createDefaultSong() : Void
    {
        _song = factory.newSong();    
        _song.tempo = 120;
        _song.tempoName = "";
        _song.hideTempo = false;
        
        _song.pageSetup = factory.newPageSetup();
        _track = factory.newTrack();
        _track.number = 1;
        _track.channel.instrument(25);
        _track.channel.channel = TRACK_CHANNELS[0];
        _track.channel.effectChannel = TRACK_CHANNELS[1];
        createDefaultStrings(_track.strings);
        
        _song.addTrack(_track);
    }
    
    /**
     * Fills the given list with 6 strings in standard tuning. (EADGBE)
     * @param list the list to fill.
     */
    private function createDefaultStrings(list:Array<GuitarString>) : Void
    {
        list.push(newString(1, 64));
        list.push(newString(2, 59));
        list.push(newString(3, 55));
        list.push(newString(4, 50));
        list.push(newString(5, 45));
        list.push(newString(6, 40));
    }
    
    /**
     * Creates a new string using the given number and tuning.
     * @param number the string number 
     * @param value the tuning
     * @return the created string.
     */
    private function newString(number:Int, value:Int): GuitarString
    {
        var str:GuitarString = factory.newString();
        str.number = number;
        str.value = value;
        
        return str;
    }
    
    /**
     * Reads the song using the initialized values. 
     * @return the song read
     * @throws FileFormatException thrown on a reading error. 
     */
    override public function readSong() : Song 
    {
        createDefaultSong();
        _curChPos = 0;
        _currentDuration = 4;
        nextChar();
        newSy();
        song();
        return _song;
    }
    
    private function error(nonterm:String, expected:AlphaTexSymbols, symbolError:Bool = true )
    {
        if (symbolError)
        {
            // 33: Error on Block XY, expected a EXP_SYMBOL found a CUR_SYMBOL
            throw new FileFormatException(Std.string(_curChPos) + ": Error on block " + nonterm + 
                                        ", expected a " + Std.string(expected) + " found a " + _sy);
        }
        else
        {
            // 33: Error on Block XY, invalid Value VALUE
            throw new FileFormatException(Std.string(_curChPos) + ": Error on block " + nonterm + 
                                        ", invalid value:" + Std.string(_syData));
        }
    }
    
    /**
     * Non Terminal - Song
     */
    private function song() : Void 
    {
        metaData();
        
        measures();
    }
    
    /**
     * Non Terminal - MetaData
     */
    private function metaData() : Void 
    {
        var anyMeta = false;
        while (_sy == AlphaTexSymbols.MetaCommand)
        {
            if (_syData == "title") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.String)
                {
                    _song.title = _syData;
                }
                else
                {
                    error("title", AlphaTexSymbols.String);
                }
                newSy();    
                anyMeta = true;
            }
            else if (_syData == "subtitle") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.String)
                {
                    _song.subtitle = _syData;
                }
                else
                {
                    error("subtitle", AlphaTexSymbols.String);
                }
                newSy();
                anyMeta = true;
            }
            else if (_syData == "artist") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.String)
                {
                    _song.artist = _syData;
                }
                else
                {
                    error("artist", AlphaTexSymbols.String);
                }
                newSy();
                anyMeta = true;
            }
            else if (_syData == "album") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.String)
                {
                    _song.album = _syData;
                }
                else
                {
                    error("album", AlphaTexSymbols.String);
                }
                newSy();
                anyMeta = true;
            }
            else if (_syData == "words") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.String)
                {
                    _song.words = _syData;
                }
                else
                {
                    error("words", AlphaTexSymbols.String);
                }
                newSy();
                anyMeta = true;
            }
            else if (_syData == "music") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.String)
                {
                    _song.music = _syData;
                }
                else
                {
                    error("music", AlphaTexSymbols.String);
                }
                newSy();
                anyMeta = true;
            }
            else if (_syData == "copyright") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.String)
                {
                    _song.copyright = _syData;
                }
                else
                {
                    error("copyright", AlphaTexSymbols.String);
                }
                newSy();
                anyMeta = true;
            }
            else if (_syData == "tempo") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.Number)
                {
                    _song.tempo = _syData;
                }
                else
                {
                    error("tempo", AlphaTexSymbols.Number);
                }
                newSy();
                anyMeta = true;
            }
            else if (_syData == "capo") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.Number)
                {
                    _track.offset = _syData;
                }
                else
                {
                    error("capo", AlphaTexSymbols.Number);
                }
                newSy();
                anyMeta = true;
            }
            else if (_syData == "tuning") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.Tuning) // we require at least one tuning
                {
                    _track.strings = new Array<GuitarString>();
                    do
                    {
                        _track.strings.push(newString(_track.strings.length + 1, parseTuning(_syData)));
                        newSy();
                    } while (_sy == AlphaTexSymbols.Tuning);
                }
                else
                {
                    error("tuning", AlphaTexSymbols.Tuning);
                }
                anyMeta = true;
            }
            else if (_syData == "instrument") 
            {
                newSy(); 
                if (_sy == AlphaTexSymbols.Number)
                {
                    var instrument:Int = cast _syData;
                    if(instrument >= 0 && instrument <= 128)
                    {
                        _track.channel.instrument(_syData);
                    }
                    else
                    {
                        this.error("instrument", AlphaTexSymbols.Number, false);
                    }
                }
                else if(_sy == AlphaTexSymbols.String) // Name
                {
                    var instrumentName:String = cast _syData;
                    _track.channel.instrument(GeneralMidi.getValue(instrumentName));
                }
                else
                {
                    error("instrument", AlphaTexSymbols.Number);
                }
                newSy();
                anyMeta = true;
            }
            else 
            {
                error("metaDataTags", AlphaTexSymbols.String, false);
            }
        }
        
        if (anyMeta)
        {
            if (_sy != AlphaTexSymbols.Dot) 
            {
                error("song", AlphaTexSymbols.Dot);
            }
            newSy();
        }
    }
    
    /**
     * Non Terminal - Measures
     */
    private function measures() : Void
    {
        var tempo:Tempo = factory.newTempo();
        tempo.value = _song.tempo;

        measure(tempo);
        while(_sy != AlphaTexSymbols.Eof)
        {
            // read pipe from last measure
            if (_sy != AlphaTexSymbols.Pipe) 
            {
                error("measures", AlphaTexSymbols.Pipe);
            }
            newSy();
            
            measure(tempo);
        }
    }
    
    /**
     * Non Terminal - Measure
     * @param tempo the current tempo in the song. l
     */
    private function measure(tempo:Tempo) : Void
    { 
        var header:MeasureHeader = factory.newMeasureHeader();
        header.number = _song.measureHeaders.length + 1;
        header.start = _song.measureHeaders.length == 0 ? Duration.QUARTER_TIME : 
                                                        _song.measureHeaders[_song.measureHeaders.length - 1].start + _song.measureHeaders[_song.measureHeaders.length - 1].length();
        _song.addMeasureHeader(header);
        
        var measure:Measure = factory.newMeasure(header);    
        header.tempo.copy(tempo); // takeover current tempo
        if (header.number > 1) 
        { 
            // takeover clef and keysignature
            var prevMeasure:Measure = _track.measures[header.number - 2];
            var prevHeader:MeasureHeader = _song.measureHeaders[header.number - 2];
            measure.clef = prevMeasure.clef;
            header.keySignature = prevHeader.keySignature;
            header.keySignatureType = prevHeader.keySignatureType; 
            prevHeader.timeSignature.copy(header.timeSignature);
        }
        measureMeta(measure);
        tempo.copy(header.tempo); // write new tempo on change
        _track.addMeasure(measure);
        
        while (_sy != AlphaTexSymbols.Pipe && _sy != AlphaTexSymbols.Eof)
        {
            beat(measure);
        }
    }
    
    /**
     * Non Terminal - MeasureMeta
     * @param measure The current measure. 
     */
    private function measureMeta(measure:Measure) : Void 
    {
        var header:MeasureHeader = measure.header;
        while (_sy == AlphaTexSymbols.MetaCommand)
        {
            if (_syData == "ts") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("timesignature-numerator", AlphaTexSymbols.Number);
                }
                header.timeSignature.numerator = _syData;
                newSy();
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("timesignature-denominator", AlphaTexSymbols.Number);
                }
                header.timeSignature.denominator.value = _syData;
            }
            else if (_syData == "ro") 
            {
                header.isRepeatOpen = true;
            }
            else if (_syData == "rc") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("repeatclose", AlphaTexSymbols.Number);
                }
                header.repeatClose = Std.parseInt(_syData) - 1;
            }
            else if (_syData == "ks") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.String) 
                {
                    error("keysignature", AlphaTexSymbols.String);
                }
                header.keySignature = Gp3Reader.toKeySignature(parseKeySignature(_syData));
            }
            else if (_syData == "clef") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.String) 
                {
                    error("clef", AlphaTexSymbols.String);
                }
                measure.clef = parseClef(_syData);
            }
            else if (_syData == "tempo") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("tempo", AlphaTexSymbols.Number);
                }
                header.tempo.value = _syData;
            }
            else 
            {
                error("measure-effects", AlphaTexSymbols.String, false);
            }
            newSy();
        }
    }
    
    /**
     * Non Terminal - Beat
     * @param measure the current measure
     */
    private function beat(measure:Measure) : Void
    {
        // duration specifier?
        if(_sy == AlphaTexSymbols.DoubleDot)
        {
            newSy();
            if (_sy != AlphaTexSymbols.Number) 
            {
                error("duration", AlphaTexSymbols.Number);
            }
            if (_syData == 1 || _syData == 2 || _syData == 4 || _syData == 8 ||
                _syData == 16 || _syData == 32 || _syData == 64) 
            {
                _currentDuration = _syData;
            }
            else 
            {
                error("duration", AlphaTexSymbols.Number, false);
            }        
            newSy();
            return;
        }
        
        var beat:Beat = factory.newBeat();
        beat.start = 0;
        if (measure.beatCount() == 0)
        {
            beat.start = measure.start();
        }
        else
        {
            var index = measure.beats.length - 1;
            beat.start = measure.beats[index].start + measure.beats[index].voices[0].duration.time();
        }
        var voice:Voice = beat.voices[0];
        voice.isEmpty = false;
                
        // notes
        if (_sy == AlphaTexSymbols.LParensis) 
        {
            newSy();
            
            voice.addNote(note(beat));
            while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof) 
            {
                voice.addNote(note(beat));
            }        
            
            if (_sy != AlphaTexSymbols.RParensis) 
            {
                error("note-list", AlphaTexSymbols.RParensis);
            }
            newSy();
        }
        // rest 
        else if (_sy == AlphaTexSymbols.String && Std.string(_syData).toLowerCase() == "r") 
        {
            // rest voice -> no notes :)
            newSy();
        }
        else 
        {
            voice.addNote(note(beat));
        }
        
        // new duration
        if (_sy == AlphaTexSymbols.Dot) 
        {
            newSy();
            if (_sy != AlphaTexSymbols.Number) 
            {
                error("duration", AlphaTexSymbols.Number);
            }
            if (_syData == 1 || _syData == 2 || _syData == 4 || _syData == 8 ||
                _syData == 16 || _syData == 32 || _syData == 64) 
            {
                voice.duration.value = _syData;
            }
            else 
            {
                error("duration", AlphaTexSymbols.Number, false);
            }        
            newSy();
        }
        else
        {
            voice.duration.value = _currentDuration;
        }
        
        
        
        beatEffects(beat);
                
        measure.addBeat(beat);
    }
    
    /**
     * Non Terminal - BeatEffects
     * @param beat the current beat
     * @param effect the current effects
     */
    private function beatEffects(beat:Beat) : Void 
    {
        if (_sy != AlphaTexSymbols.LBrace) 
        {
            return;
        }
        newSy();
        
        while (_sy == AlphaTexSymbols.String)
        {
            _syData = Std.string(_syData).toLowerCase();
            if(!applyBeatEffect(beat))
            {
                error("beat-effects", AlphaTexSymbols.String, false);
            }
        }
        
        if (_sy != AlphaTexSymbols.RBrace) 
        {
            error("beat-effects", AlphaTexSymbols.RBrace);
        }
        newSy();
    }
    
    /**
     * Tries to apply a beat effect to the given beat.
     * @return true if a effect could be applied, otherwise false
     */
    private function applyBeatEffect(beat:Beat) : Bool
    {
        if (_syData == "f") 
        {
            beat.effect.fadeIn = true;
            newSy();
            return true;
        }
        else if (_syData == "v") 
        {
            beat.effect.vibrato = true;
            newSy();
            return true;
        }
        else if (_syData == "t")
        {
            beat.effect.tapping = true;
            newSy();
            return true;
        }
        else if (_syData == "s") 
        {
            beat.effect.slapping = true;
            newSy();
            return true;
        }
        else if (_syData == "p") 
        {
            beat.effect.popping = true;
            newSy();
            return true;
        }
        else if (_syData == "dd")
        {
            beat.voices[0].duration.isDoubleDotted = true;
            newSy();
            return true;
        }
        else if (_syData == "d")
        {
            beat.voices[0].duration.isDotted = true;
            newSy();
            return true;
        }
        else if (_syData == "su") 
        {
            beat.effect.stroke.direction = BeatStrokeDirection.Up;
            newSy();
            if (_sy == AlphaTexSymbols.Number) 
            {
                if (_syData == 4 || _syData == 8 || _syData == 16 || _syData == 32 || _syData == 64) 
                {
                    beat.effect.stroke.value = _syData;
                }
                else
                {
                    beat.effect.stroke.value = 8;
                }
                newSy();
            }
            else
            {
                beat.effect.stroke.value = 8;
            }
            return true;
        }
        else if (_syData == "sd") 
        {
            beat.effect.stroke.direction = BeatStrokeDirection.Down;
            newSy();
            if (_sy == AlphaTexSymbols.Number)
            {
                if (_syData == 4 || _syData == 8 || _syData == 16 || _syData == 32 || _syData == 64) 
                {
                    beat.effect.stroke.value = _syData;
                }
                else
                {
                    beat.effect.stroke.value = 8;
                }
                newSy();
            }
            else
            {
                beat.effect.stroke.value = 8;
            }
            return true;
        }
        else if (_syData == "tu")
        {
            newSy();
            if (_sy != AlphaTexSymbols.Number)
            {
                error("tuplet", AlphaTexSymbols.Number);
                return false;
            }
            var tuplet = _syData;
            var duration = beat.voices[0].duration;
            switch (tuplet) 
            {
                case 3:
                    duration.tuplet.enters = (3);
                    duration.tuplet.times = (2);
                case 5:
                    duration.tuplet.enters = (5);
                    duration.tuplet.times = (4);
                case 6:
                    duration.tuplet.enters = (6);
                    duration.tuplet.times = (4);
                case 7:
                    duration.tuplet.enters = (7);
                    duration.tuplet.times = (4);
                case 9:
                    duration.tuplet.enters = (9);
                    duration.tuplet.times = (8);
                case 10:
                    duration.tuplet.enters = (10);
                    duration.tuplet.times = (8);
                case 11:
                    duration.tuplet.enters = (11);
                    duration.tuplet.times = (8);
                case 12:
                    duration.tuplet.enters = (12);
                    duration.tuplet.times = (8);
            }
            newSy();
            return true;
        }
        else if (_syData == "tb") 
        {
            // read points
            newSy();
            if (_sy != AlphaTexSymbols.LParensis)
            {
                error("tremolobar-effect", AlphaTexSymbols.LParensis);
                return false;
            }
            _allowNegatives = true;
            newSy();
        
            var points:Array<BendPoint> = new Array<BendPoint>();
            while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof)
            {
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("tremolobar-effect", AlphaTexSymbols.Number);
                    return false;
                }
                points.push(new BendPoint(0, _syData, false));
                newSy();
            }
            
            // only 12 points allowed
            if (points.length > 12)
            {
                points = points.slice(0, 12);
            }
                            
            // set positions
            var count = points.length;
            var step = Math.floor(12 / count);
            var i = 0; 
            var tremoloBarEffect:BendEffect = factory.newBendEffect();
            while (i < count) 
            {
                points[i].position = Math.floor(Math.min(12, (i * step)));                    
                tremoloBarEffect.points.push(points[i]);
                i++;
            }
            beat.effect.tremoloBar = tremoloBarEffect;
            _allowNegatives = false;
            
            if (_sy != AlphaTexSymbols.RParensis)
            {
                error("tremolobar-effect", AlphaTexSymbols.RParensis);
                return false;
            }
            newSy();
            return true;
        }
        return false;
    }
    
    /**
     * Non Terminal - Note
     * @param effect the current effects
     * @return
     */
    private function note(beat:Beat) : Note 
    {
        // fret.string
        if (_sy != AlphaTexSymbols.Number && !(_sy == AlphaTexSymbols.String 
            && (Std.string(_syData).toLowerCase() == "x" || Std.string(_syData).toLowerCase() == "-"))) 
        {
            error("note-fret", AlphaTexSymbols.Number);
        }
        
        var isDead:Bool = Std.string(_syData).toLowerCase() == "x";
        var isTie:Bool = Std.string(_syData).toLowerCase() == "-";
        var fret:Int = isDead || isTie ? 0 : _syData;
        newSy(); // Fret done
        
        if (_sy != AlphaTexSymbols.Dot) 
        {
            error("note", AlphaTexSymbols.Dot);
        }
        newSy(); // dot done
        
        if (_sy != AlphaTexSymbols.Number) 
        {
            error("note-string", AlphaTexSymbols.Number);
        }
        var string:Int = _syData;
        if (string < 1 || string > _track.stringCount()) 
        {
            error("note-string", AlphaTexSymbols.Number, false);
        }    
        newSy(); // string done
        
        // read effects
        var effect:NoteEffect = factory.newNoteEffect();
        noteEffects(beat, effect);
        
        // create note
        var note:Note = factory.newNote();
        note.string = string;
        note.effect = effect;
        note.effect.deadNote = isDead;
        note.isTiedNote = isTie;
        note.value = isTie ? getTiedNoteValue(string, _track) : fret;
        
        return note;
    }
    
    
    /**
     * Non Terminal - Note Effects
     * @param effect the object to fill into
     */
    private function noteEffects(beat:Beat, effect:NoteEffect) : Void 
    {
        if (_sy != AlphaTexSymbols.LBrace) 
        {
            return;
        }
        newSy();
        
        while (_sy == AlphaTexSymbols.String)
        {
            _syData = Std.string(_syData).toLowerCase();
            if (_syData == "b") 
            {
                // read points
                newSy();
                if (_sy != AlphaTexSymbols.LParensis)
                {
                    error("bend-effect", AlphaTexSymbols.LParensis);
                }
                newSy();
            
                var points:Array<BendPoint> = new Array<BendPoint>();
                while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof)
                {
                    if (_sy != AlphaTexSymbols.Number) 
                    {
                        error("bend-effect-value", AlphaTexSymbols.Number);
                    }
                    points.push(new BendPoint(0, cast Math.abs(cast _syData), false));
                    newSy();
                }
                
                // only 12 points allowed
                if (points.length > 12) 
                {
                    points = points.slice(0, 12);
                }
                                
                // set positions
                var count = points.length;
                var step = Math.floor(12 / count);
                var i = 0; 
                var bendEffect:BendEffect = factory.newBendEffect();
                while (i < count) 
                {
                    points[i].position = Math.floor(Math.min(12, (i * step)));                    
                    bendEffect.points.push(points[i]);
                    i++;
                }
                effect.bend = bendEffect;
                
                
                if (_sy != AlphaTexSymbols.RParensis) 
                {
                    error("bend-effect", AlphaTexSymbols.RParensis);
                }
                newSy();
            }
            else if (_syData == "nh") 
            {
                var harmonicEffect:HarmonicEffect = factory.newHarmonicEffect();
                harmonicEffect.type = HarmonicType.Natural;
                effect.harmonic = harmonicEffect;
                newSy();
            }
            else if (_syData == "ah") 
            {
                // todo: store key in data
                var harmonicEffect:HarmonicEffect = factory.newHarmonicEffect();
                harmonicEffect.type = HarmonicType.Artificial;
                effect.harmonic = harmonicEffect;
                newSy();
            }    
            else if (_syData == "th")
            {
                // todo: store tapped fret in data
                var harmonicEffect:HarmonicEffect = factory.newHarmonicEffect();
                harmonicEffect.type = HarmonicType.Tapped;
                effect.harmonic = harmonicEffect;
                newSy();
            }
            else if (_syData == "ph") 
            {
                var harmonicEffect:HarmonicEffect = factory.newHarmonicEffect();
                harmonicEffect.type = HarmonicType.Pinch;
                effect.harmonic = harmonicEffect;
                newSy();
            }
            else if (_syData == "sh")
            {
                var harmonicEffect:HarmonicEffect = factory.newHarmonicEffect();
                harmonicEffect.type = HarmonicType.Semi;
                effect.harmonic = harmonicEffect;
                newSy();
            }
            else if (_syData == "gr") 
            {
                // \gr fret duration transition
                newSy();
                // fret
                if (_sy != AlphaTexSymbols.Number && !(_sy == AlphaTexSymbols.String 
                    && Std.string(_syData).toLowerCase() == "x")) 
                {
                    error("grace-effect-fret", AlphaTexSymbols.Number);
                }
                
                var isDead:Bool = Std.string(_syData).toLowerCase() == "x";
                var fret:Int = isDead ? 0 : _syData;
                newSy(); 
                
                // duration
                var duration = 16;
                if (_sy == AlphaTexSymbols.Number) 
                {
                    if (_syData != 16 && _syData != 32 && _syData != 64) {
                        _syData = 16;
                    }
                    duration = _syData;
                    newSy();
                }
            
                
                // transition
                var transition:Int = GraceEffectTransition.None;
                if (_sy == AlphaTexSymbols.String) 
                {
                    if(_syData == "s")
                    {
                        transition = GraceEffectTransition.Slide;
                        newSy();
                    }
                    else if(_syData == "b")
                    {
                        transition = GraceEffectTransition.Bend;
                        newSy();
                    }
                    else if(_syData == "h")
                    {
                        transition = GraceEffectTransition.Hammer;
                        newSy();
                    }
                }
                
                var graceEffect:GraceEffect = factory.newGraceEffect();
                graceEffect.duration = duration;
                graceEffect.fret = fret;
                graceEffect.isDead = isDead;
                graceEffect.transition = transition;
                graceEffect.velocity = Velocities.FORTE;
                effect.grace = graceEffect;
            }
            else if (_syData == "tr") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("trill-effect", AlphaTexSymbols.Number);
                }
                var fret = _syData;
                newSy();
                
                var duration = 16;
                if (_sy == AlphaTexSymbols.Number) 
                {
                    if (_syData != 16 && _syData != 32 && _syData != 64) 
                    {
                        _syData = 16;
                    }
                    duration = _syData;
                    newSy();
                }
                
                var trillEffect:TrillEffect = factory.newTrillEffect();
                trillEffect.duration.value = duration;
                trillEffect.fret = fret;
                effect.trill = trillEffect;
            }
            else if (_syData == "tp")
            {
                newSy();
                var duration = 8;
                if (_sy == AlphaTexSymbols.Number)
                {
                    if (_syData != 8 && _syData != 16 && _syData != 32)
                    {
                        _syData = 8;
                    }
                    duration = _syData;
                    newSy();
                }
                
                var tremoloPicking:TremoloPickingEffect = factory.newTremoloPickingEffect();
                tremoloPicking.duration.value = duration;
                effect.tremoloPicking = tremoloPicking;
            }
            else if (_syData == "v") 
            {
                newSy();
                effect.vibrato = true;
            }
            else if (_syData == "sl") 
            {
                newSy();
                effect.slide = true;
                effect.slideType = SlideType.FastSlideTo;
            }            
            else if (_syData == "ss") 
            {
                newSy();
                effect.slide = true;
                effect.slideType = SlideType.SlowSlideTo;
            }
            else if (_syData == "h")
            {
                newSy();
                effect.hammer = true;
            }
            else if (_syData == "g") 
            {
                newSy();
                effect.ghostNote = true;
            }
            else if (_syData == "ac") 
            {
                newSy();
                effect.accentuatedNote = true;
            }
            else if (_syData == "hac")
            {
                newSy();
                effect.heavyAccentuatedNote = true;
            }
            else if (_syData == "pm") 
            {
                newSy();
                effect.palmMute = true;
            }
            else if (_syData == "st")
            {
                newSy();
                effect.staccato = true;
            }            
            else if (_syData == "lr") 
            {
                newSy();
                effect.letRing = true;
            }            
            else if(applyBeatEffect(beat)) // also try beat effects
            {
                // Success
            }
            else 
            {
                error(_syData, AlphaTexSymbols.String, false);
            }
        }
        
        if (_sy != AlphaTexSymbols.RBrace) 
        {
            error("note-effect", AlphaTexSymbols.RBrace, false);
        }
        newSy();
    }
    
    /**
     * Converts a clef string into the clef value.
     * @param str the string to convert
     * @return the clef value
     */
    private function parseClef(str:String): Int 
    {
        switch(str.toLowerCase())
        {
            case "treble": return MeasureClef.Treble;
            case "bass": return MeasureClef.Bass;
            case "tenor": return MeasureClef.Tenor;
            case "alto": return MeasureClef.Alto;
            default: return MeasureClef.Treble; // error("clef-value", AlphaTexSymbols.String, false);
        }
    }
    
    /**
     * Converts a keysignature string into the assocciated value.
     * @param str the string to convert.
     * @return the assocciated keysignature value. 
     */
    private function parseKeySignature(str:String) : Int
    {
        switch(str.toLowerCase()) 
        {
            case "cb": return -7;
            case "gb": return -6;
            case "db": return -5;
            case "ab": return -4;
            case "eb": return -3;
            case "bb": return -2;
            case "f": return -1;
            case "c": return 0;
            case "g": return 1;
            case "d": return 2;
            case "a": return 3;
            case "e": return 4;
            case "b": return 5;
            case "f#": return 6;
            case "c#": return 7;
            default: return 0; // error("keysignature-value", AlphaTexSymbols.String, false); return 0
        }
    }
    
    /**
     * Converts a string into the associated tuning. 
     * @param str the tuning string
     * @return the tuning value. 
     */
    private function parseTuning(str:String) : Int
    {
       var tuning = Tuning.getTuningForText(str);
       if(tuning < 0)
       {
           error("tuning-value", AlphaTexSymbols.String, false);   
       }
       return tuning;
    }
    
    /**
     * Reads the next character of the source stream.
     */
    private function nextChar() : Void 
    {
        _ch = _curChPos < data.getSize() ? 
                String.fromCharCode(data.readByte()) 
                : EOL;
        _curChPos++;
    }
        
    /**
     * Reads the next terminal symbol. 
     */
    private function newSy() 
    {
        _sy = AlphaTexSymbols.No;
        do 
        {
            if (_ch == EOL) 
            {
                _sy = AlphaTexSymbols.Eof;
            }
            else if (_ch == " " || _ch == "\n" || _ch == "\r" || _ch == "\t") 
            {
                // skip whitespaces 
                nextChar();
            }
            else if (_ch == '"' || _ch == "'") 
            {
                nextChar();
                _syData = "";
                _sy = AlphaTexSymbols.String;
                while(_ch != '"' && _ch != "'" && _ch != EOL) 
                {
                    _syData += _ch;
                    nextChar();
                } 
                nextChar();
            }
            else if (_ch == "-") // negative number
            {
                // is number?
                if (_allowNegatives && isDigit(_ch)) 
                {
                    var number:Int = readNumber();
                    _sy = AlphaTexSymbols.Number;
                    _syData = number;
                }
                else
                {
                    _sy = AlphaTexSymbols.String;
                    _syData = readName();
                }
            }
            else if(_ch == ".")
            {
                _sy = AlphaTexSymbols.Dot;
                nextChar();
            }
            else if(_ch == ":")
            {
                _sy = AlphaTexSymbols.DoubleDot;
                nextChar();
            }
            else if (_ch == "(") 
            {
                _sy = AlphaTexSymbols.LParensis;
                nextChar();
            }
            else if (_ch == "\\") 
            {
                nextChar();
                var name = readName();
                _sy = AlphaTexSymbols.MetaCommand;
                _syData = name;
            }
            else if (_ch == ")") 
            {
                _sy = AlphaTexSymbols.RParensis;
                nextChar();
            }
            else if (_ch == "{") 
            {
                _sy = AlphaTexSymbols.LBrace;
                nextChar();
            }
            else if (_ch == "}") 
            {
                _sy = AlphaTexSymbols.RBrace;
                nextChar();
            }
            else if (_ch == "|") 
            {
                _sy = AlphaTexSymbols.Pipe;
                nextChar();
            }
            else if (isDigit(_ch)) 
            {
                var number:Float = readNumber();
                _sy = AlphaTexSymbols.Number;
                _syData = number;
            }
            else if (isLetter(_ch))
            {
                var name = readName();
                if (Tuning.isTuning(name)) 
                {
                    _sy = AlphaTexSymbols.Tuning;
                    _syData = name.toLowerCase();
                }
                else
                {
                    _sy = AlphaTexSymbols.String;
                    _syData = name;
                }
            }
            else
            {
                error("symbol", AlphaTexSymbols.String, false);
            }
        } while (_sy == AlphaTexSymbols.No);    
    }
    
    /**
     * Checks if the given character is a letter.
     * (no control characters, whitespaces, numbers or dots)
     * @param ch the character
     * @return true if the given character is a letter, otherwise false. 
     */
    private static function isLetter(ch:String) : Bool
    {
        var code:Int = ch.charCodeAt(0);
        
        // no control characters, whitespaces, numbers or dots
        return !isTerminal(ch) && (
                (code >= 0x21 && code <= 0x2F) ||
                (code >= 0x3A && code <= 0x7E) || 
                (code > 0x80)); /* Unicode Symbols */
    }
    
    /**
     * Checks if the given charater is a non terminal.
     * @param ch the character
     * @return true if the given character is a terminal, otherwise false.
     */
    private static function isTerminal(ch:String) : Bool
    {
        return ch == "." ||
               ch == "{" ||
               ch == "}" ||
               ch == "[" ||
               ch == "]" ||
               ch == "(" ||
               ch == ")" ||
               ch == "|" || 
               ch == "'" ||
               ch == '"' ||
               ch == "\\";
    }
    
    /**
     * Checks if the given character is a digit. 
     * @param ch the character
     * @return true if the given character is a digit, otherwise false.
     */
    private function isDigit(ch:String) : Bool
    {
        var code:Int = ch.charCodeAt(0);
        return (code >= 0x30 && code <= 0x39) || /*0-9*/
                (ch == "-" && _allowNegatives); // allow - if negatives
    }
    
    /**
     * Reads a string from the stream.
     * @return the read string. 
     */
    private function readName() : String
    {
        var str:String = "";
        do
        {
            str += _ch;
            nextChar();
        } while (isLetter(_ch) || isDigit(_ch));
        return str;
    }
    
    /**
     * Reads a number from the stream.
     * @return the read number.
     */
    private function readNumber() :Int
    {
        var str:String = "";
        do
        {
            str += _ch;
            nextChar();
        } while (isDigit(_ch));
        return Std.parseInt(str) ;
    }
    
}