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
package alphatab.file.guitarpro;

import alphatab.io.DataInputStream;
import alphatab.io.MemoryInputStream;
import alphatab.model.SongFactory;
import haxe.unit.TestCase;

class GpReaderBaseTest extends TestCase
{
    public function testReadByteSizeString()
    {
        var reader = prepareReader([11, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
        assertEquals("Hello World", reader.readByteSizeString(11));
    }
    
    public function testReadString1()
    {
        var reader = prepareReader([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
        assertEquals("Hello World", reader.readString(11));
    }
    
    public function testReadString2()
    {
        var reader = prepareReader([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64,
                                    0x48, 0x65, 0x6C, 0x6C, 0x6F]);
        assertEquals("Hello", reader.readString(11, 5));
        // " World" skipped
        assertEquals("Hello", reader.readString(5));
    }
    
    public function readIntSizeCheckByteString()
    {
        var reader = prepareReader([12,0,0,0,11,0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
        assertEquals("Hello World", reader.readIntSizeCheckByteString());
    }
    
    public function testReadByteSizeCheckByteString()
    {
        var reader = prepareReader([12,11,0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
        assertEquals("Hello World", reader.readByteSizeCheckByteString());
    }
    
    public function testReadIntSizeString()
    {
        var reader = prepareReader([11,0,0,0,0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
        assertEquals("Hello World", reader.readIntSizeString());
    }
    
    public function testReadVersion()
    {
        var reader = prepareReader([0x18, 0x46, 0x49, 0x43, 0x48, 0x49, 0x45, 0x52, 0x20, 0x47, 0x55, 0x49, 0x54, 0x41, 0x52, 0x20, 0x50, 0x52, 0x4F, 0x20, 0x76, 0x33, 0x2E, 0x30, 0x30,
                                    0, 0, 0, 0, 0, 0]);
        reader.initVersions([]);
        reader.readVersion();
        assertEquals("FICHIER GUITAR PRO v3.00", reader.version);
    }
    
    private static function prepareReader(data:Array<Int>)
    {
        var input = new DataInputStream(new MemoryInputStream(data));
        var readerBase = new GpReaderBase();
        readerBase.init(input, new SongFactory());
        return readerBase;
    }
    
}