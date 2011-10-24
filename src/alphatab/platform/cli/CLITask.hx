package alphatab.platform.cli;
import alphatab.model.Song;

/**
 * The base interface for creating CLI tasks
 */
interface CLITask 
{
    public function getKey() : String;
    public function setup(cli:CLI) : Void;
    public function execute(cli:CLI, song:Song) : Void;
    public function printUsage(cli:CLI) : Void;
}