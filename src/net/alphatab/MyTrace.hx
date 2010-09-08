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
package net.alphatab;

/**
 * A custom trace implementation to customize the output.
 */
class MyTrace 
{
	/**
	 * Initializes a custom haxe logger.
	 */
    public static function init() {
        haxe.Log.trace = trace;
    }

	/**
	 * The custom haxe trace implementation. 
	 */
    private static function trace( v : Dynamic, ?i : haxe.PosInfos ) {
		// uncomment this part to enable logging. 
		/*untyped {
			var msg = if ( i != null ) i.fileName + ":" + i.lineNumber + ": " else "";
			msg += " " + time() + " - ";
			msg += __unhtml(Std.string(v))+"<br/>";
			var d = document.getElementById("haxe:trace");
			if( d != null )
				d.innerHTML += msg;
		}*/
    }
	
	/*
	private static function __unhtml(s : String) {
		return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	}
	
	public static function time() : String
	{
		return Std.string(Date.now().getTime());
	}
 	*/
}