package alphatab.platform.java;

#if jvm
import alphatab.io.DataInputStream;
import alphatab.platform.FileLoader;

class JavaFileLoader implements FileLoader
{
    public function new() : Void
	{
		
	}
    public function loadBinary(method:String, file:String, success:DataInputStream->Void, error:String->Void) : Void
	{
		throw "JAVA_TODO";
	}
}
#end