/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Collections
{
    /// <summary>
    /// Represents a collection of key-value pairs. 
    /// </summary>
    /// <typeparam name="TKey"></typeparam>
    /// <typeparam name="TValue"></typeparam>
    public class FastDictionary<TKey, TValue> : IEnumerable<TKey>
    {
        private readonly Dictionary<TKey, TValue> _dictionary;

        /// <summary>
        /// Initializes a new instance of the <see cref="FastDictionary{TKey, TValue}"/> class.
        /// </summary>
        public FastDictionary()
        {
            _dictionary = new Dictionary<TKey, TValue>();
        }

        /// <summary>
        /// Gets or sets the value at the specified index.
        /// </summary>
        /// <param name="index">The key to access the item.</param>
        /// <returns>The value stored at the specified index.</returns>
        [IndexerName("Item")]
        public TValue this[TKey index]
        {
            get => _dictionary[index];
            set => _dictionary[index] = value;
        }

        /// <summary>
        /// Gets the number of elements stored in this dictionary
        /// </summary>
        public int Count => _dictionary.Count;

        /// <inheritdoc />
        public IEnumerator<TKey> GetEnumerator()
        {
            return _dictionary.Keys.GetEnumerator();
        }

        /// <summary>
        /// Removes the value with the specified key.
        /// </summary>
        /// <param name="key">The key to remove from the dictionary. </param>
        public void Remove(TKey key)
        {
            _dictionary.Remove(key);
        }

        /// <summary>
        /// Determines whether the dictionary container contains the specified key.
        /// </summary>
        /// <param name="key">The key to check the existence for.</param>
        /// <returns>
        ///   <c>true</c> if the specified key is contained; otherwise, <c>false</c>.
        /// </returns>
        public bool ContainsKey(TKey key)
        {
            return _dictionary.ContainsKey(key);
        }

        /// <inheritdoc />
        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
