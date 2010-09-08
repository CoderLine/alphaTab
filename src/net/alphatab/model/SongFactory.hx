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
package net.alphatab.model;
import net.alphatab.model.effects.BendEffect;
import net.alphatab.model.effects.GraceEffect;
import net.alphatab.model.effects.HarmonicEffect;
import net.alphatab.model.effects.TremoloBarEffect;
import net.alphatab.model.effects.TremoloPickingEffect;
import net.alphatab.model.effects.TrillEffect;

/**
 * A base song factory, providing basic song model objects
 */
class SongFactory
{
	public function new()
	{
		
	}
	public function newSong() : Song
	{
		return new Song();
	}
	
	public function newLyrics() : Lyrics
	{
		return new Lyrics();
	}
	
	public function newLyricLine() : LyricLine
	{
		return new LyricLine();
	}
	
	public function newPageSetup() : PageSetup
	{
		return new PageSetup();
	}
	
	public function newMidiChannel() : MidiChannel
	{
		return new MidiChannel();
	}
	
	public function newTimeSignature() : TimeSignature
	{
		return new TimeSignature(this);
	}
	
	public function newDuration() : Duration
	{
		return new Duration(this);
	}
	
	public function newMeasureHeader() : MeasureHeader
	{
		return new MeasureHeader(this);
	}
	
	public function newTempo() : Tempo
	{
		return new Tempo();
	}
	
	public function newMarker() : Marker
	{
		return new Marker();
	}
	
	public function newStroke() : BeatStroke
	{
		return new BeatStroke();
	}
	
	public function newVoice(index:Int) : Voice
	{
		return new Voice(this, index);
	}
	
	public function newNoteEffect() : NoteEffect
	{
		return new NoteEffect();
	}
	
	public function newBeatEffect() : BeatEffect
	{
		return new BeatEffect(this);
	}
	
	public function newTrack() : Track
	{
		return new Track(this);
	}
	
	public function newString() : GuitarString
	{
		return new GuitarString();
	}
	
	public function newMeasure(header:MeasureHeader) : Measure
	{
		return new Measure(header);
	}
	
	public function newTuplet() : Tuplet
	{
		return new Tuplet();
	}
	
	public function newBeat() : Beat
	{
		return new Beat(this);
	}
	
	public function newBendEffect() : BendEffect
	{
		return new  BendEffect();
	}
	
	public function newTremoloBarEffect() : TremoloBarEffect
	{
		return new TremoloBarEffect();
	}
	
	public function newHarmonicEffect() : HarmonicEffect
	{
		return new HarmonicEffect();
	}
	
	public function newGraceEffect() : GraceEffect
	{
		return new  GraceEffect();
	}
	
	public function newTrillEffect() : TrillEffect
	{
		return new TrillEffect(this);
	}
	
	public function newTremoloPickingEffect() : TremoloPickingEffect
	{
		return new TremoloPickingEffect(this);
	}
	
	public function newChord(stringCount:Int) : Chord
	{
		return new Chord(stringCount);
	}
	
	public function newText() : BeatText
	{
		return new BeatText();
	}
	
	public function newMixTableChange() : MixTableChange
	{
		return new MixTableChange();
	}
	
	public function newNote() : Note
	{
		return new Note(this);
	}
}