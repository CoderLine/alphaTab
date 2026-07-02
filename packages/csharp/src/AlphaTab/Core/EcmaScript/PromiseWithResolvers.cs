using System.Threading.Tasks;

namespace AlphaTab.Core.EcmaScript;

public class PromiseWithResolvers<T>
{
    private readonly TaskCompletionSource<T> _taskCompletionSource = new();
    public Task<T> Promise => _taskCompletionSource.Task;

    public void Resolve(T o)
    {
        _taskCompletionSource.TrySetResult(o);
    }

    public void Reject(Error error)
    {
        _taskCompletionSource.TrySetException(error);
    }
}
