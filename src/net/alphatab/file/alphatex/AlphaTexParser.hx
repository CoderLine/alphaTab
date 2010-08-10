package net.alphatab.file.alphatex;
import js.Lib;
import net.alphatab.file.FileFormatException;
import net.alphatab.file.SongReader;
import net.alphatab.model.effects.BendEffect;
import net.alphatab.model.effects.BendPoint;
import net.alphatab.model.effects.HarmonicEffect;
import net.alphatab.model.effects.HarmonicType;
import net.alphatab.model.effects.TremoloBarEffect;
import net.alphatab.model.effects.TremoloPickingEffect;
import net.alphatab.model.effects.TrillEffect;
import net.alphatab.model.Beat;
import net.alphatab.model.BeatStrokeDirection;
import net.alphatab.model.Duration;
import net.alphatab.model.GuitarString;
import net.alphatab.model.Measure;
import net.alphatab.model.MeasureClef;
import net.alphatab.model.MeasureHeader;
import net.alphatab.model.Note;
import net.alphatab.model.NoteEffect;
import net.alphatab.model.PageSetup;
import net.alphatab.model.SlideType;
import net.alphatab.model.Song;
import net.alphatab.model.Tempo;
import net.alphatab.model.Track;
import net.alphatab.model.Voice;

/**
 * This parser enables reading of alphaTex files.
 * @author Daniel Kuschny
 */
class AlphaTexParser extends SongReader  
{
	private static inline var EOL:String = String.fromCharCode(0);
	private static inline var TRACK_CHANNELS = [0, 1];
	private static inline var TUNING_REGEX = ~/([a-g]b?)([0-9])/i;

	private var _song:Song; 
	private var _track:Track; 
	
	private var _ch:String;
	private var _curChPos:Int;
	
	private var _sy:AlphaTexSymbols;
	private var _syData:Dynamic;
	
	private var _allowNegatives:Bool;
	
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
		
		_song.pageSetup = PageSetup.defaults();	
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
		if (_sy != AlphaTexSymbols.Dot) 
		{
			error("song", AlphaTexSymbols.Dot);
		}
		newSy();
		
