using System;
using System.Collections;
using System.Collections.Generic;
using AlphaTab.Io;

namespace AlphaTab.Core
{
    public class JsonObjectWriter : IJsonWriter
    {
        private readonly Stack<object> _objectStack = new Stack<object>();

        private string _currentPropertyName = "";


        public object? Result { get; private set; }

        public void StartObject()
        {
            if (_objectStack.Count > 0)
            {
                var newObject = new Dictionary<string, object>();
                var currentObject = _objectStack.Peek();
                _objectStack.Push(newObject);

                switch (currentObject)
                {
                    case IList l:
                        l.Add(newObject);
                        break;
                    case IDictionary<string, object> d:
                        d[_currentPropertyName] = newObject;
                        break;
                    default:
                        throw new InvalidOperationException("invalid object on write stack");
                }
            }
            else
            {
                Result = new Dictionary<string, object>();
                _objectStack.Push(Result);
            }
        }

        public void EndObject()
        {
            _objectStack.Pop();
        }

        public void StartArray()
        {
            if (_objectStack.Count > 0)
            {
                var newObject = new List<object>();
                var currentObject = _objectStack.Peek();
                _objectStack.Push(newObject);

                switch (currentObject)
                {
                    case IList l:
                        l.Add(newObject);
                        break;
                    case IDictionary<string, object> d:
                        d[_currentPropertyName] = newObject;
                        break;
                    default:
                        throw new InvalidOperationException("invalid object on write stack");
                }
            }
            else
            {
                Result = new List<object>();
                _objectStack.Push(Result);
            }
        }

        public void EndArray()
        {
            _objectStack.Pop();
        }

        public void Prop(object? name)
        {
            _currentPropertyName = Convert.ToString(name);
        }

        public void Unknown(object? value, object? propName = null)
        {
            WriteValue(value, propName);
        }

        public void String(string? value, object? propName = null)
        {
            WriteValue(value, propName);
        }

        public void Number(double? value, object? propName = null)
        {
            WriteValue(value, propName);
        }

        public void Boolean(bool? value, object? propName = null)
        {
            WriteValue(value, propName);
        }

        public void Enum<T>(T value, object? propName = null)
        {
            WriteValue(value, propName);
        }

        public void Null(object? propName = null)
        {
            WriteValue(null, propName);
        }

        public void StringArray(IList<string>? value, object? propName = null)
        {
            WriteValue(value, propName);
        }

        public void NumberArray(IList<double>? value, object? propName = default)
        {
            WriteValue(value, propName);
        }

        private void WriteValue(object? value, object? propName)
        {
            if (_objectStack.Count > 0)
            {
                var currentObject = _objectStack.Peek();
                switch (currentObject)
                {
                    case IList l:
                        l.Add(value);
                        break;
                    case IDictionary<string, object> d:
                        if (propName != null)
                        {
                            d[Convert.ToString(propName)] = value;
                        }
                        else
                        {
                            d[_currentPropertyName] = value;
                        }

                        break;
                    default:
                        throw new InvalidOperationException("Cannot add new value to parent");
                }
            }
            else
            {
                Result = value;
            }
        }
    }
}
