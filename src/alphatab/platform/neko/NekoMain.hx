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
package alphatab.platform.neko;

#if neko
import alphatab.file.SongLoader;
import alphatab.model.Song;
import alphatab.platform.PlatformFactory;
import alphatab.platform.svg.SvgCanvas;
import alphatab.tablature.model.DrawingSongModelFactory;
import alphatab.tablature.Tablature;
import neko.Boot;
import neko.FileSystem;
import neko.io.File;
import neko.Lib;
import neko.Sys;

/**
 * The main entry point for the neko app.
 */
class NekoMain 
{
    public static function main()
    {
        //
        // Argument Parsing
        //
        var args = Sys.args();
        
        var inputFile:String = null;
        var outputFile:String = null;
        
        if (args.length != 2)
        {
            error("Error: Invalid argument count");
        }
        
        inputFile = args[0];
        if (!FileSystem.exists(inputFile) || FileSystem.isDirectory(inputFile)) 
        {
            error("Error: The input file is no valid file");
        }
        
        outputFile = args[1];
        if (FileSystem.exists(outputFile) && FileSystem.isDirectory(outputFile))
        {
            error("Error: The output file already exists and is a directory");
        }
        
        // Setup tablature
        var tablature = new Tablature(PlatformFactory.SVG_CANVAS);
        tablature.onLayouted = function() {
            Lib.println("Layouting finished");
            Lib.println("Start rendering");
        }
        tablature.onFinished = function() {
            Lib.println("Rendering finished");
            Lib.println("Writing SVG to file");
            var output = null;
            try 
            {
                output = File.write(outputFile, false);
                var c:SvgCanvas = cast tablature.canvas;
                output.writeString('<?xml version="1.0" encoding="Cp1252"?>');
                output.writeString(c.toSvg(true));
                output.close();
            }
            catch (e:Dynamic)
            {
                error("Could not write file: " + Std.string(e));
                if (output != null)
                {
                    output.close();
                }
            }
        }
        
        // load song model
        Lib.println("Reading file");
        try 
        { 
            SongLoader.loadSong(inputFile, new DrawingSongModelFactory(), function(song:Song) {
                
                // render
                Lib.print("Start layouting");
                try 
                {
                    tablature.setTrack(song.tracks[0]);
                }
                catch (e:Dynamic)
                {
                    error("Could not render tablature: " + Std.string(e));
                }
                
            });
        }
        catch (e:Dynamic)
        {
            error("Could not read model: " + Std.string(e));
        }
    }
    
    static function error(msg:String) 
    {
        printUsage("Error: " + msg);
        Sys.exit(1);
    }
    
    static function printUsage(msg:String) 
    {
        Lib.println(msg);
        Lib.println("alphaTab 0.3 alpha (http://www.alphatab.net)");
        Lib.println("    Usage: alphaTab.n INPUT_FILE OUTPUT_FILE");
        Lib.println("    INPUT_FILE  - The path to the file to read the songmodel from");
        Lib.println("    OUTPUT_FILE  - The path to the file to write the svg into");
    }
}
#end