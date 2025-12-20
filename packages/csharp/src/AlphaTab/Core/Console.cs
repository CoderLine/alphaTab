using System.Diagnostics;

namespace AlphaTab.Core;

internal class Console
{
    public virtual void Debug(string format, object?[]? details)
    {
        var message = details != null ? string.Format(format, details) : format;
        Trace.WriteLine(message, "AlphaTab Debug");
    }

    public virtual void Warn(string format, object?[]? details)
    {
        var message = details != null ? string.Format(format, details) : format;
        Trace.WriteLine(message, "AlphaTab Warn");
    }

    public virtual void Info(string format, object?[]? details)
    {
        var message = details != null ? string.Format(format, details) : format;
        Trace.WriteLine(message, "AlphaTab Info");
    }

    public virtual void Error(string format, object?[]? details)
    {
        var message = details != null ? string.Format(format, details) : format;
        Trace.WriteLine(message, "AlphaTab Error");
    }
}
