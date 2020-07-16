using System;

namespace AlphaTab.Core.EcmaScript
{
    public static class Date
    {
        private static readonly DateTime UnixEpoch =
            new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public static double Now()
        {
            return DateTime.UtcNow
                .Subtract(UnixEpoch)
                .TotalMilliseconds;
        }
    }
}
