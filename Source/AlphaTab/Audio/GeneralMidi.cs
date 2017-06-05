/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using AlphaTab.Collections;

namespace AlphaTab.Audio
{
    /// <summary>
    /// This public class provides names for all general midi instruments.
    /// </summary>
    public class GeneralMidi
    {
        private static FastDictionary<string, int> _values;

        public static int GetValue(string name)
        {
            if (_values == null)
            {
                _values = new FastDictionary<string, int>();
                _values["acousticgrandpiano"] = 0;
                _values["brightacousticpiano"] = 1;
                _values["electricgrandpiano"] = 2;
                _values["honkytonkpiano"] = 3;
                _values["electricpiano1"] = 4;
                _values["electricpiano2"] = 5;
                _values["harpsichord"] = 6;
                _values["clavinet"] = 7;
                _values["celesta"] = 8;
                _values["glockenspiel"] = 9;
                _values["musicbox"] = 10;
                _values["vibraphone"] = 11;
                _values["marimba"] = 12;
                _values["xylophone"] = 13;
                _values["tubularbells"] = 14;
                _values["dulcimer"] = 15;
                _values["drawbarorgan"] = 16;
                _values["percussiveorgan"] = 17;
                _values["rockorgan"] = 18;
                _values["churchorgan"] = 19;
                _values["reedorgan"] = 20;
                _values["accordion"] = 21;
                _values["harmonica"] = 22;
                _values["tangoaccordion"] = 23;
                _values["acousticguitarnylon"] = 24;
                _values["acousticguitarsteel"] = 25;
                _values["electricguitarjazz"] = 26;
                _values["electricguitarclean"] = 27;
                _values["electricguitarmuted"] = 28;
                _values["overdrivenguitar"] = 29;
                _values["distortionguitar"] = 30;
                _values["guitarharmonics"] = 31;
                _values["acousticbass"] = 32;
                _values["electricbassfinger"] = 33;
                _values["electricbasspick"] = 34;
                _values["fretlessbass"] = 35;
                _values["slapbass1"] = 36;
                _values["slapbass2"] = 37;
                _values["synthbass1"] = 38;
                _values["synthbass2"] = 39;
                _values["violin"] = 40;
                _values["viola"] = 41;
                _values["cello"] = 42;
                _values["contrabass"] = 43;
                _values["tremolostrings"] = 44;
                _values["pizzicatostrings"] = 45;
                _values["orchestralharp"] = 46;
                _values["timpani"] = 47;
                _values["stringensemble1"] = 48;
                _values["stringensemble2"] = 49;
                _values["synthstrings1"] = 50;
                _values["synthstrings2"] = 51;
                _values["choiraahs"] = 52;
                _values["voiceoohs"] = 53;
                _values["synthvoice"] = 54;
                _values["orchestrahit"] = 55;
                _values["trumpet"] = 56;
                _values["trombone"] = 57;
                _values["tuba"] = 58;
                _values["mutedtrumpet"] = 59;
                _values["frenchhorn"] = 60;
                _values["brasssection"] = 61;
                _values["synthbrass1"] = 62;
                _values["synthbrass2"] = 63;
                _values["sopranosax"] = 64;
                _values["altosax"] = 65;
                _values["tenorsax"] = 66;
                _values["baritonesax"] = 67;
                _values["oboe"] = 68;
                _values["englishhorn"] = 69;
                _values["bassoon"] = 70;
                _values["clarinet"] = 71;
                _values["piccolo"] = 72;
                _values["flute"] = 73;
                _values["recorder"] = 74;
                _values["panflute"] = 75;
                _values["blownbottle"] = 76;
                _values["shakuhachi"] = 77;
                _values["whistle"] = 78;
                _values["ocarina"] = 79;
                _values["lead1square"] = 80;
                _values["lead2sawtooth"] = 81;
                _values["lead3calliope"] = 82;
                _values["lead4chiff"] = 83;
                _values["lead5charang"] = 84;
                _values["lead6voice"] = 85;
                _values["lead7fifths"] = 86;
                _values["lead8bassandlead"] = 87;
                _values["pad1newage"] = 88;
                _values["pad2warm"] = 89;
                _values["pad3polysynth"] = 90;
                _values["pad4choir"] = 91;
                _values["pad5bowed"] = 92;
                _values["pad6metallic"] = 93;
                _values["pad7halo"] = 94;
                _values["pad8sweep"] = 95;
                _values["fx1rain"] = 96;
                _values["fx2soundtrack"] = 97;
                _values["fx3crystal"] = 98;
                _values["fx4atmosphere"] = 99;
                _values["fx5brightness"] = 100;
                _values["fx6goblins"] = 101;
                _values["fx7echoes"] = 102;
                _values["fx8scifi"] = 103;
                _values["sitar"] = 104;
                _values["banjo"] = 105;
                _values["shamisen"] = 106;
                _values["koto"] = 107;
                _values["kalimba"] = 108;
                _values["bagpipe"] = 109;
                _values["fiddle"] = 110;
                _values["shanai"] = 111;
                _values["tinklebell"] = 112;
                _values["agogo"] = 113;
                _values["steeldrums"] = 114;
                _values["woodblock"] = 115;
                _values["taikodrum"] = 116;
                _values["melodictom"] = 117;
                _values["synthdrum"] = 118;
                _values["reversecymbal"] = 119;
                _values["guitarfretnoise"] = 120;
                _values["breathnoise"] = 121;
                _values["seashore"] = 122;
                _values["birdtweet"] = 123;
                _values["telephonering"] = 124;
                _values["helicopter"] = 125;
                _values["applause"] = 126;
                _values["gunshot"] = 127;
            }
            name = name.ToLower().Replace(" ", "");
            return _values.ContainsKey(name) ? _values[name] : 0;
        }

        public static bool IsPiano(int program)
        {
            return program <= 7 || (program >= 16 && program <= 23);
        }

        public static bool IsGuitar(int program)
        {
            return (program >= 24 && program <= 39) || program == 105 || program == 43;
        }
    }
}
