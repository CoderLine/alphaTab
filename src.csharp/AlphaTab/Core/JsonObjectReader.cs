using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using AlphaTab.Io;

namespace AlphaTab.Core
{
    public class JsonObjectReader : IJsonReader
    {
        private class ReaderStackItem
        {
            public object? Obj { get; set; }
            public int CurrentIndex { get; set; }
            public string? CurrentProp { get; set; }
            public object? CurrentValue { get; set; }
            public IList<string>? CurrentObjectKeys { get; set; }
        }

        private ReaderStackItem? _currentItem;
        private readonly Stack<ReaderStackItem> _readStack = new Stack<ReaderStackItem>();

        public JsonValueType CurrentValueType { get; private set; } = JsonValueType.Null;

        public JsonObjectReader(object? value)
        {
            var root = new Dictionary<string, object>
            {
                ["root"] = value
            };
            SetCurrentObject(root);
            NextProp();
        }

        private void UpdateCurrentValueType(object? val)
        {
            switch (TypeHelper.TypeOf(val))
            {
                case "undefined":
                    CurrentValueType = JsonValueType.Null;
                    break;
                case "string":
                    CurrentValueType = JsonValueType.String;
                    break;
                case "object":
                    if (val == null)
                    {
                        CurrentValueType = JsonValueType.Null;
                    }
                    else if (EcmaScript.Array.IsArray(val))
                    {
                        CurrentValueType = JsonValueType.Array;
                    }
                    else
                    {
                        CurrentValueType = JsonValueType.Object;
                    }

                    break;
                case "number":
                    CurrentValueType = JsonValueType.Number;
                    break;
                case "boolean":
                    CurrentValueType = JsonValueType.Boolean;
                    break;
            }
        }

        private void SetCurrentObject(object current)
        {
            var currentObjectKeys = EcmaScript.Object.Keys(current);
            var obj = new ReaderStackItem
            {
                Obj = current,
                CurrentIndex = -1,
                CurrentObjectKeys = currentObjectKeys
            };
            _readStack.Push(obj);
            _currentItem = obj;
        }

        public string Prop()
        {
            return _currentItem?.CurrentProp ?? "";
        }

        private T ParseEnum<T>(string value)
        {
            return (T) System.Enum.Parse(typeof(T), value, true);
        }

        public T EnumProp<T>(object? enumType) where T : struct
        {
            var prop = Prop();
            var num = Globals.ParseInt(prop);
            return Globals.IsNaN(num)
                ? ParseEnum<T>(prop)
                : (T) (object) num;
        }

        public double NumberProp()
        {
            var prop = Prop();
            return Globals.ParseInt(prop);
        }

        public bool NextProp()
        {
            var currentItem = _currentItem!;
            currentItem.CurrentIndex++;
            if (currentItem.CurrentIndex < currentItem.CurrentObjectKeys.Count)
            {
                currentItem.CurrentProp = currentItem.CurrentObjectKeys[currentItem.CurrentIndex];
                currentItem.CurrentValue = GetProperty(currentItem.Obj, currentItem.CurrentProp);
                UpdateCurrentValueType(currentItem.CurrentValue);
                return true;
            }

            CurrentValueType = JsonValueType.Null;
            return false;
        }

        private object? GetProperty(object o, string property)
        {
            if (o is IDictionary d)
            {
                return d[property];
            }

            return o.GetType()
                .GetProperty(property, BindingFlags.Instance | BindingFlags.Public)
                ?.GetValue(o);
        }

        public bool NextItem()
        {
            var currentItem = _currentItem!;
            currentItem.CurrentIndex++;

            if (EcmaScript.Array.IsArray(currentItem.Obj) &&
                currentItem.CurrentIndex < ((IList) currentItem.Obj).Count)
            {
                currentItem.CurrentValue = ((IList) currentItem.Obj)[currentItem.CurrentIndex];
                UpdateCurrentValueType(currentItem.CurrentValue);
                return true;
            }
            else
            {
                return false;
            }
        }

        public void StartObject()
        {
            var currentItem = _currentItem;
            if (currentItem != null)
            {
                switch (CurrentValueType)
                {
                    case JsonValueType.Object:
                        SetCurrentObject(currentItem.CurrentValue!);
                        break;
                    case JsonValueType.Array:
                        SetCurrentObject(currentItem.CurrentValue!);
                        break;
                    default:
                        throw new InvalidOperationException(
                            $"Cannot start object / array in the current item.item is a {CurrentValueType}");
                }
            }
        }

        public void EndObject()
        {
            _readStack.Pop();
            _currentItem = _readStack.Peek();
        }

        public void StartArray()
        {
            StartObject();
        }

        public void EndArray()
        {
            EndObject();
        }

        public object? Unknown()
        {
            return ValueClass<object>(CurrentValueType);
        }

        public string? String()
        {
            return ValueClass<string>(JsonValueType.String);
        }

        public T? Enum<T>(object? numType) where T : struct
        {
            var currentItem = _currentItem;
            if (currentItem != null)
            {
                switch (CurrentValueType)
                {
                    case JsonValueType.String:
                        return ParseEnum<T>(currentItem.CurrentValue as string);
                    case JsonValueType.Number:
                        return (T) currentItem.CurrentValue;
                }
            }

            return null;
        }

        public double? Number()
        {
            return this.ValueStruct<double>(JsonValueType.Number);
        }

        public bool? Boolean()
        {
            return this.ValueStruct<bool>(JsonValueType.Boolean);
        }

        public IList<string>? StringArray()
        {
            return ValueClass<IList<string>>(JsonValueType.Array);
        }

        public IList<double>? NumberArray()
        {
            return ValueClass<IList<double>>(JsonValueType.Array);
        }

        private T? ValueClass<T>(JsonValueType type) where T : class
        {
            var currentItem = _currentItem;
            if (currentItem != null && CurrentValueType == type)
            {
                return (T?) currentItem.CurrentValue;
            }

            return null;
        }

        private T? ValueStruct<T>(JsonValueType type) where T : struct
        {
            var currentItem = _currentItem;
            if (currentItem != null && CurrentValueType == type)
            {
                return (T?) currentItem.CurrentValue;
            }

            return null;
        }
    }
}
