package alphatab.importer;
import alphatab.model.Score;
import haxe.xml.Fast;

/**
 * This class can parse a score.gpif xml file into the model structure
 */
class GpxParser 
{
	public var score:Score;
	
	public function new() 
	{
		
	}
	
	public function parseXml(xml:String)
	{
		var dom = Xml.parse(xml);
		parseDom(dom);		
	}
	
	public function parseDom(xml:Xml)
	{
		// the XML uses IDs for referring elements within the 
		// model. Therefore we do the parsing in 2 steps:
		// - at first we read all model elements and store them by ID in a lookup table
		// - after that we need to join up the information. 
		
		if (xml.nodeName == "GPIF")
		{
			score = new Score();
			
			// parse all children
			for (n in xml)
			{
				switch(n.nodeName)
				{
					case "Score":
						parseScoreNode(n);
					// TODO: A lot of xml parsing work :(
					// case "MasterTrack":
					// 	parseMasterTrackNode(n);
					// case "Tracks":
					// 	parseTrackNode(n);
					// case "MasterBars":
					// 	parseMasterBarNode(n);
					// case "Bars":
					// 	parseBars(n)
					// case "Voices":
					// 	parseDomVoices(n);
					// case "Beats":
					// 	parseBeats(n);
					// case "Notes":
					// 	parseNotes(n);
					// case "Rhythms":
					// 	parseRhythms(n);
				}
			}
		}
		else
		{
			throw ScoreImporter.UNSUPPORTED_FORMAT;
		}
	}
	
	private function parseScoreNode(node:Xml)
	{
		for (c in node)
		{
			switch(c.nodeName)
			{
				case "Title": score.title = c.nodeValue;
				case "SubTitle": score.subTitle = c.nodeValue;
				case "Artist": score.artist = c.nodeValue;
				case "Album": score.album = c.nodeValue;
				case "Words": score.words = c.nodeValue;
				case "Music": score.music = c.nodeValue;
				case "WordsAndMusic": if (c.nodeValue != null && c.nodeValue != "") { score.words = c.nodeValue; score.music = c.nodeValue; } 
				case "Copyright": score.copyright = c.nodeValue;
				case "Tabber": score.tab = c.nodeValue;
			}
		}
	}
}