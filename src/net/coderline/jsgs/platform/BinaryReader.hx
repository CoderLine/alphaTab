/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.platform;

interface BinaryReader 
{
	public function initialize(data:String):Void;
	
	public function readBool() : Bool;
	public function readByte() : Int;
	public function readInt32() : Int;
	public function readDouble():Float;
	public function seek(pos:Int):Void;
	
	public function getPosition():Int;
	public function getSize():Int;
}