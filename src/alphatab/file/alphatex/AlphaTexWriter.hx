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
package alphatab.file.alphatex;
import alphatab.model.Beat;
import alphatab.model.BeatStrokeDirection;
import alphatab.model.effects.GraceEffectTransition;
import alphatab.model.effects.HarmonicType;
import alphatab.model.GuitarString;
import alphatab.model.Measure;
import alphatab.model.MeasureClef;
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.model.TimeSignature;
import alphatab.model.Track;
import alphatab.model.Tuning;
import alphatab.model.Tuplet;
import alphatab.model.Voice;

/**
 * This class enables converts a track into a
 * alphaTex document
 */
class AlphaTexWriter 
{
    private var _voice:Int;
    private var _result:StringBuf;
    private var _track:Track;
    
    private var _currentDuration:Int;
    private var _currentTempo:Int;
    private var _keySignature:Int;
    private var _timeSignature:TimeSignature;
    private var _clef:Int;
    
    /**
     * Initializes a new AlphaTexWriter.
     * @param    track the track to export. 
     */
    public function new(track:Track, voice:Int = 0) 
    {
        _voice = voice;
        _track = track;
        _keySignature = -1;
        _currentDuration = -1;
        _clef = MeasureClef.Treble;
    }
    
    public function write():String
    {
        _result = new StringBuf();
        
        writeMeta();
        _result.add(" . ");
        
        for (measure in _track.measures)
        {
            writeMeasure(measure);
            if (measure.number() < _track.measureCount() - 1)
            {
                _result.add("|");
            }
        }
        
        return cleanup(_result.toString());        
    }
    
    private function cleanup(data:String) : String
    {
        var spaces = ~/[ ]+/g; // g : replace all instances
        // delete empty brackets
        data = StringTools.replace(data, "{}", " "); 
        data = StringTools.replace(data, "{ }", " "); 
        // delete unneeded spaces                
        data = spaces.replace(data, " ");
        data = StringTools.replace(data, "{ ", "{"); 
        data = StringTools.replace(data, " }", "}"); 
        data = StringTools.replace(data, "( ", "("); 
        data = StringTools.replace(data, " )", ")"); 
        data = spaces.replace(data, " ");
        return data;
    }
    
    private function writeMeasure(measure:Measure)
    {
        if (_timeSignature == null ||
            measure.timeSignature().numerator != _timeSignature.numerator ||
            measure.timeSignature().denominator.value != _timeSignature.denominator.value)
        {
            _result.add(" \\ts ");
            _result.add(measure.timeSignature().numerator);
            _result.add(" ");
            _result.add(measure.timeSignature().denominator.value);
            _timeSignature = measure.timeSignature();
        }
        
        if (measure.isRepeatOpen())
        {
            _result.add(" \\ro ");
        }
        
        if (measure.repeatClose() > 1)
        {
            _result.add(measure.repeatClose() - 1);
        }
        
        if (measure.keySignature() != _keySignature)
        {
            _result.add(" \\ks ");
            _result.add(parseKeySignature(measure.keySignature()));
            _result.add(" ");
            _keySignature = measure.keySignature();
        }
        
        if (measure.clef != _clef)
        {
            _result.add(" \\clef ");
            switch(measure.clef)
            {
                case MeasureClef.Treble: _result.add("treble ");
                case MeasureClef.Alto: _result.add("alto ");
                case MeasureClef.Bass: _result.add("bass ");
                case MeasureClef.Tenor: _result.add("tenor ");
            }
            _clef = measure.clef;
        }
        
        if (_currentTempo != measure.tempo().value)
        {
            _result.add(" \\tempo ");
            _result.add(measure.tempo().value);
            _result.add(" ");
            _currentTempo = measure.tempo().value;
        }
        
        for (beat in measure.beats)
        {
            writeBeat(beat);
        }
    }
    
    private function writeBeat(beat:Beat)
    {
        var voice:Voice = beat.voices[_voice];
        
        if (voice.duration.value != _currentDuration)
        {
            _result.add(":");
            _result.add(voice.duration.value);
            _result.add(" ");
            _currentDuration = voice.duration.value;
        }
        
        if (voice.isEmpty) return;
        
        if (voice.isRestVoice())
        {
            _result.add("r ");
        }
        else
        {
            if (voice.notes.length > 1)
            {
                _result.add("(");
            }
            
            for (note in voice.notes)
            {
                writeNote(note);
            }
            
            if (voice.notes.length > 1)
            {
                _result.add(")");
            }
            
             _result.add("{");   
            writeBeatEffects(beat);
            _result.add("}");   
           
        }
       
        _result.add(" ");
    }
    
