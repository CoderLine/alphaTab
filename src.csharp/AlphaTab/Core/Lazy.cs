namespace AlphaTab.Core
{
    public class Lazy<T> where T:class?
    {
        private readonly System.Func<T> _factory;

        private bool _created = false;
        private T _value;

        public Lazy(System.Func<T> factory)
        {
            _factory = factory;
            _value = null!;
        }

        public T Value
        {
            get
            {
                if (!_created)
                {
                    _value = _factory();
                }
                return _value;
            }
        }
    }
}
