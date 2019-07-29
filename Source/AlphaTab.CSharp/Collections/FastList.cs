using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Collections
{
    /// <summary>
    /// Represents a strongly typed list of elements. 
    /// </summary>
    /// <typeparam name="T">The type fo the elements</typeparam>
    /// <seealso cref="System.Collections.Generic.IEnumerable{T}" />
    public class FastList<T> : IEnumerable<T>
    {
        private readonly List<T> _list;

        /// <summary>
        /// Initializes a new instance of the <see cref="FastList{T}" /> class.
        /// </summary>
        public FastList()
        {
            _list = new List<T>();
        }

        private FastList(IEnumerable<T> collection)
        {
            _list = new List<T>(collection);
        }

        /// <summary>
        /// Gets the number of elements contained in the list.
        /// </summary>
        public int Count => _list.Count;

        /// <summary>
        /// Gets or sets the value at the specified index.
        /// </summary>
        /// <param name="index">The index of which item to access.</param>
        /// <returns>The item located at the specified index. </returns>
        [IndexerName("Item")]
        public T this[int index]
        {
            get => _list[index];
            set => _list[index] = value;
        }

        /// <summary>
        /// Adds the specified item to the list. 
        /// </summary>
        /// <param name="item">The item to be added.</param>
        public void Add(T item)
        {
            _list.Add(item);
        }

        /// <summary>
        /// Sorts the elements in the list using the specified comparison.
        /// </summary>
        /// <param name="comparison">The comparison to use when comparing elements for sorting.</param>
        public void Sort(Comparison<T> comparison)
        {
            _list.Sort(comparison);
        }

        /// <summary>
        /// Clones this instance.
        /// </summary>
        /// <returns></returns>
        public FastList<T> Clone()
        {
            return new FastList<T>(this);
        }

        /// <summary>
        /// Removes the item at the specified index. 
        /// </summary>
        /// <param name="index">The index to remove.</param>
        public void RemoveAt(int index)
        {
            _list.RemoveAt(index);
        }

        /// <summary>
        /// Converts the current list into an array of all elements. 
        /// </summary>
        /// <returns>An array containing all elements. </returns>
        public T[] ToArray()
        {
            return _list.ToArray();
        }

        /// <inheritdoc />
        public IEnumerator<T> GetEnumerator()
        {
            return _list.GetEnumerator();
        }

        /// <summary>
        /// Searches for the given item in the list and returns the index. 
        /// </summary>
        /// <param name="item">The item to search</param>
        /// <returns>The index at which the specified item was found, or -1 if the item is not contained in the list.</returns>
        public int IndexOf(T item)
        {
            return _list.IndexOf(item);
        }

        /// <summary>
        /// Reverses the items in the list
        /// </summary>
        public void Reverse()
        {
            _list.Reverse();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        /// <summary>
        /// Inserts an element at the specified index. 
        /// </summary>
        /// <param name="insertPos">The index at which the item should be inserted</param>
        /// <param name="item">The item to insert.</param>
        public void InsertAt(int insertPos, T item)
        {
            _list.Insert(insertPos, item);
        }

        /// <summary>
        /// Remove all elements from the list.
        /// </summary>
        public void Clear()
        {
            _list.Clear();
        }
    }
}
