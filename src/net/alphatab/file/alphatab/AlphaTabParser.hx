/**
 * ...
 * @author Zenas
 */

package net.alphatab.file.alphatab;
import net.alphatab.file.FileFormatException;
import net.alphatab.file.SongReader;
import net.alphatab.model.GsBeat;
import net.alphatab.model.GsDuration;
import net.alphatab.model.GsGuitarString;
import net.alphatab.model.GsMeasure;
import net.alphatab.model.GsMeasureClef;
import net.alphatab.model.GsMeasureHeader;
import net.alphatab.model.GsNote;
import net.alphatab.model.GsPageSetup;
import net.alphatab.model.GsSong;
import net.alphatab.model.GsTempo;
import net.alphatab.model.GsTrack;
import net.alphatab.model.GsVoice;

class AlphaTabParser extends SongReader
{
	private static inline var EOL:String = String.fromCharCode(0);
	private var _song:GsSong; 
	private var _track:GsTrack; 
	
	private var _ch:String;
	private var _curChPos:Int;
	
	private var _sy:AlphaTabSymbols;
	private var _syData:Dynamic;
	
	private static var TrackChannels = [0, 1];

	
	public function new() 
	{
		super();
	}
	
	private function CreateDefaultSong() : Void
	{
		_song = Factory.NewSong();	
		_song.Tempo = 120;
		_song.TempoName = "";
		_song.HideTempo = false;
		
		_song.PageSetup = GsPageSetup.Defaults();	
		_track = Factory.NewTrack();
		_track.Number = 1;
		_track.Channel.Instrument(25);
		_track.Channel.Channel = TrackChannels[0];
		_track.Channel.EffectChannel = TrackChannels[1];
		CreateDefaultStrings(_track.Strings);
		
		_song.AddTrack(_track);
	}
	
	private function CreateDefaultStrings(list:Array<GsGuitarString>) : Void
	{
		list.push(NewString(1, 64));
		list.push(NewString(2, 59));
		list.push(NewString(3, 55));
		list.push(NewString(4, 50));
		list.push(NewString(5, 45));
		list.push(NewString(6, 40));
	}
	
	private function NewString(number:Int, value:Int): GsGuitarString
	{
		var str:GsGuitarString = Factory.NewString();
		str.Number = number;
		str.Value = value;
		return str;
	}
	
	override public function ReadSong():GsSong 
	{
		CreateDefaultSong();
		_curChPos = 0;
		NextChar();
		NewSy();
		S();
		return _song;
	}
	
	private function S() : Void 
	{
		/*if (_sy != AlphaTabSymbols.Version)
		{
			throw new FileFormatException("No valid alphatab file or unsupported version");
		}
		NewSy();*/
		
		MetaData();
		if (_sy != AlphaTabSymbols.Dot) 
		{
			throw new FileFormatException("Expected Dot after MetaData, found \"" + _sy + "\" on " + _curChPos);
		}
		NewSy();
		
		Measures();
	}
	
