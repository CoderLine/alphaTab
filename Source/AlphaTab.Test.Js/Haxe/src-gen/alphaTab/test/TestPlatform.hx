package alphaTab.test;

using system.HaxeExtensions;
class TestPlatform
{
    public static function CreateStringReader(tex : system.CsString) : alphaTab.io.IReadable 
    {
        var buf : js.html.ArrayBuffer = new js.html.ArrayBuffer((tex.Length * 2).ToHaxeInt());
        var view : js.html.Uint16Array = new js.html.Uint16Array(buf);
        {
            var i: system.Int32 = 0;
            while (i < tex.Length)
            {
                view[i.ToHaxeInt()] = (tex.get_Chars(i)).ToHaxeInt();
                i++;
            }
        }
        return alphaTab.io.ByteBuffer.FromBuffer(cast (view));

    }

    public static function LoadFile(path : system.CsString) : system.FixedArray<system.Byte> 
    {
        return null;

    }

    public static function LoadFileAsString(testfilesXmlGpifXml : system.CsString) : system.CsString 
    {
        return null;

    }

    public static function IsMatch(value : system.CsString, regex : system.CsString) : system.Boolean 
    {
        return new EReg(regex, "").match(value);

    }

    public static function ChangeExtension(file : system.CsString, extension : system.CsString) : system.CsString 
    {
        var lastDot : system.Int32 = file.LastIndexOf_CsString(".");
        if (lastDot == -1)
        {
            return file + extension;

        }
        else         {
            return file.Substring_Int32_Int32(0, lastDot) + extension;

        }
    }

    public function new() 
    {
    }

}
