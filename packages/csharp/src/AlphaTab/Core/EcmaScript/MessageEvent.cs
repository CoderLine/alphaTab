namespace AlphaTab.Core.EcmaScript;

internal class MessageEvent<T>
{
    public MessageEvent(T data)
    {
        Data = data;
    }

    public T Data { get; }
}
