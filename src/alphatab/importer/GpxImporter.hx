package alphatab.importer;
import alphatab.model.Score;

/**
 * This ScoreImporter can read Guitar Pro 6 (gpx) files.
 */
class GpxImporter extends ScoreImporter
{

	public function new() 
	{
		super();
	}
	
	public override function readScore():Score 
	{
		// at first we need to load the binary file system 
		// from the GPX container
		var fileSystem = new GpxFileSystem();
		fileSystem.load(_data);
		
		// the score.gpif file within this filesystem stores
		// the score information as XML we need to parse.
		var parser = new GpxParser();
		parser.parseXml(fileSystem.loadScoreGpif());
				
		
		return parser.getScore();
	}
}