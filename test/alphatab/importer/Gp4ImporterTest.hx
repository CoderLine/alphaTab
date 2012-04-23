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

class Gp4ImporterTest extends GpImporterTestBase
{
    public function new() 
    {
        super();
    }
    
    public function testScoreInfo()
    {
        var reader = prepareImporterWithFile("Test01.gp4");
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
        var reader = prepareImporterWithFile("Test02.gp4");
        var score = reader.readScore();
        checkTest02Score(score);
    }
 
    public function testTimeSignatures()
    {
        var reader = prepareImporterWithFile("Test03.gp4");
        var score = reader.readScore();
        
        checkTest03Score(score);
    }

    public function testDead() 
    {
        var reader = prepareImporterWithFile("TestDead.gp4");
        var score = reader.readScore();
        checkDead(score);
    }  

    public function testGrace() 
    {
        var reader = prepareImporterWithFile("TestGrace.gp4");
        var score = reader.readScore();
        checkGrace(score);
    }    

    public function testAccentuation() 
    {
        var reader = prepareImporterWithFile("TestAccentuations.gp4");
        var score = reader.readScore();
        checkAccentuation(score, false);
    }    

    public function testHarmonics() 
    {
        var reader = prepareImporterWithFile("TestHarmonics.gp4");
        var score = reader.readScore();
        checkHarmonics(score);
    }    

    public function testHammer() 
    {
        var reader = prepareImporterWithFile("TestHammer.gp4");
        var score = reader.readScore();
        checkHammer(score);
    }
 
    public function testBend() 
    {
        var reader = prepareImporterWithFile("TestBends.gp4");
        var score = reader.readScore();
        checkBend(score);
    }   

    public function testTremolo() 
    {
        var reader = prepareImporterWithFile("TestTremolo.gp4");
        var score = reader.readScore();
        checkTremolo(score);
    }    

    public function testSlides() 
    {
        var reader = prepareImporterWithFile("TestSlides.gp4");
        var score = reader.readScore();
        checkSlides(score);
    }    

    public function testVibrato() 
    {
        var reader = prepareImporterWithFile("TestVibrato.gp4");
        var score = reader.readScore();
        checkVibrato(score);
    } 

    public function testTrills() 
    {
        var reader = prepareImporterWithFile("TestTrills.gp4");
        var score = reader.readScore();
        checkTrills(score);
    }    

    public function testOtherEffects() 
    {
        var reader = prepareImporterWithFile("TestOtherEffects.gp4");
        var score = reader.readScore();
        checkOtherEffects(score);
    }     

    public function testFingering() 
    {
        var reader = prepareImporterWithFile("TestFingering.gp4");
        var score = reader.readScore();
        checkFingering(score);
    }  

    public function testStroke() 
    {
        var reader = prepareImporterWithFile("TestStrokes.gp4");
        var score = reader.readScore();
        checkStroke(score);
    }  

    public function testTuplets() 
    {
        var reader = prepareImporterWithFile("TestTuplets.gp4");
        var score = reader.readScore();
        checkTuplets(score);
    }    

    public function testRanges() 
    {
        var reader = prepareImporterWithFile("TestRanges.gp4");
        var score = reader.readScore();
        checkRanges(score);
    }    

    public function testEffects() 
    {
        var reader = prepareImporterWithFile("Effects.gp4");
        var score = reader.readScore();
        checkEffects(score);
    }  
    
    //public function testFade()
    //{
    //    var reader = prepareImporterWithFile("Serenade.gp5");
    //    var score = reader.readScore();
    //    assertTrue(true);
    //}    
}