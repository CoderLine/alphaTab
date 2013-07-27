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
        if (xml.nodeType == Xml.Document)
        {
            xml = xml.firstElement();
        }
        
        
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
                if (n.nodeType == Xml.Element)
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
            if (c.nodeType == Xml.Element)
            {
                switch(c.nodeName)
                {
                    case "Title": score.title = c.firstChild().toString();
                    case "SubTitle": score.subTitle = c.firstChild().toString();
                    case "Artist": score.artist = c.firstChild().toString();
                    case "Album": score.album = c.firstChild().toString();
                    case "Words": score.words = c.firstChild().toString();
                    case "Music": score.music = c.firstChild().toString();
                    case "WordsAndMusic": if (c.firstChild() != null && c.firstChild().toString() != "") { score.words = c.firstChild().toString(); score.music = c.firstChild().toString(); } 
                    case "Copyright": score.copyright = c.firstChild().toString();
                    case "Tabber": score.tab = c.firstChild().toString();
                }
            }
		}
	}
}