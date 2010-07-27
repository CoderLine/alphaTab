/**
 * ...
 * @author Zenas
 */

package net.alphatab.file.alphatab;
import net.alphatab.model.GsBeat;
import net.alphatab.model.GsGuitarString;
import net.alphatab.model.GsMeasure;
import net.alphatab.model.GsMeasureClefConverter;
import net.alphatab.model.GsNote;
import net.alphatab.model.GsSong;
import net.alphatab.model.GsTrack;

class AlphaTabWriter 
{
	public static function GetAsciiTab(track:GsTrack) 
	{
		var str = "";
		
		// metadata
		str += WriteMetaData(track);
		str += WriteMeasures(track);
		
		return str;
	}
	
	private static function WriteMetaData(track:GsTrack)  : String
	{
		var str = "";
		var song:GsSong = track.Song;
		if (song.Title != "") 
		{
			str += "\\title '" + song.Title + "'\n";
		}
		if (song.Subtitle != "") 
		{
			str += "\\subtitle '" + song.Subtitle + "'\n";
		}
		if (song.Artist != "") 
		{
			str += "\\artist '" + song.Artist + "'\n";
		}
		if (song.Album != "") 
		{
			str += "\\album '" + song.Album + "'\n";
		}
		if (song.Words != "") 
		{
			str += "\\words '" + song.Words + "'\n";
		}
		if (song.Music != "") 
		{
			str += "\\music '" + song.Music + "'\n";
		}
		if (song.Copyright != "") 
		{
			str += "\\copyright '" + song.Copyright + "'\n";
		}
		if (song.Tab != "") 
		{
			str += "\\tab '" + song.Tab + "'\n";
		}
		// tuning
		str += "\\tuning ";
		for (string in track.Strings)
		{
			str += ParseTuning(string) + " ";
		}
		str += "\n";
		
		// tempo
		str += "\\tempo " + song.Tempo + "\n";
		
		str += ".\n";
		return str;
	}
	
	private static function ParseTuning(string:GsGuitarString) : String
	{
		var tuning = string.Value; 
		
		var octave = Math.floor(tuning / 12);
		var note = tuning % 12;
		var base = "";
		if (note == 0) {
			base = "c";
		}
		else if (note == 1) {
			base = "db";
		}
		else if (note == 2) {
			base = "d";
		}
		else if (note == 3) {
			base = "eb";
		}
		else if (note == 4) {
			base = "e";
		}
		else if (note == 5) {
			base = "f";
		}
		else if (note == 6) {
			base = "gb";
		}
		else if (note == 7) {
			base = "g";
		}
		else if (note == 8) {
			base = "ab";
		}
		else if (note == 9) {
			base = "a";
		}
		else if (note == 10) {
			base = "bb";
		}
		else /*if (note == 11)*/ {
			base = "b";
		}
		return base + Std.string(octave);
	}
	
	private static function WriteMeasures(track:GsTrack):String
	{
		var str = "";
		for (i in 0 ... track.MeasureCount())
		{
			var measure:GsMeasure = track.Measures[i];
			str += WriteMeasureMeta(i, track);
			str += WriteBeats(measure);
			if (i < (track.MeasureCount() - 1))
				str += "|";
		}
		return str;
	}
	
	private static function WriteMeasureMeta(i:Int, track:GsTrack) : String
	{
		var measure:GsMeasure = track.Measures[i];
		var str = "";
		//Time Signature
		if (i == 0 || measure.GetTimeSignature().Numerator != track.Measures[i-1].GetTimeSignature().Numerator
			|| measure.GetTimeSignature().Denominator.Value != track.Measures[i-1].GetTimeSignature().Denominator.Value)
		{
			str += "\\ts " + measure.GetTimeSignature().Numerator + " " + measure.GetTimeSignature().Denominator.Value + "\n";
		}
		// repeat open 
		if (measure.IsRepeatOpen())
		{
			str += "\\ro\n";
		}
		// repeat close
		if (measure.RepeatClose() > 0)
		{
			str += "\\rc " + measure.RepeatClose() + "\n";
		}
		//KeySignature
		if (i == 0 || measure.GetKeySignature() != track.Measures[i-1].GetKeySignature() && measure.GetKeySignature() != 0)
		{
			str += "\\ks " + ParseKeySignature(measure.GetKeySignature()) +  "\n";
		}
		// clef 
		if (i == 0 || measure.Clef != track.Measures[i-1].Clef)
		{
			str += "\\clef " + GsMeasureClefConverter.ToString(measure.Clef) +  "\n";
		}
		// clef 
		if (i == 0 || measure.GetTempo().Value != track.Measures[i-1].GetTempo().Value)
		{
			str += "\\tempo " + measure.GetTempo().Value +  "\n";
		}
		return str;
	}
	
	private static function WriteBeats(measure:GsMeasure) : String
	{
		var str = "";
		
		for (i in 0 ... measure.BeatCount())
		{
			var beat:GsBeat = measure.Beats[i];
			var notes:Array<GsNote> = beat.GetNotes();
			if (beat.IsRestBeat())
			{
				str += "r ";
			}
			else 
			{
				if(notes.length > 1)
					str += "(";
				
				for (i in 0 ... notes.length)
				{
					var note:GsNote = notes[i];
					str += note.Value + "." + note.String;
					if(notes.length == 1 || i < (notes.length - 1))
						str += " ";
				}
				if(notes.length > 1)
					str += ")";
			}
			str += "." + beat.Voices[0].Duration.Value + " ";			
		}
		 
		return str;
	}
	
	private static function ParseKeySignature(sig:Int):String 
	{
		switch(sig) {
			case -7: return "cb";
			case -6: return "gb";
			case -5: return "db";
			case -4: return "ab";
			case -3: return "eb";
			case -2: return "bb";
			case -1: return "f";
			case 0: return "c";
			case 1: return "g";
			case 2: return "d";
			case 3: return "a";
			case 4: return "e";
			case 5: return "b";
			case 6: return "f#";
			case 7: return "c#";
			default: return "c";
		}
	}
}