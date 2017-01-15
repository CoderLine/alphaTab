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

        public static void Debug(string msg)
        {
            Log(LogLevel.Debug, msg);
        }

        public static void Warning(string msg)
        {
            Log(LogLevel.Warning, msg);
        }

        public static void Info(string msg)
        {
            Log(LogLevel.Info, msg);
        }

        public static void Error(string msg)
        {
            Log(LogLevel.Error, msg);
        }

        private static void Log(LogLevel logLevel, string msg)
        {
            if (logLevel < LogLevel) return;
            var caller = Std.GetCallerName();
            Std.Log("[AlphaTab] " + caller + " - " + msg, LogLevel);
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
