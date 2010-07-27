/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.platform;

interface FileLoader 
{
	function LoadBinary(method:String, file:String, success:BinaryReader->Void, error:String->Void) : Void;	
}