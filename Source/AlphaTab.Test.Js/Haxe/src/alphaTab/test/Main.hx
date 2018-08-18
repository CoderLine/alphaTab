package alphaTab.test;

import alphaTab.test.audio.MidiFileGeneratorTest;
import alphaTab.test.audio.MidiPlaybackControllerTest;
import alphaTab.test.audio.AlphaSynthTests;

import alphaTab.test.importer.AlphaTexImporterTest;
import alphaTab.test.importer.Gp3ImporterTest;
import alphaTab.test.importer.Gp4ImporterTest;
import alphaTab.test.importer.Gp5ImporterTest;
import alphaTab.test.importer.GpxImporterTest;
import alphaTab.test.importer.Gp7ImporterTest;
import alphaTab.test.importer.MusicXmlImporterSamplesTests;
import alphaTab.test.importer.MusicXmlImporterTestSuiteTests;

import alphaTab.test.model.LyricsTest;
import alphaTab.test.model.TuningParserTest;

import alphaTab.test.xml.XmlParseTest;

class Main 
{
	static function main() 
	{
		var allresources = haxe.Resource.listNames();
		var loaded = 0;
		
		trace('Loading resources ('+loaded+'/' + allresources.length + ')');
		
		var resourceContent : Array<{ name : String, data : String, str : String }> = Reflect.getProperty(haxe.Resource, "content");
		
		for(res in allresources)
		{
			var xhr = new js.html.XMLHttpRequest();
			xhr.open("GET", res, true);
			untyped xhr.resource = res;
			xhr.responseType = js.html.XMLHttpRequestResponseType.ARRAYBUFFER;
			xhr.onreadystatechange = function(e)
			{
				var currentRes = untyped __js__("this.resource");
				
				if(xhr.readyState == js.html.XMLHttpRequest.DONE)
				{
					loaded++;
					trace('Loading resources ('+loaded+'/' + allresources.length + ')');
					var e:js.html.CustomEvent = cast js.Browser.document.createEvent("CustomEvent");
					e.initCustomEvent("alphaTab.test.status", false, false, {
						message: 'Loading resources ('+loaded+'/' + allresources.length + ')'
					});
					js.Browser.document.dispatchEvent(e);
					
					var response:js.html.ArrayBuffer = xhr.response;
					var resourceData = haxe.crypto.Base64.encode(haxe.io.Bytes.ofData(response));
					
					for(r in resourceContent)
					{
						if(r.name == currentRes)
						{
							r.data = resourceData;
						}					
					}
					
					if(loaded == allresources.length)
					{	
						trace('Launching tests');
						e = cast js.Browser.document.createEvent("CustomEvent");
						e.initCustomEvent("alphaTab.test.run", false, false, null);
						js.Browser.document.dispatchEvent(e);
					}
				}
			};
			xhr.send();
		}
	}
}