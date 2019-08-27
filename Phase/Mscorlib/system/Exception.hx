package system;

class Exception 
{
	public var message(default, null):String;
	
	public function Exception_CsString(message:String)
	{
		this.message = message;
		return this;
	}
	
	public function new() 
	{
	}
}