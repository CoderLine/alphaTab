/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.audio;

/**
 * This class provides names for all general midi instruments.
 * @author Daniel Kuschny
 */
class GeneralMidi  
{
    private static var _values:Hash<Int>;
    
    public static function getValue(name:String) : Int
    {
        if(_values == null)
        {
            _values = new Hash<Int>();
            _values.set("acousticgrandpiano", 0);
            _values.set("brightacousticpiano", 1);
            _values.set("electricgrandpiano", 2);
            _values.set("honkytonkpiano", 3);
            _values.set("electricpiano1", 4);
            _values.set("electricpiano2", 5);
            _values.set("harpsichord", 6);
            _values.set("clavinet", 7);
            _values.set("celesta", 8);
            _values.set("glockenspiel", 9);
            _values.set("musicbox", 10);
            _values.set("vibraphone", 11);
            _values.set("marimba", 12);
            _values.set("xylophone", 13);
            _values.set("tubularbells", 14);
            _values.set("dulcimer", 15);
            _values.set("drawbarorgan", 16);
            _values.set("percussiveorgan", 17);
            _values.set("rockorgan", 18);
            _values.set("churchorgan", 19);
            _values.set("reedorgan", 20);
            _values.set("accordion", 21);
            _values.set("harmonica", 22);
            _values.set("tangoaccordion", 23);
            _values.set("acousticguitarnylon", 24);
            _values.set("acousticguitarsteel", 25);
            _values.set("electricguitarjazz", 26);
            _values.set("electricguitarclean", 27);
            _values.set("electricguitarmuted", 28);
            _values.set("overdrivenguitar", 29);
            _values.set("distortionguitar", 30);
            _values.set("guitarharmonics", 31);
            _values.set("acousticbass", 32);
            _values.set("electricbassfinger", 33);
            _values.set("electricbasspick", 34);
            _values.set("fretlessbass", 35);
            _values.set("slapbass1", 36);
            _values.set("slapbass2", 37);
            _values.set("synthbass1", 38);
            _values.set("synthbass2", 39);
            _values.set("violin", 40);
            _values.set("viola", 41);
            _values.set("cello", 42);
            _values.set("contrabass", 43);
            _values.set("tremolostrings", 44);
            _values.set("pizzicatostrings", 45);
            _values.set("orchestralharp", 46);
            _values.set("timpani", 47);
            _values.set("stringensemble1", 48);
            _values.set("stringensemble2", 49);
            _values.set("synthstrings1", 50);
            _values.set("synthstrings2", 51);
            _values.set("choiraahs", 52);
            _values.set("voiceoohs", 53);
            _values.set("synthvoice", 54);
            _values.set("orchestrahit", 55);
            _values.set("trumpet", 56);
            _values.set("trombone", 57);
            _values.set("tuba", 58);
            _values.set("mutedtrumpet", 59);
            _values.set("frenchhorn", 60);
            _values.set("brasssection", 61);
            _values.set("synthbrass1", 62);
            _values.set("synthbrass2", 63);
            _values.set("sopranosax", 64);
            _values.set("altosax", 65);
            _values.set("tenorsax", 66);
            _values.set("baritonesax", 67);
            _values.set("oboe", 68);
            _values.set("englishhorn", 69);
            _values.set("bassoon", 70);
            _values.set("clarinet", 71);
            _values.set("piccolo", 72);
            _values.set("flute", 73);
            _values.set("recorder", 74);
            _values.set("panflute", 75);
            _values.set("blownbottle", 76);
            _values.set("shakuhachi", 77);
            _values.set("whistle", 78);
            _values.set("ocarina", 79);
            _values.set("lead1square", 80);
            _values.set("lead2sawtooth", 81);
            _values.set("lead3calliope", 82);
            _values.set("lead4chiff", 83);
            _values.set("lead5charang", 84);
            _values.set("lead6voice", 85);
            _values.set("lead7fifths", 86);
            _values.set("lead8bassandlead", 87);
            _values.set("pad1newage", 88);
            _values.set("pad2warm", 89);
            _values.set("pad3polysynth", 90);
            _values.set("pad4choir", 91);
            _values.set("pad5bowed", 92);
            _values.set("pad6metallic", 93);
            _values.set("pad7halo", 94);
            _values.set("pad8sweep", 95);
            _values.set("fx1rain", 96);
            _values.set("fx2soundtrack", 97);
            _values.set("fx3crystal", 98);
            _values.set("fx4atmosphere", 99);
            _values.set("fx5brightness", 100);
            _values.set("fx6goblins", 101);
            _values.set("fx7echoes", 102);
            _values.set("fx8scifi", 103);
            _values.set("sitar", 104);
            _values.set("banjo", 105);
            _values.set("shamisen", 106);
            _values.set("koto", 107);
            _values.set("kalimba", 108);
            _values.set("bagpipe", 109);
            _values.set("fiddle", 110);
            _values.set("shanai", 111);
            _values.set("tinklebell", 112);
            _values.set("agogo", 113);
            _values.set("steeldrums", 114);
            _values.set("woodblock", 115);
            _values.set("taikodrum", 116);
            _values.set("melodictom", 117);
            _values.set("synthdrum", 118);
            _values.set("reversecymbal", 119);
            _values.set("guitarfretnoise", 120);
            _values.set("breathnoise", 121);
            _values.set("seashore", 122);
            _values.set("birdtweet", 123);
            _values.set("telephonering", 124);
            _values.set("helicopter", 125);
            _values.set("applause", 126);
            _values.set("gunshot", 127);
        }
        name = StringTools.replace(name.toLowerCase(), " ", "");
        return _values.exists(name) ? _values.get(name) : 0; 
    }   
}