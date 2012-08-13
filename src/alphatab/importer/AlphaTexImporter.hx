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

import alphatab.audio.GeneralMidi;
import alphatab.model.AccentuationType;
import alphatab.model.Bar;
import alphatab.model.Beat;
import alphatab.model.BendPoint;
import alphatab.model.Clef;
import alphatab.model.Duration;
import alphatab.model.GraceType;
import alphatab.model.HarmonicType;
import alphatab.model.MasterBar;
import alphatab.model.Note;
import alphatab.model.PickStrokeType;
import alphatab.model.Score;
import alphatab.model.SlideType;
import alphatab.model.Track;
import alphatab.model.Tuning;
import alphatab.model.VibratoType;
import alphatab.model.Voice;
import haxe.io.BytesInput;
import haxe.io.Eof;
import haxe.io.Error;

/**
 * ...
 * @author 
 */

class AlphaTexImporter extends ScoreImporter
{
	private static var EOL:String = String.fromCharCode(0);
    private static var TRACK_CHANNELS:Array<Int> = [0, 1];
    
    private var _score:Score; 
    private var _track:Track; 
    
    private var _ch:String;
    private var _curChPos:Int;
    
    private var _sy:AlphaTexSymbols;
    private var _syData:Dynamic;
    
    private var _allowNegatives:Bool;
    
    private var _currentDuration:Duration; 
    
    public function new() 
    {         
        super();
    }
   
    public override function readScore():Score
	{
        try
        {
            createDefaultScore();
            _curChPos = 0;
            _currentDuration = Duration.Quarter;
            nextChar();
            newSy();
            score();
           
            finish(_score);
            return _score;
        }
        catch (e:Dynamic)
        {
            trace(e);
            throw ScoreImporter.UNSUPPORTED_FORMAT;
        }
	}

	private function error(nonterm:String, expected:AlphaTexSymbols, symbolError:Bool = true )
    {
        if (symbolError)
        {
            // 33: Error on Block XY, expected a EXP_SYMBOL found a CUR_SYMBOL
            throw Error.Custom(Std.string(_curChPos) + ": Error on block " + nonterm + 
                                        ", expected a " + Std.string(expected) + " found a " + _sy);
        }
        else
        {
            // 33: Error on Block XY, invalid Value VALUE
            throw Error.Custom(Std.string(_curChPos) + ": Error on block " + nonterm + 
                                        ", invalid value:" + Std.string(_syData));
        }
    }
	
	/**
     * Non Terminal - score
	 */
    private function score() : Void 
    {
        metaData();
        bars();
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
                    _score.title = _syData;
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
                    _score.subTitle = _syData;
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
                    _score.artist = _syData;
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
                    _score.album = _syData;
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
                    _score.words = _syData;
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
                    _score.music = _syData;
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
                    _score.copyright = _syData;
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
                    _score.tempo = _syData;
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
                    _track.capo = _syData;
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
                    _track.tuning = new Array<Int>();
                    do
                    {
                        _track.tuning.push(parseTuning(_syData));
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
                    var instrument:Int = cast(_syData, Int);
                    if(instrument >= 0 && instrument <= 128)
                    {
                        _track.playbackInfo.program = _syData;
                    }
                    else
                    {
                        this.error("instrument", AlphaTexSymbols.Number, false);
                    }
                }
                else if(_sy == AlphaTexSymbols.String) // Name
                {
                    var instrumentName:String = cast(_syData, String);
                    _track.playbackInfo.program = GeneralMidi.getValue(instrumentName);
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
    private function bars() : Void
    {
        bar();
        while(_sy != AlphaTexSymbols.Eof)
        {
            // read pipe from last bar
            if (_sy != AlphaTexSymbols.Pipe) 
            {
                error("bar", AlphaTexSymbols.Pipe);
            }
            newSy();
            
            bar();
        }
    }
	
   /**
     * Non Terminal - Bar
     */
    private function bar() : Void
    { 
		var master:MasterBar = new MasterBar();
		_score.addMasterBar(master);
        
        var bar:Bar = new Bar();
		_track.addBar(bar);

        if (master.index > 0) 
        { 
			master.keySignature = master.previousMasterBar.keySignature;
			master.timeSignatureDenominator = master.previousMasterBar.timeSignatureDenominator;
			master.timeSignatureNumerator = master.previousMasterBar.timeSignatureNumerator;
			bar.clef = bar.previousBar.clef;
        }
        barMeta(bar);
		
		var voice:Voice = new Voice();
		bar.addVoice(voice);

        while (_sy != AlphaTexSymbols.Pipe && _sy != AlphaTexSymbols.Eof)
        {
            beat(voice);
        }
    }
	
	/**
     * Non Terminal - Beat
     * @param voice the current voice
     */
    private function beat(voice:Voice) : Void
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
                _currentDuration = parseDuration(_syData);
            }
            else 
            {
                error("duration", AlphaTexSymbols.Number, false);
            }        
            newSy();
            return;
        }
        
