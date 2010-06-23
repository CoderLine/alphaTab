/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.platform;

interface FileLoader 
{
	function LoadBinary(method:String, file:String, success:BinaryReader->Void, error:String->Void) : Void;	
}