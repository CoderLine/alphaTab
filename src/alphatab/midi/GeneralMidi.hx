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
package alphatab.midi;

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
            _values.set("AcousticGrandPiano", 0);
            _values.set("BrightAcousticPiano", 1);
            _values.set("ElectricGrandPiano", 2);
            _values.set("HonkyTonkPiano", 3);
            _values.set("ElectricPiano1", 4);
            _values.set("ElectricPiano2", 5);
            _values.set("Harpsichord", 6);
            _values.set("Clavinet", 7);
            _values.set("Celesta", 8);
            _values.set("Glockenspiel", 9);
            _values.set("MusicBox", 10);
            _values.set("Vibraphone", 11);
            _values.set("Marimba", 12);
            _values.set("Xylophone", 13);
            _values.set("TubularBells", 14);
            _values.set("Dulcimer", 15);
            _values.set("DrawbarOrgan", 16);
            _values.set("PercussiveOrgan", 17);
            _values.set("RockOrgan", 18);
            _values.set("ChurchOrgan", 19);
            _values.set("ReedOrgan", 20);
            _values.set("Accordion", 21);
            _values.set("Harmonica", 22);
            _values.set("TangoAccordion", 23);
            _values.set("AcousticGuitarNylon", 24);
            _values.set("AcousticGuitarSteel", 25);
            _values.set("ElectricGuitarJazz", 26);
            _values.set("ElectricGuitarClean", 27);
            _values.set("ElectricGuitarMuted", 28);
            _values.set("OverdrivenGuitar", 29);
            _values.set("DistortionGuitar", 30);
            _values.set("GuitarHarmonics", 31);
            _values.set("AcousticBass", 32);
            _values.set("ElectricBassFinger", 33);
            _values.set("ElectricBassPick", 34);
            _values.set("FretlessBass", 35);
            _values.set("SlapBass1", 36);
            _values.set("SlapBass2", 37);
            _values.set("SynthBass1", 38);
            _values.set("SynthBass2", 39);
            _values.set("Violin", 40);
            _values.set("Viola", 41);
            _values.set("Cello", 42);
            _values.set("Contrabass", 43);
            _values.set("TremoloStrings", 44);
            _values.set("PizzicatoStrings", 45);
            _values.set("OrchestralHarp", 46);
            _values.set("Timpani", 47);
            _values.set("StringEnsemble1", 48);
            _values.set("StringEnsemble2", 49);
            _values.set("SynthStrings1", 50);
            _values.set("SynthStrings2", 51);
            _values.set("ChoirAahs", 52);
            _values.set("VoiceOohs", 53);
            _values.set("SynthVoice", 54);
            _values.set("OrchestraHit", 55);
            _values.set("Trumpet", 56);
            _values.set("Trombone", 57);
            _values.set("Tuba", 58);
            _values.set("MutedTrumpet", 59);
            _values.set("FrenchHorn", 60);
            _values.set("BrassSection", 61);
            _values.set("SynthBrass1", 62);
            _values.set("SynthBrass2", 63);
            _values.set("SopranoSax", 64);
            _values.set("AltoSax", 65);
            _values.set("TenorSax", 66);
            _values.set("BaritoneSax", 67);
            _values.set("Oboe", 68);
            _values.set("EnglishHorn", 69);
            _values.set("Bassoon", 70);
            _values.set("Clarinet", 71);
            _values.set("Piccolo", 72);
            _values.set("Flute", 73);
            _values.set("Recorder", 74);
            _values.set("PanFlute", 75);
            _values.set("BlownBottle", 76);
            _values.set("Shakuhachi", 77);
            _values.set("Whistle", 78);
            _values.set("Ocarina", 79);
            _values.set("Lead1Square", 80);
            _values.set("Lead2Sawtooth", 81);
            _values.set("Lead3Calliope", 82);
            _values.set("Lead4Chiff", 83);
            _values.set("Lead5Charang", 84);
            _values.set("Lead6Voice", 85);
            _values.set("Lead7Fifths", 86);
            _values.set("Lead8BassAndLead", 87);
            _values.set("Pad1NewAge", 88);
            _values.set("Pad2Warm", 89);
            _values.set("Pad3Polysynth", 90);
            _values.set("Pad4Choir", 91);
            _values.set("Pad5Bowed", 92);
            _values.set("Pad6Metallic", 93);
            _values.set("Pad7Halo", 94);
            _values.set("Pad8Sweep", 95);
            _values.set("Fx1Rain", 96);
            _values.set("Fx2Soundtrack", 97);
            _values.set("Fx3Crystal", 98);
            _values.set("Fx4Atmosphere", 99);
            _values.set("Fx5Brightness", 100);
            _values.set("Fx6Goblins", 101);
            _values.set("Fx7Echoes", 102);
            _values.set("Fx8SciFi", 103);
            _values.set("Sitar", 104);
            _values.set("Banjo", 105);
            _values.set("Shamisen", 106);
            _values.set("Koto", 107);
            _values.set("Kalimba", 108);
            _values.set("BagPipe", 109);
            _values.set("Fiddle", 110);
            _values.set("Shanai", 111);
            _values.set("TinkleBell", 112);
            _values.set("Agogo", 113);
            _values.set("SteelDrums", 114);
            _values.set("Woodblock", 115);
            _values.set("TaikoDrum", 116);
            _values.set("MelodicTom", 117);
            _values.set("SynthDrum", 118);
            _values.set("ReverseCymbal", 119);
            _values.set("GuitarFretNoise", 120);
            _values.set("BreathNoise", 121);
            _values.set("Seashore", 122);
            _values.set("BirdTweet", 123);
            _values.set("TelephoneRing", 124);
            _values.set("Helicopter", 125);
            _values.set("Applause", 126);
            _values.set("Gunshot", 127);
        }
        return _values.exists(name) ? _values.get(name) : 0; 
    }   
	
}