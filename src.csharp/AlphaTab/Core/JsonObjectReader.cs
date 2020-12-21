using System.Collections.Generic;
using AlphaTab.Io;

namespace AlphaTab.Core
{
    public class JsonObjectReader : IJsonReader
    {
        public JsonValueType CurrentValueType { get; }

        public JsonObjectReader(object? value)
        {
        }

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

        public string Prop()
        {
            throw new System.NotImplementedException();
        }

        public T EnumProp<T>(object? enumType)
        {
            throw new System.NotImplementedException();
        }

        public double NumberProp()
        {
            throw new System.NotImplementedException();
        }

        public bool NextProp()
        {
            throw new System.NotImplementedException();
        }

        public bool NextItem()
        {
            throw new System.NotImplementedException();
        }

        public object? Unknown()
        {
            throw new System.NotImplementedException();
        }

        public string? String()
        {
            throw new System.NotImplementedException();
        }

        public T? Enum<T>(dynamic enumType) where T : struct
        {
            throw new System.NotImplementedException();
        }

        public double? Number()
        {
            throw new System.NotImplementedException();
        }

        public bool? Boolean()
        {
            throw new System.NotImplementedException();
        }

        public IList<string>? StringArray()
        {
            throw new System.NotImplementedException();
        }

        public IList<double>? NumberArray()
        {
            throw new System.NotImplementedException();
        }
    }
}
