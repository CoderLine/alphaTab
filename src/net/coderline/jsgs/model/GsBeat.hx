/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model;
	
class GsBeat
{
	public static inline var MaxVoices:Int = 2;
	
	public var MixTableChange:GsMixTableChange;
	public var Chord:GsChord;
	public var TableChange:GsMixTableChange;
	public var Voices:Array<GsVoice>;
	public var Text:GsBeatText;
	public var Measure:GsMeasure;
	public var Start:Int;
	public var Stroke:GsBeatStroke;
	public var HasRasgueado:Bool;
	public var PickStroke:Int;
	public var HasPickStroke:Bool;
		
	public function IsRestBeat() : Bool
	{
		for(i in 0 ... this.Voices.length)
		{
			var voice:GsVoice = this.Voices[i];
			if(!voice.IsEmpty && !voice.IsRestVoice())
				return false;
		}
		return true;
	}
	
	public function SetText(text:GsBeatText) : Void
	{
		text.Beat = this;
		this.Text = text;
	}
	public function SetChord(chord:GsChord) : Void
	{
		chord.Beat = this;
		this.Chord = chord;
	}
	
	public function GetNotes() : Array<GsNote>
	{
		var notes:Array<GsNote> = new Array<GsNote>();
		for(i in 0 ... this.Voices.length)
		{
			var voice:GsVoice = this.Voices[i];
			for (note in voice.Notes) 
			{
				notes.push(note);
			}
		}
		return notes;
	}
	
	public function new(factory:GsSongFactory)
	{
		this.Start = GsDuration.QuarterTime;
		this.Stroke = factory.NewStroke();
		this.Voices = new Array<GsVoice>();
		for(i in 0 ... GsBeat.MaxVoices)
		{
			var voice = factory.NewVoice(i);
			voice.Beat = this;
			this.Voices.push(voice);
		}
	}
}