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
package alphatab.midi;
import alphatab.model.effects.BendEffect;
import alphatab.model.effects.BendPoint;
import alphatab.model.effects.HarmonicEffect;
import alphatab.model.effects.HarmonicType;
import alphatab.model.Beat;
import alphatab.model.BeatStrokeDirection;
import alphatab.model.Duration;
import alphatab.model.Measure;
import alphatab.model.MeasureHeader;
import alphatab.model.MidiChannel;
import alphatab.model.MixTableChange;
import alphatab.model.Note;
import alphatab.model.Song;
import alphatab.model.SongFactory;
import alphatab.model.Tempo;
import alphatab.model.Track;
import alphatab.model.TripletFeel;
import alphatab.model.Velocities;
import alphatab.model.Voice;

class MidiSequenceParser 
{
    private static inline var DEFAULT_BEND:Int = 0x40;
    private static inline var DEFAULT_BEND_SEMITONE:Float = 2.75;
    private static inline var DEFAULT_DURATION_DEAD:Int = 30;
    private static inline var DEFAULT_DURATION_PM:Int = 80;
    private static inline var DEFAULT_METRONOME_KEY:Int = 0x25;
    
    private var _firstTickMove:Int;
    private var _flags:Int;
    private var _tempoPercent:Int;
    private var _transpose:Int;
    private var _factory:SongFactory;
    private var _infoTrack :Int;
    private var _metronomeTrack :Int;
    private var _song:Song;

    public function new(factory:SongFactory, song:Song,  flags:Int, tempoPercent:Int, transpose:Int) 
    {
        _song = song;
        _factory = factory;
        _flags = flags;
        _transpose = transpose;
        _tempoPercent = tempoPercent;
        _firstTickMove = ((flags & MidiSequenceParserFlags.ADD_FIRST_TICK_MOVE) == 0) ? 0 : Duration.QUARTER_TIME;
    }
    
    private function addBend(sequence:MidiSequenceHandler, track:Int, tick:Int, bend:Int, channel:Int) : Void
    {
        sequence.addPitchBend(getTick(tick), track, channel, bend);
    }
     
    public function addDefaultMessages(oSequence:MidiSequenceHandler) : Void
    {
        if ((_flags & MidiSequenceParserFlags.ADD_DEFAULT_CONTROLS) == 0) return;
        for (i in 0 ... 16)
        {
            oSequence.addControlChange(getTick(Duration.QUARTER_TIME), _infoTrack, i, MidiController.RPN_MBS, 0);
            oSequence.addControlChange(getTick(Duration.QUARTER_TIME), _infoTrack, i, MidiController.RPN_LSB, 0);
            oSequence.addControlChange(getTick(Duration.QUARTER_TIME), _infoTrack, i, MidiController.DATA_ENTRY_MSB, 12);
            oSequence.addControlChange(getTick(Duration.QUARTER_TIME), _infoTrack, i, MidiController.DATA_ENTRY_LSB, 0);
        }
    }     
     
    public function addMetronome(sequence:MidiSequenceHandler, header:MeasureHeader, startMove:Int) : Void
    {
        if ((_flags & MidiSequenceParserFlags.ADD_METRONOME) == 0) return;
        var start:Int = startMove + header.start;
        var length:Int = header.timeSignature.denominator.time();
        for (i in  1 ... header.timeSignature.numerator + 1)
        {
            makeNote(sequence, _metronomeTrack, DEFAULT_METRONOME_KEY, start, length, Velocities.DEFAULT, 9);
            start += length;
        }
    }

    private function addTempo(sequence:MidiSequenceHandler, currentMeasure:Measure, previousMeasure:Measure, startMove:Int) : Void
    {
        var bAddTempo:Bool = false;
        if (previousMeasure == null)
        {
            bAddTempo = true;
        }
        else if (currentMeasure.tempo().inUsq() != previousMeasure.tempo().inUsq())
        {
            bAddTempo = true;
        }
        if (!bAddTempo) return;
        var usq:Int = Math.floor(currentMeasure.tempo().inUsq() * 100.0 / _tempoPercent);
        sequence.addTempoInUSQ(getTick(currentMeasure.start() + startMove), _infoTrack, usq);
    }
    
