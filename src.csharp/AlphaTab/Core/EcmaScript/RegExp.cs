using System.Text.RegularExpressions;

namespace AlphaTab.Core.EcmaScript
{
    public class RegExp
    {
        private readonly Regex _regex;

        public RegExp(string regex)
        {
            _regex = new Regex(regex, RegexOptions.Compiled);
        }

        public bool Exec(string s)
        {
            return _regex.IsMatch(s);
        }
    }
}
