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
package alphatab.importer;

import alphatab.io.BitInput;
import alphatab.io.BytesArray;
import haxe.io.Bytes;
import haxe.io.BytesBuffer;
import haxe.io.BytesInput;
import haxe.io.Eof;

/**
 * this class represents a file within the GpxFileSystem
 */
class GpxFile 
{
	public var fileName:String;
	public var fileSize:Int;
	public var data:Bytes;
	
	public function new()
	{
	}
}

/**
 * This class represents the file system structure
 * stored within a GPX container file. 
 */
class GpxFileSystem 
{
    public static inline var HeaderBcFs:String = "BCFS";
    public static inline var HeaderBcFz:String = "BCFZ";
    public static inline var ScoreGpif:String = "score.gpif";
	
	private var _fileFilter:String->Bool;
	
	/**
	 * Gets the list of files stored in this FileSystem.
	 */
	public var files:Array<GpxFile>;

	/**
	 * Creates a new GpxFileSystem instance
	 */
	public function new() 
	{
		files = new Array<GpxFile>();
	}
	
	/**
	 * You can set a file filter method using this setter. On parsing
	 * the filestructure this function can determine based on the filename 
	 * whether this file will be available after loading. 
	 * This way we can reduce the amount of memory we store.
	 * @param	fileFilter the method to call
	 */
	public function setFileFilter(fileFilter : String->Bool)
	{
		_fileFilter = fileFilter;
	}
	
	/**
	 * this is the default file filter which just enables loading of all 
	 * files
	 */
	private function defaultFileFilter(s:String)
	{
		return true;
	}
	
	/**
	 * Load a complete FileSystem to the memory.
	 * @param	data the binary source to read from.
	 */
	public function load(data:BytesInput)
	{
		var src = new BitInput(data);
		readBlock(src);
	}	
	
	/**
	 * Reads the 4 byte header as a string.
	 * @param	src the BitInput to read from
	 * @return a string with 4 characters representing the header.
	 */
	public function readHeader(src:BitInput) : String 
	{
		return src.readString(4);
	}

	/**
	 * Decompresses the given bitinput using the GPX compression format. Only use this method
	 * if you are sure the binary data is compressed using the GPX format. Otherwise unexpected
	 * behavior can occure. 
	 * @param	src the bitInput to read the data from
	 * @param	skipHeader true if the header should NOT be included in the result byteset, otherwise false
	 * @return the decompressed byte data. if skipHeader is set to false the BCFS header is included.
	 */
	public function decompress(src:BitInput, skipHeader:Bool = false) : Bytes
	{
		var uncompressed:BytesArray = new BytesArray();
		var expectedLength = src.readInt32();
		
		try 
		{
			// as long we reach our expected length we try to decompress, a EOF might occure. 
			while( uncompressed.length < expectedLength )
			{
				// compression flag
				var flag = src.readBits(1);
				
				if(flag == 1) // compressed content
				{
					// get offset and size of the content we need to read.
					// compressed does mean we already have read the data and need 
					// to copy it from our uncompressed buffer to the end
					var wordSize = src.readBits(4); 
					var offset = src.readBitsReversed(wordSize);
					var size = src.readBitsReversed(wordSize);
					
					// the offset is relative to the end
					var sourcePosition = uncompressed.length - offset;
					var toRead:Int = Std.int(Math.min(offset, size));
					
					// get the subbuffer storing the data and add it again to the end
					var subBuffer:Bytes = uncompressed.sub(sourcePosition, toRead);
					uncompressed.addBytes(subBuffer);
				}
				else // raw content
				{
					// on raw content we need to read the data from the source buffer 
					var size = src.readBitsReversed(2);
					for (i in 0 ... size)
					{
						uncompressed.add(src.readByte());
					}
				}
			}
		}
		catch (e:Eof)
		{
		}
		
		return uncompressed.getBytes(skipHeader ? 4 : 0);	
	}	
	
