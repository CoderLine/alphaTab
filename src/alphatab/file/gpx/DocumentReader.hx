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

import alphatab.file.gpx.score.Document;

class DocumentReader 
{
	private var xmlDocument:Xml;
	private var gpxDocument:Document;
	
	public function new(stream:Array<Int>)
	{
		var str = "";
		for(i in stream)
		{
			str += String.fromCharCode(i);
		}
		
		//js.Lib.alert(str);
		
		//xmlDocument = Xml.parse(str);
		//gpxDocument = new Document();		
	}
	
	
}
