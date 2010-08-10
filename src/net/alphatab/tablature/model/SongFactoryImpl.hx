package net.alphatab.tablature.model;
import net.alphatab.model.Beat;
import net.alphatab.model.BeatText;
import net.alphatab.model.Chord;
import net.alphatab.model.Lyrics;
import net.alphatab.model.Measure;
import net.alphatab.model.MeasureHeader;
import net.alphatab.model.Note;
import net.alphatab.model.SongFactory;
import net.alphatab.model.Track;
import net.alphatab.model.Voice;

/**
 * The songmodel objects provided by this factory, implement drawing and layouting features 
 * used by the tablature 
 */
class SongFactoryImpl extends SongFactory
{
	public function new() 
	{
		super();
	}
	
	public override function newMeasureHeader() : MeasureHeader
	{
		return new MeasureHeaderImpl(this);
	}

	public override function newTrack() : Track
	{
		return new TrackImpl(this);
	}

	public override function newMeasure(header:MeasureHeader) : Measure
	{
		return new MeasureImpl(header);
	}

	public override function newNote() : Note
	{
		return new NoteImpl(this);
	}

	public override function newVoice(index:Int) : Voice
	{
		return new VoiceImpl(this, index);
	}

	public override function newLyrics() : Lyrics
	{
		return new LyricsImpl();
	}

	public override function newChord(length:Int) : Chord
	{
		return new ChordImpl(length);
	}


	public override function newText() : BeatText
	{
		return new BeatTextImpl();
	}

	public override function newBeat() : Beat
	{
		return new BeatImpl(this);
	}
	
}