using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Importer
{
    internal class BinaryStylesheet
    {
        public FastDictionary<string, object> Raw { get; }

        public BinaryStylesheet()
        {
            Raw = new FastDictionary<string, object>();
        }

        public void Apply(Score score)
        {
            foreach (var key in Raw)
            {
                switch (key)
                {
                    case "StandardNotation/hideDynamics":
                        score.Stylesheet.HideDynamics = (bool)Raw[key];
                        break;
                }
            }
        }

        public void AddValue(string key, object value)
        {
            Raw[key] = value;
        }
    }
}
