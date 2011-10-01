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
 *      Copyright: J.Jørgen von Bargen, Julian Casadesus <julian@casadesus.com.ar>
 *      http://tuxguitar.herac.com.ar/
 */
package alphatab.file.gpx.score;

class GpxDocument 
{
    public var score:GpxScore;
    public var tracks:Array<GpxTrack>;
    public var masterBars:Array<GpxMasterBar>;
    public var bars:Array<GpxBar>;
    public var voices:Array<GpxVoice>;
    public var beats:Array<GpxBeat>;
    public var notes:Array<GpxNote>;
    public var rhythms:Array<GpxRhythm>;
    public var automations:Array<GpxAutomation>;
    
    public function new()
    {
        score = new GpxScore();
        tracks = new Array<GpxTrack>();
        masterBars = new Array<GpxMasterBar>();
        bars = new Array<GpxBar>();
        voices = new Array<GpxVoice>();
        beats = new Array<GpxBeat>();
        notes = new Array<GpxNote>();
        rhythms = new Array<GpxRhythm>();
        automations = new Array<GpxAutomation>();
    }
    
    public function getBar(id:Int) : GpxBar
    {
        for(bar in this.bars)
        {
            if(bar.id == id)
                return bar;
        }
        return null;
    }
    
    public function getVoice(id:Int) : GpxVoice
    {
        for(voice in this.voices)
        {
            if(voice.id == id)
                return voice;
        }
        return null;
    }
    
    public function getBeat(id:Int) : GpxBeat
    {
        for(beat in this.beats)
        {
            if(beat.id == id)
                return beat;
        }
        return null;
    }
    
    public function getNote(id:Int) : GpxNote
    {
        for(note in this.notes)
        {
            if(note.id == id)
                return note;
        }
        return null;
    }
    
    public function getRhythm(id:Int) : GpxRhythm
    {
        for(rhythm in this.rhythms)
        {
            if(rhythm.id == id)
                return rhythm;
        }
        return null;
    }
    
    public function getAutomation(type:String, untilBarId:Int) : GpxAutomation
    {
        var result:GpxAutomation = null;
        
        for(automation in this.automations)
        {
            if(automation.type == type && 
                (automation.barId <= untilBarId && (result == null || automation.barId > result.barId)))
            {
                result = automation;
            }
        }
        return result;
    }
}