		measures();
	}
	
	/**
	 * Non Terminal - MetaData
	 */
	private function metaData() : Void 
	{
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
					error("tuning", AlphaTexSymbols.Number);
				}
			}
			else 
			{
				error("metaDataTags", AlphaTexSymbols.String, false);
			}
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
				header.keySignature = parseKeySignature(_syData);
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
			
			voice.addNote(note());
			while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof) 
			{
				voice.addNote(note());
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
			voice.addNote(note());
		}
		
		// duration
		if (_sy != AlphaTexSymbols.Dot) 
		{
			error("beat", AlphaTexSymbols.Dot);
		}
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
		
		while (_sy == AlphaTexSymbols.MetaCommand)
		{
			_syData = Std.string(_syData).toLowerCase();
			if (_syData == "f") 
			{
				beat.effect.fadeIn = true;
				newSy();
			}
			else if (_syData == "v") 
			{
				beat.effect.vibrato = true;
				newSy();
			}
			else if (_syData == "t")
			{
				beat.effect.tapping = true;
				newSy();
			}
			else if (_syData == "s") 
			{
				beat.effect.slapping = true;
				newSy();
			}
			else if (_syData == "p") 
			{
				beat.effect.popping = true;
				newSy();
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
			}
			else if (_syData == "tb") 
			{
				// read points
				newSy();
				if (_sy != AlphaTexSymbols.LParensis)
				{
					error("tremolobar-effect", AlphaTexSymbols.LParensis);
				}
				newSy();
				_allowNegatives = true;
			
				var points:Array<BendPoint> = new Array<BendPoint>();
				while (_sy != AlphaTexSymbols.RParensis && _sy != AlphaTexSymbols.Eof)
				{
					if (_sy != AlphaTexSymbols.Number) 
					{
						error("tremolobar-effect", AlphaTexSymbols.Number);
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
				var step = Math.ceil(12 / count);
				var i = 0; 
				var tremoloBarEffect:TremoloBarEffect = factory.newTremoloBarEffect();
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
				}
				newSy();
			}
			else 
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
	 * Non Terminal - Note
	 * @param effect the current effects
	 * @return
	 */
	private function note() : Note 
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
		noteEffects(effect);
		
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
	private function noteEffects(effect:NoteEffect) : Void 
	{
		if (_sy != AlphaTexSymbols.LBrace) 
		{
			return;
		}
		newSy();
		
		while (_sy == AlphaTexSymbols.MetaCommand)
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
				var step = Math.ceil(12 / count);
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
			/*Grace Notes, to complex for now. Find a simple format
			else if (_syData == "gr") 
			{
				newSy();
				if (_sy != AlphaTexSymbols.Number) 
				{
					throw new FileFormatException("Expected Number found  \"" + _syData + "\" on position " + _curChPos);
				}
				var fret = _syData;
			}*/
			else if (_syData == "tr") 
			{
				newSy();
				if (_sy != AlphaTexSymbols.Number) 
				{
					error("trill-effect", AlphaTexSymbols.Number);
				}
				var fret = _syData;
				newSy();
				
				if (_sy != AlphaTexSymbols.Number) 
				{
					error("trill-effect-fret", AlphaTexSymbols.Number);
				}
				var duration = 0;
				if (_syData != 16 && _syData != 32 && _syData != 64) {
					_syData = 16;
				}
				duration = _syData;
				newSy();
				
				var trillEffect:TrillEffect = factory.newTrillEffect();
				trillEffect.duration.value = duration;
				trillEffect.fret = fret;
				effect.trill = trillEffect;
			}
			else if (_syData == "tp")
			{
				newSy();
				if (_sy != AlphaTexSymbols.Number)
				{
					error("tremolopicking-effect", AlphaTexSymbols.Number);
				}
				if (_syData != 8 && _syData != 16 && _syData != 32)
				{
					_syData = 8;
				}
				newSy();
				var duration = _syData;
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
			else if (_syData == "sf") 
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
			else 
			{
				error("note-effect", AlphaTexSymbols.String, false);
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
	private function parseClef(str:String): MeasureClef 
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
		var base = 0;
		var regex:EReg = TUNING_REGEX;
		if (regex.match(str.toLowerCase()))
		{
			var note = regex.matched(1);
			var octave = Std.parseInt(regex.matched(2));
			if (note == "c") 
			{
				base = 0;
			}
			else if (note == "db")
			{
				base = 1;
			}
			else if (note == "d")
			{
				base = 2;
			}
			else if (note == "eb")
			{
				base = 3;
			}
			else if (note == "e") 
			{
				base = 4;
			}
			else if (note == "f")
			{
				base = 5;
			}
			else if (note == "gb") 
			{
				base = 6;
			}
			else if (note == "g")
			{
				base = 7;
			}
			else if (note == "ab")
			{
				base = 8;
			}
			else if (note == "a") 
			{
				base = 9;
			}
			else if (note == "bb")
			{
				base = 10;
			}
			else if (note == "b") 
			{
				base = 11;
			}
			else
			{
				error("tuning-value", AlphaTexSymbols.String, false);
			}
			
			// add octaves
			base += (octave * 12);
			
		}
		else
		{
			error("tuning-value", AlphaTexSymbols.String, false);
		}
		return base;
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
					_syData = -number;
				}
				else if (isLetter(_ch)) 
				{
					var name:String = readName();
					if (isTuning(name)) 
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
			}
			else if(_ch == ".")
			{
				_sy = AlphaTexSymbols.Dot;
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
				if (isTuning(name)) 
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
		return  code != 0x2E && (
				(code >= 0x21 && code <= 0x2F) ||
				(code >= 0x3A && code <= 0x7E) || 
				(code > 0x80)); /* Unicode Symbols */
	}
	
	/**
	 * Checks if the given character is a digit. 
	 * @param ch the character
	 * @return true if the given character is a digit, otherwise false.
	 */
	private static function isDigit(ch:String) : Bool
	{
		var code:Int = ch.charCodeAt(0);
		return (code >= 0x30 && code <= 0x39); /*0-9*/
	}
	
	/**
	 * Checks if the given string is a tuning inticator.
	 * @param name
	 * @return
	 */
	private static function isTuning(name:String) : Bool
	{
		var regex:EReg = TUNING_REGEX;
		return regex.match(name);
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