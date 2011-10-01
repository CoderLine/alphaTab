package alphatab.platform;

/**
 * This is the interface which file loaders need to implement for providing files on different plattforms. 
 */
interface FileLoader 
{
    function loadBinary(method:String, file:String, success:BinaryReader->Void, error:String->Void) : Void;    
}