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
package alphatab.rendering.utils;

import alphatab.audio.MidiUtils;
import alphatab.model.Bar;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Note;
import alphatab.model.Track;
import alphatab.model.Voice;
import haxe.ds.IntMap;

using alphatab.model.ModelUtils;

enum BeamDirection
{
    Up;
    Down;
}

/**
 * Lists all types how two voices can be joined with bars.
 */
enum BeamBarType 
{
    /**
     * Full Bar from current to next
     */
    Full;
    /**
     * A small Bar from current to previous
     */
    PartLeft;
    /**
     * A small bar from current to next
     */
    PartRight;
}

typedef BeatLinePositions = {
    up:Int,
    down:Int
}

/**
 * This class helps drawing beams and bars for notes.
 * 
 */
class BeamingHelper 
{
    private static var ScoreMiddleKeys:Array<Int> = [ 48, 45, 38, 59 ];

    public var voice:Voice;
    public var beats:Array<Beat>;
    private var _lastBeat:Beat;
    
    public var maxDuration:Duration;
    
    /**
     * the first min note within this group
     */
    public var firstMinNote:Note;
    /**
     * the first max note within this group
     */
    public var firstMaxNote:Note;
    
    /**
     * the last min note within this group
     */
    public var lastMinNote:Note;
    /**
     * the last max note within this group
     */
    public var lastMaxNote:Note;
    
    /**
     * the overall min note within this group
     */
    public var minNote:Note;
    /**
     * the overall max note within this group
     */
    public var maxNote:Note;
    
    private var _track:Track;
    public function new(track:Track)
    {
        beats = new Array<Beat>();
        _track = track;
        _beatLineXPositions = new IntMap<BeatLinePositions>();
        maxDuration = Duration.Whole;
    }
    
    private function getValue(n:Note)
    {
        if (_track.isPercussion)
        {
            return PercussionMapper.mapValue(n);
        }
        else
        {
            return n.realValue();
        }
    }
    
    // stores the X-positions for beat indices
    private var _beatLineXPositions:IntMap<BeatLinePositions>;
    
    public function getBeatLineX(beat:Beat)
    {
        if (_beatLineXPositions.exists(beat.index)) 
        {
            if (getDirection() == BeamDirection.Up)
            {
                return _beatLineXPositions.get(beat.index).up;
            }
            else
            {
                return _beatLineXPositions.get(beat.index).down;
            }
        }
        return 0;
    }
    
    public function registerBeatLineX(beat:Beat, up:Int, down:Int)
    {
        _beatLineXPositions.set(beat.index, {up:up, down:down});
    }
    
    public function getDirection() : BeamDirection
    { 
        // multivoice handling
#if MULTIVOICE_SUPPORT
        if (voice.index > 0)
        {
            return Down;
        }
        if (voice.bar.voices.length > 1)
        {
            for (v in 1 ... voice.bar.voices.length)
            {
                if (!voice.bar.voices[v].isEmpty())
                {
                    return Up;
                }
            }
        }
#end
        // the average key is used for determination
        //      key lowerequal than middle line -> up
        //      key higher than middle line -> down
        var avg = Std.int((getValue(maxNote) + getValue(minNote)) / 2);
        return avg <= ScoreMiddleKeys[Type.enumIndex(_lastBeat.voice.bar.clef) - 1] ? Up : Down;
    }
     
    public function checkBeat(beat:Beat) : Bool
    {
        if (voice == null)
        {
            voice = beat.voice;
        }
        // allow adding if there are no beats yet
        var add:Bool = false;
        if (beats.length == 0)
        {
            add = true;
        }
        else if (canJoin(_lastBeat, beat)) 
        {
            add = true;
        }
        
        if (add)
        {
            _lastBeat = beat;
            beats.push(beat);
            checkNote(beat.minNote());
            checkNote(beat.maxNote());
            if (maxDuration.getDurationValue() < beat.duration.getDurationValue()) 
            {
                maxDuration = beat.duration;
            }
        }
        
        return add;
    }    
    
