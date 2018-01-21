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


class Main 
{
	static function main() 
	{
		alphaTab.platform.javaScript.JsWorker.Init();
	}
}