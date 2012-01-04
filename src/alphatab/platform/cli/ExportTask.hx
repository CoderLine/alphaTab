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
import alphatab.midi.MidiDataProvider;
import alphatab.midi.model.MidiFile;
import alphatab.model.Song;
import alphatab.model.Track;
import alphatab.platform.PlatformFactory;
import alphatab.platform.svg.SvgCanvas;
import alphatab.tablature.model.BeatDrawing;
import alphatab.tablature.model.DrawingSongModelFactory;
import alphatab.tablature.model.MeasureDrawing;
import alphatab.tablature.Tablature;
import haxe.Stack;

/**
 * This task performs an export that includes all data 
 * to create a third party gui application:
 *  - SVG Renderings of the specified tracks
 *  - A midi file storing the audio data
 *  - A metadata file which stores additional infos like 
 *     - Basic song information
 *     - Which miditrack is which song track
 *     - UI-Regions of the measures and beats
 */
class ExportTask implements CLITask
{
    private var _tracks:Array<Int>;
    private var _trackData:Array<String>;
    
    private var _svg:String;
    private var _layout:String;
    private var _zoom:Float;
    
    private var _midi:String;
    private var _meta:String;
    
    
    public function new() 
    {
        _layout = "page";
        _zoom = 1.1;
    }
        
    public function getKey()
    {
        return "export";
    }
    
    public function printUsage(cli:CLI)
    {
        cli.println("export - Export the metadata");
        cli.println("    Options: ");
        cli.println("    -svg SvgFile : The output path for the svg file (optional, use $T as placeholder for track number)");
        cli.println("    -layout Layout : The layout engine to use");
        cli.println("    -midi MidiFile : The output path for the midi file (optional)");
        cli.println("    -meta MetaFile : The output path for the meta file (optional)");
    } 
    
    public function setup(cli:CLI)
    {
        // parse arguments
        var i = 0;
        while (i < cli.args.length)
        {
            if (cli.args[i] == "-t")
            {
                if (i >= cli.args.length) cli.error("Error: missing track indices");
                
                i++;
                
                var tracks = cli.args[i].split(",");
                _tracks = new Array<Int>();
                for (t in tracks)
                {
                    try 
                    {
                        var index = Std.parseInt(t);
                        if (index == null || index < 0)
                        {
                            cli.warn("Warning: Invalid track index: " +t);
                        }
                        else
                        {
                            _tracks.push(index);
                        }
                    }
                    catch (e:Dynamic)
                    {
                        cli.warn("Warning: Invalid track index: " +t);
                    }
                }
            }
            else if (cli.args[i] == "-svg")
            {
                if (i >= cli.args.length) cli.error("Error: missing svg path");
                
                i++;
                _svg = cli.args[i];
                
                if (_svg.indexOf("$T") < 0) 
                {
                    cli.error("Error: The svg file '"+_svg+"' does not contain a $T placeholder");
                }
                
                if (cli.fileExists(_svg) && cli.isDirectory(_svg))
                {
                    cli.error("Error: The svg file '"+_svg+"' already exists and is a directory");
                }
            }
            else if (cli.args[i] == "-layout")
            {
                if (i >= cli.args.length) cli.error("Error: missing layout value");
                
                i++;
                _layout = cli.args[i];
            }
            else if (cli.args[i] == "-midi")
            {
                if (i >= cli.args.length) cli.error("Error: missing midi path");
                
                i++;
                _midi = cli.args[i];
                
                if (cli.fileExists(_midi) && cli.isDirectory(_midi))
                {
                    cli.error("Error: The midi file '"+_midi+"' already exists and is a directory");
                }
            }
            else if (cli.args[i] == "-meta")
            {
                if (i >= cli.args.length) cli.error("Error: missing svg path");
                
                i++;
                _meta = cli.args[i];
                
                if (cli.fileExists(_meta) && cli.isDirectory(_meta))
                {
                    cli.error("Error: The svg file '"+_meta+"' already exists and is a directory");
                }
            }
            i++;
        }
    }
    
    public function execute(cli:CLI, song:Song)
    {
        // Setup tablature
        try 
        { 
            if (_tracks == null)
            {
                _tracks = new Array<Int>();
                for (i in 0 ... song.tracks.length)
                {
                    _tracks.push(i);
                }
            }
            
            if (_svg != null)
            {
                processSvg(cli, song);
            }
            
            if (_midi != null)
            {
                processMidi(cli, song);
            }
            
            if (_meta != null)
            {
                processMeta(cli, song);
            }
        }
        catch (e:Dynamic)
        {
            cli.error("Error: Could not render file: " + Std.string(e));
        }
    }
    
    private function processSvg(cli:CLI, song:Song)
    {
        try 
        {
            cli.println("Start tablature rendering");
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
                    var out:OutputStream = cli.openWrite(StringTools.replace(_svg, "$T", Std.string(tablature.track.number - 1)));
                    c.writeTo(out, true);
                    out.flush();
                    out.close();
                }
                catch (e:Dynamic)
                {
                    cli.warn("Error: Could not write file: " + Std.string(e));
                }
                
                if (_meta != null)
                {
                    processTrackMeta(tablature);
                }
            }
            
