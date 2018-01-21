package system;

class Exception 
{
	public var Message(default, null):String;
	
	public function Exception_CsString(message:String)
	{
		Message = message;
	}
	
	public function new() 
	{
	}
}