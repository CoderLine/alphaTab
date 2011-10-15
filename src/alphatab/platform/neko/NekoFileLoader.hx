package alphatab.platform.neko;

import alphatab.io.DataStream;
import alphatab.platform.FileLoader;
import alphatab.platform.neko.FileStream;

#if neko

/**
 * This if a fileloader implementation for Neko
 */
class NekoFileLoader implements FileLoader
{
    public function new() 
    {       
    }
    
    public function loadBinary(method:String, file:String, success:DataStream->Void, error:String->Void) : Void
    {        
        try 
        {
            success(new DataStream(new FileStream(file)));
        }
        catch (e:Dynamic)
        {
            error(Std.string(e));
        }
    }
}
#end