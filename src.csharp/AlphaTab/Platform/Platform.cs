using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AlphaTab.Core.EcmaScript;

namespace AlphaTab.Platform
{
    partial class Platform
    {
        public static string ToString(Uint8Array data, string name)
        {
            var encoding = Encoding.GetEncoding(name);
            return encoding.GetString(data.Buffer.Raw.Array, data.Buffer.Raw.Offset,
                data.Buffer.Raw.Count);
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
