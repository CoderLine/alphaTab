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

import alphatab.Environment;
import alphatab.model.Score;
import alphatab.platform.IFileLoader;
import haxe.CallStack;
import haxe.io.Bytes;
import haxe.io.BytesInput;

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
        var loader:IFileLoader = Environment.fileLoaders.get("default")();
        loader.loadBinaryAsync(path, 
            function(data:Bytes) : Void
            {
                var importers:Array<ScoreImporter> = ScoreImporter.availableImporters();
                
                var score:Score = null;
                for (importer in importers)
                {
                    try
                    {
                        var input:BytesInput = new BytesInput(data);
                        importer.init(input);
                        
                        score = importer.readScore();                        
                        break;
                    }
                    catch (e:Dynamic)
                    {
                        if (e == ScoreImporter.UNSUPPORTED_FORMAT)
                        {
                            continue;
                        }
                        else
                        {
                            error(e);
                        }
                    }                    
                }
                
                if (score != null)
                {
                    success(score);
                }
                else
                {
                    error("No reader for the requested file found");
                }
            }
            ,
            error
        );
    }	
    
    /**
	 * Loads a score synchronously from the given datasource
	 * @param	path the source path to load the binary file from
	 * @param	success this function is called if the Score was successfully loaded from the datasource
	 * @param	error this function is called if any error during the loading occured.
	 */
    public static function loadScore(path:String) : Score
    {
        var loader:IFileLoader = Environment.fileLoaders.get("default")();
        var data = loader.loadBinary(path);
                
        var importers:Array<ScoreImporter> = ScoreImporter.availableImporters();
                
        var score:Score = null;
        for (importer in importers)
        {
            try
            {
                var input:BytesInput = new BytesInput(data);
                importer.init(input);
                
                score = importer.readScore();                        
                break;
            }
            catch (e:Dynamic)
            {
                if (e == ScoreImporter.UNSUPPORTED_FORMAT)
                {
                    continue;
                }
                else
                {
                    throw e;
                }
            }                    
        }
        
        if (score != null)
        {
            return score;
        }
        else
        {
            throw "No reader for the requested file found";
        }
    }
}