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
package alphatab.file.gpx;

import alphatab.model.SongFactory;
import alphatab.model.Song;
import alphatab.file.SongReader;
import alphatab.io.DataInputStream;
import alphatab.file.FileFormatException;

class GpxReader extends SongReader
{
    private var _fileSystem:FileSystem;
    
    public override function init(data:DataInputStream, factory:SongFactory) : Void 
    {
        super.init(data, factory);
        _fileSystem = new FileSystem();
    }
    
    public override function readSong(): Song
    {
        try
        {
            _fileSystem.load(data);
            
            var reader:DocumentReader = new DocumentReader(_fileSystem.getFileContents("score.gpif"));
            var parser:DocumentParser = new DocumentParser(factory, reader.read());
            
            return parser.parse();
        }
        catch (e:FileFormatException)
        {
            throw e;
        }
        catch(e:Dynamic)
        {
            throw new FileFormatException(Std.string(e));
        }
    }    
}
