using System;
using System.Threading;
using System.Threading.Tasks;
using AlphaTab.Core.Es2016;

namespace AlphaTab.Platform
{
    partial class Platform
    {
        public static string ToString(Uint8Array data, string encoding)
        {
            throw new NotImplementedException();
        }

        public static Action Throttle(Action action, double delay)
        {
            CancellationTokenSource cancellationTokenSource = null;
            return () =>
            {
                cancellationTokenSource?.Cancel();
                cancellationTokenSource = new CancellationTokenSource();

                Task.Run(async () =>
                    {
                        await Task.Delay((int)delay, cancellationTokenSource.Token);
                        action();
                    },
                    cancellationTokenSource.Token);
            };
        }
    }
}
