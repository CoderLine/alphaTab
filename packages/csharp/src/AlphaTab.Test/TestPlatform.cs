using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace AlphaTab;

static partial class TestPlatform
{
    public static readonly Lazy<string> AlphaTabProjectRoot = new(() =>
    {
        var currentDir = new DirectoryInfo(System.Environment.CurrentDirectory);
        while (currentDir != null)
        {
            if (currentDir.GetDirectories(".git").Length == 1)
            {
                return System.IO.Path.Join(currentDir.FullName, "packages", "alphatab");
            }

            currentDir = currentDir.Parent;
        }

        throw new IOException(
            $"Could not find repository root via working dir {System.Environment.CurrentDirectory}");
    });

    public static async Task<Uint8Array> LoadFile(string path)
    {
        await using var fs =
            new FileStream(Path.Combine(AlphaTabProjectRoot.Value, path), FileMode.Open);
        await using var ms = new MemoryStream();
        await fs.CopyToAsync(ms);
        return new Uint8Array(ms.ToArray());
    }

    public static async Task<T> LoadFileAsJson<T>(string path)
    {
        await using var fs =
            new FileStream(Path.Combine(AlphaTabProjectRoot.Value, path), FileMode.Open);
        return (await JsonSerializer.DeserializeAsync<T>(fs, JsonOptions))!;
    }

    private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new ArrayTupleConverterFactory() }
    };

    private class ArrayTupleConverterFactory  :JsonConverterFactory
    {
        public override bool CanConvert(Type typeToConvert)
        {
            if (!typeToConvert.IsGenericType)
            {
                return false;
            }

            if (typeToConvert.GetGenericTypeDefinition() != typeof(ArrayTuple<,>))
            {
                return false;
            }

            return true;
        }

        public override JsonConverter CreateConverter(
            Type type,
            JsonSerializerOptions options)
        {
            var typeArguments = type.GetGenericArguments();
            var keyType = typeArguments[0];
            var valueType = typeArguments[1];

            var converter = (JsonConverter)Activator.CreateInstance(
                typeof(ArrayTupleConverter<,>).MakeGenericType(keyType, valueType),
                BindingFlags.Instance | BindingFlags.Public,
                binder: null,
                args: new object[]{options},
                culture: null)!;

            return converter;
        }
    }

    private class ArrayTupleConverter<TKey, TValue> : JsonConverter<ArrayTuple<TKey, TValue>>
    {
        private readonly JsonConverter<TValue> _valueConverter;
        private readonly JsonConverter<TKey> _keyConverter;
        private readonly Type _keyType;
        private readonly Type _valueType;

        public ArrayTupleConverter(JsonSerializerOptions options)
        {
            _valueConverter = (JsonConverter<TValue>)options
                .GetConverter(typeof(TValue));

            _keyConverter = (JsonConverter<TKey>)options
                .GetConverter(typeof(TKey));

            _keyType = typeof(TKey);
            _valueType = typeof(TValue);
        }

        public override ArrayTuple<TKey, TValue> Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options)
        {
            if (reader.TokenType != JsonTokenType.StartArray)
            {
                throw new JsonException();
            }

            if (!reader.Read())
            {
                throw new JsonException();
            }
            var v0 = _keyConverter.Read(ref reader, _keyType, options)!;

            if (!reader.Read())
            {
                throw new JsonException();
            }

            var v1 = _valueConverter.Read(ref reader, _valueType, options)!;
            if (!reader.Read() || reader.TokenType != JsonTokenType.EndArray)
            {
                throw new JsonException();
            }

            return new ArrayTuple<TKey, TValue>(v0, v1);
        }

        public override void Write(Utf8JsonWriter writer, ArrayTuple<TKey, TValue> value, JsonSerializerOptions options)
        {
            writer.WriteStartArray();
            _keyConverter.Write(writer, value.V0, options);
            _valueConverter.Write(writer, value.V1, options);
            writer.WriteEndArray();
        }
    }

    public static Uint8Array LoadFileSync(string path)
    {
        using var fs =
            new FileStream(Path.Combine(AlphaTabProjectRoot.Value, path), FileMode.Open);
        using var ms = new MemoryStream();
        fs.CopyTo(ms);
        return new Uint8Array(ms.ToArray());
    }

    public static async Task SaveFile(string name, Uint8Array data)
    {
        var path = Path.Combine(AlphaTabProjectRoot.Value, name);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await using var fs = new FileStream(path, FileMode.Create);
        await fs.WriteAsync(data.Buffer.Raw, (int)data.ByteOffset, (int)data.Length);
    }

    public static Task<IList<string>> ListDirectory(string path)
    {
        return Task.FromResult((IList<string>)Directory
            .EnumerateFiles(Path.Combine(AlphaTabProjectRoot.Value, path))
            .Select(Path.GetFileName)
            .ToList());
    }

    public static string JoinPath(string path1, string path2, string path3)
    {
        return Path.Join(path1, path2, path3);
    }

    public static Task DeleteFile(string path)
    {
        if (File.Exists(path))
        {
            File.Delete(path);
        }

        return Task.CompletedTask;
    }

    public static T[] EnumValues<T>(Type type) where T : struct, Enum
    {
        return Enum.GetValues<T>();
    }

    public static IEnumerable<ArrayTuple<object?, object?>> MapAsUnknownIterable(object map)
    {
        if (map is IDictionary mapAsUnknownIterable)
        {
            foreach (DictionaryEntry v in mapAsUnknownIterable)
            {
                yield return new ArrayTuple<object?, object?>(v.Key, v.Value);
            }
        }
        else
        {
            throw new ArgumentException("Provided value was no map", nameof(map));
        }
    }

    public static IEnumerable<object?> TypedArrayAsUnknownIterable(object map)
    {
        if (map is IEnumerable enumerable)
        {
            foreach (var v in enumerable)
            {
                yield return v;
            }
        }
        else
        {
            throw new ArgumentException("Provided value was no map", nameof(map));
        }
    }

    public static IList TypedArrayAsUnknownArray(object? array)
    {
        return array switch
        {
            IList l => l,
            _ => throw new InvalidCastException(
                $"Unknown array type[{array?.GetType().FullName}]")
        };
    }
}
