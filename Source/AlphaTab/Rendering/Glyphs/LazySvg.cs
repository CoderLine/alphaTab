using System.Collections.Generic;
using System.Runtime.CompilerServices;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class SvgCommand
    {
        [IntrinsicProperty]
        public string Cmd { get; set; }
        [IntrinsicProperty]
        public List<int> Numbers { get; set; }
    }

    /// <summary>
    /// This public class parses svg path when accessing it. 
    /// This ensures the SVG path data only needs to be parsed once. 
    /// </summary>
    public class LazySvg
    {
        private string _raw;
        private List<SvgCommand> _parsed;

        public LazySvg(string raw)
        {
            _raw = raw;
        }

        public List<SvgCommand> Commands
        {
            get
            {
                if (_parsed == null) Parse();
                return _parsed;
            }
        }

        private void Parse()
        {
            var parser = new SvgPathParser(_raw);
            parser.Reset();
            _parsed = new List<SvgCommand>();
        
            while (!parser.Eof)
            {
                var command = new SvgCommand();
                _parsed.Add(command);
            
                command.Cmd = parser.GetString();
                switch (command.Cmd) 
                { 
                    //
                    // Moving
                    // 
                    case "M": // absolute moveto
                        command.Numbers = new List<int>();
                        command.Numbers.Add(parser.GetNumber());
                        command.Numbers.Add(parser.GetNumber());
                        break;
                    case "m": // relative moveto
                        command.Numbers = new List<int>();
                        command.Numbers.Add(parser.GetNumber());
                        command.Numbers.Add(parser.GetNumber());
                        break;
                        //
                    // Closing
                    // 
                    case "Z":
                    case "z":
                        break;
                    //
                    // Lines
                    //                 
                    case "L": // absolute lineTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;
                    case "l": // relative lineTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber()); 
                            command.Numbers.Add(parser.GetNumber()); 
                        } while (parser.CurrentTokenIsNumber);
                        break;

                    case "V": // absolute verticalTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;
                    case "v": // relative verticalTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;

                    case "H": // absolute horizontalTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;
                    case "h": // relative horizontalTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;

                        //
                    // cubic bezier curves
                    // 
                    case "C": // absolute cubicTo
                        command.Numbers = new List<int>();
                        do 
                        {
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;
                    case "c": // relative cubicTo
                        command.Numbers = new List<int>();
                        do {
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                           command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;

                    case "S": // absolute shorthand cubicTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;
                    case "s": // relative shorthand cubicTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;

                        //
                    // quadratic bezier curves
                    //
                    case "Q": // absolute quadraticTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;
                    case "q": // relative quadraticTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;

                    case "T": // absolute shorthand quadraticTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;
                    case "t": // relative shorthand quadraticTo
                        command.Numbers = new List<int>();
                        do 
                        {
                            command.Numbers.Add(parser.GetNumber());
                            command.Numbers.Add(parser.GetNumber());
                        } while (parser.CurrentTokenIsNumber);
                        break;
                }
            }
            _raw = null; // not needed anymore.
        }
    }
}
