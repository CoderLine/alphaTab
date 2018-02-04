package system;

class ArgumentNullException extends ArgumentException
{
	public function new() 
	{
		super();
	}
	public function ArgumentNullException_CsString(paramName:CsString) 
	{
		ArgumentNullException_CsString_CsString("argument '" + paramName + "' must not be null", paramName);
		return this;
	}
	public function ArgumentNullException_CsString_CsString(message:CsString, paramName:CsString) 
	{
		ArgumentNullException_CsString_CsString(message, paramName);
		return this;
	}
}