/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.file.guitarpro;
import alphatab.file.SongReader;
import alphatab.model.Song;
import alphatab.model.SongFactory;
import alphatab.platform.BinaryReader;

class GpReaderBase extends SongReader
{
    public static inline var DEFAULT_CHARSET:String = "UTF-8";
    public static inline var BEND_POSITION = 60;
    public static inline var BEND_SEMITONE = 25;

    private var _supportedVersions:Array<String>;
    private var _versionIndex:Int;
    private var _version:String;
    
    public function new() 
    {
        super();
    }
    
    public function initVersions(supportedVersions:Array<String>)
    {
        _supportedVersions = supportedVersions;
    }
    
    public function skip(count:Int) : Void 
    {
        for (i in 0 ... count) 
        {
            data.readByte();
        }
    }

    public function readUnsignedByte() : Int
    {
        return data.readByte();
    }

    public function readBool() : Bool
    {
        return data.readByte() == 1;
    }

    public function readByte() : Int
    {
        // convert to signed byte
        var data = data.readByte() & 0xFF;
        return data > 127 ? -256 + data : data;
    }
    
    public function read() : Int
    {
        return readByte();
    }
    
    public function readInt() : Int
    {
        return (data.readInt32());
    }
    
    public function readDouble() : Float
    {
        return data.readDouble();
    }
    
    public function readByteSizeString(size:Int, charset:String=DEFAULT_CHARSET): String
    {
        return readString(size, readUnsignedByte(), charset);
    }

    public function readString(size:Int, len:Int = -2, charset:String=DEFAULT_CHARSET): String
    {
        if(len == -2)
            len = size;
        
        var count:Int = (size > 0 ? size : len);
        var s:String = readStringInternal(count);
        return s.substr(0, (len >= 0 ? len : size));
    }
    
    private function readStringInternal(length:Int) : String
    {
        var text:String = "";
        for (i in 0 ... length)
        {
          // TODO: Check for unicode support
            text += String.fromCharCode(readByte());
        }
        return text;
    }

    public function readIntSizeCheckByteString(charset:String=DEFAULT_CHARSET): String
    {
        return readByteSizeString((readInt() - 1), charset);
    }        
    
    public function readByteSizeCheckByteString(charset:String=DEFAULT_CHARSET): String
    {
        return readByteSizeString((readUnsignedByte() - 1), charset);
    }        

    public function readIntSizeString(charset:String=DEFAULT_CHARSET): String
    {
        return readString(readInt(), -2, charset);
    }
    
    public function readVersion() : Bool
    {
        try
        {
            if(_version == null)
            {
                _version = readByteSizeString(30, DEFAULT_CHARSET);
            }
            // check for compatibility
            for(i in 0 ... _supportedVersions.length)
            {
                var current:String = _supportedVersions[i];
                if(_version == current)
                {
                    _versionIndex = i;
                    return true;
                }
            }
        }
        catch(e:Dynamic)
        {
            _version = "Not Supported";
        }
        return false;
    }
    
    public static function toChannelShort(data:Int): Int
    {
        var value:Int = Math.floor(Math.max(-32768, Math.min(32767, (data*8)-1)));
        return Math.floor(Math.max(value, -1));
    }
    
}