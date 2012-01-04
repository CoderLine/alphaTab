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
package alphatab.io;
import haxe.unit.TestCase;

class DataInputStreamTest extends TestCase
{
    public function testBoolTrue()
    {
        var d:DataInputStream = prepareInputStream([1], true);
        
        assertEquals(true, d.readBool());
    }
    
    public function testBoolFalse()
    {
        var d:DataInputStream = prepareInputStream([0], true);
        
        assertEquals(false, d.readBool());
    }
     
    public function testShortLePositive()
    {
        var d:DataInputStream = prepareInputStream([0xBC, 0x7F], false);
        assertEquals(32700, d.readShort());
    }
    
    public function testShortLeNegative()
    {
        var d:DataInputStream = prepareInputStream([0x44, 0x80], false);
        assertEquals(-32700, d.readShort());
    }
    
    public function testShortBePositive()
    {
        var d:DataInputStream = prepareInputStream([0x7F, 0xBC], true);
        assertEquals(32700, d.readShort());
    }
    
    public function testShortBeNegative()
    {
        var d:DataInputStream = prepareInputStream([0x80, 0x44], true);
        assertEquals(-32700, d.readShort());
    }
    
    public function testIntLePositive()
    {
        var d:DataInputStream = prepareInputStream([0xD0, 0xFF, 0xFF, 0x7F], false);
        assertEquals(2147483600, d.readInt());
    }
    
    public function testIntLeNegative()
    {
        var d:DataInputStream = prepareInputStream([0x30, 0x00, 0x00, 0x80], false);
        assertEquals(-2147483600, d.readInt());
    }
    
    public function testIntBePositive()
    {
        var d:DataInputStream = prepareInputStream([0x7F, 0xFF, 0xFF, 0xD0], true);
        assertEquals(2147483600, d.readInt());
    }
    
    public function testIntBeNegative()
    {
        var d:DataInputStream = prepareInputStream([0x80, 0x00, 0x00, 0x30], true);
        assertEquals(-2147483600, d.readInt());
    }
    
    public function testFloatLePositive()
    {
        var d:DataInputStream = prepareInputStream([0x56, 0x0E, 0x49, 0x40], false);
        assertEqualsTolerance(3.1415, d.readFloat(), 0.0001); 
    }
    
    public function testFloatLeNegative()
    {
        var d:DataInputStream = prepareInputStream([0x56, 0x0E, 0x49, 0xC0], false);
        assertEqualsTolerance(-3.1415, d.readFloat(), 0.0001);
    }    
    
    public function testFloatBePositive()
    {
        var d:DataInputStream = prepareInputStream([0x40, 0x49, 0x0E, 0x56], true);
        assertEqualsTolerance(3.1415, d.readFloat(), 0.0001); 
    }
    
    public function testFloatBeNegative()
    {
        var d:DataInputStream = prepareInputStream([0xC0, 0x49, 0x0E, 0x56], true);
        assertEqualsTolerance(-3.1415, d.readFloat(), 0.0001);
    }
    
    // public function testDoubleLePositive()
    // {
    //     var d:DataInputStream = prepareInputStream([0xF2, 0xD4, 0xC8, 0x53, 0xFB, 0x21, 0x09, 0x40], false);
    //     assertEqualsTolerance(3.14159265, d.readDouble(), 0.0001); 
    // }
    // 
    // public function testDoubleLeNegative()
    // {
    //     var d:DataInputStream = prepareInputStream([0xF2, 0xD4, 0xC8, 0x53, 0xFB, 0x21, 0x09, 0xC0], false);
    //     assertEqualsTolerance(-3.14159265, d.readFloat(), 0.0001);
    // }    
    // 
    // public function testDoubleBePositive()
    // {
    //     var d:DataInputStream = prepareInputStream([0x40, 0x09, 0x21, 0xFB, 0x53, 0xC8, 0xD4, 0xF2], true);
    //     assertEqualsTolerance(3.14159265, d.readDouble(), 0.0001); 
    // }
    // 
    // public function testDoubleBeNegative()
    // {
    //     var d:DataInputStream = prepareInputStream([0xC0, 0x09, 0x21, 0xFB, 0x53, 0xC8, 0xD4, 0xF2], true);
    //     assertEqualsTolerance(-3.14159265, d.readFloat(), 0.0001);
    // }
    
    private function assertEqualsTolerance(expected:Float, actual:Float, tolerance:Float)
    {
        currentTest.done = true;
        if (expected == actual) 
        {
            return;
        }
        else if ( Math.abs(expected - actual) <= tolerance)
        {
            return;
        }
        
        currentTest.success = false;
        currentTest.error = "expected '" + expected + "' with tolerance '" + tolerance + "' but was '" + actual + "', difference is '" +
                            Math.abs(expected - actual) + "'";
        throw currentTest;
    }

    private static function prepareInputStream(data:Array<Int>, bigEndian:Bool) : DataInputStream
    {
        return new DataInputStream(new MemoryInputStream(data), bigEndian);
    }
}