    private function checkNote(note:Note)
    {
        var value:Int = note.realValue();

        // detect the smallest note which is at the beginning of this group
        if (firstMinNote == null || note.beat.index  < firstMinNote.beat.index)
        {
            firstMinNote = note;
        }
        else if (note.beat.index == firstMinNote.beat.index)
        {
            if (note.realValue() < firstMinNote.realValue())
            {
                firstMinNote = note;
            }
        }
        
        // detect the biggest note which is at the beginning of this group
        if (firstMaxNote == null || note.beat.index < firstMaxNote.beat.index)
        {
            firstMaxNote = note;
        }
        else if (note.beat.index == firstMaxNote.beat.index)
        {
            if (note.realValue() > firstMaxNote.realValue())
            {
                firstMaxNote = note;
            }
        }

        // detect the smallest note which is at the end of this group
        if (lastMinNote == null || note.beat.index > lastMinNote.beat.index)
        {
            lastMinNote = note;
        }
        else if (note.beat.index == lastMinNote.beat.index)
        {
            if (note.realValue() < lastMinNote.realValue())
            {
                lastMinNote = note;
            }
        }
        // detect the biggest note which is at the end of this group
        if (lastMaxNote == null || note.beat.index > lastMaxNote.beat.index)
        {
            lastMaxNote = note;
        }
        else if (note.beat.index == lastMaxNote.beat.index)
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
    
    public function calculateBeamY(stemSize:Int, xCorrection:Int, xPosition:Int, scale:Float, yPosition: Note-> Int) : Int
    {
        // create a line between the min and max note of the group
        var direction = getDirection();
        
        if (beats.length == 1)
        {
            if (getDirection() == Up)
            {
                return yPosition(maxNote) - stemSize;
            }
            else
            {
                return yPosition(minNote) + stemSize;
            }
        }
        
        // we use the min/max notes to place the beam along their real position        
        // we only want a maximum of 10 offset for their gradient
        var maxDistance:Int = Std.int(10 * scale);

        
        // if the min note is not first or last, we can align notes directly to the position
        // of the min note
        if (direction == Down && minNote != firstMinNote && minNote != lastMinNote)
        {
            return yPosition(minNote) + stemSize;
        }
        else if (direction == Up && maxNote != firstMaxNote && maxNote != lastMaxNote)
        {
            return yPosition(maxNote) - stemSize;
        }
        
        var startX = getBeatLineX(firstMinNote.beat) + xCorrection;
        var startY = direction == Up 
                        ? yPosition(firstMaxNote) - stemSize
                        : yPosition(firstMinNote) + stemSize;
        
        var endX = getBeatLineX(lastMaxNote.beat) + xCorrection;
        var endY = direction == Up 
                        ? yPosition(lastMaxNote) - stemSize
                        : yPosition(lastMinNote) + stemSize;
                        
        // ensure the maxDistance
        if (direction == Down && startY > endY && (startY - endY) > maxDistance) endY = (startY - maxDistance);
        if (direction == Down && endY > startY && (endY - startY) > maxDistance) startY = (endY - maxDistance);
                    
        if (direction == Up && startY < endY && (endY - startY) > maxDistance) endY = (startY + maxDistance);
        if (direction == Up && endY < startY && (startY - endY) > maxDistance) startY = (endY + maxDistance);
                    
        // get the y position of the given beat on this curve
        
        // y(x)  = ( (y2 - y1) / (x2 - x1) )  * (x - x1) + y1;
        return Std.int(( (endY - startY) / (endX - startX) ) * (xPosition - startX) + startY);
    }
    
    // TODO: Check if this beaming is really correct, I'm not sure if we are connecting beats correctly
    private static function canJoin(b1:Beat, b2:Beat)
    {
        // is this a voice we can join with?
        if (b1 == null || b2 == null || b1.isRest() || b2.isRest())
        {
            return false;
        } 
        
        var m1 = b1.voice.bar;
        var m2 = b1.voice.bar;
        // only join on same measure
        if (m1 != m2) return false;
        
        // get times of those voices and check if the times 
        // are in the same division
        var start1 = b1.start;
        var start2 = b2.start;
        
        // we can only join 8th, 16th, 32th and 64th voices
        if (!canJoinDuration(b1.duration) || !canJoinDuration(b2.duration))
        {
            return start1 == start2;
        }
        
        
        // TODO: create more rules for automatic beaming
        var divisionLength:Int = MidiUtils.QuarterTime;
        switch (m1.getMasterBar().timeSignatureDenominator)
        {
            case 8:
                if (m1.getMasterBar().timeSignatureNumerator % 3 == 0)
                {
                    divisionLength += Math.floor(MidiUtils.QuarterTime / 2);
                }
        }

        // check if they are on the same division 
        var division1 = Std.int((divisionLength + start1) / divisionLength);
        var division2 = Std.int((divisionLength + start2) / divisionLength);
        
        return division1 == division2;
    }   
    
    private static function calculateDivision(b:Beat, l:Int)
    {
        var start = 0; 
    }
    
    private static function canJoinDuration(d:Duration)
    {
        switch (d) 
        {
            case Whole, Half, Quarter: return false;
            default: return true;
        }
    }
}