package alphatab.platform;

import alphatab.io.DataStream;

/**
 * This is the interface which file loaders need to implement for providing files on different plattforms. 
 */
interface FileLoader 
{
    function loadBinary(method:String, file:String, success:DataStream->Void, error:String->Void) : Void;    
}