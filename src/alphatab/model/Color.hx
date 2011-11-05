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
package alphatab.model;

/**
 * A RGB Color.
 */
class Color
{
    public static inline var Black:Color = Color.fromRgb(0, 0, 0);
    public static inline var Red:Color = Color.fromRgb(255, 0, 0);
    
    public var r(default,default):Int;
    public var g(default,default):Int;
    public var b(default,default):Int; 
    public var a(default,default):Float; 
    
    private function new(r:Int, g:Int, b:Int, a:Float)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    
    public function asRgbString() : String
    {
        if(this.a == 1) 
        {
            var s:String = "rgb(";
            s += Std.string(this.r) + "," ;
            s += Std.string(this.g) + "," ;
            s += Std.string(this.b) + ")" ;
            return s;
        }
        else {
            var s:String = "rgba(";
            s += Std.string(this.r) + "," ;
            s += Std.string(this.g) + "," ;
            s += Std.string(this.b) + "," ;
            s += Std.string(this.a) + ")" ;
            return s;
        }
    }
    
    public static function fromRgb(r:Int, g:Int, b:Int) : Color
    {
        return new Color(r, g, b, 1);
    }
    
    public static function fromARgb(r:Int, g:Int, b:Int, a:Float) : Color
    {
        return new Color(r, g, b, a);
    }
}