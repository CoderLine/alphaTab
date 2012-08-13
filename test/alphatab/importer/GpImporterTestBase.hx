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

import alphatab.model.AccentuationType;
import alphatab.model.AutomationType;
import alphatab.model.BrushType;
import alphatab.model.Duration;
import alphatab.model.GraceType;
import alphatab.model.HarmonicType;
import alphatab.model.PickStrokeType;
import alphatab.model.Score;
import alphatab.model.SlideType;
import alphatab.model.VibratoType;
import alphatab.platform.PlatformFactory;
import haxe.io.Bytes;
import haxe.io.BytesInput;
import haxe.unit.TestCase;

class GpImporterTestBase extends TestCase
{
    private function prepareImporterWithData(data:Array<Int>) : Gp3To5Importer
    {
        var buffer = Bytes.alloc(data.length);
        for ( b in 0 ... data.length )
        {
            buffer.set(b, data[b]);
        }
        
        return prepareImporterWithBytes(buffer);
    }
    
    private function prepareImporterWithFile(name:String) : Gp3To5Importer
    {
#if neko
        var path = neko.Sys.args()[0];
#elseif js
        var path = "test-files";
#end
        var buffer = PlatformFactory.getLoader().loadBinary(path + "/" + name);
        return prepareImporterWithBytes(buffer);
    }
    
    private function prepareImporterWithBytes(buffer:Bytes) : Gp3To5Importer
    {
        var readerBase = new Gp3To5Importer();
        readerBase.init(new BytesInput(buffer, 0, buffer.length));
        return readerBase;
    }
    
    // 
    // Some general checks or common files
    //
     
    private function checkTest02Score(score:Score)
    {
        var beat:Int;
        
        // Whole Notes
        beat = 0;
        
        var durations = Type.getEnumConstructs(Duration);
        for (durationName in durations)
        {
            var duration = Reflect.field(Duration, durationName);
            assertEquals(1, score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret);
            assertEquals(1, score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string);
            assertEquals(duration, score.tracks[0].bars[0].voices[0].beats[beat].duration);
            beat++;

            assertEquals(2, score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret);
            assertEquals(1, score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string);
            assertEquals(duration, score.tracks[0].bars[0].voices[0].beats[beat].duration);
            beat++;

            assertEquals(3, score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret);
            assertEquals(1, score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string);
            assertEquals(duration, score.tracks[0].bars[0].voices[0].beats[beat].duration);
            beat++;

            assertEquals(4, score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret);
            assertEquals(1, score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string);
            assertEquals(duration, score.tracks[0].bars[0].voices[0].beats[beat].duration);
            beat++;
            
            assertTrue(score.tracks[0].bars[0].voices[0].beats[beat].isRest());
            assertEquals(duration, score.tracks[0].bars[0].voices[0].beats[beat].duration);
            beat++;
        }
    }
   
    private function checkTest03Score(score:Score)
    {
        assertEquals(4, score.masterBars[0].timeSignatureNumerator);
        assertEquals(4, score.masterBars[0].timeSignatureDenominator);
        
        assertEquals(3, score.masterBars[1].timeSignatureNumerator);
        assertEquals(4, score.masterBars[1].timeSignatureDenominator);
        
        assertEquals(2, score.masterBars[2].timeSignatureNumerator);
        assertEquals(4, score.masterBars[2].timeSignatureDenominator);
        
        assertEquals(1, score.masterBars[3].timeSignatureNumerator);
        assertEquals(4, score.masterBars[3].timeSignatureDenominator);
        
        assertEquals(20, score.masterBars[4].timeSignatureNumerator);
        assertEquals(32, score.masterBars[4].timeSignatureDenominator);
    }
    
    public function checkDead(score:Score)
    {
        assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isDead);
        assertEquals(1, score.tracks[0].bars[0].voices[0].beats[0].notes[0].string);
       
        assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[0].isDead);
        assertEquals(2, score.tracks[0].bars[0].voices[0].beats[1].notes[0].string);
        
        assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].isDead);
        assertEquals(3, score.tracks[0].bars[0].voices[0].beats[2].notes[0].string);
        
        assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isDead);
        assertEquals(4, score.tracks[0].bars[0].voices[0].beats[3].notes[0].string);
    }
    
    public function checkGrace(score:Score)
    {
        assertEquals(GraceType.BeforeBeat, score.tracks[0].bars[0].voices[0].beats[0].graceType);
        assertEquals(3, score.tracks[0].bars[0].voices[0].beats[0].notes[0].fret);
        assertEquals(Duration.ThirtySecond, score.tracks[0].bars[0].voices[0].beats[0].duration);
        assertEquals(2, score.tracks[0].bars[0].voices[0].beats[1].notes[0].fret);
        assertEquals(Duration.Quarter, score.tracks[0].bars[0].voices[0].beats[1].duration);
       
        assertEquals(GraceType.BeforeBeat, score.tracks[0].bars[0].voices[0].beats[2].graceType);
        assertEquals(2, score.tracks[0].bars[0].voices[0].beats[2].notes[0].fret);
        assertEquals(Duration.ThirtySecond, score.tracks[0].bars[0].voices[0].beats[2].duration);
        assertEquals(2, score.tracks[0].bars[0].voices[0].beats[3].notes[0].fret);
        assertEquals(Duration.Quarter, score.tracks[0].bars[0].voices[0].beats[3].duration);
    } 
    
    public function checkAccentuation(score:Score, includeHeavy:Bool)
    {
        assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isGhost);
        assertEquals(AccentuationType.Normal, score.tracks[0].bars[0].voices[0].beats[1].notes[0].accentuated);
        if (includeHeavy)
        {
            assertEquals(AccentuationType.Heavy, score.tracks[0].bars[0].voices[0].beats[2].notes[0].accentuated);
        }
        assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isLetRing);
    }
    
    public function checkHarmonics(score:Score)
    {
        assertEquals(HarmonicType.Natural, score.tracks[0].bars[0].voices[0].beats[0].notes[0].harmonicType);
        assertEquals(HarmonicType.Artificial, score.tracks[0].bars[0].voices[0].beats[1].notes[0].harmonicType);
        assertEquals(HarmonicType.Tap, score.tracks[0].bars[0].voices[0].beats[2].notes[0].harmonicType);
        assertEquals(HarmonicType.Semi, score.tracks[0].bars[0].voices[0].beats[3].notes[0].harmonicType);
        assertEquals(HarmonicType.Pinch, score.tracks[0].bars[0].voices[0].beats[4].notes[0].harmonicType);
        // TODO: Harmonic Values
    }
    
    public function checkHammer(score:Score)
    {
        assertEquals(false, score.tracks[0].bars[0].voices[0].beats[0].notes[0].isHammerPullOrigin);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[1].isHammerPullOrigin);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[2].isHammerPullOrigin);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[3].isHammerPullOrigin);
        
        assertEquals(false, score.tracks[0].bars[0].voices[0].beats[1].notes[0].isHammerPullDestination);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[1].isHammerPullDestination);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[2].isHammerPullDestination);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[3].isHammerPullDestination);
       
        assertTrue(score.tracks[0].bars[1].voices[0].beats[0].notes[0].isHammerPullOrigin);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[1].notes[0].isHammerPullOrigin);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[2].notes[0].isHammerPullDestination);
    }
    
    public function checkBend(score:Score)
    {
        assertEquals(3, score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints.length);
       
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].offset);
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].value);
        
        assertEquals(15, score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].offset);
        assertEquals(4, score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].value);
        
        assertEquals(60, score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[2].offset);
        assertEquals(4, score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[2].value);
       
        assertEquals(7, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints.length);
       
        
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].offset);
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].value);
        
        assertEquals(10, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].offset);
        assertEquals(4, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].value);
        
        assertEquals(20, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[2].offset);
        assertEquals(4, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[2].value);
        
        assertEquals(30, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[3].offset);
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[3].value);
        
        assertEquals(40, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[4].offset);
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[4].value);
        
        assertEquals(50, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[5].offset);
        assertEquals(4, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[5].value);
       
        assertEquals(60, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[6].offset);
        assertEquals(4, score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[6].value);
    }
    
    public function checkTremolo(score:Score)
    {
        assertEquals(3, score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints.length);
       
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[0].offset);
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[0].value);
        
        assertEquals(30, score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[1].offset);
        assertEquals(-4, score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[1].value);
        
        assertEquals(60, score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[2].offset);
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[2].value);
       
        assertEquals(3, score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints.length);
       
        assertEquals(0, score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[0].offset);
        assertEquals(-4, score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[0].value);
        
        assertEquals(45, score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[1].offset);
        assertEquals(-4, score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[1].value);
        
        assertEquals(60, score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[2].offset);
        assertEquals(0, score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[2].value);
       
        assertEquals(3, score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints.length);
       
        assertEquals(0, score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[0].offset);
        assertEquals(0, score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[0].value);
        
        assertEquals(45, score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[1].offset);
        assertEquals(-4, score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[1].value);
        
        assertEquals(60, score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[2].offset);
        assertEquals(-4, score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[2].value);
       
    }
    
    public function checkSlides(score:Score)
    {
        assertEquals(SlideType.Legato, score.tracks[0].bars[0].voices[0].beats[0].getNoteOnString(5).slideType);
        assertEquals(SlideType.Shift, score.tracks[0].bars[0].voices[0].beats[2].getNoteOnString(2).slideType);
        assertEquals(SlideType.IntoFromBelow, score.tracks[0].bars[1].voices[0].beats[0].getNoteOnString(5).slideType);
        assertEquals(SlideType.IntoFromAbove, score.tracks[0].bars[1].voices[0].beats[1].getNoteOnString(5).slideType);
        assertEquals(SlideType.OutDown, score.tracks[0].bars[1].voices[0].beats[2].getNoteOnString(5).slideType);
        assertEquals(SlideType.OutUp, score.tracks[0].bars[1].voices[0].beats[3].getNoteOnString(5).slideType);
    } 
    
    public function checkVibrato(score:Score)
    {
        assertEquals(VibratoType.Slight, score.tracks[0].bars[0].voices[0].beats[0].notes[0].vibrato);
        assertEquals(VibratoType.Slight, score.tracks[0].bars[0].voices[0].beats[1].notes[0].vibrato);
        
        assertEquals(VibratoType.Slight, score.tracks[0].bars[0].voices[0].beats[2].vibrato);
        assertEquals(VibratoType.Slight, score.tracks[0].bars[0].voices[0].beats[3].vibrato);
    } 
    
    public function checkTrills(score:Score)
    {
        assertEquals(2, score.tracks[0].bars[0].voices[0].beats[0].notes[0].trillFret);
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[1].notes[0].trillSpeed);
        
        assertTrue(score.tracks[0].bars[0].voices[0].beats[1].isTremolo());
        assertEquals(3, score.tracks[0].bars[0].voices[0].beats[1].tremoloSpeed);
        
        assertTrue(score.tracks[0].bars[0].voices[0].beats[2].isTremolo());
        assertEquals(2, score.tracks[0].bars[0].voices[0].beats[2].tremoloSpeed);
        
        assertTrue(score.tracks[0].bars[0].voices[0].beats[3].isTremolo());
        assertEquals(1, score.tracks[0].bars[0].voices[0].beats[3].tremoloSpeed);
    } 
    
    public function checkOtherEffects(score:Score)
    {
        assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isPalmMute);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[0].isStaccato);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].tapping);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[3].slap);
        
        assertTrue(score.tracks[0].bars[1].voices[0].beats[0].pop);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[1].fadeIn);
        
        assertTrue(score.tracks[0].bars[3].voices[0].beats[0].hasChord());
        assertEquals("C", score.tracks[0].bars[3].voices[0].beats[0].chord.name);
        assertEquals("Text", score.tracks[0].bars[3].voices[0].beats[1].text);
        assertTrue(score.masterBars[4].isDoubleBar);
        assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Tempo) != null);
        assertEquals(120.0, score.tracks[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Tempo).value);
        assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument) != null);
        assertEquals(25.0, score.tracks[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument).value);
    } 
    
    public function checkFingering(score:Score)
    {
        assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isFingering);
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger);
        assertEquals(1, score.tracks[0].bars[0].voices[0].beats[1].notes[0].leftHandFinger);
        assertEquals(2, score.tracks[0].bars[0].voices[0].beats[2].notes[0].leftHandFinger);
        assertEquals(3, score.tracks[0].bars[0].voices[0].beats[3].notes[0].leftHandFinger);
        assertEquals(4, score.tracks[0].bars[0].voices[0].beats[4].notes[0].leftHandFinger);
        assertEquals(0, score.tracks[0].bars[0].voices[0].beats[5].notes[0].rightHandFinger);
        assertEquals(1, score.tracks[0].bars[0].voices[0].beats[6].notes[0].rightHandFinger);
        assertEquals(2, score.tracks[0].bars[0].voices[0].beats[7].notes[0].rightHandFinger);
        assertEquals(3, score.tracks[0].bars[0].voices[0].beats[8].notes[0].rightHandFinger);
        assertEquals(4, score.tracks[0].bars[0].voices[0].beats[9].notes[0].rightHandFinger);
    }
    
    public function checkStroke(score:Score)
    {
        assertEquals(BrushType.BrushDown,score.tracks[0].bars[0].voices[0].beats[0].brushType);
        assertEquals(BrushType.BrushUp,score.tracks[0].bars[0].voices[0].beats[1].brushType);
        assertEquals(PickStrokeType.Up,score.tracks[0].bars[0].voices[0].beats[2].pickStroke);
        assertEquals(PickStrokeType.Down,score.tracks[0].bars[0].voices[0].beats[3].pickStroke);
    }
    
    public function checkTuplets(score:Score)
    {
        assertEquals(3,score.tracks[0].bars[0].voices[0].beats[0].tupletNumerator);
        assertEquals(3,score.tracks[0].bars[0].voices[0].beats[1].tupletNumerator);
        assertEquals(3,score.tracks[0].bars[0].voices[0].beats[2].tupletNumerator);
        
        assertEquals(5,score.tracks[0].bars[1].voices[0].beats[0].tupletNumerator);
        assertEquals(5,score.tracks[0].bars[1].voices[0].beats[1].tupletNumerator);
        assertEquals(5,score.tracks[0].bars[1].voices[0].beats[2].tupletNumerator);
        assertEquals(5,score.tracks[0].bars[1].voices[0].beats[3].tupletNumerator);
        assertEquals(5,score.tracks[0].bars[1].voices[0].beats[4].tupletNumerator);
    }
       
    public function checkRanges(score:Score)
    {
        assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isPalmMute);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[0].isPalmMute);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].isPalmMute);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isPalmMute);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[0].notes[0].isPalmMute);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[0].notes[0].isPalmMute);
        
        assertTrue(score.tracks[0].bars[1].voices[0].beats[1].notes[0].isLetRing);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[2].notes[0].isLetRing);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[3].notes[0].isLetRing);
        assertTrue(score.tracks[0].bars[2].voices[0].beats[0].notes[0].isLetRing);
    }
       
    public function checkEffects(score:Score)
    {
        // just check if reading works
        assertTrue(true);
    }
}