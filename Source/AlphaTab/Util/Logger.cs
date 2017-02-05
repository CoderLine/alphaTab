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

        public static void Debug(string category, string msg)
        {
            Log(LogLevel.Debug, category, msg);
        }

        public static void Warning(string category, string msg)
        {
            Log(LogLevel.Warning, category, msg);
        }

        public static void Info(string category, string msg)
        {
            Log(LogLevel.Info, category, msg);
        }

        public static void Error(string category, string msg)
        {
            Log(LogLevel.Error, category, msg);
        }

        private static void Log(LogLevel logLevel, string category, string msg)
        {
            if (logLevel < LogLevel) return;
            var caller = Std.GetCallerName();
            Std.Log("[AlphaTab][" + category + "] " + caller + " - " + msg, logLevel);
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
