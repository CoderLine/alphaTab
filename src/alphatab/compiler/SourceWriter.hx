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
package alphatab.compiler;

class SourceWriter
{
    private static inline var INDENT:String = "    ";
    private var _buffer:StringBuf;
    public var indention(default,default):Int;
    
    public function new() 
    {
        _buffer = new StringBuf();
        indention = 0;
    }
    
    public function printIndent() 
    {
        for(i in 0 ... (indention)) {
            _buffer.add(INDENT);
        }
    }
    
    public function indent() 
    {
        indention = indention + 1;
    }
    
    public function outdent() 
    {
        indention = indention - 1;
        if(indention < 0) {
            indention = 0;
        }
    }
    
    public function print(format:String, args:Array<Dynamic> = null) 
    {
        if(args == null) {
            _buffer.add(format);
        }
        else {
            var str = Sprintf.format(format, args);
            _buffer.add(str);
        }
    }
    
    public function println(format:String = null, args:Array<Dynamic> = null) 
    {
        if(format != null) {
            print(format, args);
        }
        print("\n");
    }
    
    public function toString() : String 
    {
        return _buffer.toString();   
    }
}