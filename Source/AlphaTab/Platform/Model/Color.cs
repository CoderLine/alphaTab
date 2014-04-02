using System;

namespace AlphaTab.Platform.Model
{
    public class Color
    {
        private readonly int _value;

        public Color(byte r, byte g, byte b, byte a = 0xFF)
        {
            _value = (a << 24) | (r << 16) | (g << 8) | b;
        }

        public byte A
        {
            get
            {
                return (byte)((_value >> 24) & 0xFF);
            }
        }

        public byte R
        {
            get
            {
                return (byte)((_value >> 16) & 0xFF);
            }
        }

        public byte G
        {
            get
            {
                return (byte)((_value >> 8) & 0xFF);
            }
        }

        public byte B
        {
            get
            {
                return (byte)(_value & 0xFF);
            }
        }

        public String ToRgbaString()
        {
            return "rgba(" + R + "," + G + "," + B + "," + (A/255.0) + ")";
        }
    }
}
