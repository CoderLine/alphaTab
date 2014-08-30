namespace System.Runtime.CompilerServices
{
    [AttributeUsage(AttributeTargets.Property, Inherited = true, AllowMultiple = false)]
    public sealed class IntrinsicPropertyAttribute : Attribute
    {
    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface | AttributeTargets.Struct | AttributeTargets.Enum | AttributeTargets.Field | AttributeTargets.Property | AttributeTargets.Method | AttributeTargets.Event | AttributeTargets.Constructor, Inherited = false, AllowMultiple = false)]
    public sealed class ScriptNameAttribute : Attribute
    {
        public ScriptNameAttribute(string name)
        {
            Name = name;
        }

        public string Name { get; private set; }
    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Enum | AttributeTargets.Interface | AttributeTargets.Struct, Inherited = true, AllowMultiple = false)]
    public sealed class IgnoreNamespaceAttribute : Attribute
    {
    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface | AttributeTargets.Enum | AttributeTargets.Struct)]
    public sealed class ImportedAttribute : Attribute
    {
        public bool ObeysTypeSystem { get; set; }
        public string TypeCheckCode { get; set; }
    }

    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Property, Inherited = true, AllowMultiple = false)]
    public sealed class ScriptAliasAttribute : Attribute
    {
        public ScriptAliasAttribute(string alias)
        {
            Alias = alias;
        }

        public string Alias { get; private set; }
    }

    [AttributeUsage(AttributeTargets.Method)]
    public sealed class EnumerateAsArrayAttribute : Attribute
    {
    }

    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Constructor, Inherited = true, AllowMultiple = false)]
    public sealed class InlineCodeAttribute : Attribute
    {
        public InlineCodeAttribute(string code)
        {
            Code = code;
        }

        public string Code { get; private set; }
        public string GeneratedMethodName { get; set; }
        public string NonVirtualCode { get; set; }
        public string NonExpandedFormCode { get; set; }
    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Struct | AttributeTargets.Interface | AttributeTargets.Method, Inherited = true, AllowMultiple = false)]
    public sealed class IncludeGenericArgumentsAttribute : Attribute
    {
        public IncludeGenericArgumentsAttribute()
        {
            Include = true;
        }

        public IncludeGenericArgumentsAttribute(bool include)
        {
            Include = include;
        }

        public bool Include { get; private set; }
    }
}