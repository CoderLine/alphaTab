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
import alphatab.io.OutputStream;
import alphatab.model.Song;
import alphatab.platform.PlatformFactory;
import alphatab.platform.svg.SvgCanvas;
import alphatab.tablature.Tablature;

/**
 * This CLI task allows rendering of tablatures into SVG files. 
 */ 
class SvgTask implements CLITask
{
    private var _outputFile:String;
    private var _trackIndex:Int;
    private var _zoom:Float;
    private var _layout:String;
    
    public function new() 
    {
        _trackIndex = 0;
        _zoom = 1.1;
        _layout = "page";
        _outputFile = null;
    }
    
    public function getKey()
    {
        return "svg";
    }
    
    public function printUsage(cli:CLI)
    {
        cli.println("svg - Render SVG tablature");
        cli.println("    Options: ");
        cli.println("    -out File : Path to SVG file");
        cli.println("    -zoom Zoomlevel : Sets the zoom level (1 = 100%, 0.5 = 50%,..)");
        cli.println("    -track Trackindex : The index of the track to render");
        cli.println("    -layout Layoutengine : Sets the layout engine (page, horizontal,..) ");
    }
    
    public function setup(cli:CLI)
    {
        // parse arguments
        var i = 0;
        while (i < cli.args.length)
        {
            if (cli.args[i] == "-out")
            {
                if (i >= cli.args.length) cli.error("Error: missing output file");
                
                i++;
                _outputFile = cli.args[i];
                
                if (cli.fileExists(_outputFile) && cli.isDirectory(_outputFile))
                {
                    cli.error("Error: The output file '"+_outputFile+"' already exists and is a directory");
                }
            }
            else if (cli.args[i] == "-zoom")
            {
                if (i >= cli.args.length) cli.error("Error: missing zoom value");
                
                i++;
                try 
                {
                    _zoom = Std.parseFloat(cli.args[i]);
                }
                catch (e:Dynamic)
                {
                    cli.error("Error: Invalid zoom value: " + cli.args[i]);
                }
            }
            else if (cli.args[i] == "-track")
            {
                if (i >= cli.args.length) cli.error("Error: missing track index");
                
                i++;
                try 
                {
                    _trackIndex = Std.parseInt(cli.args[i]);
                }
                catch (e:Dynamic)
                {
                    cli.error("Error: Invalid track index: " + cli.args[i]);
                }
            }
            else if (cli.args[i] == "-layout")
            {
                if (i >= cli.args.length) cli.error("Error: missing layout value");
                
                i++;
                _layout = cli.args[i];
            }
            i++;
        }
        
        // valdiate existing settings
        if (_outputFile == null)
        {
            cli.error("Error: no output file specified!");
        }
    }
    
    public function execute(cli:CLI, song:Song)
    {
        // Setup tablature
        try 
        {
            var tablature = new Tablature(PlatformFactory.SVG_CANVAS);
            tablature.updateScale(_zoom);
            tablature.setViewLayoutByKey(_layout);
            tablature.onLayouted = function() 
            {
                cli.println("Layouting finished");
                cli.println("Start rendering");
            }
            tablature.onFinished = function() 
            {
                cli.println("Rendering finished");
                cli.println("Writing SVG to file");
                
                try 
                {
                    var output = new StringBuf();
                    output.add('<?xml version="1.0" encoding="Cp1252"?>');
                    var c:SvgCanvas = cast tablature.canvas;
                    
                    var out:OutputStream = cli.openWrite(_outputFile);
                    c.writeTo(out, true);
                    out.flush();
                    out.close();
                }
                catch (e:Dynamic)
                {
                    cli.error("Error: Could not write file: " + Std.string(e));
                }
            }
            if (_trackIndex < 0 || _trackIndex >= song.tracks.length)
            {
                cli.error("Error: Invalid track index");
            }
            tablature.setTrack(song.tracks[_trackIndex]);
        }
        catch (e:Dynamic)
        {
            cli.error("Error: Could not render file: " + Std.string(e));
        }
    }
}