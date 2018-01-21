package system;

class OverflowException extends Exception
{
	public function new(message:String = "") 
	{
		super();
		Exception_CsString(message);
	}
}