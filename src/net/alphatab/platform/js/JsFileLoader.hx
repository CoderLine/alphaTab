package net.alphatab.platform.js;
#if js
import haxe.Http;
import haxe.remoting.Context;
import js.Lib;
import net.alphatab.platform.BinaryReader;
import net.alphatab.platform.FileLoader;

/**
 * This is a fileloader implementation for JavaScript.
 * It uses a ajax request in case of modern browsers like Firefox or Chrome. 
 * For IE a hidden Flash Movie is used to load a binary stream. 
 */
class JsFileLoader implements FileLoader
{
	private static var _requests:Hash<Dynamic> = new Hash<Dynamic>();
	
	public function new()
	{
		
	}
	
	private static function getUid() 
	{
		var value:Int = (((1+Std.random(2400))*0x10000)|0);
		return StringTools.hex(value);
	}
	
	public static function onSuccess(uid:String, data:String)
	{
		if(_requests.exists(uid))
		{
			// decode data			
			var decode = "";
			var i = 0;
			while(i < data.length)
			{
				decode += untyped String.fromCharCode(parseInt('0x' + data.substr(i, 2)));
				i+= 2;
			}
			var request = _requests.get(uid);
			var success:BinaryReader->Void = cast request.success;
			var reader:BinaryReader = new BinaryReader();
			reader.initialize(decode); 
			_requests.remove(uid);
			success(reader);
		}
	}
		
	public static function onError(uid, msg)
	{
		if(_requests.exists(uid))
		{
			var request = _requests.get(uid);
			var error:String->Void = cast request.error;
			error(msg);
			_requests.remove(uid);
		}
	}
		
	
	public function loadBinary(method:String, file:String, success:BinaryReader->Void, error:String->Void) : Void
	{
		if (JQuery.isIE())
		{
			// Register request in list
			var request:Dynamic = { success: success, error: error };
			var uid:String = getUid();
			_requests.set(uid, request);
			
			// start loading within flash loader
			var flashLoader:Dynamic = untyped window['alphaTabFlashLoader'];
			flashLoader.loadFile(file, method, uid);
		}
		else
		{
			var options:Dynamic = cast { };
			options.type = method;
			options.url = file;
			options.success = function(data:String)
			{
				var reader:BinaryReader = new BinaryReader();
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
			
			JQuery.ajax(options);
		}
	}
}
#end