/**
 * ...
 * @author Zenas
 */

package net.alphatab.platform.php;
#if php
import haxe.Http;
import haxe.io.Bytes;
import net.alphatab.platform.BinaryReader;
import net.alphatab.platform.FileLoader;
import php.io.File;

class PhpFileLoader implements FileLoader
{
	public function new()
	{
		
	}
	
	public function LoadBinary(method:String, file:String, success:BinaryReader->Void, error:String->Void) : Void
	{
		try
		{
			var data:String = File.getContent(file);
			var reader:BinaryReader = new BinaryReader();
			reader.initialize(data);
			success(reader);
		}
		catch (e:Dynamic)
		{
			error(Std.string(e));
		}
	}
}
#end