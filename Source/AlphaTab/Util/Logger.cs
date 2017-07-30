using AlphaTab.Platform;

namespace AlphaTab.Util
{
    public class Logger
    {
        public static LogLevel LogLevel { get; set; }

        static Logger()
        {
            LogLevel = LogLevel.Info;
        }

        public static void Debug(string category, string msg, object details = null)
        {
            Log(LogLevel.Debug, category, msg, details);
        }

        public static void Warning(string category, string msg, object details = null)
        {
            Log(LogLevel.Warning, category, msg, details);
        }

        public static void Info(string category, string msg, object details = null)
        {
            Log(LogLevel.Info, category, msg, details);
        }

        public static void Error(string category, string msg, object details = null)
        {
            Log(LogLevel.Error, category, msg, details);
        }

        private static void Log(LogLevel logLevel, string category, string msg, object details = null)
        {
            if (logLevel < LogLevel) return;
            Std.Log(logLevel, category, msg, details);
        }
    }

    public enum LogLevel
    {
        None = 0,
        Debug = 1,
        Info = 2,
        Warning = 3,
        Error = 4
    }
}
