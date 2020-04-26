using System;
using System.Collections.Generic;
using AlphaTab.Audio.Synth.Synthesis;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Core
{
    public interface IList<T> : IEnumerable<T>
    {
        double Length { get; }
        T this[double index] { get; set; }
        IList<T> Splice(double start);
        IList<T> Splice(double start, double deleteCount);
        IList<T> Splice(double start, double deleteCount, params T[] newItems);
        int IndexOf(T item);
        void Push(T item);
        void Add(T item);
        IList<T> Slice();
        IList<T> Slice(double start);
        IList<T> Slice(double start, double end);
        void Sort(Func<T, T, double> func);
        void Reverse();
        string Join();
        string Join(string separator);
        IList<T> Filter(Func<T, bool> func);
        void Unshift(T synthEvent);
        T Pop();
    }
}
