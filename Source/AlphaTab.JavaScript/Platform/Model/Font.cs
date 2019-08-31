using System;
using AlphaTab.Collections;
using AlphaTab.Haxe.Js;
using AlphaTab.Util;
using AlphaTab.Utils;
using Phase;

namespace AlphaTab.Platform.Model
{
    public partial class Font
    {
        public static Font FromJson(object value)
        {
            if (value == null)
            {
                return null;
            }

            if (value is Font)
            {
                return (Font)value;
            }

            if (Platform.TypeOf(value) == "object" && value.Member<bool>("family"))
            {
                return new Font(value.Member<string>("family"),
                    value.Member<float>("size"),
                    (FontStyle)value.Member<int>("style"));
            }

            if (Platform.TypeOf(value) == "string" && Lib.Global.document)
            {
                var fontText = value.As<string>();
                var el = Browser.Document.CreateElement("span");
                el.SetAttribute("style", "font: " + fontText);

                var style = el.Style;

                if (string.IsNullOrEmpty(style.FontFamily))
                {
                    style.FontFamily = "sans-serif";
                }

                string family = style.FontFamily;
                if (family.StartsWith("'") && family.EndsWith("'") || family.StartsWith("\"") && family.EndsWith("\""))
                {
                    family = family.Substring(1, family.Length - 2);
                }

                string fontSizeString = style.FontSize.ToLowerCase();
                float fontSize;
                // as per https://websemantics.uk/articles/font-size-conversion/
                switch (fontSizeString)
                {
                    case "xx-small":
                        fontSize = 7;
                        break;
                    case "x-small":
                        fontSize = 10;
                        break;
                    case "small":
                    case "smaller":
                        fontSize = 13;
                        break;
                    case "medium":
                        fontSize = 16;
                        break;
                    case "large":
                    case "larger":
                        fontSize = 18;
                        break;
                    case "x-large":
                        fontSize = 24;
                        break;
                    case "xx-large":
                        fontSize = 32;
                        break;
                    default:
                        try
                        {
                            if (fontSizeString.EndsWith("em"))
                            {
                                fontSize = Platform.ParseFloat(
                                               fontSizeString.Substring(0, fontSizeString.Length - 2)) * 16;
                            }
                            else if (fontSizeString.EndsWith("pt"))
                            {
                                fontSize = Platform.ParseFloat(
                                               fontSizeString.Substring(0, fontSizeString.Length - 2)) * 16.0f / 12.0f;
                            }
                            else if (fontSizeString.EndsWith("px"))
                            {
                                fontSize = Platform.ParseFloat(
                                    fontSizeString.Substring(0, fontSizeString.Length - 2));
                            }
                            else
                            {
                                fontSize = 12;
                            }
                        }
                        catch
                        {
                            fontSize = 12;
                        }

                        break;
                }

                var fontStyle = FontStyle.Plain;
                if (style.FontStyle == "italic")
                {
                    fontStyle |= FontStyle.Italic;
                }

                string fontWeightString = style.FontWeight.ToLowerCase();
                switch (fontWeightString)
                {
                    case "normal":
                    case "lighter":
                        break;
                    default:
                        fontStyle |= FontStyle.Bold;
                        break;
                }

                return new Font(family, fontSize, fontStyle);
            }

            throw new SerializationException("Unsupported value for Font");
        }

        public static object ToJson(Font font)
        {
            var json = Platform.NewObject();
            json.family = font.Family;
            json.size = font.Size;
            json.style = (int)font.Style;
            return json;
        }
    }
}
