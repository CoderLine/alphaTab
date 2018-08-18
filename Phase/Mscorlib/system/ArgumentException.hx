package system;

class ArgumentException extends Exception
{
	public var ParamName(default, null):CsString;
	
	public function new() 
	{
		super();
	}
	public function ArgumentException_CsString(paramName:CsString) 
	{
		Exception_CsString("argument '" + paramName + "' has an invalid value");
		ParamName = paramName;
		return this;
	}
	public function ArgumentException_CsString_CsString(message:CsString, paramName:CsString) 
	{
		Exception_CsString(message);
		ParamName = paramName;
		return this;
	}
}