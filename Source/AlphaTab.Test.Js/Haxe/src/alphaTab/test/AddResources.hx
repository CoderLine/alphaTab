package alphaTab.test;

class AddResources
{
	private static var Extensions = [".gp3", ".gp4", ".gp5", ".gpx", ".gp", ".xml", ".sf2"];
	public static macro function run()
	{
		var sourceDir = haxe.io.Path.join([Sys.getCwd(), "..", "AlphaTab.Test", "TestFiles"]);
		trace('Adding resources from '+ sourceDir);
		
		var resourcePrefix = "TestFiles";
		
		importRecursive(sourceDir, resourcePrefix);
		
		return macro null;
	}
	
	public static function importRecursive(sourceDir:String, sourcePrefix:String)
	{
		var files = sys.FileSystem.readDirectory(sourceDir);
		trace('Adding resources from '+ sourceDir);
		for(file in files)
		{
			var fullName = haxe.io.Path.join([sourceDir, file]);
			var resourceName = sourcePrefix + "/" + file;
			if(sys.FileSystem.isDirectory(fullName))
			{
				importRecursive(fullName, resourceName);
			}
			else
			{
				var i = file.lastIndexOf(".");
				if(i >= 0)
				{
					var ext = file.substring(i);
					if(Extensions.indexOf(ext) != -1)
					{
						haxe.macro.Context.addResource(resourceName, haxe.io.Bytes.alloc(0));
					}
				}
			}
		}
	}
}