    private function addTimeSignature(sequence:MidiSequenceHandler, currentMeasure:Measure, previousMeasure:Measure, startMove:Int) : Void
    {
        var addTimeSignature:Bool = false;
        if (previousMeasure == null)
        {
            addTimeSignature = true;
        }
        else
        {
            var currNumerator:Int = currentMeasure.timeSignature().numerator;
            var currValue:Int = currentMeasure.timeSignature().denominator.value;
            var prevNumerator:Int = previousMeasure.timeSignature().numerator;
            var prevValue:Int = previousMeasure.timeSignature().denominator.value;
            if ((currNumerator != prevNumerator) || (currValue != prevValue))
            {
                addTimeSignature = true;
            }
        }
        if (addTimeSignature)
        {
            sequence.addTimeSignature(getTick(currentMeasure.start() + startMove), _infoTrack, currentMeasure.timeSignature());
        }
    }

    private static function applyDurationEffects(note:Note, tempo:Tempo, duration:Int) : Int
    {
        if (note.effect.deadNote)
        {
            return applyStaticDuration(tempo, DEFAULT_DURATION_DEAD, duration);
        }
        if (note.effect.palmMute)
        {
            return applyStaticDuration(tempo, DEFAULT_DURATION_PM, duration);
        }
        if (note.effect.staccato)
        {
            return Math.floor((duration * 50.0) / 100.0);
        }
        return duration;
    }
     
    private static function applyStaticDuration(tempo:Tempo, duration:Int, maximum:Int) : Int
    {
        var value:Int = Math.floor((tempo.value * duration) / 60);
        return ((value < maximum) ? value : maximum);
    }

    private static function applyStrokeDuration(note:Note, duration:Int, stroke:Array<Int>) : Int
    {
        return (duration - stroke[note.string - 1]);
    }

    private static function applyStrokeStart(node:Note, start:Int, stroke:Array<Int>) : Int
    {
        return (start + stroke[node.string - 1]);
    }

    private function checkTripletFeel(voice:Voice, beatIndex:Int) : BeatData 
    {
        var beatStart:Int = voice.beat.start;
        var beatDuration:Int = voice.duration.time(); 
        if (voice.beat.measure.tripletFeel() == TripletFeel.Eighth)
        {
            if (voice.duration == newDuration(Duration.EIGHTH))
            {
                if ((beatStart % Duration.QUARTER_TIME) == 0)
                {
                    var voice2:Voice = getNextBeat(voice, beatIndex);
                    if (((voice2 == null) || (voice2.beat.start > (beatStart + voice2.duration.time()))) ||
                        voice2.duration == newDuration(Duration.EIGHTH))
                    {
                        var duration:Duration = newDuration(Duration.EIGHTH);
                        duration.tuplet.enters = 3;
                        duration.tuplet.times = 2;
                        beatDuration = duration.time() * 2;
                    }
                }
                else if ((beatStart % (Duration.QUARTER_TIME / 2)) == 0)
                {
                    var voice2:Voice = getPreviousBeat(voice, beatIndex);
                    if (((voice2 == null) || (voice2.beat.start < (beatStart - voice.duration.time()))) ||
                        voice2.duration == newDuration(Duration.EIGHTH))
                    {
                        var duration:Duration = newDuration(Duration.EIGHTH);
                        duration.tuplet.enters = 3;
                        duration.tuplet.times = 2;
                        beatStart = (beatStart - voice.duration.time()) + (duration.time() * 2);
                        beatDuration = duration.time();
                    }
                }
            }
        }
        else if (voice.beat.measure.tripletFeel() == TripletFeel.Sixteenth)
        {
            if (voice.duration == newDuration(Duration.SIXTEENTH))
                if ((beatStart % (Duration.QUARTER_TIME / 2)) == 0)
                {
                    var voice2:Voice = getNextBeat(voice, beatIndex);
                    if (voice2 == null || (voice2.beat.start > (beatStart + voice.duration.time())) ||
                        voice2.duration == newDuration(Duration.SIXTEENTH))
                    {
                        var duration:Duration = newDuration(Duration.SIXTEENTH);
                        duration.tuplet.enters = 3;
                        duration.tuplet.times = 2;
                        beatDuration = duration.time() * 2;
                    }
                }
                else if ((beatStart % (Duration.QUARTER_TIME / 4)) == 0)
                {
                    var voice2:Voice = getPreviousBeat(voice, beatIndex);
                    if (voice2 == null || (voice2.beat.start < (beatStart - voice2.duration.time()) ||
                        voice2.duration == newDuration(Duration.SIXTEENTH)))
                    {
                        var duration:Duration = newDuration(Duration.SIXTEENTH);
                        duration.tuplet.enters = 3;
                        duration.tuplet.times = 2;
                        beatStart = (beatStart - voice.duration.time()) + (duration.time() * 2);
                        beatDuration = duration.time();
                    }
                }
        }
        return new BeatData(beatStart, beatDuration);
    }
    
