using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Core
{
    public class List<T> : IList<T>
    {
        private readonly System.Collections.Generic.List<T> _data;

        public List()
        {
            _data = new System.Collections.Generic.List<T>();
        }

        public List(double size)
        {
            _data = new System.Collections.Generic.List<T>(new T[(int) size]);
        }

        public List(IEnumerable<T> items)
        {
            _data = new System.Collections.Generic.List<T>(items);
        }

        private List(System.Collections.Generic.List<T> items)
        {
            _data = items;
        }

        public IEnumerator<T> GetEnumerator()
        {
            return _data.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public double Length => _data.Count;

        public T this[double index]
        {
            get => _data[(int) index];
            set => _data[(int) index] = value;
        }

        public IList<T> Splice(double start)
        {
            var count = _data.Count - (int) start;
            var items = _data.GetRange((int) start, count);
            _data.RemoveRange((int) start, count);
            return new List<T>(items);
        }

        public IList<T> Splice(double start, double deleteCount)
        {
            var items = _data.GetRange((int) start, (int) deleteCount);
            _data.RemoveRange((int) start, (int) deleteCount);
            return new List<T>(items);
        }

        public IList<T> Splice(double start, double deleteCount, params T[] newItems)
        {
            var items = _data.GetRange((int) start, (int) deleteCount);
            _data.RemoveRange((int) start, (int) deleteCount);
            _data.InsertRange((int) start, newItems);

            return new List<T>(items);
        }

        public int IndexOf(T item)
        {
            return _data.IndexOf(item);
        }

        public void Push(T item)
        {
            _data.Add(item);
        }

        public void Add(T item)
        {
            _data.Add(item);
        }

        public IList<T> Slice()
        {
            return new List<T>(new System.Collections.Generic.List<T>(_data));
        }

        public IList<T> Slice(double start)
        {
            return new List<T>(_data.GetRange((int) start, _data.Count - (int) start));
        }

        public void Sort(Func<T, T, double> func)
        {
            _data.Sort((a, b) => (int) func(a, b));
        }

        public void Reverse()
        {
            _data.Reverse();
        }

        public string Join(string separator)
        {
            return string.Join(separator, _data);
        }

        public IList<T> Filter(Func<T, bool> func)
        {
            return new List<T>(_data.Where(func).ToList());
        }

        public void Unshift(T item)
        {
            _data.Insert(0, item);
        }

        public T Pop()
        {
            if (_data.Count > 0)
            {
                var last = _data.Last();
                _data.RemoveAt(_data.Count - 1);
                return last;
            }

            return default;
        }

        public IList<T> Fill(T i)
        {
            for (var j = 0; j < _data.Count; j++)
            {
                _data[j] = i;
            }

            return this;
        }
    }
}
