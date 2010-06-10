/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.model;
import net.coderline.jsgs.model.GsBeat;
import net.coderline.jsgs.model.GsBeatText;
import net.coderline.jsgs.model.GsChord;
import net.coderline.jsgs.model.GsLyrics;
import net.coderline.jsgs.model.GsMeasure;
import net.coderline.jsgs.model.GsMeasureHeader;
import net.coderline.jsgs.model.GsNote;
import net.coderline.jsgs.model.GsSongFactory;
import net.coderline.jsgs.model.GsTrack;
import net.coderline.jsgs.model.GsVoice;

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