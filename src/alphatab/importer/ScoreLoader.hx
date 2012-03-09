package alphatab.importer;

import alphatab.model.Score;
import alphatab.platform.IFileLoader;
import alphatab.platform.PlatformFactory;
import haxe.io.Bytes;
import haxe.io.BytesInput;
import haxe.Stack;

class ScoreLoader 
{
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