        var beat:Beat = new Beat();
		voice.addBeat(beat);
                
        // notes
        if (_sy == AlphaTexSymbols.LParensis) 
        {
            newSy();
            
			note(beat);
            while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof) 
            {
                note(beat);
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
            // rest voice -> no notes 
            newSy();
        }
        else 
        {
			note(beat);
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
				beat.duration = parseDuration(_syData);
            }
            else 
            {
                error("duration", AlphaTexSymbols.Number, false);
            }        
            newSy();
        }
        else
        {
			beat.duration = _currentDuration;
        }
        
        beatEffects(beat);
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
			beat.fadeIn = true;
            newSy();
            return true;
        }
        else if (_syData == "v") 
        {
			beat.vibrato = VibratoType.Slight;
            newSy();
            return true;
        }
        else if (_syData == "s") 
        {
            beat.slap = true;
            newSy();
            return true;
        }
        else if (_syData == "p") 
        {
            beat.pop = true;
            newSy();
            return true;
        }
        else if (_syData == "dd")
        {
			beat.dots = 2;
            newSy();
            return true;
        }
        else if (_syData == "d")
        {
			beat.dots = 1;
            newSy();
            return true;
        }
        else if (_syData == "su") 
        {
			beat.pickStroke = PickStrokeType.Up;
			newSy();
            return true;
        }
        else if (_syData == "sd") 
        {
			beat.pickStroke = PickStrokeType.Down;
			newSy();
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
            switch (tuplet) 
            {
                case 3:
                    beat.tupletDenominator = (3);
                    beat.tupletNumerator   = (2);
                case 5:
                     beat.tupletDenominator = (5);
                     beat.tupletNumerator   = (4);
                case 6:
                     beat.tupletDenominator = (6);
                     beat.tupletNumerator   = (4);
                case 7:
                     beat.tupletDenominator = (7);
                     beat.tupletNumerator   = (4);
                case 9:
                     beat.tupletDenominator = (9);
                     beat.tupletNumerator   = (8);
                case 10:
                     beat.tupletDenominator = (10);
                     beat.tupletNumerator   = (8);
                case 11:
                     beat.tupletDenominator = (11);
                     beat.tupletNumerator   = (8);
                case 12:
                     beat.tupletDenominator = (12);
                     beat.tupletNumerator   = (8);
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
        
            while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof)
            {
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("tremolobar-effect", AlphaTexSymbols.Number);
                    return false;
                }
				beat.whammyBarPoints.push(new BendPoint(0, _syData));
                newSy();
            }
            
            if (beat.whammyBarPoints.length > 60)
            {
                beat.whammyBarPoints = beat.whammyBarPoints.slice(0, 60);
            }
                            
            // set positions
            var count = beat.whammyBarPoints.length;
            var step = Math.floor(60 / count);
            var i = 0; 
            while (i < count) 
            {
                beat.whammyBarPoints[i].offset = Math.floor(Math.min(60, (i * step)));                    
                i++;
            }
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
    private function note(beat:Beat) 
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
        if (string < 1 || string > _track.tuning.length)
        {
            error("note-string", AlphaTexSymbols.Number, false);
        }    
        newSy(); // string done
        
        // read effects
		var note:Note = new Note();
        noteEffects(note);
        
        // create note
        note.string = _track.tuning.length - string;
		note.isDead = isDead;
		note.isTieDestination = isTie;
		if (!isTie)
		{
			note.fret = fret;
		}

        beat.addNote(note);
        return note;
    }
    
	/**
     * Non Terminal - Note Effects
     * @param effect the object to fill into
     */
    private function noteEffects(note:Note) : Void 
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
            
                while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof)
                {
                    if (_sy != AlphaTexSymbols.Number) 
                    {
                        error("bend-effect-value", AlphaTexSymbols.Number);
                    }
					var bendValue:Int = cast _syData;
                    note.bendPoints.push(new BendPoint(0, Std.int(Math.abs(bendValue))));
                    newSy();
                }
                
                if (note.bendPoints.length > 60) 
                {
                    note.bendPoints = note.bendPoints.slice(0, 60);
                }
                                
                // set positions
                var count = note.bendPoints.length;
                var step = Math.floor(60 / count);
                var i = 0; 
                while (i < count) 
                {
                    note.bendPoints[i].offset = Math.floor(Math.min(60, (i * step)));                    
                    i++;
                }
                
                
                if (_sy != AlphaTexSymbols.RParensis) 
                {
                    error("bend-effect", AlphaTexSymbols.RParensis);
                }
                newSy();
            }
            else if (_syData == "nh") 
            {
				note.harmonicType = HarmonicType.Natural;
                newSy();
            }
            else if (_syData == "ah") 
            {
                // todo: Artificial Key
				note.harmonicType = HarmonicType.Artificial;
                newSy();
            }    
            else if (_syData == "th")
            {
                // todo: store tapped fret in data
				note.harmonicType = HarmonicType.Tap;
                newSy();
            }
            else if (_syData == "ph") 
            {
				note.harmonicType = HarmonicType.Pinch;
                newSy();
            }
            else if (_syData == "sh")
            {
				note.harmonicType = HarmonicType.Semi;
                newSy();
            } 
            else if (_syData == "gr") // TODO: Make this a beat effect!
            {
				newSy();
				if (_syData == "ob")
				{
					note.beat.graceType = GraceType.OnBeat;
				}
				else
				{
					note.beat.graceType = GraceType.BeforeBeat;
				}
                // \gr fret duration transition
                newSy();
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
                
                var duration:Int = 16;
                if (_sy == AlphaTexSymbols.Number) 
                {
					switch(_syData)
					{
						case 16, 32, 64: duration = _syData;
						default: duration = 16;
					}
                    newSy();
                }
                
				note.trillFret = fret;
				note.trillSpeed = duration;
            }
            else if (_syData == "tp")
            {
                newSy();
                var duration:Int = 8;
                if (_sy == AlphaTexSymbols.Number)
                {
					switch(_syData)
					{
						case 8, 16, 32: duration = _syData;
						default:duration = 8;
					}
                    newSy();
                }
                note.beat.tremoloSpeed = duration;
            }
            else if (_syData == "v") 
            {
                newSy();
				note.vibrato = VibratoType.Slight;
            }
            else if (_syData == "sl") 
            {
                newSy();
				note.slideType = SlideType.Legato;
            }            
            else if (_syData == "ss") 
            {
                newSy();
                note.slideType = SlideType.Shift;
            }
            else if (_syData == "h")
            {
                newSy();
				note.isHammerPullOrigin = true;
            }
            else if (_syData == "g") 
            {
                newSy();
				note.isGhost = true;
            }
            else if (_syData == "ac") 
            {
                newSy();
				note.accentuated = AccentuationType.Normal;
            }
            else if (_syData == "hac")
            {
                newSy();
				note.accentuated = AccentuationType.Heavy;
            }
            else if (_syData == "pm") 
            {
                newSy();
				note.isPalmMute = true;
            }
            else if (_syData == "st")
            {
                newSy();
				note.isStaccato = true;
            }            
            else if (_syData == "lr") 
            {
                newSy();
				note.isLetRing = true;
            }            
            else if(applyBeatEffect(note.beat)) // also try beat effects
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
	
	private function parseDuration(duration:Int):Duration
	{
		switch(duration)
		{
			case 1: return Duration.Whole;
			case 2: return Duration.Half;
			case 4: return Duration.Quarter;
			case 8: return Duration.Eighth;
			case 16: return Duration.Sixteenth;
			case 32: return Duration.ThirtySecond;
			case 64: return Duration.SixtyFourth;
			default: return Duration.Quarter;
		}
	}
	
	/**
     * Non Terminal - BarMeta
     * @param bar The current bar. 
     */
    private function barMeta(bar:Bar) : Void 
    {
        var master:MasterBar = bar.getMasterBar();
        while (_sy == AlphaTexSymbols.MetaCommand)
        {
            if (_syData == "ts") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("timesignature-numerator", AlphaTexSymbols.Number);
                }
                master.timeSignatureNumerator = _syData;
                newSy();
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("timesignature-denominator", AlphaTexSymbols.Number);
                }
                master.timeSignatureDenominator = _syData;
            }
            else if (_syData == "ro") 
            {
				master.isRepeatStart = true;
            }
            else if (_syData == "rc") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.Number) 
                {
                    error("repeatclose", AlphaTexSymbols.Number);
                }
				master.repeatCount = Std.parseInt(_syData) - 1;
            }
            else if (_syData == "ks") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.String) 
                {
                    error("keysignature", AlphaTexSymbols.String);
                }
                master.keySignature = parseKeySignature(_syData);
            }
            else if (_syData == "clef") 
            {
                newSy();
                if (_sy != AlphaTexSymbols.String && _sy != AlphaTexSymbols.Tuning) 
                {
                    error("clef", AlphaTexSymbols.String);
                }
                bar.clef = parseClef(_syData);
            }
			// TODO: Tempo automation on beat
            // else if (_syData == "tempo") 
            // {
            //     newSy();
            //     if (_sy != AlphaTexSymbols.Number) 
            //     {
            //         error("tempo", AlphaTexSymbols.Number);
            //     }
            //     header.tempo.value = _syData;
            // }
            else 
            {
                error("measure-effects", AlphaTexSymbols.String, false);
            }
            newSy();
        }
    }
        
    /**
     * Initializes the song with some required default values. 
     */
    private function createDefaultScore() : Void
    {
        _score = new Score();   
        _score.tempo = 120;
        _score.tempoLabel = "";
        
        _track = new Track();
		_track.playbackInfo.program = 25;
		_track.playbackInfo.primaryChannel = TRACK_CHANNELS[0];
		_track.playbackInfo.secondaryChannel = TRACK_CHANNELS[1];
		_track.tuning = Tuning.getPresetsFor(6)[0].tuning;
        
        _score.addTrack(_track);
    }
	
	    /**
     * Converts a clef string into the clef value.
     * @param str the string to convert
     * @return the clef value
     */
    private function parseClef(str:String): Clef 
    {
        switch(str.toLowerCase())
        {
            case "g2", "treble": return Clef.G2;
            case "f4", "bass": return Clef.F4;
            case "c3", "tenor": return Clef.C3;
            case "c4", "alto": return Clef.C4;
            default: return Clef.G2; // error("clef-value", AlphaTexSymbols.String, false);
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
        try
		{
			_ch = _data.readString(1);
			_curChPos++;
		}
		catch (e:Eof)
		{
			_ch = EOL;
		}
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