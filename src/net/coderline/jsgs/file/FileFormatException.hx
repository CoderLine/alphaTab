/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.file;
import haxe.io.Error;

class FileFormatException 
{
	public var Message:String;
	public function new(message:String = "") 
	{
		this.Message = message;
	}	
}