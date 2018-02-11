import massive.munit.TestSuite;

import alphaTab.test.audio.MidiFileGeneratorTest;
import alphaTab.test.audio.MidiPlaybackControllerTest;
import alphaTab.test.importer.AlphaTexImporterTest;
import alphaTab.test.importer.Gp3ImporterTest;
import alphaTab.test.importer.Gp4ImporterTest;
import alphaTab.test.importer.Gp5ImporterTest;
import alphaTab.test.importer.GpxImporterTest;
import alphaTab.test.model.LyricsTest;
import alphaTab.test.model.TuningParserTest;
import alphaTab.test.xml.XmlParseTest;
import ExampleTest;

/**
 * Auto generated Test Suite for MassiveUnit.
 * Refer to munit command line tool for more information (haxelib run munit)
 */

class TestSuite extends massive.munit.TestSuite
{		

	public function new()
	{
		super();

		add(alphaTab.test.audio.MidiFileGeneratorTest);
		add(alphaTab.test.audio.MidiPlaybackControllerTest);
		add(alphaTab.test.importer.AlphaTexImporterTest);
		add(alphaTab.test.importer.Gp3ImporterTest);
		add(alphaTab.test.importer.Gp4ImporterTest);
		add(alphaTab.test.importer.Gp5ImporterTest);
		add(alphaTab.test.importer.GpxImporterTest);
		add(alphaTab.test.model.LyricsTest);
		add(alphaTab.test.model.TuningParserTest);
		add(alphaTab.test.xml.XmlParseTest);
		add(ExampleTest);
	}
}
