package alphatab.platform;

import haxe.io.Bytes;
import haxe.io.BytesInput;

/**
 * This is the interface which file loaders need to implement for providing 
 * files on different plattforms. 
 */
interface IFileLoader 
{
    function loadBinary(path:String) : Bytes;    
    function loadBinaryAsync(path:String, success:Bytes->Void, error:String->Void) : Void;    
}