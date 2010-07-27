/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;
import net.alphatab.model.GsBeat;
import net.alphatab.model.GsBeatText;
import net.alphatab.model.GsChord;
import net.alphatab.model.GsLyrics;
import net.alphatab.model.GsMeasure;
import net.alphatab.model.GsMeasureHeader;
import net.alphatab.model.GsNote;
import net.alphatab.model.GsSongFactory;
import net.alphatab.model.GsTrack;
import net.alphatab.model.GsVoice;

class GsSongFactoryImpl extends GsSongFactory
{
	public function new() 
	{
		super();
	}
	
	public override function NewMeasureHeader() : GsMeasureHeader
	{
		return new GsMeasureHeaderImpl(this);
	}

	public override function NewTrack() : GsTrack
	{
		return new GsTrackImpl(this);
	}

	public override function NewMeasure(header:GsMeasureHeader) : GsMeasure
	{
		return new GsMeasureImpl(header);
	}

	public override function NewNote() : GsNote
	{
		return new GsNoteImpl(this);
	}

	public override function NewVoice(index:Int) : GsVoice
	{
		return new GsVoiceImpl(this, index);
	}

	public override function NewLyrics() : GsLyrics
	{
		return new GsLyricsImpl();
	}

	public override function NewChord(length:Int) : GsChord
	{
		return new GsChordImpl(length);
	}


	public override function NewText() : GsBeatText
	{
		return new GsBeatTextImpl();
	}

	public override function NewBeat() : GsBeat
	{
		return new GsBeatImpl(this);
	}
	
}