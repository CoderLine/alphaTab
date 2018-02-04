package system;

class FormatException extends Exception
{
	public function new() 
	{
		super();
	}
	public function FormatException_CsString(message:CsString) 
	{
		Exception_CsString(message);
		return this;
	}
}