    private function parseKeySignature(keySignature:Int) : String
    {
        switch(keySignature) 
        {
            case -7: return "cb";
            case -6: return "gb";
            case -5: return "db";
            case -4: return "ab";
            case -3: return "eb";
            case -2: return "bb";
            case -1: return "f";
            case 0: return "c";
            case 1: return "g";
            case 2: return "d";
            case 3: return "a";
            case 4: return "e";
            case 5: return "b";
            case 6: return "f#";
            case 7: return "c#";
            default: return "c";
    }
    }

    
    private function writeBeatEffects(beat:Beat)
    {
        if (beat.effect.fadeIn) _result.add(" f ");
        if (beat.effect.vibrato) _result.add(" v ");
        if (beat.effect.tapping) _result.add(" t ");
        if (beat.effect.slapping) _result.add(" s ");
        if (beat.effect.popping) _result.add(" p ");
        if (beat.voices[_voice].duration.isDoubleDotted) _result.add(" dd ");
        if (beat.voices[_voice].duration.isDotted) _result.add(" d ");
        if (beat.effect.stroke.direction !=  BeatStrokeDirection.None)
        {
            if (beat.effect.stroke.direction == BeatStrokeDirection.Up)
            {
                _result.add(" su ");
            }
            else
            {
                _result.add(" sd ");
            }
            
            _result.add(beat.effect.stroke.value);
            _result.add(" ");
        }
        if (!beat.voices[_voice].duration.tuplet.equals(Tuplet.NORMAL))
        {
            _result.add(" tu ");
            _result.add(beat.voices[_voice].duration.tuplet.enters);
            _result.add(" ");
        }
        if (beat.effect.isTremoloBar())
        {
            _result.add(" tb( ");
            for (point in beat.effect.tremoloBar.points)
            {
                _result.add(point.value);
                _result.add(" ");
            }
            _result.add(") ");
        }
    }
    
    private function writeNote(note:Note)
    {
        if (note.isTiedNote)
        {
            _result.add(" -");
        }
        else if (note.effect.deadNote)
        {
            _result.add(" x");
        }
        else
        {
            _result.add(" ");
            _result.add(note.value);
        }
        
        _result.add(".");
        _result.add(note.string);
        _result.add(" ");
        writeNoteEffects(note);
    }
    
    private function writeNoteEffects(note:Note)
    {
        _result.add("{");
        
        if (note.effect.isBend())
        {
            _result.add(" b(");
            for (point in note.effect.bend.points)
            {
                _result.add(point.value);
                _result.add(" ");
            }
            _result.add(") ");
        }
        if (note.effect.isHarmonic())
        {
            switch(note.effect.harmonic.type)
            {
                case HarmonicType.Natural: _result.add(" nh ");
                case HarmonicType.Artificial: _result.add(" ah ");
                case HarmonicType.Tapped: _result.add(" th ");
                case HarmonicType.Pinch: _result.add(" ph ");
                case HarmonicType.Semi: _result.add(" sh ");
            }
        }
        if (note.effect.isGrace())
        {
            _result.add(" gr ");
            
            if (note.effect.grace.isDead)
            {
                _result.add("x ");
            }
            else 
            {
                _result.add(note.effect.grace.fret);
                _result.add(" ");
            }
            
            _result.add(note.effect.grace.duration);
            
            switch(note.effect.grace.transition)
            {
                case GraceEffectTransition.Bend: _result.add(" b ");
                case GraceEffectTransition.Slide: _result.add(" s ");
                case GraceEffectTransition.Hammer: _result.add(" h ");
            }
        }
        if (note.effect.isTrill())
        {
            _result.add(" tr ");
            _result.add(note.effect.trill.fret);
            _result.add(" ");
            _result.add(note.effect.trill.duration.value);
            _result.add(" ");
        }
        if (note.effect.isTremoloPicking())
        {
            _result.add(" tp ");
            _result.add(note.effect.tremoloPicking.duration.value);
            _result.add(" ");
        }
        if (note.effect.vibrato)
        {
            _result.add(" v ");
        }
        if (note.effect.slide)
        {
            switch(note.effect.slideType)
            {
                case SlideType.FastSlideTo: _result.add(" sl ");
                case SlideType.SlowSlideTo: _result.add(" sf ");
            }
        }
        if (note.effect.hammer)
        {
            _result.add(" h ");
        }
        if (note.effect.ghostNote)
        {
            _result.add(" g ");
        }
        if (note.effect.accentuatedNote)
        {
            _result.add(" ac ");
        }
        if (note.effect.heavyAccentuatedNote)
        {
            _result.add(" hac ");
        }
        if (note.effect.palmMute)
        {
            _result.add(" pm ");
        }
        if (note.effect.staccato)
        {
            _result.add(" st ");
        }
        if (note.effect.letRing)
        {
            _result.add(" lr ");
        }

        _result.add("}");
    }
    
    private function writeMeta()
    {
        if (_track.song.title != "")
        { 
            _result.add(" \\title '");
            _result.add(_track.song.title);
            _result.add("'");
        }
        if (_track.song.subtitle != "")
        { 
            _result.add(" \\subtitle '");
            _result.add(_track.song.subtitle);
            _result.add("'");
        }
        if (_track.song.artist != "")
        { 
            _result.add(" \\artist '");
            _result.add(_track.song.artist);
            _result.add("'");
        }
        if (_track.song.album != "")
        { 
            _result.add(" \\album '");
            _result.add(_track.song.album);
            _result.add("'");
        }
        if (_track.song.words != "")
        { 
            _result.add(" \\words '");
            _result.add(_track.song.words);
            _result.add("'");
        }
        if (_track.song.music != "")
        { 
            _result.add(" \\music '");
            _result.add(_track.song.music);
            _result.add("'");
        }
        if (_track.song.copyright != "")
        { 
            _result.add(" \\copyright '");
            _result.add(_track.song.copyright);
            _result.add("'");
        }
        _result.add(" \\tempo ");
        _result.add(_track.song.tempo);
        _currentTempo = _track.song.tempo;
        if (_track.offset != 0)
        { 
            _result.add(" \\capo ");
            _result.add(_track.offset);
        }        
        _result.add(" \\tuning ");
        for (gs in _track.strings)
        {
            _result.add(Tuning.getTextForTuning(gs.value, true));
            _result.add(" ");
        }
        _result.add(" \\instrument ");
        _result.add(_track.channel.instrument());
    }
    
}