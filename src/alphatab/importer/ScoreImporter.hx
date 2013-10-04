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
    public static var UNSUPPORTED_FORMAT = "unsupported file";
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
        while (nextBeat != null && nextBeat.voice.bar == note.beat.voice.bar)
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
        while (previousBeat != null && previousBeat.voice.bar == note.beat.voice.bar)
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