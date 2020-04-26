using System;
using System.Collections;
using System.Collections.Generic;

namespace AlphaTab.Core
{
    public class List<T> : IList<T>, System.Collections.Generic.IEnumerable<T>
    {
        public List()
        {
        }

        public List(double size)
        {
        }

        public List(System.Collections.Generic.IEnumerable<T> items)
        {
        }

        public IEnumerator<T> GetEnumerator()
        {
            throw new NotImplementedException();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public double Length { get; }

        public T this[double index]
        {
            get => throw new NotImplementedException();
            set => throw new NotImplementedException();
        }

        public IList<T> Splice(double start)
        {
            throw new NotImplementedException();
        }

        public IList<T> Splice(double start, double deleteCount)
        {
            throw new NotImplementedException();
        }

        public IList<T> Splice(double start, double deleteCount, params T[] newItems)
        {
            throw new NotImplementedException();
        }

        public int IndexOf(T item)
        {
            throw new NotImplementedException();
        }

        public void Push(T item)
        {
            throw new NotImplementedException();
        }

        public void Add(T item)
        {
            throw new NotImplementedException();
        }

        public IList<T> Slice()
        {
            throw new NotImplementedException();
        }

        public IList<T> Slice(double start)
        {
            throw new NotImplementedException();
        }

        public IList<T> Slice(double start, double end)
        {
            throw new NotImplementedException();
        }

        public void Sort(Func<T, T, double> func)
        {
            throw new NotImplementedException();
        }

        public void Reverse()
        {
            throw new NotImplementedException();
        }

        public string Join()
        {
            throw new NotImplementedException();
        }

        public string Join(string separator)
        {
            throw new NotImplementedException();
        }

        public IList<T> Filter(Func<T, bool> func)
        {
            throw new NotImplementedException();
        }

        public void Unshift(T synthEvent)
        {
            throw new NotImplementedException();
        }

        public T Pop()
        {
            throw new NotImplementedException();
        }

        public IList<T> Fill(T i)
        {
            throw new NotImplementedException();
        }
    }
}
