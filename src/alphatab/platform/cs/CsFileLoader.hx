package alphatab.platform.cs;
import alphatab.io.DataInputStream;
import alphatab.platform.FileLoader;

#if cs

class CsFileLoader implements FileLoader
{
    public function new()
    {
    }
    
    public function loadBinary(method:String, file:String, success:DataInputStream->Void, error:String->Void) : Void
    {   
        try
        {
            var bytes = FileApi.ReadAllBytes(file);
            var reader:DataInputStream = new DataInputStream(new ByteArrayInputStream(bytes));
            success(reader);
        }
        catch (e:Dynamic)
        {
            error(Std.string(e));
        }
    }
}

#end