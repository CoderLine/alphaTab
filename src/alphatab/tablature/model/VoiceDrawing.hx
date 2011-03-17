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
package alphatab.tablature.model;
import alphatab.model.Duration;
import alphatab.model.Note;
import alphatab.model.SongFactory;
import alphatab.model.Tuplet;
import alphatab.model.Voice;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.ViewLayout;

class VoiceDrawing extends Voice
{
    // cache for storing which effects are available in this beat
    public var effectsCache:EffectsCache;
    
    // is there any note displaced?
    public var anyDisplaced:Bool;

    
    public var width:Int;
    
    public var beatGroup:BeatGroup;
    public var tripletGroup:TripletGroup;
    
    public var leftJoin:VoiceDrawing;
    public var rightJoin:VoiceDrawing;
    public var joinedType:JoinedType;
    public var isJoinedGreaterThanQuarter:Bool;
    
    public inline function beatDrawing() : BeatDrawing
    {
        return cast beat;
    }

    public inline function measureDrawing() : MeasureDrawing
    {
        return beatDrawing().measureDrawing();
    }
    
	public function new(factory:SongFactory, index:Int)
    {
        super(factory, index);
        effectsCache = new EffectsCache();
    }
    
    public function getPreviousVoice() : VoiceDrawing
    {
         var previousBeat = beatDrawing().getPreviousBeat();
        // ignore previous beat if it is not in the same line
        if (previousBeat == null)
            return null;
            
        return previousBeat != null ? cast previousBeat.voices[index] : null;
    }
    
    public function getNextVoice() : VoiceDrawing
    {
         var previousBeat = beatDrawing().getNextBeat();
        // ignore previous beat if it is not in the same line
        if (previousBeat == null)
            return null;
            
        return previousBeat != null ? cast previousBeat.voices[index] : null;
    }
    
    public var minNote:NoteDrawing;
    public var maxNote:NoteDrawing;   
    
    public function checkNote(note:NoteDrawing)
    {        
        var bd:BeatDrawing = beatDrawing();
        bd.checkNote(note);

        if (minNote == null || minNote.realValue() > note.realValue())
        {
            minNote = note;
        }
        if (maxNote == null || maxNote.realValue() < note.realValue())
        {
            maxNote = note;
        }
    }
    
    private function compareNotes(a:Note, b:Note) : Int
    {
        if (a.realValue() > b.realValue())
            return 1;
        if (a.realValue() < b.realValue())
            return -1;
        return 0;
    }
    
    public function performLayout(layout:ViewLayout)
    {
        // get default voice width provided by the layout
        width = layout.getVoiceWidth(this);
        effectsCache.reset();
        
        // sort notes ascending
        notes.sort(compareNotes);
        
        anyDisplaced = false;
        var previousNote:NoteDrawing = null;
        for (note in notes)
        {
            var noteDrawing:NoteDrawing = cast note;
            noteDrawing.displaced = ScoreStave.isDisplaced(previousNote, noteDrawing);      
            if (noteDrawing.displaced) 
            {
                anyDisplaced = true;
            }
            noteDrawing.performLayout(layout); 
            previousNote = noteDrawing;
        }
        
        // make space for an additional notehead 
        if (anyDisplaced)
        {
            width += Math.floor(DrawingResources.getScoreNoteSize(layout, false).x);
        }
        
        var previousVoice = getPreviousVoice();
        var nextVoice = getNextVoice();
        
        // check for joins with previous / next beat 
        var noteJoined:Bool = false;
        var withPrevious:Bool = false;
        
        joinedType = JoinedType.NoneRight;
        leftJoin = this;
        rightJoin = this;
        isJoinedGreaterThanQuarter = false;
        
        if (BeatGroup.canJoin(this, previousVoice))
        {
            withPrevious = true;
            
            if (previousVoice.duration.value >= duration.value)
            {
                leftJoin = previousVoice;
                rightJoin = this;
                joinedType = JoinedType.Left;                
                noteJoined = true;
            }
            
            if (previousVoice.duration.value > Duration.QUARTER)
            {
                isJoinedGreaterThanQuarter = true;
            }
        }
        
        if (BeatGroup.canJoin(this, nextVoice))
        {
            if (nextVoice.duration.value >= duration.value)
            {
                rightJoin = nextVoice;
                if (previousVoice == null || previousVoice.isRestVoice() || previousVoice.duration.value < duration.value)
                {
                    leftJoin = this;
                }
                
                noteJoined = true;
                joinedType = JoinedType.Right;                    
            }
            if (nextVoice.duration.value > Duration.QUARTER)
            {
                isJoinedGreaterThanQuarter = true;
            }
        }
        
        if (!noteJoined && withPrevious)
        {
            joinedType = JoinedType.NoneLeft;
        }
        
        // create beat group
        if (!isRestVoice())
        {            
            if (beatGroup == null)
            {
                // if there is no previous voice 
                // we need to create a new group, we also create a new group if 
                // we can't join with the previous group
                if (previousVoice != null && previousVoice.beatGroup != null 
                    && previousVoice.beatGroup.check(this))
                {
                    beatGroup = previousVoice.beatGroup;
                }
                else
                {
                    beatGroup = new BeatGroup();
                    measureDrawing().groups.push(beatGroup);
                    beatGroup.check(this);
                }
            }
        }
        
        
       
        // try to add on tripletgroup of previous beat or create a new group
		if (duration.tuplet != null && !duration.tuplet.equals(Tuplet.NORMAL))
		{
            beatDrawing().effectsCache.triplet = true;
            measureDrawing().effectsCache.triplet = true;
            
            // ignore previous beat if it is not in the same line
            if (previousVoice != null && previousVoice.measureDrawing().staveLine != measureDrawing().staveLine)
                previousVoice == null;
                
			if (previousVoice == null || previousVoice.tripletGroup == null || !previousVoice.tripletGroup.check(this))
			{			
				tripletGroup = new TripletGroup(index);
				tripletGroup.check(this);
			}
			else
			{
				tripletGroup = previousVoice.tripletGroup;
			}
		}
    }
    
}