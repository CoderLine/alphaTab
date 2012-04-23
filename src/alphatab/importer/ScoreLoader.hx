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
import alphatab.platform.IFileLoader;
import alphatab.platform.PlatformFactory;
import haxe.io.Bytes;
import haxe.io.BytesInput;
import haxe.Stack;

/**
 * The ScoreLoader enables you easy loading of Scores using all 
 * available importers
 */
class ScoreLoader 
{
	/**
	 * Loads a score asynchronously from the given datasource
	 * @param	path the source path to load the binary file from
	 * @param	success this function is called if the Score was successfully loaded from the datasource
	 * @param	error this function is called if any error during the loading occured.
	 */
    public static function loadScoreAsync(path:String, success:Score-> Void, error:String->Void)
    {
        var loader:IFileLoader = PlatformFactory.getLoader();        
        loader.loadBinaryAsync(path, 
            function(data:Bytes) : Void
            {
                var importers:Array<ScoreImporter> = ScoreImporter.availableImporters();
                
                for (importer in importers)
                {
                    try
                    {
                        var input:BytesInput = new BytesInput(data);
                        importer.init(input);
                        
                        var score:Score = importer.readScore();
                        success(score);
                        
                        return;
                    }
                    catch (e:Dynamic)
                    {
                        error(Stack.toString(Stack.exceptionStack()));
                        continue;
                    }                    
                }
                
                error("No reader for the requested file found");
            }
            ,
            error
        );

    }
}