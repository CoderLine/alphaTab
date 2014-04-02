using System.Collections.Generic;

namespace AlphaTab.Audio
{
    /// <summary>
    /// This public class provides names for all general midi instruments.
    /// </summary>
    public class GeneralMidi
    {
        private static Dictionary<string, int> _values;

        public static int GetValue(string name)
        {
            if (_values == null)
            {
                _values = new Dictionary<string, int>();
                _values.Add("acousticgrandpiano", 0);
                _values.Add("brightacousticpiano", 1);
                _values.Add("electricgrandpiano", 2);
                _values.Add("honkytonkpiano", 3);
                _values.Add("electricpiano1", 4);
                _values.Add("electricpiano2", 5);
                _values.Add("harpsichord", 6);
                _values.Add("clavinet", 7);
                _values.Add("celesta", 8);
                _values.Add("glockenspiel", 9);
                _values.Add("musicbox", 10);
                _values.Add("vibraphone", 11);
                _values.Add("marimba", 12);
                _values.Add("xylophone", 13);
                _values.Add("tubularbells", 14);
                _values.Add("dulcimer", 15);
                _values.Add("drawbarorgan", 16);
                _values.Add("percussiveorgan", 17);
                _values.Add("rockorgan", 18);
                _values.Add("churchorgan", 19);
                _values.Add("reedorgan", 20);
                _values.Add("accordion", 21);
                _values.Add("harmonica", 22);
                _values.Add("tangoaccordion", 23);
                _values.Add("acousticguitarnylon", 24);
                _values.Add("acousticguitarsteel", 25);
                _values.Add("electricguitarjazz", 26);
                _values.Add("electricguitarclean", 27);
                _values.Add("electricguitarmuted", 28);
                _values.Add("overdrivenguitar", 29);
                _values.Add("distortionguitar", 30);
                _values.Add("guitarharmonics", 31);
                _values.Add("acousticbass", 32);
                _values.Add("electricbassfinger", 33);
                _values.Add("electricbasspick", 34);
                _values.Add("fretlessbass", 35);
                _values.Add("slapbass1", 36);
                _values.Add("slapbass2", 37);
                _values.Add("synthbass1", 38);
                _values.Add("synthbass2", 39);
                _values.Add("violin", 40);
                _values.Add("viola", 41);
                _values.Add("cello", 42);
                _values.Add("contrabass", 43);
                _values.Add("tremolostrings", 44);
                _values.Add("pizzicatostrings", 45);
                _values.Add("orchestralharp", 46);
                _values.Add("timpani", 47);
                _values.Add("stringensemble1", 48);
                _values.Add("stringensemble2", 49);
                _values.Add("synthstrings1", 50);
                _values.Add("synthstrings2", 51);
                _values.Add("choiraahs", 52);
                _values.Add("voiceoohs", 53);
                _values.Add("synthvoice", 54);
                _values.Add("orchestrahit", 55);
                _values.Add("trumpet", 56);
                _values.Add("trombone", 57);
                _values.Add("tuba", 58);
                _values.Add("mutedtrumpet", 59);
                _values.Add("frenchhorn", 60);
                _values.Add("brasssection", 61);
                _values.Add("synthbrass1", 62);
                _values.Add("synthbrass2", 63);
                _values.Add("sopranosax", 64);
                _values.Add("altosax", 65);
                _values.Add("tenorsax", 66);
                _values.Add("baritonesax", 67);
                _values.Add("oboe", 68);
                _values.Add("englishhorn", 69);
                _values.Add("bassoon", 70);
                _values.Add("clarinet", 71);
                _values.Add("piccolo", 72);
                _values.Add("flute", 73);
                _values.Add("recorder", 74);
                _values.Add("panflute", 75);
                _values.Add("blownbottle", 76);
                _values.Add("shakuhachi", 77);
                _values.Add("whistle", 78);
                _values.Add("ocarina", 79);
                _values.Add("lead1square", 80);
                _values.Add("lead2sawtooth", 81);
                _values.Add("lead3calliope", 82);
                _values.Add("lead4chiff", 83);
                _values.Add("lead5charang", 84);
                _values.Add("lead6voice", 85);
                _values.Add("lead7fifths", 86);
                _values.Add("lead8bassandlead", 87);
                _values.Add("pad1newage", 88);
                _values.Add("pad2warm", 89);
                _values.Add("pad3polysynth", 90);
                _values.Add("pad4choir", 91);
                _values.Add("pad5bowed", 92);
                _values.Add("pad6metallic", 93);
                _values.Add("pad7halo", 94);
                _values.Add("pad8sweep", 95);
                _values.Add("fx1rain", 96);
                _values.Add("fx2soundtrack", 97);
                _values.Add("fx3crystal", 98);
                _values.Add("fx4atmosphere", 99);
                _values.Add("fx5brightness", 100);
                _values.Add("fx6goblins", 101);
                _values.Add("fx7echoes", 102);
                _values.Add("fx8scifi", 103);
                _values.Add("sitar", 104);
                _values.Add("banjo", 105);
                _values.Add("shamisen", 106);
                _values.Add("koto", 107);
                _values.Add("kalimba", 108);
                _values.Add("bagpipe", 109);
                _values.Add("fiddle", 110);
                _values.Add("shanai", 111);
                _values.Add("tinklebell", 112);
                _values.Add("agogo", 113);
                _values.Add("steeldrums", 114);
                _values.Add("woodblock", 115);
                _values.Add("taikodrum", 116);
                _values.Add("melodictom", 117);
                _values.Add("synthdrum", 118);
                _values.Add("reversecymbal", 119);
                _values.Add("guitarfretnoise", 120);
                _values.Add("breathnoise", 121);
                _values.Add("seashore", 122);
                _values.Add("birdtweet", 123);
                _values.Add("telephonering", 124);
                _values.Add("helicopter", 125);
                _values.Add("applause", 126);
                _values.Add("gunshot", 127);
            }
            name = name.ToLower().Replace(" ", "");
            return _values.ContainsKey(name) ? _values[name] : 0;
        }
    }
}
