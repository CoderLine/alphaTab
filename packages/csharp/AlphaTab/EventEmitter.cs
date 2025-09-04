using System;

namespace AlphaTab;

partial interface IEventEmitterOfT<T>
{
    System.Action On(System.Action value);
    void Off(System.Action value);
}
	
partial class EventEmitterOfT<T>
{
    private System.Collections.Generic.IDictionary<System.Action, System.Action<T>> _wrappers = 
        new System.Collections.Generic.Dictionary<System.Action, System.Action<T>>();
       
    [Obsolete("Use event registration overload with parameter.", false)]
    public System.Action On(System.Action value) 
    {
        var wrapper = new Action<T>(_=> 
        {
            value();
        });
        _wrappers[value] = wrapper;
        On(wrapper);
        return () => Off(value);
    }

    [Obsolete("Use event unregistration with parameter.", false)]
    public void Off(System.Action value)
    {
        if(_wrappers.TryGetValue(value, out var wrapper)) 
        {
            Off(wrapper);
            _wrappers.Remove(value);
        }				
    }
}