using Haxe.Js.Html;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Audio.Synth.Ds
{
    [Abstract("js.html.Float32Array")]
    [NativeConstructors]
    public class SampleArray
    {
        [Inline]
        public SampleArray(int length)
        {
            Script.AbstractThis = new Float32Array(length);
        }

        public Float32Array ToFloat32Array()
        {
            return Script.AbstractThis.As<Float32Array>();
        }

        public float this[int index]
        {
            [Inline] get => Script.This<Float32Array>()[index];
            [Inline] set => Script.This<Float32Array>()[index] = value;
        }

        public int Length
        {
            [Inline] get => Script.This<Float32Array>().Length;
        }

        [Inline]
        public void Clear()
        {
            Script.AbstractThis = new Float32Array(Length);
        }

        [Inline]
        public static void Blit(SampleArray src, int srcPos, SampleArray dest, int destPos, int len)
        {
            dest.ToFloat32Array().Set(src.ToFloat32Array().SubArray(srcPos, srcPos + len), destPos);
        }
    }
}
