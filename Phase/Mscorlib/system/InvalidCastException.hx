package system;

class InvalidCastException extends Exception
{
	public function new(message:String = "") 
	{
		super();
		Exception_CsString(message);
	}
}