using Haxe.Js.Html;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Utils
{
    [Abstract("js.html.DataView")]
    public class UnionData
    {
        [Inline]
        public UnionData() => Script.AbstractThis = new DataView(new ArrayBuffer(8));

        //double values
        public double Double1
        {
            [Inline]
            get { return Script.This<DataView>().GetFloat64(0, true); }
        }
        //float values
        public double Float1
        {
            [Inline]
            get { return Script.This<DataView>().GetFloat32(0, true); }
        }
        public double Float2
        {
            [Inline]
            get { return Script.This<DataView>().GetFloat32(4, true); }
        }
        //int values
        public double Int1
        {
            [Inline]
            get { return Script.This<DataView>().GetInt32(0, true); }
        }
        public double Int2
        {
            [Inline]
            get { return Script.This<DataView>().GetInt32(4, true); }
        }
    }
}
