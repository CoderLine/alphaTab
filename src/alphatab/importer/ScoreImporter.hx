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
                            for (n in beat.notes)
                            {
                                // connect ties
                                if (n.isTieDestination)
                                {
                                    var tieOrigin:Note = determineTieOrigin(n);
                                    if (tieOrigin == null)
                                    {
                                        n.isTieDestination = false;
                                    }
                                    else
                                    {
                                        tieOrigin.isTieOrigin = true;
                                        n.fret = tieOrigin.fret;
                                    }
                                }
                                
                                // set hammeron/pulloffs
                                if (n.isHammerPullOrigin)
                                {
                                    var hammerPullDestination = determineHammerPullDestination(n);
                                    if (hammerPullDestination == null)
                                    {
                                        n.isHammerPullOrigin = false;
                                    }
                                    else
                                    {
                                        hammerPullDestination.isHammerPullDestination = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
	}
    
    private function determineHammerPullDestination(note:Note) : Note
    {
        var nextBeat:Beat = note.beat.nextBeat;
        while (nextBeat != null)
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
    
    private function determineTieOrigin(note:Note) : Note
    {
        var previousBeat:Beat = note.beat.previousBeat;
        
        while (previousBeat != null)
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