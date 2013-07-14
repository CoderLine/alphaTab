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
import alphatab.model.DynamicValue;
import alphatab.model.GraceType;
import alphatab.model.HarmonicType;
import alphatab.model.PickStrokeType;
import alphatab.model.Score;
import alphatab.model.SlideType;
import alphatab.model.VibratoType;
import haxe.io.Bytes;
import haxe.io.BytesData;
import haxe.io.BytesInput;
import haxe.unit.TestCase;

class Gp5ImporterTest extends GpImporterTestBase
{
    public function new()
    {
        super();
    }
    
    public function testScoreInfo()
    {
        var reader = prepareImporterWithFile("Test01.gp5");
        var score = reader.readScore();
        
        assertEquals("Title", score.title);
        assertEquals("Subtitle", score.subTitle);
        assertEquals("Artist", score.artist);
        assertEquals("Album", score.album);
        assertEquals("Words", score.words);
        assertEquals("Music", score.music);
        assertEquals("Copyright", score.copyright);
        assertEquals("Tab", score.tab);
        assertEquals("Instructions", score.instructions);
        assertEquals("Notice1\nNotice2", score.notices);
        assertEquals(5, score.masterBars.length);
        assertEquals(2, score.tracks.length);
        assertEquals("Track 1", score.tracks[0].name);
        assertEquals("Track 2", score.tracks[1].name);
    }

    public function testNotes()
    {
        var reader = prepareImporterWithFile("Test02.gp5");
        var score = reader.readScore();
        checkTest02Score(score);
    }
    
    public function testTimeSignatures()
    {
        var reader = prepareImporterWithFile("Test03.gp5");
        var score = reader.readScore();
        
        checkTest03Score(score);
    }

    public function testDead() 
    {
        var reader = prepareImporterWithFile("TestDead.gp5");
        var score = reader.readScore();
        checkDead(score);
    }

    public function testGrace() 
    {
        var reader = prepareImporterWithFile("TestGrace.gp5");
        var score = reader.readScore();
        checkGrace(score);
    }

    public function testAccentuation() 
    {
        var reader = prepareImporterWithFile("TestAccentuations.gp5");
        var score = reader.readScore();
        checkAccentuation(score, true);
    }

    public function testHarmonics() 
    {
        var reader = prepareImporterWithFile("TestHarmonics.gp5");
        var score = reader.readScore();
        checkHarmonics(score);
    }

    public function testHammer() 
    {
        var reader = prepareImporterWithFile("TestHammer.gp5");
        var score = reader.readScore();
        checkHammer(score);
    }

    public function testBend() 
    {
        var reader = prepareImporterWithFile("TestBends.gp5");
        var score = reader.readScore();
        checkBend(score);
    }

    public function testTremolo() 
    {
        var reader = prepareImporterWithFile("TestTremolo.gp5");
        var score = reader.readScore();
        checkTremolo(score);
    }

    public function testSlides() 
    {
        var reader = prepareImporterWithFile("TestSlides.gp5");
        var score = reader.readScore();
        checkSlides(score);
    }

    public function testVibrato() 
    {
        var reader = prepareImporterWithFile("TestVibrato.gp5");
        var score = reader.readScore();
        checkVibrato(score);
    }
    
    public function testTrills() 
    {
        var reader = prepareImporterWithFile("TestTrills.gp5");
        var score = reader.readScore();
        checkTrills(score);
    }

    public function testOtherEffects() 
    {
        var reader = prepareImporterWithFile("TestOtherEffects.gp5");
        var score = reader.readScore();
        checkOtherEffects(score);
    }

    public function testFingering() 
    {
        var reader = prepareImporterWithFile("TestFingering.gp5");
        var score = reader.readScore();
        checkFingering(score);
    }

    public function testStroke() 
    {
        var reader = prepareImporterWithFile("TestStrokes.gp5");
        var score = reader.readScore();
        checkStroke(score);
    }
    
    public function testTuplets() 
    {
        var reader = prepareImporterWithFile("TestTuplets.gp5");
        var score = reader.readScore();
        checkTuplets(score);
    }
       
    public function testRanges() 
    {
        var reader = prepareImporterWithFile("TestRanges.gp5");
        var score = reader.readScore();
        checkRanges(score);
    }
       
    public function testEffects() 
    {
        var reader = prepareImporterWithFile("Effects.gp5");
        var score = reader.readScore();
        checkEffects(score);
    }       
    
    public function testSerenade() 
    {
        var reader = prepareImporterWithFile("Serenade.gp5");
        var score = reader.readScore();
        assertTrue(true); // only check reading
    }
}
