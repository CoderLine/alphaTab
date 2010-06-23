/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.file.guitarpro;
import haxe.Int32;
import haxe.io.Bytes;
import haxe.io.Error;
import haxe.io.Input;
import net.coderline.jsgs.file.SongReader;
import net.coderline.jsgs.model.GsSong;
import net.coderline.jsgs.model.GsSongFactory;
import net.coderline.jsgs.platform.BinaryReader;

class GpReaderBase extends SongReader
{
	public static inline var DefaultCharset:String = "UTF-8";
	public static inline var BendPosition = 60;
	public static inline var BendSemitone = 25;


	private var SupportedVersions:Array<String>;
	public var VersionIndex:Int;
	public var Version:String;
	
	public function new(supportedVersions:Array<String>) 
	{
		super();
		this.SupportedVersions = supportedVersions;
	}
	
	public override function Init(data:BinaryReader, factory:GsSongFactory) : Void
	{
		super.Init(data, factory);
	}
	
	public function Skip(count:Int) : Void 
	{
		for (i in 0 ... count) 
		{
			Data.readByte();
		}
	}

	public function ReadUnsignedByte() : Int
	{
		return Data.readByte();
	}

	public function ReadBool() : Bool
	{
		return Data.readByte() == 1;
	}

	public function ReadByte() : Int
	{
		// convert to signed byte
		var data = Data.readByte() & 0xFF;
		return data > 127 ? -256 + data : data;
	}
	
	public function Read() : Int
	{
		return ReadByte();
	}
	
	public function ReadInt() : Int
	{
		return (Data.readInt32());
	}
	
	public function ReadDouble() : Float
	{
		return Data.readDouble();
	}
	
	public function ReadByteSizeString(size:Int, charset:String=DefaultCharset): String
	{
		return ReadString(size, ReadUnsignedByte(), charset);
	}

	public function ReadString(size:Int, len:Int = -2, charset:String=DefaultCharset): String
	{
		if(len == -2)
			len = size;
		
			
		var count:Int = (size > 0 ? size : len);
		var s:String = this.ReadStringInternal(count);
		return s.substr(0, (len >= 0 ? len : size));
	}
	
	private function ReadStringInternal(length:Int) : String
	{
		var text:String = "";
		for (i in 0 ... length)
		{
			text += String.fromCharCode(ReadByte());
		}
		return text;
	}

	public function ReadIntSizeCheckByteString(charset:String=DefaultCharset): String
	{
		return ReadByteSizeString((ReadInt() - 1), charset);
	}        
	
	public function ReadByteSizeCheckByteString(charset:String=DefaultCharset): String
	{
		return ReadByteSizeString((ReadUnsignedByte() - 1), charset);
	}        

	public function ReadIntSizeString(charset:String=DefaultCharset): String
	{
		return ReadString(ReadInt(), -2, charset);
	}

	private static function NewString(bytes:Bytes, length:Int, charset:String) : String
	{
		return bytes.toString().substr(0, length);
	}
	
	public function ReadVersion() : Bool
	{
		try
		{
			if(Version == null)
			{
				Version = ReadByteSizeString(30, DefaultCharset);
			}
			// check for compatibility
			for(i in 0 ... SupportedVersions.length)
			{
				var current:String = SupportedVersions[i];
				if(Version == current)
				{
					VersionIndex = i;
					return true;
				}
			}
		}
		catch(e:Error)
		{
			Version = "Not Supported";
		}
		return false;
	}
	
	public static function ToChannelShort(data:Int): Int
	{
		var value:Int = Math.floor(Math.max(-32768, Math.min(32767, (data*8)-1)));
		return Math.floor(Math.max(value, -1));
	}
	
}