    private function createTrack(sequence:MidiSequenceHandler, track:Track, getTicks:Bool) : Void
    {
        var previous:Measure = null;
        var controller:MidiRepeatController = new MidiRepeatController(track.song);
        var ticksAtMeasureStart:Int = 0;
        
        sequence.resetTicks();
        
        addBend(sequence, track.number, Duration.QUARTER_TIME, DEFAULT_BEND, track.channel.channel);
        makeChannel(sequence, track.channel, track.number);
        
        while (!controller.finished())
        {
            var measure:Measure = track.measures[controller.index];
            var index:Int = controller.index;
            var move:Int = controller.repeatMove;
            controller.process();
            
            if (controller.shouldPlay)
            {
                
                if (track.number == 1)
                {
                    addTimeSignature(sequence, measure, previous, move);
                    addTempo(sequence, measure, previous, move);
                    addMetronome(sequence, measure.header, move);
                                        
                    ticksAtMeasureStart=sequence.getTicks();
                }
                
                makeBeats(sequence, track, measure, index, move);
            }
            previous = measure;
        }
    }

    private static function getNextBeat(voice:Voice, beatIndex:Int) : Voice
    {
        var next:Voice = null;
        for (b in beatIndex + 1 ... voice.beat.measure.beatCount())
        {
            var current:Beat = voice.beat.measure.beats[b];
            if (((current.start > voice.beat.start) && !current.voices[voice.index].isEmpty) &&
                ((next == null) || (current.start < next.beat.start)))
            {
                next = current.voices[voice.index];
            }
        }
        return next;
    }

    private static function getNextNote(note:Note, track:Track, measureIndex:Int, beatIndex:Int) : Note
    {
        var nextBeatIndex:Int = beatIndex + 1;
        var measureCount:Int = track.measureCount();
        for (m in measureIndex ... measureCount)
        {
            var measure:Measure = track.measures[m];
            var beatCount:Int = measure.beatCount();
            for (b in nextBeatIndex ... beatCount)
            {
                var beat:Beat = measure.beats[b];
                var voice:Voice = beat.voices[note.voice.index];
                var noteCount:Int = voice.notes.length;
                for (n in 0 ... noteCount)
                {
                    var currNode:Note = voice.notes[n];
                    if (currNode.string == note.string)
                    {
                        return currNode;
                    }
                }
                return null;
            }
            nextBeatIndex = 0;
        }
        return null;
    }
     
    private static function getPreviousBeat(voice:Voice, beatIndex:Int) :Voice
    {
        var previous:Voice = null;
        var b:Int = beatIndex -1;
        while (b >= 0)
        {
            var current:Beat = voice.beat.measure.beats[b];
            if (((current.start < voice.beat.start) && !current.voices[voice.index].isEmpty) &&
                ((previous == null) || (current.start > previous.beat.start)))
            {
                previous = current.voices[voice.index];
            }
            b--;
        }
        return previous;
    }
    
    private static function getPreviousNote(note:Note, track:Track, measureIndex:Int, beatIndex:Int) : Note
    {
        var nextBeatIndex:Int = beatIndex;
        var m:Int = measureIndex;
        while(m >= 0)
        {
            var measure:Measure = track.measures[m];
            nextBeatIndex = (nextBeatIndex < 0) ? measure.beatCount() : nextBeatIndex;
            var b:Int = nextBeatIndex -1;
            while (b >= 0)
            {
                var voice:Voice = measure.beats[b].voices[note.voice.index];
                var noteCount:Int = voice.notes.length;
                for (n in 0 ... noteCount)
                {
                    var current:Note = voice.notes[n];
                    if (current.string == note.string)
                    {
                        return current;
                    }
                }
                b--;
            }
            nextBeatIndex = -1;
            m--;
        }
        return null;
    }

