using System.Collections.Concurrent;
using System.Text.RegularExpressions;

namespace AlphaTab.Core.EcmaScript
{
    public class RegExp
    {
        private static ConcurrentDictionary<(string pattern, string flags), RegExp> Cache =
            new ConcurrentDictionary<(string pattern, string flags), RegExp>();

        private readonly Regex _regex;
        private readonly bool _global;

        public RegExp(string regex, string flags = "")
        {
            if (!Cache.TryGetValue((regex, flags), out var cached))
            {
                var netFlags = RegexOptions.Compiled;
                foreach (var c in flags)
                {
                    switch (c)
                    {
                        case 'i':
                            netFlags |= RegexOptions.IgnoreCase;
                            break;
                        case 'g':
                            _global = true;
                            break;
                        case 'm':
                            netFlags |= RegexOptions.Multiline;
                            break;
                    }
                }

                _regex = new Regex(regex, netFlags);
                Cache[(regex, flags)] = this;
            }
            else
            {
                _regex = cached._regex;
                _global = cached._global;
            }
        }

        public bool Exec(string s)
        {
            return _regex.IsMatch(s);
        }

        public string Replace(string input, string replacement)
        {
            return _global
                ? _regex.Replace(input, replacement)
                : _regex.Replace(input, replacement, 1);
        }
    }
}
