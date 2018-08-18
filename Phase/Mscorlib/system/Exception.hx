package system;

class Exception 
{
	public var Message(default, null):String;
	
	public function Exception_CsString(message:String)
	{
		Message = message;
		return this;
	}
	
	public function new() 
	{
	}
}