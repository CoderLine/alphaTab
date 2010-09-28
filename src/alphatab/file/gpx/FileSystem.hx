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
package alphatab.file.gpx;

import alphatab.file.FileFormatException;
import alphatab.platform.BinaryReader;

class FileSystem 
{
	private static inline var HEADER_BCFS:Int = 1397113666;
	private static inline var HEADER_BCFZ:Int = 1514554178;
	
	private var _fileSystem:Array<File>;
	
	public function new()
	{
		_fileSystem = new Array<File>();
	}
	
	public function getFileNames() : Array<String>
	{
		var names:Array<String> = new Array<String>();
		for(file in _fileSystem)
		{
			names.push(file.fileName);
		}
		return names;
	}
	
	public function getFileContents(fileName:String) : Array<Int>
	{
		for(file in _fileSystem)
		{
			if(file.fileName == fileName)
			{
				return file.fileContents;
			}
		}
		return null;
	}
	
	public function load(data:BinaryReader)
	{
		var srcBuffer = new ByteBuffer(data);
		var header = getInteger(srcBuffer.readBytes(4), 0);
		load2(header, srcBuffer);
	}
	
	private function load2(header:Int, srcBuffer:ByteBuffer) 
	{ 
		if(header == HEADER_BCFS)
		{
			var bcfsBytes:Array<Int> = srcBuffer.readBytes(srcBuffer.length());
			
			var sectorSize = 0x1000;
			var offset = 0;
			while( (offset = (offset + sectorSize)) + 3 < bcfsBytes.length)
			{
				if(getInteger(bcfsBytes, offset) == 2) 
				{
					var indexFileName = offset+4;
					var indexFileSize = offset + 0x8C;
					var indexOfBlock = offset + 0x94;
					
					var block = 0;
					var blockCount = 0;
					var fileBytesStream:Array<Int>  = new Array<Int>();
					while( (block = (getInteger(bcfsBytes, (indexOfBlock + (4* (blockCount++)))))) != 0) 
					{
						var bytes:Array<Int> = getBytes(bcfsBytes, (offset = (block*sectorSize)), sectorSize);
						for(byte in bytes)
						{
							fileBytesStream.push(byte);
						}
					}
					
					var fileSize = getInteger(bcfsBytes, indexFileSize);
					if(fileBytesStream.length >= fileSize)
					{
						this._fileSystem.push(new File(getString(bcfsBytes, indexFileName, 127), getBytes(fileBytesStream, 0, fileSize)));
					}
				}
			} 
		}
		else if(header == HEADER_BCFZ)
		{
			var bcfsBuffer:Array<Int> = new Array<Int>();
			
			var expectLength = getInteger(srcBuffer.readBytes(4), 0);
			while( !srcBuffer.end() && srcBuffer.offset() < expectLength)
			{
				var flag = srcBuffer.readBits(1);
				if(flag == 1)
				{
					var bits = srcBuffer.readBits(4);
					var offs = srcBuffer.readBitsReversed(bits);
					var size = srcBuffer.readBitsReversed(bits);
					
					var pos = bcfsBuffer.length - offs;
					var i = 0; 
					while( i < (size > offs ? offs : size))
					{
						bcfsBuffer.push(bcfsBuffer[pos+i]);
						i++;
					}
				}
				else
				{
					var size = srcBuffer.readBitsReversed(2);
					var i = 0; 
					while(i < size)
					{
						bcfsBuffer.push(srcBuffer.readBits(8));
						i++;
					}
				}
			}
			
			var str = "";
			for(byte in bcfsBuffer)
			{
				str += String.fromCharCode(byte);
			}
			
			var newReader = new BinaryReader();
			newReader.initialize(str);
			load(newReader);
		} 
		else
		{
			throw new FileFormatException("This is not a GPX file");
		}
	}
	
	 private function getInteger(source:Array<Int>, offset:Int) :Int
	 {
		return ((source[ offset + 3] & 0xff) << 24) | ((source[ offset + 2] & 0xff) << 16) | ((source[ offset + 1] & 0xff) << 8) | (source[offset] & 0xff);
	 } 
	 
	 private function getString(source:Array<Int>, offset:Int, length:Int) : String
	 {
	 	var charsLength = 0;
	 	var i = 0;
	 	var str = "";
	 	while(i < length)
	 	{
	 		var charValue = source[offset+i] & 0xFF;
	 		if(charValue == 0) break;
	 		str += String.fromCharCode(charValue);
	 		i++;
	 	}
	 	return str;
	 }
	 
	 private function getBytes(source:Array<Int>, offset:Int, length:Int) : Array<Int>
	 {
	 	var bytes = new Array<Int>();
	 	var i = 0; 
	 	while(i < length)
	 	{
	 		if(source.length >= offset + i)
	 		{	 		
	 			bytes.push(source[offset+i]);
	 		}
	 		i++;
	 	}
	 	return bytes;
	 }
	 
}
