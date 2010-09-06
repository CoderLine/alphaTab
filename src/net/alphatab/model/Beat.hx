package net.alphatab.model;

/**
 * A beat contains multiple voices. 
 */
class Beat
{
	public static inline var MAX_VOICES:Int = 2;
	
	public var tableChange:MixTableChange;
	public var voices:Array<Voice>;
	public var text:BeatText;
	public var measure:Measure;
	public var start:Int;
	public var effect:BeatEffect;
		
	public function isRestBeat() : Bool
	{
		for(i in 0 ... voices.length)
		{
			var voice:Voice = this.voices[i];
			if(!voice.isEmpty && !voice.isRestVoice())
				return false;
		}
		return true;
	}
	
	public function setText(text:BeatText) : Void
	{
		text.beat = this;
		this.text = text;
	}
	public function setChord(chord:Chord) : Void
	{
		chord.beat = this;
		this.effect.chord = chord;
	}
	
	public function ensureVoices(count:Int, factory:SongFactory) : Void
	{
		while(voices.length < count) // as long we hav not enough voicex
		{
			// create new ones
			var voice = factory.newVoice(voices.length);
			voice.beat = this;
			this.voices.push(voice);
		}
	}
	
	public function getNotes() : Array<Note>
	{
		var notes:Array<Note> = new Array<Note>();
		for (voice in voices) 
		{
			for (note in voice.notes)
			{
				notes.push(note);
			}
		}
		return notes;
	}
	
	public function new(factory:SongFactory)
	{
		start = Duration.QUARTER_TIME;
		effect = factory.newBeatEffect();
		voices = new Array<Voice>();
		for(i in 0 ... Beat.MAX_VOICES)
		{
			var voice = factory.newVoice(i);
			voice.beat = this;
			this.voices.push(voice);
		}
	}
}