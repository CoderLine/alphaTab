package net.alphatab.file;

/**
 * This Exception is thrown on file reading errors. 
 */
class FileFormatException 
{
	public var message:String;
	
	public function new(str:String = "") 
	{
		message = str;
	}	
}