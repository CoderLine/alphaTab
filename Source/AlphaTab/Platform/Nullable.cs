namespace AlphaTab.Platform
{
    public class Nullable<T> where T : struct
    {
        public T Value
        {
            get;
            set;
        }

        public Nullable(T value)
        {
            Value = value;
        }
    }
}
