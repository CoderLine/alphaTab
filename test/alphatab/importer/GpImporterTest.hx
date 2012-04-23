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

class GpImporterTest extends GpImporterTestBase
{
    public function new() 
    {
        super();
    }
    
   public function testReadStringIntUnused()
    {
        var reader = prepareImporterWithData([0,0,0,0,11,0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
        assertEquals("Hello World", reader.readStringIntUnused());
    }        
            
    public function testReadStringInt()
    {
        var reader = prepareImporterWithData([11,0,0,0,0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
        assertEquals("Hello World", reader.readStringInt());
    }        
    
    public function testReadStringIntByte()
    {
        var reader = prepareImporterWithData([12,0,0,0,11,0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
        assertEquals("Hello World", reader.readStringIntByte());
    }
        
    public function testReadStringByteLength()
    {
        var reader = prepareImporterWithData([11,0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
        assertEquals("Hello World", reader.readStringByteLength(3));
    }
     
    public function testReadVersion()
    {
        var reader = prepareImporterWithData([0x18, 0x46, 0x49, 0x43, 0x48, 0x49, 0x45, 0x52, 0x20, 0x47, 0x55, 0x49, 0x54, 0x41, 0x52, 0x20, 0x50, 0x52, 0x4F, 0x20, 0x76, 0x33, 0x2E, 0x30, 0x30,
                                    0, 0, 0, 0, 0, 0, 0x18]);
        reader.readVersion();
        assertEquals(300, reader._versionNumber);
        assertEquals(0x18, reader._data.readByte());
    }
    
    
}