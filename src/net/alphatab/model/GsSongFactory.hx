/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;
import net.alphatab.model.effects.GsBendEffect;
import net.alphatab.model.effects.GsGraceEffect;
import net.alphatab.model.effects.GsHarmonicEffect;
import net.alphatab.model.effects.GsTremoloBarEffect;
import net.alphatab.model.effects.GsTremoloPickingEffect;
import net.alphatab.model.effects.GsTrillEffect;

class GsSongFactory
{
	public function new()
	{
		
	}
	public function NewSong() : GsSong
	{
		return new GsSong();
	}
	
	public function NewLyrics() : GsLyrics
	{
		return new GsLyrics();
	}
	
	public function NewLyricLine() : GsLyricLine
	{
		return new GsLyricLine();
	}
	
	public function NewPageSetup() : GsPageSetup
	{
		return new GsPageSetup();
	}
	
	public function NewMidiChannel() : GsMidiChannel
	{
		return new GsMidiChannel();
	}
	
	public function NewTimeSignature() : GsTimeSignature
	{
		return new GsTimeSignature(this);
	}
	
	public function NewDuration() : GsDuration
	{
		return new GsDuration(this);
	}
	
	public function NewMeasureHeader() : GsMeasureHeader
	{
		return new GsMeasureHeader(this);
	}
	
	public function NewTempo() : GsTempo
	{
		return new GsTempo();
	}
	
	public function NewMarker() : GsMarker
	{
		return new GsMarker();
	}
	
	public function NewStroke() : GsBeatStroke
	{
		return new GsBeatStroke();
	}
	
	public function NewVoice(index:Int) : GsVoice
	{
		return new GsVoice(this, index);
	}
	
	public function NewNoteEffect() : GsNoteEffect
	{
		return new GsNoteEffect();
	}
	
	public function NewBeatEffect() : GsBeatEffect
	{
		return new GsBeatEffect(this);
	}
	
	public function NewTrack() : GsTrack
	{
		return new GsTrack(this);
	}
	
	public function NewString() : GsGuitarString
	{
		return new GsGuitarString();
	}
	
	public function NewMeasure(header:GsMeasureHeader) : GsMeasure
	{
		return new GsMeasure(header);
	}
	
	public function NewTriplet() : GsTriplet
	{
		return new GsTriplet();
	}
	
	public function NewBeat() : GsBeat
	{
		return new GsBeat(this);
	}
	
	public function NewBendEffect() : GsBendEffect
	{
		return new GsBendEffect();
	}
	
	public function NewTremoloBarEffect() : GsTremoloBarEffect
	{
		return new GsTremoloBarEffect();
	}
	
	public function NewHarmonicEffect() : GsHarmonicEffect
	{
		return new GsHarmonicEffect();
	}
	
	public function NewGraceEffect() : GsGraceEffect
	{
		return new GsGraceEffect();
	}
	
	public function NewTrillEffect() : GsTrillEffect
	{
		return new GsTrillEffect(this);
	}
	
	public function NewTremoloPickingEffect() : GsTremoloPickingEffect
	{
		return new GsTremoloPickingEffect(this);
	}
	
	public function NewChord(stringCount:Int) : GsChord
	{
		return new GsChord(stringCount);
	}
	
	public function NewText() : GsBeatText
	{
		return new GsBeatText();
	}
	
	public function NewMixTableChange() : GsMixTableChange
	{
		return new GsMixTableChange();
	}
	
	public function NewNote() : GsNote
	{
		return new GsNote(this);
	}
	

}