using System.Text;

namespace AlphaTab.Platform.Svg;

internal class SvgBuffer
{
    private readonly StringBuilder _value = new StringBuilder();

    public void Reset(string initial)
    {
        _value.Clear();
        _value.Append(initial);
    }

    public void Append(string value)
    {
        _value.Append(value);
    }

    public string Build()
    {
        return _value.ToString();
    }
}
