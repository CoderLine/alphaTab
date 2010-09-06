package net.alphatab.file;

/**
 * This Exception is thrown on file reading errors. 
 */
class FileFormatException 
{
	/**
	 * The error message.
	 */
	public var message:String;
	
	/**
	 * Initializes a new instance of this class.
	 * @param message The error message
	 */
	public function new(message:String = "") 
	{
		this.message = message;
	}	
}