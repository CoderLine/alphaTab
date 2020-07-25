using System.Diagnostics;

namespace AlphaTab.Core
{
    public class Console
    {
        public virtual void Debug(string format, object?[]? details)
        {
            var message = details != null ? string.Format(format, details) : format;
            Trace.Write(message, "AlphaTab Debug");
        }

        public virtual void Warn(string format, object?[]? details)
        {
            var message = details != null ? string.Format(format, details) : format;
            Trace.Write(message, "AlphaTab Warn");
        }

        public virtual void Info(string format, object?[]? details)
        {
            var message = details != null ? string.Format(format, details) : format;
            Trace.Write(message, "AlphaTab Info");
        }

        public virtual void Error(string format, object?[]? details)
        {
            var message = details != null ? string.Format(format, details) : format;
            Trace.Write(message, "AlphaTab Error");
        }
    }
}
