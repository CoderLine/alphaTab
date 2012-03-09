package alphatab.platform.neko;

#if neko
import alphatab.platform.IFileLoader;
import haxe.io.Bytes;
import neko.io.File;

class NekoFileLoader implements IFileLoader
{

    public function new() 
    {
        
    }
    
    public function loadBinary(path:String) : Bytes
    {
        return File.getBytes(path);
    }
    
    public function loadBinaryAsync(path:String, success:Bytes->Void, error:String->Void) : Void
    {
        try
        {
            success(loadBinary(path));
        }
        catch (e:Dynamic)
        {
            error(Std.string(e));
        }
    }

}
#end