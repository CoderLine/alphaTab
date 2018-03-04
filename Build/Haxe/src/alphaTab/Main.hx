package alphaTab;

// model 
import alphaTab.model.Score;

// importer/exporter 
import alphaTab.importer.ScoreImporter;
import alphaTab.exporter.AlphaTexExporter;

// audio
import alphaTab.audio.generator.MidiFileGenerator;

// rendering
import alphaTab.rendering.ScoreRenderer;

// api
import alphaTab.platform.javaScript.AlphaTabApi;


class Main 
{
	static function main() 
	{
		alphaTab.Environment.Init();
	}
}