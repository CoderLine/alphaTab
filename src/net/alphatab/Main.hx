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
import net.alphatab.model.Song;
import net.alphatab.tablature.Tablature;


/**
 * The main entry point of this application.
 */
class Main 
{
	/**
	 * The main entry point of this application.
	 */
	static function main() 
	{		
		MyTrace.init();
		var un = haxe.Unserializer.run(haxe.Serializer.run('test'));
	}
}