	private function MetaData() : Void 
	{
		while (_sy == AlphaTabSymbols.MetaCommand)
		{
			if (_syData == "title") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.String)
				{
					_song.Title = _syData;
				}
				else
				{
					throw new FileFormatException("Expected String, found \"" + _sy + "\" on " + _curChPos);
				}
				NewSy();	
			}
			else if (_syData == "subtitle") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.String)
				{
					_song.Subtitle = _syData;
				}
				else
				{
					throw new FileFormatException("Expected String, found \"" + _sy + "\" on " + _curChPos);
				}
				NewSy();
			}
			else if (_syData == "artist") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.String)
				{
					_song.Artist = _syData;
				}
				else
				{
					throw new FileFormatException("Expected String, found \"" + _sy + "\" on " + _curChPos);
				}
				NewSy();
			}
			else if (_syData == "album") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.String)
				{
					_song.Album = _syData;
				}
				else
				{
					throw new FileFormatException("Expected String, found \"" + _sy + "\" on " + _curChPos);
				}
				NewSy();
			}
			else if (_syData == "words") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.String)
				{
					_song.Words = _syData;
				}
				else
				{
					throw new FileFormatException("Expected String, found \"" + _sy + "\" on " + _curChPos);
				}
				NewSy();
			}
			else if (_syData == "music") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.String)
				{
					_song.Music = _syData;
				}
				else
				{
					throw new FileFormatException("Expected String, found \"" + _sy + "\" on " + _curChPos);
				}
				NewSy();
			}
			else if (_syData == "copyright") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.String)
				{
					_song.Copyright = _syData;
				}
				else
				{
					throw new FileFormatException("Expected String, found \"" + _sy + "\" on " + _curChPos);
				}
				NewSy();
			}
			else if (_syData == "tempo") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.Number)
				{
					_song.Tempo = _syData;
				}
				else
				{
					throw new FileFormatException("Expected Number, found \"" + _sy + "\" on " + _curChPos);
				}
				NewSy();
			}
			else if (_syData == "capo") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.Number)
				{
					_track.Offset = _syData;
				}
				else
				{
					throw new FileFormatException("Expected Number, found \"" + _sy + "\" on " + _curChPos);
				}
				NewSy();
			}
			else if (_syData == "tuning") 
			{
				NewSy(); 
				if (_sy == AlphaTabSymbols.Tuning) // we require at least one tuning
				{
					_track.Strings = new Array<GsGuitarString>();
					do
					{
						_track.Strings.push(NewString(_track.Strings.length + 1, ParseTuning(_syData)));
						NewSy();
					} while (_sy == AlphaTabSymbols.Tuning);
				}
				else
				{
					throw new FileFormatException("Expected Number, found \"" + _sy + "\" on " + _curChPos);
				}
			}
		}
	}
	
	private function Measures() : Void
	{
		var tempo:GsTempo = Factory.NewTempo();
        tempo.Value = _song.Tempo;

		Measure(tempo);
		while(_sy != AlphaTabSymbols.Eof)
		{
			// read pipe from last measure
			if (_sy != AlphaTabSymbols.Pipe) 
			{
				throw new FileFormatException("Expected Pipe, found \"" + _sy + "\" on " + _curChPos);
			}
			NewSy();
			
			Measure(tempo);
		}
	}
	
	private function Measure(tempo:GsTempo) : Void
	{
		// create new measureheader 
		var header:GsMeasureHeader = Factory.NewMeasureHeader();
		header.Number = _song.MeasureHeaders.length + 1;
		header.Start = _song.MeasureHeaders.length == 0 ? GsDuration.QuarterTime : 
														_song.MeasureHeaders[_song.MeasureHeaders.length - 1].Start + _song.MeasureHeaders[_song.MeasureHeaders.length - 1].Length();
		_song.AddMeasureHeader(header);
		
		var measure:GsMeasure = Factory.NewMeasure(header);	
		header.Tempo.Copy(tempo); // takeover current tempo
		if (header.Number > 1) { // takeover clef and keysignature
			var prevMeasure:GsMeasure = _track.Measures[header.Number - 2];
			var prevHeader:GsMeasureHeader = _song.MeasureHeaders[header.Number - 2];
			measure.Clef = prevMeasure.Clef;
			header.KeySignature = prevHeader.KeySignature;
			header.KeySignatureType = prevHeader.KeySignatureType;
		}
		MeasureMeta(header, measure);
		tempo.Copy(header.Tempo); // write new tempo on change
		_track.AddMeasure(measure);
		
		// as long as we aren't at the end of file or measure 
		while (_sy != AlphaTabSymbols.Pipe && _sy != AlphaTabSymbols.Eof)
		{
			Beat(measure);
		}
	}
	
	private function MeasureMeta(header:GsMeasureHeader, measure:GsMeasure) : Void 
	{
		while (_sy == AlphaTabSymbols.MetaCommand)
		{
			if (_syData == "ts") {
				NewSy();
				if (_sy != AlphaTabSymbols.Number) 
				{
					throw new FileFormatException("Expected number, found \"" + _sy + "\" on position " + _curChPos);
				}
				header.TimeSignature.Numerator = _syData;
				NewSy();
				if (_sy != AlphaTabSymbols.Number) 
				{
					throw new FileFormatException("Expected number, found \"" + _sy + "\" on position " + _curChPos);
				}
				header.TimeSignature.Denominator.Value = _syData;
			}
			else if (_syData == "ro") {
				header.IsRepeatOpen = true;
			}
			else if (_syData == "rc") {
				NewSy();
				if (_sy != AlphaTabSymbols.Number) 
				{
					throw new FileFormatException("Expected number, found \"" + _sy + "\" on position " + _curChPos);
				}
					header.RepeatClose = Std.parseInt(_syData) - 1;
			}
			else if (_syData == "ks") {
				NewSy();
				if (_sy != AlphaTabSymbols.String) 
				{
					throw new FileFormatException("Expected string, found \"" + _sy + "\" on position " + _curChPos);
				}
				header.KeySignature = ParseKeySignature(_syData);
			}
			else if (_syData == "clef") {
				NewSy();
				if (_sy != AlphaTabSymbols.String) 
				{
					throw new FileFormatException("Expected string, found \"" + _sy + "\" on position " + _curChPos);
				}
				measure.Clef = ParseClef(_syData);
			}
			else if (_syData == "tempo") {
				NewSy();
				if (_sy != AlphaTabSymbols.Number) 
				{
					throw new FileFormatException("Expected number, found \"" + _sy + "\" on position " + _curChPos);
				}
				header.Tempo.Value = _syData;
			}
			else {
				throw new FileFormatException("Unknown measure meta tag, \"" + _syData + "\" on position " + _curChPos);
			}
			NewSy();
		}
	}
	
	private function Beat(measure:GsMeasure) : Void
	{
		var beat:GsBeat = Factory.NewBeat();
		beat.Start = 0;
		if (measure.BeatCount() == 0)
		{
			beat.Start = measure.Start();
		}
		else
		{
			var index = measure.Beats.length - 1;
			beat.Start = measure.Beats[index].Start + measure.Beats[index].Voices[0].Duration.Time();
		}
		var voice:GsVoice = beat.Voices[0];
		voice.IsEmpty = false;
		
		// notes
		if (_sy == AlphaTabSymbols.LParensis) {
			NewSy();
			
			voice.AddNote(Note());
			while (_sy != AlphaTabSymbols.RParensis && _sy != AlphaTabSymbols.Eof) {
				voice.AddNote(Note());
			}		
			
			if (_sy != AlphaTabSymbols.RParensis) {
				throw new FileFormatException("Expected ) found \"" + _syData + "\" on position " + _curChPos);
			}
			NewSy();
		}
		// rest 
		else if (_sy == AlphaTabSymbols.String && Std.string(_syData).toLowerCase() == "r") {
			// rest voice -> no notes :)
			NewSy();
		}
		else {
			voice.AddNote(Note());
		}
		
		// duration
		if (_sy != AlphaTabSymbols.Dot) 
		{
			throw new FileFormatException("Expected Dot found \"" + _syData + "\" on position " + _curChPos);
		}
		NewSy();
		
		if (_sy != AlphaTabSymbols.Number) 
		{
			throw new FileFormatException("Expected Number found \"" + _syData + "\" on position " + _curChPos);
		}
		if (_syData == 1 || _syData == 2 || _syData == 4 || _syData == 8 || _syData == 16 || _syData == 32 || _syData == 64) {
			voice.Duration.Value = _syData;
		}
		else {
			throw new FileFormatException("Invalid Beat Duration found \"" + _syData + "\" on position " + _curChPos);
		}		
		NewSy();
		measure.AddBeat(beat);
	}
	
	private function Note() : GsNote {
		// fret.string
		if (_sy != AlphaTabSymbols.Number && !(_sy == AlphaTabSymbols.String && Std.string(_syData).toLowerCase() == "x")) {
			throw new FileFormatException("Expected Number found \"" + _syData + "\" on position " + _curChPos);
		}
		var isDead:Bool = Std.string(_syData).toLowerCase() == "x";
		var fret:Int = isDead ? 0 : _syData;
		
		NewSy(); // Fret done
		
		if (_sy != AlphaTabSymbols.Dot) {
			throw new FileFormatException("Expected Dot found \"" + _syData + "\" on position " + _curChPos);
		}
		NewSy(); // dot done
		
		if (_sy != AlphaTabSymbols.Number) {
			throw new FileFormatException("Expected Number found \"" + _syData + "\" on position " + _curChPos);
		}
		var string:Int = _syData;
		if (string < 1 || string > _track.StringCount()) 
		{
			throw new FileFormatException("Invalid String for Note found \"" + _syData + "\" on position " + _curChPos);
		}	
		NewSy(); // string done
		
		// create note
		var note:GsNote = Factory.NewNote();
		note.String = string;
		note.Effect = Factory.NewEffect();
		note.Effect.DeadNote = isDead;
		note.Value = fret;
		
		// todo: effects
		
		return note;
	}
	
	private function ParseClef(str:String): GsMeasureClef {
		switch(str.toLowerCase())
		{
			case "treble": return GsMeasureClef.Treble;
			case "bass": return GsMeasureClef.Bass;
			case "tenor": return GsMeasureClef.Tenor;
			case "alto": return GsMeasureClef.Alto;
			default: throw new FileFormatException("Unknown clef, \"" + _syData + "\" on position " + _curChPos);
		}
	}
	private function ParseKeySignature(str:String) : Int
	{
		switch(str.toLowerCase()) {
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
			default: throw new FileFormatException("Unsupported key signature found on position: " + _curChPos);
		}
	}
	private function ParseTuning(str:String) : Int
	{
		var base = 0;
		var regex:EReg = ~/([a-g]b?)([0-9])/i;
		if (regex.match(str.toLowerCase()))
		{
			var note = regex.matched(1);
			var octave = Std.parseInt(regex.matched(2));
			if (note == "c") {
				base = 0;
			}
			else if (note == "db") {
				base = 1;
			}
			else if (note == "d") {
				base = 2;
			}
			else if (note == "eb") {
				base = 3;
			}
			else if (note == "e") {
				base = 4;
			}
			else if (note == "f") {
				base = 5;
			}
			else if (note == "gb") {
				base = 6;
			}
			else if (note == "g") {
				base = 7;
			}
			else if (note == "ab") {
				base = 8;
			}
			else if (note == "a") {
				base = 9;
			}
			else if (note == "bb") {
				base = 10;
			}
			else if (note == "b") {
				base = 11;
			}
			else {
				throw new FileFormatException("Invalid tuning note \"" + str + "\" on position " + _curChPos);
			}
			
			// add octaves
			base += (octave * 12);
			
		}
		else
		{
			throw new FileFormatException("Invalid Tuning format \"" + str + "\" on position " + _curChPos);
		}
		return base;
	}
	
	private function NextChar() : Void 
	{
		_ch = _curChPos < Data.getSize() ? 
				String.fromCharCode(Data.readByte()) 
				: EOL;
		_curChPos++;
	}
		
	private function NewSy() 
	{
		_sy = AlphaTabSymbols.No;
		do 
		{
			if (_ch == EOL) 
			{
				_sy = AlphaTabSymbols.Eof;
			}
			else if (_ch == " " || _ch == "\n" || _ch == "\r" || _ch == "\t") 
			{
				// skip whitespaces 
				NextChar();
			}
			else if (_ch == '"' || _ch == "'") 
			{
				NextChar();
				_syData = "";
				_sy = AlphaTabSymbols.String;
				while(_ch != '"' && _ch != "'" && _ch != EOL) 
				{
					_syData += _ch;
					NextChar();
				} 
				NextChar();
			}
			else if (IsLetter(_ch))
			{
				var name = ReadName();
				/*if (IsVersion(name)) 
				{
					_sy = AlphaTabSymbols.Version;
					_syData = name;
				}
				else */if (IsTuning(name)) 
				{
					_sy = AlphaTabSymbols.Tuning;
					_syData = name.toLowerCase();
				}
				else
				{
					_sy = AlphaTabSymbols.String;
					_syData = name;
				}
			}
			else if (IsDigit(_ch)) 
			{
				var number:Int = ReadNumber();
				_sy = AlphaTabSymbols.Number;
				_syData = number;
			}
			else if(_ch == ".")
			{
				_sy = AlphaTabSymbols.Dot;
				NextChar();
			}
			else if (_ch == "(") 
			{
				_sy = AlphaTabSymbols.LParensis;
				NextChar();
			}
			else if (_ch == "\\") 
			{
				NextChar();
				var name = ReadName();
				_sy = AlphaTabSymbols.MetaCommand;
				_syData = name;
			}
			else if (_ch == ")") 
			{
				_sy = AlphaTabSymbols.RParensis;
				NextChar();
			}
			else if (_ch == "|") 
			{
				_sy = AlphaTabSymbols.Pipe;
				NextChar();
			}
			else
			{
				throw new FileFormatException("Illegal element \"" + _ch + "\" found on pos " + _curChPos);
			}
		} while (_sy == AlphaTabSymbols.No);	
	}
	
	private static function IsLetter(ch:String) : Bool
	{
		var code:Int = ch.charCodeAt(0);
		return (code >= 0x41 && code <= 0x5A) || /*A-Z*/
				(code >= 0x61 && code <= 0x7A) || /*A-Z*/
				(code > 0x80); /* Unicode Symbols */
	}
	
	
	private static function IsDigit(ch:String) : Bool
	{
		var code:Int = ch.charCodeAt(0);
		return (code >= 0x30 && code <= 0x57); /*0-9*/
	}	
	
	private static function IsVersion(name:String) : Bool
	{
		return name.toLowerCase() == "alphaTab0.1";
	}
	
	private static function IsTuning(name:String) : Bool
	{
		var regex:EReg = ~/([a-g]b?)([0-9])/i;
		return regex.match(name);
	}
	
	private function ReadName() : String
	{
		var str:String = "";
		do
		{
			str += _ch;
			NextChar();
		} while (IsLetter(_ch) || IsDigit(_ch));
		return str;
	}
	
	private function ReadNumber() : Int
	{
		var str:String = "";
		do
		{
			str += _ch;
			NextChar();
		} while (IsDigit(_ch));
		return Std.parseInt(str) ;
	}
	
}