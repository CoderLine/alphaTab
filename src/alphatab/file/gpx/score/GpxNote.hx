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

import alphatab.model.NoteEffect;

class GpxNote 
{
    public var id:Int;
    public var fret:Int;
    public var string:Int;
    public var tone:Int;
    public var octave:Int;
    public var element:Int;
    public var variation:Int;
    public var midiNumber:Int;
    
    public var tieDestination:Bool;
    public var vibrato:Bool;
    public var mutedEnabled:Bool;
    public var palmMutedEnabled:Bool;
    public var slide:Bool;
    
    public function new() 
    {
         this.id = -1;
         this.fret = -1;
         this.string = -1;
         this.tone = -1;
         this.octave = -1;
         this.element = -1;
         this.variation = -1;
         this.midiNumber = -1; 
    }
}