	/**
	 * Reads a block from the given data source.
	 * @param	data the data source
	 */
	private function readBlock(data:BitInput)
	{
		var header = readHeader(data);
		if (header == HeaderBcFz) // compressed file?
		{
			// decompress the data and use this 
			// we will skip the header 
			readUncompressedBlock(decompress(data, true));
		}
		else if (header == HeaderBcFs) // uncompressed file?
		{
			readUncompressedBlock(data.readAll());
		}
		else
		{
			throw ScoreImporter.UnsupportedFormat; 
		}
	}
	
	/**
	 * Reads an uncompressed data block into the model.
	 * @param	data the data store to read from.
	 */
	private function readUncompressedBlock(data:Bytes)
	{
		// the uncompressed block contains a list of filesystem entires
		// as long we have data we will try to read more entries
		
		// the first sector (0x1000 bytes) is empty (filled with 0xFF) 
		// so the first sector starts at 0x1000 
		// (we already skipped the 4 byte header so we don't have to take care of this) 

		var sectorSize = 0x1000;
		var offset = sectorSize;
		
		// we always need 4 bytes (+3 including offset) to read the type
		while ( (offset + 3) < data.length)
		{
			var entryType = getInteger(data, offset);

			if (entryType == 2) // is a file?
			{
				// file structure: 
				//   offset |   type   |   size   | what
				//  --------+----------+----------+------
				//    0x04  |  string  |  127byte | FileName (zero terminated)
				//    0x83  |    ?     |    9byte | Unknown 
				//    0x8c  |   int    |    4byte | FileSize
				//    0x90  |    ?     |    4byte | Unknown
				//    0x94  |   int[]  |  n*4byte | Indices of the sector containing the data (end is marked with 0)
				
				// The sectors marked at 0x94 are absolutely positioned ( 1*0x1000 is sector 1, 2*0x1000 is sector 2,...)
				
				var file:GpxFile = new GpxFile();
				file.fileName = getString(data, offset + 0x04, 127);
				file.fileSize = getInteger(data, offset + 0x8C);
				
				// store file if needed
				var storeFile = _fileFilter != null ? _fileFilter(file.fileName) : defaultFileFilter(file.fileName);
				if (storeFile)
				{
					files.push(file);
				}
				
				// we need to iterate the blocks because we need to move after the last datasector
				
				var dataPointerOffset = offset + 0x94;
				var sector = 0; // this var is storing the sector index
				var sectorCount = 0; // we're keeping count so we can calculate the offset of the array item
				
				// as long we have data blocks we need to iterate them, 
				var fileData:BytesArray = storeFile ? new BytesArray(file.fileSize) : null;
				while( (sector = getInteger(data, (dataPointerOffset + (4 * (sectorCount++))))) != 0) 
				{
					// the next file entry starts after the last data sector so we 
					// move the offset along
					offset = sector * sectorSize;
					
					// write data only if needed
					if (storeFile)
					{
						fileData.addBytes(data.sub(offset, sectorSize));
					}
				}
				
				if (storeFile)
				{
					// trim data to filesize if needed
					file.data = Bytes.alloc(Std.int(Math.min(file.fileSize, fileData.length)));
					// we can use the getBuffer here because we are intelligent and know not to read the empty data.
					file.data.blit(0, fileData.getBuffer(), 0, file.data.length); 
				}
 			}
			
			// let's move to the next sector
			offset += sectorSize;			
		}
	}
	
	/**
	 * Reads a zeroterminated ascii string from the given source
	 * @param	data the data source to read from
	 * @param	offset the offset to start reading from
	 * @param	length the max length to read.
	 * @return the ascii string read from the datasource.
	 */
	private function getString(data:Bytes, offset:Int, length:Int) : String
	{
		var buf = new StringBuf();

		for (i in 0 ... length)
		{
			var code = data.get(offset + i) & 0xFF;
			if (code == 0) break; // zero terminated string
			buf.addChar(code);
		}

		return buf.toString();
	}
	
	/**
	 * Reads an 4 byte signed integer from the given source
	 * @param	data the data source to read from 
	 * @param	offset the offset to start reading from
	 */
	private function getInteger(data:Bytes, offset:Int)
	{
        return ((data.get( offset + 3) & 0xff) << 24) 
			 | ((data.get( offset + 2) & 0xff) << 16) 
			 | ((data.get( offset + 1) & 0xff) << 8) 
			 | (data.get(offset) & 0xff);
	}
}