            for (t in _tracks)
            {
                if (t < 0 || t >= song.tracks.length)
                {
                    cli.warn("Error: Invalid track index: " + t + " (skipping)");
                }
                else
                { 
                    cli.println("Rendering track index: " + t );
                    tablature.setTrack(song.tracks[t]);
                }
            }
        }
        catch (e:Dynamic)
        {
            cli.error("Error: Could not render file: " + Std.string(e));
        }
    }
    
    private function processMidi(cli:CLI, song:Song)
    {
        try
        {
            cli.println("Generating midi file"); 
            var midiFile:MidiFile = MidiDataProvider.getSongMidiFile(song, new DrawingSongModelFactory());
            
            cli.println("Writing midi file");
            var stream:OutputStream = cli.openWrite(_midi);
            midiFile.writeTo(stream);
            stream.close();
        }
        catch (e:Dynamic)
        {
            cli.error("Error: Could not generate midi file: " + e);
        }
    }

    private function processMeta(cli:CLI, song:Song)
    {
        var out = cli.openWrite(_meta);
        
        try
        {
            out.writeString('<?xml version="1.0" encoding="Cp1252"?>');
            out.writeString('<Meta>');
                out.writeString('<SongInfo>');
                    out.writeString('<Title>');
                        out.writeString(song.title);
                    out.writeString('</Title>');
                    out.writeString('<Subtitle>');
                        out.writeString(song.subtitle);
                    out.writeString('</Subtitle>');
                    out.writeString('<Artist>');
                        out.writeString(song.artist);
                    out.writeString('</Artist>');
                    out.writeString('<Album>');
                        out.writeString(song.album);
                    out.writeString('</Album>');
                    out.writeString('<Words>');
                    out.writeString(song.words);
                    out.writeString('</Words>');
                    out.writeString('<Music>');
                    out.writeString(song.music);
                    out.writeString('</Music>');
                    out.writeString('<Copyright>');
                    out.writeString(song.copyright);
                    out.writeString('</Copyright>');
                    out.writeString('<Tab>');
                    out.writeString(song.tab);
                    out.writeString('</Tab>');
                    out.writeString('<Instructions>');
                    out.writeString(song.instructions);
                    out.writeString('</Instructions>');
                    out.writeString('<Notice>');
                    out.writeString(song.notice);
                    out.writeString('</Notice>');
                    out.writeString('<Tempo>');
                    out.writeAsString(song.tempo);
                    out.writeString('</Tempo>');
                out.writeString('</SongInfo>');
                out.writeString('<Tracks>');
                if (_trackData != null)
                {
                    for (t in _trackData)
                    {
                        out.writeString(t);
                    }
                }
                else
                {
                    for (t in song.tracks)
                    {
                        processTrackMetaSimple(out, t);
                    }
                }
                _trackData = null;
                out.writeString('</Tracks>');
            out.writeString('</Meta>');
        }
        catch (e:Dynamic)
        {
            cli.error("Error: Could not write meta file: " + e);
        }
    }

    private function processTrackMeta(tablature:Tablature)
    {
        if (_trackData == null) 
        {
            _trackData = new Array<String>();
        }
        
        var buf = new StringBuf();
        
        buf.add('<Track number="');
        buf.add(tablature.track.number);
        buf.add('" title="');
        buf.add(tablature.track.name);
        buf.add('" color="');
        buf.add(tablature.track.color.asRgbString());
        buf.add('" strings="');
        buf.add(tablature.track.stringCount());
        buf.add('" percussion="');
        buf.add(tablature.track.channel.isPercussionChannel());
        buf.add('" instrument="');
        buf.add(tablature.track.channel.instrument());
        buf.add('">');
        
        var lines = tablature.viewLayout.getLines();
        for (l in lines)
        {
            var h = l.getHeight();
            var y = l.y;
            for (m in l.measures)
            {
                var measure:MeasureDrawing = cast tablature.track.measures[m];
                var x = l.x + measure.x;
                var w = measure.width + measure.spacing;
                
                buf.add('<Measure number="');
                buf.add(measure.number());
                buf.add('bounds="');
                buf.add(x);
                buf.add(',');
                buf.add(y);
                buf.add(',');
                buf.add(w);
                buf.add(',');
                buf.add(h);
                buf.add('" start="');
                buf.add(measure.start());
                buf.add('">');
                
                for (b in measure.beats)
                {
                    var beat:BeatDrawing = cast b;
                    
                    x = x + beat.x;
                    w = beat.fullWidth();
                    buf.add('<Beat bounds="');
                    buf.add(x);
                    buf.add(',');
                    buf.add(y);
                    buf.add(',');
                    buf.add(w);
                    buf.add(',');
                    buf.add(h);
                    buf.add('" start="');
                    buf.add(beat.start);
                    if (beat.text != null)
                    {
                        buf.add('" text="');
                        buf.add(beat.text.value);
                    }
                    buf.add('" />');
                }
                
                
                
                buf.add('</Measure>');
            }
        }
        
        buf.add('</Track>');
        
        _trackData.push(buf.toString());        
    }

    private function processTrackMetaSimple(out:OutputStream, track:Track)
    {
        out.writeString('<Track number="');
        out.writeAsString(track.number);
        out.writeString('" title="');
        out.writeString(track.name);
        out.writeString('" color="');
        out.writeString(track.color.asRgbString());
        out.writeString('" strings="');
        out.writeAsString(track.stringCount());
        out.writeString('" percussion="');
        out.writeAsString(track.channel.isPercussionChannel());
        out.writeString('" instrument="');
        out.writeAsString(track.channel.instrument());
        out.writeString('">');
        
        for (m in track.measures)
        {
            var measure:MeasureDrawing = cast m;
            
            out.writeString('<Measure number="');
            out.writeAsString(measure.number());
            out.writeString('" start="');
            out.writeAsString(measure.start());
            out.writeString('">');
            
            for (b in measure.beats)
            {
                var beat:BeatDrawing = cast b;
                
                out.writeString('<Beat start="');
                out.writeAsString(beat.start);
                if (beat.text != null)
                {
                    out.writeString('" text="');
                    out.writeString(beat.text.value);
                }
                out.writeString('" />');
            }
            
            out.writeString('</Measure>');
        }
        
        out.writeString('</Track>');
    }
}