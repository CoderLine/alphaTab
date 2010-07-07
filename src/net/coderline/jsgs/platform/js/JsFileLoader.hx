/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.platform.js;
import net.coderline.jsgs.platform.BinaryReader;
import net.coderline.jsgs.platform.FileLoader;

class JsFileLoader implements FileLoader
{
	public function new()
	{
		
	}
	
	public function LoadBinary(method:String, file:String, success:BinaryReader->Void, error:String->Void) : Void
	{
		var options:Dynamic = cast { };
		options.type = method;
		options.url = file;
		options.success = function(data:String)
		{
			var reader:BinaryReader = new JsBinaryReader();
			reader.initialize(data);
			success(reader);
		}
		options.error = function(x:Dynamic, e:String)
		{
			if(x.status==0){
				error('You are offline!!\n Please Check Your Network.');
			}else if(x.status==404){
				error('Requested URL not found.');
			}else if(x.status==500){
				error('Internel Server Error.');
			}else if(e=='parsererror'){
				error('Error.\nParsing JSON Request failed.');
			}else if(e=='timeout'){
				error('Request Time out.');
			}else {
				error('Unknow Error.\n'+x.responseText);
			}
		}
		
		options.beforeSend = function(xhr:Dynamic) {
			untyped
			{
				if (xhr.overrideMimeType)
				{
					xhr.overrideMimeType('text/plain; charset=x-user-defined');
				}
			}
		}
		
		JQuery.Ajax(options);
	}
}