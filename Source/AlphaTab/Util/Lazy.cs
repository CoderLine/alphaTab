using System;

namespace AlphaTab.Util
{
    public class Lazy<T>
    {
        private readonly Func<T> _factory;
        private bool _created;
        private T _value;

        public Lazy(Func<T> factory)
        {
            _factory = factory;
        }

        public T Value
        {
            get
            {
                if (!_created)
                {
                    _value = _factory();
                    _created = true;
                }
                return _value;
            }
        }
    }
}
