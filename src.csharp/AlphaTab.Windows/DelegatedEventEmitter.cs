using System;

namespace AlphaTab
{
    public class DelegatedEventEmitter : IEventEmitter
    {
        private readonly Action<Action> _on;
        private readonly Action<Action> _off;

        public DelegatedEventEmitter(Action<Action> on, Action<Action> off)
        {
            _on = on;
            _off = off;
        }

        public void On(Action value)
        {
            _on(value);
        }

        public void Off(Action value)
        {
            _off(value);
        }
    }

    public class DelegatedEventEmitter<T> : IEventEmitterOfT<T>
    {
        private readonly Action<Action<T>> _on;
        private readonly Action<Action<T>> _off;

        public DelegatedEventEmitter(Action<Action<T>> on, Action<Action<T>> off)
        {
            _on = on;
            _off = off;
        }

        public void On(Action<T> value)
        {
            _on(value);
        }

        public void Off(Action<T> value)
        {
            _off(value);
        }
    }
}
