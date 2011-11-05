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
    public var id(default,default):Int;
    public var fret(default,default):Int;
    public var string(default,default):Int;
    public var tone(default,default):Int;
    public var octave(default,default):Int;
    public var element(default,default):Int;
    public var variation(default,default):Int;
    public var midiNumber(default,default):Int;
    
    public var tieDestination(default,default):Bool;
    public var vibrato(default,default):Bool;
    public var mutedEnabled(default,default):Bool;
    public var palmMutedEnabled(default,default):Bool;
    public var slide(default,default):Bool;
    
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