    private function getRealNoteDuration(track:Track, note:Note, tempo:Tempo, duration:Int, measureIndex:Int, beatIndex:Int) : Int
    {
        var lastEnd:Int = note.voice.beat.start + note.voice.duration.time();
        var realDuration:Int = duration;
        var nextBeatIndex:Int = beatIndex + 1;
        var measureCount:Int = track.measureCount();
        for (m in measureIndex ... measureCount)
        {
            var measure:Measure = track.measures[m];
            var  beatCount:Int = measure.beatCount();
            var letRingSuspend:Bool = false;
            for (b in nextBeatIndex ... beatCount)
            {
                var beat:Beat = measure.beats[b];
                var voice:Voice = beat.voices[note.voice.index];
                if (voice.isRestVoice())
                {
                    return applyDurationEffects(note, tempo, realDuration);
                }
                var noteCount:Int = voice.notes.length;

                var letRing:Bool = m == measureIndex && b != beatIndex &&
                    note.effect.letRing;
                var letRingAppliedForBeat:Bool = false;
                for (n in 0 ... noteCount)
                {
                    var nextNote:Note = voice.notes[n];
                    if (nextNote == note || nextNote.string != note.string) continue;
                    // quit letring?
                    if (nextNote.string == note.string && !nextNote.isTiedNote)
                    {  
                        letRing = false;
                        letRingSuspend = true;
                    }
                    if (!nextNote.isTiedNote && !letRing)
                    {
                        return applyDurationEffects(note, tempo, realDuration);
                    }
                    letRingAppliedForBeat = true;
                    realDuration += (beat.start - lastEnd) + nextNote.voice.duration.time();
                    lastEnd = beat.start + voice.duration.time();
                }

                if (letRing && !letRingAppliedForBeat && !letRingSuspend)
                {
                    realDuration += (beat.start - lastEnd) + voice.duration.time();
                    lastEnd = beat.start + voice.duration.time();
                }
            }
            nextBeatIndex = 0;
        }
        return applyDurationEffects(note, tempo, realDuration);
    }

    private static function getRealVelocity(note:Note, track:Track, measureIndex:Int, beatIndex:Int) : Int
    {
        var velocity:Int = note.velocity;
        if (!track.isPercussionTrack)
        {
            var previousNote:Note = getPreviousNote(note, track, measureIndex, beatIndex);
            if ((previousNote != null) && previousNote.effect.hammer)
            {
                velocity = Math.floor(Math.max(Velocities.MIN_VELOCITY, velocity - 25));
            }
        }
        if (note.effect.ghostNote)
        {
            velocity = Math.floor(Math.max(Velocities.MIN_VELOCITY, velocity - Velocities.VELOCITY_INCREMENT));
        }
        else if (note.effect.accentuatedNote)
        {
            velocity = Math.floor(Math.max(Velocities.MIN_VELOCITY, velocity + Velocities.VELOCITY_INCREMENT));
        }
        else if (note.effect.heavyAccentuatedNote)
        {
            velocity =Math.floor(Math.max(Velocities.MIN_VELOCITY, velocity + (Velocities.VELOCITY_INCREMENT * 2)));
        }
        return ((velocity > 127) ? 127 : velocity);
    }

    private static function getStroke(beat:Beat, previous:Beat, stroke:Array<Int>) : Array<Int>
    {
        var direction:Int = beat.effect.stroke.direction;
        if (((previous == null) || (direction != BeatStrokeDirection.None)) || (previous.effect.stroke.direction != BeatStrokeDirection.None))
        {
            if (direction == BeatStrokeDirection.None)
            {
                for (i in 0 ... stroke.length)
                {
                    stroke[i] = 0;
                }
            }
            else
            {
                var stringUsed:Int = 0;
                var stringCount:Int = 0;
                for (vIndex in  0 ... beat.voices.length)
                {
                    var voice:Voice = beat.voices[vIndex];
                    for (nIndex in 0 ... voice.notes.length)
                    {
                        var note:Note = voice.notes[nIndex];
                        if (note.isTiedNote) continue;
                        stringUsed |= 0x01 << (note.string - 1);
                        stringCount++;
                    }
                }
                if (stringCount > 0)
                {
                    var strokeMove:Int = 0;
                    var strokeIncrement:Int = beat.effect.stroke.getIncrementTime(beat);
                    for (i in 0 ... stroke.length)
                    {
                        var iIndex:Int = (direction != BeatStrokeDirection.Down) ? i : ((stroke.length - 1) - i);
                        if ((stringUsed & (0x01 << iIndex)) != 0)
                        {
                            stroke[iIndex] = strokeMove;
                            strokeMove += strokeIncrement;
                        }
                    }
                }
            }
        }
        return stroke;
    }

     
    private function getTick(tick:Int) : Int
    {
        return (tick + _firstTickMove);
    }

