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
package alphatab.platform.cli;

import alphatab.file.SongLoader;
import alphatab.io.OutputStream;
import alphatab.model.Song;
import alphatab.platform.PlatformFactory;
import alphatab.platform.svg.SvgCanvas;
import alphatab.tablature.model.DrawingSongModelFactory;
import alphatab.tablature.Tablature;
import haxe.Stack;

/**
 * A command line interface for using alphaTab features
 */
class CLI 
{
    private var _tasks:Array<CLITask>;
    
    public var args(default,default):Array<String>;
    
    // delegates for platforms
    public var exit(default,default):Int->Void;
    public var print(default,default):String->Void;
    public var println(default,default):String->Void;
    public var fileExists(default,default):String->Bool;
    public var isDirectory(default,default):String->Bool;
    
    public var openWrite(default,default): String -> OutputStream;
    
    public function new() 
    {
        _tasks = new Array<CLITask>();
        _tasks.push(new ExportTask());
        _tasks.push(new SvgTask());
    }
    
    private function getTask(key:String) : CLITask
    {
        for (task in _tasks)
        {
            if (task.getKey() == key) 
            {
                return task;
            }
        }
        return null;
    }
    
    public function run()
    {
        var task:CLITask = null;
        var inputFile:String = null;
        
        if (args.length < 2)
        {
            error("Error: Invalid argument count");
        }
        
        task = getTask(args[0]);
        if (task == null)
        {
            error("Error: Task could not be found");
        }
        
        inputFile = args[1];
        if (!fileExists(inputFile) || isDirectory(inputFile)) 
        {
            error("Error: The input file is no valid file");
        }
        
        task.setup(this);
        
        // load song model
        println("Reading file");
        try 
        { 
            SongLoader.loadSong(inputFile, new DrawingSongModelFactory(), function(song:Song) {
                task.execute(this, song);
            });
        }
        catch (e:Dynamic)
        {
            error("Could not read model: " + Std.string(e));
        }
    }
    
    public function error(msg:String) 
    {
        printUsage("Error: " + msg);
        exit(1);
    }
           
    
    public function warn(msg:String) 
    {
        printUsage("Warning: " + msg);
    }
        
    private function printUsage(msg:String) 
    {
        println(msg);
        println("alphaTab 0.3 alpha (http://www.alphatab.net)");
        println("    Usage: alphaTab TASK INPUT_FILE [TASK_OPTIONS]");
        println("    TASK  - The ID of the task to execute");
        println("    INPUT_FILE  - The path to the file to read the songmodel from");
        println("    TASK_OPTIONS  - The task specific options");
        println("");
        println("Supported Tasks:");
        for (task in _tasks)
        {
            task.printUsage(this);
            println("");
        }
    }
}