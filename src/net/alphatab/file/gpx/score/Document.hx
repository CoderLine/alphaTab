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
 *  
 *  This code is based on the code of TuxGuitar. 
 *  	Copyright: J.Jørgen von Bargen, Julian Casadesus <julian@casadesus.com.ar>
 *  	http://tuxguitar.herac.com.ar/
 */
package net.alphatab.file.gpx.score;

class Document 
{
	public var score:Score;
	public var tracks:Array<Track>;
	public var masterBars:Array<MasterBar>;
	public var bars:Array<Bar>;
	public var voices:Array<Voice>;
	public var beats:Array<Beat>;
	public var notes:Array<Note>;
	public var rythms:Array<Rhythm>;
	public var automations:Array<Automation>;
	
	public function new()
	{
		score = new Score();
		tracks = new Array<Track>();
		masterBars = new Array<MasterBar>();
		bars = new Array<Bar>();
		voices = new Array<Voice>();
		beats = new Array<Beat>();
		notes = new Array<Note>();
		rythms = new Array<Rhythm>();
		automations = new Array<Automation>();
	}
	
	public function getBar(id:Int) : Bar
	{
		for(bar in this.bars)
		{
			if(bar.id == id)
				return bar;
		}
		return null;
	}
	
	public function getVoice(id:Int) : Voice
	{
		for(voice in this.voices)
		{
			if(voice.id == id)
				return voice;
		}
		return null;
	}
	
	public function getBeat(id:Int) : Beat
	{
		for(beat in this.beats)
		{
			if(beat.id == id)
				return beat;
		}
		return null;
	}
	
	public function getNote(id:Int) : Note
	{
		for(note in this.notes)
		{
			if(note.id == id)
				return note;
		}
		return null;
	}
	
	public function getRhythm(id:Int) : Rhythm
	{
		for(rhythm in this.rythms)
		{
			if(rhythm.id == id)
				return rhythm;
		}
		return null;
	}
	
	public function getAutomation(type:String, untilBarId:Int) : Automation
	{
		var result:Automation = null;
		
		for(automation in this.automations)
		{
			if(automation.type == type && 
				(automation.barId < untilBarId && (result == null || automation.barId > result.barId)))
			{
				result = automation;
			}
		}
		return result;
	}
}
