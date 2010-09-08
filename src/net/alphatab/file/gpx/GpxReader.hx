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
package net.alphatab.file.gpx;

import net.alphatab.model.SongFactory;
import net.alphatab.model.Song;
import net.alphatab.file.SongReader;
import net.alphatab.platform.BinaryReader;
import net.alphatab.file.FileFormatException;

class GpxReader extends SongReader
{
	private var _fileSystem:FileSystem;
	
	override public function init(data:BinaryReader, factory:SongFactory) : Void 
	{
		super.init(data, factory);
		_fileSystem = new FileSystem();
	}
	
	override public function readSong(): Song
	{
		try
		{
			_fileSystem.load(data);
			
			var reader:DocumentReader = new DocumentReader(_fileSystem.getFileContents("score.gpif"));
			//var parser:DocumentParser = new DocumentParser(factory, reader.read());
			
			return factory.newSong();//parser.parse();
		}
		catch(e:Dynamic)
		{
			if(Std.is(e, FileFormatException))
			{
				throw e;
			}
			else
			{
				throw new FileFormatException(Std.string(e));
			}
		}
	}	
}