    private function makeBeats(sequence:MidiSequenceHandler, track:Track, measure:Measure, measureIndex:Int, startMove:Int) : Void
    {
        var stroke:Array<Int> = new Array<Int>();
        for (i in 0 ... track.stringCount())
        {
            stroke.push(0);
        }
        var previous:Beat = null;
        for (beatIndex in 0 ... measure.beatCount())
        {
            var beat:Beat = measure.beats[beatIndex];
            if (beat.effect.mixTableChange != null)
            {
                makeMixChange(sequence, track.channel, track.number, beat);
            }

            makeNotes(sequence, track, beat, measure.tempo(), measureIndex, beatIndex, startMove,
                      getStroke(beat, previous, stroke));
            previous = beat;
        }
    }

    
    public function makeBend(sequence:MidiSequenceHandler, track:Int, start:Int, duration:Int,
                                 bend:BendEffect, channel:Int) : Void
    {
        var points:Array<BendPoint> = bend.points;
        for (i in 0 ... points.length)
        {
            var point:BendPoint = points[i];
            var bendStart:Int = start + point.getTime(duration);
            var value:Int = Math.round(DEFAULT_BEND + (point.value * DEFAULT_BEND_SEMITONE / BendEffect.SEMITONE_LENGTH));
            value = (value <= 127) ? value : 127;
            value = (value >= 0) ? value : 0;
            addBend(sequence, track, bendStart, value, channel);
            if (points.length <= (i + 1)) continue;

            var nextPoint:BendPoint = points[i + 1];
            var nextValue:Int = Math.round(DEFAULT_BEND + (nextPoint.value * DEFAULT_BEND_SEMITONE / BendEffect.SEMITONE_LENGTH));
            var nextBendStart:Int = Math.round(start + nextPoint.getTime(duration));
            if (nextValue == value) continue;
            var width:Float = (nextBendStart - bendStart) / Math.abs(nextValue - value);
            if (value < nextValue)
            {
                while (value < nextValue)
                {
                    value++;
                    bendStart += Math.round(width);
                    addBend(sequence, track, bendStart, (value <= 127) ? value : 127, channel);
                }
            }
            else if (value > nextValue)
            {
                while (value > nextValue)
                {
                    value--;
                    bendStart += Math.round(width);
                    addBend(sequence, track, bendStart, (value >= 0) ? value : 0, channel);
                }
            }
        }
        addBend(sequence, track, start + duration, 0x40, channel);
    }

    
    private function makeChannel(sequence:MidiSequenceHandler, channel:MidiChannel, track:Int) : Void
    {
        if ((_flags & MidiSequenceParserFlags.ADD_MIXER_MESSAGES) == 0) return;
        makeChannel2(sequence, channel, track, true);
        if (channel.channel != channel.effectChannel)
        {
            makeChannel2(sequence, channel, track, false);
        }
    }

    private function makeChannel2(sequence:MidiSequenceHandler, channel:MidiChannel, track:Int, primary:Bool) : Void
    {
        var number:Int = (!primary) ? channel.effectChannel : channel.channel;
        sequence.addControlChange(getTick(Duration.QUARTER_TIME), track, number, MidiController.VOLUME, channel.volume);
        sequence.addControlChange(getTick(Duration.QUARTER_TIME), track, number, MidiController.BALANCE, channel.balance);
        sequence.addControlChange(getTick(Duration.QUARTER_TIME), track, number, MidiController.CHORUS, channel.chorus);
        sequence.addControlChange(getTick(Duration.QUARTER_TIME), track, number, MidiController.REVERB, channel.reverb);
        sequence.addControlChange(getTick(Duration.QUARTER_TIME), track, number, MidiController.PHASER, channel.phaser);
        sequence.addControlChange(getTick(Duration.QUARTER_TIME), track, number, MidiController.TREMOLO, channel.tremolo);
        sequence.addControlChange(getTick(Duration.QUARTER_TIME), track, number, MidiController.EXPRESSION, 127);
        sequence.addProgramChange(getTick(Duration.QUARTER_TIME), track, number, channel.instrument());
    }


