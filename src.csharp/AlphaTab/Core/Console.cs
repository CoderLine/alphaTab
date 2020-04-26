using System.Diagnostics;

namespace AlphaTab.Core
{
    public class Console
    {
        public virtual void Debug(string format, object[] details)
        {
            Trace.Write(string.Format(format, details), "AlphaTab Debug");
        }

        public virtual void Warn(string format, object[] details)
        {
            Trace.Write(string.Format(format, details), "AlphaTab Warn");
        }

        public virtual void Info(string format, object[] details)
        {
            Trace.Write(string.Format(format, details), "AlphaTab Info");
        }

        public virtual void Error(string format, object[] details)
        {
            Trace.Write(string.Format(format, details), "AlphaTab Error");
        }
    }
}
