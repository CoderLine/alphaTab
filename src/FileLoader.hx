/**
 * ...
 * @author Daniel Kuschny
 */

package;

extern class FileLoader 
{
	public static function LoadBinary(method:String, file:String, success:BinaryReader->Void, error:String->Void) : BinaryReader;	
}