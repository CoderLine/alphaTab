/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
namespace AlphaTab.Util
{
    class Logger
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

        public static void Log(LogLevel logLevel, string category, string msg, object details = null)
        {
            if (logLevel < LogLevel || LogLevel == LogLevel.None) return;
            Platform.Platform.Log(logLevel, category, msg, details);
        }
    }

    /// <summary>
    /// Defines all loglevels. 
    /// </summary>
    public enum LogLevel
    {
        /// <summary>
        /// No logging
        /// </summary>
        None = 0,
        /// <summary>
        /// Debug level (internal details are displayed).
        /// </summary>
        Debug = 1,
        /// <summary>
        /// Info level (only important details are shown)
        /// </summary>
        Info = 2,
        /// <summary>
        /// Warning level
        /// </summary>
        Warning = 3,
        /// <summary>
        /// Error level.
        /// </summary>
        Error = 4
    }
}
