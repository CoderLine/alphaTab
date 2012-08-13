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

import alphatab.model.AutomationType;
import alphatab.model.BrushType;
import alphatab.model.DynamicValue;
import alphatab.model.SlideType;
import haxe.unit.TestCase;

class Gp3ImporterTest extends GpImporterTestBase
{
    public function new()
    {
        super();
    }
    
    public function testScoreInfo()
    {
        var reader = prepareImporterWithFile("Test01.gp3");
        var score = reader.readScore();
        
        assertEquals("Title", score.title);
        assertEquals("Subtitle", score.subTitle);
        assertEquals("Artist", score.artist);
        assertEquals("Album", score.album);
        assertEquals("Music", score.words); // no words in gp4
        assertEquals("Music", score.music);
        assertEquals("Copyright", score.copyright);
        assertEquals("Tab", score.tab);
        assertEquals("Instructions", score.instructions);
        assertEquals("Notice1\nNotice2", score.notices);
        assertEquals(5, score.masterBars.length);
        assertEquals(1, score.tracks.length);
        assertEquals("Track 1", score.tracks[0].name);
    }
    
    public function testNotes()
    {
        var reader = prepareImporterWithFile("Test02.gp3");
        var score = reader.readScore();
        checkTest02Score(score);
    }
    
    public function testTimeSignatures()
    {
        var reader = prepareImporterWithFile("Test03.gp3");
        var score = reader.readScore();
        
        checkTest03Score(score);
    }
        
    public function testDead() 
    {
        var reader = prepareImporterWithFile("TestDead.gp3");
        var score = reader.readScore();
        checkDead(score);
    }
    
    public function testAccentuation() 
    {
        var reader = prepareImporterWithFile("TestAccentuations.gp3");
        var score = reader.readScore();
        
        assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isGhost);
        // it seems accentuation is handled as Forte Fortissimo
        assertEquals(DynamicValue.FFF, score.tracks[0].bars[0].voices[0].beats[1].notes[0].dynamicValue);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isLetRing);
    }

   // TODO: Find out about GP3 harmonics!
   // public function testGuitarPro3Harmonics() 
   // {
   //     var reader = prepareImporterWithFile("TestHarmonics.gp3");
   //     var score = reader.readScore();
   //     
   //     assertEquals(HarmonicType.Natural, score.tracks[0].bars[0].voices[0].beats[0].notes[0].harmonicType);
   //     assertEquals(HarmonicType.Artificial, score.tracks[0].bars[0].voices[0].beats[1].notes[0].harmonicType);
   // }
    
    public function testHammer() 
    {
        var reader = prepareImporterWithFile("TestHammer.gp3");
        var score = reader.readScore();
        checkHammer(score);
    }
    
    public function testBend() 
    {
        var reader = prepareImporterWithFile("TestBends.gp3");
        var score = reader.readScore();
        checkBend(score);
    }
    
    public function testSlides() 
    {
        var reader = prepareImporterWithFile("TestSlides.gp3");
        var score = reader.readScore();
        
        assertEquals(SlideType.Shift, score.tracks[0].bars[0].voices[0].beats[0].getNoteOnString(5).slideType);
        assertEquals(SlideType.Shift, score.tracks[0].bars[0].voices[0].beats[2].getNoteOnString(2).slideType);
    }
    
    // TODO: Check why this vibrato is not recognized
    // public function testGuitarPro3Vibrato() 
    // {
    //     var reader = prepareImporterWithFile("TestVibrato.gp3");
    //     var score = reader.readScore();
    //     checkVibrato(score);
    // } 
    
    public function testOtherEffects() 
    {
        var reader = prepareImporterWithFile("TestOtherEffects.gp3");
        var score = reader.readScore();
               
        assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].tapping);
        assertTrue(score.tracks[0].bars[0].voices[0].beats[3].slap);
        
        assertTrue(score.tracks[0].bars[1].voices[0].beats[0].pop);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[1].fadeIn);
        
        assertTrue(score.tracks[0].bars[3].voices[0].beats[0].hasChord());
        assertEquals("C", score.tracks[0].bars[3].voices[0].beats[0].chord.name);
        assertEquals("Text", score.tracks[0].bars[3].voices[0].beats[1].text);
        assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Tempo) != null);
        assertEquals(120.0, score.tracks[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Tempo).value);
        assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument) != null);
        assertEquals(25.0, score.tracks[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument).value);
    } 

    public function testStroke() 
    {
        var reader = prepareImporterWithFile("TestStrokes.gp3");
        var score = reader.readScore();
        
        assertEquals(BrushType.BrushDown,score.tracks[0].bars[0].voices[0].beats[0].brushType);
        assertEquals(BrushType.BrushUp,score.tracks[0].bars[0].voices[0].beats[1].brushType);
    }
    
    public function testTuplets() 
    {
        var reader = prepareImporterWithFile("TestTuplets.gp3");
        var score = reader.readScore();
        checkTuplets(score);
    }
    
    public function testRanges() 
    {
        var reader = prepareImporterWithFile("TestRanges.gp3");
        var score = reader.readScore();
        
        assertTrue(score.tracks[0].bars[1].voices[0].beats[1].notes[0].isLetRing);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[2].notes[0].isLetRing);
        assertTrue(score.tracks[0].bars[1].voices[0].beats[3].notes[0].isLetRing);
        assertTrue(score.tracks[0].bars[2].voices[0].beats[0].notes[0].isLetRing);
    }
        
    public function testEffects() 
    {
        var reader = prepareImporterWithFile("Effects.gp3");
        var score = reader.readScore();
        checkEffects(score);
    }
}