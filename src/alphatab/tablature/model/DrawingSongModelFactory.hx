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
package alphatab.tablature.model;
import alphatab.model.Beat;
import alphatab.model.MeasureHeader;
import alphatab.model.Measure;
import alphatab.model.Note;
import alphatab.model.NoteEffect;
import alphatab.model.SongFactory;
import alphatab.model.Track;
import alphatab.model.Voice;

/**
 * This factory provides a songmodel with layouting functionalities
 */
class DrawingSongModelFactory extends SongFactory 
{

    public function new() 
    {
        super();
    }
    
    public override function newNote():Note 
    {
        return new NoteDrawing(this);
    }
        
    public override function newMeasure(header:MeasureHeader):  Measure 
    {
        return new MeasureDrawing(header);
    }
    
    public override function newBeat():Beat 
    {
        return new BeatDrawing(this);
    }
    
    public override function newVoice(index:Int):Voice 
    {
        return new VoiceDrawing(this, index);
    }
    
    public override function newMeasureHeader():MeasureHeader 
    {
        return new MeasureHeaderDrawing(this);
    }
    
}