    private function makeMixChange(sequence:MidiSequenceHandler, channel:MidiChannel, track:Int, beat:Beat) : Void
    {
        var change:MixTableChange = beat.effect.mixTableChange;
        var start:Int = getTick(beat.start);

        if (change.volume != null)
        {            
            var value:Int = getMixChangeValue(change.volume.value, false);
            sequence.addControlChange(start, track, channel.channel, MidiController.VOLUME, value);
            sequence.addControlChange(start, track, channel.effectChannel, MidiController.VOLUME, value);
        }
        if (change.balance != null)
        {
            var value:Int = getMixChangeValue(change.balance.value, true);
            sequence.addControlChange(start, track, channel.channel, MidiController.BALANCE, value);
            sequence.addControlChange(start, track, channel.effectChannel, MidiController.BALANCE, value);
        }
        if (change.chorus != null)
        {
            var value:Int = getMixChangeValue(change.chorus.value, true);
            sequence.addControlChange(start, track, channel.channel, MidiController.CHORUS, value);
            sequence.addControlChange(start, track, channel.effectChannel, MidiController.CHORUS, value);
        }
        if (change.reverb != null)
        {
            var value:Int = getMixChangeValue(change.reverb.value, true);
            sequence.addControlChange(start, track, channel.channel, MidiController.REVERB, value);
            sequence.addControlChange(start, track, channel.effectChannel, MidiController.REVERB, value);
        }
        if (change.phaser != null)
        {
            var value:Int = getMixChangeValue(change.phaser.value, true);
            sequence.addControlChange(start, track, channel.channel, MidiController.PHASER, value);
            sequence.addControlChange(start, track, channel.effectChannel, MidiController.PHASER, value);
        }
        if (change.tremolo != null)
        {
            var value:Int = getMixChangeValue(change.tremolo.value, true);
            sequence.addControlChange(start, track, channel.channel, MidiController.TREMOLO, value);
            sequence.addControlChange(start, track, channel.effectChannel, MidiController.TREMOLO, value);
        }
        if (change.instrument != null)
        {
            sequence.addProgramChange(start, track, channel.channel, change.instrument.value);
            sequence.addProgramChange(start, track, channel.effectChannel, change.instrument.value);
        }
        if(change.tempo != null)
        {
            sequence.addTempoInUSQ(start, _infoTrack, Tempo.tempoToUsq(change.tempo.value));
        }
    }
    
    private function getMixChangeValue(value:Int, signed:Bool): Int
    {
        if (signed) 
            value += 8;
        return Math.round((value * 127) / 16);
    }

    private function makeFadeIn(sequence:MidiSequenceHandler, track:Int, start:Int, duration:Int, channel:Int) : Void
    {
        var expression:Int = 0x1f;
        var expressionIncrement:Int = 1;
        var tick:Int = start;
        var tickIncrement:Int = Math.round(duration / ((0x7f - expression) / expressionIncrement));
        while ((tick < (start + duration)) && (expression < 0x7f))
        {
            sequence.addControlChange(getTick(tick), track, channel, MidiController.EXPRESSION, expression);
            tick += tickIncrement;
            expression += expressionIncrement;
        }
        sequence.addControlChange(getTick(start + duration), track, channel, MidiController.EXPRESSION, 0x7f);
    }
     
    private function makeNote(sequence:MidiSequenceHandler, track:Int, key:Int, start:Int, duration:Int, velocity:Int, channel:Int) : Void
    {
        sequence.addNoteOn(getTick(start), track, channel, key, velocity);
        sequence.addNoteOff(getTick(start + duration), track, channel, key, velocity);
    }

