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
import alphatab.io.DataInputStream;
import haxe.Stack;

class GpReaderBase extends SongReader
{
    public static inline var DEFAULT_CHARSET:String = "UTF-8";
    public static inline var BEND_POSITION = 60;
    public static inline var BEND_SEMITONE = 25;

    private var _supportedVersions:Array<String>;
    private var _versionIndex:Int;
    public var version:String;
    
    public function new() 
    {
        super();
    }
    
    public override function init(data:DataInputStream, factory:SongFactory):Void 
    {
        super.init(data, factory);
        data.bigEndian = false;
    }
    
    public function initVersions(supportedVersions:Array<String>)
    {
        _supportedVersions = supportedVersions;
    }
    
    public function skip(count:Int) : Void 
    {
        data.skip(count);
    }

    public function readByteSizeString(size:Int, charset:String=DEFAULT_CHARSET): String
    {
        return readString(size, data.readByte(), charset);
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
            text += String.fromCharCode(data.readByte());
        }
        return text;
    }

    public function readIntSizeCheckByteString(charset:String=DEFAULT_CHARSET): String
    {
        var d = (data.readInt() - 1);
        if (d > 2000)
        {
            trace(d);
            trace(Stack.toString(Stack.callStack()));
        }
        return readByteSizeString(d, charset);
    }        
    
    public function readByteSizeCheckByteString(charset:String=DEFAULT_CHARSET): String
    {
        return readByteSizeString((data.readByte() - 1), charset);
    }        

    public function readIntSizeString(charset:String=DEFAULT_CHARSET): String
    {
        return readString(data.readInt(), -2, charset);
    }
    
    public function readVersion() : Bool
    {
        try
        {
            if(version == null)
            {
                version = readByteSizeString(30, DEFAULT_CHARSET);
            }
            // check for compatibility
            for(i in 0 ... _supportedVersions.length)
            {
                var current:String = _supportedVersions[i];
                if(version == current)
                {
                    _versionIndex = i;
                    return true;
                }
            }
        }
        catch(e:Dynamic)
        {
            version = "Not Supported";
        }
        return false;
    }
    
    public static function toChannelShort(data:Int): Int
    {
        var value:Int = Math.floor(Math.max(-32768, Math.min(32767, (data*8)-1)));
        return Math.floor(Math.max(value, -1)) + 1;
    }
    
}