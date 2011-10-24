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
package alphatab;
import alphatab.model.Song;
import alphatab.platform.cpp.CppCLI;
import alphatab.tablature.Tablature;
import alphatab.tablature.model.DrawingSongModelFactory;
import alphatab.file.alphatex.AlphaTexParser;
import alphatab.midi.MidiDataProvider;
import alphatab.file.alphatex.AlphaTexWriter;

/**
 * The main entry point of this application.
 */
class Main 
{
    /**
     * The main entry point of this application.
     */
    static function main() 
    {        
        #if cpp
        new alphatab.platform.cpp.CppCLI().run();
        #elseif neko
        new alphatab.platform.neko.NekoCLI().run();
        #end
    }
}