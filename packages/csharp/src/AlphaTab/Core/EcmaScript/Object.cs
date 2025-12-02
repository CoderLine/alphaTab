﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using AlphaTab.Collections;

namespace AlphaTab.Core.EcmaScript;

internal class Object
{
    public static IList<object> Values(System.Type type)
    {
        return type.IsEnum
            ? Enum.GetValues(type).Cast<int>().Select(v => (object)(double)v).ToArray()
            : throw new ArgumentException($"Type {type} is not an enum");
    }

    public static IEnumerable<ArrayTuple<TKey, TValue>> Entries<TKey, TValue>(
        Record<TKey, TValue> type)
    {
        return type.Select((MapEntry<TKey, TValue> e) =>
            new ArrayTuple<TKey, TValue>(e.Key, e.Value));
    }

    private static readonly
        ConcurrentDictionary<Type, Dictionary<string, Func<object, object>>>
        ObjectEntriesCache = new();

    public static IList<ArrayTuple<string, object>> Entries(object v)
    {
        if (v is Type { IsEnum: true } t)
        {
            return Enum.GetValues(t).Cast<IConvertible>().Select(i =>
                    new ArrayTuple<string, object>(i.ToString(CultureInfo.InvariantCulture),
                        i.ToDouble(CultureInfo.InvariantCulture)))
                .ToArray();
        }

        var factory = ObjectEntriesCache.GetOrAdd(v.GetType(),
            t =>
            {
                var props = t.GetProperties(BindingFlags.Instance | BindingFlags.Public);
                var dict = new Dictionary<string, Func<object, object>>(props.Length);
                foreach (var p in props)
                {
                    var camelCase = p.Name.Length > 1
                        ? p.Name.Substring(0, 1).ToLowerInvariant() + p.Name.Substring(1)
                        : p.Name.ToLowerInvariant();
                    dict[camelCase] = Object.CompilePropertyAccessor(p);
                }

                return dict;
            });

        return factory
            .Select(item => new ArrayTuple<string, object>(item.Key, item.Value(v)))
            .ToList();
    }

    private static Func<object, object> CompilePropertyAccessor(PropertyInfo propertyInfo)
    {
        var param = Expression.Parameter(typeof(object));
        var castParam = Expression.Convert(param, propertyInfo.DeclaringType!);
        var accessor = Expression.Property(castParam, propertyInfo);
        var castReturn = Expression.Convert(accessor, typeof(object));
        return Expression.Lambda<Func<object, object>>(castReturn, param)
            .Compile();
    }
}
