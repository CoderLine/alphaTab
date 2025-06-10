using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AlphaTab;

static partial class TestPlatform
{
    public static readonly Lazy<string> RepositoryRoot = new(() =>
    {
        var currentDir = new DirectoryInfo(System.Environment.CurrentDirectory);
        while (currentDir != null)
        {
            if (currentDir.GetFiles("package.json").Length == 1)
            {
                return currentDir.FullName;
            }

            currentDir = currentDir.Parent;
        }

        throw new IOException(
            $"Could not find repository root via working dir {System.Environment.CurrentDirectory}");
    });

    public static async Task<Uint8Array> LoadFile(string path)
    {
        await using var fs =
            new FileStream(Path.Combine(RepositoryRoot.Value, path), FileMode.Open);
        await using var ms = new MemoryStream();
        await fs.CopyToAsync(ms);
        return new Uint8Array(ms.ToArray());
    }

    public static Uint8Array LoadFileSync(string path)
    {
        using var fs =
            new FileStream(Path.Combine(RepositoryRoot.Value, path), FileMode.Open);
        using var ms = new MemoryStream();
        fs.CopyTo(ms);
        return new Uint8Array(ms.ToArray());
    }

    public static async Task SaveFile(string name, Uint8Array data)
    {
        var path = Path.Combine(RepositoryRoot.Value, name);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await using var fs = new FileStream(path, FileMode.Create);
        await fs.WriteAsync(data.Buffer.Raw, (int)data.ByteOffset, (int)data.Length);
    }

    public static Task<IList<string>> ListDirectory(string path)
    {
        return Task.FromResult((IList<string>)Directory
            .EnumerateFiles(Path.Combine(RepositoryRoot.Value, path))
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
