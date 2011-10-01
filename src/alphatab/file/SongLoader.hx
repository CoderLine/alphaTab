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
package alphatab.file;
import alphatab.model.Song;
import alphatab.model.SongFactory;
import alphatab.platform.BinaryReader; 
import alphatab.platform.FileLoader;
import alphatab.platform.PlatformFactory;

/**
 * A wrapper for reading songs. 
 */
class SongLoader 
{ 
    /**
     * Starts loading a song from the specified url.
     * @param url the url of the file to load
     * @param factory the object factory to use
     * @param success the function to call as the song is loaded. 
     */
    public static function loadSong(url:String, factory:SongFactory, success:Song->Void) 
    {
        var loader:FileLoader = PlatformFactory.getLoader();
        loader.loadBinary("GET", url, 
        // success
        function(data:BinaryReader) : Void 
        {
            var readers:Array<SongReader> = SongReader.availableReaders();
            for (reader in readers) 
            {
                try
                {
                    data.seek(0);
                    reader.init(data, factory);
                    var song:Song = reader.readSong();
                    success(song);
                    return;
                }
                catch (e:FileFormatException) 
                {
                    continue;
                }
            }
            throw new FileFormatException("No reader for requested file found");
        },
        // error
        function(err:String) : Void
        {
            throw err;
        });        
    }
}