    private function makeNotes(sequence:MidiSequenceHandler, track:Track, beat:Beat, tempo:Tempo, measureIndex:Int, beatIndex:Int, startMove:Int, stroke:Array<Int>) : Void
    { 
        var trackId:Int = track.number;
        for (vIndex in 0 ... beat.voices.length)
        {
            var voice:Voice = beat.voices[vIndex];
            var data:BeatData = checkTripletFeel(voice, beatIndex);
            for (noteIndex in 0 ... voice.notes.length)
            {
                var note:Note = voice.notes[noteIndex];

                if (note.isTiedNote) continue;

                var key:Int = (_transpose + track.offset + note.value) +
                           track.strings[note.string - 1].value;
                var start:Int = applyStrokeStart(note, data.start + startMove, stroke);
                var duration:Int = applyStrokeDuration(note,
                                                     getRealNoteDuration(track, note, tempo, data.duration,
                                                                         measureIndex, beatIndex), stroke);
                var velocity:Int = getRealVelocity(note, track, measureIndex, beatIndex);
                var channel:Int = track.channel.channel;
                var effectChannel:Int = track.channel.effectChannel;
                var percussionTrack:Bool = track.isPercussionTrack;
                if (beat.effect.fadeIn)
                {
                    channel = effectChannel;
                    makeFadeIn(sequence, trackId, start, duration, channel);
                }
                if ((note.effect.isGrace() && (effectChannel >= 0)) && !percussionTrack)
                {
                    channel = effectChannel;
                    var graceKey:Int = (track.offset + note.effect.grace.fret) +
                                    (track.strings[note.string - 1].value);
                    var graceLength:Int = note.effect.grace.durationTime();
                    var graceVelocity:Int = note.effect.grace.velocity;
                    var graceDuration:Int = (!note.effect.grace.isDead)
                                              ? graceLength
                                              : applyStaticDuration(tempo, DEFAULT_DURATION_DEAD, graceLength);
                    if (note.effect.grace.isOnBeat || ((start - graceLength) < Duration.QUARTER_TIME))
                    {
                        start += graceLength;
                        duration -= graceLength;
                    }
                    makeNote(sequence, trackId, graceKey, start - graceLength, graceDuration, graceVelocity,
                             channel);
                }
                if ((note.effect.isTrill() && (effectChannel >= 0)) && !percussionTrack)
                {
                    var trillKey:Int = (track.offset + note.effect.trill.fret) +
                                    (track.strings[note.string - 1].value);
                    var trillLength:Int = note.effect.trill.duration.time();
                    var realKey:Bool = true;
                    var tick:Int = start;
                    while (tick + 10 < (start + duration))
                    {
                        if ((tick + trillLength) >= (start + duration))
                        {
                            trillLength = (((start + duration) - tick) - 1);
                        }
                        makeNote(sequence, trackId, ((realKey) ? key : trillKey), tick, trillLength,
                                 velocity, channel);
                        realKey = !realKey;
                        tick += trillLength;
                    }
                    continue;
                }
                if (note.effect.isTremoloPicking() && (effectChannel >= 0))
                {
                    var tpLength:Int = note.effect.tremoloPicking.duration.time();
                    var tick:Int  = start;
                    while (tick + 10 < (start + duration))
                    {
                        if ((tick + tpLength) >= (start + duration))
                        {
                            tpLength = (((start + duration) - tick) - 1);
                        }
                        makeNote(sequence, trackId, key, start, tpLength, velocity, channel);
                        tick += tpLength;
                    }
                    continue;
                }
                if ((note.effect.isBend() && (effectChannel >= 0)) && !percussionTrack)
                {
                    channel = effectChannel;
                    makeBend(sequence, trackId, start, duration, note.effect.bend, channel);
                }
                else if ((note.voice.beat.effect.isTremoloBar() && (effectChannel >= 0)) && !percussionTrack)
                {
                    channel = effectChannel;
                    makeTremoloBar(sequence, trackId, start, duration, note.voice.beat.effect.tremoloBar, channel);
                }
                else if ((note.effect.slide && (effectChannel >= 0)) && !percussionTrack)
                {
                    channel = effectChannel;
                    var nextNote:Note = getNextNote(note, track, measureIndex, beatIndex);
                    makeSlide(sequence, trackId, note, nextNote, startMove, channel);
                }
                else if ((note.effect.vibrato && (effectChannel >= 0)) && !percussionTrack)
                {
                    channel = effectChannel;
                    makeVibrato(sequence, trackId, start, duration, channel);
                }
                if (note.effect.isHarmonic() && !percussionTrack)
                {
                    var orig:Int = key; 
                    if (note.effect.harmonic.type == HarmonicType.Natural)
                    {
                        for (i in 0 ... HarmonicEffect.NATURAL_FREQUENCIES.length)
                        {
                            if ((note.value % 12) == (HarmonicEffect.NATURAL_FREQUENCIES[i][0] % 12))
                            {
                                key = (orig + HarmonicEffect.NATURAL_FREQUENCIES[i][1]) - note.value;
                                break;
                            }
                        }
                    }
                    else
                    {
                        if (note.effect.harmonic.type == HarmonicType.Semi)
                        { 
                            makeNote(sequence, trackId, Math.round(Math.min(127, orig)), start, duration,
                                    Math.round(Math.max(Velocities.MIN_VELOCITY, velocity - (Velocities.VELOCITY_INCREMENT * 3))), channel);
                        }
                        key = orig + HarmonicEffect.NATURAL_FREQUENCIES[note.effect.harmonic.data][1];
                    }
                    if ((key - 12) > 0)
                    {
                        var hVelocity:Int = Math.round(Math.max(Velocities.MIN_VELOCITY, velocity - (Velocities.VELOCITY_INCREMENT * 4)));
                        makeNote(sequence, trackId, key - 12, start, duration, hVelocity, channel);
                    }
                }
                makeNote(sequence, trackId, Math.round(Math.min(0x7f, key)), start, duration, velocity, channel);
            }
        }
    }

