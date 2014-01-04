/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
package alphatab.importer;

import alphatab.model.AccidentalType;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.Score;
import alphatab.model.SlideType;
import alphatab.util.LazyVar;
import haxe.io.Bytes;
import haxe.io.BytesInput;

/**
 * This is the base class for creating new song importers which 
 * enable reading scores from any binary datasource
 */
class ScoreImporter 
{
    public static var UnsupportedFormat = "unsupported file";
    #if unit public #else private #end var _data:BytesInput;
        
    /**
     * Gets all default ScoreImporters
     * @return
     */
    public static function availableImporters() : Array<ScoreImporter>
    {
        var scoreImporter = new Array<ScoreImporter>();
        scoreImporter.push(new Gp3To5Importer());
        scoreImporter.push(new AlphaTexImporter());
        scoreImporter.push(new GpxImporter());
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
    
    private function finish(score:Score)
    {
        // iterate over full model and connect/determine stuff
        // TODO[performance]: maybe we can cache this data during creation 
        for (t in score.tracks)
        {
            if (t.shortName == null || t.shortName.length == 0)
            {
                t.shortName = t.name;
                if (t.shortName.length > 10) t.shortName = t.shortName.substr(0, 10);
            }

            if (!t.isPercussion)
            {
                for (bar in t.bars)
                {
                    for (v in bar.voices)
                    {
                        for (beat in v.beats)
                        {
                            if (beat.voice.bar.index == 0 && beat.index == 0)
                            {
                                beat.start = 0;
                                beat.previousBeat = null;
                            }
                            else
                            {
                                if (beat.index == 0)
                                {
                                    beat.previousBeat = bar.previousBar.voices[v.index].beats[bar.previousBar.voices[v.index].beats.length - 1];
                                }
                                else
                                {
                                    beat.previousBeat = v.beats[beat.index - 1];
                                }
                                beat.previousBeat.nextBeat = beat;
                                beat.start = beat.previousBeat.start + beat.previousBeat.calculateDuration();
                            }
                            
                            for (n in beat.notes)
                            {
                                var nextNoteOnLine = new LazyVar<Note>(function() { return nextNoteOnSameLine(n); });
                                var prevNoteOnLine = new LazyVar<Note>(function() { return previousNoteOnSameLine(n); });
                                // connect ties
                                if (n.isTieDestination)
                                {                                    
                                    if (prevNoteOnLine.getValue() == null)
                                    {
                                        n.isTieDestination = false;
                                    }
                                    else
                                    {
                                        n.tieOrigin = prevNoteOnLine.getValue();
                                        n.tieOrigin.isTieOrigin = true;
                                        n.fret = n.tieOrigin.fret;
                                    }
                                }
                                
                                // set hammeron/pulloffs
                                if (n.isHammerPullOrigin)
                                {
                                    if (nextNoteOnLine.getValue() == null)
                                    {
                                        n.isHammerPullOrigin = false;
                                    }
                                    else
                                    {
                                        nextNoteOnLine.getValue().isHammerPullDestination = true;
                                        nextNoteOnLine.getValue().hammerPullOrigin = n;
                                    }
                                }
                                
                                // set slides
                                if (n.slideType != SlideType.None)
                                {
                                    n.slideTarget = nextNoteOnLine.getValue();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    private function nextNoteOnSameLine(note:Note) : Note
    {
        var nextBeat:Beat = note.beat.nextBeat;
        // keep searching in same bar
        while (nextBeat != null && nextBeat.voice.bar.index <= note.beat.voice.bar.index + 3)
        {
            var noteOnString = nextBeat.getNoteOnString(note.string);
            if (noteOnString != null)
            {
                return noteOnString;
            }
            else
            {
                nextBeat = nextBeat.nextBeat;
            }
        }
        
        return null;
    }
    
    private function previousNoteOnSameLine(note:Note) : Note
    {
        var previousBeat:Beat = note.beat.previousBeat;
        
        // keep searching in same bar
        while (previousBeat != null && previousBeat.voice.bar.index >= note.beat.voice.bar.index - 3)
        {
            var noteOnString = previousBeat.getNoteOnString(note.string);
            if (noteOnString != null)
            {
                return noteOnString;
            }
            else
            {
                previousBeat = previousBeat.previousBeat;
            }
        }
        
        return null;
    }
}   