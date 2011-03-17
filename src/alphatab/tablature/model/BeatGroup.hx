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
import alphatab.model.SongManager;
import alphatab.model.VoiceDirection;

/**
 * A beatgroup contains a set of notes which are grouped by bars.
 */
class BeatGroup 
{
    private static var SCORE_MIDDLE_KEYS:Array<Int> = [ 55, 40, 40, 50 ];
        
    private var _voices:Array<VoiceDrawing>;
    
    private var _lastVoice:VoiceDrawing;
    
    // the first min note within this group
	public var firstMinNote:NoteDrawing;
    // the first max note within this group
	public var firstMaxNote:NoteDrawing;
    // the last min note within this group
	public var lastMinNote:NoteDrawing;
    // the last max note within this group
	public var lastMaxNote:NoteDrawing;
    // the overall min note within this group
	public var minNote:NoteDrawing;
    // the overall max note within this group
	public var maxNote:NoteDrawing;    
    
    public var isPercussion:Bool;
    
    public function new() 
    { 
        _voices = new Array<VoiceDrawing>();
    }
 
    public function getDirection()
    { 
        var max:Float = Math.abs(getNoteValueForPosition(minNote) - (SCORE_MIDDLE_KEYS[_voices[0].measureDrawing().clef] + 100));
        var min:Float = Math.abs(getNoteValueForPosition(maxNote) - (SCORE_MIDDLE_KEYS[_voices[0].measureDrawing().clef] - 100));
        return max > min ? VoiceDirection.Up : VoiceDirection.Down;
    }
    
    private function getNoteValueForPosition(note:Note) 
	{
	   if(note.voice.beat.measure.track.isPercussionTrack) 
	   {
	       return PercussionMapper.getValue(note);
	   }
	   else
	   {
	       return note.realValue();
       }
	}
    
    public function check(voice:VoiceDrawing) : Bool
    {
        if(voice.beat.measure.track.isPercussionTrack)
	    {
	       isPercussion = true;
	    }
        
        // allow adding if there are no voices yet
        var add:Bool = false;
        if (_voices.length == 0)
        {
            add = true;
        }
        else if (canJoin(_lastVoice, voice)) 
        {
            add = true;
        }
        
        if (add)
        {
            _lastVoice = voice;
            _voices.push(voice);
            checkNote(voice.minNote);
            checkNote(voice.maxNote);
        }
        
        return add;
    }
    
    private function checkNote(note:NoteDrawing)
    {
        var value:Int = note.realValue();

		// detect the smallest note which is at the beginning of this group
		if (firstMinNote == null || note.voice.beat.start < firstMinNote.voice.beat.start)
		{
			firstMinNote = note;
		}
		else if (note.voice.beat.start == firstMinNote.voice.beat.start)
		{
			if (note.realValue() < firstMinNote.realValue())
			{
				firstMinNote = note;
			}
		}
        
        // detect the biggest note which is at the beginning of this group
		if (firstMaxNote == null || note.voice.beat.start < firstMaxNote.voice.beat.start)
		{
			firstMaxNote = note;
		}
		else if (note.voice.beat.start == firstMaxNote.voice.beat.start)
		{
			if (note.realValue() > firstMaxNote.realValue())
			{
				firstMaxNote = note;
			}
		}

        // detect the smallest note which is at the end of this group
		if (lastMinNote == null || note.voice.beat.start > lastMinNote.voice.beat.start)
		{
			lastMinNote = note;
		}
		else if (note.voice.beat.start == lastMinNote.voice.beat.start)
		{
			if (note.realValue() < lastMinNote.realValue())
			{
				lastMinNote = note;
			}
		}
        // detect the biggest note which is at the end of this group
		if (lastMaxNote == null || note.voice.beat.start > lastMaxNote.voice.beat.start)
		{
			lastMaxNote = note;
		}
		else if (note.voice.beat.start == lastMaxNote.voice.beat.start)
		{
			if (note.realValue() > lastMaxNote.realValue())
			{
				lastMaxNote = note;
			}
		}

		if (maxNote == null || value > maxNote.realValue())
		{
			maxNote = note;
		}
		if (minNote == null || value < minNote.realValue())
		{
			minNote = note;
		}
    }
    
    public static function canJoin(v1:VoiceDrawing, v2:VoiceDrawing)
    {
        // is this a voice we can join with?
        if (v1 == null || v2 == null || v1.isRestVoice() || v2.isRestVoice())
        {
            return false;
        } 
        
        var m1 = v1.measureDrawing();
        var m2 = v2.measureDrawing();
        // only join on same measure
        if (m1 != m2) return false;
        
        // get times of those voices and check if the times 
        // are in the same division
        var start1 = v1.beat.start;
        var start2 = v2.beat.start;
        
        // we can only join 8th, 16th, 32th and 64th voices
        if (v1.duration.value < Duration.EIGHTH || v2.duration.value < Duration.EIGHTH)
        {
            // other voices only get a beam if they are on the same voice
            return start1 == start2;
        }
        
        // we have two 8th, 16th, 32th and 64th voices
        // a division can contains a single quarter
        var divisionLength = SongManager.getDivisionLength(m1.header);
        
        // check if they are on the same division 
        var division1 = Math.floor((divisionLength + start1) / divisionLength);
        var division2 = Math.floor((divisionLength + start2) / divisionLength);
        
        return division1 == division2;
    }
    
}