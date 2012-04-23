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
import alphatab.model.Score;
import haxe.io.BytesInput;

/**
 * This is the base class for creating new song importers which 
 * enable reading scores from any binary datasource
 */
class ScoreImporter 
{
    #if unit public #else private #end var _data:BytesInput;
    
	/**
	 * Gets all default ScoreImporters
	 * @return
	 */
    public static function availableImporters() : Array<ScoreImporter>
    {
        var scoreImporter = new Array<ScoreImporter>();
        scoreImporter.push(new Gp3To5Importer());
        // scoreImporter.push(new GpXImporter());
        return scoreImporter;
    }
    
    public function new() 
    {
    }
    
    public function init(data:BytesInput)
    {
        _data = data;
    }
    
    public function readScore() : Score
    {
        return null;
    }
}   