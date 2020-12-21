using System.Collections.Generic;
using AlphaTab.Io;

namespace AlphaTab.Core
{
    public class JsonObjectWriter : IJsonWriter
    {
        public object? Result { get; }
        public void StartObject()
        {
            throw new System.NotImplementedException();
        }

        public void EndObject()
        {
            throw new System.NotImplementedException();
        }

        public void StartArray()
        {
            throw new System.NotImplementedException();
        }

        public void EndArray()
        {
            throw new System.NotImplementedException();
        }

        public void Prop(dynamic name)
        {
            throw new System.NotImplementedException();
        }

        public void Unknown(object? value, dynamic? propName = default)
        {
            throw new System.NotImplementedException();
        }

        public void String(string? value, dynamic? propName = default)
        {
            throw new System.NotImplementedException();
        }

        public void Number(double? value, dynamic? propName = default)
        {
            throw new System.NotImplementedException();
        }

        public void Boolean(bool? value, dynamic? propName = default)
        {
            throw new System.NotImplementedException();
        }

        public void Enum<T>(T value, dynamic? propName = default)
        {
            throw new System.NotImplementedException();
        }

        public void Null(dynamic? propName = default)
        {
            throw new System.NotImplementedException();
        }

        public void StringArray(IList<string>? value, dynamic? propName = default)
        {
            throw new System.NotImplementedException();
        }

        public void NumberArray(IList<double>? value, dynamic? propName = default)
        {
            throw new System.NotImplementedException();
        }
    }
}
