/**
 * ...
 * @author Daniel Kuschny
 */

package ;

extern class BinaryReader 
{
	public function new(data:String):Void;
	public function readBool() : Bool;
	public function readByte() : Int;
		
	public function readInt8() : Int;
	public function readUInt8() : Int;
	public function readInt16() : Int;
	public function readUInt16() : Int;
	public function readInt32() : Int;
	public function readUInt32() : Int;

	public function readFloat():Float;
	public function readDouble():Float;
	
	public function readChar():String;
	public function readString():String;
	
	public function seek(pos:Int):Void;
	
	public function getPosition():Int;
	public function getSize():Int;
}