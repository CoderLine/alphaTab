using System;
using System.Collections;
using System.Collections.Generic;
using Haxe;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Collections
{
    /// <summary>
    /// This is a platform optimized implementation of a simple list structure. 
    /// </summary>
    /// <typeparam name="T">The type of items to hold</typeparam>
    [Abstract("Array<T>", "Array<T>", "Array<T>")]
    [ForeachMode(ForeachMode.GetEnumerator)]
    public class FastList<T> : IEnumerable<T>
    {
        /// <summary>
        /// Initializes a new list of the <see cref="FastList{T}"/> class.
        /// </summary>
        [Inline]
        public FastList() => Script.AbstractThis = new HaxeArray<T>();

        /// <summary>
        /// Gets the number of items contained in this list.
        /// </summary>
        public int Count
        {
            [Inline]
            get => Script.This<HaxeArray<T>>().Length;
        }

        /// <summary>
        /// Gets or sets the item stored at the specified index of the list.
        /// </summary>
        /// <param name="index">The 0-based index of the item within the list.</param>
        /// <returns>The item that was stored at the given index.</returns>
        public T this[int index]
        {
            [Inline]
            get => Script.This<HaxeArray<T>>()[index];
            [Inline]
            set => Script.This<HaxeArray<T>>()[index] = value;
        }

        /// <summary>
        /// Adds a new item to the end of this list.
        /// </summary>
        /// <param name="item">The item to add.</param>
        [Inline]
        public void Add(T item) => Script.This<HaxeArray<T>>().Push(item);

        /// <summary>
        /// Sorts the items in this list using the given comparison function.
        /// </summary>
        /// <param name="comparison">The function used to compare the elements and determine the sorting.</param>
        [Inline]
        public void Sort(Comparison<T> comparison) => Script.This<HaxeArray<T>>().Sort((a, b) => comparison(a, b));

        /// <summary>
        /// Creates a clone of this list (elements are not cloned).
        /// </summary>
        /// <returns>A clone of the original list holding the same elements.</returns>
        [Inline]
        public FastList<T> Clone() => Script.This<HaxeArray<T>>().Slice(0).As<FastList<T>>();

        /// <summary>
        /// Removes the item at the given index from the list. 
        /// </summary>
        /// <param name="index">The index of the item to remove from the list.</param>
        [Inline]
        public void RemoveAt(int index)
        {
            if (index != -1)
            {
                Script.This<HaxeArray<T>>().Splice(index, 1);
            }
        }

        /// <summary>
        /// Converts this list into an array.
        /// </summary>
        /// <returns>An array of the items that were stored in this list.</returns>
        [Inline]
        public T[] ToArray() => FixedArray<T>.FromArray(Script.This<HaxeArray<T>>()).As<T[]>();

        /// <inheritdoc />
        [Inline]
        public IEnumerator<T> GetEnumerator() => Script.AbstractThis.As<IEnumerator<T>>();

        /// <summary>
        /// Searches for an item in the list and returns its index. 
        /// </summary>
        /// <param name="item">The item to search in the list.</param>
        /// <returns>The 0-based index of the first occurence of the item in the list or -1 if the item was not contained.</returns>
        [Inline]
        public int IndexOf(T item) => Script.This<HaxeArray<T>>().IndexOf(item);

        /// <summary>
        /// Reverses the order of the items in this list. 
        /// </summary>
        [Inline]
        public void Reverse() => Script.This<HaxeArray<T>>().Reverse();

        /// <summary>
        /// Converts this list into an <see cref="IEnumerable{T}"/> for iterating.
        /// </summary>
        /// <returns></returns>
        [Inline]
        public IEnumerable<T> ToEnumerable() => new IterableEnumerable<T>(this);

        /// <summary>
        /// Inserts an item at the given position into the list. 
        /// </summary>
        /// <param name="insertPos">The position at which the item should be added.</param>
        /// <param name="item">The item to add. </param>
        [Inline]
        public void InsertAt(int insertPos, T item) => Script.This<HaxeArray<T>>().Insert(insertPos, item);

        /// <inheritdoc />
        [External]
        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
