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

import alphatab.model.Note;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayer;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.ViewLayout;

/**
 * This class is used to group voices for tuplets.
 */
class TripletGroup 
{
    public var voices(default,default):Array<VoiceDrawing>;
    private var _voiceIndex:Int;
    public var triplet(default,default): Int;
    
    public function isFull()
    {
        return voices.length == triplet;
    }
    
    public function new(voice:Int) 
    {
        _voiceIndex = voice;
        voices = new Array<VoiceDrawing>();
    }
    
    public function check(voice:VoiceDrawing) : Bool
    {
        if (voices.length == 0)
        { // first is everytime ok
            triplet = voice.duration.tuplet.enters;
        }
        else
        {
            // can tripletnote be fit into this group
            if (voice.index != _voiceIndex || voice.duration.tuplet.enters != triplet || isFull()) return false;
        }
        voices.push(voice);
        
        return true;
    }    
}