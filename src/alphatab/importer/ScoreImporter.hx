package alphatab.importer;
import alphatab.model.Score;
import haxe.io.BytesInput;


class ScoreImporter 
{
    private var _data:BytesInput;
    
    public static function availableReaders() : Array<ScoreImporter>
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