    public function makeSlide(sequence:MidiSequenceHandler, track:Int, note:Note, nextNote:Note ,
                                  startMove:Int, channel:Int) : Void
    {
        if (nextNote != null)
        {
            // TODO calculate all slide types (zero or -10 to note, from note to zero or -10, from note + 10, +10 to note)
            makeSlide2(sequence, track, note.voice.beat.start + startMove, note.value,
                      nextNote.voice.beat.start + startMove, nextNote.value, channel);
            addBend(sequence, track, nextNote.voice.beat.start + startMove, DEFAULT_BEND, channel);
        }
    }

    public function makeSlide2(sequence:MidiSequenceHandler, track:Int, tick1:Int, value1:Int, tick2:Int,
                                  value2:Int, channel:Int) : Void
    {
        var lDistance:Int = value2 - value1;
        var lLength:Int = tick2 - tick1;
        var points:Int = Math.floor(lLength / (Duration.QUARTER_TIME / 8));
        for (i in 1 ... points + 1)
        {
            var fTone:Float = (((lLength / points) * i) * lDistance) / lLength;
            var iBend:Int = Math.round(DEFAULT_BEND + (fTone * (DEFAULT_BEND_SEMITONE * 2)));
            addBend(sequence, track, Math.round(tick1 + ((lLength / points) * i)), iBend, channel);
        }
    }
     
    public function makeTremoloBar(sequence:MidiSequenceHandler, track:Int, start:Int, duration:Int,
                                       effect:BendEffect, channel:Int) : Void
    {
        var points:Array<BendPoint> = effect.points;
        
        for (i in 0 ... points.length)
        {
            var point:BendPoint = points[i];
            var pointStart = start + point.getTime(duration);
            var value:Int = Math.round(DEFAULT_BEND + (point.value * (DEFAULT_BEND_SEMITONE * 2)));
            value = (value <= 127) ? value : 127;
            value = (value >= 0) ? value : 0;
            addBend(sequence, track, pointStart, value, channel);
            if (points.length > (i + 1))
            {
                var nextPoint:BendPoint = points[i + 1];
                var nextValue:Int = Math.round(DEFAULT_BEND + (nextPoint.value * (DEFAULT_BEND_SEMITONE * 2)));
                var nextPointStart = start + nextPoint.getTime(duration);
                if (nextValue == value) continue;                
                var width:Float = (nextPointStart - pointStart) / Math.abs(nextValue - value);
                if (value < nextValue)
                {
                    while (value < nextValue)
                    {
                        value++;
                        pointStart += Math.round(width);
                        addBend(sequence, track, pointStart, (value <= 127) ? value : 127, channel);
                    }
                }
                else if (value > nextValue)
                {
                    while (value > nextValue)
                    {
                        value += -1;
                        pointStart += Math.round(width);
                        addBend(sequence, track, pointStart, (value >= 0) ? value : 0, channel);
                    }
                }
                
            }
        }
        addBend(sequence, track, start + duration, 0x40, channel);
    }

    public function makeVibrato(sequence:MidiSequenceHandler, track:Int, start:Int, duration:Int, channel:Int) : Void
    {
        var nextStart:Int = start;
        var end:Int = nextStart + duration;
        while (nextStart < end)
        {
            nextStart = ((nextStart + 160) > end) ? end : (nextStart + 160);
            addBend(sequence, track, nextStart, DEFAULT_BEND, channel);
            nextStart = ((nextStart + 160) > end) ? end : (nextStart + 160);
            addBend(sequence, track, nextStart, Math.round(DEFAULT_BEND + (DEFAULT_BEND_SEMITONE / 2.0)), channel);
        }
        addBend(sequence, track, nextStart, DEFAULT_BEND, channel);
    }

    private function newDuration(value:Int) : Duration
    {
        var duration:Duration = _factory.newDuration();
        duration.value = (value);
        return duration;
    }
    
    public function parse(sequence:MidiSequenceHandler) : Void
    {        
        _infoTrack = sequence.infoTrack;
        _metronomeTrack = sequence.metronomeTrack;
        addDefaultMessages(sequence);
        for (i in 0 ... _song.tracks.length)
        {
            var songTrack:Track = _song.tracks[i];
            var isFirstTrack:Bool = i==0;
            
            createTrack(sequence, songTrack, isFirstTrack);
        }
        sequence.notifyFinish();
    }
}