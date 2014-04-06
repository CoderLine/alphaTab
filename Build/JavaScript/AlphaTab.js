(function() {
	'use strict';
	var $asm = {};
	global.AlphaTab = global.AlphaTab || {};
	global.AlphaTab.Audio = global.AlphaTab.Audio || {};
	global.AlphaTab.Audio.Generator = global.AlphaTab.Audio.Generator || {};
	global.AlphaTab.Audio.Model = global.AlphaTab.Audio.Model || {};
	global.AlphaTab.Importer = global.AlphaTab.Importer || {};
	global.AlphaTab.IO = global.AlphaTab.IO || {};
	global.AlphaTab.Model = global.AlphaTab.Model || {};
	global.AlphaTab.Platform = global.AlphaTab.Platform || {};
	global.AlphaTab.Platform.JavaScript = global.AlphaTab.Platform.JavaScript || {};
	global.AlphaTab.Platform.Model = global.AlphaTab.Platform.Model || {};
	global.AlphaTab.Platform.Svg = global.AlphaTab.Platform.Svg || {};
	global.AlphaTab.Rendering = global.AlphaTab.Rendering || {};
	global.AlphaTab.Rendering.Effects = global.AlphaTab.Rendering.Effects || {};
	global.AlphaTab.Rendering.Glyphs = global.AlphaTab.Rendering.Glyphs || {};
	global.AlphaTab.Rendering.Layout = global.AlphaTab.Rendering.Layout || {};
	global.AlphaTab.Rendering.Staves = global.AlphaTab.Rendering.Staves || {};
	global.AlphaTab.Rendering.Utils = global.AlphaTab.Rendering.Utils || {};
	ss.initAssembly($asm, 'Attributes');
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Environment
	var $AlphaTab_Environment = function() {
	};
	$AlphaTab_Environment.__typeName = 'AlphaTab.Environment';
	global.AlphaTab.Environment = $AlphaTab_Environment;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.LayoutSettings
	var $AlphaTab_LayoutSettings = function() {
		this.$1$ModeField = null;
		this.additionalSettings = null;
		this.additionalSettings = new (ss.makeGenericType(ss.Dictionary$2, [String, Object]))();
	};
	$AlphaTab_LayoutSettings.__typeName = 'AlphaTab.LayoutSettings';
	$AlphaTab_LayoutSettings.get_defaults = function() {
		var settings = new $AlphaTab_LayoutSettings();
		settings.set_mode('page');
		return settings;
	};
	global.AlphaTab.LayoutSettings = $AlphaTab_LayoutSettings;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Settings
	var $AlphaTab_Settings = function() {
		this.$1$ScaleField = 0;
		this.$1$WidthField = 0;
		this.$1$HeightField = 0;
		this.$1$EngineField = null;
		this.$1$LayoutField = null;
		this.$1$StavesField = null;
	};
	$AlphaTab_Settings.__typeName = 'AlphaTab.Settings';
	$AlphaTab_Settings.get_defaults = function() {
		var settings = new $AlphaTab_Settings();
		settings.set_scale(1);
		settings.set_width(600);
		settings.set_height(200);
		settings.set_engine('default');
		settings.set_layout($AlphaTab_LayoutSettings.get_defaults());
		settings.set_staves([]);
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('marker'));
		//settings.staves.Add(new StaveSettings("triplet-feel"));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('tempo'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('text'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('chords'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('trill'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('beat-vibrato'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('note-vibrato'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('alternate-endings'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('score'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('crescendo'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('dynamics'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('trill'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('beat-vibrato'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('note-vibrato'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('tap'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('fade-in'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('let-ring'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('palm-mute'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('tab'));
		ss.add(settings.get_staves(), new $AlphaTab_StaveSettings('pick-stroke'));
		//settings.staves.Add(new StaveSettings("fingering"));
		return settings;
	};
	$AlphaTab_Settings.$jsonKeys = function(json) {
		return Object.keys(json);
	};
	$AlphaTab_Settings.fromJson = function(json) {
		if (ss.isInstanceOfType(json, $AlphaTab_Settings)) {
			return json;
		}
		var settings = $AlphaTab_Settings.get_defaults();
		if (!json) {
			return settings;
		}
		if (ss.unbox('scale' in json)) {
			settings.set_scale(ss.unbox(json.scale));
		}
		if (ss.unbox('width' in json)) {
			settings.set_width(ss.unbox(json.width));
		}
		if (ss.unbox('height' in json)) {
			settings.set_height(ss.unbox(json.height));
		}
		if (ss.unbox('engine' in json)) {
			settings.set_engine(json.engine);
		}
		if (ss.unbox('layout' in json)) {
			if (ss.isInstanceOfType(json.layout, String)) {
				settings.get_layout().set_mode(json.layout);
			}
			else {
				if (ss.unbox(json.layout.mode)) {
					settings.get_layout().set_mode(json.layout.mode);
				}
				if (ss.unbox(json.layout.additionalSettings)) {
					var keys = $AlphaTab_Settings.$jsonKeys(json.layout.additionalSettings);
					for (var $t1 = 0; $t1 < keys.length; $t1++) {
						var key = keys[$t1];
						settings.get_layout().additionalSettings.set_item(key, json.layout.additionalSettings[key]);
					}
				}
			}
		}
		if (ss.unbox('staves' in json)) {
			settings.set_staves([]);
			var keys1 = $AlphaTab_Settings.$jsonKeys(json.staves);
			for (var $t2 = 0; $t2 < keys1.length; $t2++) {
				var key1 = keys1[$t2];
				var val = json.staves[key1];
				if (ss.isInstanceOfType(val, String)) {
					ss.add(settings.get_staves(), new $AlphaTab_StaveSettings(val));
				}
				else if (ss.unbox(val.id)) {
					var staveSettings = new $AlphaTab_StaveSettings(val.id);
					if (ss.unbox(val.additionalSettings)) {
						var keys2 = $AlphaTab_Settings.$jsonKeys(val.additionalSettings);
						for (var $t3 = 0; $t3 < keys2.length; $t3++) {
							var key2 = keys2[$t3];
							staveSettings.additionalSettings.set_item(key2, val.additionalSettings[key2]);
						}
					}
				}
			}
		}
		return settings;
	};
	global.AlphaTab.Settings = $AlphaTab_Settings;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.StaveSettings
	var $AlphaTab_StaveSettings = function(id) {
		this.id = null;
		this.additionalSettings = null;
		this.id = id;
		this.additionalSettings = new (ss.makeGenericType(ss.Dictionary$2, [String, Object]))();
	};
	$AlphaTab_StaveSettings.__typeName = 'AlphaTab.StaveSettings';
	global.AlphaTab.StaveSettings = $AlphaTab_StaveSettings;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.GeneralMidi
	var $AlphaTab_Audio_GeneralMidi = function() {
	};
	$AlphaTab_Audio_GeneralMidi.__typeName = 'AlphaTab.Audio.GeneralMidi';
	$AlphaTab_Audio_GeneralMidi.getValue = function(name) {
		if (ss.isNullOrUndefined($AlphaTab_Audio_GeneralMidi.$_values)) {
			$AlphaTab_Audio_GeneralMidi.$_values = new (ss.makeGenericType(ss.Dictionary$2, [String, ss.Int32]))();
			$AlphaTab_Audio_GeneralMidi.$_values.add('acousticgrandpiano', 0);
			$AlphaTab_Audio_GeneralMidi.$_values.add('brightacousticpiano', 1);
			$AlphaTab_Audio_GeneralMidi.$_values.add('electricgrandpiano', 2);
			$AlphaTab_Audio_GeneralMidi.$_values.add('honkytonkpiano', 3);
			$AlphaTab_Audio_GeneralMidi.$_values.add('electricpiano1', 4);
			$AlphaTab_Audio_GeneralMidi.$_values.add('electricpiano2', 5);
			$AlphaTab_Audio_GeneralMidi.$_values.add('harpsichord', 6);
			$AlphaTab_Audio_GeneralMidi.$_values.add('clavinet', 7);
			$AlphaTab_Audio_GeneralMidi.$_values.add('celesta', 8);
			$AlphaTab_Audio_GeneralMidi.$_values.add('glockenspiel', 9);
			$AlphaTab_Audio_GeneralMidi.$_values.add('musicbox', 10);
			$AlphaTab_Audio_GeneralMidi.$_values.add('vibraphone', 11);
			$AlphaTab_Audio_GeneralMidi.$_values.add('marimba', 12);
			$AlphaTab_Audio_GeneralMidi.$_values.add('xylophone', 13);
			$AlphaTab_Audio_GeneralMidi.$_values.add('tubularbells', 14);
			$AlphaTab_Audio_GeneralMidi.$_values.add('dulcimer', 15);
			$AlphaTab_Audio_GeneralMidi.$_values.add('drawbarorgan', 16);
			$AlphaTab_Audio_GeneralMidi.$_values.add('percussiveorgan', 17);
			$AlphaTab_Audio_GeneralMidi.$_values.add('rockorgan', 18);
			$AlphaTab_Audio_GeneralMidi.$_values.add('churchorgan', 19);
			$AlphaTab_Audio_GeneralMidi.$_values.add('reedorgan', 20);
			$AlphaTab_Audio_GeneralMidi.$_values.add('accordion', 21);
			$AlphaTab_Audio_GeneralMidi.$_values.add('harmonica', 22);
			$AlphaTab_Audio_GeneralMidi.$_values.add('tangoaccordion', 23);
			$AlphaTab_Audio_GeneralMidi.$_values.add('acousticguitarnylon', 24);
			$AlphaTab_Audio_GeneralMidi.$_values.add('acousticguitarsteel', 25);
			$AlphaTab_Audio_GeneralMidi.$_values.add('electricguitarjazz', 26);
			$AlphaTab_Audio_GeneralMidi.$_values.add('electricguitarclean', 27);
			$AlphaTab_Audio_GeneralMidi.$_values.add('electricguitarmuted', 28);
			$AlphaTab_Audio_GeneralMidi.$_values.add('overdrivenguitar', 29);
			$AlphaTab_Audio_GeneralMidi.$_values.add('distortionguitar', 30);
			$AlphaTab_Audio_GeneralMidi.$_values.add('guitarharmonics', 31);
			$AlphaTab_Audio_GeneralMidi.$_values.add('acousticbass', 32);
			$AlphaTab_Audio_GeneralMidi.$_values.add('electricbassfinger', 33);
			$AlphaTab_Audio_GeneralMidi.$_values.add('electricbasspick', 34);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fretlessbass', 35);
			$AlphaTab_Audio_GeneralMidi.$_values.add('slapbass1', 36);
			$AlphaTab_Audio_GeneralMidi.$_values.add('slapbass2', 37);
			$AlphaTab_Audio_GeneralMidi.$_values.add('synthbass1', 38);
			$AlphaTab_Audio_GeneralMidi.$_values.add('synthbass2', 39);
			$AlphaTab_Audio_GeneralMidi.$_values.add('violin', 40);
			$AlphaTab_Audio_GeneralMidi.$_values.add('viola', 41);
			$AlphaTab_Audio_GeneralMidi.$_values.add('cello', 42);
			$AlphaTab_Audio_GeneralMidi.$_values.add('contrabass', 43);
			$AlphaTab_Audio_GeneralMidi.$_values.add('tremolostrings', 44);
			$AlphaTab_Audio_GeneralMidi.$_values.add('pizzicatostrings', 45);
			$AlphaTab_Audio_GeneralMidi.$_values.add('orchestralharp', 46);
			$AlphaTab_Audio_GeneralMidi.$_values.add('timpani', 47);
			$AlphaTab_Audio_GeneralMidi.$_values.add('stringensemble1', 48);
			$AlphaTab_Audio_GeneralMidi.$_values.add('stringensemble2', 49);
			$AlphaTab_Audio_GeneralMidi.$_values.add('synthstrings1', 50);
			$AlphaTab_Audio_GeneralMidi.$_values.add('synthstrings2', 51);
			$AlphaTab_Audio_GeneralMidi.$_values.add('choiraahs', 52);
			$AlphaTab_Audio_GeneralMidi.$_values.add('voiceoohs', 53);
			$AlphaTab_Audio_GeneralMidi.$_values.add('synthvoice', 54);
			$AlphaTab_Audio_GeneralMidi.$_values.add('orchestrahit', 55);
			$AlphaTab_Audio_GeneralMidi.$_values.add('trumpet', 56);
			$AlphaTab_Audio_GeneralMidi.$_values.add('trombone', 57);
			$AlphaTab_Audio_GeneralMidi.$_values.add('tuba', 58);
			$AlphaTab_Audio_GeneralMidi.$_values.add('mutedtrumpet', 59);
			$AlphaTab_Audio_GeneralMidi.$_values.add('frenchhorn', 60);
			$AlphaTab_Audio_GeneralMidi.$_values.add('brasssection', 61);
			$AlphaTab_Audio_GeneralMidi.$_values.add('synthbrass1', 62);
			$AlphaTab_Audio_GeneralMidi.$_values.add('synthbrass2', 63);
			$AlphaTab_Audio_GeneralMidi.$_values.add('sopranosax', 64);
			$AlphaTab_Audio_GeneralMidi.$_values.add('altosax', 65);
			$AlphaTab_Audio_GeneralMidi.$_values.add('tenorsax', 66);
			$AlphaTab_Audio_GeneralMidi.$_values.add('baritonesax', 67);
			$AlphaTab_Audio_GeneralMidi.$_values.add('oboe', 68);
			$AlphaTab_Audio_GeneralMidi.$_values.add('englishhorn', 69);
			$AlphaTab_Audio_GeneralMidi.$_values.add('bassoon', 70);
			$AlphaTab_Audio_GeneralMidi.$_values.add('clarinet', 71);
			$AlphaTab_Audio_GeneralMidi.$_values.add('piccolo', 72);
			$AlphaTab_Audio_GeneralMidi.$_values.add('flute', 73);
			$AlphaTab_Audio_GeneralMidi.$_values.add('recorder', 74);
			$AlphaTab_Audio_GeneralMidi.$_values.add('panflute', 75);
			$AlphaTab_Audio_GeneralMidi.$_values.add('blownbottle', 76);
			$AlphaTab_Audio_GeneralMidi.$_values.add('shakuhachi', 77);
			$AlphaTab_Audio_GeneralMidi.$_values.add('whistle', 78);
			$AlphaTab_Audio_GeneralMidi.$_values.add('ocarina', 79);
			$AlphaTab_Audio_GeneralMidi.$_values.add('lead1square', 80);
			$AlphaTab_Audio_GeneralMidi.$_values.add('lead2sawtooth', 81);
			$AlphaTab_Audio_GeneralMidi.$_values.add('lead3calliope', 82);
			$AlphaTab_Audio_GeneralMidi.$_values.add('lead4chiff', 83);
			$AlphaTab_Audio_GeneralMidi.$_values.add('lead5charang', 84);
			$AlphaTab_Audio_GeneralMidi.$_values.add('lead6voice', 85);
			$AlphaTab_Audio_GeneralMidi.$_values.add('lead7fifths', 86);
			$AlphaTab_Audio_GeneralMidi.$_values.add('lead8bassandlead', 87);
			$AlphaTab_Audio_GeneralMidi.$_values.add('pad1newage', 88);
			$AlphaTab_Audio_GeneralMidi.$_values.add('pad2warm', 89);
			$AlphaTab_Audio_GeneralMidi.$_values.add('pad3polysynth', 90);
			$AlphaTab_Audio_GeneralMidi.$_values.add('pad4choir', 91);
			$AlphaTab_Audio_GeneralMidi.$_values.add('pad5bowed', 92);
			$AlphaTab_Audio_GeneralMidi.$_values.add('pad6metallic', 93);
			$AlphaTab_Audio_GeneralMidi.$_values.add('pad7halo', 94);
			$AlphaTab_Audio_GeneralMidi.$_values.add('pad8sweep', 95);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fx1rain', 96);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fx2soundtrack', 97);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fx3crystal', 98);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fx4atmosphere', 99);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fx5brightness', 100);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fx6goblins', 101);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fx7echoes', 102);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fx8scifi', 103);
			$AlphaTab_Audio_GeneralMidi.$_values.add('sitar', 104);
			$AlphaTab_Audio_GeneralMidi.$_values.add('banjo', 105);
			$AlphaTab_Audio_GeneralMidi.$_values.add('shamisen', 106);
			$AlphaTab_Audio_GeneralMidi.$_values.add('koto', 107);
			$AlphaTab_Audio_GeneralMidi.$_values.add('kalimba', 108);
			$AlphaTab_Audio_GeneralMidi.$_values.add('bagpipe', 109);
			$AlphaTab_Audio_GeneralMidi.$_values.add('fiddle', 110);
			$AlphaTab_Audio_GeneralMidi.$_values.add('shanai', 111);
			$AlphaTab_Audio_GeneralMidi.$_values.add('tinklebell', 112);
			$AlphaTab_Audio_GeneralMidi.$_values.add('agogo', 113);
			$AlphaTab_Audio_GeneralMidi.$_values.add('steeldrums', 114);
			$AlphaTab_Audio_GeneralMidi.$_values.add('woodblock', 115);
			$AlphaTab_Audio_GeneralMidi.$_values.add('taikodrum', 116);
			$AlphaTab_Audio_GeneralMidi.$_values.add('melodictom', 117);
			$AlphaTab_Audio_GeneralMidi.$_values.add('synthdrum', 118);
			$AlphaTab_Audio_GeneralMidi.$_values.add('reversecymbal', 119);
			$AlphaTab_Audio_GeneralMidi.$_values.add('guitarfretnoise', 120);
			$AlphaTab_Audio_GeneralMidi.$_values.add('breathnoise', 121);
			$AlphaTab_Audio_GeneralMidi.$_values.add('seashore', 122);
			$AlphaTab_Audio_GeneralMidi.$_values.add('birdtweet', 123);
			$AlphaTab_Audio_GeneralMidi.$_values.add('telephonering', 124);
			$AlphaTab_Audio_GeneralMidi.$_values.add('helicopter', 125);
			$AlphaTab_Audio_GeneralMidi.$_values.add('applause', 126);
			$AlphaTab_Audio_GeneralMidi.$_values.add('gunshot', 127);
		}
		name = ss.replaceAllString(name.toLowerCase(), ' ', '');
		return ($AlphaTab_Audio_GeneralMidi.$_values.containsKey(name) ? $AlphaTab_Audio_GeneralMidi.$_values.get_item(name) : 0);
	};
	global.AlphaTab.Audio.GeneralMidi = $AlphaTab_Audio_GeneralMidi;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.MidiUtils
	var $AlphaTab_Audio_MidiUtils = function() {
	};
	$AlphaTab_Audio_MidiUtils.__typeName = 'AlphaTab.Audio.MidiUtils';
	$AlphaTab_Audio_MidiUtils.toTicks = function(duration) {
		return $AlphaTab_Audio_MidiUtils.valueToTicks(duration);
	};
	$AlphaTab_Audio_MidiUtils.valueToTicks = function(duration) {
		return ss.Int32.trunc(960 * (4 / duration));
	};
	$AlphaTab_Audio_MidiUtils.applyDot = function(ticks, doubleDotted) {
		if (doubleDotted) {
			return ticks + ss.Int32.div(ticks, 4) * 3;
		}
		return ticks + ss.Int32.div(ticks, 2);
	};
	$AlphaTab_Audio_MidiUtils.applyTuplet = function(ticks, numerator, denominator) {
		return ss.Int32.div(ticks * denominator, numerator);
	};
	$AlphaTab_Audio_MidiUtils.dynamicToVelocity = function(dyn) {
		return $AlphaTab_Audio_MidiUtils.$minVelocity + dyn * $AlphaTab_Audio_MidiUtils.$velocityIncrement;
		// switch(dynamicValue)
		// {
		//     case PPP:   return (MinVelocity + (0 * VelocityIncrement));
		//     case PP:    return (MinVelocity + (1 * VelocityIncrement));
		//     case P:     return (MinVelocity + (2 * VelocityIncrement));
		//     case MP:    return (MinVelocity + (3 * VelocityIncrement));
		//     case MF:    return (MinVelocity + (4 * VelocityIncrement));
		//     case F:     return (MinVelocity + (5 * VelocityIncrement));
		//     case FF:    return (MinVelocity + (6 * VelocityIncrement));
		//     case FFF:   return (MinVelocity + (7 * VelocityIncrement));
		// }
	};
	$AlphaTab_Audio_MidiUtils.buildTickLookup = function(score) {
		var lookup = new $AlphaTab_Audio_Model_MidiTickLookup();
		var controller = new $AlphaTab_Audio_Generator_MidiPlaybackController(score);
		while (!controller.get_finished()) {
			var index = controller.get_index();
			controller.process();
			if (controller.get_shouldPlay()) {
				var bar = new $AlphaTab_Audio_Model_BarTickLookup();
				bar.set_bar(score.get_masterBars()[index]);
				bar.set_start(controller.get_repeatMove() + bar.get_bar().get_start());
				bar.set_end(bar.get_start() + bar.get_bar().calculateDuration());
				ss.add(lookup.get_bars(), bar);
			}
		}
		return lookup;
	};
	global.AlphaTab.Audio.MidiUtils = $AlphaTab_Audio_MidiUtils;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Generator.IMidiFileHandler
	var $AlphaTab_Audio_Generator_IMidiFileHandler = function() {
	};
	$AlphaTab_Audio_Generator_IMidiFileHandler.__typeName = 'AlphaTab.Audio.Generator.IMidiFileHandler';
	global.AlphaTab.Audio.Generator.IMidiFileHandler = $AlphaTab_Audio_Generator_IMidiFileHandler;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Generator.MidiFileGenerator
	var $AlphaTab_Audio_Generator_MidiFileGenerator = function(score, handler, generateMetronome) {
		this.$_score = null;
		this.$_handler = null;
		this.$_currentTempo = 0;
		this.$1$GenerateMetronomeField = false;
		this.$_score = score;
		this.$_currentTempo = this.$_score.get_tempo();
		this.$_handler = handler;
		this.set_generateMetronome(generateMetronome);
	};
	$AlphaTab_Audio_Generator_MidiFileGenerator.__typeName = 'AlphaTab.Audio.Generator.MidiFileGenerator';
	$AlphaTab_Audio_Generator_MidiFileGenerator.generateMidiFile = function(score, generateMetronome) {
		var midiFile = new $AlphaTab_Audio_Model_MidiFile();
		// create score tracks + metronometrack
		for (var i = 0; i < score.get_tracks().length; i++) {
			midiFile.createTrack();
		}
		midiFile.set_infoTrack(0);
		var handler = new $AlphaTab_Audio_Generator_MidiFileHandler(midiFile);
		var generator = new $AlphaTab_Audio_Generator_MidiFileGenerator(score, handler, generateMetronome);
		generator.generate();
		return midiFile;
	};
	$AlphaTab_Audio_Generator_MidiFileGenerator.$toChannelShort = function(data) {
		var value = Math.max(-32768, Math.min(32767, data * 8 - 1));
		return Math.max(value, -1) + 1;
	};
	global.AlphaTab.Audio.Generator.MidiFileGenerator = $AlphaTab_Audio_Generator_MidiFileGenerator;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Generator.MidiFileHandler
	var $AlphaTab_Audio_Generator_MidiFileHandler = function(midiFile) {
		this.$_midiFile = null;
		this.$_metronomeTrack = 0;
		this.$_midiFile = midiFile;
		this.$_metronomeTrack = -1;
	};
	$AlphaTab_Audio_Generator_MidiFileHandler.__typeName = 'AlphaTab.Audio.Generator.MidiFileHandler';
	$AlphaTab_Audio_Generator_MidiFileHandler.$fixValue = function(value) {
		if (value > 127) {
			return 127;
		}
		return value;
	};
	$AlphaTab_Audio_Generator_MidiFileHandler.$buildMetaMessage = function(metaType, data) {
		var meta = [];
		ss.add(meta, 255);
		ss.add(meta, metaType & 255);
		$AlphaTab_Audio_Generator_MidiFileHandler.$writeVarInt(meta, data.length);
		ss.arrayAddRange(meta, data);
		return new $AlphaTab_Audio_Model_MidiMessage(new $AlphaTab_IO_ByteArray(Array.prototype.slice.call(meta)));
	};
	$AlphaTab_Audio_Generator_MidiFileHandler.$writeVarInt = function(data, v) {
		var n = 0;
		var array = new $AlphaTab_IO_ByteArray.$ctor1(4);
		do {
			array.set_item(n++, v & 127 & 255);
			v >>= 7;
		} while (v > 0);
		while (n > 0) {
			n--;
			if (n > 0) {
				ss.add(data, (array.get_item(n) | 128) & 255);
			}
			else {
				ss.add(data, array.get_item(n));
			}
		}
	};
	$AlphaTab_Audio_Generator_MidiFileHandler.$buildSysExMessage = function(data) {
		var sysex = [];
		ss.add(sysex, 240);
		// status 
		$AlphaTab_Audio_Generator_MidiFileHandler.$writeVarInt(sysex, data.length + 2);
		// write length of data
		ss.add(sysex, 0);
		// manufacturer id
		ss.arrayAddRange(sysex, data);
		// data
		ss.add(sysex, 247);
		// end of data
		return new $AlphaTab_Audio_Model_MidiMessage(new $AlphaTab_IO_ByteArray(Array.prototype.slice.call(sysex)));
	};
	global.AlphaTab.Audio.Generator.MidiFileHandler = $AlphaTab_Audio_Generator_MidiFileHandler;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Generator.MidiPlaybackController
	var $AlphaTab_Audio_Generator_MidiPlaybackController = function(score) {
		this.$_score = null;
		this.$_lastIndex = 0;
		this.$_repeatAlternative = 0;
		this.$_repeatStart = 0;
		this.$_repeatStartIndex = 0;
		this.$_repeatNumber = 0;
		this.$_repeatEnd = 0;
		this.$_repeatOpen = false;
		this.$1$ShouldPlayField = false;
		this.$1$RepeatMoveField = 0;
		this.$1$IndexField = 0;
		this.$_score = score;
		this.set_shouldPlay(true);
	};
	$AlphaTab_Audio_Generator_MidiPlaybackController.__typeName = 'AlphaTab.Audio.Generator.MidiPlaybackController';
	global.AlphaTab.Audio.Generator.MidiPlaybackController = $AlphaTab_Audio_Generator_MidiPlaybackController;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Model.BarTickLookup
	var $AlphaTab_Audio_Model_BarTickLookup = function() {
		this.$1$StartField = 0;
		this.$1$EndField = 0;
		this.$1$BarField = null;
	};
	$AlphaTab_Audio_Model_BarTickLookup.__typeName = 'AlphaTab.Audio.Model.BarTickLookup';
	global.AlphaTab.Audio.Model.BarTickLookup = $AlphaTab_Audio_Model_BarTickLookup;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Model.MidiController
	var $AlphaTab_Audio_Model_MidiController = function() {
	};
	$AlphaTab_Audio_Model_MidiController.__typeName = 'AlphaTab.Audio.Model.MidiController';
	global.AlphaTab.Audio.Model.MidiController = $AlphaTab_Audio_Model_MidiController;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Model.MidiEvent
	var $AlphaTab_Audio_Model_MidiEvent = function(tick, message) {
		this.$1$TrackField = null;
		this.$1$TickField = 0;
		this.$1$MessageField = null;
		this.$1$NextEventField = null;
		this.$1$PreviousEventField = null;
		this.set_tick(tick);
		this.set_message(message);
	};
	$AlphaTab_Audio_Model_MidiEvent.__typeName = 'AlphaTab.Audio.Model.MidiEvent';
	global.AlphaTab.Audio.Model.MidiEvent = $AlphaTab_Audio_Model_MidiEvent;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Model.MidiFile
	var $AlphaTab_Audio_Model_MidiFile = function() {
		this.$1$TracksField = null;
		this.$1$InfoTrackField = 0;
		this.set_tracks([]);
	};
	$AlphaTab_Audio_Model_MidiFile.__typeName = 'AlphaTab.Audio.Model.MidiFile';
	global.AlphaTab.Audio.Model.MidiFile = $AlphaTab_Audio_Model_MidiFile;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Model.MidiMessage
	var $AlphaTab_Audio_Model_MidiMessage = function(data) {
		this.$1$EventField = null;
		this.$1$DataField = null;
		this.set_data(data);
	};
	$AlphaTab_Audio_Model_MidiMessage.__typeName = 'AlphaTab.Audio.Model.MidiMessage';
	global.AlphaTab.Audio.Model.MidiMessage = $AlphaTab_Audio_Model_MidiMessage;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Model.MidiTickLookup
	var $AlphaTab_Audio_Model_MidiTickLookup = function() {
		this.$_lastBeat = null;
		this.$1$BarsField = null;
		this.set_bars([]);
	};
	$AlphaTab_Audio_Model_MidiTickLookup.__typeName = 'AlphaTab.Audio.Model.MidiTickLookup';
	global.AlphaTab.Audio.Model.MidiTickLookup = $AlphaTab_Audio_Model_MidiTickLookup;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Audio.Model.MidiTrack
	var $AlphaTab_Audio_Model_MidiTrack = function() {
		this.$1$IndexField = 0;
		this.$1$FileField = null;
		this.$1$FirstEventField = null;
		this.$1$LastEventField = null;
	};
	$AlphaTab_Audio_Model_MidiTrack.__typeName = 'AlphaTab.Audio.Model.MidiTrack';
	global.AlphaTab.Audio.Model.MidiTrack = $AlphaTab_Audio_Model_MidiTrack;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.AlphaTexException
	var $AlphaTab_Importer_AlphaTexException = function(position, nonTerm, expected, symbol, symbolData) {
		this.$2$PositionField = 0;
		this.$2$NonTermField = null;
		this.$2$ExpectedField = 0;
		this.$2$SymbolField = 0;
		this.$2$SymbolDataField = null;
		ss.Exception.call(this);
		this.set_position(position);
		this.set_nonTerm(nonTerm);
		this.set_expected(expected);
		this.set_symbol(symbol);
		this.set_symbolData(symbolData);
	};
	$AlphaTab_Importer_AlphaTexException.__typeName = 'AlphaTab.Importer.AlphaTexException';
	global.AlphaTab.Importer.AlphaTexException = $AlphaTab_Importer_AlphaTexException;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.AlphaTexImporter
	var $AlphaTab_Importer_AlphaTexImporter = function() {
		this.$_score = null;
		this.$_track = null;
		this.$_ch = 0;
		this.$_curChPos = 0;
		this.$_sy = 0;
		this.$_syData = null;
		this.$_allowNegatives = false;
		this.$_currentDuration = 0;
		$AlphaTab_Importer_ScoreImporter.call(this);
	};
	$AlphaTab_Importer_AlphaTexImporter.__typeName = 'AlphaTab.Importer.AlphaTexImporter';
	$AlphaTab_Importer_AlphaTexImporter.$isLetter = function(ch) {
		var code = ch;
		// no control characters, whitespaces, numbers or dots
		return !$AlphaTab_Importer_AlphaTexImporter.$isTerminal(ch) && (code >= 33 && code <= 47 || code >= 58 && code <= 126 || code > 128);
		// Unicode Symbols
	};
	$AlphaTab_Importer_AlphaTexImporter.$isTerminal = function(ch) {
		return ch === 46 || ch === 123 || ch === 125 || ch === 91 || ch === 93 || ch === 40 || ch === 41 || ch === 124 || ch === 39 || ch === 34 || ch === 92;
	};
	global.AlphaTab.Importer.AlphaTexImporter = $AlphaTab_Importer_AlphaTexImporter;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.AlphaTexSymbols
	var $AlphaTab_Importer_AlphaTexSymbols = function() {
	};
	$AlphaTab_Importer_AlphaTexSymbols.__typeName = 'AlphaTab.Importer.AlphaTexSymbols';
	global.AlphaTab.Importer.AlphaTexSymbols = $AlphaTab_Importer_AlphaTexSymbols;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.Gp3To5Importer
	var $AlphaTab_Importer_Gp3To5Importer = function() {
		this.$_versionNumber = 0;
		this.$_score = null;
		this.$_globalTripletFeel = 0;
		this.$_lyricsIndex = null;
		this.$_lyrics = null;
		this.$_barCount = 0;
		this.$_trackCount = 0;
		this.$_playbackInfos = null;
		$AlphaTab_Importer_ScoreImporter.call(this);
	};
	$AlphaTab_Importer_Gp3To5Importer.__typeName = 'AlphaTab.Importer.Gp3To5Importer';
	$AlphaTab_Importer_Gp3To5Importer.$toStrokeValue = function(value) {
		switch (value) {
			case 1: {
				return 30;
			}
			case 2: {
				return 30;
			}
			case 3: {
				return 60;
			}
			case 4: {
				return 120;
			}
			case 5: {
				return 240;
			}
			case 6: {
				return 480;
			}
			default: {
				return 0;
			}
		}
	};
	global.AlphaTab.Importer.Gp3To5Importer = $AlphaTab_Importer_Gp3To5Importer;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.GpxFile
	var $AlphaTab_Importer_GpxFile = function() {
		this.$1$FileNameField = null;
		this.$1$FileSizeField = 0;
		this.$1$DataField = null;
	};
	$AlphaTab_Importer_GpxFile.__typeName = 'AlphaTab.Importer.GpxFile';
	global.AlphaTab.Importer.GpxFile = $AlphaTab_Importer_GpxFile;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.GpxFileSystem
	var $AlphaTab_Importer_GpxFileSystem = function() {
		this.$1$FileFilterField = null;
		this.$1$FilesField = null;
		this.set_files([]);
		this.set_fileFilter(function(s) {
			return true;
		});
	};
	$AlphaTab_Importer_GpxFileSystem.__typeName = 'AlphaTab.Importer.GpxFileSystem';
	global.AlphaTab.Importer.GpxFileSystem = $AlphaTab_Importer_GpxFileSystem;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.GpxImporter
	var $AlphaTab_Importer_GpxImporter = function() {
		$AlphaTab_Importer_ScoreImporter.call(this);
	};
	$AlphaTab_Importer_GpxImporter.__typeName = 'AlphaTab.Importer.GpxImporter';
	global.AlphaTab.Importer.GpxImporter = $AlphaTab_Importer_GpxImporter;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.GpxParser
	var $AlphaTab_Importer_GpxParser = function() {
		this.$1$ScoreField = null;
		this.$_automations = null;
		this.$_tracksMapping = null;
		this.$_tracksById = null;
		this.$_masterBars = null;
		this.$_barsOfMasterBar = null;
		this.$_barsById = null;
		this.$_voicesOfBar = null;
		this.$_voiceById = null;
		this.$_beatsOfVoice = null;
		this.$_rhythmOfBeat = null;
		this.$_beatById = null;
		this.$_rhythmById = null;
		this.$_noteById = null;
		this.$_notesOfBeat = null;
		this.$_tappedNotes = null;
	};
	$AlphaTab_Importer_GpxParser.__typeName = 'AlphaTab.Importer.GpxParser';
	global.AlphaTab.Importer.GpxParser = $AlphaTab_Importer_GpxParser;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.GpxRhythm
	var $AlphaTab_Importer_GpxRhythm = function() {
		this.$1$DotsField = 0;
		this.$1$TupletDenominatorField = 0;
		this.$1$TupletNumeratorField = 0;
		this.$1$ValueField = 0;
		this.set_tupletDenominator(1);
		this.set_tupletNumerator(1);
		this.set_value(4);
	};
	$AlphaTab_Importer_GpxRhythm.__typeName = 'AlphaTab.Importer.GpxRhythm';
	global.AlphaTab.Importer.GpxRhythm = $AlphaTab_Importer_GpxRhythm;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.MixTableChange
	var $AlphaTab_Importer_MixTableChange = function() {
		this.$1$VolumeField = 0;
		this.$1$BalanceField = 0;
		this.$1$InstrumentField = 0;
		this.$1$TempoNameField = null;
		this.$1$TempoField = 0;
		this.$1$DurationField = 0;
		this.set_volume(-1);
		this.set_balance(-1);
		this.set_instrument(-1);
		this.set_tempoName(null);
		this.set_tempo(-1);
		this.set_duration(0);
	};
	$AlphaTab_Importer_MixTableChange.__typeName = 'AlphaTab.Importer.MixTableChange';
	global.AlphaTab.Importer.MixTableChange = $AlphaTab_Importer_MixTableChange;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.NoCompatibleReaderFoundException
	var $AlphaTab_Importer_NoCompatibleReaderFoundException = function() {
		ss.Exception.call(this);
	};
	$AlphaTab_Importer_NoCompatibleReaderFoundException.__typeName = 'AlphaTab.Importer.NoCompatibleReaderFoundException';
	global.AlphaTab.Importer.NoCompatibleReaderFoundException = $AlphaTab_Importer_NoCompatibleReaderFoundException;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.ScoreImporter
	var $AlphaTab_Importer_ScoreImporter = function() {
		this._data = null;
	};
	$AlphaTab_Importer_ScoreImporter.__typeName = 'AlphaTab.Importer.ScoreImporter';
	$AlphaTab_Importer_ScoreImporter.buildImporters = function() {
		return [new $AlphaTab_Importer_Gp3To5Importer(), new $AlphaTab_Importer_GpxImporter(), new $AlphaTab_Importer_AlphaTexImporter()];
	};
	global.AlphaTab.Importer.ScoreImporter = $AlphaTab_Importer_ScoreImporter;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.ScoreLoader
	var $AlphaTab_Importer_ScoreLoader = function() {
	};
	$AlphaTab_Importer_ScoreLoader.__typeName = 'AlphaTab.Importer.ScoreLoader';
	$AlphaTab_Importer_ScoreLoader.loadScoreAsync = function(path, success, error) {
		var loader = $AlphaTab_Environment.fileLoaders.get_item('default')();
		loader.loadBinaryAsync(path, function(data) {
			var score = null;
			try {
				score = $AlphaTab_Importer_ScoreLoader.loadScoreFromBytes(data);
			}
			catch ($t1) {
				var e = ss.Exception.wrap($t1);
				error(e);
			}
			if (ss.isValue(score)) {
				success($AlphaTab_Importer_ScoreLoader.loadScoreFromBytes(data));
			}
		}, error);
	};
	$AlphaTab_Importer_ScoreLoader.loadScore = function(path) {
		var loader = $AlphaTab_Environment.fileLoaders.get_item('default')();
		var data = loader.loadBinary(path);
		return $AlphaTab_Importer_ScoreLoader.loadScoreFromBytes(data);
	};
	$AlphaTab_Importer_ScoreLoader.loadScoreFromBytes = function(data) {
		var importers = $AlphaTab_Importer_ScoreImporter.buildImporters();
		var score = null;
		{
			var ms = new $AlphaTab_IO_MemoryStream.$ctor1(data);
			try {
				ms.seek(0, 0);
				for (var $t1 = 0; $t1 < importers.length; $t1++) {
					var importer = importers[$t1];
					try {
						importer.init(ms);
						score = importer.readScore();
						break;
					}
					catch ($t2) {
						$t2 = ss.Exception.wrap($t2);
						if (ss.isInstanceOfType($t2, $AlphaTab_Importer_UnsupportedFormatException)) {
							// ignore unsupported format
						}
						else {
							throw $t2;
						}
					}
				}
			}
			finally {
				if (ss.isValue(ms)) {
					ms.dispose();
				}
			}
		}
		if (ss.isValue(score)) {
			return score;
		}
		throw new $AlphaTab_Importer_NoCompatibleReaderFoundException();
	};
	global.AlphaTab.Importer.ScoreLoader = $AlphaTab_Importer_ScoreLoader;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Importer.UnsupportedFormatException
	var $AlphaTab_Importer_UnsupportedFormatException = function() {
		ss.Exception.call(this);
	};
	$AlphaTab_Importer_UnsupportedFormatException.__typeName = 'AlphaTab.Importer.UnsupportedFormatException';
	global.AlphaTab.Importer.UnsupportedFormatException = $AlphaTab_Importer_UnsupportedFormatException;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.IO.EndOfStreamException
	var $AlphaTab_IO_$EndOfStreamException = function() {
		ss.Exception.call(this);
	};
	$AlphaTab_IO_$EndOfStreamException.__typeName = 'AlphaTab.IO.$EndOfStreamException';
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.IO.IOException
	var $AlphaTab_IO_$IOException = function(message) {
		ss.Exception.call(this, message);
	};
	$AlphaTab_IO_$IOException.__typeName = 'AlphaTab.IO.$IOException';
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.IO.BitReader
	var $AlphaTab_IO_BitReader = function(source) {
		this.$_currentByte = 0;
		this.$_position = 0;
		this.$_readBytes = 0;
		this.$_source = null;
		this.$_source = source;
		this.$_readBytes = 0;
		this.$_position = $AlphaTab_IO_BitReader.$byteSize;
		// to ensure a byte is read on beginning
	};
	$AlphaTab_IO_BitReader.__typeName = 'AlphaTab.IO.BitReader';
	global.AlphaTab.IO.BitReader = $AlphaTab_IO_BitReader;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.IO.ByteArray
	var $AlphaTab_IO_ByteArray = function(data) {
		this.$_data = null;
		this.$_data = new Uint8Array(data.length);
		this.$_data.set(data);
	};
	$AlphaTab_IO_ByteArray.__typeName = 'AlphaTab.IO.ByteArray';
	$AlphaTab_IO_ByteArray.$ctor1 = function(size) {
		this.$_data = null;
		this.$_data = new Uint8Array(size);
	};
	global.AlphaTab.IO.ByteArray = $AlphaTab_IO_ByteArray;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.IO.FileLoadException
	var $AlphaTab_IO_FileLoadException = function(s) {
		ss.Exception.call(this, s);
	};
	$AlphaTab_IO_FileLoadException.__typeName = 'AlphaTab.IO.FileLoadException';
	global.AlphaTab.IO.FileLoadException = $AlphaTab_IO_FileLoadException;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.IO.MemoryStream
	var $AlphaTab_IO_MemoryStream = function() {
		$AlphaTab_IO_MemoryStream.$ctor2.call(this, 0);
	};
	$AlphaTab_IO_MemoryStream.__typeName = 'AlphaTab.IO.MemoryStream';
	$AlphaTab_IO_MemoryStream.$ctor2 = function(capacity) {
		this.$_buffer = null;
		this.$_position = 0;
		this.$_length = 0;
		this.$_capacity = 0;
		$AlphaTab_IO_Stream.call(this);
		this.$_buffer = new $AlphaTab_IO_ByteArray.$ctor1(capacity);
		this.$_capacity = capacity;
	};
	$AlphaTab_IO_MemoryStream.$ctor1 = function(buffer) {
		this.$_buffer = null;
		this.$_position = 0;
		this.$_length = 0;
		this.$_capacity = 0;
		$AlphaTab_IO_Stream.call(this);
		this.$_buffer = buffer;
		this.$_length = this.$_capacity = buffer.get_length();
	};
	global.AlphaTab.IO.MemoryStream = $AlphaTab_IO_MemoryStream;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.IO.SeekOrigin
	var $AlphaTab_IO_SeekOrigin = function() {
	};
	$AlphaTab_IO_SeekOrigin.__typeName = 'AlphaTab.IO.SeekOrigin';
	global.AlphaTab.IO.SeekOrigin = $AlphaTab_IO_SeekOrigin;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.IO.Stream
	var $AlphaTab_IO_Stream = function() {
	};
	$AlphaTab_IO_Stream.__typeName = 'AlphaTab.IO.Stream';
	global.AlphaTab.IO.Stream = $AlphaTab_IO_Stream;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.IO.StringStream
	var $AlphaTab_IO_StringStream = function(s) {
		$AlphaTab_IO_MemoryStream.$ctor1.call(this, $AlphaTab_IO_StringStream.$getBytes(s));
	};
	$AlphaTab_IO_StringStream.__typeName = 'AlphaTab.IO.StringStream';
	$AlphaTab_IO_StringStream.$getBytes = function(s) {
		var data = new $AlphaTab_IO_ByteArray.$ctor1(s.length);
		for (var i = 0; i < s.length; i++) {
			data.set_item(i, s.charCodeAt(i));
		}
		return data;
	};
	global.AlphaTab.IO.StringStream = $AlphaTab_IO_StringStream;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.AccentuationType
	var $AlphaTab_Model_AccentuationType = function() {
	};
	$AlphaTab_Model_AccentuationType.__typeName = 'AlphaTab.Model.AccentuationType';
	global.AlphaTab.Model.AccentuationType = $AlphaTab_Model_AccentuationType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.AccidentalType
	var $AlphaTab_Model_AccidentalType = function() {
	};
	$AlphaTab_Model_AccidentalType.__typeName = 'AlphaTab.Model.AccidentalType';
	global.AlphaTab.Model.AccidentalType = $AlphaTab_Model_AccidentalType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Automation
	var $AlphaTab_Model_Automation = function() {
		this.$1$IsLinearField = false;
		this.$1$TypeField = 0;
		this.$1$ValueField = 0;
		this.$1$RatioPositionField = 0;
		this.$1$TextField = null;
	};
	$AlphaTab_Model_Automation.__typeName = 'AlphaTab.Model.Automation';
	$AlphaTab_Model_Automation.buildTempoAutomation = function(isLinear, ratioPosition, value, reference) {
		if (reference < 1 || reference > 5) {
			reference = 2;
		}
		var references = [1, 0.5, 1, 1.5, 2, 3];
		var automation = new $AlphaTab_Model_Automation();
		automation.set_type(0);
		automation.set_isLinear(isLinear);
		automation.set_ratioPosition(ratioPosition);
		automation.set_value(value * references[reference]);
		return automation;
	};
	global.AlphaTab.Model.Automation = $AlphaTab_Model_Automation;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.AutomationType
	var $AlphaTab_Model_AutomationType = function() {
	};
	$AlphaTab_Model_AutomationType.__typeName = 'AlphaTab.Model.AutomationType';
	global.AlphaTab.Model.AutomationType = $AlphaTab_Model_AutomationType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Bar
	var $AlphaTab_Model_Bar = function() {
		this.$1$IndexField = 0;
		this.$1$NextBarField = null;
		this.$1$PreviousBarField = null;
		this.$1$ClefField = 0;
		this.$1$TrackField = null;
		this.$1$VoicesField = null;
		this.$1$MinDurationField = null;
		this.$1$MaxDurationField = null;
		this.set_voices([]);
		this.set_clef(4);
	};
	$AlphaTab_Model_Bar.__typeName = 'AlphaTab.Model.Bar';
	global.AlphaTab.Model.Bar = $AlphaTab_Model_Bar;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Beat
	var $AlphaTab_Model_Beat = function() {
		this.$1$PreviousBeatField = null;
		this.$1$NextBeatField = null;
		this.$1$IndexField = 0;
		this.$1$VoiceField = null;
		this.$1$NotesField = null;
		this.$1$IsEmptyField = false;
		this.$_minNote = null;
		this.$_maxNote = null;
		this.$1$DurationField = 0;
		this.$1$AutomationsField = null;
		this.$1$DotsField = 0;
		this.$1$FadeInField = false;
		this.$1$LyricsField = null;
		this.$1$PopField = false;
		this.$1$HasRasgueadoField = false;
		this.$1$SlapField = false;
		this.$1$TapField = false;
		this.$1$TextField = null;
		this.$1$BrushTypeField = 0;
		this.$1$BrushDurationField = 0;
		this.$1$TupletDenominatorField = 0;
		this.$1$TupletNumeratorField = 0;
		this.$1$WhammyBarPointsField = null;
		this.$1$VibratoField = 0;
		this.$1$ChordIdField = null;
		this.$1$GraceTypeField = 0;
		this.$1$PickStrokeField = 0;
		this.$1$TremoloSpeedField = null;
		this.$1$CrescendoField = 0;
		this.$1$StartField = 0;
		this.$1$DynamicField = 0;
		this.set_whammyBarPoints([]);
		this.set_notes([]);
		this.set_brushType(0);
		this.set_vibrato(0);
		this.set_graceType(0);
		this.set_pickStroke(0);
		this.set_duration(4);
		this.set_tremoloSpeed(null);
		this.set_automations([]);
		this.set_dots(0);
		this.set_start(0);
		this.set_tupletDenominator(-1);
		this.set_tupletNumerator(-1);
		this.set_dynamic(5);
		this.set_crescendo(0);
	};
	$AlphaTab_Model_Beat.__typeName = 'AlphaTab.Model.Beat';
	global.AlphaTab.Model.Beat = $AlphaTab_Model_Beat;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.BendPoint
	var $AlphaTab_Model_BendPoint = function(offset, value) {
		this.$1$OffsetField = 0;
		this.$1$ValueField = 0;
		this.set_offset(offset);
		this.set_value(value);
	};
	$AlphaTab_Model_BendPoint.__typeName = 'AlphaTab.Model.BendPoint';
	global.AlphaTab.Model.BendPoint = $AlphaTab_Model_BendPoint;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.BrushType
	var $AlphaTab_Model_BrushType = function() {
	};
	$AlphaTab_Model_BrushType.__typeName = 'AlphaTab.Model.BrushType';
	global.AlphaTab.Model.BrushType = $AlphaTab_Model_BrushType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Chord
	var $AlphaTab_Model_Chord = function() {
		this.$1$NameField = null;
		this.$1$FirstFretField = 0;
		this.$1$StringsField = null;
		this.set_strings([]);
	};
	$AlphaTab_Model_Chord.__typeName = 'AlphaTab.Model.Chord';
	global.AlphaTab.Model.Chord = $AlphaTab_Model_Chord;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Clef
	var $AlphaTab_Model_Clef = function() {
	};
	$AlphaTab_Model_Clef.__typeName = 'AlphaTab.Model.Clef';
	global.AlphaTab.Model.Clef = $AlphaTab_Model_Clef;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.CrescendoType
	var $AlphaTab_Model_CrescendoType = function() {
	};
	$AlphaTab_Model_CrescendoType.__typeName = 'AlphaTab.Model.CrescendoType';
	global.AlphaTab.Model.CrescendoType = $AlphaTab_Model_CrescendoType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Duration
	var $AlphaTab_Model_Duration = function() {
	};
	$AlphaTab_Model_Duration.__typeName = 'AlphaTab.Model.Duration';
	global.AlphaTab.Model.Duration = $AlphaTab_Model_Duration;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.DynamicValue
	var $AlphaTab_Model_DynamicValue = function() {
	};
	$AlphaTab_Model_DynamicValue.__typeName = 'AlphaTab.Model.DynamicValue';
	global.AlphaTab.Model.DynamicValue = $AlphaTab_Model_DynamicValue;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Fingers
	var $AlphaTab_Model_Fingers = function() {
	};
	$AlphaTab_Model_Fingers.__typeName = 'AlphaTab.Model.Fingers';
	global.AlphaTab.Model.Fingers = $AlphaTab_Model_Fingers;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.GraceType
	var $AlphaTab_Model_GraceType = function() {
	};
	$AlphaTab_Model_GraceType.__typeName = 'AlphaTab.Model.GraceType';
	global.AlphaTab.Model.GraceType = $AlphaTab_Model_GraceType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.HarmonicType
	var $AlphaTab_Model_HarmonicType = function() {
	};
	$AlphaTab_Model_HarmonicType.__typeName = 'AlphaTab.Model.HarmonicType';
	global.AlphaTab.Model.HarmonicType = $AlphaTab_Model_HarmonicType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.HashSet
	var $AlphaTab_Model_HashSet$1 = function(T) {
		var $type = function(values) {
			this.$_dictionary = null;
			this.$_dictionary = new (ss.makeGenericType(ss.Dictionary$2, [T, Boolean]))();
			var $t1 = ss.getEnumerator(values);
			try {
				while ($t1.moveNext()) {
					var value = $t1.current();
					this.$_dictionary.set_item(value, true);
				}
			}
			finally {
				$t1.dispose();
			}
		};
		ss.registerGenericClassInstance($type, $AlphaTab_Model_HashSet$1, [T], {
			contains: function(value) {
				return this.$_dictionary.containsKey(value);
			}
		}, function() {
			return null;
		}, function() {
			return [];
		});
		return $type;
	};
	$AlphaTab_Model_HashSet$1.__typeName = 'AlphaTab.Model.HashSet$1';
	ss.initGenericClass($AlphaTab_Model_HashSet$1, $asm, 1);
	global.AlphaTab.Model.HashSet$1 = $AlphaTab_Model_HashSet$1;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.KeySignatureType
	var $AlphaTab_Model_KeySignatureType = function() {
	};
	$AlphaTab_Model_KeySignatureType.__typeName = 'AlphaTab.Model.KeySignatureType';
	global.AlphaTab.Model.KeySignatureType = $AlphaTab_Model_KeySignatureType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.MasterBar
	var $AlphaTab_Model_MasterBar = function() {
		this.$1$AlternateEndingsField = 0;
		this.$1$NextMasterBarField = null;
		this.$1$PreviousMasterBarField = null;
		this.$1$IndexField = 0;
		this.$1$KeySignatureField = 0;
		this.$1$IsDoubleBarField = false;
		this.$1$IsRepeatStartField = false;
		this.$1$RepeatCountField = 0;
		this.$1$RepeatGroupField = null;
		this.$1$TimeSignatureNumeratorField = 0;
		this.$1$TimeSignatureDenominatorField = 0;
		this.$1$TripletFeelField = 0;
		this.$1$SectionField = null;
		this.$1$TempoAutomationField = null;
		this.$1$VolumeAutomationField = null;
		this.$1$ScoreField = null;
		this.$1$StartField = 0;
		this.set_timeSignatureDenominator(4);
		this.set_timeSignatureNumerator(4);
		this.set_tripletFeel(0);
	};
	$AlphaTab_Model_MasterBar.__typeName = 'AlphaTab.Model.MasterBar';
	global.AlphaTab.Model.MasterBar = $AlphaTab_Model_MasterBar;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.ModelUtils
	var $AlphaTab_Model_ModelUtils = function() {
	};
	$AlphaTab_Model_ModelUtils.__typeName = 'AlphaTab.Model.ModelUtils';
	$AlphaTab_Model_ModelUtils.getIndex = function(duration) {
		var index = 0;
		var value = duration;
		while ((value = value >> 1) > 0) {
			index++;
		}
		return index;
	};
	$AlphaTab_Model_ModelUtils.keySignatureIsFlat = function(ks) {
		return ks < 0;
	};
	$AlphaTab_Model_ModelUtils.keySignatureIsNatural = function(ks) {
		return ks === 0;
	};
	$AlphaTab_Model_ModelUtils.keySignatureIsSharp = function(ks) {
		return ks > 0;
	};
	global.AlphaTab.Model.ModelUtils = $AlphaTab_Model_ModelUtils;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Note
	var $AlphaTab_Model_Note = function() {
		this.$1$AccentuatedField = 0;
		this.$1$BendPointsField = null;
		this.$1$FretField = 0;
		this.$1$StringField = 0;
		this.$1$HammerPullOriginField = null;
		this.$1$IsHammerPullDestinationField = false;
		this.$1$IsHammerPullOriginField = false;
		this.$1$HarmonicValueField = 0;
		this.$1$HarmonicTypeField = 0;
		this.$1$IsGhostField = false;
		this.$1$IsLetRingField = false;
		this.$1$IsPalmMuteField = false;
		this.$1$IsDeadField = false;
		this.$1$IsStaccatoField = false;
		this.$1$SlideTypeField = 0;
		this.$1$SlideTargetField = null;
		this.$1$VibratoField = 0;
		this.$1$TieOriginField = null;
		this.$1$IsTieDestinationField = false;
		this.$1$IsTieOriginField = false;
		this.$1$LeftHandFingerField = 0;
		this.$1$RightHandFingerField = 0;
		this.$1$IsFingeringField = false;
		this.$1$TrillValueField = 0;
		this.$1$TrillSpeedField = 0;
		this.$1$DurationPercentField = 0;
		this.$1$SwapAccidentalsField = false;
		this.$1$BeatField = null;
		this.$1$DynamicField = 0;
		this.$1$OctaveField = 0;
		this.set_bendPoints([]);
		this.set_dynamic(5);
		this.set_accentuated(0);
		this.set_fret(-1);
		this.set_harmonicType(0);
		this.set_slideType(0);
		this.set_vibrato(0);
		this.set_leftHandFinger(-1);
		this.set_rightHandFinger(-1);
		this.set_trillValue(-1);
		this.set_trillSpeed(32);
		this.set_durationPercent(1);
		this.set_octave(-1);
	};
	$AlphaTab_Model_Note.__typeName = 'AlphaTab.Model.Note';
	$AlphaTab_Model_Note.$nextNoteOnSameLine = function(note) {
		var nextBeat = note.get_beat().get_nextBeat();
		// keep searching in same bar
		while (ss.isValue(nextBeat) && nextBeat.get_voice().get_bar().get_index() <= note.get_beat().get_voice().get_bar().get_index() + $AlphaTab_Model_Note.$maxOffsetForSameLineSearch) {
			var noteOnString = nextBeat.getNoteOnString(note.get_string());
			if (ss.isValue(noteOnString)) {
				return noteOnString;
			}
			else {
				nextBeat = nextBeat.get_nextBeat();
			}
		}
		return null;
	};
	$AlphaTab_Model_Note.$previousNoteOnSameLine = function(note) {
		var previousBeat = note.get_beat().get_previousBeat();
		// keep searching in same bar
		while (ss.isValue(previousBeat) && previousBeat.get_voice().get_bar().get_index() >= note.get_beat().get_voice().get_bar().get_index() - $AlphaTab_Model_Note.$maxOffsetForSameLineSearch) {
			var noteOnString = previousBeat.getNoteOnString(note.get_string());
			if (ss.isValue(noteOnString)) {
				return noteOnString;
			}
			else {
				previousBeat = previousBeat.get_previousBeat();
			}
		}
		return null;
	};
	global.AlphaTab.Model.Note = $AlphaTab_Model_Note;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.PickStrokeType
	var $AlphaTab_Model_PickStrokeType = function() {
	};
	$AlphaTab_Model_PickStrokeType.__typeName = 'AlphaTab.Model.PickStrokeType';
	global.AlphaTab.Model.PickStrokeType = $AlphaTab_Model_PickStrokeType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.PlaybackInformation
	var $AlphaTab_Model_PlaybackInformation = function() {
		this.$1$VolumeField = 0;
		this.$1$BalanceField = 0;
		this.$1$PortField = 0;
		this.$1$ProgramField = 0;
		this.$1$PrimaryChannelField = 0;
		this.$1$SecondaryChannelField = 0;
		this.$1$IsMuteField = false;
		this.$1$IsSoloField = false;
		this.set_volume(15);
		this.set_balance(8);
		this.set_port(1);
	};
	$AlphaTab_Model_PlaybackInformation.__typeName = 'AlphaTab.Model.PlaybackInformation';
	global.AlphaTab.Model.PlaybackInformation = $AlphaTab_Model_PlaybackInformation;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.RepeatGroup
	var $AlphaTab_Model_RepeatGroup = function() {
		this.$1$MasterBarsField = null;
		this.$1$OpeningsField = null;
		this.$1$ClosingsField = null;
		this.$1$IsClosedField = false;
		this.set_masterBars([]);
		this.set_openings([]);
		this.set_closings([]);
		this.set_isClosed(false);
	};
	$AlphaTab_Model_RepeatGroup.__typeName = 'AlphaTab.Model.RepeatGroup';
	global.AlphaTab.Model.RepeatGroup = $AlphaTab_Model_RepeatGroup;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Score
	var $AlphaTab_Model_Score = function() {
		this.$_currentRepeatGroup = null;
		this.$1$AlbumField = null;
		this.$1$ArtistField = null;
		this.$1$CopyrightField = null;
		this.$1$InstructionsField = null;
		this.$1$MusicField = null;
		this.$1$NoticesField = null;
		this.$1$SubTitleField = null;
		this.$1$TitleField = null;
		this.$1$WordsField = null;
		this.$1$TabField = null;
		this.$1$TempoField = 0;
		this.$1$TempoLabelField = null;
		this.$1$MasterBarsField = null;
		this.$1$TracksField = null;
		this.set_masterBars([]);
		this.set_tracks([]);
		this.$_currentRepeatGroup = new $AlphaTab_Model_RepeatGroup();
	};
	$AlphaTab_Model_Score.__typeName = 'AlphaTab.Model.Score';
	global.AlphaTab.Model.Score = $AlphaTab_Model_Score;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Section
	var $AlphaTab_Model_Section = function() {
		this.$1$MarkerField = null;
		this.$1$TextField = null;
	};
	$AlphaTab_Model_Section.__typeName = 'AlphaTab.Model.Section';
	global.AlphaTab.Model.Section = $AlphaTab_Model_Section;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.SlideType
	var $AlphaTab_Model_SlideType = function() {
	};
	$AlphaTab_Model_SlideType.__typeName = 'AlphaTab.Model.SlideType';
	global.AlphaTab.Model.SlideType = $AlphaTab_Model_SlideType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Track
	var $AlphaTab_Model_Track = function() {
		this.$1$CapoField = 0;
		this.$1$IndexField = 0;
		this.$1$NameField = null;
		this.$1$ShortNameField = null;
		this.$1$TuningField = null;
		this.$1$TuningNameField = null;
		this.$1$ColorField = null;
		this.$1$PlaybackInfoField = null;
		this.$1$IsPercussionField = false;
		this.$1$ScoreField = null;
		this.$1$BarsField = null;
		this.$1$ChordsField = null;
		this.set_name('');
		this.set_shortName('');
		this.set_tuning([]);
		this.set_bars([]);
		this.set_chords(new (ss.makeGenericType(ss.Dictionary$2, [String, $AlphaTab_Model_Chord]))());
		this.set_playbackInfo(new $AlphaTab_Model_PlaybackInformation());
		this.set_color(new $AlphaTab_Platform_Model_Color(200, 0, 0, 255));
	};
	$AlphaTab_Model_Track.__typeName = 'AlphaTab.Model.Track';
	global.AlphaTab.Model.Track = $AlphaTab_Model_Track;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.TripletFeel
	var $AlphaTab_Model_TripletFeel = function() {
	};
	$AlphaTab_Model_TripletFeel.__typeName = 'AlphaTab.Model.TripletFeel';
	global.AlphaTab.Model.TripletFeel = $AlphaTab_Model_TripletFeel;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Tuning
	var $AlphaTab_Model_Tuning = function(name, tuning, isStandard) {
		this.$1$IsStandardField = false;
		this.$1$NameField = null;
		this.$1$TuningsField = null;
		this.set_isStandard(isStandard);
		this.set_name(name);
		this.set_tunings(ss.arrayFromEnumerable(tuning));
	};
	$AlphaTab_Model_Tuning.__typeName = 'AlphaTab.Model.Tuning';
	$AlphaTab_Model_Tuning.isTuning = function(name) {
		return ss.isValue($AlphaTab_Model_Tuning.tuningRegex.exec(name));
	};
	$AlphaTab_Model_Tuning.getTextForTuning = function(tuning, includeOctave) {
		var octave = ss.Int32.div(tuning, 12);
		var note = tuning % 12;
		var notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
		var result = notes[note];
		if (includeOctave) {
			result += octave;
		}
		return result;
	};
	$AlphaTab_Model_Tuning.getTuningForText = function(str) {
		var b = 0;
		var note = null;
		var octave = 0;
		var m = $AlphaTab_Model_Tuning.tuningRegex.exec(str.toLowerCase());
		if (ss.isValue(m)) {
			note = m[1];
			octave = $AlphaTab_Platform_Std.parseInt(m[2]);
		}
		if (!$AlphaTab_Platform_Std.isNullOrWhiteSpace(note)) {
			switch (note) {
				case 'c': {
					b = 0;
					break;
				}
				case 'db': {
					b = 1;
					break;
				}
				case 'd': {
					b = 2;
					break;
				}
				case 'eb': {
					b = 3;
					break;
				}
				case 'e': {
					b = 4;
					break;
				}
				case 'f': {
					b = 5;
					break;
				}
				case 'gb': {
					b = 6;
					break;
				}
				case 'g': {
					b = 7;
					break;
				}
				case 'ab': {
					b = 8;
					break;
				}
				case 'a': {
					b = 9;
					break;
				}
				case 'bb': {
					b = 10;
					break;
				}
				case 'b': {
					b = 11;
					break;
				}
				default: {
					return -1;
				}
			}
			// add octaves
			b += (octave + 1) * 12;
		}
		else {
			return -1;
		}
		return b;
	};
	$AlphaTab_Model_Tuning.getPresetsFor = function(stringCount) {
		if (ss.isNullOrUndefined($AlphaTab_Model_Tuning.$_sevenStrings)) {
			$AlphaTab_Model_Tuning.$initialize();
		}
		if (stringCount === 7) {
			return $AlphaTab_Model_Tuning.$_sevenStrings;
		}
		if (stringCount === 6) {
			return $AlphaTab_Model_Tuning.$_sixStrings;
		}
		if (stringCount === 5) {
			return $AlphaTab_Model_Tuning.$_fiveStrings;
		}
		if (stringCount === 4) {
			return $AlphaTab_Model_Tuning.$_fourStrings;
		}
		return [];
	};
	$AlphaTab_Model_Tuning.$initialize = function() {
		$AlphaTab_Model_Tuning.$_sevenStrings = [];
		$AlphaTab_Model_Tuning.$_sixStrings = [];
		$AlphaTab_Model_Tuning.$_fiveStrings = [];
		$AlphaTab_Model_Tuning.$_fourStrings = [];
		ss.add($AlphaTab_Model_Tuning.$_sevenStrings, new $AlphaTab_Model_Tuning('Guitar 7 strings', [64, 59, 55, 50, 45, 40, 35], true));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Standard Tuning', [64, 59, 55, 50, 45, 40], true));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Tune down � step', [63, 58, 54, 49, 44, 39], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Tune down 1 step', [62, 57, 53, 48, 43, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Tune down 2 step', [60, 55, 51, 46, 41, 36], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Dropped D Tuning', [64, 59, 55, 50, 45, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Dropped D Tuning variant', [64, 57, 55, 50, 45, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Double Dropped D Tuning', [62, 59, 55, 50, 45, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Dropped E Tuning', [66, 61, 57, 52, 47, 40], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Dropped C Tuning', [62, 57, 53, 48, 43, 36], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open C Tuning', [64, 60, 55, 48, 43, 36], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open Cm Tuning', [63, 60, 55, 48, 43, 36], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open C6 Tuning', [64, 57, 55, 48, 43, 36], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open Cmaj7 Tuning', [64, 59, 55, 52, 43, 36], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open D Tuning', [62, 57, 54, 50, 45, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open Dm Tuning', [62, 57, 53, 50, 45, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open D5 Tuning', [62, 57, 50, 50, 45, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open D6 Tuning', [62, 59, 54, 50, 45, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open Dsus4 Tuning', [62, 57, 55, 50, 45, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open E Tuning', [64, 59, 56, 52, 47, 40], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open Em Tuning', [64, 59, 55, 52, 47, 40], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open Esus11 Tuning', [64, 59, 55, 52, 45, 40], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open F Tuning', [65, 60, 53, 48, 45, 41], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open G Tuning', [62, 59, 55, 50, 43, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open Gm Tuning', [62, 58, 55, 50, 43, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open G6 Tuning', [64, 59, 55, 50, 43, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open Gsus4 Tuning', [62, 60, 55, 50, 43, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open A Tuning', [64, 61, 57, 52, 45, 40], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Open Am Tuning', [64, 60, 57, 52, 45, 40], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Guitar Nashville Tuning', [64, 59, 67, 62, 57, 52], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Bass 6 Strings Tuning', [48, 43, 38, 33, 28, 23], false));
		ss.add($AlphaTab_Model_Tuning.$_sixStrings, new $AlphaTab_Model_Tuning('Lute or Vihuela Tuning', [64, 59, 54, 50, 45, 40], false));
		ss.add($AlphaTab_Model_Tuning.$_fiveStrings, new $AlphaTab_Model_Tuning('Bass 5 Strings Tuning', [43, 38, 33, 28, 23], true));
		ss.add($AlphaTab_Model_Tuning.$_fiveStrings, new $AlphaTab_Model_Tuning('Banjo Dropped C Tuning', [62, 59, 55, 48, 67], false));
		ss.add($AlphaTab_Model_Tuning.$_fiveStrings, new $AlphaTab_Model_Tuning('Banjo Open D Tuning', [62, 57, 54, 50, 69], false));
		ss.add($AlphaTab_Model_Tuning.$_fiveStrings, new $AlphaTab_Model_Tuning('Banjo Open G Tuning', [62, 59, 55, 50, 67], false));
		ss.add($AlphaTab_Model_Tuning.$_fiveStrings, new $AlphaTab_Model_Tuning('Banjo G Minor Tuning', [62, 58, 55, 50, 67], false));
		ss.add($AlphaTab_Model_Tuning.$_fiveStrings, new $AlphaTab_Model_Tuning('Banjo G Modal Tuning', [62, 57, 55, 50, 67], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Bass Standard Tuning', [43, 38, 33, 28], true));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Bass Tune down � step', [42, 37, 32, 27], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Bass Tune down 1 step', [41, 36, 31, 26], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Bass Tune down 2 step', [39, 34, 29, 24], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Bass Dropped D Tuning', [43, 38, 33, 26], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Ukulele C Tuning', [45, 40, 36, 43], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Ukulele G Tuning', [52, 47, 43, 38], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Mandolin Standard Tuning', [64, 57, 50, 43], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Mandolin or Violin Tuning', [76, 69, 62, 55], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Viola Tuning', [69, 62, 55, 48], false));
		ss.add($AlphaTab_Model_Tuning.$_fourStrings, new $AlphaTab_Model_Tuning('Cello Tuning', [57, 50, 43, 36], false));
	};
	$AlphaTab_Model_Tuning.findTuning = function(strings) {
		var tunings = $AlphaTab_Model_Tuning.getPresetsFor(strings.length);
		for (var $t1 = 0; $t1 < tunings.length; $t1++) {
			var tuning = tunings[$t1];
			var equals = true;
			for (var i = 0; i < strings.length; i++) {
				if (strings[i] !== tuning.get_tunings()[i]) {
					equals = false;
					break;
				}
			}
			if (equals) {
				return tuning;
			}
		}
		return null;
	};
	global.AlphaTab.Model.Tuning = $AlphaTab_Model_Tuning;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.VibratoType
	var $AlphaTab_Model_VibratoType = function() {
	};
	$AlphaTab_Model_VibratoType.__typeName = 'AlphaTab.Model.VibratoType';
	global.AlphaTab.Model.VibratoType = $AlphaTab_Model_VibratoType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Model.Voice
	var $AlphaTab_Model_Voice = function() {
		this.$1$IndexField = 0;
		this.$1$BarField = null;
		this.$1$BeatsField = null;
		this.$1$MinDurationField = null;
		this.$1$MaxDurationField = null;
		this.set_beats([]);
	};
	$AlphaTab_Model_Voice.__typeName = 'AlphaTab.Model.Voice';
	global.AlphaTab.Model.Voice = $AlphaTab_Model_Voice;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.ICanvas
	var $AlphaTab_Platform_ICanvas = function() {
	};
	$AlphaTab_Platform_ICanvas.__typeName = 'AlphaTab.Platform.ICanvas';
	global.AlphaTab.Platform.ICanvas = $AlphaTab_Platform_ICanvas;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.IFileLoader
	var $AlphaTab_Platform_IFileLoader = function() {
	};
	$AlphaTab_Platform_IFileLoader.__typeName = 'AlphaTab.Platform.IFileLoader';
	global.AlphaTab.Platform.IFileLoader = $AlphaTab_Platform_IFileLoader;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Nullable
	var $AlphaTab_Platform_Nullable$1 = function(T) {
		var $type = function(value) {
			this.$1$ValueField = ss.getDefaultValue(T);
			this.set_value(value);
		};
		ss.registerGenericClassInstance($type, $AlphaTab_Platform_Nullable$1, [T], {
			get_value: function() {
				return this.$1$ValueField;
			},
			set_value: function(value) {
				this.$1$ValueField = value;
			}
		}, function() {
			return null;
		}, function() {
			return [];
		});
		return $type;
	};
	$AlphaTab_Platform_Nullable$1.__typeName = 'AlphaTab.Platform.Nullable$1';
	ss.initGenericClass($AlphaTab_Platform_Nullable$1, $asm, 1);
	global.AlphaTab.Platform.Nullable$1 = $AlphaTab_Platform_Nullable$1;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Std
	var $AlphaTab_Platform_Std = function() {
	};
	$AlphaTab_Platform_Std.__typeName = 'AlphaTab.Platform.Std';
	$AlphaTab_Platform_Std.parseFloat = function(s) {
		var f;
		var d = parseFloat(s);
		if (isNaN(d)) {
			f = Number.NaN;
		}
		else {
			f = d;
		}
		return f;
	};
	$AlphaTab_Platform_Std.parseInt = function(s) {
		var f = {};
		if (!ss.Int32.tryParse(s, f)) {
			f.$ = 0;
		}
		return f.$;
	};
	$AlphaTab_Platform_Std.blockCopy = function(src, srcOffset, dst, dstOffset, count) {
		var $t1 = src.get_data();
		dst.get_data().set($t1.subarray(srcOffset, srcOffset + count), dstOffset);
	};
	$AlphaTab_Platform_Std.isNullOrWhiteSpace = function(s) {
		return ss.isNullOrUndefined(s) || s.trim().length === 0;
	};
	global.AlphaTab.Platform.Std = $AlphaTab_Platform_Std;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.JavaScript.Html5Canvas
	var $AlphaTab_Platform_JavaScript_Html5Canvas = function(dom) {
		this.$_canvas = null;
		this.$_context = null;
		this.$_color = null;
		this.$_font = null;
		this.$_canvas = dom;
		this.$_context = this.$_canvas.getContext('2d');
		this.$_context.textBaseline = 'top';
	};
	$AlphaTab_Platform_JavaScript_Html5Canvas.__typeName = 'AlphaTab.Platform.JavaScript.Html5Canvas';
	global.AlphaTab.Platform.JavaScript.Html5Canvas = $AlphaTab_Platform_JavaScript_Html5Canvas;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.JavaScript.JsFileLoader
	var $AlphaTab_Platform_JavaScript_JsFileLoader = function() {
	};
	$AlphaTab_Platform_JavaScript_JsFileLoader.__typeName = 'AlphaTab.Platform.JavaScript.JsFileLoader';
	$AlphaTab_Platform_JavaScript_JsFileLoader.getIEVersion = function() {
		var rv = -1;
		var appName = navigator.appName;
		var agent = navigator.userAgent;
		if (appName === 'Microsoft Internet Explorer') {
			var r = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})');
			var m = r.exec(agent);
			if (ss.isValue(m)) {
				rv = $AlphaTab_Platform_Std.parseFloat(m[1]);
			}
		}
		return rv;
	};
	$AlphaTab_Platform_JavaScript_JsFileLoader.$getBytesFromString = function(s) {
		var b = new $AlphaTab_IO_ByteArray.$ctor1(s.length);
		for (var i = 0; i < s.length; i++) {
			b.set_item(i, s.charCodeAt(i));
		}
		return b;
	};
	global.AlphaTab.Platform.JavaScript.JsFileLoader = $AlphaTab_Platform_JavaScript_JsFileLoader;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Model.Color
	var $AlphaTab_Platform_Model_Color = function(r, g, b, a) {
		this.$_value = 0;
		this.$_value = a << 24 | r << 16 | g << 8 | b;
	};
	$AlphaTab_Platform_Model_Color.__typeName = 'AlphaTab.Platform.Model.Color';
	global.AlphaTab.Platform.Model.Color = $AlphaTab_Platform_Model_Color;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Model.Font
	var $AlphaTab_Platform_Model_Font = function(family, size, style) {
		this.$1$FamilyField = null;
		this.$1$SizeField = 0;
		this.$1$StyleField = 0;
		this.set_family(family);
		this.set_size(size);
		this.set_style(style);
	};
	$AlphaTab_Platform_Model_Font.__typeName = 'AlphaTab.Platform.Model.Font';
	global.AlphaTab.Platform.Model.Font = $AlphaTab_Platform_Model_Font;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Model.FontStyle
	var $AlphaTab_Platform_Model_FontStyle = function() {
	};
	$AlphaTab_Platform_Model_FontStyle.__typeName = 'AlphaTab.Platform.Model.FontStyle';
	global.AlphaTab.Platform.Model.FontStyle = $AlphaTab_Platform_Model_FontStyle;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Model.TextAlign
	var $AlphaTab_Platform_Model_TextAlign = function() {
	};
	$AlphaTab_Platform_Model_TextAlign.__typeName = 'AlphaTab.Platform.Model.TextAlign';
	global.AlphaTab.Platform.Model.TextAlign = $AlphaTab_Platform_Model_TextAlign;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Model.TextBaseline
	var $AlphaTab_Platform_Model_TextBaseline = function() {
	};
	$AlphaTab_Platform_Model_TextBaseline.__typeName = 'AlphaTab.Platform.Model.TextBaseline';
	global.AlphaTab.Platform.Model.TextBaseline = $AlphaTab_Platform_Model_TextBaseline;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Svg.FontSizes
	var $AlphaTab_Platform_Svg_FontSizes = function() {
	};
	$AlphaTab_Platform_Svg_FontSizes.__typeName = 'AlphaTab.Platform.Svg.FontSizes';
	$AlphaTab_Platform_Svg_FontSizes.measureString = function(s, f, size) {
		var data;
		var dataSize;
		if (f === 0) {
			data = $AlphaTab_Platform_Svg_FontSizes.timesNewRoman;
			dataSize = 11;
		}
		else if (f === 1) {
			data = $AlphaTab_Platform_Svg_FontSizes.arial11Pt;
			dataSize = 11;
		}
		else {
			data = new $AlphaTab_IO_ByteArray([8]);
			dataSize = 11;
		}
		var stringSize = 0;
		for (var i = 0; i < s.length; i++) {
			var code = Math.min(data.get_length() - 1, s.charCodeAt(i) - $AlphaTab_Platform_Svg_FontSizes.controlChars);
			if (code >= 0) {
				stringSize += ss.Int32.trunc(data.get_item(code) * size / dataSize);
			}
		}
		return stringSize;
	};
	global.AlphaTab.Platform.Svg.FontSizes = $AlphaTab_Platform_Svg_FontSizes;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Svg.SupportedFonts
	var $AlphaTab_Platform_Svg_SupportedFonts = function() {
	};
	$AlphaTab_Platform_Svg_SupportedFonts.__typeName = 'AlphaTab.Platform.Svg.SupportedFonts';
	global.AlphaTab.Platform.Svg.SupportedFonts = $AlphaTab_Platform_Svg_SupportedFonts;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Platform.Svg.SvgCanvas
	var $AlphaTab_Platform_Svg_SvgCanvas = function() {
		this.$_buffer = null;
		this.$_currentPath = null;
		this.$_currentPathIsEmpty = false;
		this.$1$WidthField = 0;
		this.$1$HeightField = 0;
		this.$1$ColorField = null;
		this.$1$LineWidthField = 0;
		this.$1$FontField = null;
		this.$1$TextAlignField = 0;
		this.$1$TextBaselineField = 0;
		this.$_buffer = '';
		this.$_currentPath = '';
		this.$_currentPathIsEmpty = true;
		this.set_color(new $AlphaTab_Platform_Model_Color(255, 255, 255, 255));
		this.set_lineWidth(1);
		this.set_width(0);
		this.set_height(0);
		this.set_font(new $AlphaTab_Platform_Model_Font('Arial', 10, 0));
		this.set_textAlign(0);
		this.set_textBaseline(0);
	};
	$AlphaTab_Platform_Svg_SvgCanvas.__typeName = 'AlphaTab.Platform.Svg.SvgCanvas';
	global.AlphaTab.Platform.Svg.SvgCanvas = $AlphaTab_Platform_Svg_SvgCanvas;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.AlternateEndingsBarRenderer
	var $AlphaTab_Rendering_AlternateEndingsBarRenderer = function(bar) {
		this.$_endings = null;
		this.$_endingsString = null;
		$AlphaTab_Rendering_BarRendererBase.call(this, bar);
		var alternateEndings = this.get_bar().get_masterBar().get_alternateEndings();
		this.$_endings = [];
		for (var i = 0; i < $AlphaTab_Model_MasterBar.maxAlternateEndings; i++) {
			if ((alternateEndings & 1 << i) !== 0) {
				ss.add(this.$_endings, i);
			}
		}
	};
	$AlphaTab_Rendering_AlternateEndingsBarRenderer.__typeName = 'AlphaTab.Rendering.AlternateEndingsBarRenderer';
	global.AlphaTab.Rendering.AlternateEndingsBarRenderer = $AlphaTab_Rendering_AlternateEndingsBarRenderer;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.AlternateEndingsBarRendererFactory
	var $AlphaTab_Rendering_AlternateEndingsBarRendererFactory = function() {
		$AlphaTab_Rendering_BarRendererFactory.call(this);
		this.set_isInAccolade(false);
	};
	$AlphaTab_Rendering_AlternateEndingsBarRendererFactory.__typeName = 'AlphaTab.Rendering.AlternateEndingsBarRendererFactory';
	global.AlphaTab.Rendering.AlternateEndingsBarRendererFactory = $AlphaTab_Rendering_AlternateEndingsBarRendererFactory;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.BarRendererBase
	var $AlphaTab_Rendering_BarRendererBase = function(bar) {
		this.$1$StaveField = null;
		this.$1$XField = 0;
		this.$1$YField = 0;
		this.$1$WidthField = 0;
		this.$1$HeightField = 0;
		this.$1$IndexField = 0;
		this.$1$IsEmptyField = false;
		this.$1$TopOverflowField = 0;
		this.$1$BottomOverflowField = 0;
		this.$1$BarField = null;
		this.set_bar(bar);
		this.set_isEmpty(true);
	};
	$AlphaTab_Rendering_BarRendererBase.__typeName = 'AlphaTab.Rendering.BarRendererBase';
	global.AlphaTab.Rendering.BarRendererBase = $AlphaTab_Rendering_BarRendererBase;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.BarRendererFactory
	var $AlphaTab_Rendering_BarRendererFactory = function() {
		this.$1$IsInAccoladeField = false;
		this.$1$HideOnMultiTrackField = false;
		this.set_isInAccolade(true);
		this.set_hideOnMultiTrack(false);
	};
	$AlphaTab_Rendering_BarRendererFactory.__typeName = 'AlphaTab.Rendering.BarRendererFactory';
	global.AlphaTab.Rendering.BarRendererFactory = $AlphaTab_Rendering_BarRendererFactory;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.EffectBarGlyphSizing
	var $AlphaTab_Rendering_EffectBarGlyphSizing = function() {
	};
	$AlphaTab_Rendering_EffectBarGlyphSizing.__typeName = 'AlphaTab.Rendering.EffectBarGlyphSizing';
	global.AlphaTab.Rendering.EffectBarGlyphSizing = $AlphaTab_Rendering_EffectBarGlyphSizing;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.EffectBarRenderer
	var $AlphaTab_Rendering_EffectBarRenderer = function(bar, info) {
		this.$_info = null;
		this.$_uniqueEffectGlyphs = null;
		this.$_effectGlyphs = null;
		this.$_lastBeat = null;
		$AlphaTab_Rendering_GroupedBarRenderer.call(this, bar);
		this.$_info = info;
		this.$_uniqueEffectGlyphs = [];
		this.$_effectGlyphs = [];
	};
	$AlphaTab_Rendering_EffectBarRenderer.__typeName = 'AlphaTab.Rendering.EffectBarRenderer';
	global.AlphaTab.Rendering.EffectBarRenderer = $AlphaTab_Rendering_EffectBarRenderer;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.EffectBarRendererFactory
	var $AlphaTab_Rendering_EffectBarRendererFactory = function(info) {
		this.$_info = null;
		$AlphaTab_Rendering_BarRendererFactory.call(this);
		this.$_info = info;
		this.set_isInAccolade(false);
		this.set_hideOnMultiTrack(info.get_hideOnMultiTrack());
	};
	$AlphaTab_Rendering_EffectBarRendererFactory.__typeName = 'AlphaTab.Rendering.EffectBarRendererFactory';
	global.AlphaTab.Rendering.EffectBarRendererFactory = $AlphaTab_Rendering_EffectBarRendererFactory;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.GroupedBarRenderer
	var $AlphaTab_Rendering_GroupedBarRenderer = function(bar) {
		this.$_preBeatGlyphs = null;
		this.$_voiceContainers = null;
		this.$_postBeatGlyphs = null;
		this.$_biggestVoiceContainer = null;
		$AlphaTab_Rendering_BarRendererBase.call(this, bar);
		this.$_preBeatGlyphs = [];
		this.$_voiceContainers = new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, $AlphaTab_Rendering_Glyphs_VoiceContainerGlyph]))();
		this.$_postBeatGlyphs = [];
	};
	$AlphaTab_Rendering_GroupedBarRenderer.__typeName = 'AlphaTab.Rendering.GroupedBarRenderer';
	global.AlphaTab.Rendering.GroupedBarRenderer = $AlphaTab_Rendering_GroupedBarRenderer;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.IEffectBarRendererInfo
	var $AlphaTab_Rendering_IEffectBarRendererInfo = function() {
	};
	$AlphaTab_Rendering_IEffectBarRendererInfo.__typeName = 'AlphaTab.Rendering.IEffectBarRendererInfo';
	global.AlphaTab.Rendering.IEffectBarRendererInfo = $AlphaTab_Rendering_IEffectBarRendererInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.RenderingResources
	var $AlphaTab_Rendering_RenderingResources = function(scale) {
		this.$1$CopyrightFontField = null;
		this.$1$TitleFontField = null;
		this.$1$SubTitleFontField = null;
		this.$1$WordsFontField = null;
		this.$1$EffectFontField = null;
		this.$1$TablatureFontField = null;
		this.$1$GraceFontField = null;
		this.$1$StaveLineColorField = null;
		this.$1$BarSeperatorColorField = null;
		this.$1$BarNumberFontField = null;
		this.$1$BarNumberColorField = null;
		this.$1$MarkerFontField = null;
		this.$1$TabClefFontField = null;
		this.$1$MainGlyphColorField = null;
		this.$1$ScaleField = 0;
		this.init(scale);
	};
	$AlphaTab_Rendering_RenderingResources.__typeName = 'AlphaTab.Rendering.RenderingResources';
	global.AlphaTab.Rendering.RenderingResources = $AlphaTab_Rendering_RenderingResources;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.RhythmBarRenderer
	var $AlphaTab_Rendering_RhythmBarRenderer = function(bar, direction) {
		this.$_direction = 0;
		this.$_helpers = null;
		$AlphaTab_Rendering_GroupedBarRenderer.call(this, bar);
		this.$_direction = direction;
	};
	$AlphaTab_Rendering_RhythmBarRenderer.__typeName = 'AlphaTab.Rendering.RhythmBarRenderer';
	$AlphaTab_Rendering_RhythmBarRenderer.$paintSingleBar = function(canvas, x1, y1, x2, y2, size) {
		canvas.beginPath();
		canvas.moveTo(x1, y1);
		canvas.lineTo(x2, y2);
		canvas.lineTo(x2, y2 - size);
		canvas.lineTo(x1, y1 - size);
		canvas.closePath();
		canvas.fill();
	};
	global.AlphaTab.Rendering.RhythmBarRenderer = $AlphaTab_Rendering_RhythmBarRenderer;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.RhythmBarRendererFactory
	var $AlphaTab_Rendering_RhythmBarRendererFactory = function(direction) {
		this.$_direction = 0;
		$AlphaTab_Rendering_BarRendererFactory.call(this);
		this.$_direction = direction;
		this.set_isInAccolade(false);
		this.set_hideOnMultiTrack(false);
	};
	$AlphaTab_Rendering_RhythmBarRendererFactory.__typeName = 'AlphaTab.Rendering.RhythmBarRendererFactory';
	global.AlphaTab.Rendering.RhythmBarRendererFactory = $AlphaTab_Rendering_RhythmBarRendererFactory;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.ScoreBarRenderer
	var $AlphaTab_Rendering_ScoreBarRenderer = function(bar) {
		this.$_helpers = null;
		this.$3$AccidentalHelperField = null;
		this.$_startSpacing = false;
		$AlphaTab_Rendering_GroupedBarRenderer.call(this, bar);
		this.set_accidentalHelper(new $AlphaTab_Rendering_Utils_AccidentalHelper());
	};
	$AlphaTab_Rendering_ScoreBarRenderer.__typeName = 'AlphaTab.Rendering.ScoreBarRenderer';
	$AlphaTab_Rendering_ScoreBarRenderer.$paintSingleBar = function(canvas, x1, y1, x2, y2, size) {
		canvas.beginPath();
		canvas.moveTo(x1, y1);
		canvas.lineTo(x2, y2);
		canvas.lineTo(x2, y2 - size);
		canvas.lineTo(x1, y1 - size);
		canvas.closePath();
		canvas.fill();
	};
	global.AlphaTab.Rendering.ScoreBarRenderer = $AlphaTab_Rendering_ScoreBarRenderer;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.ScoreBarRendererFactory
	var $AlphaTab_Rendering_ScoreBarRendererFactory = function() {
		$AlphaTab_Rendering_BarRendererFactory.call(this);
	};
	$AlphaTab_Rendering_ScoreBarRendererFactory.__typeName = 'AlphaTab.Rendering.ScoreBarRendererFactory';
	global.AlphaTab.Rendering.ScoreBarRendererFactory = $AlphaTab_Rendering_ScoreBarRendererFactory;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.ScoreBeatContainerGlyph
	var $AlphaTab_Rendering_ScoreBeatContainerGlyph = function(beat) {
		$AlphaTab_Rendering_Glyphs_BeatContainerGlyph.call(this, beat);
	};
	$AlphaTab_Rendering_ScoreBeatContainerGlyph.__typeName = 'AlphaTab.Rendering.ScoreBeatContainerGlyph';
	global.AlphaTab.Rendering.ScoreBeatContainerGlyph = $AlphaTab_Rendering_ScoreBeatContainerGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.ScoreRenderer
	var $AlphaTab_Rendering_ScoreRenderer = function(settings, param) {
		this.$_currentLayoutMode = null;
		this.$1$CanvasField = null;
		this.$1$ScoreField = null;
		this.$1$TracksField = null;
		this.$1$LayoutField = null;
		this.$1$RenderingResourcesField = null;
		this.$1$SettingsField = null;
		this.$1$RenderFinishedField = null;
		this.set_settings(settings);
		this.set_renderingResources(new $AlphaTab_Rendering_RenderingResources(1));
		if (ss.isNullOrUndefined(settings.get_engine()) || !$AlphaTab_Environment.renderEngines.containsKey(settings.get_engine())) {
			this.set_canvas($AlphaTab_Environment.renderEngines.get_item('default')(param));
		}
		else {
			this.set_canvas($AlphaTab_Environment.renderEngines.get_item(settings.get_engine())(param));
		}
		this.$recreateLayout();
	};
	$AlphaTab_Rendering_ScoreRenderer.__typeName = 'AlphaTab.Rendering.ScoreRenderer';
	global.AlphaTab.Rendering.ScoreRenderer = $AlphaTab_Rendering_ScoreRenderer;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.TabBarRenderer
	var $AlphaTab_Rendering_TabBarRenderer = function(bar) {
		this.$_helpers = null;
		$AlphaTab_Rendering_GroupedBarRenderer.call(this, bar);
	};
	$AlphaTab_Rendering_TabBarRenderer.__typeName = 'AlphaTab.Rendering.TabBarRenderer';
	global.AlphaTab.Rendering.TabBarRenderer = $AlphaTab_Rendering_TabBarRenderer;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.TabBarRendererFactory
	var $AlphaTab_Rendering_TabBarRendererFactory = function() {
		$AlphaTab_Rendering_BarRendererFactory.call(this);
	};
	$AlphaTab_Rendering_TabBarRendererFactory.__typeName = 'AlphaTab.Rendering.TabBarRendererFactory';
	global.AlphaTab.Rendering.TabBarRendererFactory = $AlphaTab_Rendering_TabBarRendererFactory;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.BeatVibratoEffectInfo
	var $AlphaTab_Rendering_Effects_BeatVibratoEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_BeatVibratoEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.BeatVibratoEffectInfo';
	global.AlphaTab.Rendering.Effects.BeatVibratoEffectInfo = $AlphaTab_Rendering_Effects_BeatVibratoEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.ChordsEffectInfo
	var $AlphaTab_Rendering_Effects_ChordsEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_ChordsEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.ChordsEffectInfo';
	global.AlphaTab.Rendering.Effects.ChordsEffectInfo = $AlphaTab_Rendering_Effects_ChordsEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.CrescendoEffectInfo
	var $AlphaTab_Rendering_Effects_CrescendoEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_CrescendoEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.CrescendoEffectInfo';
	global.AlphaTab.Rendering.Effects.CrescendoEffectInfo = $AlphaTab_Rendering_Effects_CrescendoEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.DummyEffectGlyph
	var $AlphaTab_Rendering_Effects_DummyEffectGlyph = function(x, y, s) {
		this.$_s = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_s = s;
	};
	$AlphaTab_Rendering_Effects_DummyEffectGlyph.__typeName = 'AlphaTab.Rendering.Effects.DummyEffectGlyph';
	global.AlphaTab.Rendering.Effects.DummyEffectGlyph = $AlphaTab_Rendering_Effects_DummyEffectGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.DynamicsEffectInfo
	var $AlphaTab_Rendering_Effects_DynamicsEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_DynamicsEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.DynamicsEffectInfo';
	global.AlphaTab.Rendering.Effects.DynamicsEffectInfo = $AlphaTab_Rendering_Effects_DynamicsEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.FadeInEffectInfo
	var $AlphaTab_Rendering_Effects_FadeInEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_FadeInEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.FadeInEffectInfo';
	global.AlphaTab.Rendering.Effects.FadeInEffectInfo = $AlphaTab_Rendering_Effects_FadeInEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.FingeringEffectInfo
	var $AlphaTab_Rendering_Effects_FingeringEffectInfo = function() {
		this.$_maxGlyphCount = 0;
		$AlphaTab_Rendering_Effects_NoteEffectInfoBase.call(this);
	};
	$AlphaTab_Rendering_Effects_FingeringEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.FingeringEffectInfo';
	global.AlphaTab.Rendering.Effects.FingeringEffectInfo = $AlphaTab_Rendering_Effects_FingeringEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.LetRingEffectInfo
	var $AlphaTab_Rendering_Effects_LetRingEffectInfo = function() {
		$AlphaTab_Rendering_Effects_NoteEffectInfoBase.call(this);
	};
	$AlphaTab_Rendering_Effects_LetRingEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.LetRingEffectInfo';
	global.AlphaTab.Rendering.Effects.LetRingEffectInfo = $AlphaTab_Rendering_Effects_LetRingEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.MarkerEffectInfo
	var $AlphaTab_Rendering_Effects_MarkerEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_MarkerEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.MarkerEffectInfo';
	global.AlphaTab.Rendering.Effects.MarkerEffectInfo = $AlphaTab_Rendering_Effects_MarkerEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.NoteEffectInfoBase
	var $AlphaTab_Rendering_Effects_NoteEffectInfoBase = function() {
		this.lastCreateInfo = null;
	};
	$AlphaTab_Rendering_Effects_NoteEffectInfoBase.__typeName = 'AlphaTab.Rendering.Effects.NoteEffectInfoBase';
	global.AlphaTab.Rendering.Effects.NoteEffectInfoBase = $AlphaTab_Rendering_Effects_NoteEffectInfoBase;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.NoteVibratoEffectInfo
	var $AlphaTab_Rendering_Effects_NoteVibratoEffectInfo = function() {
		$AlphaTab_Rendering_Effects_NoteEffectInfoBase.call(this);
	};
	$AlphaTab_Rendering_Effects_NoteVibratoEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.NoteVibratoEffectInfo';
	global.AlphaTab.Rendering.Effects.NoteVibratoEffectInfo = $AlphaTab_Rendering_Effects_NoteVibratoEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.PalmMuteEffectInfo
	var $AlphaTab_Rendering_Effects_PalmMuteEffectInfo = function() {
		$AlphaTab_Rendering_Effects_NoteEffectInfoBase.call(this);
	};
	$AlphaTab_Rendering_Effects_PalmMuteEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.PalmMuteEffectInfo';
	global.AlphaTab.Rendering.Effects.PalmMuteEffectInfo = $AlphaTab_Rendering_Effects_PalmMuteEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.PickStrokeEffectInfo
	var $AlphaTab_Rendering_Effects_PickStrokeEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_PickStrokeEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.PickStrokeEffectInfo';
	global.AlphaTab.Rendering.Effects.PickStrokeEffectInfo = $AlphaTab_Rendering_Effects_PickStrokeEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.TapEffectInfo
	var $AlphaTab_Rendering_Effects_TapEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_TapEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.TapEffectInfo';
	global.AlphaTab.Rendering.Effects.TapEffectInfo = $AlphaTab_Rendering_Effects_TapEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.TempoEffectInfo
	var $AlphaTab_Rendering_Effects_TempoEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_TempoEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.TempoEffectInfo';
	global.AlphaTab.Rendering.Effects.TempoEffectInfo = $AlphaTab_Rendering_Effects_TempoEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.TextEffectInfo
	var $AlphaTab_Rendering_Effects_TextEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_TextEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.TextEffectInfo';
	global.AlphaTab.Rendering.Effects.TextEffectInfo = $AlphaTab_Rendering_Effects_TextEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.TrillEffectInfo
	var $AlphaTab_Rendering_Effects_TrillEffectInfo = function() {
		$AlphaTab_Rendering_Effects_NoteEffectInfoBase.call(this);
	};
	$AlphaTab_Rendering_Effects_TrillEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.TrillEffectInfo';
	global.AlphaTab.Rendering.Effects.TrillEffectInfo = $AlphaTab_Rendering_Effects_TrillEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Effects.TripletFeelEffectInfo
	var $AlphaTab_Rendering_Effects_TripletFeelEffectInfo = function() {
	};
	$AlphaTab_Rendering_Effects_TripletFeelEffectInfo.__typeName = 'AlphaTab.Rendering.Effects.TripletFeelEffectInfo';
	global.AlphaTab.Rendering.Effects.TripletFeelEffectInfo = $AlphaTab_Rendering_Effects_TripletFeelEffectInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.AccentuationGlyph
	var $AlphaTab_Rendering_Glyphs_AccentuationGlyph = function(x, y, accentuation) {
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_AccentuationGlyph.$getSvg(accentuation), 1, 1);
	};
	$AlphaTab_Rendering_Glyphs_AccentuationGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.AccentuationGlyph';
	$AlphaTab_Rendering_Glyphs_AccentuationGlyph.$getSvg = function(accentuation) {
		switch (accentuation) {
			case 0: {
				return null;
			}
			case 1: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.accentuation;
			}
			case 2: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.heavyAccentuation;
			}
			default: {
				throw new ss.ArgumentOutOfRangeException('accentuation');
			}
		}
	};
	global.AlphaTab.Rendering.Glyphs.AccentuationGlyph = $AlphaTab_Rendering_Glyphs_AccentuationGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph
	var $AlphaTab_Rendering_Glyphs_AccidentalGroupGlyph = function() {
		$AlphaTab_Rendering_Glyphs_GlyphGroup.call(this, 0, 0, null);
	};
	$AlphaTab_Rendering_Glyphs_AccidentalGroupGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph';
	global.AlphaTab.Rendering.Glyphs.AccidentalGroupGlyph = $AlphaTab_Rendering_Glyphs_AccidentalGroupGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.BarNumberGlyph
	var $AlphaTab_Rendering_Glyphs_BarNumberGlyph = function(x, y, number, hidden) {
		this.$_number = 0;
		this.$_hidden = false;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_number = number;
		this.$_hidden = hidden;
	};
	$AlphaTab_Rendering_Glyphs_BarNumberGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.BarNumberGlyph';
	global.AlphaTab.Rendering.Glyphs.BarNumberGlyph = $AlphaTab_Rendering_Glyphs_BarNumberGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.BarSeperatorGlyph
	var $AlphaTab_Rendering_Glyphs_BarSeperatorGlyph = function(x, y, isLast) {
		this.$_isLast = false;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_isLast = isLast;
	};
	$AlphaTab_Rendering_Glyphs_BarSeperatorGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.BarSeperatorGlyph';
	global.AlphaTab.Rendering.Glyphs.BarSeperatorGlyph = $AlphaTab_Rendering_Glyphs_BarSeperatorGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.BeamGlyph
	var $AlphaTab_Rendering_Glyphs_BeamGlyph = function(x, y, duration, direction, isGrace) {
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_BeamGlyph.$getRestSvg(duration, isGrace), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), $AlphaTab_Rendering_Glyphs_BeamGlyph.$getSvgScale(direction, isGrace));
	};
	$AlphaTab_Rendering_Glyphs_BeamGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.BeamGlyph';
	$AlphaTab_Rendering_Glyphs_BeamGlyph.$getSvgScale = function(direction, isGrace) {
		var scale = (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1);
		if (direction === 0) {
			return 1 * scale;
		}
		return -1 * scale;
	};
	$AlphaTab_Rendering_Glyphs_BeamGlyph.$getRestSvg = function(duration, isGrace) {
		if (isGrace) {
			return $AlphaTab_Rendering_Glyphs_MusicFont.footerUpEighth;
		}
		switch (duration) {
			case 8: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.footerUpEighth;
			}
			case 16: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.footerUpSixteenth;
			}
			case 32: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.footerUpThirtySecond;
			}
			case 64: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.footerUpSixtyFourth;
			}
			default: {
				return null;
			}
		}
	};
	global.AlphaTab.Rendering.Glyphs.BeamGlyph = $AlphaTab_Rendering_Glyphs_BeamGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.BeatContainerGlyph
	var $AlphaTab_Rendering_Glyphs_BeatContainerGlyph = function(beat) {
		this.$2$BeatField = null;
		this.$2$PreNotesField = null;
		this.$2$OnNotesField = null;
		this.$2$PostNotesField = null;
		this.$2$TiesField = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, 0, 0);
		this.set_beat(beat);
		this.set_ties([]);
	};
	$AlphaTab_Rendering_Glyphs_BeatContainerGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.BeatContainerGlyph';
	global.AlphaTab.Rendering.Glyphs.BeatContainerGlyph = $AlphaTab_Rendering_Glyphs_BeatContainerGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.BeatGlyphBase
	var $AlphaTab_Rendering_Glyphs_BeatGlyphBase = function() {
		this.$3$ContainerField = null;
		$AlphaTab_Rendering_Glyphs_GlyphGroup.call(this, 0, 0, null);
	};
	$AlphaTab_Rendering_Glyphs_BeatGlyphBase.__typeName = 'AlphaTab.Rendering.Glyphs.BeatGlyphBase';
	global.AlphaTab.Rendering.Glyphs.BeatGlyphBase = $AlphaTab_Rendering_Glyphs_BeatGlyphBase;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.BendGlyph
	var $AlphaTab_Rendering_Glyphs_BendGlyph = function(n, width, height) {
		this.$_note = null;
		this.$_height = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, 0, 0);
		this.$_note = n;
		this.set_width(width);
		this.$_height = height;
	};
	$AlphaTab_Rendering_Glyphs_BendGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.BendGlyph';
	global.AlphaTab.Rendering.Glyphs.BendGlyph = $AlphaTab_Rendering_Glyphs_BendGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph
	var $AlphaTab_Rendering_Glyphs_ChineseCymbalGlyph = function(x, y, isGrace) {
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_MusicFont.noteHarmonic, (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
	};
	$AlphaTab_Rendering_Glyphs_ChineseCymbalGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph';
	global.AlphaTab.Rendering.Glyphs.ChineseCymbalGlyph = $AlphaTab_Rendering_Glyphs_ChineseCymbalGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.CircleGlyph
	var $AlphaTab_Rendering_Glyphs_CircleGlyph = function(x, y, size) {
		this.$_size = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_size = size;
	};
	$AlphaTab_Rendering_Glyphs_CircleGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.CircleGlyph';
	global.AlphaTab.Rendering.Glyphs.CircleGlyph = $AlphaTab_Rendering_Glyphs_CircleGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ClefGlyph
	var $AlphaTab_Rendering_Glyphs_ClefGlyph = function(x, y, clef) {
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_ClefGlyph.$getClefSvg(clef), 1, 1);
	};
	$AlphaTab_Rendering_Glyphs_ClefGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.ClefGlyph';
	$AlphaTab_Rendering_Glyphs_ClefGlyph.$getClefSvg = function(clef) {
		switch (clef) {
			case 0: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.clefNeutral;
			}
			case 1: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.clefC;
			}
			case 2: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.clefC;
			}
			case 3: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.clefF;
			}
			case 4: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.clefG;
			}
			default: {
				throw new ss.ArgumentOutOfRangeException('clef');
			}
		}
	};
	global.AlphaTab.Rendering.Glyphs.ClefGlyph = $AlphaTab_Rendering_Glyphs_ClefGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.CrescendoGlyph
	var $AlphaTab_Rendering_Glyphs_CrescendoGlyph = function(x, y, crescendo) {
		this.$_crescendo = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_crescendo = crescendo;
	};
	$AlphaTab_Rendering_Glyphs_CrescendoGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.CrescendoGlyph';
	global.AlphaTab.Rendering.Glyphs.CrescendoGlyph = $AlphaTab_Rendering_Glyphs_CrescendoGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph
	var $AlphaTab_Rendering_Glyphs_DeadNoteHeadGlyph = function(x, y, isGrace) {
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_MusicFont.noteDead, (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
	};
	$AlphaTab_Rendering_Glyphs_DeadNoteHeadGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph';
	global.AlphaTab.Rendering.Glyphs.DeadNoteHeadGlyph = $AlphaTab_Rendering_Glyphs_DeadNoteHeadGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph
	var $AlphaTab_Rendering_Glyphs_DiamondNoteHeadGlyph = function(x, y, isGrace) {
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_MusicFont.noteHarmonic, (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
	};
	$AlphaTab_Rendering_Glyphs_DiamondNoteHeadGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph';
	global.AlphaTab.Rendering.Glyphs.DiamondNoteHeadGlyph = $AlphaTab_Rendering_Glyphs_DiamondNoteHeadGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.DigitGlyph
	var $AlphaTab_Rendering_Glyphs_DigitGlyph = function(x, y, digit) {
		this.$_digit = 0;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_DigitGlyph.$getDigit(digit), 1, 1);
		this.$_digit = digit;
	};
	$AlphaTab_Rendering_Glyphs_DigitGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.DigitGlyph';
	$AlphaTab_Rendering_Glyphs_DigitGlyph.$getDigit = function(digit) {
		switch (digit) {
			case 0: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num0;
			}
			case 1: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num1;
			}
			case 2: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num2;
			}
			case 3: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num3;
			}
			case 4: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num4;
			}
			case 5: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num5;
			}
			case 6: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num6;
			}
			case 7: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num7;
			}
			case 8: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num8;
			}
			case 9: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.num9;
			}
			default: {
				return null;
			}
		}
	};
	global.AlphaTab.Rendering.Glyphs.DigitGlyph = $AlphaTab_Rendering_Glyphs_DigitGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.DrumSticksGlyph
	var $AlphaTab_Rendering_Glyphs_DrumSticksGlyph = function(x, y, isGrace) {
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_MusicFont.noteSideStick, (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
	};
	$AlphaTab_Rendering_Glyphs_DrumSticksGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.DrumSticksGlyph';
	global.AlphaTab.Rendering.Glyphs.DrumSticksGlyph = $AlphaTab_Rendering_Glyphs_DrumSticksGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.DynamicsGlyph
	var $AlphaTab_Rendering_Glyphs_DynamicsGlyph = function(x, y, dynamics) {
		this.$_dynamics = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_dynamics = dynamics;
	};
	$AlphaTab_Rendering_Glyphs_DynamicsGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.DynamicsGlyph';
	global.AlphaTab.Rendering.Glyphs.DynamicsGlyph = $AlphaTab_Rendering_Glyphs_DynamicsGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.FadeInGlyph
	var $AlphaTab_Rendering_Glyphs_FadeInGlyph = function(x, y) {
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
	};
	$AlphaTab_Rendering_Glyphs_FadeInGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.FadeInGlyph';
	global.AlphaTab.Rendering.Glyphs.FadeInGlyph = $AlphaTab_Rendering_Glyphs_FadeInGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.FlatGlyph
	var $AlphaTab_Rendering_Glyphs_FlatGlyph = function(x, y, isGrace) {
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_MusicFont.accidentalFlat, (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
	};
	$AlphaTab_Rendering_Glyphs_FlatGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.FlatGlyph';
	global.AlphaTab.Rendering.Glyphs.FlatGlyph = $AlphaTab_Rendering_Glyphs_FlatGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.Glyph
	var $AlphaTab_Rendering_Glyphs_Glyph = function(x, y) {
		this.$1$IndexField = 0;
		this.$1$XField = 0;
		this.$1$YField = 0;
		this.$1$WidthField = 0;
		this.$1$RendererField = null;
		this.set_x(x);
		this.set_y(y);
	};
	$AlphaTab_Rendering_Glyphs_Glyph.__typeName = 'AlphaTab.Rendering.Glyphs.Glyph';
	global.AlphaTab.Rendering.Glyphs.Glyph = $AlphaTab_Rendering_Glyphs_Glyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.GlyphGroup
	var $AlphaTab_Rendering_Glyphs_GlyphGroup = function(x, y, glyphs) {
		this.glyphs = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.glyphs = glyphs || [];
	};
	$AlphaTab_Rendering_Glyphs_GlyphGroup.__typeName = 'AlphaTab.Rendering.Glyphs.GlyphGroup';
	global.AlphaTab.Rendering.Glyphs.GlyphGroup = $AlphaTab_Rendering_Glyphs_GlyphGroup;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.HiHatGlyph
	var $AlphaTab_Rendering_Glyphs_HiHatGlyph = function(x, y, isGrace) {
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_MusicFont.noteHiHat, (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
	};
	$AlphaTab_Rendering_Glyphs_HiHatGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.HiHatGlyph';
	global.AlphaTab.Rendering.Glyphs.HiHatGlyph = $AlphaTab_Rendering_Glyphs_HiHatGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.IMultiBeatEffectGlyph
	var $AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph = function() {
	};
	$AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.IMultiBeatEffectGlyph';
	global.AlphaTab.Rendering.Glyphs.IMultiBeatEffectGlyph = $AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ISupportsFinalize
	var $AlphaTab_Rendering_Glyphs_ISupportsFinalize = function() {
	};
	$AlphaTab_Rendering_Glyphs_ISupportsFinalize.__typeName = 'AlphaTab.Rendering.Glyphs.ISupportsFinalize';
	global.AlphaTab.Rendering.Glyphs.ISupportsFinalize = $AlphaTab_Rendering_Glyphs_ISupportsFinalize;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.LazySvg
	var $AlphaTab_Rendering_Glyphs_LazySvg = function(raw) {
		this.$_raw = null;
		this.$_parsed = null;
		this.$_raw = raw;
	};
	$AlphaTab_Rendering_Glyphs_LazySvg.__typeName = 'AlphaTab.Rendering.Glyphs.LazySvg';
	global.AlphaTab.Rendering.Glyphs.LazySvg = $AlphaTab_Rendering_Glyphs_LazySvg;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.LineRangedGlyph
	var $AlphaTab_Rendering_Glyphs_LineRangedGlyph = function(x, y, label) {
		this.$_isExpanded = false;
		this.$_label = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_label = label;
	};
	$AlphaTab_Rendering_Glyphs_LineRangedGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.LineRangedGlyph';
	global.AlphaTab.Rendering.Glyphs.LineRangedGlyph = $AlphaTab_Rendering_Glyphs_LineRangedGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.MusicFont
	var $AlphaTab_Rendering_Glyphs_MusicFont = function() {
	};
	$AlphaTab_Rendering_Glyphs_MusicFont.__typeName = 'AlphaTab.Rendering.Glyphs.MusicFont';
	global.AlphaTab.Rendering.Glyphs.MusicFont = $AlphaTab_Rendering_Glyphs_MusicFont;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.NaturalizeGlyph
	var $AlphaTab_Rendering_Glyphs_NaturalizeGlyph = function(x, y, isGrace) {
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_MusicFont.accidentalNatural, (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
	};
	$AlphaTab_Rendering_Glyphs_NaturalizeGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.NaturalizeGlyph';
	global.AlphaTab.Rendering.Glyphs.NaturalizeGlyph = $AlphaTab_Rendering_Glyphs_NaturalizeGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.NoteHeadGlyph
	var $AlphaTab_Rendering_Glyphs_NoteHeadGlyph = function(x, y, duration, isGrace) {
		this.$_isGrace = false;
		this.$_duration = 0;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.$getNoteSvg(duration), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
		this.$_duration = duration;
	};
	$AlphaTab_Rendering_Glyphs_NoteHeadGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.NoteHeadGlyph';
	$AlphaTab_Rendering_Glyphs_NoteHeadGlyph.$getNoteSvg = function(duration) {
		switch (duration) {
			case 1: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.noteWhole;
			}
			case 2: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.noteHalf;
			}
			default: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.noteQuarter;
			}
		}
	};
	global.AlphaTab.Rendering.Glyphs.NoteHeadGlyph = $AlphaTab_Rendering_Glyphs_NoteHeadGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.NoteNumberGlyph
	var $AlphaTab_Rendering_Glyphs_NoteNumberGlyph = function(x, y, n, isGrace) {
		this.$_noteString = null;
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_isGrace = isGrace;
		this.$_isGrace = isGrace;
		if (!n.get_isTieDestination()) {
			this.$_noteString = (n.get_isDead() ? 'X' : n.get_fret().toString());
			if (n.get_isGhost()) {
				this.$_noteString = '(' + this.$_noteString + ')';
			}
		}
		else if (n.get_beat().get_index() === 0) {
			this.$_noteString = '(' + n.get_tieOrigin().get_fret() + ')';
		}
		else {
			this.$_noteString = '';
		}
	};
	$AlphaTab_Rendering_Glyphs_NoteNumberGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.NoteNumberGlyph';
	global.AlphaTab.Rendering.Glyphs.NoteNumberGlyph = $AlphaTab_Rendering_Glyphs_NoteNumberGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.NumberGlyph
	var $AlphaTab_Rendering_Glyphs_NumberGlyph = function(x, y, number) {
		this.$_number = 0;
		$AlphaTab_Rendering_Glyphs_GlyphGroup.call(this, x, y, null);
		this.$_number = number;
	};
	$AlphaTab_Rendering_Glyphs_NumberGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.NumberGlyph';
	global.AlphaTab.Rendering.Glyphs.NumberGlyph = $AlphaTab_Rendering_Glyphs_NumberGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.PickStrokeGlyph
	var $AlphaTab_Rendering_Glyphs_PickStrokeGlyph = function(x, y, pickStroke) {
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_PickStrokeGlyph.$getNoteSvg(pickStroke), 1, 1);
	};
	$AlphaTab_Rendering_Glyphs_PickStrokeGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.PickStrokeGlyph';
	$AlphaTab_Rendering_Glyphs_PickStrokeGlyph.$getNoteSvg = function(pickStroke) {
		switch (pickStroke) {
			case 1: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.pickStrokeUp;
			}
			case 2: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.pickStrokeDown;
			}
			default: {
				return null;
			}
		}
	};
	global.AlphaTab.Rendering.Glyphs.PickStrokeGlyph = $AlphaTab_Rendering_Glyphs_PickStrokeGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.RepeatCloseGlyph
	var $AlphaTab_Rendering_Glyphs_RepeatCloseGlyph = function(x, y) {
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
	};
	$AlphaTab_Rendering_Glyphs_RepeatCloseGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.RepeatCloseGlyph';
	global.AlphaTab.Rendering.Glyphs.RepeatCloseGlyph = $AlphaTab_Rendering_Glyphs_RepeatCloseGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.RepeatCountGlyph
	var $AlphaTab_Rendering_Glyphs_RepeatCountGlyph = function(x, y, count) {
		this.$_count = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_count = count;
	};
	$AlphaTab_Rendering_Glyphs_RepeatCountGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.RepeatCountGlyph';
	global.AlphaTab.Rendering.Glyphs.RepeatCountGlyph = $AlphaTab_Rendering_Glyphs_RepeatCountGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.RepeatOpenGlyph
	var $AlphaTab_Rendering_Glyphs_RepeatOpenGlyph = function(x, y, circleSize, dotOffset) {
		this.$_dotOffset = 0;
		this.$_circleSize = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_dotOffset = dotOffset;
		this.$_circleSize = circleSize;
	};
	$AlphaTab_Rendering_Glyphs_RepeatOpenGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.RepeatOpenGlyph';
	global.AlphaTab.Rendering.Glyphs.RepeatOpenGlyph = $AlphaTab_Rendering_Glyphs_RepeatOpenGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.RestGlyph
	var $AlphaTab_Rendering_Glyphs_RestGlyph = function(x, y, duration) {
		this.$_duration = 0;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_RestGlyph.$getRestSVg(duration), 1, 1);
		this.$_duration = duration;
	};
	$AlphaTab_Rendering_Glyphs_RestGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.RestGlyph';
	$AlphaTab_Rendering_Glyphs_RestGlyph.$getRestSVg = function(duration) {
		switch (duration) {
			case 1:
			case 2: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.restWhole;
			}
			case 4: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.restQuarter;
			}
			case 8: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.restEighth;
			}
			case 16: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.restSixteenth;
			}
			case 32: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.restThirtySecond;
			}
			case 64: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.restSixtyFourth;
			}
			default: {
				throw new ss.ArgumentOutOfRangeException('duration');
			}
		}
	};
	global.AlphaTab.Rendering.Glyphs.RestGlyph = $AlphaTab_Rendering_Glyphs_RestGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.RideCymbalGlyph
	var $AlphaTab_Rendering_Glyphs_RideCymbalGlyph = function(x, y, isGrace) {
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_MusicFont.noteRideCymbal, (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
	};
	$AlphaTab_Rendering_Glyphs_RideCymbalGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.RideCymbalGlyph';
	global.AlphaTab.Rendering.Glyphs.RideCymbalGlyph = $AlphaTab_Rendering_Glyphs_RideCymbalGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ScoreBeatGlyph
	var $AlphaTab_Rendering_Glyphs_ScoreBeatGlyph = function() {
		this.$4$NoteHeadsField = null;
		this.$4$RestGlyphField = null;
		this.$4$BeamingHelperField = null;
		$AlphaTab_Rendering_Glyphs_BeatGlyphBase.call(this);
	};
	$AlphaTab_Rendering_Glyphs_ScoreBeatGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.ScoreBeatGlyph';
	global.AlphaTab.Rendering.Glyphs.ScoreBeatGlyph = $AlphaTab_Rendering_Glyphs_ScoreBeatGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ScoreBeatPostNotesGlyph
	var $AlphaTab_Rendering_Glyphs_ScoreBeatPostNotesGlyph = function() {
		$AlphaTab_Rendering_Glyphs_BeatGlyphBase.call(this);
	};
	$AlphaTab_Rendering_Glyphs_ScoreBeatPostNotesGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.ScoreBeatPostNotesGlyph';
	global.AlphaTab.Rendering.Glyphs.ScoreBeatPostNotesGlyph = $AlphaTab_Rendering_Glyphs_ScoreBeatPostNotesGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph
	var $AlphaTab_Rendering_Glyphs_ScoreBeatPreNotesGlyph = function() {
		$AlphaTab_Rendering_Glyphs_BeatGlyphBase.call(this);
	};
	$AlphaTab_Rendering_Glyphs_ScoreBeatPreNotesGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph';
	global.AlphaTab.Rendering.Glyphs.ScoreBeatPreNotesGlyph = $AlphaTab_Rendering_Glyphs_ScoreBeatPreNotesGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ScoreBrushGlyph
	var $AlphaTab_Rendering_Glyphs_ScoreBrushGlyph = function(beat) {
		this.$_beat = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, 0, 0);
		this.$_beat = beat;
	};
	$AlphaTab_Rendering_Glyphs_ScoreBrushGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.ScoreBrushGlyph';
	global.AlphaTab.Rendering.Glyphs.ScoreBrushGlyph = $AlphaTab_Rendering_Glyphs_ScoreBrushGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph
	var $AlphaTab_Rendering_Glyphs_ScoreNoteChordGlyph = function() {
		this.$_infos = null;
		this.$_noteLookup = null;
		this.$_tremoloPicking = null;
		this.$2$MinNoteField = null;
		this.$2$MaxNoteField = null;
		this.$2$SpacingChangedField = null;
		this.$2$UpLineXField = 0;
		this.$2$DownLineXField = 0;
		this.$2$BeatEffectsField = null;
		this.$2$BeatField = null;
		this.$2$BeamingHelperField = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, 0, 0);
		this.$_infos = [];
		this.set_beatEffects(new (ss.makeGenericType(ss.Dictionary$2, [String, $AlphaTab_Rendering_Glyphs_Glyph]))());
		this.$_noteLookup = new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, $AlphaTab_Rendering_Glyphs_Glyph]))();
	};
	$AlphaTab_Rendering_Glyphs_ScoreNoteChordGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph';
	global.AlphaTab.Rendering.Glyphs.ScoreNoteChordGlyph = $AlphaTab_Rendering_Glyphs_ScoreNoteChordGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ScoreNoteGlyphInfo
	var $AlphaTab_Rendering_Glyphs_ScoreNoteGlyphInfo = function(glyph, line) {
		this.$1$GlyphField = null;
		this.$1$LineField = 0;
		this.set_glyph(glyph);
		this.set_line(line);
	};
	$AlphaTab_Rendering_Glyphs_ScoreNoteGlyphInfo.__typeName = 'AlphaTab.Rendering.Glyphs.ScoreNoteGlyphInfo';
	global.AlphaTab.Rendering.Glyphs.ScoreNoteGlyphInfo = $AlphaTab_Rendering_Glyphs_ScoreNoteGlyphInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph
	var $AlphaTab_Rendering_Glyphs_ScoreSlideLineGlyph = function(type, startNote, parent) {
		this.$_startNote = null;
		this.$_type = 0;
		this.$_parent = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, 0, 0);
		this.$_type = type;
		this.$_startNote = startNote;
		this.$_parent = parent;
	};
	$AlphaTab_Rendering_Glyphs_ScoreSlideLineGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph';
	global.AlphaTab.Rendering.Glyphs.ScoreSlideLineGlyph = $AlphaTab_Rendering_Glyphs_ScoreSlideLineGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.ScoreTieGlyph
	var $AlphaTab_Rendering_Glyphs_ScoreTieGlyph = function(startNote, endNote, parent) {
		$AlphaTab_Rendering_Glyphs_TieGlyph.call(this, startNote, endNote, parent);
	};
	$AlphaTab_Rendering_Glyphs_ScoreTieGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.ScoreTieGlyph';
	global.AlphaTab.Rendering.Glyphs.ScoreTieGlyph = $AlphaTab_Rendering_Glyphs_ScoreTieGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.SharpGlyph
	var $AlphaTab_Rendering_Glyphs_SharpGlyph = function(x, y, isGrace) {
		this.$_isGrace = false;
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_MusicFont.accidentalSharp, (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1), (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1));
		this.$_isGrace = isGrace;
	};
	$AlphaTab_Rendering_Glyphs_SharpGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.SharpGlyph';
	global.AlphaTab.Rendering.Glyphs.SharpGlyph = $AlphaTab_Rendering_Glyphs_SharpGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.SpacingGlyph
	var $AlphaTab_Rendering_Glyphs_SpacingGlyph = function(x, y, width, scaling) {
		this.$_scaling = false;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_scaling = scaling;
		this.set_width(width);
		this.$_scaling = scaling;
	};
	$AlphaTab_Rendering_Glyphs_SpacingGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.SpacingGlyph';
	global.AlphaTab.Rendering.Glyphs.SpacingGlyph = $AlphaTab_Rendering_Glyphs_SpacingGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.SvgCommand
	var $AlphaTab_Rendering_Glyphs_SvgCommand = function() {
		this.$1$CmdField = null;
		this.$1$NumbersField = null;
	};
	$AlphaTab_Rendering_Glyphs_SvgCommand.__typeName = 'AlphaTab.Rendering.Glyphs.SvgCommand';
	global.AlphaTab.Rendering.Glyphs.SvgCommand = $AlphaTab_Rendering_Glyphs_SvgCommand;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.SvgGlyph
	var $AlphaTab_Rendering_Glyphs_SvgGlyph = function(x, y, svg, xScale, yScale) {
		this.$_svg = null;
		this.$_lastCmd = null;
		this.$_currentX = 0;
		this.$_currentY = 0;
		this.$_xScale = 0;
		this.$_yScale = 0;
		this.$_xGlyphScale = 0;
		this.$_yGlyphScale = 0;
		this.$_lastControlX = 0;
		this.$_lastControlY = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_svg = svg;
		this.$_xGlyphScale = xScale * 0.00989999994635582;
		this.$_yGlyphScale = yScale * 0.00989999994635582;
	};
	$AlphaTab_Rendering_Glyphs_SvgGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.SvgGlyph';
	global.AlphaTab.Rendering.Glyphs.SvgGlyph = $AlphaTab_Rendering_Glyphs_SvgGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph
	var $AlphaTab_Rendering_Glyphs_TabBeatContainerGlyph = function(beat) {
		$AlphaTab_Rendering_Glyphs_BeatContainerGlyph.call(this, beat);
	};
	$AlphaTab_Rendering_Glyphs_TabBeatContainerGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph';
	global.AlphaTab.Rendering.Glyphs.TabBeatContainerGlyph = $AlphaTab_Rendering_Glyphs_TabBeatContainerGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TabBeatGlyph
	var $AlphaTab_Rendering_Glyphs_TabBeatGlyph = function() {
		this.$4$NoteNumbersField = null;
		this.$4$BeamingHelperField = null;
		$AlphaTab_Rendering_Glyphs_BeatGlyphBase.call(this);
	};
	$AlphaTab_Rendering_Glyphs_TabBeatGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TabBeatGlyph';
	global.AlphaTab.Rendering.Glyphs.TabBeatGlyph = $AlphaTab_Rendering_Glyphs_TabBeatGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TabBeatPostNotesGlyph
	var $AlphaTab_Rendering_Glyphs_TabBeatPostNotesGlyph = function() {
		$AlphaTab_Rendering_Glyphs_BeatGlyphBase.call(this);
	};
	$AlphaTab_Rendering_Glyphs_TabBeatPostNotesGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TabBeatPostNotesGlyph';
	global.AlphaTab.Rendering.Glyphs.TabBeatPostNotesGlyph = $AlphaTab_Rendering_Glyphs_TabBeatPostNotesGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph
	var $AlphaTab_Rendering_Glyphs_TabBeatPreNotesGlyph = function() {
		$AlphaTab_Rendering_Glyphs_BeatGlyphBase.call(this);
	};
	$AlphaTab_Rendering_Glyphs_TabBeatPreNotesGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph';
	global.AlphaTab.Rendering.Glyphs.TabBeatPreNotesGlyph = $AlphaTab_Rendering_Glyphs_TabBeatPreNotesGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TabBrushGlyph
	var $AlphaTab_Rendering_Glyphs_TabBrushGlyph = function(beat) {
		this.$_beat = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, 0, 0);
		this.$_beat = beat;
	};
	$AlphaTab_Rendering_Glyphs_TabBrushGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TabBrushGlyph';
	global.AlphaTab.Rendering.Glyphs.TabBrushGlyph = $AlphaTab_Rendering_Glyphs_TabBrushGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TabClefGlyph
	var $AlphaTab_Rendering_Glyphs_TabClefGlyph = function(x, y) {
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
	};
	$AlphaTab_Rendering_Glyphs_TabClefGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TabClefGlyph';
	global.AlphaTab.Rendering.Glyphs.TabClefGlyph = $AlphaTab_Rendering_Glyphs_TabClefGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TabNoteChordGlyph
	var $AlphaTab_Rendering_Glyphs_TabNoteChordGlyph = function(x, y, isGrace) {
		this.$_notes = null;
		this.$_noteLookup = null;
		this.$_minNote = null;
		this.$_isGrace = false;
		this.$_centerX = 0;
		this.$2$BeatField = null;
		this.$2$BeamingHelperField = null;
		this.$2$BeatEffectsField = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_isGrace = isGrace;
		this.$_notes = [];
		this.set_beatEffects(new (ss.makeGenericType(ss.Dictionary$2, [String, $AlphaTab_Rendering_Glyphs_Glyph]))());
		this.$_noteLookup = new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, $AlphaTab_Rendering_Glyphs_NoteNumberGlyph]))();
	};
	$AlphaTab_Rendering_Glyphs_TabNoteChordGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TabNoteChordGlyph';
	global.AlphaTab.Rendering.Glyphs.TabNoteChordGlyph = $AlphaTab_Rendering_Glyphs_TabNoteChordGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TabSlideLineGlyph
	var $AlphaTab_Rendering_Glyphs_TabSlideLineGlyph = function(type, startNote, parent) {
		this.$_startNote = null;
		this.$_type = 0;
		this.$_parent = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, 0, 0);
		this.$_type = type;
		this.$_startNote = startNote;
		this.$_parent = parent;
	};
	$AlphaTab_Rendering_Glyphs_TabSlideLineGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TabSlideLineGlyph';
	global.AlphaTab.Rendering.Glyphs.TabSlideLineGlyph = $AlphaTab_Rendering_Glyphs_TabSlideLineGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TabTieGlyph
	var $AlphaTab_Rendering_Glyphs_TabTieGlyph = function(startNote, endNote, parent) {
		$AlphaTab_Rendering_Glyphs_TieGlyph.call(this, startNote, endNote, parent);
	};
	$AlphaTab_Rendering_Glyphs_TabTieGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TabTieGlyph';
	global.AlphaTab.Rendering.Glyphs.TabTieGlyph = $AlphaTab_Rendering_Glyphs_TabTieGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TempoGlyph
	var $AlphaTab_Rendering_Glyphs_TempoGlyph = function(x, y, tempo) {
		this.$_tempo = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_tempo = tempo;
	};
	$AlphaTab_Rendering_Glyphs_TempoGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TempoGlyph';
	global.AlphaTab.Rendering.Glyphs.TempoGlyph = $AlphaTab_Rendering_Glyphs_TempoGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TextGlyph
	var $AlphaTab_Rendering_Glyphs_TextGlyph = function(x, y, text, font) {
		this.$_text = null;
		this.$_font = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_text = text;
		this.$_font = font;
	};
	$AlphaTab_Rendering_Glyphs_TextGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TextGlyph';
	global.AlphaTab.Rendering.Glyphs.TextGlyph = $AlphaTab_Rendering_Glyphs_TextGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TieGlyph
	var $AlphaTab_Rendering_Glyphs_TieGlyph = function(startNote, endNote, parent) {
		this.startNote = null;
		this.endNote = null;
		this.parent = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, 0, 0);
		this.startNote = startNote;
		this.endNote = endNote;
		this.parent = parent;
	};
	$AlphaTab_Rendering_Glyphs_TieGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TieGlyph';
	$AlphaTab_Rendering_Glyphs_TieGlyph.paintTie = function(canvas, scale, x1, y1, x2, y2, down) {
		// ensure endX > startX
		if (x2 > x1) {
			var t = x1;
			x1 = x2;
			x2 = t;
			t = y1;
			y1 = y2;
			y2 = t;
		}
		//
		// calculate control points 
		//
		var offset = 15 * scale;
		var size = 4 * scale;
		// normal vector
		var normalVectorX = y2 - y1;
		var normalVectorY = x2 - x1;
		var length = Math.sqrt(normalVectorX * normalVectorX + normalVectorY * normalVectorY);
		if (down) {
			normalVectorX *= -1;
		}
		else {
			normalVectorY *= -1;
		}
		// make to unit vector
		normalVectorX /= length;
		normalVectorY /= length;
		// center of connection
		var centerX = (x2 + x1) / 2;
		var centerY = (y2 + y1) / 2;
		// control points
		var cp1X = centerX + offset * normalVectorX;
		var cp1Y = centerY + offset * normalVectorY;
		var cp2X = centerX + (offset - size) * normalVectorX;
		var cp2Y = centerY + (offset - size) * normalVectorY;
		canvas.beginPath();
		canvas.moveTo(x1, y1);
		canvas.quadraticCurveTo(cp1X, cp1Y, x2, y2);
		canvas.quadraticCurveTo(cp2X, cp2Y, x1, y1);
		canvas.closePath();
	};
	global.AlphaTab.Rendering.Glyphs.TieGlyph = $AlphaTab_Rendering_Glyphs_TieGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TimeSignatureGlyph
	var $AlphaTab_Rendering_Glyphs_TimeSignatureGlyph = function(x, y, numerator, denominator) {
		this.$_numerator = 0;
		this.$_denominator = 0;
		$AlphaTab_Rendering_Glyphs_GlyphGroup.call(this, x, y, null);
		this.$_numerator = numerator;
		this.$_denominator = denominator;
	};
	$AlphaTab_Rendering_Glyphs_TimeSignatureGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TimeSignatureGlyph';
	global.AlphaTab.Rendering.Glyphs.TimeSignatureGlyph = $AlphaTab_Rendering_Glyphs_TimeSignatureGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TremoloPickingGlyph
	var $AlphaTab_Rendering_Glyphs_TremoloPickingGlyph = function(x, y, duration) {
		$AlphaTab_Rendering_Glyphs_SvgGlyph.call(this, x, y, $AlphaTab_Rendering_Glyphs_TremoloPickingGlyph.$getSvg(duration), 1, 1);
	};
	$AlphaTab_Rendering_Glyphs_TremoloPickingGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TremoloPickingGlyph';
	$AlphaTab_Rendering_Glyphs_TremoloPickingGlyph.$getSvg = function(duration) {
		switch (duration) {
			case 32: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.tremoloPickingThirtySecond;
			}
			case 16: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.tremoloPickingSixteenth;
			}
			case 8: {
				return $AlphaTab_Rendering_Glyphs_MusicFont.tremoloPickingEighth;
			}
			default: {
				return null;
			}
		}
	};
	global.AlphaTab.Rendering.Glyphs.TremoloPickingGlyph = $AlphaTab_Rendering_Glyphs_TremoloPickingGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.TrillGlyph
	var $AlphaTab_Rendering_Glyphs_TrillGlyph = function(x, y, scale) {
		this.$_scale = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_scale = scale;
	};
	$AlphaTab_Rendering_Glyphs_TrillGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.TrillGlyph';
	global.AlphaTab.Rendering.Glyphs.TrillGlyph = $AlphaTab_Rendering_Glyphs_TrillGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.VibratoGlyph
	var $AlphaTab_Rendering_Glyphs_VibratoGlyph = function(x, y, scale) {
		this.$_scale = 0;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, x, y);
		this.$_scale = scale;
	};
	$AlphaTab_Rendering_Glyphs_VibratoGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.VibratoGlyph';
	global.AlphaTab.Rendering.Glyphs.VibratoGlyph = $AlphaTab_Rendering_Glyphs_VibratoGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.VoiceContainerGlyph
	var $AlphaTab_Rendering_Glyphs_VoiceContainerGlyph = function(x, y, voiceIndex) {
		this.$3$BeatGlyphsField = null;
		this.$3$VoiceIndexField = 0;
		$AlphaTab_Rendering_Glyphs_GlyphGroup.call(this, x, y, null);
		this.set_beatGlyphs([]);
		this.set_voiceIndex(voiceIndex);
	};
	$AlphaTab_Rendering_Glyphs_VoiceContainerGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.VoiceContainerGlyph';
	global.AlphaTab.Rendering.Glyphs.VoiceContainerGlyph = $AlphaTab_Rendering_Glyphs_VoiceContainerGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Glyphs.WhammyBarGlyph
	var $AlphaTab_Rendering_Glyphs_WhammyBarGlyph = function(beat, parent) {
		this.$_beat = null;
		this.$_parent = null;
		$AlphaTab_Rendering_Glyphs_Glyph.call(this, 0, 0);
		this.$_beat = beat;
		this.$_parent = parent;
	};
	$AlphaTab_Rendering_Glyphs_WhammyBarGlyph.__typeName = 'AlphaTab.Rendering.Glyphs.WhammyBarGlyph';
	global.AlphaTab.Rendering.Glyphs.WhammyBarGlyph = $AlphaTab_Rendering_Glyphs_WhammyBarGlyph;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Layout.HeaderFooterElements
	var $AlphaTab_Rendering_Layout_HeaderFooterElements = function() {
	};
	$AlphaTab_Rendering_Layout_HeaderFooterElements.__typeName = 'AlphaTab.Rendering.Layout.HeaderFooterElements';
	global.AlphaTab.Rendering.Layout.HeaderFooterElements = $AlphaTab_Rendering_Layout_HeaderFooterElements;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Layout.HorizontalScreenLayout
	var $AlphaTab_Rendering_Layout_HorizontalScreenLayout = function(renderer) {
		this.$_group = null;
		$AlphaTab_Rendering_Layout_ScoreLayout.call(this, renderer);
	};
	$AlphaTab_Rendering_Layout_HorizontalScreenLayout.__typeName = 'AlphaTab.Rendering.Layout.HorizontalScreenLayout';
	global.AlphaTab.Rendering.Layout.HorizontalScreenLayout = $AlphaTab_Rendering_Layout_HorizontalScreenLayout;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Layout.PageViewLayout
	var $AlphaTab_Rendering_Layout_PageViewLayout = function(renderer) {
		this.$_groups = null;
		$AlphaTab_Rendering_Layout_ScoreLayout.call(this, renderer);
		this.$_groups = [];
	};
	$AlphaTab_Rendering_Layout_PageViewLayout.__typeName = 'AlphaTab.Rendering.Layout.PageViewLayout';
	global.AlphaTab.Rendering.Layout.PageViewLayout = $AlphaTab_Rendering_Layout_PageViewLayout;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Layout.ScoreLayout
	var $AlphaTab_Rendering_Layout_ScoreLayout = function(renderer) {
		this.$1$RendererField = null;
		this.$1$WidthField = 0;
		this.$1$HeightField = 0;
		this.set_renderer(renderer);
	};
	$AlphaTab_Rendering_Layout_ScoreLayout.__typeName = 'AlphaTab.Rendering.Layout.ScoreLayout';
	global.AlphaTab.Rendering.Layout.ScoreLayout = $AlphaTab_Rendering_Layout_ScoreLayout;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Staves.BarSizeInfo
	var $AlphaTab_Rendering_Staves_BarSizeInfo = function() {
		this.$1$FullWidthField = 0;
		this.$1$SizesField = null;
		this.$1$PreNoteSizesField = null;
		this.$1$OnNoteSizesField = null;
		this.$1$PostNoteSizesField = null;
		this.set_sizes(new (ss.makeGenericType(ss.Dictionary$2, [String, ss.Int32]))());
		this.set_preNoteSizes(new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, ss.Int32]))());
		this.set_onNoteSizes(new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, ss.Int32]))());
		this.set_postNoteSizes(new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, ss.Int32]))());
		this.set_fullWidth(0);
	};
	$AlphaTab_Rendering_Staves_BarSizeInfo.__typeName = 'AlphaTab.Rendering.Staves.BarSizeInfo';
	global.AlphaTab.Rendering.Staves.BarSizeInfo = $AlphaTab_Rendering_Staves_BarSizeInfo;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Staves.Stave
	var $AlphaTab_Rendering_Staves_Stave = function(factory) {
		this.$1$StaveTrackGroupField = null;
		this.$1$StaveGroupField = null;
		this.$_factory = null;
		this.$1$BarRenderersField = null;
		this.$1$XField = 0;
		this.$1$YField = 0;
		this.$1$HeightField = 0;
		this.$1$IndexField = 0;
		this.$1$StaveTopField = 0;
		this.$1$TopSpacingField = 0;
		this.$1$BottomSpacingField = 0;
		this.$1$StaveBottomField = 0;
		this.$1$IsFirstInAccoladeField = false;
		this.$1$IsLastInAccoladeField = false;
		this.set_barRenderers([]);
		this.$_factory = factory;
		this.set_topSpacing(10);
		this.set_bottomSpacing(10);
		this.set_staveTop(0);
		this.set_staveBottom(0);
	};
	$AlphaTab_Rendering_Staves_Stave.__typeName = 'AlphaTab.Rendering.Staves.Stave';
	global.AlphaTab.Rendering.Staves.Stave = $AlphaTab_Rendering_Staves_Stave;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Staves.StaveGroup
	var $AlphaTab_Rendering_Staves_StaveGroup = function() {
		this.$_firstStaveInAccolade = null;
		this.$_lastStaveInAccolade = null;
		this.$1$XField = 0;
		this.$1$YField = 0;
		this.$1$IndexField = 0;
		this.$_accoladeSpacingCalculated = false;
		this.$1$AccoladeSpacingField = 0;
		this.$1$IsFullField = false;
		this.$1$WidthField = 0;
		this.$1$MasterBarsField = null;
		this.$1$StavesField = null;
		this.$_allStaves = null;
		this.$1$LayoutField = null;
		this.$1$HelpersField = null;
		this.set_masterBars([]);
		this.set_staves([]);
		this.$_allStaves = [];
		this.set_width(0);
		this.set_index(0);
		this.$_accoladeSpacingCalculated = false;
		this.set_accoladeSpacing(0);
		this.set_helpers(new $AlphaTab_Rendering_Utils_BarHelpersGroup());
	};
	$AlphaTab_Rendering_Staves_StaveGroup.__typeName = 'AlphaTab.Rendering.Staves.StaveGroup';
	global.AlphaTab.Rendering.Staves.StaveGroup = $AlphaTab_Rendering_Staves_StaveGroup;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Staves.StaveTrackGroup
	var $AlphaTab_Rendering_Staves_StaveTrackGroup = function(staveGroup, track) {
		this.$1$TrackField = null;
		this.$1$StaveGroupField = null;
		this.$1$StavesField = null;
		this.$1$FirstStaveInAccoladeField = null;
		this.$1$LastStaveInAccoladeField = null;
		this.set_staveGroup(staveGroup);
		this.set_track(track);
		this.set_staves([]);
	};
	$AlphaTab_Rendering_Staves_StaveTrackGroup.__typeName = 'AlphaTab.Rendering.Staves.StaveTrackGroup';
	global.AlphaTab.Rendering.Staves.StaveTrackGroup = $AlphaTab_Rendering_Staves_StaveTrackGroup;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.AccidentalHelper
	var $AlphaTab_Rendering_Utils_AccidentalHelper = function() {
		this.$_registeredAccidentals = null;
		this.$_registeredAccidentals = new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, $AlphaTab_Model_AccidentalType]))();
	};
	$AlphaTab_Rendering_Utils_AccidentalHelper.__typeName = 'AlphaTab.Rendering.Utils.AccidentalHelper';
	global.AlphaTab.Rendering.Utils.AccidentalHelper = $AlphaTab_Rendering_Utils_AccidentalHelper;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.BarBoundings
	var $AlphaTab_Rendering_Utils_BarBoundings = function() {
		this.$1$IsFirstOfLineField = false;
		this.$1$IsLastOfLineField = false;
		this.$1$BarField = null;
		this.$1$BoundsField = null;
		this.$1$VisualBoundsField = null;
		this.$1$BeatsField = null;
		this.set_beats([]);
	};
	$AlphaTab_Rendering_Utils_BarBoundings.__typeName = 'AlphaTab.Rendering.Utils.BarBoundings';
	global.AlphaTab.Rendering.Utils.BarBoundings = $AlphaTab_Rendering_Utils_BarBoundings;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.BarHelpers
	var $AlphaTab_Rendering_Utils_BarHelpers = function(bar) {
		this.$1$BeamHelpersField = null;
		this.$1$BeamHelperLookupField = null;
		this.$1$TupletHelpersField = null;
		this.set_beamHelpers([]);
		this.set_beamHelperLookup([]);
		this.set_tupletHelpers([]);
		var currentBeamHelper = null;
		var currentTupletHelper = null;
		var $t1 = bar.get_voices();
		for (var $t2 = 0; $t2 < $t1.length; $t2++) {
			var v = $t1[$t2];
			ss.add(this.get_beamHelpers(), []);
			ss.add(this.get_beamHelperLookup(), new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, $AlphaTab_Rendering_Utils_BeamingHelper]))());
			ss.add(this.get_tupletHelpers(), []);
			var $t3 = v.get_beats();
			for (var $t4 = 0; $t4 < $t3.length; $t4++) {
				var b = $t3[$t4];
				var newBeamingHelper = false;
				if (!b.get_isRest()) {
					// try to fit beam to current beamhelper
					if (ss.isNullOrUndefined(currentBeamHelper) || !currentBeamHelper.checkBeat(b)) {
						// if not possible, create the next beaming helper
						currentBeamHelper = new $AlphaTab_Rendering_Utils_BeamingHelper(bar.get_track());
						currentBeamHelper.checkBeat(b);
						ss.add(this.get_beamHelpers()[v.get_index()], currentBeamHelper);
						newBeamingHelper = true;
					}
				}
				if (b.get_hasTuplet()) {
					// try to fit tuplet to current tuplethelper
					// TODO: register tuplet overflow
					var previousBeat = b.get_previousBeat();
					// don't group if the previous beat isn't in the same voice
					if (ss.isValue(previousBeat) && !ss.referenceEquals(previousBeat.get_voice(), b.get_voice())) {
						previousBeat = null;
					}
					// if a new beaming helper was started, we close our tuplet grouping as well
					if (newBeamingHelper && ss.isValue(currentTupletHelper)) {
						currentTupletHelper.finish();
					}
					if (ss.isNullOrUndefined(previousBeat) || ss.isNullOrUndefined(currentTupletHelper) || !currentTupletHelper.check(b)) {
						currentTupletHelper = new $AlphaTab_Rendering_Utils_TupletHelper(v.get_index());
						currentTupletHelper.check(b);
						ss.add(this.get_tupletHelpers()[v.get_index()], currentTupletHelper);
					}
				}
				this.get_beamHelperLookup()[v.get_index()].set_item(b.get_index(), currentBeamHelper);
			}
			currentBeamHelper = null;
			currentTupletHelper = null;
		}
	};
	$AlphaTab_Rendering_Utils_BarHelpers.__typeName = 'AlphaTab.Rendering.Utils.BarHelpers';
	global.AlphaTab.Rendering.Utils.BarHelpers = $AlphaTab_Rendering_Utils_BarHelpers;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.BarHelpersGroup
	var $AlphaTab_Rendering_Utils_BarHelpersGroup = function() {
		this.$1$HelpersField = null;
		this.set_helpers(new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, ss.makeGenericType(ss.Dictionary$2, [ss.Int32, $AlphaTab_Rendering_Utils_BarHelpers])]))());
	};
	$AlphaTab_Rendering_Utils_BarHelpersGroup.__typeName = 'AlphaTab.Rendering.Utils.BarHelpersGroup';
	global.AlphaTab.Rendering.Utils.BarHelpersGroup = $AlphaTab_Rendering_Utils_BarHelpersGroup;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.BeamBarType
	var $AlphaTab_Rendering_Utils_BeamBarType = function() {
	};
	$AlphaTab_Rendering_Utils_BeamBarType.__typeName = 'AlphaTab.Rendering.Utils.BeamBarType';
	global.AlphaTab.Rendering.Utils.BeamBarType = $AlphaTab_Rendering_Utils_BeamBarType;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.BeamDirection
	var $AlphaTab_Rendering_Utils_BeamDirection = function() {
	};
	$AlphaTab_Rendering_Utils_BeamDirection.__typeName = 'AlphaTab.Rendering.Utils.BeamDirection';
	global.AlphaTab.Rendering.Utils.BeamDirection = $AlphaTab_Rendering_Utils_BeamDirection;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.BeamingHelper
	var $AlphaTab_Rendering_Utils_BeamingHelper = function(track) {
		this.$_lastBeat = null;
		this.$_track = null;
		this.$_beatLineXPositions = null;
		this.$1$VoiceField = null;
		this.$1$BeatsField = null;
		this.$1$MaxDurationField = 0;
		this.$1$FirstMinNoteField = null;
		this.$1$FirstMaxNoteField = null;
		this.$1$LastMinNoteField = null;
		this.$1$LastMaxNoteField = null;
		this.$1$MinNoteField = null;
		this.$1$MaxNoteField = null;
		this.$_track = track;
		this.set_beats([]);
		this.$_beatLineXPositions = new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, $AlphaTab_Rendering_Utils_BeatLinePositions]))();
		this.set_maxDuration(1);
	};
	$AlphaTab_Rendering_Utils_BeamingHelper.__typeName = 'AlphaTab.Rendering.Utils.BeamingHelper';
	$AlphaTab_Rendering_Utils_BeamingHelper.$canJoin = function(b1, b2) {
		// is this a voice we can join with?
		if (ss.isNullOrUndefined(b1) || ss.isNullOrUndefined(b2) || b1.get_isRest() || b2.get_isRest()) {
			return false;
		}
		var m1 = b1.get_voice().get_bar();
		var m2 = b1.get_voice().get_bar();
		// only join on same measure
		if (!ss.referenceEquals(m1, m2)) {
			return false;
		}
		// get times of those voices and check if the times 
		// are in the same division
		var start1 = b1.get_start();
		var start2 = b2.get_start();
		// we can only join 8th, 16th, 32th and 64th voices
		if (!$AlphaTab_Rendering_Utils_BeamingHelper.$canJoinDuration(b1.get_duration()) || !$AlphaTab_Rendering_Utils_BeamingHelper.$canJoinDuration(b2.get_duration())) {
			return start1 === start2;
		}
		// TODO: create more rules for automatic beaming
		var divisionLength = $AlphaTab_Audio_MidiUtils.quarterTime;
		switch (m1.get_masterBar().get_timeSignatureDenominator()) {
			case 8: {
				if (m1.get_masterBar().get_timeSignatureNumerator() % 3 === 0) {
					divisionLength += 480;
				}
				break;
			}
		}
		// check if they are on the same division 
		var division1 = ss.Int32.div(divisionLength + start1, divisionLength);
		var division2 = ss.Int32.div(divisionLength + start2, divisionLength);
		return division1 === division2;
	};
	$AlphaTab_Rendering_Utils_BeamingHelper.$canJoinDuration = function(d) {
		switch (d) {
			case 1:
			case 2:
			case 4: {
				return false;
			}
			default: {
				return true;
			}
		}
	};
	global.AlphaTab.Rendering.Utils.BeamingHelper = $AlphaTab_Rendering_Utils_BeamingHelper;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.BeatBoundings
	var $AlphaTab_Rendering_Utils_BeatBoundings = function() {
		this.$1$BeatField = null;
		this.$1$BoundsField = null;
		this.$1$VisualBoundsField = null;
	};
	$AlphaTab_Rendering_Utils_BeatBoundings.__typeName = 'AlphaTab.Rendering.Utils.BeatBoundings';
	global.AlphaTab.Rendering.Utils.BeatBoundings = $AlphaTab_Rendering_Utils_BeatBoundings;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.BeatLinePositions
	var $AlphaTab_Rendering_Utils_BeatLinePositions = function(up, down) {
		this.$1$UpField = 0;
		this.$1$DownField = 0;
		this.set_up(up);
		this.set_down(down);
	};
	$AlphaTab_Rendering_Utils_BeatLinePositions.__typeName = 'AlphaTab.Rendering.Utils.BeatLinePositions';
	global.AlphaTab.Rendering.Utils.BeatLinePositions = $AlphaTab_Rendering_Utils_BeatLinePositions;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.BoundingsLookup
	var $AlphaTab_Rendering_Utils_BoundingsLookup = function() {
		this.$1$BarsField = null;
		this.set_bars([]);
	};
	$AlphaTab_Rendering_Utils_BoundingsLookup.__typeName = 'AlphaTab.Rendering.Utils.BoundingsLookup';
	global.AlphaTab.Rendering.Utils.BoundingsLookup = $AlphaTab_Rendering_Utils_BoundingsLookup;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.Bounds
	var $AlphaTab_Rendering_Utils_Bounds = function(x, y, w, h) {
		this.$1$XField = 0;
		this.$1$YField = 0;
		this.$1$WField = 0;
		this.$1$HField = 0;
		this.set_x(x);
		this.set_y(y);
		this.set_w(w);
		this.set_h(h);
	};
	$AlphaTab_Rendering_Utils_Bounds.__typeName = 'AlphaTab.Rendering.Utils.Bounds';
	global.AlphaTab.Rendering.Utils.Bounds = $AlphaTab_Rendering_Utils_Bounds;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.PercussionMapper
	var $AlphaTab_Rendering_Utils_PercussionMapper = function() {
	};
	$AlphaTab_Rendering_Utils_PercussionMapper.__typeName = 'AlphaTab.Rendering.Utils.PercussionMapper';
	$AlphaTab_Rendering_Utils_PercussionMapper.mapValue = function(note) {
		var value = note.get_realValue();
		if (value === 61 || value === 66) {
			return 50;
		}
		else if (value === 60 || value === 65) {
			return 52;
		}
		else if (value >= 35 && value <= 36 || value === 44) {
			return 53;
		}
		else if (value === 41 || value === 64) {
			return 55;
		}
		else if (value === 43 || value === 62) {
			return 57;
		}
		else if (value === 45 || value === 63) {
			return 59;
		}
		else if (value === 47 || value === 54) {
			return 62;
		}
		else if (value === 48 || value === 56) {
			return 64;
		}
		else if (value === 50) {
			return 65;
		}
		else if (value === 42 || value === 46 || value >= 49 && value <= 53 || value === 57 || value === 59) {
			return 67;
		}
		return 60;
	};
	global.AlphaTab.Rendering.Utils.PercussionMapper = $AlphaTab_Rendering_Utils_PercussionMapper;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.SvgPathParser
	var $AlphaTab_Rendering_Utils_SvgPathParser = function(svg) {
		this.$_currentIndex = 0;
		this.$1$SvgField = null;
		this.$1$LastCommandField = null;
		this.$1$CurrentTokenField = null;
		this.set_svg(svg);
	};
	$AlphaTab_Rendering_Utils_SvgPathParser.__typeName = 'AlphaTab.Rendering.Utils.SvgPathParser';
	$AlphaTab_Rendering_Utils_SvgPathParser.$isStringNumber = function(s, allowSign) {
		if (s.length === 0) {
			return false;
		}
		var c = s.charCodeAt(0);
		return $AlphaTab_Rendering_Utils_SvgPathParser.$isCharNumber(c, allowSign);
	};
	$AlphaTab_Rendering_Utils_SvgPathParser.$isCharNumber = function(c, allowSign) {
		return allowSign && c === 45 || c >= 48 && c <= 57;
	};
	$AlphaTab_Rendering_Utils_SvgPathParser.$isWhiteSpace = function(c) {
		return c === 32 || c === 9 || c === 13 || c === 10;
	};
	global.AlphaTab.Rendering.Utils.SvgPathParser = $AlphaTab_Rendering_Utils_SvgPathParser;
	////////////////////////////////////////////////////////////////////////////////
	// AlphaTab.Rendering.Utils.TupletHelper
	var $AlphaTab_Rendering_Utils_TupletHelper = function(voice) {
		this.$_isFinished = false;
		this.$1$BeatsField = null;
		this.$1$VoiceIndexField = 0;
		this.$1$TupletField = 0;
		this.set_voiceIndex(voice);
		this.set_beats([]);
	};
	$AlphaTab_Rendering_Utils_TupletHelper.__typeName = 'AlphaTab.Rendering.Utils.TupletHelper';
	global.AlphaTab.Rendering.Utils.TupletHelper = $AlphaTab_Rendering_Utils_TupletHelper;
	ss.initClass($AlphaTab_Environment, $asm, {});
	ss.initClass($AlphaTab_LayoutSettings, $asm, {
		get_mode: function() {
			return this.$1$ModeField;
		},
		set_mode: function(value) {
			this.$1$ModeField = value;
		},
		get: function(T) {
			return function(key, def) {
				if (this.additionalSettings.containsKey(key)) {
					return this.additionalSettings.get_item(key);
				}
				return def;
			};
		}
	});
	ss.initClass($AlphaTab_Settings, $asm, {
		get_scale: function() {
			return this.$1$ScaleField;
		},
		set_scale: function(value) {
			this.$1$ScaleField = value;
		},
		get_width: function() {
			return this.$1$WidthField;
		},
		set_width: function(value) {
			this.$1$WidthField = value;
		},
		get_height: function() {
			return this.$1$HeightField;
		},
		set_height: function(value) {
			this.$1$HeightField = value;
		},
		get_engine: function() {
			return this.$1$EngineField;
		},
		set_engine: function(value) {
			this.$1$EngineField = value;
		},
		get_layout: function() {
			return this.$1$LayoutField;
		},
		set_layout: function(value) {
			this.$1$LayoutField = value;
		},
		get_staves: function() {
			return this.$1$StavesField;
		},
		set_staves: function(value) {
			this.$1$StavesField = value;
		}
	});
	ss.initClass($AlphaTab_StaveSettings, $asm, {});
	ss.initClass($AlphaTab_Audio_GeneralMidi, $asm, {});
	ss.initClass($AlphaTab_Audio_MidiUtils, $asm, {});
	ss.initInterface($AlphaTab_Audio_Generator_IMidiFileHandler, $asm, { addTimeSignature: null, addRest: null, addNote: null, addControlChange: null, addProgramChange: null, addTempo: null, addBend: null, addMetronome: null });
	ss.initClass($AlphaTab_Audio_Generator_MidiFileGenerator, $asm, {
		get_generateMetronome: function() {
			return this.$1$GenerateMetronomeField;
		},
		set_generateMetronome: function(value) {
			this.$1$GenerateMetronomeField = value;
		},
		generate: function() {
			// initialize tracks
			var $t1 = this.$_score.get_tracks();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var track = $t1[$t2];
				this.$generateTrack(track);
			}
			var controller = new $AlphaTab_Audio_Generator_MidiPlaybackController(this.$_score);
			var previousMasterBar = null;
			// store the previous played bar for repeats
			while (!controller.get_finished()) {
				var index = controller.get_index();
				controller.process();
				if (controller.get_shouldPlay()) {
					this.$generateMasterBar(this.$_score.get_masterBars()[index], previousMasterBar, controller.get_repeatMove());
					var $t3 = this.$_score.get_tracks();
					for (var $t4 = 0; $t4 < $t3.length; $t4++) {
						var track1 = $t3[$t4];
						this.generateBar(track1.get_bars()[index], controller.get_repeatMove());
					}
				}
				previousMasterBar = this.$_score.get_masterBars()[index];
			}
		},
		$generateTrack: function(track) {
			// channel
			this.$generateChannel(track, track.get_playbackInfo().get_primaryChannel(), track.get_playbackInfo());
			if (track.get_playbackInfo().get_primaryChannel() !== track.get_playbackInfo().get_secondaryChannel()) {
				this.$generateChannel(track, track.get_playbackInfo().get_secondaryChannel(), track.get_playbackInfo());
			}
		},
		$generateChannel: function(track, channel, playbackInfo) {
			var volume = $AlphaTab_Audio_Generator_MidiFileGenerator.$toChannelShort(playbackInfo.get_volume());
			var balance = $AlphaTab_Audio_Generator_MidiFileGenerator.$toChannelShort(playbackInfo.get_balance());
			this.$_handler.addControlChange(track.get_index(), 0, channel, 7, volume);
			this.$_handler.addControlChange(track.get_index(), 0, channel, 10, balance);
			this.$_handler.addControlChange(track.get_index(), 0, channel, 11, 127);
			this.$_handler.addProgramChange(track.get_index(), 0, channel, playbackInfo.get_program());
		},
		$generateMasterBar: function(masterBar, previousMasterBar, startMove) {
			// time signature
			if (ss.isNullOrUndefined(previousMasterBar) || previousMasterBar.get_timeSignatureDenominator() !== masterBar.get_timeSignatureDenominator() || previousMasterBar.get_timeSignatureNumerator() !== masterBar.get_timeSignatureNumerator()) {
				this.$_handler.addTimeSignature(masterBar.get_start() + startMove, masterBar.get_timeSignatureNumerator(), masterBar.get_timeSignatureDenominator());
			}
			// tempo
			if (ss.isNullOrUndefined(previousMasterBar)) {
				this.$_handler.addTempo(masterBar.get_start() + startMove, masterBar.get_score().get_tempo());
				this.$_currentTempo = masterBar.get_score().get_tempo();
			}
			else if (ss.isValue(masterBar.get_tempoAutomation())) {
				this.$_handler.addTempo(masterBar.get_start() + startMove, ss.Int32.trunc(masterBar.get_tempoAutomation().get_value()));
				this.$_currentTempo = ss.Int32.trunc(masterBar.get_tempoAutomation().get_value());
			}
			// metronome
			if (this.get_generateMetronome()) {
				var start = masterBar.get_start() + startMove;
				var length = $AlphaTab_Audio_MidiUtils.valueToTicks(masterBar.get_timeSignatureDenominator());
				for (var i = 0; i < masterBar.get_timeSignatureNumerator(); i++) {
					this.$_handler.addMetronome(start, length);
					start += length;
				}
			}
		},
		generateBar: function(bar, startMove) {
			var $t1 = bar.get_voices();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var voice = $t1[$t2];
				this.$generateVoice(voice, startMove);
			}
		},
		$generateVoice: function(voice, startMove) {
			var $t1 = voice.get_beats();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var beat = $t1[$t2];
				this.$generateBeat(beat, startMove);
			}
		},
		$generateBeat: function(beat, startMove) {
			// TODO: take care of tripletfeel 
			var start = beat.get_start();
			var duration = beat.calculateDuration();
			var track = beat.get_voice().get_bar().get_track();
			var $t1 = beat.get_automations();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var automation = $t1[$t2];
				this.$generateAutomation(beat, automation, startMove);
			}
			if (beat.get_isRest()) {
				this.$_handler.addRest(track.get_index(), start + startMove, track.get_playbackInfo().get_primaryChannel());
			}
			else {
				var brushInfo = this.$getBrushInfo(beat);
				var $t3 = beat.get_notes();
				for (var $t4 = 0; $t4 < $t3.length; $t4++) {
					var n = $t3[$t4];
					if (n.get_isTieDestination()) {
						continue;
					}
					this.$generateNote(n, start, duration, startMove, brushInfo);
				}
			}
		},
		$generateNote: function(note, beatStart, beatDuration, startMove, brushInfo) {
			var track = note.get_beat().get_voice().get_bar().get_track();
			var noteKey = track.get_capo() + note.get_realValue();
			var noteStart = beatStart + startMove + brushInfo[note.get_string() - 1];
			var noteDuration = this.$getNoteDuration(note, beatDuration) - brushInfo[note.get_string() - 1];
			var dynamicValue = this.$getDynamicValue(note);
			// 
			// Fade in
			if (note.get_beat().get_fadeIn()) {
				this.$generateFadeIn(note, noteStart, noteDuration, noteKey, dynamicValue);
			}
			// TODO: grace notes?
			//
			// Trill
			if (note.get_isTrill() && !track.get_isPercussion()) {
				this.$generateTrill(note, noteStart, noteDuration, noteKey, dynamicValue);
				// no further generation needed
				return;
			}
			//
			// Tremolo Picking
			if (note.get_beat().get_isTremolo()) {
				this.$generateTremoloPicking(note, noteStart, noteDuration, noteKey, dynamicValue);
				// no further generation needed
				return;
			}
			//
			// All String Bending/Variation effects
			if (note.get_hasBend()) {
				this.$generateBend(note, noteStart, noteDuration, noteKey, dynamicValue);
			}
			else if (note.get_beat().get_hasWhammyBar()) {
				this.$generateWhammyBar(note, noteStart, noteDuration, noteKey, dynamicValue);
			}
			else if (note.get_slideType() !== 0) {
				this.$generateSlide(note, noteStart, noteDuration, noteKey, dynamicValue);
			}
			else if (note.get_vibrato() !== 0) {
				this.$generateVibrato(note, noteStart, noteDuration, noteKey, dynamicValue);
			}
			//
			// Harmonics
			if (note.get_harmonicType() !== 0) {
				this.$generateHarmonic(note, noteStart, noteDuration, noteKey, dynamicValue);
			}
			this.$_handler.addNote(track.get_index(), noteStart, noteDuration, noteKey, dynamicValue, track.get_playbackInfo().get_primaryChannel());
		},
		$getNoteDuration: function(note, beatDuration) {
			return this.$applyDurationEffects(note, beatDuration);
			// a bit buggy:
			//
			//            var lastNoteEnd = note.beat.start - note.beat.calculateDuration();
			//
			//            var noteDuration = beatDuration;
			//
			//            var currentBeat = note.beat.nextBeat;
			//
			//            
			//
			//            var letRingSuspend = false;
			//
			//            
			//
			//            // find the real note duration (let ring)
			//
			//            while (currentBeat != null)
			//
			//            {
			//
			//            if (currentBeat.isRest())
			//
			//            {
			//
			//            return applyDurationEffects(note, noteDuration);
			//
			//            }
			//
			//            
			//
			//            var letRing = currentBeat.voice == note.beat.voice && note.isLetRing;
			//
			//            var letRingApplied = false;
			//
			//            
			//
			//            // we look for a note which still has let ring on or is a tie destination
			//
			//            // in this case we increate the first played note
			//
			//            var noteOnSameString = currentBeat.getNoteOnString(note.string);
			//
			//            if (noteOnSameString != null)
			//
			//            {
			//
			//            // quit letring?
			//
			//            if (!noteOnSameString.isTieDestination)
			//
			//            {
			//
			//            letRing = false;
			//
			//            letRingSuspend = true;
			//
			//            
			//
			//            // no let ring anymore, we are done
			//
			//            if (!noteOnSameString.isLetRing)
			//
			//            {
			//
			//            return applyDurationEffects(note, noteDuration);
			//
			//            }
			//
			//            }
			//
			//            
			//
			//            // increase duration
			//
			//            letRingApplied = true;
			//
			//            noteDuration += (currentBeat.start - lastNoteEnd) + noteOnSameString.beat.calculateDuration();
			//
			//            lastNoteEnd = currentBeat.start + currentBeat.calculateDuration();
			//
			//            }
			//
			//            
			//
			//            // if letRing is still active? (no note on the same string found)
			//
			//            // and we didn't apply it already and of course it's not already stopped
			//
			//            // then we increase our duration as well
			//
			//            if (letRing && !letRingApplied && !letRingSuspend)
			//
			//            {
			//
			//            noteDuration += (currentBeat.start - lastNoteEnd) + currentBeat.calculateDuration();
			//
			//            lastNoteEnd = currentBeat.start + currentBeat.calculateDuration();
			//
			//            }
			//
			//            
			//
			//            
			//
			//            currentBeat = currentBeat.nextBeat;
			//
			//            }
			//
			//            
			//
			//            return applyDurationEffects(note, noteDuration);
		},
		$applyDurationEffects: function(note, duration) {
			if (note.get_isDead()) {
				return this.$applyStaticDuration($AlphaTab_Audio_Generator_MidiFileHandler.defaultDurationDead, duration);
			}
			if (note.get_isPalmMute()) {
				return this.$applyStaticDuration($AlphaTab_Audio_Generator_MidiFileHandler.defaultDurationPalmMute, duration);
			}
			if (note.get_isStaccato()) {
				return ss.Int32.div(duration, 2);
			}
			return duration;
		},
		$applyStaticDuration: function(duration, maximum) {
			var value = ss.Int32.div(this.$_currentTempo * duration, 60);
			return Math.min(value, maximum);
		},
		$getDynamicValue: function(note) {
			var dynamicValue = note.get_dynamic();
			// more silent on hammer destination
			if (!note.get_beat().get_voice().get_bar().get_track().get_isPercussion() && note.get_isHammerPullDestination()) {
				dynamicValue--;
			}
			// more silent on ghost notes
			if (note.get_isGhost()) {
				dynamicValue--;
			}
			// louder on accent
			switch (note.get_accentuated()) {
				case 1: {
					dynamicValue++;
					break;
				}
				case 2: {
					dynamicValue += 2;
					break;
				}
			}
			return dynamicValue;
		},
		$generateFadeIn: function(note, noteStart, noteDuration, noteKey, dynamicValue) {
			// TODO
		},
		$generateHarmonic: function(note, noteStart, noteDuration, noteKey, dynamicValue) {
			// TODO
		},
		$generateVibrato: function(note, noteStart, noteDuration, noteKey, dynamicValue) {
			// TODO 
		},
		$generateSlide: function(note, noteStart, noteDuration, noteKey, dynamicValue) {
			// TODO 
		},
		$generateWhammyBar: function(note, noteStart, noteDuration, noteKey, dynamicValue) {
			// TODO 
		},
		$generateBend: function(note, noteStart, noteDuration, noteKey, dynamicValue) {
			// TODO 
		},
		$generateTrill: function(note, noteStart, noteDuration, noteKey, dynamicValue) {
			var track = note.get_beat().get_voice().get_bar().get_track();
			var trillKey = track.get_capo() + note.get_stringTuning() + note.get_trillFret();
			var trillLength = $AlphaTab_Audio_MidiUtils.toTicks(note.get_trillSpeed());
			var realKey = true;
			var tick = noteStart;
			while (tick + 10 < noteStart + noteDuration) {
				// only the rest on last trill play
				if (tick + trillLength >= noteStart + noteDuration) {
					trillLength = noteStart + noteDuration - tick;
				}
				this.$_handler.addNote(track.get_index(), tick, trillLength, (realKey ? trillKey : noteKey), dynamicValue, track.get_playbackInfo().get_primaryChannel());
				realKey = !realKey;
				tick += trillLength;
			}
		},
		$generateTremoloPicking: function(note, noteStart, noteDuration, noteKey, dynamicValue) {
			var track = note.get_beat().get_voice().get_bar().get_track();
			var tpLength = $AlphaTab_Audio_MidiUtils.toTicks(note.get_beat().get_tremoloSpeed().get_value());
			var tick = noteStart;
			while (tick + 10 < noteStart + noteDuration) {
				// only the rest on last trill play
				if (tick + tpLength >= noteStart + noteDuration) {
					tpLength = noteStart + noteDuration - tick;
				}
				this.$_handler.addNote(track.get_index(), tick, tpLength, noteKey, dynamicValue, track.get_playbackInfo().get_primaryChannel());
				tick += tpLength;
			}
		},
		$getBrushInfo: function(beat) {
			var brushInfo = new Array(beat.get_voice().get_bar().get_track().get_tuning().length);
			if (beat.get_brushType() !== 0) {
				// 
				// calculate the number of  
				// a mask where the single bits indicate the strings used
				var stringUsed = 0;
				var $t1 = beat.get_notes();
				for (var $t2 = 0; $t2 < $t1.length; $t2++) {
					var n = $t1[$t2];
					if (n.get_isTieDestination()) {
						continue;
					}
					stringUsed |= 1 << n.get_string() - 1;
				}
				//
				// calculate time offset for all strings
				if (beat.get_notes().length > 0) {
					var brushMove = 0;
					var brushIncrement = this.$getBrushIncrement(beat);
					for (var i = 0; i < beat.get_voice().get_bar().get_track().get_tuning().length; i++) {
						var index = ((beat.get_brushType() === 4 || beat.get_brushType() === 2) ? i : (brushInfo.length - 1 - i));
						if ((stringUsed & 1 << index) !== 0) {
							brushInfo[index] = brushMove;
							brushMove = brushIncrement;
						}
					}
				}
			}
			return brushInfo;
		},
		$getBrushIncrement: function(beat) {
			if (beat.get_brushDuration() === 0) {
				return 0;
			}
			var duration = beat.calculateDuration();
			if (duration === 0) {
				return 0;
			}
			return ss.Int32.trunc(duration / 8 * (4 / beat.get_brushDuration()));
		},
		$generateAutomation: function(beat, automation, startMove) {
			switch (automation.get_type()) {
				case 2: {
					this.$_handler.addProgramChange(beat.get_voice().get_bar().get_track().get_index(), beat.get_start() + startMove, beat.get_voice().get_bar().get_track().get_playbackInfo().get_primaryChannel(), ss.Int32.trunc(automation.get_value()));
					this.$_handler.addProgramChange(beat.get_voice().get_bar().get_track().get_index(), beat.get_start() + startMove, beat.get_voice().get_bar().get_track().get_playbackInfo().get_secondaryChannel(), ss.Int32.trunc(automation.get_value()));
					break;
				}
				case 3: {
					this.$_handler.addControlChange(beat.get_voice().get_bar().get_track().get_index(), beat.get_start() + startMove, beat.get_voice().get_bar().get_track().get_playbackInfo().get_primaryChannel(), 10, ss.Int32.trunc(automation.get_value()));
					this.$_handler.addControlChange(beat.get_voice().get_bar().get_track().get_index(), beat.get_start() + startMove, beat.get_voice().get_bar().get_track().get_playbackInfo().get_secondaryChannel(), 10, ss.Int32.trunc(automation.get_value()));
					break;
				}
				case 1: {
					this.$_handler.addControlChange(beat.get_voice().get_bar().get_track().get_index(), beat.get_start() + startMove, beat.get_voice().get_bar().get_track().get_playbackInfo().get_primaryChannel(), 7, ss.Int32.trunc(automation.get_value()));
					this.$_handler.addControlChange(beat.get_voice().get_bar().get_track().get_index(), beat.get_start() + startMove, beat.get_voice().get_bar().get_track().get_playbackInfo().get_secondaryChannel(), 7, ss.Int32.trunc(automation.get_value()));
					break;
				}
			}
		}
	});
	ss.initClass($AlphaTab_Audio_Generator_MidiFileHandler, $asm, {
		$addEvent: function(track, tick, message) {
			this.$_midiFile.get_tracks()[track].addEvent(new $AlphaTab_Audio_Model_MidiEvent(tick, message));
		},
		$makeCommand: function(command, channel) {
			return command & 240 | channel & 15;
		},
		addTimeSignature: function(tick, timeSignatureNumerator, timeSignatureDenominator) {
			var denominatorIndex = 0;
			while ((timeSignatureDenominator = timeSignatureDenominator >> 1) > 0) {
				denominatorIndex++;
			}
			this.$addEvent(this.$_midiFile.get_infoTrack(), tick, $AlphaTab_Audio_Generator_MidiFileHandler.$buildMetaMessage(88, [timeSignatureNumerator & 255, denominatorIndex & 255, 48, 8]));
		},
		addRest: function(track, tick, channel) {
			this.$addEvent(track, tick, $AlphaTab_Audio_Generator_MidiFileHandler.$buildSysExMessage([0]));
		},
		addNote: function(track, start, length, key, dynamicValue, channel) {
			var velocity = $AlphaTab_Audio_MidiUtils.dynamicToVelocity(dynamicValue);
			this.$addEvent(track, start, new $AlphaTab_Audio_Model_MidiMessage(new $AlphaTab_IO_ByteArray([this.$makeCommand(144, channel), $AlphaTab_Audio_Generator_MidiFileHandler.$fixValue(key), $AlphaTab_Audio_Generator_MidiFileHandler.$fixValue(velocity)])));
			this.$addEvent(track, start + length, new $AlphaTab_Audio_Model_MidiMessage(new $AlphaTab_IO_ByteArray([this.$makeCommand(128, channel), $AlphaTab_Audio_Generator_MidiFileHandler.$fixValue(key), $AlphaTab_Audio_Generator_MidiFileHandler.$fixValue(velocity)])));
		},
		addControlChange: function(track, tick, channel, controller, value) {
			this.$addEvent(track, tick, new $AlphaTab_Audio_Model_MidiMessage(new $AlphaTab_IO_ByteArray([this.$makeCommand(176, channel), $AlphaTab_Audio_Generator_MidiFileHandler.$fixValue(controller), $AlphaTab_Audio_Generator_MidiFileHandler.$fixValue(value)])));
		},
		addProgramChange: function(track, tick, channel, program) {
			this.$addEvent(track, tick, new $AlphaTab_Audio_Model_MidiMessage(new $AlphaTab_IO_ByteArray([this.$makeCommand(192, channel), $AlphaTab_Audio_Generator_MidiFileHandler.$fixValue(program)])));
		},
		addTempo: function(tick, tempo) {
			// bpm -> microsecond per quarter note
			var tempoInUsq = ss.Int32.div(60000000, tempo);
			this.$addEvent(this.$_midiFile.get_infoTrack(), tick, $AlphaTab_Audio_Generator_MidiFileHandler.$buildMetaMessage(81, [tempoInUsq >> 16 & 255, tempoInUsq >> 8 & 255, tempoInUsq & 255]));
		},
		addBend: function(track, tick, channel, value) {
			this.$addEvent(track, tick, new $AlphaTab_Audio_Model_MidiMessage(new $AlphaTab_IO_ByteArray([this.$makeCommand(224, channel), 0, $AlphaTab_Audio_Generator_MidiFileHandler.$fixValue(value)])));
		},
		addMetronome: function(start, length) {
			if (this.$_metronomeTrack === -1) {
				this.$_midiFile.createTrack();
				this.$_metronomeTrack = this.$_midiFile.get_tracks().length - 1;
			}
			this.addNote(this.$_metronomeTrack, start, length, 37, 5, 9);
		}
	}, null, [$AlphaTab_Audio_Generator_IMidiFileHandler]);
	ss.initClass($AlphaTab_Audio_Generator_MidiPlaybackController, $asm, {
		get_shouldPlay: function() {
			return this.$1$ShouldPlayField;
		},
		set_shouldPlay: function(value) {
			this.$1$ShouldPlayField = value;
		},
		get_repeatMove: function() {
			return this.$1$RepeatMoveField;
		},
		set_repeatMove: function(value) {
			this.$1$RepeatMoveField = value;
		},
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_finished: function() {
			return this.get_index() >= this.$_score.get_masterBars().length;
		},
		process: function() {
			var masterBar = this.$_score.get_masterBars()[this.get_index()];
			// if the repeat group wasn't closed we reset the repeating 
			// on the last group opening
			if (!masterBar.get_repeatGroup().get_isClosed() && ss.referenceEquals(masterBar.get_repeatGroup().get_openings()[masterBar.get_repeatGroup().get_openings().length - 1], masterBar)) {
				this.$_repeatStart = 0;
				this.$_repeatNumber = 0;
				this.$_repeatEnd = 0;
				this.$_repeatOpen = false;
			}
			if (masterBar.get_isRepeatStart()) {
				this.$_repeatStartIndex = this.get_index();
				this.$_repeatStart = masterBar.get_start();
				this.$_repeatOpen = true;
				if (this.get_index() > this.$_lastIndex) {
					this.$_repeatNumber = 0;
					this.$_repeatAlternative = 0;
				}
			}
			else {
				if (this.$_repeatAlternative === 0) {
					this.$_repeatAlternative = masterBar.get_alternateEndings();
				}
				if (this.$_repeatOpen && this.$_repeatAlternative > 0 && (this.$_repeatAlternative & 1 << this.$_repeatNumber) === 0) {
					this.set_repeatMove(this.get_repeatMove() - masterBar.calculateDuration());
					if (masterBar.get_repeatCount() > 0) {
						this.$_repeatAlternative = 0;
					}
					this.set_shouldPlay(false);
					this.set_index(this.get_index() + 1);
					return;
				}
			}
			this.$_lastIndex = Math.max(this.$_lastIndex, this.get_index());
			if (this.$_repeatOpen && masterBar.get_repeatCount() > 0) {
				if (this.$_repeatNumber < masterBar.get_repeatCount() || this.$_repeatAlternative > 0) {
					this.$_repeatEnd = masterBar.get_start() + masterBar.calculateDuration();
					this.set_repeatMove(this.get_repeatMove() + (this.$_repeatEnd - this.$_repeatStart));
					this.set_index(this.$_repeatStartIndex - 1);
					this.$_repeatNumber++;
				}
				else {
					this.$_repeatStart = 0;
					this.$_repeatNumber = 0;
					this.$_repeatEnd = 0;
					this.$_repeatOpen = false;
				}
				this.$_repeatAlternative = 0;
			}
			this.set_index(this.get_index() + 1);
		}
	});
	ss.initClass($AlphaTab_Audio_Model_BarTickLookup, $asm, {
		get_start: function() {
			return this.$1$StartField;
		},
		set_start: function(value) {
			this.$1$StartField = value;
		},
		get_end: function() {
			return this.$1$EndField;
		},
		set_end: function(value) {
			this.$1$EndField = value;
		},
		get_bar: function() {
			return this.$1$BarField;
		},
		set_bar: function(value) {
			this.$1$BarField = value;
		}
	});
	ss.initEnum($AlphaTab_Audio_Model_MidiController, $asm, { allNotesOff: 123, balance: 10, chorus: 93, dataEntryLsb: 38, dataEntryMsb: 6, expression: 11, phaser: 95, reverb: 91, rpnLsb: 100, rpnMsb: 101, tremolo: 92, volume: 7 });
	ss.initClass($AlphaTab_Audio_Model_MidiEvent, $asm, {
		get_track: function() {
			return this.$1$TrackField;
		},
		set_track: function(value) {
			this.$1$TrackField = value;
		},
		get_tick: function() {
			return this.$1$TickField;
		},
		set_tick: function(value) {
			this.$1$TickField = value;
		},
		get_message: function() {
			return this.$1$MessageField;
		},
		set_message: function(value) {
			this.$1$MessageField = value;
		},
		get_nextEvent: function() {
			return this.$1$NextEventField;
		},
		set_nextEvent: function(value) {
			this.$1$NextEventField = value;
		},
		get_previousEvent: function() {
			return this.$1$PreviousEventField;
		},
		set_previousEvent: function(value) {
			this.$1$PreviousEventField = value;
		},
		get_deltaTicks: function() {
			return (ss.isNullOrUndefined(this.get_previousEvent()) ? 0 : (this.get_tick() - this.get_previousEvent().get_tick()));
		},
		writeTo: function(s) {
			this.$writeVariableInt(s, this.get_deltaTicks());
			this.get_message().writeTo(s);
		},
		$writeVariableInt: function(s, value) {
			var array = new $AlphaTab_IO_ByteArray.$ctor1(4);
			var n = 0;
			do {
				array.set_item(n++, value & 127 & 255);
				value >>= 7;
			} while (value > 0);
			while (n > 0) {
				n--;
				if (n > 0) {
					s.writeByte(array.get_item(n) | 128);
				}
				else {
					s.writeByte(array.get_item(n));
				}
			}
		}
	});
	ss.initClass($AlphaTab_Audio_Model_MidiFile, $asm, {
		get_tracks: function() {
			return this.$1$TracksField;
		},
		set_tracks: function(value) {
			this.$1$TracksField = value;
		},
		get_infoTrack: function() {
			return this.$1$InfoTrackField;
		},
		set_infoTrack: function(value) {
			this.$1$InfoTrackField = value;
		},
		createTrack: function() {
			var track = new $AlphaTab_Audio_Model_MidiTrack();
			track.set_index(this.get_tracks().length);
			track.set_file(this);
			ss.add(this.get_tracks(), track);
			return track;
		},
		writeTo: function(s) {
			var b;
			// magic number "MThd" (0x4D546864)
			b = new $AlphaTab_IO_ByteArray([77, 84, 104, 100]);
			s.write(b, 0, b.get_length());
			// Header Length 6 (0x00000006)
			b = new $AlphaTab_IO_ByteArray([0, 0, 0, 6]);
			s.write(b, 0, b.get_length());
			// format 
			b = new $AlphaTab_IO_ByteArray([0, 1]);
			s.write(b, 0, b.get_length());
			// number of tracks
			var v = this.get_tracks().length;
			b = new $AlphaTab_IO_ByteArray([v >> 8 & 255, v & 255]);
			s.write(b, 0, b.get_length());
			v = 960;
			b = new $AlphaTab_IO_ByteArray([v >> 8 & 255, v & 255]);
			s.write(b, 0, b.get_length());
			var $t1 = this.get_tracks();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var midiTrack = $t1[$t2];
				midiTrack.writeTo(s);
			}
		}
	});
	ss.initClass($AlphaTab_Audio_Model_MidiMessage, $asm, {
		get_event: function() {
			return this.$1$EventField;
		},
		set_event: function(value) {
			this.$1$EventField = value;
		},
		get_data: function() {
			return this.$1$DataField;
		},
		set_data: function(value) {
			this.$1$DataField = value;
		},
		writeTo: function(s) {
			s.write(this.get_data(), 0, this.get_data().get_length());
		}
	});
	ss.initClass($AlphaTab_Audio_Model_MidiTickLookup, $asm, {
		get_bars: function() {
			return this.$1$BarsField;
		},
		set_bars: function(value) {
			this.$1$BarsField = value;
		},
		findBeat: function(track, tick) {
			//
			// some heuristics: try last found beat and it's next beat for lookup first
			// try last beat or next beat of last beat first
			if (ss.isValue(this.$_lastBeat) && ss.isValue(this.$_lastBeat.get_nextBeat()) && ss.referenceEquals(this.$_lastBeat.get_voice().get_bar().get_track(), track)) {
				// check if tick is between _lastBeat and _lastBeat.nextBeat (still _lastBeat)
				if (tick >= this.$_lastBeat.get_start() && tick < this.$_lastBeat.get_nextBeat().get_start()) {
					return this.$_lastBeat;
				}
				// we need a upper-next beat to check the nextbeat range 
				if (ss.isValue(this.$_lastBeat.get_nextBeat().get_nextBeat()) && tick >= this.$_lastBeat.get_nextBeat().get_start() && tick < this.$_lastBeat.get_nextBeat().get_nextBeat().get_start()) {
					this.$_lastBeat = this.$_lastBeat.get_nextBeat();
					return this.$_lastBeat;
				}
			}
			//
			// Global Search
			// binary search within lookup
			var lookup = this.$findBar(tick);
			if (ss.isNullOrUndefined(lookup)) {
				return null;
			}
			var masterBar = lookup.get_bar();
			var bar = track.get_bars()[masterBar.get_index()];
			// remap tick to initial bar start
			tick = tick - lookup.get_start() + masterBar.get_start();
			// linear search beat within beats
			var beat = null;
			var $t1 = bar.get_voices()[0].get_beats();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				// we search for the first beat which 
				// starts after the tick. 
				if (ss.isNullOrUndefined(beat) || b.get_start() <= tick) {
					beat = b;
				}
				else {
					break;
				}
			}
			this.$_lastBeat = beat;
			return this.$_lastBeat;
		},
		$findBar: function(tick) {
			var bottom = 0;
			var top = this.get_bars().length - 1;
			while (bottom <= top) {
				var middle = ss.Int32.div(top + bottom, 2);
				var bar = this.get_bars()[middle];
				// found?
				if (tick >= bar.get_start() && tick <= bar.get_end()) {
					return bar;
				}
				// search in lower half 
				if (tick < bar.get_start()) {
					top = middle - 1;
				}
				else {
					bottom = middle + 1;
				}
			}
			return null;
		}
	});
	ss.initClass($AlphaTab_Audio_Model_MidiTrack, $asm, {
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_file: function() {
			return this.$1$FileField;
		},
		set_file: function(value) {
			this.$1$FileField = value;
		},
		get_firstEvent: function() {
			return this.$1$FirstEventField;
		},
		set_firstEvent: function(value) {
			this.$1$FirstEventField = value;
		},
		get_lastEvent: function() {
			return this.$1$LastEventField;
		},
		set_lastEvent: function(value) {
			this.$1$LastEventField = value;
		},
		addEvent: function(e) {
			e.set_track(this);
			// first entry 
			if (ss.isNullOrUndefined(this.get_firstEvent())) {
				// first and last e
				this.set_firstEvent(e);
				this.set_lastEvent(e);
			}
			else {
				// is the e after the last one?
				if (this.get_lastEvent().get_tick() <= e.get_tick()) {
					// make the new e the last one
					this.get_lastEvent().set_nextEvent(e);
					e.set_previousEvent(this.get_lastEvent());
					this.set_lastEvent(e);
				}
				else if (this.get_firstEvent().get_tick() > e.get_tick()) {
					// make the new e the new head
					e.set_nextEvent(this.get_firstEvent());
					this.get_firstEvent().set_previousEvent(e);
					this.set_firstEvent(e);
				}
				else {
					// we assume equal tick distribution and search for
					// the lesser distance,
					// start inserting on first e or last e?
					// use smaller delta 
					var firstDelta = e.get_tick() - this.get_firstEvent().get_tick();
					var lastDelta = this.get_lastEvent().get_tick() - e.get_tick();
					if (firstDelta < lastDelta) {
						// search position from start to end
						var previous = this.get_firstEvent();
						// as long the upcoming e is still before 
						// the new one
						while (ss.isValue(previous) && ss.isValue(previous.get_nextEvent()) && previous.get_nextEvent().get_tick() < e.get_tick()) {
							// we're moving to the next e 
							previous = previous.get_nextEvent();
						}
						if (ss.isNullOrUndefined(previous)) {
							return;
						}
						// insert after the found element
						var next = previous.get_nextEvent();
						// update previous
						previous.set_nextEvent(e);
						// update new
						e.set_previousEvent(previous);
						e.set_nextEvent(next);
						// update next
						if (ss.isValue(next)) {
							next.set_previousEvent(e);
						}
					}
					else {
						// search position from end to start
						var next1 = this.get_lastEvent();
						// as long the previous e is after the new one
						while (ss.isValue(next1) && ss.isValue(next1.get_previousEvent()) && next1.get_previousEvent().get_tick() > e.get_tick()) {
							// we're moving to previous e
							next1 = next1.get_previousEvent();
						}
						if (ss.isNullOrUndefined(next1)) {
							return;
						}
						var previous1 = next1.get_previousEvent();
						// update next
						next1.set_previousEvent(e);
						// update new
						e.set_nextEvent(next1);
						e.set_previousEvent(previous1);
						// update previous
						if (ss.isValue(previous1)) {
							previous1.set_nextEvent(e);
						}
						else {
							this.set_firstEvent(e);
						}
					}
				}
			}
		},
		writeTo: function(s) {
			// build track data first
			var trackData = new $AlphaTab_IO_MemoryStream();
			var current = this.get_firstEvent();
			while (ss.isValue(current)) {
				current.writeTo(trackData);
				current = current.get_nextEvent();
			}
			// magic number "MTrk" (0x4D54726B)
			var b = new $AlphaTab_IO_ByteArray([77, 84, 114, 107]);
			s.write(b, 0, b.get_length());
			// size as integer
			var data = trackData.toArray();
			var l = data.get_length();
			b = new $AlphaTab_IO_ByteArray([l >> 24 & 255, l >> 16 & 255, l >> 8 & 255, l >> 0 & 255]);
			s.write(b, 0, b.get_length());
			s.write(data, 0, data.get_length());
		}
	});
	ss.initClass($AlphaTab_Importer_AlphaTexException, $asm, {
		get_position: function() {
			return this.$2$PositionField;
		},
		set_position: function(value) {
			this.$2$PositionField = value;
		},
		get_nonTerm: function() {
			return this.$2$NonTermField;
		},
		set_nonTerm: function(value) {
			this.$2$NonTermField = value;
		},
		get_expected: function() {
			return this.$2$ExpectedField;
		},
		set_expected: function(value) {
			this.$2$ExpectedField = value;
		},
		get_symbol: function() {
			return this.$2$SymbolField;
		},
		set_symbol: function(value) {
			this.$2$SymbolField = value;
		},
		get_symbolData: function() {
			return this.$2$SymbolDataField;
		},
		set_symbolData: function(value) {
			this.$2$SymbolDataField = value;
		},
		get_message: function() {
			if (ss.isNullOrUndefined(this.get_symbolData())) {
				return this.get_position() + ': Error on block ' + this.get_nonTerm() + ', expected a ' + this.get_expected() + ' found a ' + this.get_symbol();
			}
			return this.get_position() + ': Error on block ' + this.get_nonTerm() + ', invalid value: ' + this.get_symbolData();
		}
	}, ss.Exception);
	ss.initClass($AlphaTab_Importer_ScoreImporter, $asm, {
		init: function(data) {
			this._data = data;
		},
		readScore: null
	});
	ss.initClass($AlphaTab_Importer_AlphaTexImporter, $asm, {
		readScore: function() {
			try {
				this.$createDefaultScore();
				this.$_curChPos = 0;
				this.$_currentDuration = 4;
				this.$nextChar();
				this.$newSy();
				this.$score();
				this.$_score.finish();
				return this.$_score;
			}
			catch ($t1) {
				throw new $AlphaTab_Importer_UnsupportedFormatException();
			}
		},
		$error: function(nonterm, expected, symbolError) {
			if (symbolError) {
				throw new $AlphaTab_Importer_AlphaTexException(this.$_curChPos, nonterm, expected, this.$_sy, null);
			}
			throw new $AlphaTab_Importer_AlphaTexException(this.$_curChPos, nonterm, expected, expected, this.$_syData);
		},
		$createDefaultScore: function() {
			this.$_score = new $AlphaTab_Model_Score();
			this.$_score.set_tempo(120);
			this.$_score.set_tempoLabel('');
			this.$_track = new $AlphaTab_Model_Track();
			this.$_track.get_playbackInfo().set_program(25);
			this.$_track.get_playbackInfo().set_primaryChannel($AlphaTab_Importer_AlphaTexImporter.$trackChannels[0]);
			this.$_track.get_playbackInfo().set_secondaryChannel($AlphaTab_Importer_AlphaTexImporter.$trackChannels[1]);
			this.$_track.set_tuning($AlphaTab_Model_Tuning.getPresetsFor(6)[0].get_tunings());
			this.$_score.addTrack(this.$_track);
		},
		$parseClef: function(str) {
			switch (str.toLowerCase()) {
				case 'g2':
				case 'treble': {
					return 4;
				}
				case 'f4':
				case 'bass': {
					return 3;
				}
				case 'c3':
				case 'tenor': {
					return 1;
				}
				case 'c4':
				case 'alto': {
					return 2;
				}
				default: {
					return 4;
				}
			}
		},
		$parseKeySignature: function(str) {
			switch (str.toLowerCase()) {
				case 'cb': {
					return -7;
				}
				case 'gb': {
					return -6;
				}
				case 'db': {
					return -5;
				}
				case 'ab': {
					return -4;
				}
				case 'eb': {
					return -3;
				}
				case 'bb': {
					return -2;
				}
				case 'f': {
					return -1;
				}
				case 'c': {
					return 0;
				}
				case 'g': {
					return 1;
				}
				case 'd': {
					return 2;
				}
				case 'a': {
					return 3;
				}
				case 'e': {
					return 4;
				}
				case 'b': {
					return 5;
				}
				case 'f#': {
					return 6;
				}
				case 'c#': {
					return 7;
				}
				default: {
					return 0;
				}
			}
		},
		$parseTuning: function(str) {
			var tuning = $AlphaTab_Model_Tuning.getTuningForText(str);
			if (tuning < 0) {
				this.$error('tuning-value', 5, false);
			}
			return tuning;
		},
		$nextChar: function() {
			var b = this._data.readByte();
			if (b === -1) {
				this.$_ch = $AlphaTab_Importer_AlphaTexImporter.$eof;
			}
			else {
				this.$_ch = this._data.readByte();
				this.$_curChPos++;
			}
		},
		$newSy: function() {
			this.$_sy = 0;
			do {
				if (this.$_ch === 0) {
					this.$_sy = 1;
				}
				else if (this.$_ch === 32 || this.$_ch === 10 || this.$_ch === 13 || this.$_ch === 9) {
					// skip whitespaces 
					this.$nextChar();
				}
				else if (this.$_ch === 47) {
					this.$nextChar();
					if (this.$_ch === 47) {
						// single line comment
						while (this.$_ch !== 13 && this.$_ch !== 10 && this.$_ch !== 0) {
							this.$nextChar();
						}
					}
					else if (this.$_ch === 42) {
						// multiline comment
						while (this.$_ch !== 0) {
							if (this.$_ch === 42) {
								this.$nextChar();
								if (this.$_ch === 47) {
									this.$nextChar();
									break;
								}
							}
							else {
								this.$nextChar();
							}
						}
					}
					else {
						this.$error('symbol', 5, false);
					}
				}
				else if (this.$_ch === 34 || this.$_ch === 39) {
					this.$nextChar();
					var s = new ss.StringBuilder();
					this.$_sy = 5;
					while (this.$_ch !== 34 && this.$_ch !== 39 && this.$_ch !== 0) {
						s.appendChar(this.$_ch);
						this.$nextChar();
					}
					this.$_syData = s;
					this.$nextChar();
				}
				else if (this.$_ch === 45) {
					// is number?
					if (this.$_allowNegatives && this.$isDigit(this.$_ch)) {
						var number = this.$readNumber();
						this.$_sy = 2;
						this.$_syData = number;
					}
					else {
						this.$_sy = 5;
						this.$_syData = this.$readName();
					}
				}
				else if (this.$_ch === 46) {
					this.$_sy = 4;
					this.$nextChar();
				}
				else if (this.$_ch === 58) {
					this.$_sy = 3;
					this.$nextChar();
				}
				else if (this.$_ch === 40) {
					this.$_sy = 7;
					this.$nextChar();
				}
				else if (this.$_ch === 92) {
					this.$nextChar();
					var name = this.$readName();
					this.$_sy = 12;
					this.$_syData = name;
				}
				else if (this.$_ch === 41) {
					this.$_sy = 8;
					this.$nextChar();
				}
				else if (this.$_ch === 123) {
					this.$_sy = 9;
					this.$nextChar();
				}
				else if (this.$_ch === 125) {
					this.$_sy = 10;
					this.$nextChar();
				}
				else if (this.$_ch === 124) {
					this.$_sy = 11;
					this.$nextChar();
				}
				else if (this.$_ch === 42) {
					this.$_sy = 13;
					this.$nextChar();
				}
				else if (this.$isDigit(this.$_ch)) {
					var number1 = this.$readNumber();
					this.$_sy = 2;
					this.$_syData = number1;
				}
				else if ($AlphaTab_Importer_AlphaTexImporter.$isLetter(this.$_ch)) {
					var name1 = this.$readName();
					if ($AlphaTab_Model_Tuning.isTuning(name1)) {
						this.$_sy = 6;
						this.$_syData = name1.toLowerCase();
					}
					else {
						this.$_sy = 5;
						this.$_syData = name1;
					}
				}
				else {
					this.$error('symbol', 5, false);
				}
			} while (this.$_sy === 0);
		},
		$isDigit: function(ch) {
			var code = ch;
			return code >= 48 && code <= 57 || ch === 45 && this.$_allowNegatives;
			// allow - if negatives
		},
		$readName: function() {
			var str = new ss.StringBuilder();
			do {
				str.appendChar(this.$_ch);
				this.$nextChar();
			} while ($AlphaTab_Importer_AlphaTexImporter.$isLetter(this.$_ch) || this.$isDigit(this.$_ch));
			return str.toString();
		},
		$readNumber: function() {
			var str = new ss.StringBuilder();
			do {
				str.appendChar(this.$_ch);
				this.$nextChar();
			} while (this.$isDigit(this.$_ch));
			return parseInt(str.toString());
		},
		$score: function() {
			this.$metaData();
			this.$bars();
		},
		$metaData: function() {
			var anyMeta = false;
			while (this.$_sy === 12) {
				if (ss.equals(this.$_syData, 'title')) {
					this.$newSy();
					if (this.$_sy === 5) {
						this.$_score.set_title(this.$_syData.toString());
					}
					else {
						this.$error('title', 5, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'subtitle')) {
					this.$newSy();
					if (this.$_sy === 5) {
						this.$_score.set_subTitle(this.$_syData.toString());
					}
					else {
						this.$error('subtitle', 5, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'artist')) {
					this.$newSy();
					if (this.$_sy === 5) {
						this.$_score.set_artist(this.$_syData.toString());
					}
					else {
						this.$error('artist', 5, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'album')) {
					this.$newSy();
					if (this.$_sy === 5) {
						this.$_score.set_album(this.$_syData.toString());
					}
					else {
						this.$error('album', 5, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'words')) {
					this.$newSy();
					if (this.$_sy === 5) {
						this.$_score.set_words(this.$_syData.toString());
					}
					else {
						this.$error('words', 5, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'music')) {
					this.$newSy();
					if (this.$_sy === 5) {
						this.$_score.set_music(this.$_syData.toString());
					}
					else {
						this.$error('music', 5, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'copyright')) {
					this.$newSy();
					if (this.$_sy === 5) {
						this.$_score.set_copyright(this.$_syData.toString());
					}
					else {
						this.$error('copyright', 5, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'tempo')) {
					this.$newSy();
					if (this.$_sy === 2) {
						this.$_score.set_tempo(ss.unbox(this.$_syData));
					}
					else {
						this.$error('tempo', 2, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'capo')) {
					this.$newSy();
					if (this.$_sy === 2) {
						this.$_track.set_capo(ss.unbox(this.$_syData));
					}
					else {
						this.$error('capo', 2, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'tuning')) {
					this.$newSy();
					if (this.$_sy === 6) {
						this.$_track.set_tuning([]);
						do {
							ss.add(this.$_track.get_tuning(), this.$parseTuning(this.$_syData.toString()));
							this.$newSy();
						} while (this.$_sy === 6);
					}
					else {
						this.$error('tuning', 6, true);
					}
					anyMeta = true;
				}
				else if (ss.equals(this.$_syData, 'instrument')) {
					this.$newSy();
					if (this.$_sy === 2) {
						var instrument = ss.unbox(this.$_syData);
						if (instrument >= 0 && instrument <= 128) {
							this.$_track.get_playbackInfo().set_program(ss.unbox(this.$_syData));
						}
						else {
							this.$error('instrument', 2, false);
						}
					}
					else if (this.$_sy === 5) {
						var instrumentName = this.$_syData.toString();
						this.$_track.get_playbackInfo().set_program($AlphaTab_Audio_GeneralMidi.getValue(instrumentName));
					}
					else {
						this.$error('instrument', 2, true);
					}
					this.$newSy();
					anyMeta = true;
				}
				else {
					this.$error('metaDataTags', 5, false);
				}
			}
			if (anyMeta) {
				if (this.$_sy !== 4) {
					this.$error('song', 4, true);
				}
				this.$newSy();
			}
		},
		$bars: function() {
			this.$bar();
			while (this.$_sy !== 1) {
				// read pipe from last bar
				if (this.$_sy !== 11) {
					this.$error('bar', 11, true);
				}
				this.$newSy();
				this.$bar();
			}
		},
		$bar: function() {
			var master = new $AlphaTab_Model_MasterBar();
			this.$_score.addMasterBar(master);
			var bar = new $AlphaTab_Model_Bar();
			this.$_track.addBar(bar);
			if (master.get_index() > 0) {
				master.set_keySignature(master.get_previousMasterBar().get_keySignature());
				master.set_timeSignatureDenominator(master.get_previousMasterBar().get_timeSignatureDenominator());
				master.set_timeSignatureNumerator(master.get_previousMasterBar().get_timeSignatureNumerator());
				bar.set_clef(bar.get_previousBar().get_clef());
			}
			this.$barMeta(bar);
			var voice = new $AlphaTab_Model_Voice();
			bar.addVoice(voice);
			while (this.$_sy !== 11 && this.$_sy !== 1) {
				this.$beat(voice);
			}
		},
		$beat: function(voice) {
			// duration specifier?
			if (this.$_sy === 3) {
				this.$newSy();
				if (this.$_sy !== 2) {
					this.$error('duration', 2, true);
				}
				var duration = ss.unbox(this.$_syData);
				switch (duration) {
					case 1:
					case 2:
					case 4:
					case 8:
					case 16:
					case 32:
					case 64: {
						this.$_currentDuration = this.$parseDuration(ss.unbox(this.$_syData));
						break;
					}
					default: {
						this.$error('duration', 2, false);
						break;
					}
				}
				this.$newSy();
				return;
			}
			var beat = new $AlphaTab_Model_Beat();
			voice.addBeat(beat);
			// notes
			if (this.$_sy === 7) {
				this.$newSy();
				this.$note(beat);
				while (this.$_sy !== 8 && this.$_sy !== 1) {
					this.$note(beat);
				}
				if (this.$_sy !== 8) {
					this.$error('note-list', 8, true);
				}
				this.$newSy();
			}
			else if (this.$_sy === 5 && this.$_syData.toString().toLowerCase() === 'r') {
				// rest voice -> no notes 
				this.$newSy();
			}
			else {
				this.$note(beat);
			}
			// new duration
			if (this.$_sy === 4) {
				this.$newSy();
				if (this.$_sy !== 2) {
					this.$error('duration', 2, true);
				}
				var duration1 = ss.unbox(this.$_syData);
				switch (duration1) {
					case 1:
					case 2:
					case 4:
					case 8:
					case 16:
					case 32:
					case 64: {
						this.$_currentDuration = this.$parseDuration(ss.unbox(this.$_syData));
						break;
					}
					default: {
						this.$error('duration', 2, false);
						break;
					}
				}
				this.$newSy();
			}
			else {
				beat.set_duration(this.$_currentDuration);
			}
			// beat multiplier (repeat beat n times)
			var beatRepeat = 1;
			if (this.$_sy === 13) {
				this.$newSy();
				// multiplier count
				if (this.$_sy !== 2) {
					this.$error('multiplier', 2, true);
				}
				else {
					beatRepeat = ss.unbox(this.$_syData);
				}
				this.$newSy();
			}
			this.$beatEffects(beat);
			for (var i = 0; i < beatRepeat - 1; i++) {
				voice.addBeat(beat.clone());
			}
		},
		$beatEffects: function(beat) {
			if (this.$_sy !== 9) {
				return;
			}
			this.$newSy();
			while (this.$_sy === 5) {
				this.$_syData = this.$_syData.toString().toLowerCase();
				if (!this.$applyBeatEffect(beat)) {
					this.$error('beat-effects', 5, false);
				}
			}
			if (this.$_sy !== 10) {
				this.$error('beat-effects', 10, true);
			}
			this.$newSy();
		},
		$applyBeatEffect: function(beat) {
			if (ss.equals(this.$_syData, 'f')) {
				beat.set_fadeIn(true);
				this.$newSy();
				return true;
			}
			if (ss.equals(this.$_syData, 'v')) {
				beat.set_vibrato(1);
				this.$newSy();
				return true;
			}
			if (ss.equals(this.$_syData, 's')) {
				beat.set_slap(true);
				this.$newSy();
				return true;
			}
			if (ss.equals(this.$_syData, 'p')) {
				beat.set_pop(true);
				this.$newSy();
				return true;
			}
			if (ss.equals(this.$_syData, 'dd')) {
				beat.set_dots(2);
				this.$newSy();
				return true;
			}
			if (ss.equals(this.$_syData, 'd')) {
				beat.set_dots(1);
				this.$newSy();
				return true;
			}
			if (ss.equals(this.$_syData, 'su')) {
				beat.set_pickStroke(1);
				this.$newSy();
				return true;
			}
			if (ss.equals(this.$_syData, 'sd')) {
				beat.set_pickStroke(2);
				this.$newSy();
				return true;
			}
			if (ss.equals(this.$_syData, 'tu')) {
				this.$newSy();
				if (this.$_sy !== 2) {
					this.$error('tuplet', 2, true);
					return false;
				}
				var tuplet = ss.unbox(this.$_syData);
				switch (tuplet) {
					case 3: {
						beat.set_tupletDenominator(3);
						beat.set_tupletNumerator(2);
						break;
					}
					case 5: {
						beat.set_tupletDenominator(5);
						beat.set_tupletNumerator(4);
						break;
					}
					case 6: {
						beat.set_tupletDenominator(6);
						beat.set_tupletNumerator(4);
						break;
					}
					case 7: {
						beat.set_tupletDenominator(7);
						beat.set_tupletNumerator(4);
						break;
					}
					case 9: {
						beat.set_tupletDenominator(9);
						beat.set_tupletNumerator(8);
						break;
					}
					case 10: {
						beat.set_tupletDenominator(10);
						beat.set_tupletNumerator(8);
						break;
					}
					case 11: {
						beat.set_tupletDenominator(11);
						beat.set_tupletNumerator(8);
						break;
					}
					case 12: {
						beat.set_tupletDenominator(12);
						beat.set_tupletNumerator(8);
						break;
					}
				}
				this.$newSy();
				return true;
			}
			if (ss.equals(this.$_syData, 'tb')) {
				// read points
				this.$newSy();
				if (this.$_sy !== 7) {
					this.$error('tremolobar-effect', 7, true);
					return false;
				}
				this.$_allowNegatives = true;
				this.$newSy();
				while (this.$_sy !== 8 && this.$_sy !== 1) {
					if (this.$_sy !== 2) {
						this.$error('tremolobar-effect', 2, true);
						return false;
					}
					ss.add(beat.get_whammyBarPoints(), new $AlphaTab_Model_BendPoint(0, ss.unbox(this.$_syData)));
					this.$newSy();
				}
				while (beat.get_whammyBarPoints().length > 60) {
					ss.removeAt(beat.get_whammyBarPoints(), beat.get_whammyBarPoints().length - 1);
				}
				// set positions
				var count = beat.get_whammyBarPoints().length;
				var step = ss.Int32.div(60, count);
				var i = 0;
				while (i < count) {
					beat.get_whammyBarPoints()[i].set_offset(Math.min(60, i * step));
					i++;
				}
				this.$_allowNegatives = false;
				if (this.$_sy !== 8) {
					this.$error('tremolobar-effect', 8, true);
					return false;
				}
				this.$newSy();
				return true;
			}
			return false;
		},
		$note: function(beat) {
			// fret.string
			if (this.$_sy !== 2 && !(this.$_sy === 5 && (this.$_syData.toString().toLowerCase() === 'x' || this.$_syData.toString().toLowerCase() === '-'))) {
				this.$error('note-fret', 2, true);
			}
			var isDead = this.$_syData.toString().toLowerCase() === 'x';
			var isTie = this.$_syData.toString().toLowerCase() === '-';
			var fret = ss.unbox(((isDead || isTie) ? 0 : this.$_syData));
			this.$newSy();
			// Fret done
			if (this.$_sy !== 4) {
				this.$error('note', 4, true);
			}
			this.$newSy();
			// dot done
			if (this.$_sy !== 2) {
				this.$error('note-string', 2, true);
			}
			var string = ss.unbox(this.$_syData);
			if (string < 1 || string > this.$_track.get_tuning().length) {
				this.$error('note-string', 2, false);
			}
			this.$newSy();
			// string done
			// read effects
			var note = new $AlphaTab_Model_Note();
			this.$noteEffects(note);
			// create note
			note.set_string(this.$_track.get_tuning().length - (string - 1));
			note.set_isDead(isDead);
			note.set_isTieDestination(isTie);
			if (!isTie) {
				note.set_fret(fret);
			}
			beat.addNote(note);
		},
		$noteEffects: function(note) {
			if (this.$_sy !== 9) {
				return;
			}
			this.$newSy();
			while (this.$_sy === 5) {
				var syData = this.$_syData.toString().toLowerCase();
				this.$_syData = syData;
				if (syData === 'b') {
					// read points
					this.$newSy();
					if (this.$_sy !== 7) {
						this.$error('bend-effect', 7, true);
					}
					this.$newSy();
					while (this.$_sy !== 8 && this.$_sy !== 1) {
						if (this.$_sy !== 2) {
							this.$error('bend-effect-value', 2, true);
						}
						var bendValue = ss.unbox(this.$_syData);
						ss.add(note.get_bendPoints(), new $AlphaTab_Model_BendPoint(0, Math.abs(bendValue)));
						this.$newSy();
					}
					while (note.get_bendPoints().length > 60) {
						ss.removeAt(note.get_bendPoints(), note.get_bendPoints().length - 1);
					}
					// set positions
					var count = note.get_bendPoints().length;
					var step = ss.Int32.div(60, count);
					var i = 0;
					while (i < count) {
						note.get_bendPoints()[i].set_offset(Math.min(60, i * step));
						i++;
					}
					if (this.$_sy !== 8) {
						this.$error('bend-effect', 8, true);
					}
					this.$newSy();
				}
				else if (syData === 'nh') {
					note.set_harmonicType(1);
					this.$newSy();
				}
				else if (syData === 'ah') {
					// todo: Artificial Key
					note.set_harmonicType(2);
					this.$newSy();
				}
				else if (syData === 'th') {
					// todo: store tapped fret in data
					note.set_harmonicType(4);
					this.$newSy();
				}
				else if (syData === 'ph') {
					note.set_harmonicType(3);
					this.$newSy();
				}
				else if (syData === 'sh') {
					note.set_harmonicType(5);
					this.$newSy();
				}
				else if (syData === 'gr') {
					this.$newSy();
					if (ss.equals(this.$_syData, 'ob')) {
						note.get_beat().set_graceType(1);
					}
					else {
						note.get_beat().set_graceType(2);
					}
					// \gr fret duration transition
					this.$newSy();
				}
				else if (syData === 'tr') {
					this.$newSy();
					if (this.$_sy !== 2) {
						this.$error('trill-effect', 2, true);
					}
					var fret = ss.unbox(this.$_syData);
					this.$newSy();
					var duration = 16;
					if (this.$_sy === 2) {
						switch (ss.unbox(this.$_syData)) {
							case 16: {
								duration = 16;
								break;
							}
							case 32: {
								duration = 32;
								break;
							}
							case 64: {
								duration = 32;
								break;
							}
							default: {
								duration = 16;
								break;
							}
						}
						this.$newSy();
					}
					note.set_trillValue(fret + note.get_stringTuning());
					note.set_trillSpeed(duration);
				}
				else if (syData === 'tp') {
					this.$newSy();
					var duration1 = 8;
					if (this.$_sy === 2) {
						switch (ss.unbox(this.$_syData)) {
							case 8: {
								duration1 = 8;
								break;
							}
							case 16: {
								duration1 = 16;
								break;
							}
							case 32: {
								duration1 = 32;
								break;
							}
							default: {
								duration1 = 8;
								break;
							}
						}
						this.$newSy();
					}
					note.get_beat().set_tremoloSpeed(new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [$AlphaTab_Model_Duration]))(duration1));
				}
				else if (syData === 'v') {
					this.$newSy();
					note.set_vibrato(1);
				}
				else if (syData === 'sl') {
					this.$newSy();
					note.set_slideType(2);
				}
				else if (syData === 'ss') {
					this.$newSy();
					note.set_slideType(1);
				}
				else if (syData === 'h') {
					this.$newSy();
					note.set_isHammerPullOrigin(true);
				}
				else if (syData === 'g') {
					this.$newSy();
					note.set_isGhost(true);
				}
				else if (syData === 'ac') {
					this.$newSy();
					note.set_accentuated(1);
				}
				else if (syData === 'hac') {
					this.$newSy();
					note.set_accentuated(2);
				}
				else if (syData === 'pm') {
					this.$newSy();
					note.set_isPalmMute(true);
				}
				else if (syData === 'st') {
					this.$newSy();
					note.set_isStaccato(true);
				}
				else if (syData === 'lr') {
					this.$newSy();
					note.set_isLetRing(true);
				}
				else if (this.$applyBeatEffect(note.get_beat())) {
					// Success
				}
				else {
					this.$error(syData, 5, false);
				}
			}
			if (this.$_sy !== 10) {
				this.$error('note-effect', 10, false);
			}
			this.$newSy();
		},
		$parseDuration: function(duration) {
			switch (duration) {
				case 1: {
					return 1;
				}
				case 2: {
					return 2;
				}
				case 4: {
					return 4;
				}
				case 8: {
					return 8;
				}
				case 16: {
					return 16;
				}
				case 32: {
					return 32;
				}
				case 64: {
					return 64;
				}
				default: {
					return 4;
				}
			}
		},
		$barMeta: function(bar) {
			var master = bar.get_masterBar();
			while (this.$_sy === 12) {
				if (ss.equals(this.$_syData, 'ts')) {
					this.$newSy();
					if (this.$_sy !== 2) {
						this.$error('timesignature-numerator', 2, true);
					}
					master.set_timeSignatureNumerator(ss.unbox(this.$_syData));
					this.$newSy();
					if (this.$_sy !== 2) {
						this.$error('timesignature-denominator', 2, true);
					}
					master.set_timeSignatureDenominator(ss.unbox(this.$_syData));
				}
				else if (ss.equals(this.$_syData, 'ro')) {
					master.set_isRepeatStart(true);
				}
				else if (ss.equals(this.$_syData, 'rc')) {
					this.$newSy();
					if (this.$_sy !== 2) {
						this.$error('repeatclose', 2, true);
					}
					master.set_repeatCount(ss.unbox(this.$_syData) - 1);
				}
				else if (ss.equals(this.$_syData, 'ks')) {
					this.$newSy();
					if (this.$_sy !== 5) {
						this.$error('keysignature', 5, true);
					}
					master.set_keySignature(this.$parseKeySignature(this.$_syData.toString()));
				}
				else if (ss.equals(this.$_syData, 'clef')) {
					this.$newSy();
					if (this.$_sy !== 5 && this.$_sy !== 6) {
						this.$error('clef', 5, true);
					}
					bar.set_clef(this.$parseClef(this.$_syData.toString()));
				}
				else {
					this.$error('measure-effects', 5, false);
				}
				this.$newSy();
			}
		}
	}, $AlphaTab_Importer_ScoreImporter);
	ss.initEnum($AlphaTab_Importer_AlphaTexSymbols, $asm, { no: 0, eof: 1, number: 2, doubleDot: 3, dot: 4, string: 5, tuning: 6, lParensis: 7, rParensis: 8, lBrace: 9, rBrace: 10, pipe: 11, metaCommand: 12, multiply: 13 });
	ss.initClass($AlphaTab_Importer_Gp3To5Importer, $asm, {
		readScore: function() {
			this.readVersion();
			this.$_score = new $AlphaTab_Model_Score();
			// basic song info
			this.readScoreInformation();
			// triplet feel before Gp5
			if (this.$_versionNumber < 500) {
				this.$_globalTripletFeel = (this.readBool() ? 2 : 0);
			}
			// beat lyrics
			if (this.$_versionNumber >= 400) {
				this.readLyrics();
			}
			// rse master settings since GP5.1
			if (this.$_versionNumber >= 510) {
				// master volume (4)
				// master effect (4)
				// master equalizer (10)
				// master equalizer preset (1)
				this.skip(19);
			}
			// page setup since GP5
			if (this.$_versionNumber >= 500) {
				this.readPageSetup();
				this.$_score.set_tempoLabel(this.readStringIntByte());
			}
			// tempo stuff
			this.$_score.set_tempo(this.readInt32());
			if (this.$_versionNumber >= 510) {
				this.readBool();
				// hide tempo?
			}
			// keysignature and octave
			// var keySignature =
			this.readInt32();
			if (this.$_versionNumber >= 400) {
				// octave =
				this._data.readByte();
			}
			this.readPlaybackInfos();
			// repetition stuff
			if (this.$_versionNumber >= 500) {
				// "Coda" bar index (2)
				// "Double Coda" bar index (2)
				// "Segno" bar index (2)
				// "Segno Segno" bar index (2)
				// "Fine" bar index (2)
				// "Da Capo" bar index (2)
				// "Da Capo al Coda" bar index (2)
				// "Da Capo al Double Coda" bar index (2)
				// "Da Capo al Fine" bar index (2)
				// "Da Segno" bar index (2)
				// "Da Segno al Coda" bar index (2)
				// "Da Segno al Double Coda" bar index (2)
				// "Da Segno al Fine "bar index (2)
				// "Da Segno Segno" bar index (2)
				// "Da Segno Segno al Coda" bar index (2)
				// "Da Segno Segno al Double Coda" bar index (2)
				// "Da Segno Segno al Fine" bar index (2)
				// "Da Coda" bar index (2)
				// "Da Double Coda" bar index (2)
				this.skip(38);
				// unknown (4)
				this.skip(4);
			}
			// contents
			this.$_barCount = this.readInt32();
			this.$_trackCount = this.readInt32();
			this.readMasterBars();
			this.readTracks();
			this.readBars();
			this.$_score.finish();
			return this.$_score;
		},
		readVersion: function() {
			var version = this.readStringByteLength(30);
			if (!ss.startsWithString(version, 'FICHIER GUITAR PRO ')) {
				throw new $AlphaTab_Importer_UnsupportedFormatException();
			}
			version = version.substring($AlphaTab_Importer_Gp3To5Importer.$versionString.length + 1);
			var dot = version.indexOf(String.fromCharCode(46));
			this.$_versionNumber = 100 * parseInt(version.substr(0, dot)) + parseInt(version.substring(dot + 1));
		},
		readScoreInformation: function() {
			this.$_score.set_title(this.readStringIntUnused());
			this.$_score.set_subTitle(this.readStringIntUnused());
			this.$_score.set_artist(this.readStringIntUnused());
			this.$_score.set_album(this.readStringIntUnused());
			this.$_score.set_words(this.readStringIntUnused());
			this.$_score.set_music(((this.$_versionNumber >= 500) ? this.readStringIntUnused() : this.$_score.get_words()));
			this.$_score.set_copyright(this.readStringIntUnused());
			this.$_score.set_tab(this.readStringIntUnused());
			this.$_score.set_instructions(this.readStringIntUnused());
			var noticeLines = this.readInt32();
			var notice = new ss.StringBuilder();
			for (var i = 0; i < noticeLines; i++) {
				if (i > 0) {
					notice.appendLine();
				}
				notice.append(this.readStringIntUnused());
			}
			this.$_score.set_notices(notice.toString());
		},
		readLyrics: function() {
			this.$_lyrics = [];
			this.$_lyricsIndex = [];
			this.readInt32();
			for (var i = 0; i < 5; i++) {
				ss.add(this.$_lyricsIndex, this.readInt32() - 1);
				ss.add(this.$_lyrics, this.readStringInt());
			}
		},
		readPageSetup: function() {
			// Page Width (4)
			// Page Heigth (4)
			// Padding Left (4)
			// Padding Right (4)
			// Padding Top (4)
			// Padding Bottom (4)
			// Size Proportion(4)
			// Header and Footer display flags (2)
			this.skip(30);
			// title format
			// subtitle format
			// artist format
			// album format
			// words format
			// music format
			// words and music format
			// copyright format
			// pagpublic enumber format
			for (var i = 0; i < 10; i++) {
				this.readStringIntByte();
			}
		},
		readPlaybackInfos: function() {
			this.$_playbackInfos = [];
			for (var i = 0; i < 64; i++) {
				var info = new $AlphaTab_Model_PlaybackInformation();
				info.set_primaryChannel(i);
				info.set_secondaryChannel(i);
				info.set_program(this.readInt32());
				info.set_volume(this._data.readByte());
				info.set_balance(this._data.readByte());
				this.skip(6);
				ss.add(this.$_playbackInfos, info);
			}
		},
		readMasterBars: function() {
			for (var i = 0; i < this.$_barCount; i++) {
				this.readMasterBar();
			}
		},
		readMasterBar: function() {
			var previousMasterBar = null;
			if (this.$_score.get_masterBars().length > 0) {
				previousMasterBar = this.$_score.get_masterBars()[this.$_score.get_masterBars().length - 1];
			}
			var newMasterBar = new $AlphaTab_Model_MasterBar();
			var flags = this._data.readByte();
			// time signature
			if ((flags & 1) !== 0) {
				newMasterBar.set_timeSignatureNumerator(this._data.readByte());
			}
			else if (ss.isValue(previousMasterBar)) {
				newMasterBar.set_timeSignatureNumerator(previousMasterBar.get_timeSignatureNumerator());
			}
			if ((flags & 2) !== 0) {
				newMasterBar.set_timeSignatureDenominator(this._data.readByte());
			}
			else if (ss.isValue(previousMasterBar)) {
				newMasterBar.set_timeSignatureDenominator(previousMasterBar.get_timeSignatureDenominator());
			}
			// repeatings
			newMasterBar.set_isRepeatStart((flags & 4) !== 0);
			if ((flags & 8) !== 0) {
				newMasterBar.set_repeatCount(((this.$_versionNumber >= 500) ? this._data.readByte() : 1));
			}
			// marker
			if ((flags & 32) !== 0) {
				var section = new $AlphaTab_Model_Section();
				section.set_text(this.readStringIntByte());
				section.set_marker('');
				this.readColor();
				newMasterBar.set_section(section);
			}
			// alternate endings
			if ((flags & 16) !== 0) {
				if (this.$_versionNumber < 500) {
					var currentMasterBar = previousMasterBar;
					// get the already existing alternatives to ignore them 
					var existentAlternatives = 0;
					while (ss.isValue(currentMasterBar)) {
						// found another repeat ending?
						if (currentMasterBar.get_isRepeatEnd() && !ss.referenceEquals(currentMasterBar, previousMasterBar)) {
							break;
						}
						// found the opening?
						if (currentMasterBar.get_isRepeatStart()) {
							break;
						}
						existentAlternatives |= currentMasterBar.get_alternateEndings();
					}
					// now calculate the alternative for this bar
					var repeatAlternative = 0;
					var repeatMask = this._data.readByte();
					for (var i = 0; i < 8; i++) {
						// only add the repeating if it is not existing
						var repeating = 1 << i;
						if (repeatMask > i && (existentAlternatives & repeating) === 0) {
							repeatAlternative |= repeating;
						}
					}
					newMasterBar.set_alternateEndings(repeatAlternative);
				}
				else {
					newMasterBar.set_alternateEndings(this._data.readByte());
				}
			}
			// keysignature
			if ((flags & 64) !== 0) {
				newMasterBar.set_keySignature(this.$readSignedByte());
				this._data.readByte();
				// keysignature type
			}
			else if (ss.isValue(previousMasterBar)) {
				newMasterBar.set_keySignature(previousMasterBar.get_keySignature());
			}
			if (this.$_versionNumber >= 500 && (flags & 3) !== 0) {
				this.skip(4);
			}
			// better alternate ending mask in GP5
			if (this.$_versionNumber >= 500 && (flags & 16) === 0) {
				newMasterBar.set_alternateEndings(this._data.readByte());
			}
			// tripletfeel
			if (this.$_versionNumber >= 500) {
				var tripletFeel = this._data.readByte();
				switch (tripletFeel) {
					case 1: {
						newMasterBar.set_tripletFeel(2);
						break;
					}
					case 2: {
						newMasterBar.set_tripletFeel(1);
						break;
					}
				}
				this._data.readByte();
			}
			else {
				newMasterBar.set_tripletFeel(this.$_globalTripletFeel);
			}
			newMasterBar.set_isDoubleBar((flags & 128) !== 0);
			this.$_score.addMasterBar(newMasterBar);
		},
		readTracks: function() {
			for (var i = 0; i < this.$_trackCount; i++) {
				this.readTrack();
			}
		},
		readTrack: function() {
			var newTrack = new $AlphaTab_Model_Track();
			this.$_score.addTrack(newTrack);
			var flags = this._data.readByte();
			newTrack.set_name(this.readStringByteLength(40));
			newTrack.set_isPercussion((flags & 1) !== 0);
			var stringCount = this.readInt32();
			for (var i = 0; i < 7; i++) {
				var tuning = this.readInt32();
				if (stringCount > i) {
					ss.add(newTrack.get_tuning(), tuning);
				}
			}
			var port = this.readInt32();
			var index = this.readInt32() - 1;
			var effectChannel = this.readInt32() - 1;
			this.skip(4);
			// Fretcount
			if (index >= 0 && index < this.$_playbackInfos.length) {
				var info = this.$_playbackInfos[index];
				info.set_port(port);
				info.set_isSolo((flags & 16) !== 0);
				info.set_isMute((flags & 32) !== 0);
				info.set_secondaryChannel(effectChannel);
				newTrack.set_playbackInfo(info);
			}
			newTrack.set_capo(this.readInt32());
			newTrack.set_color(this.readColor());
			if (this.$_versionNumber >= 500) {
				// flags for 
				//  0x01 -> show tablature
				//  0x02 -> show standard notation
				this._data.readByte();
				// flags for
				//  0x02 -> auto let ring
				//  0x04 -> auto brush
				this._data.readByte();
				// unknown
				this.skip(43);
			}
			// unknown
			if (this.$_versionNumber >= 510) {
				this.skip(4);
				this.readStringIntByte();
				this.readStringIntByte();
			}
		},
		readBars: function() {
			for (var i = 0; i < this.$_barCount; i++) {
				for (var t = 0; t < this.$_trackCount; t++) {
					this.readBar(this.$_score.get_tracks()[t]);
				}
			}
		},
		readBar: function(track) {
			var newBar = new $AlphaTab_Model_Bar();
			if (track.get_isPercussion()) {
				newBar.set_clef(0);
			}
			track.addBar(newBar);
			var voiceCount = 1;
			if (this.$_versionNumber >= 500) {
				this._data.readByte();
				voiceCount = 2;
			}
			for (var v = 0; v < voiceCount; v++) {
				this.readVoice(track, newBar);
			}
		},
		readVoice: function(track, bar) {
			var beatCount = this.readInt32();
			if (beatCount === 0) {
				return;
			}
			var newVoice = new $AlphaTab_Model_Voice();
			bar.addVoice(newVoice);
			for (var i = 0; i < beatCount; i++) {
				this.readBeat(track, bar, newVoice);
			}
		},
		readBeat: function(track, bar, voice) {
			var newBeat = new $AlphaTab_Model_Beat();
			var flags = this._data.readByte();
			if ((flags & 1) !== 0) {
				newBeat.set_dots(1);
			}
			if ((flags & 64) !== 0) {
				var type = this._data.readByte();
				newBeat.set_isEmpty((type & 2) === 0);
			}
			voice.addBeat(newBeat);
			var duration = this.$readSignedByte();
			switch (duration) {
				case -2: {
					newBeat.set_duration(1);
					break;
				}
				case -1: {
					newBeat.set_duration(2);
					break;
				}
				case 0: {
					newBeat.set_duration(4);
					break;
				}
				case 1: {
					newBeat.set_duration(8);
					break;
				}
				case 2: {
					newBeat.set_duration(16);
					break;
				}
				case 3: {
					newBeat.set_duration(32);
					break;
				}
				case 4: {
					newBeat.set_duration(64);
					break;
				}
				default: {
					newBeat.set_duration(4);
					break;
				}
			}
			if ((flags & 32) !== 0) {
				newBeat.set_tupletNumerator(this.readInt32());
				switch (newBeat.get_tupletNumerator()) {
					case 1: {
						newBeat.set_tupletDenominator(1);
						break;
					}
					case 3: {
						newBeat.set_tupletDenominator(2);
						break;
					}
					case 5:
					case 6:
					case 7: {
						newBeat.set_tupletDenominator(4);
						break;
					}
					case 9:
					case 10:
					case 11:
					case 12:
					case 13: {
						newBeat.set_tupletDenominator(8);
						break;
					}
					case 2:
					case 4:
					case 8: {
						break;
					}
					default: {
						newBeat.set_tupletNumerator(1);
						newBeat.set_tupletDenominator(1);
						break;
					}
				}
			}
			if ((flags & 2) !== 0) {
				this.readChord(newBeat);
			}
			if ((flags & 4) !== 0) {
				newBeat.set_text(this.readStringIntUnused());
			}
			if ((flags & 8) !== 0) {
				this.readBeatEffects(newBeat);
			}
			if ((flags & 16) !== 0) {
				this.readMixTableChange(newBeat);
			}
			var stringFlags = this._data.readByte();
			for (var i = 6; i >= 0; i--) {
				if ((stringFlags & 1 << i) !== 0 && 6 - i < track.get_tuning().length) {
					this.readNote(track, bar, voice, newBeat, 6 - i);
				}
			}
			if (this.$_versionNumber >= 500) {
				this._data.readByte();
				var flag = this._data.readByte();
				if ((flag & 8) !== 0) {
					this._data.readByte();
				}
			}
		},
		readChord: function(beat) {
			var chord = new $AlphaTab_Model_Chord();
			var chordId = ss.Guid.newGuid();
			if (this.$_versionNumber >= 500) {
				this.skip(17);
				chord.set_name(this.readStringByteLength(21));
				this.skip(4);
				chord.set_firstFret(this.readInt32());
				for (var i = 0; i < 7; i++) {
					var fret = this.readInt32();
					if (i < chord.get_strings().length) {
						ss.add(chord.get_strings(), fret);
					}
				}
				this.skip(32);
			}
			else if (this._data.readByte() !== 0) {
				// gp4
				if (this.$_versionNumber >= 400) {
					// Sharp (1)
					// Unused (3)
					// Root (1)
					// Major/Minor (1)
					// Nin,Eleven or Thirteen (1)
					// Bass (4)
					// Diminished/Augmented (4)
					// Add (1)
					this.skip(16);
					chord.set_name(this.readStringByteLength(21));
					// Unused (2)
					// Fifth (1)
					// Ninth (1)
					// Eleventh (1)
					this.skip(4);
					chord.set_firstFret(this.readInt32());
					for (var i1 = 0; i1 < 7; i1++) {
						var fret1 = this.readInt32();
						if (i1 < chord.get_strings().length) {
							ss.add(chord.get_strings(), fret1);
						}
					}
					// number of barres (1)
					// Fret of the barre (5)
					// Barree end (5)
					// Omission1,3,5,7,9,11,13 (7)
					// Unused (1)
					// Fingering (7)
					// Show Diagram Fingering (1)
					// ??
					this.skip(32);
				}
				else {
					// unknown
					this.skip(25);
					chord.set_name(this.readStringByteLength(34));
					chord.set_firstFret(this.readInt32());
					for (var i2 = 0; i2 < 6; i2++) {
						var fret2 = this.readInt32();
						ss.add(chord.get_strings(), fret2);
					}
					// unknown
					this.skip(36);
				}
			}
			else {
				var strings = ((this.$_versionNumber >= 406) ? 7 : 6);
				chord.set_name(this.readStringIntByte());
				chord.set_firstFret(this.readInt32());
				if (chord.get_firstFret() > 0) {
					for (var i3 = 0; i3 < strings; i3++) {
						var fret3 = this.readInt32();
						if (i3 < chord.get_strings().length) {
							ss.add(chord.get_strings(), fret3);
						}
					}
				}
			}
			if (!ss.isNullOrEmptyString(chord.get_name())) {
				beat.set_chordId(chordId.toString());
				beat.get_voice().get_bar().get_track().get_chords().set_item(beat.get_chordId(), chord);
			}
		},
		readBeatEffects: function(beat) {
			var flags = this._data.readByte();
			var flags2 = 0;
			if (this.$_versionNumber >= 400) {
				flags2 = this._data.readByte();
			}
			beat.set_fadeIn((flags & 16) !== 0);
			if ((flags & 1) !== 0 || (flags & 2) !== 0) {
				beat.set_vibrato(1);
			}
			beat.set_hasRasgueado((flags2 & 1) !== 0);
			if ((flags & 32) !== 0 && this.$_versionNumber >= 400) {
				var slapPop = this.$readSignedByte();
				switch (slapPop) {
					case 1: {
						beat.set_tap(true);
						break;
					}
					case 2: {
						beat.set_slap(true);
						break;
					}
					case 3: {
						beat.set_pop(true);
						break;
					}
				}
			}
			else if ((flags & 32) !== 0) {
				var slapPop1 = this.$readSignedByte();
				switch (slapPop1) {
					case 1: {
						beat.set_tap(true);
						break;
					}
					case 2: {
						beat.set_slap(true);
						break;
					}
					case 3: {
						beat.set_pop(true);
						break;
					}
				}
				this.skip(4);
			}
			if ((flags2 & 4) !== 0) {
				this.readTremoloBarEffect(beat);
			}
			if ((flags & 64) !== 0) {
				var strokeUp;
				var strokeDown;
				if (this.$_versionNumber < 500) {
					strokeDown = this._data.readByte();
					strokeUp = this._data.readByte();
				}
				else {
					strokeUp = this._data.readByte();
					strokeDown = this._data.readByte();
				}
				if (strokeUp > 0) {
					beat.set_brushType(1);
					beat.set_brushDuration($AlphaTab_Importer_Gp3To5Importer.$toStrokeValue(strokeUp));
				}
				else if (strokeDown > 0) {
					beat.set_brushType(2);
					beat.set_brushDuration($AlphaTab_Importer_Gp3To5Importer.$toStrokeValue(strokeDown));
				}
			}
			if ((flags2 & 2) !== 0) {
				switch (this.$readSignedByte()) {
					case 0: {
						beat.set_pickStroke(0);
						break;
					}
					case 1: {
						beat.set_pickStroke(1);
						break;
					}
					case 2: {
						beat.set_pickStroke(2);
						break;
					}
				}
			}
		},
		readTremoloBarEffect: function(beat) {
			this._data.readByte();
			// type
			this.readInt32();
			// value
			var pointCount = this.readInt32();
			if (pointCount > 0) {
				for (var i = 0; i < pointCount; i++) {
					var point = new $AlphaTab_Model_BendPoint(0, 0);
					point.set_offset(this.readInt32());
					// 0...60
					point.set_value(ss.Int32.div(this.readInt32(), $AlphaTab_Importer_Gp3To5Importer.$bendStep));
					// 0..12 (amount of quarters)
					this.readBool();
					// vibrato
					ss.add(beat.get_whammyBarPoints(), point);
				}
			}
		},
		readMixTableChange: function(beat) {
			var tableChange = new $AlphaTab_Importer_MixTableChange();
			tableChange.set_instrument(this._data.readByte());
			if (this.$_versionNumber >= 500) {
				this.skip(16);
				// Rse Info 
			}
			tableChange.set_volume(this.$readSignedByte());
			tableChange.set_balance(this.$readSignedByte());
			var chorus = this.$readSignedByte();
			var reverb = this.$readSignedByte();
			var phaser = this.$readSignedByte();
			var tremolo = this.$readSignedByte();
			if (this.$_versionNumber >= 500) {
				tableChange.set_tempoName(this.readStringIntByte());
			}
			tableChange.set_tempo(this.readInt32());
			// durations
			if (tableChange.get_volume() >= 0) {
				this._data.readByte();
			}
			if (tableChange.get_balance() >= 0) {
				this._data.readByte();
			}
			if (chorus >= 0) {
				this._data.readByte();
			}
			if (reverb >= 0) {
				this._data.readByte();
			}
			if (phaser >= 0) {
				this._data.readByte();
			}
			if (tremolo >= 0) {
				this._data.readByte();
			}
			if (tableChange.get_tempo() >= 0) {
				tableChange.set_duration(this.$readSignedByte());
				if (this.$_versionNumber >= 510) {
					this._data.readByte();
					// hideTempo (bool)
				}
			}
			if (this.$_versionNumber >= 400) {
				this._data.readByte();
				// all tracks flag
			}
			// unknown
			if (this.$_versionNumber >= 500) {
				this._data.readByte();
			}
			// unknown
			if (this.$_versionNumber >= 510) {
				this.readStringIntByte();
				this.readStringIntByte();
			}
			if (tableChange.get_volume() >= 0) {
				var volumeAutomation = new $AlphaTab_Model_Automation();
				volumeAutomation.set_isLinear(true);
				volumeAutomation.set_type(1);
				volumeAutomation.set_value(tableChange.get_volume());
				ss.add(beat.get_automations(), volumeAutomation);
			}
			if (tableChange.get_balance() >= 0) {
				var balanceAutomation = new $AlphaTab_Model_Automation();
				balanceAutomation.set_isLinear(true);
				balanceAutomation.set_type(3);
				balanceAutomation.set_value(tableChange.get_balance());
				ss.add(beat.get_automations(), balanceAutomation);
			}
			if (tableChange.get_instrument() >= 0) {
				var instrumentAutomation = new $AlphaTab_Model_Automation();
				instrumentAutomation.set_isLinear(true);
				instrumentAutomation.set_type(2);
				instrumentAutomation.set_value(tableChange.get_instrument());
				ss.add(beat.get_automations(), instrumentAutomation);
			}
			if (tableChange.get_tempo() >= 0) {
				var tempoAutomation = new $AlphaTab_Model_Automation();
				tempoAutomation.set_isLinear(true);
				tempoAutomation.set_type(0);
				tempoAutomation.set_value(tableChange.get_tempo());
				ss.add(beat.get_automations(), tempoAutomation);
				beat.get_voice().get_bar().get_masterBar().set_tempoAutomation(tempoAutomation);
			}
		},
		$readSignedByte: function() {
			var n = this._data.readByte();
			if (n >= 128) {
				return n - 256;
			}
			return n;
		},
		readNote: function(track, bar, voice, beat, stringIndex) {
			var newNote = new $AlphaTab_Model_Note();
			newNote.set_string(track.get_tuning().length - stringIndex);
			var flags = this._data.readByte();
			if ((flags & 2) !== 0) {
				newNote.set_accentuated(2);
			}
			else if ((flags & 64) !== 0) {
				newNote.set_accentuated(1);
			}
			newNote.set_isGhost((flags & 4) !== 0);
			if ((flags & 32) !== 0) {
				var noteType = this._data.readByte();
				if (noteType === 3) {
					newNote.set_isDead(true);
				}
				else if (noteType === 2) {
					newNote.set_isTieDestination(true);
				}
			}
			if ((flags & 16) !== 0) {
				var dynamicNumber = this.$readSignedByte();
				newNote.set_dynamic(this.toDynamicValue(dynamicNumber));
				beat.set_dynamic(newNote.get_dynamic());
			}
			if ((flags & 32) !== 0) {
				newNote.set_fret(this.$readSignedByte());
			}
			if ((flags & 128) !== 0) {
				newNote.set_leftHandFinger(this.$readSignedByte());
				newNote.set_rightHandFinger(this.$readSignedByte());
				newNote.set_isFingering(true);
			}
			if (this.$_versionNumber >= 500) {
				if ((flags & 1) !== 0) {
					newNote.set_durationPercent(this.readDouble());
				}
				var flags2 = this._data.readByte();
				newNote.set_swapAccidentals((flags2 & 2) !== 0);
			}
			beat.addNote(newNote);
			if ((flags & 8) !== 0) {
				this.readNoteEffects(track, voice, beat, newNote);
			}
		},
		toDynamicValue: function(value) {
			switch (value) {
				case 1: {
					return 0;
				}
				case 2: {
					return 1;
				}
				case 3: {
					return 2;
				}
				case 4: {
					return 3;
				}
				case 5: {
					return 4;
				}
				case 6: {
					return 5;
				}
				case 7: {
					return 6;
				}
				case 8: {
					return 7;
				}
				default: {
					return 5;
				}
			}
		},
		readNoteEffects: function(track, voice, beat, note) {
			var flags = this._data.readByte();
			var flags2 = 0;
			if (this.$_versionNumber >= 400) {
				flags2 = this._data.readByte();
			}
			if ((flags & 1) !== 0) {
				this.readBend(note);
			}
			if ((flags & 16) !== 0) {
				this.readGrace(voice, note);
			}
			if ((flags2 & 4) !== 0) {
				this.readTremoloPicking(beat);
			}
			if ((flags2 & 8) !== 0) {
				this.readSlide(note);
			}
			else if (this.$_versionNumber < 400) {
				if ((flags & 4) !== 0) {
					note.set_slideType(1);
				}
			}
			if ((flags2 & 16) !== 0) {
				this.readArtificialHarmonic(note);
			}
			else if (this.$_versionNumber < 400) {
				if ((flags & 4) !== 0) {
					note.set_harmonicType(1);
					note.set_harmonicValue(this.deltaFretToHarmonicValue(note.get_fret()));
				}
				if ((flags & 8) !== 0) {
					note.set_harmonicType(2);
				}
			}
			if ((flags2 & 32) !== 0) {
				this.readTrill(note);
			}
			note.set_isLetRing((flags & 8) !== 0);
			note.set_isHammerPullOrigin((flags & 2) !== 0);
			if ((flags2 & 64) !== 0) {
				note.set_vibrato(1);
			}
			note.set_isPalmMute((flags2 & 2) !== 0);
			note.set_isStaccato((flags2 & 1) !== 0);
		},
		readBend: function(note) {
			this._data.readByte();
			// type
			this.readInt32();
			// value
			var pointCount = this.readInt32();
			if (pointCount > 0) {
				for (var i = 0; i < pointCount; i++) {
					var point = new $AlphaTab_Model_BendPoint(0, 0);
					point.set_offset(this.readInt32());
					// 0...60
					point.set_value(ss.Int32.div(this.readInt32(), $AlphaTab_Importer_Gp3To5Importer.$bendStep));
					// 0..12 (amount of quarters)
					this.readBool();
					// vibrato
					ss.add(note.get_bendPoints(), point);
				}
			}
		},
		readGrace: function(voice, note) {
			var graceBeat = new $AlphaTab_Model_Beat();
			var graceNote = new $AlphaTab_Model_Note();
			graceNote.set_string(note.get_string());
			graceNote.set_fret(this.$readSignedByte());
			graceBeat.set_duration(32);
			graceBeat.set_dynamic(this.toDynamicValue(this.$readSignedByte()));
			var transition = this.$readSignedByte();
			switch (transition) {
				case 0: {
					// none
					break;
				}
				case 1: {
					graceNote.set_slideType(2);
					graceNote.set_slideTarget(note);
					break;
				}
				case 2: {
					// bend
					break;
				}
				case 3: {
					// hammer
					graceNote.set_isHammerPullOrigin(true);
					note.set_isHammerPullDestination(true);
					note.set_hammerPullOrigin(graceNote);
					break;
				}
			}
			graceNote.set_dynamic(graceBeat.get_dynamic());
			this.skip(1);
			// duration
			if (this.$_versionNumber < 500) {
				graceBeat.set_graceType(2);
			}
			else {
				var flags = this._data.readByte();
				graceNote.set_isDead((flags & 1) !== 0);
				graceBeat.set_graceType((((flags & 2) !== 0) ? 1 : 2));
			}
			graceBeat.addNote(graceNote);
			voice.addGraceBeat(graceBeat);
		},
		readTremoloPicking: function(beat) {
			var speed = this._data.readByte();
			switch (speed) {
				case 1: {
					beat.set_tremoloSpeed(new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [$AlphaTab_Model_Duration]))(8));
					break;
				}
				case 2: {
					beat.set_tremoloSpeed(new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [$AlphaTab_Model_Duration]))(16));
					break;
				}
				case 3: {
					beat.set_tremoloSpeed(new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [$AlphaTab_Model_Duration]))(32));
					break;
				}
			}
		},
		readSlide: function(note) {
			if (this.$_versionNumber >= 500) {
				var type = this.$readSignedByte();
				switch (type) {
					case 1: {
						note.set_slideType(1);
						break;
					}
					case 2: {
						note.set_slideType(2);
						break;
					}
					case 4: {
						note.set_slideType(6);
						break;
					}
					case 8: {
						note.set_slideType(5);
						break;
					}
					case 16: {
						note.set_slideType(3);
						break;
					}
					case 32: {
						note.set_slideType(4);
						break;
					}
					default: {
						note.set_slideType(0);
						break;
					}
				}
			}
			else {
				var type1 = this.$readSignedByte();
				switch (type1) {
					case 1: {
						note.set_slideType(1);
						break;
					}
					case 2: {
						note.set_slideType(2);
						break;
					}
					case 3: {
						note.set_slideType(6);
						break;
					}
					case 4: {
						note.set_slideType(5);
						break;
					}
					case -1: {
						note.set_slideType(3);
						break;
					}
					case -2: {
						note.set_slideType(4);
						break;
					}
					default: {
						note.set_slideType(0);
						break;
					}
				}
			}
		},
		readArtificialHarmonic: function(note) {
			var type = this._data.readByte();
			if (this.$_versionNumber >= 500) {
				switch (type) {
					case 1: {
						note.set_harmonicType(1);
						note.set_harmonicValue(this.deltaFretToHarmonicValue(note.get_fret()));
						break;
					}
					case 2: {
						// ReSharper disable UnusedVariable
						var harmonicTone = this._data.readByte();
						var harmonicKey = this._data.readByte();
						var harmonicOctaveOffset = this._data.readByte();
						note.set_harmonicType(2);
						// ReSharper restore UnusedVariable
						break;
					}
					case 3: {
						note.set_harmonicType(4);
						note.set_harmonicValue(this.deltaFretToHarmonicValue(this._data.readByte()));
						break;
					}
					case 4: {
						note.set_harmonicType(3);
						note.set_harmonicValue(12);
						break;
					}
					case 5: {
						note.set_harmonicType(5);
						note.set_harmonicValue(12);
						break;
					}
				}
			}
			else if (this.$_versionNumber >= 400) {
				switch (type) {
					case 1: {
						note.set_harmonicType(1);
						break;
					}
					case 3: {
						note.set_harmonicType(4);
						break;
					}
					case 4: {
						note.set_harmonicType(3);
						break;
					}
					case 5: {
						note.set_harmonicType(5);
						break;
					}
					case 15: {
						note.set_harmonicType(2);
						break;
					}
					case 17: {
						note.set_harmonicType(2);
						break;
					}
					case 22: {
						note.set_harmonicType(2);
						break;
					}
				}
			}
		},
		deltaFretToHarmonicValue: function(deltaFret) {
			switch (deltaFret) {
				case 2: {
					return 2.40000009536743;
				}
				case 3: {
					return 3.20000004768372;
				}
				case 4:
				case 5:
				case 7:
				case 9:
				case 12:
				case 16:
				case 17:
				case 19:
				case 24: {
					return deltaFret;
				}
				case 8: {
					return 8.19999980926514;
				}
				case 10: {
					return 9.60000038146973;
				}
				case 14:
				case 15: {
					return 14.6999998092651;
				}
				case 21:
				case 22: {
					return 21.7000007629395;
				}
				default: {
					return 12;
				}
			}
		},
		readTrill: function(note) {
			note.set_trillValue(this._data.readByte() + note.get_stringTuning());
			switch (this._data.readByte()) {
				case 1: {
					note.set_trillSpeed(16);
					break;
				}
				case 2: {
					note.set_trillSpeed(32);
					break;
				}
				case 3: {
					note.set_trillSpeed(64);
					break;
				}
			}
		},
		readDouble: function() {
			var bytes = new $AlphaTab_IO_ByteArray.$ctor1(8);
			this._data.read(bytes, 0, bytes.get_length());
			var sign = 1 - (bytes.get_item(0) >> 7 << 1);
			// sign = bit 0
			var exp = (bytes.get_item(0) << 4 & 2047 | bytes.get_item(1) >> 4) - 1023;
			// exponent = bits 1..11
			var sig = this.getDoubleSig(bytes);
			if (sig === 0 && exp === -1023) {
				return 0;
			}
			return sign * (1 + Math.pow(2, -52) * sig) * Math.pow(2, exp);
		},
		getDoubleSig: function(bytes) {
			return ss.Int32.trunc(((bytes.get_item(1) & 15) << 16 | bytes.get_item(2) << 8 | bytes.get_item(3)) * 4294967296 + (bytes.get_item(4) >> 7) * 2147483648 + ((bytes.get_item(4) & 127) << 24 | bytes.get_item(5) << 16 | bytes.get_item(6) << 8 | bytes.get_item(7)));
		},
		readColor: function() {
			var r = this._data.readByte();
			var g = this._data.readByte();
			var b = this._data.readByte();
			this.skip(1);
			// alpha?
			return new $AlphaTab_Platform_Model_Color(r, g, b, 255);
		},
		readBool: function() {
			return this._data.readByte() !== 0;
		},
		readInt32: function() {
			var ch1 = this._data.readByte();
			var ch2 = this._data.readByte();
			var ch3 = this._data.readByte();
			var ch4 = this._data.readByte();
			return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
		},
		readStringIntUnused: function() {
			this.skip(4);
			return this.readString(this._data.readByte());
		},
		readStringInt: function() {
			return this.readString(this.readInt32());
		},
		readStringIntByte: function() {
			var length = this.readInt32() - 1;
			this._data.readByte();
			return this.readString(length);
		},
		readString: function(length) {
			var b = new $AlphaTab_IO_ByteArray.$ctor1(length);
			this._data.read(b, 0, b.get_length());
			var s = new ss.StringBuilder();
			for (var i = 0; i < b.get_length(); i++) {
				s.appendChar(b.get_item(i));
			}
			return s.toString();
		},
		readStringByteLength: function(length) {
			var stringLength = this._data.readByte();
			var s = this.readString(stringLength);
			if (stringLength < length) {
				this.skip(length - stringLength);
			}
			return s;
		},
		skip: function(count) {
			this._data.seek(count, 1);
		}
	}, $AlphaTab_Importer_ScoreImporter);
	ss.initClass($AlphaTab_Importer_GpxFile, $asm, {
		get_fileName: function() {
			return this.$1$FileNameField;
		},
		set_fileName: function(value) {
			this.$1$FileNameField = value;
		},
		get_fileSize: function() {
			return this.$1$FileSizeField;
		},
		set_fileSize: function(value) {
			this.$1$FileSizeField = value;
		},
		get_data: function() {
			return this.$1$DataField;
		},
		set_data: function(value) {
			this.$1$DataField = value;
		}
	});
	ss.initClass($AlphaTab_Importer_GpxFileSystem, $asm, {
		get_fileFilter: function() {
			return this.$1$FileFilterField;
		},
		set_fileFilter: function(value) {
			this.$1$FileFilterField = value;
		},
		get_files: function() {
			return this.$1$FilesField;
		},
		set_files: function(value) {
			this.$1$FilesField = value;
		},
		load: function(s) {
			var src = new $AlphaTab_IO_BitReader(s);
			this.$readBlock(src);
		},
		readHeader: function(src) {
			return this.$getString(src.readBytes(4), 0, 4);
		},
		decompress: function(src, skipHeader) {
			var uncompressed = new $AlphaTab_IO_MemoryStream();
			var buffer;
			var expectedLength = this.$getInteger(src.readBytes(4), 0);
			try {
				// as long we reach our expected length we try to decompress, a EOF might occure. 
				while (uncompressed.get_length() < expectedLength) {
					// compression flag
					var flag = src.readBits(1);
					if (flag === 1) {
						// get offset and size of the content we need to read.
						// compressed does mean we already have read the data and need 
						// to copy it from our uncompressed buffer to the end
						var wordSize = src.readBits(4);
						var offset = src.readBitsReversed(wordSize);
						var size = src.readBitsReversed(wordSize);
						// the offset is relative to the end
						var sourcePosition = uncompressed.get_length() - offset;
						var toRead = Math.min(offset, size);
						// get the subbuffer storing the data and add it again to the end
						buffer = uncompressed.getBuffer();
						uncompressed.write(buffer, sourcePosition, toRead);
					}
					else {
						// on raw content we need to read the data from the source buffer 
						var size1 = src.readBitsReversed(2);
						for (var i = 0; i < size1; i++) {
							uncompressed.writeByte(src.readByte());
						}
					}
				}
			}
			catch ($t1) {
				$t1 = ss.Exception.wrap($t1);
				if (ss.isInstanceOfType($t1, $AlphaTab_IO_$EndOfStreamException)) {
				}
				else {
					throw $t1;
				}
			}
			buffer = uncompressed.getBuffer();
			var resultOffset = (skipHeader ? 4 : 0);
			var resultSize = uncompressed.get_length() - resultOffset;
			var result = new $AlphaTab_IO_ByteArray.$ctor1(resultSize);
			$AlphaTab_Platform_Std.blockCopy(buffer, resultOffset, result, 0, resultSize);
			return result;
		},
		$readBlock: function(data) {
			var header = this.readHeader(data);
			if (ss.referenceEquals(header, $AlphaTab_Importer_GpxFileSystem.headerBcFz)) {
				// decompress the data and use this 
				// we will skip the header 
				this.$readUncompressedBlock(this.decompress(data, true));
			}
			else if (ss.referenceEquals(header, $AlphaTab_Importer_GpxFileSystem.headerBcFs)) {
				this.$readUncompressedBlock(data.readAll());
			}
			else {
				throw new $AlphaTab_Importer_UnsupportedFormatException();
			}
		},
		$readUncompressedBlock: function(data) {
			// the uncompressed block contains a list of filesystem entires
			// as long we have data we will try to read more entries
			// the first sector (0x1000 bytes) is empty (filled with 0xFF) 
			// so the first sector starts at 0x1000 
			// (we already skipped the 4 byte header so we don't have to take care of this) 
			var sectorSize = 4096;
			var offset = sectorSize;
			// we always need 4 bytes (+3 including offset) to read the type
			while (offset + 3 < data.get_length()) {
				var entryType = this.$getInteger(data, offset);
				if (entryType === 2) {
					// file structure: 
					//   offset |   type   |   size   | what
					//  --------+----------+----------+------
					//    0x04  |  string  |  127byte | FileName (zero terminated)
					//    0x83  |    ?     |    9byte | Unknown 
					//    0x8c  |   int    |    4byte | FileSize
					//    0x90  |    ?     |    4byte | Unknown
					//    0x94  |   int[]  |  n*4byte | Indices of the sector containing the data (end is marked with 0)
					// The sectors marked at 0x94 are absolutely positioned ( 1*0x1000 is sector 1, 2*0x1000 is sector 2,...)
					var file = new $AlphaTab_Importer_GpxFile();
					file.set_fileName(this.$getString(data, offset + 4, 127));
					file.set_fileSize(this.$getInteger(data, offset + 140));
					// store file if needed
					var storeFile = ss.staticEquals(this.get_fileFilter(), null) || this.get_fileFilter()(file.get_fileName());
					if (storeFile) {
						ss.add(this.get_files(), file);
					}
					// we need to iterate the blocks because we need to move after the last datasector
					var dataPointerOffset = offset + 148;
					var sector = 0;
					// this var is storing the sector index
					var sectorCount = 0;
					// we're keeping count so we can calculate the offset of the array item
					// as long we have data blocks we need to iterate them, 
					var fileData = (storeFile ? new $AlphaTab_IO_MemoryStream.$ctor2(file.get_fileSize()) : null);
					while ((sector = this.$getInteger(data, dataPointerOffset + 4 * sectorCount++)) !== 0) {
						// the next file entry starts after the last data sector so we 
						// move the offset along
						offset = sector * sectorSize;
						// write data only if needed
						if (storeFile) {
							fileData.write(data, offset, sectorSize);
						}
					}
					if (storeFile) {
						// trim data to filesize if needed
						file.set_data(new $AlphaTab_IO_ByteArray.$ctor1(Math.min(file.get_fileSize(), fileData.get_length())));
						// we can use the getBuffer here because we are intelligent and know not to read the empty data.
						var raw = fileData.toArray();
						$AlphaTab_Platform_Std.blockCopy(raw, 0, file.get_data(), 0, file.get_data().get_length());
					}
				}
				// let's move to the next sector
				offset += sectorSize;
			}
		},
		$getString: function(data, offset, length) {
			var buf = new ss.StringBuilder();
			for (var i = 0; i < length; i++) {
				var code = data.get_item(offset + i) & 255;
				if (code === 0) {
					break;
				}
				// zero terminated string
				buf.appendChar(code);
			}
			return buf.toString();
		},
		$getInteger: function(data, offset) {
			return data.get_item(offset + 3) << 24 | data.get_item(offset + 2) << 16 | data.get_item(offset + 1) << 8 | data.get_item(offset);
		}
	});
	ss.initClass($AlphaTab_Importer_GpxImporter, $asm, {
		readScore: function() {
			// at first we need to load the binary file system 
			// from the GPX container
			var fileSystem = new $AlphaTab_Importer_GpxFileSystem();
			fileSystem.set_fileFilter(function(s) {
				return ss.referenceEquals(s, $AlphaTab_Importer_GpxFileSystem.scoreGpif);
			});
			fileSystem.load(this._data);
			// convert data to string
			var xml = new ss.StringBuilder();
			var data = fileSystem.get_files()[0].get_data();
			for (var i = 0; i < data.get_length(); i++) {
				xml.appendChar(data.get_item(i));
			}
			// lets set the fileSystem to null, maybe the garbage collector will come along
			// and kick the fileSystem binary data before we finish parsing
			fileSystem.set_files(null);
			fileSystem = null;
			// the score.gpif file within this filesystem stores
			// the score information as XML we need to parse.
			var parser = new $AlphaTab_Importer_GpxParser();
			parser.parseXml(xml.toString());
			parser.get_score().finish();
			return parser.get_score();
		}
	}, $AlphaTab_Importer_ScoreImporter);
	ss.initClass($AlphaTab_Importer_GpxParser, $asm, {
		get_score: function() {
			return this.$1$ScoreField;
		},
		set_score: function(value) {
			this.$1$ScoreField = value;
		},
		parseXml: function(xml) {
			this.$_automations = new (ss.makeGenericType(ss.Dictionary$2, [String, Array]))();
			this.$_tracksMapping = [];
			this.$_tracksById = new (ss.makeGenericType(ss.Dictionary$2, [String, $AlphaTab_Model_Track]))();
			this.$_masterBars = [];
			this.$_barsOfMasterBar = [];
			this.$_voicesOfBar = new (ss.makeGenericType(ss.Dictionary$2, [String, Array]))();
			this.$_barsById = new (ss.makeGenericType(ss.Dictionary$2, [String, $AlphaTab_Model_Bar]))();
			this.$_voiceById = new (ss.makeGenericType(ss.Dictionary$2, [String, $AlphaTab_Model_Voice]))();
			this.$_beatsOfVoice = new (ss.makeGenericType(ss.Dictionary$2, [String, Array]))();
			this.$_beatById = new (ss.makeGenericType(ss.Dictionary$2, [String, $AlphaTab_Model_Beat]))();
			this.$_rhythmOfBeat = new (ss.makeGenericType(ss.Dictionary$2, [String, String]))();
			this.$_rhythmById = new (ss.makeGenericType(ss.Dictionary$2, [String, $AlphaTab_Importer_GpxRhythm]))();
			this.$_notesOfBeat = new (ss.makeGenericType(ss.Dictionary$2, [String, Array]))();
			this.$_noteById = new (ss.makeGenericType(ss.Dictionary$2, [String, $AlphaTab_Model_Note]))();
			this.$_tappedNotes = new (ss.makeGenericType(ss.Dictionary$2, [String, Boolean]))();
			var dom;
			dom = ss.parseXml(xml);
			this.$parseDom(dom);
		},
		$parseDom: function(dom) {
			var root = dom.documentElement;
			if (ss.isNullOrUndefined(root)) {
				return;
			}
			// the XML uses IDs for referring elements within the 
			// model. Therefore we do the parsing in 2 steps:
			// - at first we read all model elements and store them by ID in a lookup table
			// - after that we need to join up the information. 
			if (root.localName === 'GPIF') {
				this.set_score(new $AlphaTab_Model_Score());
				// parse all children
				for (var $t1 = 0; $t1 < root.childNodes.length; $t1++) {
					var n = root.childNodes[$t1];
					if (n.nodeType === 1) {
						switch (n.localName) {
							case 'Score': {
								this.$parseScoreNode(n);
								break;
							}
							case 'MasterTrack': {
								this.$parseMasterTrackNode(n);
								break;
							}
							case 'Tracks': {
								this.$parseTracksNode(n);
								break;
							}
							case 'MasterBars': {
								this.$parseMasterBarsNode(n);
								break;
							}
							case 'Bars': {
								this.$parseBars(n);
								break;
							}
							case 'Voices': {
								this.$parseVoices(n);
								break;
							}
							case 'Beats': {
								this.$parseBeats(n);
								break;
							}
							case 'Notes': {
								this.$parseNotes(n);
								break;
							}
							case 'Rhythms': {
								this.$parseRhythms(n);
								break;
							}
						}
					}
				}
			}
			else {
				throw new $AlphaTab_Importer_UnsupportedFormatException();
			}
			this.$buildModel();
		},
		$parseScoreNode: function(element) {
			for (var $t1 = 0; $t1 < element.childNodes.length; $t1++) {
				var c = element.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Title': {
							this.get_score().set_title(this.$getValue(c.firstChild));
							break;
						}
						case 'SubTitle': {
							this.get_score().set_subTitle(this.$getValue(c.firstChild));
							break;
						}
						case 'Artist': {
							this.get_score().set_artist(this.$getValue(c.firstChild));
							break;
						}
						case 'Album': {
							this.get_score().set_album(this.$getValue(c.firstChild));
							break;
						}
						case 'Words': {
							this.get_score().set_words(this.$getValue(c.firstChild));
							break;
						}
						case 'Music': {
							this.get_score().set_music(this.$getValue(c.firstChild));
							break;
						}
						case 'WordsAndMusic': {
							if (ss.isValue(c.firstChild) && c.firstChild.toString() !== '') {
								this.get_score().set_words(this.$getValue(c.firstChild));
								this.get_score().set_music(this.$getValue(c.firstChild));
							}
							break;
						}
						case 'Copyright': {
							this.get_score().set_copyright(this.$getValue(c.firstChild));
							break;
						}
						case 'Tabber': {
							this.get_score().set_tab(this.$getValue(c.firstChild));
							break;
						}
					}
				}
			}
		},
		$parseMasterTrackNode: function(node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Automations': {
							this.$parseAutomations(c);
							break;
						}
						case 'Tracks': {
							this.$_tracksMapping = this.$getValue(c).split(String.fromCharCode(32));
							break;
						}
					}
				}
			}
		},
		$parseAutomations: function(node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Automation': {
							this.$parseAutomation(c);
							break;
						}
					}
				}
			}
		},
		$parseAutomation: function(node) {
			var type = null;
			var isLinear = false;
			var barId = null;
			var ratioPosition = 0;
			var value = 0;
			var reference = 0;
			var text = null;
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Type': {
							type = this.$getValue(c);
							break;
						}
						case 'Linear': {
							isLinear = this.$getValue(c).toLowerCase() === 'true';
							break;
						}
						case 'Bar': {
							barId = this.$getValue(c);
							break;
						}
						case 'Position': {
							ratioPosition = $AlphaTab_Platform_Std.parseFloat(this.$getValue(c));
							break;
						}
						case 'Value': {
							var parts = this.$getValue(c).split(String.fromCharCode(32));
							value = $AlphaTab_Platform_Std.parseFloat(parts[0]);
							reference = $AlphaTab_Platform_Std.parseInt(parts[1]);
							break;
						}
						case 'Text': {
							text = this.$getValue(c);
							break;
						}
					}
				}
			}
			if (ss.isNullOrUndefined(type)) {
				return;
			}
			var automation = null;
			switch (type) {
				case 'Tempo': {
					automation = $AlphaTab_Model_Automation.buildTempoAutomation(isLinear, ratioPosition, value, reference);
					break;
				}
			}
			if (ss.isValue(automation)) {
				automation.set_text(text);
			}
			if (ss.isValue(barId)) {
				if (!this.$_automations.containsKey(barId)) {
					this.$_automations.set_item(barId, []);
				}
				ss.add(this.$_automations.get_item(barId), automation);
			}
		},
		$parseTracksNode: function(node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Track': {
							this.$parseTrack(c);
							break;
						}
					}
				}
			}
		},
		$parseTrack: function(node) {
			var track = new $AlphaTab_Model_Track();
			var trackId = node.attributes['id'].value;
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Name': {
							track.set_name(this.$getValue(c));
							break;
						}
						case 'ShortName': {
							track.set_shortName(this.$getValue(c));
							break;
						}
						case 'Properties': {
							this.$parseTrackProperties(track, c);
							break;
						}
						case 'GeneralMidi': {
							this.$parseGeneralMidi(track, c);
							break;
						}
						case 'PlaybackState': {
							var state = this.$getValue(c);
							track.get_playbackInfo().set_isSolo(state === 'Solo');
							track.get_playbackInfo().set_isMute(state === 'Mute');
							break;
						}
					}
				}
			}
			this.$_tracksById.set_item(trackId, track);
		},
		$parseDiagramCollection: function(track, node) {
			var items = this.$findChildElement(node, 'Items');
			for (var $t1 = 0; $t1 < items.childNodes.length; $t1++) {
				var c = items.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Item': {
							this.$parseDiagramItem(track, c);
							break;
						}
					}
				}
			}
		},
		$parseDiagramItem: function(track, node) {
			var chord = new $AlphaTab_Model_Chord();
			var chordId = node.attributes['id'].value;
			chord.set_name(node.attributes['name'].value);
			track.get_chords().set_item(chordId, chord);
		},
		$findChildElement: function(node, name) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1 && ss.referenceEquals(c.localName, name)) {
					return c;
				}
			}
			return null;
		},
		$parseTrackProperties: function(track, node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Property': {
							this.$parseTrackProperty(track, c);
							break;
						}
					}
				}
			}
		},
		$parseTrackProperty: function(track, node) {
			var propertyName = node.attributes['name'].value;
			switch (propertyName) {
				case 'Tuning': {
					var tuningParts = this.$getValue(this.$findChildElement(node, 'Pitches')).split(String.fromCharCode(32));
					var tuning = new Array(tuningParts.length);
					for (var i = 0; i < tuning.length; i++) {
						tuning[tuning.length - 1 - i] = $AlphaTab_Platform_Std.parseInt(tuningParts[i]);
					}
					track.set_tuning(ss.arrayClone(tuning));
					break;
				}
				case 'DiagramCollection': {
					this.$parseDiagramCollection(track, node);
					break;
				}
				case 'CapoFret': {
					track.set_capo($AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(node, 'Fret'))));
					break;
				}
			}
		},
		$parseGeneralMidi: function(track, node) {
			var e = node;
			track.get_playbackInfo().set_port($AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(node, 'Port'))));
			track.get_playbackInfo().set_program($AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(node, 'Program'))));
			track.get_playbackInfo().set_primaryChannel($AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(node, 'PrimaryChannel'))));
			track.get_playbackInfo().set_secondaryChannel($AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(node, 'SecondaryChannel'))));
			track.set_isPercussion(ss.isValue(e.attributes['table']) && e.attributes['table'].value === 'Percussion');
		},
		$parseMasterBarsNode: function(node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'MasterBar': {
							this.$parseMasterBar(c);
							break;
						}
					}
				}
			}
		},
		$parseMasterBar: function(node) {
			var masterBar = new $AlphaTab_Model_MasterBar();
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					var e = c;
					switch (c.localName) {
						case 'Time': {
							var timeParts = this.$getValue(c).split(String.fromCharCode(47));
							masterBar.set_timeSignatureNumerator($AlphaTab_Platform_Std.parseInt(timeParts[0]));
							masterBar.set_timeSignatureDenominator($AlphaTab_Platform_Std.parseInt(timeParts[1]));
							break;
						}
						case 'DoubleBar': {
							masterBar.set_isDoubleBar(true);
							break;
						}
						case 'Section': {
							masterBar.set_section(new $AlphaTab_Model_Section());
							masterBar.get_section().set_marker(this.$getValue(this.$findChildElement(c, 'Letter')));
							masterBar.get_section().set_text(this.$getValue(this.$findChildElement(c, 'Text')));
							break;
						}
						case 'Repeat': {
							if (e.attributes['start'].value.toLowerCase() === 'true') {
								masterBar.set_isRepeatStart(true);
							}
							if (e.attributes['end'].value.toLowerCase() === 'true' && ss.isValue(e.attributes['count'].value)) {
								masterBar.set_repeatCount($AlphaTab_Platform_Std.parseInt(e.attributes['count'].value));
							}
							break;
						}
						case 'AlternateEndings': {
							var alternateEndings = this.$getValue(c).split(String.fromCharCode(32));
							var i = 0;
							for (var k = 0; k < alternateEndings.length; k++) {
								i |= 1 << -1 + $AlphaTab_Platform_Std.parseInt(alternateEndings[i]);
							}
							masterBar.set_alternateEndings(i);
							break;
						}
						case 'Bars': {
							ss.add(this.$_barsOfMasterBar, this.$getValue(c).split(String.fromCharCode(32)));
							break;
						}
						case 'TripletFeel': {
							switch (this.$getValue(c)) {
								case 'NoTripletFeel': {
									masterBar.set_tripletFeel(0);
									break;
								}
								case 'Triplet8th': {
									masterBar.set_tripletFeel(2);
									break;
								}
								case 'Triplet16th': {
									masterBar.set_tripletFeel(1);
									break;
								}
								case 'Dotted8th': {
									masterBar.set_tripletFeel(4);
									break;
								}
								case 'Dotted16th': {
									masterBar.set_tripletFeel(3);
									break;
								}
								case 'Scottish8th': {
									masterBar.set_tripletFeel(6);
									break;
								}
								case 'Scottish16th': {
									masterBar.set_tripletFeel(5);
									break;
								}
							}
							break;
						}
						case 'Key': {
							masterBar.set_keySignature($AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(c, 'AccidentalCount'))));
							break;
						}
					}
				}
			}
			ss.add(this.$_masterBars, masterBar);
		},
		$parseBars: function(node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Bar': {
							this.$parseBar(c);
							break;
						}
					}
				}
			}
		},
		$parseBar: function(node) {
			var bar = new $AlphaTab_Model_Bar();
			var barId = node.attributes['id'].value;
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Voices': {
							this.$_voicesOfBar.set_item(barId, this.$getValue(c).split(String.fromCharCode(32)));
							break;
						}
						case 'Clef': {
							switch (this.$getValue(c)) {
								case 'Neutral': {
									bar.set_clef(0);
									break;
								}
								case 'G2': {
									bar.set_clef(4);
									break;
								}
								case 'F4': {
									bar.set_clef(3);
									break;
								}
								case 'C4': {
									bar.set_clef(2);
									break;
								}
								case 'C3': {
									bar.set_clef(1);
									break;
								}
							}
							break;
						}
					}
				}
			}
			this.$_barsById.set_item(barId, bar);
		},
		$parseVoices: function(node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Voice': {
							this.$parseVoice(c);
							break;
						}
					}
				}
			}
		},
		$parseVoice: function(node) {
			var voice = new $AlphaTab_Model_Voice();
			var voiceId = node.attributes['id'].value;
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Beats': {
							this.$_beatsOfVoice.set_item(voiceId, this.$getValue(c).split(String.fromCharCode(32)));
							break;
						}
					}
				}
			}
			this.$_voiceById.set_item(voiceId, voice);
		},
		$parseBeats: function(node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Beat': {
							this.$parseBeat(c);
							break;
						}
					}
				}
			}
		},
		$parseBeat: function(node) {
			var beat = new $AlphaTab_Model_Beat();
			var beatId = node.attributes['id'].value;
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					var e = c;
					switch (c.localName) {
						case 'Notes': {
							this.$_notesOfBeat.set_item(beatId, this.$getValue(c).split(String.fromCharCode(32)));
							break;
						}
						case 'Rhythm': {
							this.$_rhythmOfBeat.set_item(beatId, e.attributes['ref'].value);
							break;
						}
						case 'Fadding': {
							if (this.$getValue(c) === 'FadeIn') {
								beat.set_fadeIn(true);
							}
							break;
						}
						case 'Tremolo': {
							switch (this.$getValue(c)) {
								case '1/2': {
									beat.set_tremoloSpeed(new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [$AlphaTab_Model_Duration]))(8));
									break;
								}
								case '1/4': {
									beat.set_tremoloSpeed(new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [$AlphaTab_Model_Duration]))(16));
									break;
								}
								case '1/8': {
									beat.set_tremoloSpeed(new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [$AlphaTab_Model_Duration]))(32));
									break;
								}
							}
							break;
						}
						case 'Chord': {
							beat.set_chordId(this.$getValue(c));
							break;
						}
						case 'Hairpin': {
							switch (this.$getValue(c)) {
								case 'Crescendo': {
									beat.set_crescendo(1);
									break;
								}
								case 'Decrescendo': {
									beat.set_crescendo(2);
									break;
								}
							}
							break;
						}
						case 'Arpeggio': {
							if (this.$getValue(c) === 'Up') {
								beat.set_brushType(3);
							}
							else {
								beat.set_brushType(4);
							}
							break;
						}
						case 'Properties': {
							this.$parseBeatProperties(c, beat);
							break;
						}
						case 'FreeText': {
							beat.set_text(this.$getValue(c));
							break;
						}
						case 'Dynamic': {
							switch (this.$getValue(c)) {
								case 'PPP': {
									beat.set_dynamic(0);
									break;
								}
								case 'PP': {
									beat.set_dynamic(1);
									break;
								}
								case 'P': {
									beat.set_dynamic(2);
									break;
								}
								case 'MP': {
									beat.set_dynamic(3);
									break;
								}
								case 'MF': {
									beat.set_dynamic(4);
									break;
								}
								case 'F': {
									beat.set_dynamic(5);
									break;
								}
								case 'FF': {
									beat.set_dynamic(6);
									break;
								}
								case 'FFF': {
									beat.set_dynamic(7);
									break;
								}
							}
							break;
						}
						case 'GraceNotes': {
							switch (this.$getValue(c)) {
								case 'OnBeat': {
									beat.set_graceType(1);
									break;
								}
								case 'BeforeBeat': {
									beat.set_graceType(2);
									break;
								}
							}
							break;
						}
					}
				}
			}
			this.$_beatById.set_item(beatId, beat);
		},
		$parseBeatProperties: function(node, beat) {
			var isWhammy = false;
			var whammyOrigin = null;
			var whammyMiddleValue = null;
			var whammyMiddleOffset1 = null;
			var whammyMiddleOffset2 = null;
			var whammyDestination = null;
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					var e = c;
					switch (c.localName) {
						case 'Property': {
							var name = e.attributes['name'].value;
							switch (name) {
								case 'Brush': {
									if (this.$getValue(this.$findChildElement(c, 'Direction')) === 'Up') {
										beat.set_brushType(1);
									}
									else {
										beat.set_brushType(2);
									}
									break;
								}
								case 'PickStroke': {
									if (this.$getValue(this.$findChildElement(c, 'Direction')) === 'Up') {
										beat.set_pickStroke(1);
									}
									else {
										beat.set_pickStroke(2);
									}
									break;
								}
								case 'Slapped': {
									if (ss.isValue(this.$findChildElement(c, 'Enable'))) {
										beat.set_slap(true);
									}
									break;
								}
								case 'Popped': {
									if (ss.isValue(this.$findChildElement(c, 'Enable'))) {
										beat.set_pop(true);
									}
									break;
								}
								case 'VibratoWTremBar': {
									switch (this.$getValue(this.$findChildElement(c, 'Strength'))) {
										case 'Wide': {
											beat.set_vibrato(2);
											break;
										}
										case 'Slight': {
											beat.set_vibrato(1);
											break;
										}
									}
									break;
								}
								case 'WhammyBar': {
									isWhammy = true;
									break;
								}
								case 'WhammyBarExtend':
								case 'WhammyBarOriginValue': {
									if (ss.isNullOrUndefined(whammyOrigin)) {
										whammyOrigin = new $AlphaTab_Model_BendPoint(0, 0);
									}
									whammyOrigin.set_value(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointValueFactor));
									break;
								}
								case 'WhammyBarOriginOffset': {
									if (ss.isNullOrUndefined(whammyOrigin)) {
										whammyOrigin = new $AlphaTab_Model_BendPoint(0, 0);
									}
									whammyOrigin.set_offset(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointPositionFactor));
									break;
								}
								case 'WhammyBarMiddleValue': {
									whammyMiddleValue = new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [ss.Int32]))(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointValueFactor));
									break;
								}
								case 'WhammyBarMiddleOffset1': {
									whammyMiddleOffset1 = new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [ss.Int32]))(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointPositionFactor));
									break;
								}
								case 'WhammyBarMiddleOffset2': {
									whammyMiddleOffset2 = new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [ss.Int32]))(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointPositionFactor));
									break;
								}
								case 'WhammyBarDestinationValue': {
									if (ss.isNullOrUndefined(whammyDestination)) {
										whammyDestination = new $AlphaTab_Model_BendPoint($AlphaTab_Model_BendPoint.maxPosition, 0);
									}
									whammyDestination.set_value(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointValueFactor));
									break;
								}
								case 'WhammyBarDestinationOffset': {
									if (ss.isNullOrUndefined(whammyDestination)) {
										whammyDestination = new $AlphaTab_Model_BendPoint(0, 0);
									}
									whammyDestination.set_offset(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointPositionFactor));
									break;
								}
							}
							break;
						}
					}
				}
			}
			if (isWhammy) {
				if (ss.isNullOrUndefined(whammyOrigin)) {
					whammyOrigin = new $AlphaTab_Model_BendPoint(0, 0);
				}
				if (ss.isNullOrUndefined(whammyDestination)) {
					whammyDestination = new $AlphaTab_Model_BendPoint($AlphaTab_Model_BendPoint.maxPosition, 0);
				}
				var whammy = [];
				ss.add(whammy, whammyOrigin);
				if (ss.isValue(whammyMiddleOffset1) && ss.isValue(whammyMiddleValue)) {
					ss.add(whammy, new $AlphaTab_Model_BendPoint(whammyMiddleOffset1.get_value(), whammyMiddleValue.get_value()));
				}
				if (ss.isValue(whammyMiddleOffset2) && ss.isValue(whammyMiddleValue)) {
					ss.add(whammy, new $AlphaTab_Model_BendPoint(whammyMiddleOffset2.get_value(), whammyMiddleValue.get_value()));
				}
				if (ss.isNullOrUndefined(whammyMiddleOffset1) && ss.isNullOrUndefined(whammyMiddleOffset2) && ss.isValue(whammyMiddleValue)) {
					ss.add(whammy, new $AlphaTab_Model_BendPoint(30, whammyMiddleValue.get_value()));
				}
				ss.add(whammy, whammyDestination);
				beat.set_whammyBarPoints(whammy);
			}
		},
		$parseNotes: function(node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Note': {
							this.$parseNote(c);
							break;
						}
					}
				}
			}
		},
		$parseNote: function(node) {
			var note = new $AlphaTab_Model_Note();
			var noteId = node.attributes['id'].value;
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					var e = c;
					switch (c.localName) {
						case 'Properties': {
							this.$parseNoteProperties(c, note, noteId);
							break;
						}
						case 'AntiAccent': {
							if (this.$getValue(c).toLowerCase() === 'normal') {
								note.set_isGhost(true);
							}
							break;
						}
						case 'LetRing': {
							note.set_isLetRing(true);
							break;
						}
						case 'Trill': {
							note.set_trillValue($AlphaTab_Platform_Std.parseInt(this.$getValue(c)));
							note.set_trillSpeed(16);
							break;
						}
						case 'Accent': {
							var accentFlags = $AlphaTab_Platform_Std.parseInt(this.$getValue(c));
							if ((accentFlags & 1) !== 0) {
								note.set_isStaccato(true);
							}
							if ((accentFlags & 4) !== 0) {
								note.set_accentuated(2);
							}
							if ((accentFlags & 8) !== 0) {
								note.set_accentuated(1);
							}
							break;
						}
						case 'Tie': {
							if (e.attributes['origin'].value.toLowerCase() === 'true') {
								note.set_isTieOrigin(true);
							}
							if (e.attributes['destination'].value.toLowerCase() === 'true') {
								note.set_isTieDestination(true);
							}
							break;
						}
						case 'Vibrato': {
							switch (this.$getValue(c)) {
								case 'Slight': {
									note.set_vibrato(1);
									break;
								}
								case 'Wide': {
									note.set_vibrato(2);
									break;
								}
							}
							break;
						}
					}
				}
			}
			this.$_noteById.set_item(noteId, note);
		},
		$parseNoteProperties: function(node, note, noteId) {
			var isBended = false;
			var bendOrigin = null;
			var bendMiddleValue = null;
			var bendMiddleOffset1 = null;
			var bendMiddleOffset2 = null;
			var bendDestination = null;
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					var e = c;
					switch (c.localName) {
						case 'Property': {
							var name = e.attributes['name'].value;
							switch (name) {
								case 'String': {
									note.set_string($AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(c, 'String'))) + 1);
									break;
								}
								case 'Fret': {
									note.set_fret($AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(c, 'Fret'))));
									break;
								}
								case 'Tapped': {
									this.$_tappedNotes.set_item(noteId, true);
									break;
								}
								case 'HarmonicType': {
									var htype = this.$findChildElement(c, 'HType');
									if (ss.isValue(htype)) {
										switch (this.$getValue(htype)) {
											case 'NoHarmonic': {
												note.set_harmonicType(0);
												break;
											}
											case 'Natural': {
												note.set_harmonicType(1);
												break;
											}
											case 'Artificial': {
												note.set_harmonicType(2);
												break;
											}
											case 'Pinch': {
												note.set_harmonicType(3);
												break;
											}
											case 'Tap': {
												note.set_harmonicType(4);
												break;
											}
											case 'Semi': {
												note.set_harmonicType(5);
												break;
											}
											case 'Feedback': {
												note.set_harmonicType(6);
												break;
											}
										}
									}
									break;
								}
								case 'HarmonicFret': {
									var hfret = this.$findChildElement(c, 'HFret');
									if (ss.isValue(hfret)) {
										note.set_harmonicValue($AlphaTab_Platform_Std.parseFloat(this.$getValue(hfret)));
									}
									break;
								}
								case 'PalmMuted': {
									if (ss.isValue(this.$findChildElement(c, 'Enable'))) {
										note.set_isPalmMute(true);
									}
									break;
								}
								case 'Octave': {
									note.set_octave($AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(c, 'Number'))));
									break;
								}
								case 'Bended': {
									isBended = true;
									break;
								}
								case 'BendOriginValue': {
									if (ss.isNullOrUndefined(bendOrigin)) {
										bendOrigin = new $AlphaTab_Model_BendPoint(0, 0);
									}
									bendOrigin.set_value(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointValueFactor));
									break;
								}
								case 'BendOriginOffset': {
									if (ss.isNullOrUndefined(bendOrigin)) {
										bendOrigin = new $AlphaTab_Model_BendPoint(0, 0);
									}
									bendOrigin.set_offset(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointPositionFactor));
									break;
								}
								case 'BendMiddleValue': {
									bendMiddleValue = new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [ss.Int32]))(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointValueFactor));
									break;
								}
								case 'BendMiddleOffset1': {
									bendMiddleOffset1 = new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [ss.Int32]))(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointPositionFactor));
									break;
								}
								case 'BendMiddleOffset2': {
									bendMiddleOffset2 = new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [ss.Int32]))(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointPositionFactor));
									break;
								}
								case 'BendDestinationValue': {
									if (ss.isNullOrUndefined(bendDestination)) {
										bendDestination = new $AlphaTab_Model_BendPoint($AlphaTab_Model_BendPoint.maxPosition, 0);
									}
									bendDestination.set_value(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointValueFactor));
									break;
								}
								case 'BendDestinationOffset': {
									if (ss.isNullOrUndefined(bendDestination)) {
										bendDestination = new $AlphaTab_Model_BendPoint(0, 0);
									}
									bendDestination.set_offset(ss.Int32.trunc($AlphaTab_Platform_Std.parseFloat(this.$getValue(this.$findChildElement(c, 'Float'))) * $AlphaTab_Importer_GpxParser.$bendPointPositionFactor));
									break;
								}
								case 'HopoOrigin': {
									if (ss.isValue(this.$findChildElement(c, 'Enable'))) {
										note.set_isHammerPullOrigin(true);
									}
									break;
								}
								case 'HopoDestination':
								case 'Slide': {
									// NOTE: gets automatically calculated 
									// if (FindChildElement(node, "Enable") != null)
									//     note.isHammerPullDestination = true;
									var slideFlags = $AlphaTab_Platform_Std.parseInt(this.$getValue(this.$findChildElement(c, 'Flags')));
									if ((slideFlags & 1) !== 0) {
										note.set_slideType(1);
									}
									if ((slideFlags & 2) !== 0) {
										note.set_slideType(2);
									}
									if ((slideFlags & 4) !== 0) {
										note.set_slideType(6);
									}
									if ((slideFlags & 8) !== 0) {
										note.set_slideType(5);
									}
									if ((slideFlags & 16) !== 0) {
										note.set_slideType(3);
									}
									if ((slideFlags & 32) !== 0) {
										note.set_slideType(4);
									}
									break;
								}
							}
							break;
						}
					}
				}
			}
			if (isBended) {
				if (ss.isNullOrUndefined(bendOrigin)) {
					bendOrigin = new $AlphaTab_Model_BendPoint(0, 0);
				}
				if (ss.isNullOrUndefined(bendDestination)) {
					bendDestination = new $AlphaTab_Model_BendPoint($AlphaTab_Model_BendPoint.maxPosition, 0);
				}
				var bend = [];
				ss.add(bend, bendOrigin);
				if (ss.isValue(bendMiddleOffset1) && ss.isValue(bendMiddleValue)) {
					ss.add(bend, new $AlphaTab_Model_BendPoint(bendMiddleOffset1.get_value(), bendMiddleValue.get_value()));
				}
				if (ss.isValue(bendMiddleOffset2) && ss.isValue(bendMiddleValue)) {
					ss.add(bend, new $AlphaTab_Model_BendPoint(bendMiddleOffset2.get_value(), bendMiddleValue.get_value()));
				}
				if (ss.isNullOrUndefined(bendMiddleOffset1) && ss.isNullOrUndefined(bendMiddleOffset2) && ss.isValue(bendMiddleValue)) {
					ss.add(bend, new $AlphaTab_Model_BendPoint(30, bendMiddleValue.get_value()));
				}
				ss.add(bend, bendDestination);
				note.set_bendPoints(bend);
			}
		},
		$parseRhythms: function(node) {
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					switch (c.localName) {
						case 'Rhythm': {
							this.$parseRhythm(c);
							break;
						}
					}
				}
			}
		},
		$parseRhythm: function(node) {
			var rhythm = new $AlphaTab_Importer_GpxRhythm();
			var rhythmId = node.attributes['id'].value;
			for (var $t1 = 0; $t1 < node.childNodes.length; $t1++) {
				var c = node.childNodes[$t1];
				if (c.nodeType === 1) {
					var e = c;
					switch (c.localName) {
						case 'NoteValue': {
							switch (this.$getValue(c)) {
								case 'Whole': {
									rhythm.set_value(1);
									break;
								}
								case 'Half': {
									rhythm.set_value(2);
									break;
								}
								case 'Quarter': {
									rhythm.set_value(4);
									break;
								}
								case 'Eighth': {
									rhythm.set_value(8);
									break;
								}
								case '16th': {
									rhythm.set_value(16);
									break;
								}
								case '32nd': {
									rhythm.set_value(32);
									break;
								}
								case '64th': {
									rhythm.set_value(64);
									// case "128th":
									// case "256th":
									break;
								}
							}
							break;
						}
						case 'PrimaryTuplet': {
							rhythm.set_tupletNumerator($AlphaTab_Platform_Std.parseInt(e.attributes['num'].value));
							rhythm.set_tupletDenominator($AlphaTab_Platform_Std.parseInt(e.attributes['den'].value));
							break;
						}
						case 'AugmentationDot': {
							rhythm.set_dots($AlphaTab_Platform_Std.parseInt(e.attributes['cound'].value));
							break;
						}
					}
				}
			}
			this.$_rhythmById.set_item(rhythmId, rhythm);
		},
		$getValue: function(n) {
			if (n.nodeType === 1 || n.nodeType === 9) {
				var txt = new ss.StringBuilder();
				for (var $t1 = 0; $t1 < n.childNodes.length; $t1++) {
					var childNode = n.childNodes[$t1];
					txt.append(this.$getValue(childNode));
				}
				return txt.toString().trim();
			}
			return n.nodeValue;
		},
		$buildModel: function() {
			// build beats
			var $t1 = ss.getEnumerator(this.$_beatById.get_keys());
			try {
				while ($t1.moveNext()) {
					var beatId = $t1.current();
					var beat = this.$_beatById.get_item(beatId);
					var rhythmId = this.$_rhythmOfBeat.get_item(beatId);
					var rhythm = this.$_rhythmById.get_item(rhythmId);
					// set beat duration
					beat.set_duration(rhythm.get_value());
					beat.set_dots(rhythm.get_dots());
					beat.set_tupletNumerator(rhythm.get_tupletNumerator());
					beat.set_tupletDenominator(rhythm.get_tupletDenominator());
					// add notes to beat
					if (this.$_notesOfBeat.containsKey(beatId)) {
						var $t2 = this.$_notesOfBeat.get_item(beatId);
						for (var $t3 = 0; $t3 < $t2.length; $t3++) {
							var noteId = $t2[$t3];
							if (!ss.referenceEquals(noteId, $AlphaTab_Importer_GpxParser.$invalidId)) {
								beat.addNote(this.$_noteById.get_item(noteId));
								if (this.$_tappedNotes.containsKey(noteId)) {
									beat.set_tap(true);
								}
							}
						}
					}
				}
			}
			finally {
				$t1.dispose();
			}
			// build voices
			var $t4 = ss.getEnumerator(this.$_voiceById.get_keys());
			try {
				while ($t4.moveNext()) {
					var voiceId = $t4.current();
					var voice = this.$_voiceById.get_item(voiceId);
					if (this.$_beatsOfVoice.containsKey(voiceId)) {
						// add beats to voices
						var $t5 = this.$_beatsOfVoice.get_item(voiceId);
						for (var $t6 = 0; $t6 < $t5.length; $t6++) {
							var beatId1 = $t5[$t6];
							if (!ss.referenceEquals(beatId1, $AlphaTab_Importer_GpxParser.$invalidId)) {
								// important! we clone the beat because beats get reused
								// in gp6, our model needs to have unique beats.
								voice.addBeat(this.$_beatById.get_item(beatId1).clone());
							}
						}
					}
				}
			}
			finally {
				$t4.dispose();
			}
			// build bars
			var $t7 = ss.getEnumerator(this.$_barsById.get_keys());
			try {
				while ($t7.moveNext()) {
					var barId = $t7.current();
					var bar = this.$_barsById.get_item(barId);
					if (this.$_voicesOfBar.containsKey(barId)) {
						// add voices to bars
						var $t8 = this.$_voicesOfBar.get_item(barId);
						for (var $t9 = 0; $t9 < $t8.length; $t9++) {
							var voiceId1 = $t8[$t9];
							if (!ss.referenceEquals(voiceId1, $AlphaTab_Importer_GpxParser.$invalidId)) {
								bar.addVoice(this.$_voiceById.get_item(voiceId1));
							}
							else {
								// invalid voice -> empty voice
								var voice1 = new $AlphaTab_Model_Voice();
								bar.addVoice(voice1);
								var beat1 = new $AlphaTab_Model_Beat();
								beat1.set_isEmpty(true);
								beat1.set_duration(4);
								voice1.addBeat(beat1);
							}
						}
					}
				}
			}
			finally {
				$t7.dispose();
			}
			// build tracks (not all, only those used by the score)
			var trackIndex = 0;
			for (var $t10 = 0; $t10 < this.$_tracksMapping.length; $t10++) {
				var trackId = this.$_tracksMapping[$t10];
				var track = this.$_tracksById.get_item(trackId);
				this.get_score().addTrack(track);
				// iterate all bar definitions for the masterbars
				// and add the correct bar to the track
				for (var $t11 = 0; $t11 < this.$_barsOfMasterBar.length; $t11++) {
					var barIds = this.$_barsOfMasterBar[$t11];
					var barId1 = barIds[trackIndex];
					if (!ss.referenceEquals(barId1, $AlphaTab_Importer_GpxParser.$invalidId)) {
						track.addBar(this.$_barsById.get_item(barId1));
					}
				}
				trackIndex++;
			}
			// build automations
			var $t12 = ss.getEnumerator(this.$_automations.get_keys());
			try {
				while ($t12.moveNext()) {
					var barId2 = $t12.current();
					var bar1 = this.$_barsById.get_item(barId2);
					var $t13 = bar1.get_voices();
					for (var $t14 = 0; $t14 < $t13.length; $t14++) {
						var v = $t13[$t14];
						if (v.get_beats().length > 0) {
							var $t15 = this.$_automations.get_item(barId2);
							for (var $t16 = 0; $t16 < $t15.length; $t16++) {
								var automation = $t15[$t16];
								ss.add(v.get_beats()[0].get_automations(), automation);
							}
						}
					}
				}
			}
			finally {
				$t12.dispose();
			}
			// build score
			for (var $t17 = 0; $t17 < this.$_masterBars.length; $t17++) {
				var masterBar = this.$_masterBars[$t17];
				this.get_score().addMasterBar(masterBar);
			}
			// build automations
			var $t18 = ss.getEnumerator(this.$_automations.get_keys());
			try {
				while ($t18.moveNext()) {
					var barId3 = $t18.current();
					var automations = this.$_automations.get_item(barId3);
					var bar2 = this.$_barsById.get_item(barId3);
					for (var $t19 = 0; $t19 < automations.length; $t19++) {
						var automation1 = automations[$t19];
						if (automation1.get_type() === 0) {
							if (barId3 === '0') {
								this.get_score().set_tempo(ss.Int32.trunc(automation1.get_value()));
								this.get_score().set_tempoLabel(automation1.get_text());
							}
							bar2.get_masterBar().set_tempoAutomation(automation1);
						}
					}
				}
			}
			finally {
				$t18.dispose();
			}
		}
	});
	ss.initClass($AlphaTab_Importer_GpxRhythm, $asm, {
		get_dots: function() {
			return this.$1$DotsField;
		},
		set_dots: function(value) {
			this.$1$DotsField = value;
		},
		get_tupletDenominator: function() {
			return this.$1$TupletDenominatorField;
		},
		set_tupletDenominator: function(value) {
			this.$1$TupletDenominatorField = value;
		},
		get_tupletNumerator: function() {
			return this.$1$TupletNumeratorField;
		},
		set_tupletNumerator: function(value) {
			this.$1$TupletNumeratorField = value;
		},
		get_value: function() {
			return this.$1$ValueField;
		},
		set_value: function(value) {
			this.$1$ValueField = value;
		}
	});
	ss.initClass($AlphaTab_Importer_MixTableChange, $asm, {
		get_volume: function() {
			return this.$1$VolumeField;
		},
		set_volume: function(value) {
			this.$1$VolumeField = value;
		},
		get_balance: function() {
			return this.$1$BalanceField;
		},
		set_balance: function(value) {
			this.$1$BalanceField = value;
		},
		get_instrument: function() {
			return this.$1$InstrumentField;
		},
		set_instrument: function(value) {
			this.$1$InstrumentField = value;
		},
		get_tempoName: function() {
			return this.$1$TempoNameField;
		},
		set_tempoName: function(value) {
			this.$1$TempoNameField = value;
		},
		get_tempo: function() {
			return this.$1$TempoField;
		},
		set_tempo: function(value) {
			this.$1$TempoField = value;
		},
		get_duration: function() {
			return this.$1$DurationField;
		},
		set_duration: function(value) {
			this.$1$DurationField = value;
		}
	});
	ss.initClass($AlphaTab_Importer_NoCompatibleReaderFoundException, $asm, {}, ss.Exception);
	ss.initClass($AlphaTab_Importer_ScoreLoader, $asm, {});
	ss.initClass($AlphaTab_Importer_UnsupportedFormatException, $asm, {}, ss.Exception);
	ss.initClass($AlphaTab_IO_$EndOfStreamException, $asm, {}, ss.Exception);
	ss.initClass($AlphaTab_IO_$IOException, $asm, {}, ss.Exception);
	ss.initClass($AlphaTab_IO_BitReader, $asm, {
		readByte: function() {
			return this.readBits($AlphaTab_IO_BitReader.$byteSize);
		},
		readBytes: function(count) {
			var bytes = new $AlphaTab_IO_ByteArray.$ctor1(count);
			for (var i = 0; i < count; i++) {
				bytes.set_item(i, this.readByte());
			}
			return bytes;
		},
		readBits: function(count) {
			var bits = 0;
			var i = count - 1;
			while (i >= 0) {
				bits |= this.readBit() << i;
				i--;
			}
			return bits;
		},
		readBitsReversed: function(count) {
			var bits = 0;
			for (var i = count - 1; i >= 0; i--) {
				bits |= this.readBit() << i;
			}
			return bits;
		},
		readBit: function() {
			// need a new byte? 
			if (this.$_position >= $AlphaTab_IO_BitReader.$byteSize) {
				this.$_currentByte = this.$_source.readByte();
				if (this.$_currentByte === -1) {
					throw new $AlphaTab_IO_$EndOfStreamException();
				}
				this.$_readBytes++;
				this.$_position = 0;
			}
			// shift the desired byte to the least significant bit and  
			// get the value using masking
			var value = this.$_currentByte >> $AlphaTab_IO_BitReader.$byteSize - this.$_position - 1 & 1;
			this.$_position++;
			return value;
		},
		readAll: function() {
			var all = new $AlphaTab_IO_MemoryStream();
			try {
				while (true) {
					all.writeByte(this.readByte());
				}
			}
			catch ($t1) {
				$t1 = ss.Exception.wrap($t1);
				if (ss.isInstanceOfType($t1, $AlphaTab_IO_$EndOfStreamException)) {
				}
				else {
					throw $t1;
				}
			}
			return all.toArray();
		}
	});
	ss.initClass($AlphaTab_IO_ByteArray, $asm, {
		get_data: function() {
			return this.$_data;
		},
		get_length: function() {
			return this.$_data.length;
		},
		get_item: function(index) {
			return this.$_data[index];
		},
		set_item: function(index, value) {
			this.$_data[index] = value;
		}
	});
	$AlphaTab_IO_ByteArray.$ctor1.prototype = $AlphaTab_IO_ByteArray.prototype;
	ss.initClass($AlphaTab_IO_FileLoadException, $asm, {}, ss.Exception);
	ss.initClass($AlphaTab_IO_Stream, $asm, {
		close: function() {
			this.dispose$1(true);
		},
		dispose: function() {
			this.close();
		},
		dispose$1: function(disposing) {
		},
		seek: null,
		flush: null,
		write: null,
		writeByte: function(value) {
			var buffer = new $AlphaTab_IO_ByteArray.$ctor1(1);
			buffer.set_item(0, value);
			this.write(buffer, 0, 1);
		},
		read: null,
		readByte: function() {
			var buffer = new $AlphaTab_IO_ByteArray.$ctor1(1);
			var r = this.read(buffer, 0, 1);
			if (r === 0) {
				return -1;
			}
			return buffer.get_item(0);
		}
	}, null, [ss.IDisposable]);
	ss.initClass($AlphaTab_IO_MemoryStream, $asm, {
		get_capacity: function() {
			return this.$_capacity;
		},
		set_capacity: function(value) {
			if (value !== this.$_capacity) {
				if (value > 0) {
					var newBuffer = new $AlphaTab_IO_ByteArray.$ctor1(value);
					if (this.$_length > 0) {
						$AlphaTab_Platform_Std.blockCopy(this.$_buffer, 0, newBuffer, 0, this.$_length);
					}
					this.$_buffer = newBuffer;
				}
				else {
					this.$_buffer = null;
				}
				this.$_capacity = value;
			}
		},
		get_length: function() {
			return this.$_length;
		},
		getBuffer: function() {
			return this.$_buffer;
		},
		seek: function(offset, loc) {
			switch (loc) {
				case 0: {
					var tempPosition = offset;
					if (offset < 0 || tempPosition < 0) {
						throw new $AlphaTab_IO_$IOException('cannot seek before begin of stream');
					}
					this.$_position = tempPosition;
					break;
				}
				case 1: {
					var tempPosition1 = this.$_position + offset;
					if (this.$_position + offset < 0 || tempPosition1 < 0) {
						throw new $AlphaTab_IO_$IOException('cannot seek before begin of stream');
					}
					this.$_position = tempPosition1;
					break;
				}
				case 2: {
					var tempPosition2 = this.$_length + offset;
					if (this.$_length + offset < 0 || tempPosition2 < 0) {
						throw new $AlphaTab_IO_$IOException('cannot seek before begin of stream');
					}
					this.$_position = tempPosition2;
					break;
				}
			}
			return this.$_position;
		},
		flush: function() {
		},
		read: function(buffer, offset, count) {
			var n = this.$_length - this.$_position;
			if (n > count) {
				n = count;
			}
			if (n <= 0) {
				return 0;
			}
			if (n <= 8) {
				var byteCount = n;
				while (--byteCount >= 0) {
					buffer.set_item(offset + byteCount, this.$_buffer.get_item(this.$_position + byteCount));
				}
			}
			else {
				$AlphaTab_Platform_Std.blockCopy(this.$_buffer, this.$_position, buffer, offset, n);
			}
			this.$_position += n;
			return n;
		},
		write: function(buffer, offset, count) {
			var i = this.$_position + count;
			// Check for overflow
			if (i < 0) {
				throw new $AlphaTab_IO_$IOException('Stream overflow, too much bytes in stream');
			}
			if (i > this.$_length) {
				if (i > this.$_capacity) {
					this.$ensureCapacity(i);
				}
				this.$_length = i;
			}
			if (count <= 8 && !ss.referenceEquals(buffer, this.$_buffer)) {
				var byteCount = count;
				while (--byteCount >= 0) {
					this.$_buffer.set_item(this.$_position + byteCount, buffer.get_item(offset + byteCount));
				}
			}
			else {
				$AlphaTab_Platform_Std.blockCopy(buffer, offset, this.$_buffer, this.$_position, count);
			}
			this.$_position = i;
		},
		$ensureCapacity: function(value) {
			// Check for overflow
			if (value < 0) {
				throw new $AlphaTab_IO_$IOException('Stream overflow, too much bytes in stream');
			}
			if (value > this.$_capacity) {
				var newCapacity = value;
				if (newCapacity < 256) {
					newCapacity = 256;
				}
				if (newCapacity < this.$_capacity * 2) {
					newCapacity = this.$_capacity * 2;
				}
				this.set_capacity(newCapacity);
				return true;
			}
			return false;
		},
		toArray: function() {
			var copy = new $AlphaTab_IO_ByteArray.$ctor1(this.$_length);
			$AlphaTab_Platform_Std.blockCopy(this.$_buffer, 0, copy, 0, this.$_length);
			return copy;
		}
	}, $AlphaTab_IO_Stream, [ss.IDisposable]);
	$AlphaTab_IO_MemoryStream.$ctor2.prototype = $AlphaTab_IO_MemoryStream.$ctor1.prototype = $AlphaTab_IO_MemoryStream.prototype;
	ss.initEnum($AlphaTab_IO_SeekOrigin, $asm, { begin: 0, current: 1, end: 2 });
	ss.initClass($AlphaTab_IO_StringStream, $asm, {}, $AlphaTab_IO_MemoryStream, [ss.IDisposable]);
	ss.initEnum($AlphaTab_Model_AccentuationType, $asm, { none: 0, normal: 1, heavy: 2 });
	ss.initEnum($AlphaTab_Model_AccidentalType, $asm, { none: 0, natural: 1, sharp: 2, flat: 3 });
	ss.initClass($AlphaTab_Model_Automation, $asm, {
		get_isLinear: function() {
			return this.$1$IsLinearField;
		},
		set_isLinear: function(value) {
			this.$1$IsLinearField = value;
		},
		get_type: function() {
			return this.$1$TypeField;
		},
		set_type: function(value) {
			this.$1$TypeField = value;
		},
		get_value: function() {
			return this.$1$ValueField;
		},
		set_value: function(value) {
			this.$1$ValueField = value;
		},
		get_ratioPosition: function() {
			return this.$1$RatioPositionField;
		},
		set_ratioPosition: function(value) {
			this.$1$RatioPositionField = value;
		},
		get_text: function() {
			return this.$1$TextField;
		},
		set_text: function(value) {
			this.$1$TextField = value;
		},
		clone: function() {
			var a = new $AlphaTab_Model_Automation();
			a.set_isLinear(this.get_isLinear());
			a.set_type(this.get_type());
			a.set_value(this.get_value());
			return a;
		}
	});
	ss.initEnum($AlphaTab_Model_AutomationType, $asm, { tempo: 0, volume: 1, instrument: 2, balance: 3 });
	ss.initClass($AlphaTab_Model_Bar, $asm, {
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_nextBar: function() {
			return this.$1$NextBarField;
		},
		set_nextBar: function(value) {
			this.$1$NextBarField = value;
		},
		get_previousBar: function() {
			return this.$1$PreviousBarField;
		},
		set_previousBar: function(value) {
			this.$1$PreviousBarField = value;
		},
		get_clef: function() {
			return this.$1$ClefField;
		},
		set_clef: function(value) {
			this.$1$ClefField = value;
		},
		get_track: function() {
			return this.$1$TrackField;
		},
		set_track: function(value) {
			this.$1$TrackField = value;
		},
		get_voices: function() {
			return this.$1$VoicesField;
		},
		set_voices: function(value) {
			this.$1$VoicesField = value;
		},
		get_minDuration: function() {
			return this.$1$MinDurationField;
		},
		set_minDuration: function(value) {
			this.$1$MinDurationField = value;
		},
		get_maxDuration: function() {
			return this.$1$MaxDurationField;
		},
		set_maxDuration: function(value) {
			this.$1$MaxDurationField = value;
		},
		addVoice: function(voice) {
			voice.set_bar(this);
			voice.set_index(this.get_voices().length);
			ss.add(this.get_voices(), voice);
		},
		get_masterBar: function() {
			return this.get_track().get_score().get_masterBars()[this.get_index()];
		},
		get_isEmpty: function() {
			var $t1 = this.get_voices();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var voice = $t1[$t2];
				if (!voice.get_isEmpty()) {
					return false;
				}
			}
			return true;
		},
		finish: function() {
			var $t1 = this.get_voices();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var voice = $t1[$t2];
				voice.finish();
				if (ss.isNullOrUndefined(voice.get_minDuration()) || ss.isNullOrUndefined(this.get_minDuration()) || this.get_minDuration().get_value() > voice.get_minDuration().get_value()) {
					this.set_minDuration(voice.get_minDuration());
				}
				if (ss.isNullOrUndefined(voice.get_maxDuration()) || ss.isNullOrUndefined(this.get_maxDuration()) || this.get_maxDuration().get_value() > voice.get_maxDuration().get_value()) {
					this.set_minDuration(voice.get_maxDuration());
				}
			}
		}
	});
	ss.initClass($AlphaTab_Model_Beat, $asm, {
		get_previousBeat: function() {
			return this.$1$PreviousBeatField;
		},
		set_previousBeat: function(value) {
			this.$1$PreviousBeatField = value;
		},
		get_nextBeat: function() {
			return this.$1$NextBeatField;
		},
		set_nextBeat: function(value) {
			this.$1$NextBeatField = value;
		},
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_voice: function() {
			return this.$1$VoiceField;
		},
		set_voice: function(value) {
			this.$1$VoiceField = value;
		},
		get_notes: function() {
			return this.$1$NotesField;
		},
		set_notes: function(value) {
			this.$1$NotesField = value;
		},
		get_isEmpty: function() {
			return this.$1$IsEmptyField;
		},
		set_isEmpty: function(value) {
			this.$1$IsEmptyField = value;
		},
		get_minNote: function() {
			if (ss.isNullOrUndefined(this.$_minNote)) {
				this.refreshNotes();
			}
			return this.$_minNote;
		},
		get_maxNote: function() {
			if (ss.isNullOrUndefined(this.$_maxNote)) {
				this.refreshNotes();
			}
			return this.$_maxNote;
		},
		get_duration: function() {
			return this.$1$DurationField;
		},
		set_duration: function(value) {
			this.$1$DurationField = value;
		},
		get_isRest: function() {
			return this.get_notes().length === 0;
		},
		get_automations: function() {
			return this.$1$AutomationsField;
		},
		set_automations: function(value) {
			this.$1$AutomationsField = value;
		},
		get_dots: function() {
			return this.$1$DotsField;
		},
		set_dots: function(value) {
			this.$1$DotsField = value;
		},
		get_fadeIn: function() {
			return this.$1$FadeInField;
		},
		set_fadeIn: function(value) {
			this.$1$FadeInField = value;
		},
		get_lyrics: function() {
			return this.$1$LyricsField;
		},
		set_lyrics: function(value) {
			this.$1$LyricsField = value;
		},
		get_pop: function() {
			return this.$1$PopField;
		},
		set_pop: function(value) {
			this.$1$PopField = value;
		},
		get_hasRasgueado: function() {
			return this.$1$HasRasgueadoField;
		},
		set_hasRasgueado: function(value) {
			this.$1$HasRasgueadoField = value;
		},
		get_slap: function() {
			return this.$1$SlapField;
		},
		set_slap: function(value) {
			this.$1$SlapField = value;
		},
		get_tap: function() {
			return this.$1$TapField;
		},
		set_tap: function(value) {
			this.$1$TapField = value;
		},
		get_text: function() {
			return this.$1$TextField;
		},
		set_text: function(value) {
			this.$1$TextField = value;
		},
		get_brushType: function() {
			return this.$1$BrushTypeField;
		},
		set_brushType: function(value) {
			this.$1$BrushTypeField = value;
		},
		get_brushDuration: function() {
			return this.$1$BrushDurationField;
		},
		set_brushDuration: function(value) {
			this.$1$BrushDurationField = value;
		},
		get_tupletDenominator: function() {
			return this.$1$TupletDenominatorField;
		},
		set_tupletDenominator: function(value) {
			this.$1$TupletDenominatorField = value;
		},
		get_tupletNumerator: function() {
			return this.$1$TupletNumeratorField;
		},
		set_tupletNumerator: function(value) {
			this.$1$TupletNumeratorField = value;
		},
		get_hasTuplet: function() {
			return !(this.get_tupletDenominator() === -1 && this.get_tupletNumerator() === -1) && !(this.get_tupletDenominator() === 1 && this.get_tupletNumerator() === 1);
		},
		get_whammyBarPoints: function() {
			return this.$1$WhammyBarPointsField;
		},
		set_whammyBarPoints: function(value) {
			this.$1$WhammyBarPointsField = value;
		},
		get_hasWhammyBar: function() {
			return this.get_whammyBarPoints().length > 0;
		},
		get_vibrato: function() {
			return this.$1$VibratoField;
		},
		set_vibrato: function(value) {
			this.$1$VibratoField = value;
		},
		get_chordId: function() {
			return this.$1$ChordIdField;
		},
		set_chordId: function(value) {
			this.$1$ChordIdField = value;
		},
		get_hasChord: function() {
			return ss.isValue(this.get_chordId());
		},
		get_chord: function() {
			return this.get_voice().get_bar().get_track().get_chords().get_item(this.get_chordId());
		},
		get_graceType: function() {
			return this.$1$GraceTypeField;
		},
		set_graceType: function(value) {
			this.$1$GraceTypeField = value;
		},
		get_pickStroke: function() {
			return this.$1$PickStrokeField;
		},
		set_pickStroke: function(value) {
			this.$1$PickStrokeField = value;
		},
		get_isTremolo: function() {
			return ss.isValue(this.get_tremoloSpeed());
		},
		get_tremoloSpeed: function() {
			return this.$1$TremoloSpeedField;
		},
		set_tremoloSpeed: function(value) {
			this.$1$TremoloSpeedField = value;
		},
		get_crescendo: function() {
			return this.$1$CrescendoField;
		},
		set_crescendo: function(value) {
			this.$1$CrescendoField = value;
		},
		get_start: function() {
			return this.$1$StartField;
		},
		set_start: function(value) {
			this.$1$StartField = value;
		},
		get_dynamic: function() {
			return this.$1$DynamicField;
		},
		set_dynamic: function(value) {
			this.$1$DynamicField = value;
		},
		clone: function() {
			var beat = new $AlphaTab_Model_Beat();
			var $t1 = this.get_whammyBarPoints();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				ss.add(beat.get_whammyBarPoints(), b.clone());
			}
			var $t3 = this.get_notes();
			for (var $t4 = 0; $t4 < $t3.length; $t4++) {
				var n = $t3[$t4];
				beat.addNote(n.clone());
			}
			beat.set_dots(this.get_dots());
			beat.set_chordId(this.get_chordId());
			beat.set_brushType(this.get_brushType());
			beat.set_vibrato(this.get_vibrato());
			beat.set_graceType(this.get_graceType());
			beat.set_pickStroke(this.get_pickStroke());
			beat.set_duration(this.get_duration());
			beat.set_tremoloSpeed(this.get_tremoloSpeed());
			beat.set_text(this.get_text());
			beat.set_fadeIn(this.get_fadeIn());
			beat.set_tap(this.get_tap());
			beat.set_slap(this.get_slap());
			beat.set_pop(this.get_pop());
			var $t5 = this.get_automations();
			for (var $t6 = 0; $t6 < $t5.length; $t6++) {
				var a = $t5[$t6];
				ss.add(beat.get_automations(), a.clone());
			}
			beat.set_start(this.get_start());
			beat.set_tupletDenominator(this.get_tupletDenominator());
			beat.set_tupletNumerator(this.get_tupletNumerator());
			beat.set_dynamic(this.get_dynamic());
			beat.set_crescendo(this.get_crescendo());
			return beat;
		},
		calculateDuration: function() {
			var ticks = $AlphaTab_Audio_MidiUtils.toTicks(this.get_duration());
			if (this.get_dots() === 2) {
				ticks = $AlphaTab_Audio_MidiUtils.applyDot(ticks, true);
			}
			else if (this.get_dots() === 1) {
				ticks = $AlphaTab_Audio_MidiUtils.applyDot(ticks, false);
			}
			if (this.get_tupletDenominator() > 0 && this.get_tupletNumerator() >= 0) {
				ticks = $AlphaTab_Audio_MidiUtils.applyTuplet(ticks, this.get_tupletNumerator(), this.get_tupletDenominator());
			}
			return ticks;
		},
		addNote: function(note) {
			note.set_beat(this);
			ss.add(this.get_notes(), note);
		},
		refreshNotes: function() {
			var $t1 = this.get_notes();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var note = $t1[$t2];
				if (ss.isNullOrUndefined(this.$_minNote) || note.get_realValue() < this.$_minNote.get_realValue()) {
					this.$_minNote = note;
				}
				if (ss.isNullOrUndefined(this.$_maxNote) || note.get_realValue() > this.$_maxNote.get_realValue()) {
					this.$_maxNote = note;
				}
			}
		},
		getAutomation: function(type) {
			var $t1 = this.get_automations();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var automation = $t1[$t2];
				if (automation.get_type() === type) {
					return automation;
				}
			}
			return null;
		},
		getNoteOnString: function(string) {
			var $t1 = this.get_notes();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var note = $t1[$t2];
				if (note.get_string() === string) {
					return note;
				}
			}
			return null;
		},
		finish: function() {
			// start
			if (this.get_index() === 0) {
				this.set_start(this.get_voice().get_bar().get_masterBar().get_start());
			}
			else {
				this.set_start(this.get_previousBeat().get_start() + this.get_previousBeat().calculateDuration());
			}
			var $t1 = this.get_notes();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var note = $t1[$t2];
				note.finish();
			}
		}
	});
	ss.initClass($AlphaTab_Model_BendPoint, $asm, {
		get_offset: function() {
			return this.$1$OffsetField;
		},
		set_offset: function(value) {
			this.$1$OffsetField = value;
		},
		get_value: function() {
			return this.$1$ValueField;
		},
		set_value: function(value) {
			this.$1$ValueField = value;
		},
		clone: function() {
			var point = new $AlphaTab_Model_BendPoint(0, 0);
			point.set_offset(this.get_offset());
			point.set_value(this.get_value());
			return point;
		}
	});
	ss.initEnum($AlphaTab_Model_BrushType, $asm, { none: 0, brushUp: 1, brushDown: 2, arpeggioUp: 3, arpeggioDown: 4 });
	ss.initClass($AlphaTab_Model_Chord, $asm, {
		get_name: function() {
			return this.$1$NameField;
		},
		set_name: function(value) {
			this.$1$NameField = value;
		},
		get_firstFret: function() {
			return this.$1$FirstFretField;
		},
		set_firstFret: function(value) {
			this.$1$FirstFretField = value;
		},
		get_strings: function() {
			return this.$1$StringsField;
		},
		set_strings: function(value) {
			this.$1$StringsField = value;
		}
	});
	ss.initEnum($AlphaTab_Model_Clef, $asm, { neutral: 0, c3: 1, c4: 2, f4: 3, g2: 4 });
	ss.initEnum($AlphaTab_Model_CrescendoType, $asm, { none: 0, crescendo: 1, decrescendo: 2 });
	ss.initEnum($AlphaTab_Model_Duration, $asm, { whole: 1, half: 2, quarter: 4, eighth: 8, sixteenth: 16, thirtySecond: 32, sixtyFourth: 64 });
	ss.initEnum($AlphaTab_Model_DynamicValue, $asm, { PPP: 0, PP: 1, p: 2, MP: 3, MF: 4, f: 5, FF: 6, FFF: 7 });
	ss.initEnum($AlphaTab_Model_Fingers, $asm, { unknown: -2, noOrDead: -1, thumb: 0, indexFinger: 1, middleFinger: 2, annularFinger: 3, littleFinger: 4 });
	ss.initEnum($AlphaTab_Model_GraceType, $asm, { none: 0, onBeat: 1, beforeBeat: 2 });
	ss.initEnum($AlphaTab_Model_HarmonicType, $asm, { none: 0, natural: 1, artificial: 2, pinch: 3, tap: 4, semi: 5, feedback: 6 });
	ss.initEnum($AlphaTab_Model_KeySignatureType, $asm, { major: 0, minor: 1 });
	ss.initClass($AlphaTab_Model_MasterBar, $asm, {
		get_alternateEndings: function() {
			return this.$1$AlternateEndingsField;
		},
		set_alternateEndings: function(value) {
			this.$1$AlternateEndingsField = value;
		},
		get_nextMasterBar: function() {
			return this.$1$NextMasterBarField;
		},
		set_nextMasterBar: function(value) {
			this.$1$NextMasterBarField = value;
		},
		get_previousMasterBar: function() {
			return this.$1$PreviousMasterBarField;
		},
		set_previousMasterBar: function(value) {
			this.$1$PreviousMasterBarField = value;
		},
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_keySignature: function() {
			return this.$1$KeySignatureField;
		},
		set_keySignature: function(value) {
			this.$1$KeySignatureField = value;
		},
		get_isDoubleBar: function() {
			return this.$1$IsDoubleBarField;
		},
		set_isDoubleBar: function(value) {
			this.$1$IsDoubleBarField = value;
		},
		get_isRepeatStart: function() {
			return this.$1$IsRepeatStartField;
		},
		set_isRepeatStart: function(value) {
			this.$1$IsRepeatStartField = value;
		},
		get_isRepeatEnd: function() {
			return this.get_repeatCount() > 0;
		},
		get_repeatCount: function() {
			return this.$1$RepeatCountField;
		},
		set_repeatCount: function(value) {
			this.$1$RepeatCountField = value;
		},
		get_repeatGroup: function() {
			return this.$1$RepeatGroupField;
		},
		set_repeatGroup: function(value) {
			this.$1$RepeatGroupField = value;
		},
		get_timeSignatureNumerator: function() {
			return this.$1$TimeSignatureNumeratorField;
		},
		set_timeSignatureNumerator: function(value) {
			this.$1$TimeSignatureNumeratorField = value;
		},
		get_timeSignatureDenominator: function() {
			return this.$1$TimeSignatureDenominatorField;
		},
		set_timeSignatureDenominator: function(value) {
			this.$1$TimeSignatureDenominatorField = value;
		},
		get_tripletFeel: function() {
			return this.$1$TripletFeelField;
		},
		set_tripletFeel: function(value) {
			this.$1$TripletFeelField = value;
		},
		get_section: function() {
			return this.$1$SectionField;
		},
		set_section: function(value) {
			this.$1$SectionField = value;
		},
		get_isSectionStart: function() {
			return ss.isValue(this.get_section());
		},
		get_tempoAutomation: function() {
			return this.$1$TempoAutomationField;
		},
		set_tempoAutomation: function(value) {
			this.$1$TempoAutomationField = value;
		},
		get_volumeAutomation: function() {
			return this.$1$VolumeAutomationField;
		},
		set_volumeAutomation: function(value) {
			this.$1$VolumeAutomationField = value;
		},
		get_score: function() {
			return this.$1$ScoreField;
		},
		set_score: function(value) {
			this.$1$ScoreField = value;
		},
		get_start: function() {
			return this.$1$StartField;
		},
		set_start: function(value) {
			this.$1$StartField = value;
		},
		calculateDuration: function() {
			return this.get_timeSignatureNumerator() * $AlphaTab_Audio_MidiUtils.valueToTicks(this.get_timeSignatureDenominator());
		}
	});
	ss.initClass($AlphaTab_Model_ModelUtils, $asm, {});
	ss.initClass($AlphaTab_Model_Note, $asm, {
		get_accentuated: function() {
			return this.$1$AccentuatedField;
		},
		set_accentuated: function(value) {
			this.$1$AccentuatedField = value;
		},
		get_bendPoints: function() {
			return this.$1$BendPointsField;
		},
		set_bendPoints: function(value) {
			this.$1$BendPointsField = value;
		},
		get_hasBend: function() {
			return this.get_bendPoints().length > 0;
		},
		get_fret: function() {
			return this.$1$FretField;
		},
		set_fret: function(value) {
			this.$1$FretField = value;
		},
		get_string: function() {
			return this.$1$StringField;
		},
		set_string: function(value) {
			this.$1$StringField = value;
		},
		get_hammerPullOrigin: function() {
			return this.$1$HammerPullOriginField;
		},
		set_hammerPullOrigin: function(value) {
			this.$1$HammerPullOriginField = value;
		},
		get_isHammerPullDestination: function() {
			return this.$1$IsHammerPullDestinationField;
		},
		set_isHammerPullDestination: function(value) {
			this.$1$IsHammerPullDestinationField = value;
		},
		get_isHammerPullOrigin: function() {
			return this.$1$IsHammerPullOriginField;
		},
		set_isHammerPullOrigin: function(value) {
			this.$1$IsHammerPullOriginField = value;
		},
		get_harmonicValue: function() {
			return this.$1$HarmonicValueField;
		},
		set_harmonicValue: function(value) {
			this.$1$HarmonicValueField = value;
		},
		get_harmonicType: function() {
			return this.$1$HarmonicTypeField;
		},
		set_harmonicType: function(value) {
			this.$1$HarmonicTypeField = value;
		},
		get_isGhost: function() {
			return this.$1$IsGhostField;
		},
		set_isGhost: function(value) {
			this.$1$IsGhostField = value;
		},
		get_isLetRing: function() {
			return this.$1$IsLetRingField;
		},
		set_isLetRing: function(value) {
			this.$1$IsLetRingField = value;
		},
		get_isPalmMute: function() {
			return this.$1$IsPalmMuteField;
		},
		set_isPalmMute: function(value) {
			this.$1$IsPalmMuteField = value;
		},
		get_isDead: function() {
			return this.$1$IsDeadField;
		},
		set_isDead: function(value) {
			this.$1$IsDeadField = value;
		},
		get_isStaccato: function() {
			return this.$1$IsStaccatoField;
		},
		set_isStaccato: function(value) {
			this.$1$IsStaccatoField = value;
		},
		get_slideType: function() {
			return this.$1$SlideTypeField;
		},
		set_slideType: function(value) {
			this.$1$SlideTypeField = value;
		},
		get_slideTarget: function() {
			return this.$1$SlideTargetField;
		},
		set_slideTarget: function(value) {
			this.$1$SlideTargetField = value;
		},
		get_vibrato: function() {
			return this.$1$VibratoField;
		},
		set_vibrato: function(value) {
			this.$1$VibratoField = value;
		},
		get_tieOrigin: function() {
			return this.$1$TieOriginField;
		},
		set_tieOrigin: function(value) {
			this.$1$TieOriginField = value;
		},
		get_isTieDestination: function() {
			return this.$1$IsTieDestinationField;
		},
		set_isTieDestination: function(value) {
			this.$1$IsTieDestinationField = value;
		},
		get_isTieOrigin: function() {
			return this.$1$IsTieOriginField;
		},
		set_isTieOrigin: function(value) {
			this.$1$IsTieOriginField = value;
		},
		get_leftHandFinger: function() {
			return this.$1$LeftHandFingerField;
		},
		set_leftHandFinger: function(value) {
			this.$1$LeftHandFingerField = value;
		},
		get_rightHandFinger: function() {
			return this.$1$RightHandFingerField;
		},
		set_rightHandFinger: function(value) {
			this.$1$RightHandFingerField = value;
		},
		get_isFingering: function() {
			return this.$1$IsFingeringField;
		},
		set_isFingering: function(value) {
			this.$1$IsFingeringField = value;
		},
		get_trillValue: function() {
			return this.$1$TrillValueField;
		},
		set_trillValue: function(value) {
			this.$1$TrillValueField = value;
		},
		get_trillFret: function() {
			return this.get_trillValue() - this.get_stringTuning();
		},
		get_isTrill: function() {
			return this.get_trillValue() >= 0;
		},
		get_trillSpeed: function() {
			return this.$1$TrillSpeedField;
		},
		set_trillSpeed: function(value) {
			this.$1$TrillSpeedField = value;
		},
		get_durationPercent: function() {
			return this.$1$DurationPercentField;
		},
		set_durationPercent: function(value) {
			this.$1$DurationPercentField = value;
		},
		get_swapAccidentals: function() {
			return this.$1$SwapAccidentalsField;
		},
		set_swapAccidentals: function(value) {
			this.$1$SwapAccidentalsField = value;
		},
		get_beat: function() {
			return this.$1$BeatField;
		},
		set_beat: function(value) {
			this.$1$BeatField = value;
		},
		get_dynamic: function() {
			return this.$1$DynamicField;
		},
		set_dynamic: function(value) {
			this.$1$DynamicField = value;
		},
		get_octave: function() {
			return this.$1$OctaveField;
		},
		set_octave: function(value) {
			this.$1$OctaveField = value;
		},
		get_stringTuning: function() {
			return this.get_beat().get_voice().get_bar().get_track().get_tuning()[this.get_beat().get_voice().get_bar().get_track().get_tuning().length - (this.get_string() - 1) - 1];
		},
		get_realValue: function() {
			return this.get_fret() + this.get_stringTuning();
		},
		clone: function() {
			var n = new $AlphaTab_Model_Note();
			var $t1 = this.get_bendPoints();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var p = $t1[$t2];
				ss.add(n.get_bendPoints(), p.clone());
			}
			n.set_dynamic(this.get_dynamic());
			n.set_accentuated(this.get_accentuated());
			n.set_fret(this.get_fret());
			n.set_isGhost(this.get_isGhost());
			n.set_string(this.get_string());
			n.set_isHammerPullDestination(this.get_isHammerPullDestination());
			n.set_isHammerPullOrigin(this.get_isHammerPullOrigin());
			n.set_harmonicValue(this.get_harmonicValue());
			n.set_harmonicType(this.get_harmonicType());
			n.set_isLetRing(this.get_isLetRing());
			n.set_isPalmMute(this.get_isPalmMute());
			n.set_isDead(this.get_isDead());
			n.set_slideType(this.get_slideType());
			n.set_vibrato(this.get_vibrato());
			n.set_isStaccato(this.get_isStaccato());
			n.set_isTieOrigin(this.get_isTieOrigin());
			n.set_isTieDestination(this.get_isTieDestination());
			n.set_leftHandFinger(this.get_leftHandFinger());
			n.set_rightHandFinger(this.get_rightHandFinger());
			n.set_isFingering(this.get_isFingering());
			n.set_swapAccidentals(this.get_swapAccidentals());
			n.set_trillValue(this.get_trillValue());
			n.set_trillSpeed(this.get_trillSpeed());
			n.set_durationPercent(this.get_durationPercent());
			return n;
		},
		finish: function() {
			var nextNoteOnLine = new ss.Lazy(ss.mkdel(this, function() {
				return $AlphaTab_Model_Note.$nextNoteOnSameLine(this);
			}));
			var prevNoteOnLine = new ss.Lazy(ss.mkdel(this, function() {
				return $AlphaTab_Model_Note.$previousNoteOnSameLine(this);
			}));
			// connect ties
			if (this.get_isTieDestination()) {
				if (ss.isNullOrUndefined(prevNoteOnLine.value())) {
					this.set_isTieDestination(false);
				}
				else {
					this.set_tieOrigin(prevNoteOnLine.value());
					this.get_tieOrigin().set_isTieOrigin(true);
					this.set_fret(this.get_tieOrigin().get_fret());
				}
			}
			// set hammeron/pulloffs
			if (this.get_isHammerPullOrigin()) {
				if (ss.isNullOrUndefined(nextNoteOnLine.value())) {
					this.set_isHammerPullOrigin(false);
				}
				else {
					nextNoteOnLine.value().set_isHammerPullDestination(true);
					nextNoteOnLine.value().set_hammerPullOrigin(this);
				}
			}
			// set slides
			if (this.get_slideType() !== 0) {
				this.set_slideTarget(nextNoteOnLine.value());
			}
		}
	});
	ss.initEnum($AlphaTab_Model_PickStrokeType, $asm, { none: 0, up: 1, down: 2 });
	ss.initClass($AlphaTab_Model_PlaybackInformation, $asm, {
		get_volume: function() {
			return this.$1$VolumeField;
		},
		set_volume: function(value) {
			this.$1$VolumeField = value;
		},
		get_balance: function() {
			return this.$1$BalanceField;
		},
		set_balance: function(value) {
			this.$1$BalanceField = value;
		},
		get_port: function() {
			return this.$1$PortField;
		},
		set_port: function(value) {
			this.$1$PortField = value;
		},
		get_program: function() {
			return this.$1$ProgramField;
		},
		set_program: function(value) {
			this.$1$ProgramField = value;
		},
		get_primaryChannel: function() {
			return this.$1$PrimaryChannelField;
		},
		set_primaryChannel: function(value) {
			this.$1$PrimaryChannelField = value;
		},
		get_secondaryChannel: function() {
			return this.$1$SecondaryChannelField;
		},
		set_secondaryChannel: function(value) {
			this.$1$SecondaryChannelField = value;
		},
		get_isMute: function() {
			return this.$1$IsMuteField;
		},
		set_isMute: function(value) {
			this.$1$IsMuteField = value;
		},
		get_isSolo: function() {
			return this.$1$IsSoloField;
		},
		set_isSolo: function(value) {
			this.$1$IsSoloField = value;
		}
	});
	ss.initClass($AlphaTab_Model_RepeatGroup, $asm, {
		get_masterBars: function() {
			return this.$1$MasterBarsField;
		},
		set_masterBars: function(value) {
			this.$1$MasterBarsField = value;
		},
		get_openings: function() {
			return this.$1$OpeningsField;
		},
		set_openings: function(value) {
			this.$1$OpeningsField = value;
		},
		get_closings: function() {
			return this.$1$ClosingsField;
		},
		set_closings: function(value) {
			this.$1$ClosingsField = value;
		},
		get_isClosed: function() {
			return this.$1$IsClosedField;
		},
		set_isClosed: function(value) {
			this.$1$IsClosedField = value;
		},
		addMasterBar: function(masterBar) {
			if (this.get_openings().length === 0) {
				ss.add(this.get_openings(), masterBar);
			}
			ss.add(this.get_masterBars(), masterBar);
			masterBar.set_repeatGroup(this);
			if (masterBar.get_isRepeatEnd()) {
				ss.add(this.get_closings(), masterBar);
				this.set_isClosed(true);
			}
			else if (this.get_isClosed()) {
				this.set_isClosed(false);
				ss.add(this.get_openings(), masterBar);
			}
		}
	});
	ss.initClass($AlphaTab_Model_Score, $asm, {
		get_album: function() {
			return this.$1$AlbumField;
		},
		set_album: function(value) {
			this.$1$AlbumField = value;
		},
		get_artist: function() {
			return this.$1$ArtistField;
		},
		set_artist: function(value) {
			this.$1$ArtistField = value;
		},
		get_copyright: function() {
			return this.$1$CopyrightField;
		},
		set_copyright: function(value) {
			this.$1$CopyrightField = value;
		},
		get_instructions: function() {
			return this.$1$InstructionsField;
		},
		set_instructions: function(value) {
			this.$1$InstructionsField = value;
		},
		get_music: function() {
			return this.$1$MusicField;
		},
		set_music: function(value) {
			this.$1$MusicField = value;
		},
		get_notices: function() {
			return this.$1$NoticesField;
		},
		set_notices: function(value) {
			this.$1$NoticesField = value;
		},
		get_subTitle: function() {
			return this.$1$SubTitleField;
		},
		set_subTitle: function(value) {
			this.$1$SubTitleField = value;
		},
		get_title: function() {
			return this.$1$TitleField;
		},
		set_title: function(value) {
			this.$1$TitleField = value;
		},
		get_words: function() {
			return this.$1$WordsField;
		},
		set_words: function(value) {
			this.$1$WordsField = value;
		},
		get_tab: function() {
			return this.$1$TabField;
		},
		set_tab: function(value) {
			this.$1$TabField = value;
		},
		get_tempo: function() {
			return this.$1$TempoField;
		},
		set_tempo: function(value) {
			this.$1$TempoField = value;
		},
		get_tempoLabel: function() {
			return this.$1$TempoLabelField;
		},
		set_tempoLabel: function(value) {
			this.$1$TempoLabelField = value;
		},
		get_masterBars: function() {
			return this.$1$MasterBarsField;
		},
		set_masterBars: function(value) {
			this.$1$MasterBarsField = value;
		},
		get_tracks: function() {
			return this.$1$TracksField;
		},
		set_tracks: function(value) {
			this.$1$TracksField = value;
		},
		addMasterBar: function(bar) {
			bar.set_score(this);
			bar.set_index(this.get_masterBars().length);
			if (this.get_masterBars().length !== 0) {
				bar.set_previousMasterBar(this.get_masterBars()[this.get_masterBars().length - 1]);
				bar.get_previousMasterBar().set_nextMasterBar(bar);
				bar.set_start(bar.get_previousMasterBar().get_start() + bar.get_previousMasterBar().calculateDuration());
			}
			// if the group is closed only the next upcoming header can
			// reopen the group in case of a repeat alternative, so we 
			// remove the current group 
			if (bar.get_isRepeatStart() || this.$_currentRepeatGroup.get_isClosed() && bar.get_alternateEndings() <= 0) {
				this.$_currentRepeatGroup = new $AlphaTab_Model_RepeatGroup();
			}
			this.$_currentRepeatGroup.addMasterBar(bar);
			ss.add(this.get_masterBars(), bar);
		},
		addTrack: function(track) {
			track.set_score(this);
			track.set_index(this.get_tracks().length);
			ss.add(this.get_tracks(), track);
		},
		finish: function() {
			var $t1 = this.get_tracks();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var track = $t1[$t2];
				track.finish();
			}
		}
	});
	ss.initClass($AlphaTab_Model_Section, $asm, {
		get_marker: function() {
			return this.$1$MarkerField;
		},
		set_marker: function(value) {
			this.$1$MarkerField = value;
		},
		get_text: function() {
			return this.$1$TextField;
		},
		set_text: function(value) {
			this.$1$TextField = value;
		}
	});
	ss.initEnum($AlphaTab_Model_SlideType, $asm, { none: 0, shift: 1, legato: 2, intoFromBelow: 3, intoFromAbove: 4, outUp: 5, outDown: 6 });
	ss.initClass($AlphaTab_Model_Track, $asm, {
		get_capo: function() {
			return this.$1$CapoField;
		},
		set_capo: function(value) {
			this.$1$CapoField = value;
		},
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_name: function() {
			return this.$1$NameField;
		},
		set_name: function(value) {
			this.$1$NameField = value;
		},
		get_shortName: function() {
			return this.$1$ShortNameField;
		},
		set_shortName: function(value) {
			this.$1$ShortNameField = value;
		},
		get_tuning: function() {
			return this.$1$TuningField;
		},
		set_tuning: function(value) {
			this.$1$TuningField = value;
		},
		get_tuningName: function() {
			return this.$1$TuningNameField;
		},
		set_tuningName: function(value) {
			this.$1$TuningNameField = value;
		},
		get_color: function() {
			return this.$1$ColorField;
		},
		set_color: function(value) {
			this.$1$ColorField = value;
		},
		get_playbackInfo: function() {
			return this.$1$PlaybackInfoField;
		},
		set_playbackInfo: function(value) {
			this.$1$PlaybackInfoField = value;
		},
		get_isPercussion: function() {
			return this.$1$IsPercussionField;
		},
		set_isPercussion: function(value) {
			this.$1$IsPercussionField = value;
		},
		get_score: function() {
			return this.$1$ScoreField;
		},
		set_score: function(value) {
			this.$1$ScoreField = value;
		},
		get_bars: function() {
			return this.$1$BarsField;
		},
		set_bars: function(value) {
			this.$1$BarsField = value;
		},
		get_chords: function() {
			return this.$1$ChordsField;
		},
		set_chords: function(value) {
			this.$1$ChordsField = value;
		},
		addBar: function(bar) {
			bar.set_track(this);
			bar.set_index(this.get_bars().length);
			if (this.get_bars().length > 0) {
				bar.set_previousBar(this.get_bars()[this.get_bars().length - 1]);
				bar.get_previousBar().set_nextBar(bar);
			}
			ss.add(this.get_bars(), bar);
		},
		finish: function() {
			if (ss.isNullOrEmptyString(this.get_shortName())) {
				this.set_shortName(this.get_name());
				if (this.get_shortName().length > $AlphaTab_Model_Track.$shortNameMaxLength) {
					this.set_shortName(this.get_shortName().substr(0, $AlphaTab_Model_Track.$shortNameMaxLength));
				}
			}
			var $t1 = this.get_bars();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var bar = $t1[$t2];
				bar.finish();
			}
		}
	});
	ss.initEnum($AlphaTab_Model_TripletFeel, $asm, { noTripletFeel: 0, triplet16th: 1, triplet8th: 2, dotted16th: 3, dotted8th: 4, scottish16th: 5, scottish8th: 6 });
	ss.initClass($AlphaTab_Model_Tuning, $asm, {
		get_isStandard: function() {
			return this.$1$IsStandardField;
		},
		set_isStandard: function(value) {
			this.$1$IsStandardField = value;
		},
		get_name: function() {
			return this.$1$NameField;
		},
		set_name: function(value) {
			this.$1$NameField = value;
		},
		get_tunings: function() {
			return this.$1$TuningsField;
		},
		set_tunings: function(value) {
			this.$1$TuningsField = value;
		}
	});
	ss.initEnum($AlphaTab_Model_VibratoType, $asm, { none: 0, slight: 1, wide: 2 });
	ss.initClass($AlphaTab_Model_Voice, $asm, {
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_bar: function() {
			return this.$1$BarField;
		},
		set_bar: function(value) {
			this.$1$BarField = value;
		},
		get_beats: function() {
			return this.$1$BeatsField;
		},
		set_beats: function(value) {
			this.$1$BeatsField = value;
		},
		get_minDuration: function() {
			return this.$1$MinDurationField;
		},
		set_minDuration: function(value) {
			this.$1$MinDurationField = value;
		},
		get_maxDuration: function() {
			return this.$1$MaxDurationField;
		},
		set_maxDuration: function(value) {
			this.$1$MaxDurationField = value;
		},
		get_isEmpty: function() {
			return this.get_beats().length === 0;
		},
		addBeat: function(beat) {
			// chaining
			if (this.get_bar().get_index() === 0 && this.get_beats().length === 0) {
				beat.set_previousBeat(null);
				// very first beat
			}
			else if (this.get_beats().length === 0) {
				var previousVoice = this.get_bar().get_previousBar().get_voices()[this.get_index()];
				beat.set_previousBeat(previousVoice.get_beats()[previousVoice.get_beats().length - 1]);
				beat.get_previousBeat().set_nextBeat(beat);
			}
			else {
				beat.set_previousBeat(this.get_beats()[this.get_beats().length - 1]);
				beat.get_previousBeat().set_nextBeat(beat);
			}
			beat.set_voice(this);
			beat.set_index(this.get_beats().length);
			ss.add(this.get_beats(), beat);
		},
		addGraceBeat: function(beat) {
			if (this.get_beats().length === 0) {
				this.addBeat(beat);
				return;
			}
			// remove last beat
			var lastBeat = this.get_beats()[this.get_beats().length - 1];
			ss.removeAt(this.get_beats(), this.get_beats().length - 1);
			// insert grace beat
			this.addBeat(beat);
			// reinsert last beat
			this.addBeat(lastBeat);
		},
		finish: function() {
			var $t1 = this.get_beats();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var beat = $t1[$t2];
				beat.finish();
				if (ss.isNullOrUndefined(this.get_minDuration()) || this.get_minDuration().get_value() > beat.get_duration()) {
					this.set_minDuration(new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [$AlphaTab_Model_Duration]))(beat.get_duration()));
				}
				if (ss.isNullOrUndefined(this.get_maxDuration()) || this.get_maxDuration().get_value() < beat.get_duration()) {
					this.set_maxDuration(new (ss.makeGenericType($AlphaTab_Platform_Nullable$1, [$AlphaTab_Model_Duration]))(beat.get_duration()));
				}
			}
		}
	});
	ss.initInterface($AlphaTab_Platform_ICanvas, $asm, { get_width: null, set_width: null, get_height: null, set_height: null, get_color: null, set_color: null, get_lineWidth: null, set_lineWidth: null, clear: null, fillRect: null, strokeRect: null, beginPath: null, closePath: null, moveTo: null, lineTo: null, quadraticCurveTo: null, bezierCurveTo: null, rect: null, circle: null, fill: null, stroke: null, get_font: null, set_font: null, get_textAlign: null, set_textAlign: null, get_textBaseline: null, set_textBaseline: null, fillText: null, measureText: null });
	ss.initInterface($AlphaTab_Platform_IFileLoader, $asm, { loadBinary: null, loadBinaryAsync: null });
	ss.initClass($AlphaTab_Platform_Std, $asm, {});
	ss.initClass($AlphaTab_Platform_JavaScript_Html5Canvas, $asm, {
		get_width: function() {
			return this.$_canvas.width;
		},
		set_width: function(value) {
			var lineWidth = this.$_context.lineWidth;
			this.$_canvas.width = value;
			this.$_context = this.$_canvas.getContext('2d');
			this.$_context.textBaseline = 'top';
			this.$_context.lineWidth = lineWidth;
		},
		get_height: function() {
			return this.$_canvas.height;
		},
		set_height: function(value) {
			var lineWidth = this.$_context.lineWidth;
			this.$_canvas.height = value;
			this.$_context = this.$_canvas.getContext('2d');
			this.$_context.textBaseline = 'top';
			this.$_context.lineWidth = lineWidth;
		},
		get_color: function() {
			return this.$_color;
		},
		set_color: function(value) {
			this.$_color = value;
			this.$_context.strokeStyle = value.toRgbaString();
			this.$_context.fillStyle = value.toRgbaString();
		},
		get_lineWidth: function() {
			return this.$_context.lineWidth;
		},
		set_lineWidth: function(value) {
			this.$_context.lineWidth = value;
		},
		clear: function() {
			var lineWidth = this.$_context.lineWidth;
			this.$_canvas.width = this.$_canvas.width;
			this.$_context.lineWidth = lineWidth;
			// this._context.clearRect(0,0,_width, _height);
		},
		fillRect: function(x, y, w, h) {
			this.$_context.fillRect(x - 0.5, y - 0.5, w, h);
		},
		strokeRect: function(x, y, w, h) {
			this.$_context.strokeRect(x - 0.5, y - 0.5, w, h);
		},
		beginPath: function() {
			this.$_context.beginPath();
		},
		closePath: function() {
			this.$_context.closePath();
		},
		moveTo: function(x, y) {
			this.$_context.moveTo(x - 0.5, y - 0.5);
		},
		lineTo: function(x, y) {
			this.$_context.lineTo(x - 0.5, y - 0.5);
		},
		quadraticCurveTo: function(cpx, cpy, x, y) {
			this.$_context.quadraticCurveTo(cpx, cpy, x, y);
		},
		bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
			this.$_context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
		},
		circle: function(x, y, radius) {
			this.$_context.arc(x, y, radius, 0, Math.PI * 2, true);
		},
		rect: function(x, y, w, h) {
			this.$_context.rect(x, y, w, h);
		},
		fill: function() {
			this.$_context.fill();
		},
		stroke: function() {
			this.$_context.stroke();
		},
		get_font: function() {
			return this.$_font;
		},
		set_font: function(value) {
			this.$_font = value;
			this.$_context.font = value.toCssString();
		},
		get_textAlign: function() {
			switch (this.$_context.textAlign) {
				case 'left': {
					return 0;
				}
				case 'center': {
					return 1;
				}
				case 'right': {
					return 2;
				}
				default: {
					return 0;
				}
			}
		},
		set_textAlign: function(value) {
			switch (value) {
				case 0: {
					this.$_context.textAlign = 'left';
					break;
				}
				case 1: {
					this.$_context.textAlign = 'center';
					break;
				}
				case 2: {
					this.$_context.textAlign = 'right';
					break;
				}
			}
		},
		get_textBaseline: function() {
			switch (this.$_context.textBaseline) {
				case 'top': {
					return 1;
				}
				case 'middle': {
					return 2;
				}
				case 'bottom': {
					return 3;
				}
				default: {
					return 1;
				}
			}
		},
		set_textBaseline: function(value) {
			switch (value) {
				case 1: {
					this.$_context.textBaseline = 'top';
					break;
				}
				case 2: {
					this.$_context.textBaseline = 'middle';
					break;
				}
				case 3: {
					this.$_context.textBaseline = 'bottom';
					break;
				}
			}
		},
		fillText: function(text, x, y) {
			this.$_context.fillText(text, x, y);
		},
		measureText: function(text) {
			return this.$_context.measureText(text).width;
		}
	}, null, [$AlphaTab_Platform_ICanvas]);
	ss.initClass($AlphaTab_Platform_JavaScript_JsFileLoader, $asm, {
		loadBinary: function(path) {
			var ie = $AlphaTab_Platform_JavaScript_JsFileLoader.getIEVersion();
			if (ie >= 0 && ie <= 9) {
				// use VB Loader to load binary array
				var vbArr = VbAjaxLoader('GET', path);
				var fileContents = vbArr.toArray();
				// decode byte array to string
				var data = new ss.StringBuilder();
				var i = 0;
				while (ss.unbox(i < fileContents.length - 1)) {
					data.appendChar(ss.unbox(fileContents[i]));
					i++;
				}
				var reader = $AlphaTab_Platform_JavaScript_JsFileLoader.$getBytesFromString(data.toString());
				return reader;
			}
			var xhr = new XMLHttpRequest();
			xhr.open('GET', path, false);
			xhr.responseType = 'arraybuffer';
			xhr.send();
			if (xhr.status === 200) {
				var reader1 = new $AlphaTab_IO_ByteArray(new Uint8Array(xhr.response));
				return reader1;
			}
			// Error handling
			if (xhr.status === 0) {
				throw new $AlphaTab_IO_FileLoadException('You are offline!!\n Please Check Your Network.');
			}
			if (xhr.status === 404) {
				throw new $AlphaTab_IO_FileLoadException('Requested URL not found.');
			}
			if (xhr.status === 500) {
				throw new $AlphaTab_IO_FileLoadException('Internel Server Error.');
			}
			if (xhr.statusText === 'parsererror') {
				throw new $AlphaTab_IO_FileLoadException('Error.\nParsing JSON Request failed.');
			}
			if (xhr.statusText === 'timeout') {
				throw new $AlphaTab_IO_FileLoadException('Request Time out.');
			}
			throw new $AlphaTab_IO_FileLoadException('Unknow Error: ' + xhr.responseText);
		},
		loadBinaryAsync: function(path, success, error) {
			var ie = $AlphaTab_Platform_JavaScript_JsFileLoader.getIEVersion();
			if (ie >= 0 && ie <= 9) {
				// use VB Loader to load binary array
				var vbArr = VbAjaxLoader('GET', path);
				var fileContents = vbArr.toArray();
				// decode byte array to string
				var data = new ss.StringBuilder();
				var i = 0;
				while (ss.unbox(i < fileContents.length - 1)) {
					data.appendChar(ss.unbox(fileContents[i]));
					i++;
				}
				var reader = $AlphaTab_Platform_JavaScript_JsFileLoader.$getBytesFromString(data.toString());
				success(reader);
			}
			else {
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = ss.mkdel(this, function(e) {
					if (xhr.readyState === 4) {
						if (xhr.status === 200) {
							var reader1 = new $AlphaTab_IO_ByteArray(new Uint8Array(xhr.response));
							success(reader1);
						}
						else if (xhr.status === 0) {
							error(new $AlphaTab_IO_FileLoadException('You are offline!!\n Please Check Your Network.'));
						}
						else if (xhr.status === 404) {
							error(new $AlphaTab_IO_FileLoadException('Requested URL not found.'));
						}
						else if (xhr.status === 500) {
							error(new $AlphaTab_IO_FileLoadException('Internel Server Error.'));
						}
						else if (xhr.statusText === 'parsererror') {
							error(new $AlphaTab_IO_FileLoadException('Error.\nParsing JSON Request failed.'));
						}
						else if (xhr.statusText === 'timeout') {
							error(new $AlphaTab_IO_FileLoadException('Request Time out.'));
						}
						else {
							error(new $AlphaTab_IO_FileLoadException('Unknow Error: ' + xhr.responseText));
						}
					}
				});
				xhr.responseType = 'arraybuffer';
				xhr.open('GET', path, true);
				xhr.send();
			}
		}
	}, null, [$AlphaTab_Platform_IFileLoader]);
	ss.initClass($AlphaTab_Platform_Model_Color, $asm, {
		get_a: function() {
			return this.$_value >> 24 & 255;
		},
		get_r: function() {
			return this.$_value >> 16 & 255;
		},
		get_g: function() {
			return this.$_value >> 8 & 255;
		},
		get_b: function() {
			return this.$_value & 255;
		},
		toRgbaString: function() {
			return 'rgba(' + this.get_r() + ',' + this.get_g() + ',' + this.get_b() + ',' + this.get_a() / 255 + ')';
		}
	});
	ss.initClass($AlphaTab_Platform_Model_Font, $asm, {
		get_family: function() {
			return this.$1$FamilyField;
		},
		set_family: function(value) {
			this.$1$FamilyField = value;
		},
		get_size: function() {
			return this.$1$SizeField;
		},
		set_size: function(value) {
			this.$1$SizeField = value;
		},
		get_style: function() {
			return this.$1$StyleField;
		},
		set_style: function(value) {
			this.$1$StyleField = value;
		},
		get_isBold: function() {
			return (this.get_style() & 1) !== 0;
		},
		get_isItalic: function() {
			return (this.get_style() & 2) !== 0;
		},
		clone: function() {
			return new $AlphaTab_Platform_Model_Font(this.get_family(), this.get_size(), this.get_style());
		},
		toCssString: function() {
			var buf = new ss.StringBuilder();
			if (this.get_isBold()) {
				buf.append('bold ');
			}
			if (this.get_isItalic()) {
				buf.append('italic ');
			}
			buf.append(this.get_size());
			buf.append('px');
			buf.append("'");
			buf.append(this.get_family());
			buf.append("'");
			return buf.toString();
		}
	});
	ss.initEnum($AlphaTab_Platform_Model_FontStyle, $asm, { plain: 0, bold: 1, italic: 2 });
	ss.initEnum($AlphaTab_Platform_Model_TextAlign, $asm, { left: 0, center: 1, right: 2 });
	ss.initEnum($AlphaTab_Platform_Model_TextBaseline, $asm, { default$1: 0, top: 1, middle: 2, bottom: 3 });
	ss.initClass($AlphaTab_Platform_Svg_FontSizes, $asm, {});
	ss.initEnum($AlphaTab_Platform_Svg_SupportedFonts, $asm, { timesNewRoman: 0, arial: 1 });
	ss.initClass($AlphaTab_Platform_Svg_SvgCanvas, $asm, {
		get_width: function() {
			return this.$1$WidthField;
		},
		set_width: function(value) {
			this.$1$WidthField = value;
		},
		get_height: function() {
			return this.$1$HeightField;
		},
		set_height: function(value) {
			this.$1$HeightField = value;
		},
		get_color: function() {
			return this.$1$ColorField;
		},
		set_color: function(value) {
			this.$1$ColorField = value;
		},
		get_lineWidth: function() {
			return this.$1$LineWidthField;
		},
		set_lineWidth: function(value) {
			this.$1$LineWidthField = value;
		},
		get_font: function() {
			return this.$1$FontField;
		},
		set_font: function(value) {
			this.$1$FontField = value;
		},
		get_textAlign: function() {
			return this.$1$TextAlignField;
		},
		set_textAlign: function(value) {
			this.$1$TextAlignField = value;
		},
		get_textBaseline: function() {
			return this.$1$TextBaselineField;
		},
		set_textBaseline: function(value) {
			this.$1$TextBaselineField = value;
		},
		toSvg: function(includeWrapper, className) {
			var buf = new ss.StringBuilder();
			if (includeWrapper) {
				buf.append('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="');
				buf.append(this.get_width());
				buf.append('px" height="');
				buf.append(this.get_height());
				buf.append('px"');
				if (ss.isValue(className)) {
					buf.append(' class="');
					buf.append(className);
					buf.append('"');
				}
				buf.append('>\n');
			}
			buf.append(this.$_buffer);
			if (includeWrapper) {
				buf.append('</svg>');
			}
			return buf.toString();
		},
		clear: function() {
			this.$_buffer = '';
			this.$_currentPath = '';
			this.$_currentPathIsEmpty = true;
		},
		fillRect: function(x, y, w, h) {
			this.$_buffer += '<rect x="';
			this.$_buffer += x;
			this.$_buffer += '" y="';
			this.$_buffer += y;
			this.$_buffer += '" width="';
			this.$_buffer += w;
			this.$_buffer += '" height="';
			this.$_buffer += h;
			this.$_buffer += '" style="fill:';
			this.$_buffer += this.get_color().toRgbaString();
			this.$_buffer += ';" />\n';
		},
		strokeRect: function(x, y, w, h) {
			this.$_buffer += '<rect x="';
			this.$_buffer += x;
			this.$_buffer += '" y="';
			this.$_buffer += y;
			this.$_buffer += '" width="';
			this.$_buffer += w;
			this.$_buffer += '" height="';
			this.$_buffer += h;
			this.$_buffer += '" style="stroke:';
			this.$_buffer += this.get_color().toRgbaString();
			this.$_buffer += '; stroke-width:';
			this.$_buffer += this.get_lineWidth();
			this.$_buffer += ';" />\n';
		},
		beginPath: function() {
		},
		closePath: function() {
			this.$_currentPath += ' z';
		},
		moveTo: function(x, y) {
			this.$_currentPath += ' M';
			this.$_currentPath += x;
			this.$_currentPath += ',';
			this.$_currentPath += y;
		},
		lineTo: function(x, y) {
			this.$_currentPathIsEmpty = false;
			this.$_currentPath += ' L';
			this.$_currentPath += x;
			this.$_currentPath += ',';
			this.$_currentPath += y;
		},
		quadraticCurveTo: function(cpx, cpy, x, y) {
			this.$_currentPathIsEmpty = false;
			this.$_currentPath += ' Q';
			this.$_currentPath += cpx;
			this.$_currentPath += ',';
			this.$_currentPath += cpy;
			this.$_currentPath += ',';
			this.$_currentPath += x;
			this.$_currentPath += ',';
			this.$_currentPath += y;
		},
		bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
			this.$_currentPathIsEmpty = false;
			this.$_currentPath += ' C';
			this.$_currentPath += cp1x;
			this.$_currentPath += ',';
			this.$_currentPath += cp1y;
			this.$_currentPath += ',';
			this.$_currentPath += cp2x;
			this.$_currentPath += ',';
			this.$_currentPath += cp2y;
			this.$_currentPath += ',';
			this.$_currentPath += x;
			this.$_currentPath += ',';
			this.$_currentPath += y;
		},
		circle: function(x, y, radius) {
			this.$_currentPathIsEmpty = false;
			// 
			// M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
			this.$_currentPath += ' M';
			this.$_currentPath += x - radius;
			this.$_currentPath += ',';
			this.$_currentPath += y;
			this.$_currentPath += ' A1,1 0 0,0 ';
			this.$_currentPath += x + radius;
			this.$_currentPath += ',';
			this.$_currentPath += y;
			this.$_currentPath += ' A1,1 0 0,0 ';
			this.$_currentPath += x - radius;
			this.$_currentPath += ',';
			this.$_currentPath += y;
			this.$_currentPath += ' z';
		},
		rect: function(x, y, w, h) {
			this.$_currentPathIsEmpty = false;
			this.$_currentPath += ' M';
			this.$_currentPath += x;
			this.$_currentPath += ',';
			this.$_currentPath += y;
			this.$_currentPath += ' L';
			this.$_currentPath += x + w;
			this.$_currentPath += ',';
			this.$_currentPath += y;
			this.$_currentPath += ' ';
			this.$_currentPath += x + w;
			this.$_currentPath += ',';
			this.$_currentPath += y + h;
			this.$_currentPath += ' ';
			this.$_currentPath += x;
			this.$_currentPath += ',';
			this.$_currentPath += y + h;
			this.$_currentPath += ' z';
		},
		fill: function() {
			if (!this.$_currentPathIsEmpty) {
				this.$_buffer += '<path d="';
				this.$_buffer += this.$_currentPath;
				this.$_buffer += '" style="fill:';
				this.$_buffer += this.get_color().toRgbaString();
				this.$_buffer += '" stroke="none"/>\n';
			}
			this.$_currentPath = '';
			this.$_currentPathIsEmpty = true;
		},
		stroke: function() {
			if (!this.$_currentPathIsEmpty) {
				this.$_buffer += '<path d="';
				this.$_buffer += this.$_currentPath;
				this.$_buffer += '" style="stroke:';
				this.$_buffer += this.get_color().toRgbaString();
				this.$_buffer += '; stroke-width:';
				this.$_buffer += this.get_lineWidth();
				this.$_buffer += ';" fill="none" />\n';
			}
			this.$_currentPath = '';
			this.$_currentPathIsEmpty = true;
		},
		fillText: function(text, x, y) {
			this.$_buffer += '<text x="';
			this.$_buffer += x;
			this.$_buffer += '" y="';
			this.$_buffer += y + this.$getSvgBaseLineOffset();
			this.$_buffer += '" style="font:';
			this.$_buffer += this.get_font().toCssString();
			this.$_buffer += '; fill:';
			this.$_buffer += this.get_color().toRgbaString();
			this.$_buffer += ';" ';
			this.$_buffer += ' dominant-baseline="';
			this.$_buffer += this.$getSvgBaseLine();
			this.$_buffer += '" text-anchor="';
			this.$_buffer += this.$getSvgTextAlignment();
			this.$_buffer += '">\n';
			this.$_buffer += text;
			this.$_buffer += '</text>\n';
		},
		$getSvgTextAlignment: function() {
			switch (this.get_textAlign()) {
				case 0: {
					return 'start';
				}
				case 1: {
					return 'middle';
				}
				case 2: {
					return 'end';
				}
			}
			return '';
		},
		$getSvgBaseLineOffset: function() {
			switch (this.get_textBaseline()) {
				case 1: {
					return 0;
				}
				case 2: {
					return 0;
				}
				case 3: {
					return 0;
				}
				default: {
					return this.get_font().get_size();
				}
			}
		},
		$getSvgBaseLine: function() {
			switch (this.get_textBaseline()) {
				case 1: {
					return 'top';
				}
				case 2: {
					return 'middle';
				}
				case 3: {
					return 'bottom';
				}
				default: {
					return 'top';
				}
			}
		},
		measureText: function(text) {
			if (ss.isNullOrEmptyString(text)) {
				return 0;
			}
			var font = 1;
			if (this.get_font().get_family().indexOf('Times') !== -1) {
				font = 0;
			}
			return $AlphaTab_Platform_Svg_FontSizes.measureString(text, font, this.get_font().get_size());
		}
	}, null, [$AlphaTab_Platform_ICanvas]);
	ss.initClass($AlphaTab_Rendering_BarRendererBase, $asm, {
		get_stave: function() {
			return this.$1$StaveField;
		},
		set_stave: function(value) {
			this.$1$StaveField = value;
		},
		get_x: function() {
			return this.$1$XField;
		},
		set_x: function(value) {
			this.$1$XField = value;
		},
		get_y: function() {
			return this.$1$YField;
		},
		set_y: function(value) {
			this.$1$YField = value;
		},
		get_width: function() {
			return this.$1$WidthField;
		},
		set_width: function(value) {
			this.$1$WidthField = value;
		},
		get_height: function() {
			return this.$1$HeightField;
		},
		set_height: function(value) {
			this.$1$HeightField = value;
		},
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_isEmpty: function() {
			return this.$1$IsEmptyField;
		},
		set_isEmpty: function(value) {
			this.$1$IsEmptyField = value;
		},
		get_topOverflow: function() {
			return this.$1$TopOverflowField;
		},
		set_topOverflow: function(value) {
			this.$1$TopOverflowField = value;
		},
		get_bottomOverflow: function() {
			return this.$1$BottomOverflowField;
		},
		set_bottomOverflow: function(value) {
			this.$1$BottomOverflowField = value;
		},
		get_bar: function() {
			return this.$1$BarField;
		},
		set_bar: function(value) {
			this.$1$BarField = value;
		},
		registerOverflowTop: function(topOverflow) {
			if (topOverflow > this.get_topOverflow()) {
				this.set_topOverflow(topOverflow);
			}
		},
		registerOverflowBottom: function(bottomOverflow) {
			if (bottomOverflow > this.get_bottomOverflow()) {
				this.set_bottomOverflow(bottomOverflow);
			}
		},
		applyBarSpacing: function(spacing) {
		},
		get_resources: function() {
			return this.get_layout().get_renderer().get_renderingResources();
		},
		get_layout: function() {
			return this.get_stave().get_staveGroup().get_layout();
		},
		get_settings: function() {
			return this.get_layout().get_renderer().get_settings();
		},
		get_scale: function() {
			return this.get_settings().get_scale();
		},
		get_isFirstOfLine: function() {
			return this.get_index() === 0;
		},
		get_isLastOfLine: function() {
			return this.get_index() === this.get_stave().get_barRenderers().length - 1;
		},
		get_isLast: function() {
			return this.get_bar().get_index() === this.get_stave().get_barRenderers().length - 1;
		},
		registerMaxSizes: function(sizes) {
		},
		applySizes: function(sizes) {
		},
		finalizeRenderer: function(layout) {
		},
		get_topPadding: function() {
			return 0;
		},
		get_bottomPadding: function() {
			return 0;
		},
		doLayout: function() {
		},
		paint: function(cx, cy, canvas) {
		},
		buildBoundingsLookup: function(lookup, visualTop, visualHeight, realTop, realHeight, x) {
			var barLookup = new $AlphaTab_Rendering_Utils_BarBoundings();
			barLookup.set_bar(this.get_bar());
			barLookup.set_isFirstOfLine(this.get_isFirstOfLine());
			barLookup.set_isLastOfLine(this.get_isLastOfLine());
			barLookup.set_visualBounds(new $AlphaTab_Rendering_Utils_Bounds(x + this.get_stave().get_x() + this.get_x(), visualTop, this.get_width(), visualHeight));
			barLookup.set_bounds(new $AlphaTab_Rendering_Utils_Bounds(x + this.get_stave().get_x() + this.get_x(), realTop, this.get_width(), realHeight));
			ss.add(lookup.get_bars(), barLookup);
		}
	});
	ss.initClass($AlphaTab_Rendering_AlternateEndingsBarRenderer, $asm, {
		finalizeRenderer: function(layout) {
			$AlphaTab_Rendering_BarRendererBase.prototype.finalizeRenderer.call(this, layout);
			this.set_isEmpty(this.$_endings.length === 0);
		},
		doLayout: function() {
			$AlphaTab_Rendering_BarRendererBase.prototype.doLayout.call(this);
			if (this.get_index() === 0) {
				this.get_stave().set_topSpacing(5);
				this.get_stave().set_bottomSpacing(4);
			}
			this.set_height(ss.Int32.trunc(this.get_resources().get_wordsFont().get_size()));
			var endingsStrings = new ss.StringBuilder();
			for (var $t1 = 0; $t1 < this.$_endings.length; $t1++) {
				var e = this.$_endings[$t1];
				endingsStrings.append(e + 1);
				endingsStrings.append('. ');
			}
			this.$_endingsString = endingsStrings.toString();
		},
		get_topPadding: function() {
			return 0;
		},
		get_bottomPadding: function() {
			return 0;
		},
		applySizes: function(sizes) {
			$AlphaTab_Rendering_BarRendererBase.prototype.applySizes.call(this, sizes);
			this.set_width(sizes.get_fullWidth());
		},
		paint: function(cx, cy, canvas) {
			if (this.$_endings.length > 0) {
				var res = this.get_resources();
				canvas.set_color(res.get_mainGlyphColor());
				canvas.set_font(res.get_wordsFont());
				canvas.moveTo(cx + this.get_x(), cy + this.get_y() + this.get_height());
				canvas.lineTo(cx + this.get_x(), cy + this.get_y());
				canvas.lineTo(cx + this.get_x() + this.get_width(), cy + this.get_y());
				canvas.stroke();
				canvas.fillText(this.$_endingsString, cx + this.get_x() + 3 * this.get_scale(), cy + this.get_y() * this.get_scale());
			}
		}
	}, $AlphaTab_Rendering_BarRendererBase);
	ss.initClass($AlphaTab_Rendering_BarRendererFactory, $asm, {
		get_isInAccolade: function() {
			return this.$1$IsInAccoladeField;
		},
		set_isInAccolade: function(value) {
			this.$1$IsInAccoladeField = value;
		},
		get_hideOnMultiTrack: function() {
			return this.$1$HideOnMultiTrackField;
		},
		set_hideOnMultiTrack: function(value) {
			this.$1$HideOnMultiTrackField = value;
		},
		create: null
	});
	ss.initClass($AlphaTab_Rendering_AlternateEndingsBarRendererFactory, $asm, {
		create: function(bar) {
			return new $AlphaTab_Rendering_AlternateEndingsBarRenderer(bar);
		}
	}, $AlphaTab_Rendering_BarRendererFactory);
	ss.initEnum($AlphaTab_Rendering_EffectBarGlyphSizing, $asm, { singlePreBeatOnly: 0, singlePreBeatToOnBeat: 1, singlePreBeatToPostBeat: 2, singleOnBeatOnly: 3, singleOnBeatToPostBeat: 4, singlePostBeatOnly: 5, groupedPreBeatOnly: 6, groupedPreBeatToOnBeat: 7, groupedPreBeatToPostBeat: 8, groupedOnBeatOnly: 9, groupedOnBeatToPostBeat: 10, groupedPostBeatOnly: 11 });
	ss.initClass($AlphaTab_Rendering_GroupedBarRenderer, $asm, {
		doLayout: function() {
			this.createPreBeatGlyphs();
			this.createBeatGlyphs();
			this.createPostBeatGlyphs();
			var $t1 = ss.getEnumerator(this.$_voiceContainers.get_values());
			try {
				while ($t1.moveNext()) {
					var c = $t1.current();
					c.doLayout();
				}
			}
			finally {
				$t1.dispose();
			}
			this.$updateWidth();
		},
		$updateWidth: function() {
			this.set_width(this.get_postBeatGlyphsStart());
			if (this.$_postBeatGlyphs.length > 0) {
				this.set_width(this.get_width() + (this.$_postBeatGlyphs[this.$_postBeatGlyphs.length - 1].get_x() + this.$_postBeatGlyphs[this.$_postBeatGlyphs.length - 1].get_width()));
			}
			var $t1 = ss.getEnumerator(this.$_voiceContainers.get_values());
			try {
				while ($t1.moveNext()) {
					var c = $t1.current();
					if (ss.isNullOrUndefined(this.$_biggestVoiceContainer) || c.get_width() > this.$_biggestVoiceContainer.get_width()) {
						this.$_biggestVoiceContainer = c;
					}
				}
			}
			finally {
				$t1.dispose();
			}
		},
		registerMaxSizes: function(sizes) {
			var preSize = this.get_beatGlyphsStart();
			if (sizes.getSize($AlphaTab_Rendering_GroupedBarRenderer.keySizePre) < preSize) {
				sizes.setSize($AlphaTab_Rendering_GroupedBarRenderer.keySizePre, preSize);
			}
			var $t1 = ss.getEnumerator(this.$_voiceContainers.get_values());
			try {
				while ($t1.moveNext()) {
					var c = $t1.current();
					c.registerMaxSizes(sizes);
				}
			}
			finally {
				$t1.dispose();
			}
			var postSize;
			if (this.$_postBeatGlyphs.length === 0) {
				postSize = 0;
			}
			else {
				postSize = this.$_postBeatGlyphs[this.$_postBeatGlyphs.length - 1].get_x() + this.$_postBeatGlyphs[this.$_postBeatGlyphs.length - 1].get_width();
			}
			if (sizes.getSize($AlphaTab_Rendering_GroupedBarRenderer.keySizePost) < postSize) {
				sizes.setSize($AlphaTab_Rendering_GroupedBarRenderer.keySizePost, postSize);
			}
			if (sizes.get_fullWidth() < this.get_width()) {
				sizes.set_fullWidth(this.get_width());
			}
		},
		applySizes: function(sizes) {
			// if we need additional space in the preBeat group we simply
			// add a new spacer
			var preSize = sizes.getSize($AlphaTab_Rendering_GroupedBarRenderer.keySizePre);
			var preSizeDiff = preSize - this.get_beatGlyphsStart();
			if (preSizeDiff > 0) {
				this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, preSizeDiff, true));
			}
			// on beat glyphs we apply the glyph spacing
			var $t1 = ss.getEnumerator(this.$_voiceContainers.get_values());
			try {
				while ($t1.moveNext()) {
					var c = $t1.current();
					c.applySizes(sizes);
				}
			}
			finally {
				$t1.dispose();
			}
			// on the post glyphs we add the spacing before all other glyphs
			var postSize = sizes.getSize($AlphaTab_Rendering_GroupedBarRenderer.keySizePost);
			var postSizeDiff;
			if (this.$_postBeatGlyphs.length === 0) {
				postSizeDiff = 0;
			}
			else {
				postSizeDiff = postSize - (this.$_postBeatGlyphs[this.$_postBeatGlyphs.length - 1].get_x() + this.$_postBeatGlyphs[this.$_postBeatGlyphs.length - 1].get_width());
			}
			if (postSizeDiff > 0) {
				ss.insert(this.$_postBeatGlyphs, 0, new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, postSizeDiff, true));
				for (var i = 0; i < this.$_postBeatGlyphs.length; i++) {
					var g = this.$_postBeatGlyphs[i];
					g.set_x(((i === 0) ? 0 : (this.$_postBeatGlyphs[this.$_postBeatGlyphs.length - 1].get_x() + this.$_postBeatGlyphs[this.$_postBeatGlyphs.length - 1].get_width())));
					g.set_index(i);
					g.set_renderer(this);
				}
			}
			this.$updateWidth();
		},
		$addGlyph: function(c, g) {
			this.set_isEmpty(false);
			g.set_x(((c.length === 0) ? 0 : (c[c.length - 1].get_x() + c[c.length - 1].get_width())));
			g.set_index(c.length);
			g.set_renderer(this);
			g.doLayout();
			ss.add(c, g);
		},
		addPreBeatGlyph: function(g) {
			this.$addGlyph(this.$_preBeatGlyphs, g);
		},
		addBeatGlyph: function(g) {
			this.$getOrCreateVoiceContainer(g.get_beat().get_voice().get_index()).addGlyph(g);
		},
		$getOrCreateVoiceContainer: function(voiceIndex) {
			var c;
			if (voiceIndex >= this.$_voiceContainers.get_count()) {
				c = new $AlphaTab_Rendering_Glyphs_VoiceContainerGlyph(0, 0, voiceIndex);
				c.set_renderer(this);
				this.$_voiceContainers.set_item(voiceIndex, c);
			}
			else {
				c = this.$_voiceContainers.get_item(voiceIndex);
			}
			return c;
		},
		getBeatContainer: function(voice, beat) {
			return this.$getOrCreateVoiceContainer(voice).get_beatGlyphs()[beat];
		},
		getPreNotesPosition: function(voice, beat) {
			return this.getBeatContainer(voice, beat).get_preNotes();
		},
		getOnNotesPosition: function(voice, beat) {
			return this.getBeatContainer(voice, beat).get_onNotes();
		},
		getPostNotesPosition: function(voice, beat) {
			return this.getBeatContainer(voice, beat).get_postNotes();
		},
		addPostBeatGlyph: function(g) {
			this.$addGlyph(this.$_postBeatGlyphs, g);
		},
		createPreBeatGlyphs: function() {
		},
		createBeatGlyphs: function() {
		},
		createPostBeatGlyphs: function() {
		},
		get_preBeatGlyphStart: function() {
			return 0;
		},
		get_beatGlyphsStart: function() {
			var start = this.get_preBeatGlyphStart();
			if (this.$_preBeatGlyphs.length > 0) {
				start += this.$_preBeatGlyphs[this.$_preBeatGlyphs.length - 1].get_x() + this.$_preBeatGlyphs[this.$_preBeatGlyphs.length - 1].get_width();
			}
			return start;
		},
		get_postBeatGlyphsStart: function() {
			var start = this.get_beatGlyphsStart();
			var offset = 0;
			var $t1 = ss.getEnumerator(this.$_voiceContainers.get_values());
			try {
				while ($t1.moveNext()) {
					var c = $t1.current();
					if (c.get_width() > offset) {
						offset = c.get_width();
					}
					//if (c.beatGlyphs.length > 0)
					//{
					//    var coff = c.beatGlyphs[c.beatGlyphs.length - 1].x + c.beatGlyphs[c.beatGlyphs.length - 1].width;
					//    if (coff > offset)
					//    {
					//        offset = coff;
					//    }
					//}
				}
			}
			finally {
				$t1.dispose();
			}
			return start + offset;
		},
		get_postBeatGlyphsWidth: function() {
			var width = 0;
			for (var $t1 = 0; $t1 < this.$_postBeatGlyphs.length; $t1++) {
				var c = this.$_postBeatGlyphs[$t1];
				var x = c.get_x() + c.get_width();
				if (x > width) {
					width = x;
				}
			}
			return width;
		},
		applyBarSpacing: function(spacing) {
			this.set_width(this.get_width() + spacing);
			var $t1 = ss.getEnumerator(this.$_voiceContainers.get_values());
			try {
				while ($t1.moveNext()) {
					var c = $t1.current();
					var toApply = spacing;
					if (ss.isValue(this.$_biggestVoiceContainer)) {
						toApply += this.$_biggestVoiceContainer.get_width() - c.get_width();
					}
					c.applyGlyphSpacing(toApply);
				}
			}
			finally {
				$t1.dispose();
			}
		},
		finalizeRenderer: function(layout) {
			var $t1 = ss.getEnumerator(this.$_voiceContainers.get_values());
			try {
				while ($t1.moveNext()) {
					var c = $t1.current();
					c.finalizeGlyph(layout);
				}
			}
			finally {
				$t1.dispose();
			}
		},
		paint: function(cx, cy, canvas) {
			this.paintBackground(cx, cy, canvas);
			var glyphStartX = this.get_preBeatGlyphStart();
			for (var $t1 = 0; $t1 < this.$_preBeatGlyphs.length; $t1++) {
				var g = this.$_preBeatGlyphs[$t1];
				g.paint(cx + this.get_x() + glyphStartX, cy + this.get_y(), canvas);
			}
			glyphStartX = this.get_beatGlyphsStart();
			var $t2 = ss.getEnumerator(this.$_voiceContainers.get_values());
			try {
				while ($t2.moveNext()) {
					var c = $t2.current();
					c.paint(cx + this.get_x() + glyphStartX, cy + this.get_y(), canvas);
				}
			}
			finally {
				$t2.dispose();
			}
			glyphStartX = this.get_width() - this.get_postBeatGlyphsWidth();
			for (var $t3 = 0; $t3 < this.$_postBeatGlyphs.length; $t3++) {
				var g1 = this.$_postBeatGlyphs[$t3];
				g1.paint(cx + this.get_x() + glyphStartX, cy + this.get_y(), canvas);
			}
		},
		paintBackground: function(cx, cy, canvas) {
		},
		buildBoundingsLookup: function(lookup, visualTop, visualHeight, realTop, realHeight, x) {
			$AlphaTab_Rendering_BarRendererBase.prototype.buildBoundingsLookup.call(this, lookup, visualTop, visualHeight, realTop, realHeight, x);
			var barLookup = lookup.get_bars()[lookup.get_bars().length - 1];
			var beatStart = this.get_beatGlyphsStart();
			var $t1 = ss.getEnumerator(this.$_voiceContainers.get_values());
			try {
				while ($t1.moveNext()) {
					var c = $t1.current();
					var $t2 = c.get_beatGlyphs();
					for (var $t3 = 0; $t3 < $t2.length; $t3++) {
						var bc = $t2[$t3];
						var beatLookup = new $AlphaTab_Rendering_Utils_BeatBoundings();
						beatLookup.set_beat(bc.get_beat());
						// on beat bounding rectangle
						beatLookup.set_visualBounds(new $AlphaTab_Rendering_Utils_Bounds(x + this.get_stave().get_x() + this.get_x() + beatStart + c.get_x() + bc.get_x() + bc.get_onNotes().get_x(), visualTop, bc.get_onNotes().get_width(), visualHeight));
						// real beat boundings
						beatLookup.set_bounds(new $AlphaTab_Rendering_Utils_Bounds(x + this.get_stave().get_x() + this.get_x() + beatStart + c.get_x() + bc.get_x(), realTop, bc.get_width(), realHeight));
						ss.add(barLookup.get_beats(), beatLookup);
					}
				}
			}
			finally {
				$t1.dispose();
			}
		}
	}, $AlphaTab_Rendering_BarRendererBase);
	ss.initClass($AlphaTab_Rendering_EffectBarRenderer, $asm, {
		doLayout: function() {
			$AlphaTab_Rendering_GroupedBarRenderer.prototype.doLayout.call(this);
			if (this.get_index() === 0) {
				this.get_stave().set_topSpacing(5);
				this.get_stave().set_bottomSpacing(5);
			}
			this.set_height(this.$_info.getHeight(this));
		},
		finalizeRenderer: function(layout) {
			$AlphaTab_Rendering_GroupedBarRenderer.prototype.finalizeRenderer.call(this, layout);
			// after all layouting and sizing place and size the effect glyphs
			this.set_isEmpty(true);
			var prevGlyph = null;
			if (this.get_index() > 0) {
				// check if previous renderer had an effect on his last beat
				// and use this as merging element
				var prevRenderer = this.get_stave().get_barRenderers()[this.get_index() - 1];
				if (ss.isValue(prevRenderer.$_lastBeat) && prevRenderer.$_effectGlyphs[0].containsKey(prevRenderer.$_lastBeat.get_index())) {
					prevGlyph = prevRenderer.$_effectGlyphs[0].get_item(prevRenderer.$_lastBeat.get_index());
				}
			}
			var $t1 = ss.getEnumerator(this.$_effectGlyphs[0].get_keys());
			try {
				while ($t1.moveNext()) {
					var beatIndex = $t1.current();
					var effect = this.$_effectGlyphs[0].get_item(beatIndex);
					this.$alignGlyph(this.$_info.get_sizingMode(), beatIndex, 0, prevGlyph);
					prevGlyph = effect;
					this.set_isEmpty(false);
				}
			}
			finally {
				$t1.dispose();
			}
		},
		$alignGlyph: function(sizing, beatIndex, voiceIndex, prevGlyph) {
			var g = this.$_effectGlyphs[voiceIndex].get_item(beatIndex);
			var pos;
			var container = this.getBeatContainer(voiceIndex, beatIndex);
			switch (sizing) {
				case 0: {
					pos = container.get_preNotes();
					g.set_x(pos.get_x() + container.get_x());
					g.set_width(pos.get_width());
					break;
				}
				case 1: {
					pos = container.get_preNotes();
					g.set_x(pos.get_x() + container.get_x());
					pos = container.get_onNotes();
					g.set_width(pos.get_x() + container.get_x() + pos.get_width() - g.get_x());
					break;
				}
				case 2: {
					pos = container.get_preNotes();
					g.set_x(pos.get_x() + container.get_x());
					pos = container.get_postNotes();
					g.set_width(pos.get_x() + container.get_x() + pos.get_width() - g.get_x());
					break;
				}
				case 3: {
					pos = container.get_onNotes();
					g.set_x(pos.get_x() + container.get_x());
					g.set_width(pos.get_width());
					break;
				}
				case 4: {
					pos = container.get_onNotes();
					g.set_x(pos.get_x() + container.get_x());
					pos = container.get_postNotes();
					g.set_width(pos.get_x() + container.get_x() + pos.get_width() - g.get_x());
					break;
				}
				case 5: {
					pos = container.get_postNotes();
					g.set_x(pos.get_x() + container.get_x());
					g.set_width(pos.get_width());
					break;
				}
				case 6: {
					if (!ss.referenceEquals(g, prevGlyph)) {
						this.$alignGlyph(0, beatIndex, voiceIndex, prevGlyph);
					}
					else {
						pos = container.get_preNotes();
						var posR = pos.get_renderer();
						var gR = g.get_renderer();
						g.set_width(posR.get_x() + posR.get_beatGlyphsStart() + container.get_x() + pos.get_x() + pos.get_width() - (gR.get_x() + gR.get_beatGlyphsStart() + g.get_x()));
						if (ss.isInstanceOfType(g, $AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph)) {
							g.expandTo(container.get_beat());
						}
					}
					break;
				}
				case 7: {
					if (!ss.referenceEquals(g, prevGlyph)) {
						this.$alignGlyph(1, beatIndex, voiceIndex, prevGlyph);
					}
					else {
						pos = container.get_onNotes();
						var posR1 = pos.get_renderer();
						var gR1 = g.get_renderer();
						g.set_width(posR1.get_x() + posR1.get_beatGlyphsStart() + container.get_x() + pos.get_x() + pos.get_width() - (gR1.get_x() + gR1.get_beatGlyphsStart() + g.get_x()));
						if (ss.isInstanceOfType(g, $AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph)) {
							g.expandTo(container.get_beat());
						}
					}
					break;
				}
				case 8: {
					if (!ss.referenceEquals(g, prevGlyph)) {
						this.$alignGlyph(2, beatIndex, voiceIndex, prevGlyph);
					}
					else {
						pos = container.get_postNotes();
						var posR2 = pos.get_renderer();
						var gR2 = g.get_renderer();
						g.set_width(posR2.get_x() + posR2.get_beatGlyphsStart() + container.get_x() + pos.get_x() + pos.get_width() - (gR2.get_x() + gR2.get_beatGlyphsStart() + g.get_x()));
						if (ss.isInstanceOfType(g, $AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph)) {
							g.expandTo(container.get_beat());
						}
					}
					break;
				}
				case 9: {
					if (!ss.referenceEquals(g, prevGlyph)) {
						this.$alignGlyph(3, beatIndex, voiceIndex, prevGlyph);
					}
					else {
						pos = container.get_onNotes();
						var posR3 = pos.get_renderer();
						var gR3 = g.get_renderer();
						g.set_width(posR3.get_x() + posR3.get_beatGlyphsStart() + container.get_x() + pos.get_x() + pos.get_width() - (gR3.get_x() + gR3.get_beatGlyphsStart() + g.get_x()));
						if (ss.isInstanceOfType(g, $AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph)) {
							g.expandTo(container.get_beat());
						}
					}
					break;
				}
				case 10: {
					if (!ss.referenceEquals(g, prevGlyph)) {
						this.$alignGlyph(4, beatIndex, voiceIndex, prevGlyph);
					}
					else {
						pos = container.get_postNotes();
						var posR4 = pos.get_renderer();
						var gR4 = g.get_renderer();
						g.set_width(posR4.get_x() + posR4.get_beatGlyphsStart() + container.get_x() + pos.get_x() + pos.get_width() - (gR4.get_x() + gR4.get_beatGlyphsStart() + g.get_x()));
						if (ss.isInstanceOfType(g, $AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph)) {
							g.expandTo(container.get_beat());
						}
					}
					break;
				}
				case 11: {
					if (!ss.referenceEquals(g, prevGlyph)) {
						this.$alignGlyph(11, beatIndex, voiceIndex, prevGlyph);
					}
					else {
						pos = container.get_postNotes();
						var posR5 = pos.get_renderer();
						var gR5 = g.get_renderer();
						g.set_width(posR5.get_x() + posR5.get_beatGlyphsStart() + container.get_x() + pos.get_x() + pos.get_width() - (gR5.get_x() + gR5.get_beatGlyphsStart() + g.get_x()));
						if (ss.isInstanceOfType(g, $AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph)) {
							g.expandTo(container.get_beat());
						}
					}
					break;
				}
			}
		},
		createPreBeatGlyphs: function() {
		},
		createBeatGlyphs: function() {
			ss.add(this.$_effectGlyphs, new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, $AlphaTab_Rendering_Glyphs_Glyph]))());
			ss.add(this.$_uniqueEffectGlyphs, []);
			this.$createVoiceGlyphs(this.get_bar().get_voices()[0]);
		},
		$createVoiceGlyphs: function(v) {
			var $t1 = v.get_beats();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				// we create empty glyphs as alignment references and to get the 
				// effect bar sized
				var container = new $AlphaTab_Rendering_Glyphs_BeatContainerGlyph(b);
				container.set_preNotes(new $AlphaTab_Rendering_Glyphs_BeatGlyphBase());
				container.set_onNotes(new $AlphaTab_Rendering_Glyphs_BeatGlyphBase());
				container.set_postNotes(new $AlphaTab_Rendering_Glyphs_BeatGlyphBase());
				this.addBeatGlyph(container);
				if (this.$_info.shouldCreateGlyph(this, b)) {
					this.$createOrResizeGlyph(this.$_info.get_sizingMode(), b);
				}
				this.$_lastBeat = b;
			}
		},
		$createOrResizeGlyph: function(sizing, b) {
			switch (sizing) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5: {
					var g = this.$_info.createNewGlyph(this, b);
					g.set_renderer(this);
					g.doLayout();
					this.$_effectGlyphs[b.get_voice().get_index()].set_item(b.get_index(), g);
					ss.add(this.$_uniqueEffectGlyphs[b.get_voice().get_index()], g);
					break;
				}
				case 6:
				case 7:
				case 8:
				case 9:
				case 10:
				case 11: {
					if (b.get_index() > 0 || this.get_index() > 0) {
						// check if the previous beat also had this effect
						var prevBeat = b.get_previousBeat();
						if (this.$_info.shouldCreateGlyph(this, prevBeat)) {
							// expand the previous effect
							var prevEffect;
							if (b.get_index() > 0) {
								prevEffect = this.$_effectGlyphs[b.get_voice().get_index()].get_item(prevBeat.get_index());
							}
							else {
								prevEffect = this.get_stave().get_barRenderers()[this.get_index() - 1].$_effectGlyphs[b.get_voice().get_index()].get_item(prevBeat.get_index());
							}
							if (ss.isNullOrUndefined(prevEffect) || !this.$_info.canExpand(this, prevBeat, b)) {
								this.$createOrResizeGlyph(0, b);
							}
							else {
								this.$_effectGlyphs[b.get_voice().get_index()].set_item(b.get_index(), prevEffect);
							}
						}
						else {
							this.$createOrResizeGlyph(0, b);
						}
					}
					else {
						this.$createOrResizeGlyph(0, b);
					}
					break;
				}
			}
		},
		createPostBeatGlyphs: function() {
		},
		get_topPadding: function() {
			return 0;
		},
		get_bottomPadding: function() {
			return 0;
		},
		paintBackground: function(cx, cy, canvas) {
		},
		paint: function(cx, cy, canvas) {
			$AlphaTab_Rendering_GroupedBarRenderer.prototype.paint.call(this, cx, cy, canvas);
			// canvas.setColor(new Color(0, 0, 200, 100));
			// canvas.fillRect(cx + x, cy + y, width, height);
			var glyphStart = this.get_beatGlyphsStart();
			for (var $t1 = 0; $t1 < this.$_uniqueEffectGlyphs.length; $t1++) {
				var v = this.$_uniqueEffectGlyphs[$t1];
				for (var $t2 = 0; $t2 < v.length; $t2++) {
					var g = v[$t2];
					if (ss.referenceEquals(g.get_renderer(), this)) {
						g.paint(cx + this.get_x() + glyphStart, cy + this.get_y(), canvas);
					}
				}
			}
		}
	}, $AlphaTab_Rendering_GroupedBarRenderer);
	ss.initClass($AlphaTab_Rendering_EffectBarRendererFactory, $asm, {
		create: function(bar) {
			return new $AlphaTab_Rendering_EffectBarRenderer(bar, this.$_info);
		}
	}, $AlphaTab_Rendering_BarRendererFactory);
	ss.initInterface($AlphaTab_Rendering_IEffectBarRendererInfo, $asm, { get_hideOnMultiTrack: null, shouldCreateGlyph: null, get_sizingMode: null, getHeight: null, createNewGlyph: null, canExpand: null });
	ss.initClass($AlphaTab_Rendering_RenderingResources, $asm, {
		get_copyrightFont: function() {
			return this.$1$CopyrightFontField;
		},
		set_copyrightFont: function(value) {
			this.$1$CopyrightFontField = value;
		},
		get_titleFont: function() {
			return this.$1$TitleFontField;
		},
		set_titleFont: function(value) {
			this.$1$TitleFontField = value;
		},
		get_subTitleFont: function() {
			return this.$1$SubTitleFontField;
		},
		set_subTitleFont: function(value) {
			this.$1$SubTitleFontField = value;
		},
		get_wordsFont: function() {
			return this.$1$WordsFontField;
		},
		set_wordsFont: function(value) {
			this.$1$WordsFontField = value;
		},
		get_effectFont: function() {
			return this.$1$EffectFontField;
		},
		set_effectFont: function(value) {
			this.$1$EffectFontField = value;
		},
		get_tablatureFont: function() {
			return this.$1$TablatureFontField;
		},
		set_tablatureFont: function(value) {
			this.$1$TablatureFontField = value;
		},
		get_graceFont: function() {
			return this.$1$GraceFontField;
		},
		set_graceFont: function(value) {
			this.$1$GraceFontField = value;
		},
		get_staveLineColor: function() {
			return this.$1$StaveLineColorField;
		},
		set_staveLineColor: function(value) {
			this.$1$StaveLineColorField = value;
		},
		get_barSeperatorColor: function() {
			return this.$1$BarSeperatorColorField;
		},
		set_barSeperatorColor: function(value) {
			this.$1$BarSeperatorColorField = value;
		},
		get_barNumberFont: function() {
			return this.$1$BarNumberFontField;
		},
		set_barNumberFont: function(value) {
			this.$1$BarNumberFontField = value;
		},
		get_barNumberColor: function() {
			return this.$1$BarNumberColorField;
		},
		set_barNumberColor: function(value) {
			this.$1$BarNumberColorField = value;
		},
		get_markerFont: function() {
			return this.$1$MarkerFontField;
		},
		set_markerFont: function(value) {
			this.$1$MarkerFontField = value;
		},
		get_tabClefFont: function() {
			return this.$1$TabClefFontField;
		},
		set_tabClefFont: function(value) {
			this.$1$TabClefFontField = value;
		},
		get_mainGlyphColor: function() {
			return this.$1$MainGlyphColorField;
		},
		set_mainGlyphColor: function(value) {
			this.$1$MainGlyphColorField = value;
		},
		get_scale: function() {
			return this.$1$ScaleField;
		},
		set_scale: function(value) {
			this.$1$ScaleField = value;
		},
		init: function(scale) {
			this.set_scale(scale);
			var sansFont = 'Arial';
			var serifFont = 'Georgia';
			this.set_effectFont(new $AlphaTab_Platform_Model_Font(serifFont, 12 * scale, 2));
			this.set_copyrightFont(new $AlphaTab_Platform_Model_Font(sansFont, 12 * scale, 1));
			this.set_titleFont(new $AlphaTab_Platform_Model_Font(serifFont, 32 * scale, 0));
			this.set_subTitleFont(new $AlphaTab_Platform_Model_Font(serifFont, 20 * scale, 0));
			this.set_wordsFont(new $AlphaTab_Platform_Model_Font(serifFont, 15 * scale, 0));
			this.set_tablatureFont(new $AlphaTab_Platform_Model_Font(sansFont, 13 * scale, 0));
			this.set_graceFont(new $AlphaTab_Platform_Model_Font(sansFont, 11 * scale, 0));
			this.set_staveLineColor(new $AlphaTab_Platform_Model_Color(165, 165, 165, 255));
			this.set_barSeperatorColor(new $AlphaTab_Platform_Model_Color(34, 34, 17, 255));
			this.set_barNumberFont(new $AlphaTab_Platform_Model_Font(sansFont, 11 * scale, 0));
			this.set_barNumberColor(new $AlphaTab_Platform_Model_Color(200, 0, 0, 255));
			this.set_markerFont(new $AlphaTab_Platform_Model_Font(serifFont, 14 * scale, 1));
			this.set_tabClefFont(new $AlphaTab_Platform_Model_Font(sansFont, 18 * scale, 1));
			this.set_mainGlyphColor(new $AlphaTab_Platform_Model_Color(0, 0, 0, 255));
		}
	});
	ss.initClass($AlphaTab_Rendering_RhythmBarRenderer, $asm, {
		doLayout: function() {
			this.$_helpers = this.get_stave().get_staveGroup().get_helpers().get_helpers().get_item(this.get_bar().get_track().get_index()).get_item(this.get_bar().get_index());
			$AlphaTab_Rendering_GroupedBarRenderer.prototype.doLayout.call(this);
			this.set_height(ss.Int32.trunc(24 * this.get_scale()));
			this.set_isEmpty(false);
		},
		createBeatGlyphs: function() {
			this.$createVoiceGlyphs(this.get_bar().get_voices()[0]);
		},
		$createVoiceGlyphs: function(voice) {
			var $t1 = voice.get_beats();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				// we create empty glyphs as alignment references and to get the 
				// effect bar sized
				var container = new $AlphaTab_Rendering_Glyphs_BeatContainerGlyph(b);
				container.set_preNotes(new $AlphaTab_Rendering_Glyphs_BeatGlyphBase());
				container.set_onNotes(new $AlphaTab_Rendering_Glyphs_BeatGlyphBase());
				container.set_postNotes(new $AlphaTab_Rendering_Glyphs_BeatGlyphBase());
				this.addBeatGlyph(container);
			}
		},
		paintBackground: function(cx, cy, canvas) {
		},
		paint: function(cx, cy, canvas) {
			$AlphaTab_Rendering_GroupedBarRenderer.prototype.paint.call(this, cx, cy, canvas);
			var $t1 = this.$_helpers.get_beamHelpers();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var v = $t1[$t2];
				for (var $t3 = 0; $t3 < v.length; $t3++) {
					var h = v[$t3];
					this.$paintBeamHelper(cx + this.get_beatGlyphsStart(), cy, canvas, h);
				}
			}
		},
		$paintBeamHelper: function(cx, cy, canvas, h) {
			// check if we need to paint simple footer
			if (h.get_beats().length === 1) {
				this.$paintFooter(cx, cy, canvas, h);
			}
			else {
				this.$paintBar(cx, cy, canvas, h);
			}
		},
		$paintBar: function(cx, cy, canvas, h) {
			for (var i = 0; i < h.get_beats().length; i++) {
				var beat = h.get_beats()[i];
				if (h.hasBeatLineX(beat)) {
					//
					// draw line 
					//
					var beatLineX = ss.Int32.trunc(h.getBeatLineX(beat) + this.get_scale());
					var y1 = cy + this.get_y();
					var y2 = cy + this.get_y() + this.get_height();
					canvas.set_color(this.get_resources().get_mainGlyphColor());
					canvas.beginPath();
					canvas.moveTo(cx + this.get_x() + beatLineX, y1);
					canvas.lineTo(cx + this.get_x() + beatLineX, y2);
					canvas.stroke();
					var brokenBarOffset = 6 * this.get_scale();
					var barSpacing = 6 * this.get_scale();
					var barSize = 3 * this.get_scale();
					var barCount = $AlphaTab_Model_ModelUtils.getIndex(beat.get_duration()) - 2;
					var barStart = cy + this.get_y();
					if (this.$_direction === 0) {
						barSpacing = -barSpacing;
						barStart += this.get_height();
					}
					for (var barIndex = 0; barIndex < barCount; barIndex++) {
						var barStartX;
						var barEndX;
						var barStartY;
						var barEndY;
						var barY = barStart + barIndex * barSpacing;
						// 
						// Bar to Next?
						//
						if (i < h.get_beats().length - 1) {
							// full bar?
							if (this.$isFullBarJoin(beat, h.get_beats()[i + 1], barIndex)) {
								barStartX = beatLineX;
								barEndX = h.getBeatLineX(h.get_beats()[i + 1]) + this.get_scale();
							}
							else if (i === 0 || !this.$isFullBarJoin(h.get_beats()[i - 1], beat, barIndex)) {
								barStartX = beatLineX;
								barEndX = barStartX + brokenBarOffset;
							}
							else {
								continue;
							}
							barStartY = barY;
							barEndY = barY;
							$AlphaTab_Rendering_RhythmBarRenderer.$paintSingleBar(canvas, cx + this.get_x() + barStartX, barStartY, cx + this.get_x() + barEndX, barEndY, barSize);
						}
						else if (i > 0 && !this.$isFullBarJoin(beat, h.get_beats()[i - 1], barIndex)) {
							barStartX = beatLineX - brokenBarOffset;
							barEndX = beatLineX;
							barStartY = barY;
							barEndY = barY;
							$AlphaTab_Rendering_RhythmBarRenderer.$paintSingleBar(canvas, cx + this.get_x() + barStartX, barStartY, cx + this.get_x() + barEndX, barEndY, barSize);
						}
					}
				}
			}
		},
		$paintFooter: function(cx, cy, canvas, h) {
			var beat = h.get_beats()[0];
			if (beat.get_duration() === 1) {
				return;
			}
			//
			// draw line 
			//
			var beatLineX = h.getBeatLineX(beat) + this.get_scale();
			var direction = h.get_direction();
			var topY = 0;
			var bottomY = this.get_height();
			var beamY = ((direction === 1) ? bottomY : topY);
			canvas.set_color(this.get_resources().get_mainGlyphColor());
			canvas.beginPath();
			canvas.moveTo(cx + this.get_x() + beatLineX, cy + this.get_y() + topY);
			canvas.lineTo(cx + this.get_x() + beatLineX, cy + this.get_y() + bottomY);
			canvas.stroke();
			//
			// Draw beam 
			//
			var glyph = new $AlphaTab_Rendering_Glyphs_BeamGlyph(ss.Int32.trunc(beatLineX), beamY, beat.get_duration(), direction, false);
			glyph.set_renderer(this);
			glyph.doLayout();
			glyph.paint(cx + this.get_x(), cy + this.get_y(), canvas);
		},
		$isFullBarJoin: function(a, b, barIndex) {
			return $AlphaTab_Model_ModelUtils.getIndex(a.get_duration()) - 2 - barIndex > 0 && $AlphaTab_Model_ModelUtils.getIndex(b.get_duration()) - 2 - barIndex > 0;
		}
	}, $AlphaTab_Rendering_GroupedBarRenderer);
	ss.initClass($AlphaTab_Rendering_RhythmBarRendererFactory, $asm, {
		create: function(bar) {
			return new $AlphaTab_Rendering_RhythmBarRenderer(bar, this.$_direction);
		}
	}, $AlphaTab_Rendering_BarRendererFactory);
	ss.initClass($AlphaTab_Rendering_ScoreBarRenderer, $asm, {
		get_accidentalHelper: function() {
			return this.$3$AccidentalHelperField;
		},
		set_accidentalHelper: function(value) {
			this.$3$AccidentalHelperField = value;
		},
		getBeatDirection: function(beat) {
			var g = this.getOnNotesPosition(beat.get_voice().get_index(), beat.get_index());
			if (ss.isValue(g)) {
				return g.get_noteHeads().get_direction();
			}
			return 0;
		},
		getNoteX: function(note, onEnd) {
			var g = this.getOnNotesPosition(note.get_beat().get_voice().get_index(), note.get_beat().get_index());
			if (ss.isValue(g)) {
				return g.get_container().get_x() + g.get_x() + g.get_noteHeads().getNoteX(note, onEnd);
			}
			return 0;
		},
		getNoteY: function(note) {
			var beat = this.getOnNotesPosition(note.get_beat().get_voice().get_index(), note.get_beat().get_index());
			if (ss.isValue(beat)) {
				return beat.get_noteHeads().getNoteY(note);
			}
			return 0;
		},
		get_topPadding: function() {
			return this.get_$glyphOverflow();
		},
		get_bottomPadding: function() {
			return this.get_$glyphOverflow();
		},
		get_lineOffset: function() {
			return 9 * this.get_scale();
		},
		doLayout: function() {
			this.$_helpers = this.get_stave().get_staveGroup().get_helpers().get_helpers().get_item(this.get_bar().get_track().get_index()).get_item(this.get_bar().get_index());
			$AlphaTab_Rendering_GroupedBarRenderer.prototype.doLayout.call(this);
			this.set_height(ss.Int32.trunc(this.get_lineOffset() * 4) + this.get_topPadding() + this.get_bottomPadding());
			if (this.get_index() === 0) {
				this.get_stave().registerStaveTop(this.get_$glyphOverflow());
				this.get_stave().registerStaveBottom(this.get_height() - this.get_$glyphOverflow());
			}
			var top = this.getScoreY(0, 0);
			var bottom = this.getScoreY(8, 0);
			var $t1 = this.$_helpers.get_beamHelpers();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var v = $t1[$t2];
				for (var $t3 = 0; $t3 < v.length; $t3++) {
					var h = v[$t3];
					//
					// max note (highest) -> top overflow
					// 
					var maxNoteY = this.getScoreY(this.getNoteLine(h.get_maxNote()), 0);
					if (h.get_direction() === 0) {
						maxNoteY -= this.$getStemSize(h.get_maxDuration());
					}
					if (maxNoteY < top) {
						this.registerOverflowTop(Math.abs(maxNoteY));
					}
					//
					// min note (lowest) -> bottom overflow
					//
					var minNoteY = this.getScoreY(this.getNoteLine(h.get_minNote()), 0);
					if (h.get_direction() === 1) {
						minNoteY += this.$getStemSize(h.get_maxDuration());
					}
					if (minNoteY > bottom) {
						this.registerOverflowBottom(Math.abs(minNoteY) - bottom);
					}
				}
			}
		},
		paint: function(cx, cy, canvas) {
			$AlphaTab_Rendering_GroupedBarRenderer.prototype.paint.call(this, cx, cy, canvas);
			this.$paintBeams(cx, cy, canvas);
			this.$paintTuplets(cx, cy, canvas);
		},
		$paintTuplets: function(cx, cy, canvas) {
			var $t1 = this.$_helpers.get_tupletHelpers();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var v = $t1[$t2];
				for (var $t3 = 0; $t3 < v.length; $t3++) {
					var h = v[$t3];
					this.$paintTupletHelper(cx + this.get_beatGlyphsStart(), cy, canvas, h);
				}
			}
		},
		$paintBeams: function(cx, cy, canvas) {
			var $t1 = this.$_helpers.get_beamHelpers();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var v = $t1[$t2];
				for (var $t3 = 0; $t3 < v.length; $t3++) {
					var h = v[$t3];
					this.$paintBeamHelper(cx + this.get_beatGlyphsStart(), cy, canvas, h);
				}
			}
		},
		$paintBeamHelper: function(cx, cy, canvas, h) {
			// check if we need to paint simple footer
			if (h.get_beats().length === 1) {
				this.$paintFooter(cx, cy, canvas, h);
			}
			else {
				this.$paintBar(cx, cy, canvas, h);
			}
		},
		$paintTupletHelper: function(cx, cy, canvas, h) {
			var res = this.get_resources();
			var oldAlign = canvas.get_textAlign();
			canvas.set_textAlign(1);
			// check if we need to paint simple footer
			if (h.get_beats().length === 1 || !h.get_isFull()) {
				for (var i = 0; i < h.get_beats().length; i++) {
					var beat = h.get_beats()[i];
					var beamingHelper = this.$_helpers.get_beamHelperLookup()[h.get_voiceIndex()].get_item(beat.get_index());
					if (ss.isNullOrUndefined(beamingHelper)) {
						continue;
					}
					var direction = beamingHelper.get_direction();
					var tupletX = ss.Int32.trunc(beamingHelper.getBeatLineX(beat) + this.get_scale());
					var tupletY = cy + this.get_y() + this.$calculateBeamY(beamingHelper, tupletX);
					var offset = ((direction === 0) ? ss.Int32.trunc(res.get_effectFont().get_size() * 1.79999995231628) : -ss.Int32.trunc(3 * this.get_scale()));
					canvas.set_font(res.get_effectFont());
					canvas.fillText(h.get_tuplet().toString(), cx + this.get_x() + tupletX, tupletY - offset);
				}
			}
			else {
				var firstBeat = h.get_beats()[0];
				var lastBeat = h.get_beats()[h.get_beats().length - 1];
				var beamingHelper1 = this.$_helpers.get_beamHelperLookup()[h.get_voiceIndex()].get_item(firstBeat.get_index());
				if (ss.isValue(beamingHelper1)) {
					var direction1 = beamingHelper1.get_direction();
					// 
					// Calculate the overall area of the tuplet bracket
					var startX = ss.Int32.trunc(beamingHelper1.getBeatLineX(firstBeat) + this.get_scale());
					var endX = ss.Int32.trunc(beamingHelper1.getBeatLineX(lastBeat) + this.get_scale());
					//
					// Calculate how many space the text will need
					canvas.set_font(res.get_effectFont());
					var s = h.get_tuplet().toString();
					var sw = canvas.measureText(s);
					var sp = ss.Int32.trunc(3 * this.get_scale());
					// 
					// Calculate the offsets where to break the bracket
					var middleX = ss.Int32.div(startX + endX, 2);
					var offset1X = ss.Int32.trunc(middleX - sw / 2 - sp);
					var offset2X = ss.Int32.trunc(middleX + sw / 2 + sp);
					//
					// calculate the y positions for our bracket
					var startY = this.$calculateBeamY(beamingHelper1, startX);
					var offset1Y = this.$calculateBeamY(beamingHelper1, offset1X);
					var middleY = this.$calculateBeamY(beamingHelper1, middleX);
					var offset2Y = this.$calculateBeamY(beamingHelper1, offset2X);
					var endY = this.$calculateBeamY(beamingHelper1, endX);
					var offset1 = ss.Int32.trunc(10 * this.get_scale());
					var size = ss.Int32.trunc(5 * this.get_scale());
					if (direction1 === 1) {
						offset1 *= -1;
						size *= -1;
					}
					//
					// draw the bracket
					canvas.beginPath();
					canvas.moveTo(cx + this.get_x() + startX, cy + this.get_y() + startY - offset1);
					canvas.lineTo(cx + this.get_x() + startX, cy + this.get_y() + startY - offset1 - size);
					canvas.lineTo(cx + this.get_x() + offset1X, cy + this.get_y() + offset1Y - offset1 - size);
					canvas.stroke();
					canvas.beginPath();
					canvas.moveTo(cx + this.get_x() + offset2X, cy + this.get_y() + offset2Y - offset1 - size);
					canvas.lineTo(cx + this.get_x() + endX, cy + this.get_y() + endY - offset1 - size);
					canvas.lineTo(cx + this.get_x() + endX, cy + this.get_y() + endY - offset1);
					canvas.stroke();
					//
					// Draw the string
					canvas.fillText(s, cx + this.get_x() + middleX, cy + this.get_y() + middleY - offset1 - size - res.get_effectFont().get_size());
				}
			}
			canvas.set_textAlign(oldAlign);
		},
		$getStemSize: function(duration) {
			var size;
			switch (duration) {
				case 2: {
					size = 6;
					break;
				}
				case 4: {
					size = 6;
					break;
				}
				case 8: {
					size = 6;
					break;
				}
				case 16: {
					size = 6;
					break;
				}
				case 32: {
					size = 7;
					break;
				}
				case 64: {
					size = 8;
					break;
				}
				default: {
					size = 0;
					break;
				}
			}
			return this.getScoreY(size, 0);
		},
		$calculateBeamY: function(h, x) {
			var correction = 4;
			var stemSize = this.$getStemSize(h.get_maxDuration());
			return h.calculateBeamY(stemSize, ss.Int32.trunc(this.get_scale()), x, this.get_scale(), ss.mkdel(this, function(n) {
				return this.getScoreY(this.getNoteLine(n), correction - 1);
			}));
		},
		$paintBar: function(cx, cy, canvas, h) {
			for (var i = 0; i < h.get_beats().length; i++) {
				var beat = h.get_beats()[i];
				var correction = 4;
				//
				// draw line 
				//
				var beatLineX = ss.Int32.trunc(h.getBeatLineX(beat) + this.get_scale());
				var direction = h.get_direction();
				var y1 = cy + this.get_y() + ((direction === 0) ? this.getScoreY(this.getNoteLine(beat.get_minNote()), correction - 1) : this.getScoreY(this.getNoteLine(beat.get_maxNote()), correction - 1));
				var y2 = cy + this.get_y() + this.$calculateBeamY(h, beatLineX);
				canvas.set_color(this.get_layout().get_renderer().get_renderingResources().get_mainGlyphColor());
				canvas.beginPath();
				canvas.moveTo(cx + this.get_x() + beatLineX, y1);
				canvas.lineTo(cx + this.get_x() + beatLineX, y2);
				canvas.stroke();
				var brokenBarOffset = ss.Int32.trunc(6 * this.get_scale());
				var barSpacing = ss.Int32.trunc(6 * this.get_scale());
				var barSize = ss.Int32.trunc(3 * this.get_scale());
				var barCount = $AlphaTab_Model_ModelUtils.getIndex(beat.get_duration()) - 2;
				var barStart = cy + this.get_y();
				if (direction === 1) {
					barSpacing = -barSpacing;
				}
				for (var barIndex = 0; barIndex < barCount; barIndex++) {
					var barStartX;
					var barEndX;
					var barStartY;
					var barEndY;
					var barY = barStart + barIndex * barSpacing;
					// 
					// Bar to Next?
					//
					if (i < h.get_beats().length - 1) {
						// full bar?
						if (this.$isFullBarJoin(beat, h.get_beats()[i + 1], barIndex)) {
							barStartX = beatLineX;
							barEndX = ss.Int32.trunc(h.getBeatLineX(h.get_beats()[i + 1]) + this.get_scale());
						}
						else if (i === 0 || !this.$isFullBarJoin(h.get_beats()[i - 1], beat, barIndex)) {
							barStartX = beatLineX;
							barEndX = barStartX + brokenBarOffset;
						}
						else {
							continue;
						}
						barStartY = barY + this.$calculateBeamY(h, barStartX);
						barEndY = barY + this.$calculateBeamY(h, barEndX);
						$AlphaTab_Rendering_ScoreBarRenderer.$paintSingleBar(canvas, cx + this.get_x() + barStartX, barStartY, cx + this.get_x() + barEndX, barEndY, barSize);
					}
					else if (i > 0 && !this.$isFullBarJoin(beat, h.get_beats()[i - 1], barIndex)) {
						barStartX = beatLineX - brokenBarOffset;
						barEndX = beatLineX;
						barStartY = barY + this.$calculateBeamY(h, barStartX);
						barEndY = barY + this.$calculateBeamY(h, barEndX);
						$AlphaTab_Rendering_ScoreBarRenderer.$paintSingleBar(canvas, cx + this.get_x() + barStartX, barStartY, cx + this.get_x() + barEndX, barEndY, barSize);
					}
				}
			}
		},
		$isFullBarJoin: function(a, b, barIndex) {
			return $AlphaTab_Model_ModelUtils.getIndex(a.get_duration()) - 2 - barIndex > 0 && $AlphaTab_Model_ModelUtils.getIndex(b.get_duration()) - 2 - barIndex > 0;
		},
		$paintFooter: function(cx, cy, canvas, h) {
			var beat = h.get_beats()[0];
			if (beat.get_duration() === 1) {
				return;
			}
			var isGrace = beat.get_graceType() !== 0;
			var scaleMod = (isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1);
			//
			// draw line 
			//
			var stemSize = this.$getStemSize(h.get_maxDuration());
			var correction = ss.Int32.trunc(9 * scaleMod / 2);
			var beatLineX = ss.Int32.trunc(h.getBeatLineX(beat) + this.get_scale());
			var direction = h.get_direction();
			var topY = this.getScoreY(this.getNoteLine(beat.get_maxNote()), correction);
			var bottomY = this.getScoreY(this.getNoteLine(beat.get_minNote()), correction);
			var beamY;
			if (direction === 1) {
				bottomY += ss.Int32.trunc(stemSize * scaleMod);
				beamY = bottomY;
			}
			else {
				topY -= ss.Int32.trunc(stemSize * scaleMod);
				beamY = topY;
			}
			canvas.set_color(this.get_layout().get_renderer().get_renderingResources().get_mainGlyphColor());
			canvas.beginPath();
			canvas.moveTo(cx + this.get_x() + beatLineX, cy + this.get_y() + topY);
			canvas.lineTo(cx + this.get_x() + beatLineX, cy + this.get_y() + bottomY);
			canvas.stroke();
			if (isGrace) {
				var graceSizeY = 15 * this.get_scale();
				var graceSizeX = 12 * this.get_scale();
				canvas.beginPath();
				if (direction === 1) {
					canvas.moveTo(ss.Int32.trunc(cx + this.get_x() + beatLineX - graceSizeX / 2), cy + this.get_y() + bottomY - graceSizeY);
					canvas.lineTo(ss.Int32.trunc(cx + this.get_x() + beatLineX + graceSizeX / 2), cy + this.get_y() + bottomY);
				}
				else {
					canvas.moveTo(cx + this.get_x() + beatLineX - graceSizeX / 2, cy + this.get_y() + topY + graceSizeY);
					canvas.lineTo(cx + this.get_x() + beatLineX + graceSizeX / 2, cy + this.get_y() + topY);
				}
				canvas.stroke();
			}
			//
			// Draw beam 
			//
			var glyph = new $AlphaTab_Rendering_Glyphs_BeamGlyph(beatLineX, beamY, beat.get_duration(), direction, isGrace);
			glyph.set_renderer(this);
			glyph.doLayout();
			glyph.paint(cx + this.get_x(), cy + this.get_y(), canvas);
		},
		createPreBeatGlyphs: function() {
			if (this.get_bar().get_masterBar().get_isRepeatStart()) {
				this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_RepeatOpenGlyph(0, 0, 1.5, 3));
			}
			// Clef
			if (this.get_isFirstOfLine() || this.get_bar().get_clef() !== this.get_bar().get_previousBar().get_clef()) {
				var offset = 0;
				switch (this.get_bar().get_clef()) {
					case 0: {
						offset = 4;
						break;
					}
					case 3: {
						offset = 4;
						break;
					}
					case 1: {
						offset = 6;
						break;
					}
					case 2: {
						offset = 4;
						break;
					}
					case 4: {
						offset = 6;
						break;
					}
				}
				this.$createStartSpacing();
				this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_ClefGlyph(0, this.getScoreY(offset, 0), this.get_bar().get_clef()));
			}
			// Key signature
			if (ss.isNullOrUndefined(this.get_bar().get_previousBar()) && this.get_bar().get_masterBar().get_keySignature() !== 0 || ss.isValue(this.get_bar().get_previousBar()) && this.get_bar().get_masterBar().get_keySignature() !== this.get_bar().get_previousBar().get_masterBar().get_keySignature()) {
				this.$createStartSpacing();
				this.$createKeySignatureGlyphs();
			}
			// Time Signature
			if (ss.isNullOrUndefined(this.get_bar().get_previousBar()) || ss.isValue(this.get_bar().get_previousBar()) && this.get_bar().get_masterBar().get_timeSignatureNumerator() !== this.get_bar().get_previousBar().get_masterBar().get_timeSignatureNumerator() || ss.isValue(this.get_bar().get_previousBar()) && this.get_bar().get_masterBar().get_timeSignatureDenominator() !== this.get_bar().get_previousBar().get_masterBar().get_timeSignatureDenominator()) {
				this.$createStartSpacing();
				this.$createTimeSignatureGlyphs();
			}
			this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_BarNumberGlyph(0, this.getScoreY(-1, -3), this.get_bar().get_index() + 1, !this.get_stave().get_isFirstInAccolade()));
			if (this.get_bar().get_isEmpty()) {
				this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(30 * this.get_scale()), false));
			}
		},
		createBeatGlyphs: function() {
			this.$createVoiceGlyphs(this.get_bar().get_voices()[0]);
		},
		createPostBeatGlyphs: function() {
			if (this.get_bar().get_masterBar().get_isRepeatEnd()) {
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_RepeatCloseGlyph(this.get_x(), 0));
				if (this.get_bar().get_masterBar().get_repeatCount() > 2) {
					var line = ((this.get_isLast() || this.get_isLastOfLine()) ? -1 : -4);
					this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_RepeatCountGlyph(0, this.getScoreY(line, -3), this.get_bar().get_masterBar().get_repeatCount()));
				}
			}
			else if (this.get_bar().get_masterBar().get_isDoubleBar()) {
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_BarSeperatorGlyph(0, 0, false));
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(3 * this.get_scale()), false));
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_BarSeperatorGlyph(0, 0, false));
			}
			else if (ss.isNullOrUndefined(this.get_bar().get_nextBar()) || !this.get_bar().get_nextBar().get_masterBar().get_isRepeatStart()) {
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_BarSeperatorGlyph(0, 0, this.get_isLast()));
			}
		},
		$createStartSpacing: function() {
			if (this.$_startSpacing) {
				return;
			}
			this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(2 * this.get_scale()), true));
			this.$_startSpacing = true;
		},
		$createKeySignatureGlyphs: function() {
			var offsetClef = 0;
			var currentKey = this.get_bar().get_masterBar().get_keySignature();
			var previousKey = (ss.isNullOrUndefined(this.get_bar().get_previousBar()) ? 0 : this.get_bar().get_previousBar().get_masterBar().get_keySignature());
			switch (this.get_bar().get_clef()) {
				case 0: {
					offsetClef = 0;
					break;
				}
				case 4: {
					offsetClef = 0;
					break;
				}
				case 3: {
					offsetClef = 2;
					break;
				}
				case 1: {
					offsetClef = -1;
					break;
				}
				case 2: {
					offsetClef = 1;
					break;
				}
			}
			// naturalize previous key
			// TODO: only naturalize the symbols needed 
			var naturalizeSymbols = Math.abs(previousKey);
			var previousKeyPositions = ($AlphaTab_Model_ModelUtils.keySignatureIsSharp(previousKey) ? $AlphaTab_Rendering_ScoreBarRenderer.$sharpKsSteps : $AlphaTab_Rendering_ScoreBarRenderer.$flatKsSteps);
			for (var i = 0; i < naturalizeSymbols; i++) {
				this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_NaturalizeGlyph(0, this.getScoreY(previousKeyPositions[i] + offsetClef, 0), false));
			}
			// how many symbols do we need to get from a C-keysignature
			// to the new one
			//var offsetSymbols = (currentKey <= 7) ? currentKey : currentKey - 7;
			// a sharp keysignature
			if ($AlphaTab_Model_ModelUtils.keySignatureIsSharp(currentKey)) {
				for (var i1 = 0; i1 < Math.abs(currentKey); i1++) {
					this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_SharpGlyph(0, this.getScoreY($AlphaTab_Rendering_ScoreBarRenderer.$sharpKsSteps[i1] + offsetClef, 0), false));
				}
			}
			else {
				for (var i2 = 0; i2 < Math.abs(currentKey); i2++) {
					this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_FlatGlyph(0, this.getScoreY($AlphaTab_Rendering_ScoreBarRenderer.$flatKsSteps[i2] + offsetClef, 0), false));
				}
			}
		},
		$createTimeSignatureGlyphs: function() {
			this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(5 * this.get_scale()), true));
			this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_TimeSignatureGlyph(0, 0, this.get_bar().get_masterBar().get_timeSignatureNumerator(), this.get_bar().get_masterBar().get_timeSignatureDenominator()));
		},
		$createVoiceGlyphs: function(v) {
			var $t1 = v.get_beats();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				var container = new $AlphaTab_Rendering_ScoreBeatContainerGlyph(b);
				container.set_preNotes(new $AlphaTab_Rendering_Glyphs_ScoreBeatPreNotesGlyph());
				container.set_onNotes(new $AlphaTab_Rendering_Glyphs_ScoreBeatGlyph());
				container.get_onNotes().set_beamingHelper(this.$_helpers.get_beamHelperLookup()[v.get_index()].get_item(b.get_index()));
				container.set_postNotes(new $AlphaTab_Rendering_Glyphs_ScoreBeatPostNotesGlyph());
				this.addBeatGlyph(container);
			}
		},
		getNoteLine: function(n) {
			var value = (n.get_beat().get_voice().get_bar().get_track().get_isPercussion() ? $AlphaTab_Rendering_Utils_PercussionMapper.mapValue(n) : n.get_realValue());
			var ks = n.get_beat().get_voice().get_bar().get_masterBar().get_keySignature();
			var clef = n.get_beat().get_voice().get_bar().get_clef();
			var index = value % 12;
			var octave = ss.Int32.div(value, 12);
			// Initial Position
			var steps = $AlphaTab_Rendering_ScoreBarRenderer.$octaveSteps[clef];
			// Move to Octave
			steps -= octave * $AlphaTab_Rendering_ScoreBarRenderer.$stepsPerOctave;
			// Add offset for note itself
			steps -= (($AlphaTab_Model_ModelUtils.keySignatureIsSharp(ks) || $AlphaTab_Model_ModelUtils.keySignatureIsNatural(ks)) ? $AlphaTab_Rendering_ScoreBarRenderer.$sharpNoteSteps[index] : $AlphaTab_Rendering_ScoreBarRenderer.$flatNoteSteps[index]);
			// TODO: It seems note heads are always one step above the calculated line 
			// maybe the SVG paths are wrong, need to recheck where step=0 is really placed
			return steps + $AlphaTab_Rendering_ScoreBarRenderer.noteStepCorrection;
		},
		getScoreY: function(steps, correction) {
			return ss.Int32.trunc(this.get_lineOffset() / 2 * steps + correction * this.get_scale());
		},
		get_$glyphOverflow: function() {
			var res = this.get_resources();
			return ss.Int32.trunc(res.get_tablatureFont().get_size() / 2 + res.get_tablatureFont().get_size() * 0.2);
		},
		paintBackground: function(cx, cy, canvas) {
			var res = this.get_resources();
			//var c = new Color((byte)Random.Next(255),
			//                  (byte)Random.Next(255),
			//                  (byte)Random.Next(255),
			//                  100);
			//canvas.Color = c;
			//canvas.FillRect(cx + X, cy + Y, Width, Height);
			//
			// draw string lines
			//
			canvas.set_color(res.get_staveLineColor());
			var lineY = cy + this.get_y() + this.get_$glyphOverflow();
			for (var i = 0; i < 5; i++) {
				if (i > 0) {
					lineY += ss.Int32.trunc(this.get_lineOffset());
				}
				canvas.beginPath();
				canvas.moveTo(cx + this.get_x(), lineY);
				canvas.lineTo(cx + this.get_x() + this.get_width(), lineY);
				canvas.stroke();
			}
		}
	}, $AlphaTab_Rendering_GroupedBarRenderer);
	ss.initClass($AlphaTab_Rendering_ScoreBarRendererFactory, $asm, {
		create: function(bar) {
			return new $AlphaTab_Rendering_ScoreBarRenderer(bar);
		}
	}, $AlphaTab_Rendering_BarRendererFactory);
	ss.initClass($AlphaTab_Rendering_Glyphs_Glyph, $asm, {
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_x: function() {
			return this.$1$XField;
		},
		set_x: function(value) {
			this.$1$XField = value;
		},
		get_y: function() {
			return this.$1$YField;
		},
		set_y: function(value) {
			this.$1$YField = value;
		},
		get_width: function() {
			return this.$1$WidthField;
		},
		set_width: function(value) {
			this.$1$WidthField = value;
		},
		get_renderer: function() {
			return this.$1$RendererField;
		},
		set_renderer: function(value) {
			this.$1$RendererField = value;
		},
		applyGlyphSpacing: function(spacing) {
			if (this.get_canScale()) {
				this.set_width(this.get_width() + spacing);
			}
		},
		get_canScale: function() {
			return true;
		},
		get_scale: function() {
			return this.get_renderer().get_scale();
		},
		doLayout: function() {
		},
		paint: function(cx, cy, canvas) {
		}
	});
	ss.initInterface($AlphaTab_Rendering_Glyphs_ISupportsFinalize, $asm, { finalizeGlyph: null });
	ss.initClass($AlphaTab_Rendering_Glyphs_BeatContainerGlyph, $asm, {
		get_beat: function() {
			return this.$2$BeatField;
		},
		set_beat: function(value) {
			this.$2$BeatField = value;
		},
		get_preNotes: function() {
			return this.$2$PreNotesField;
		},
		set_preNotes: function(value) {
			this.$2$PreNotesField = value;
		},
		get_onNotes: function() {
			return this.$2$OnNotesField;
		},
		set_onNotes: function(value) {
			this.$2$OnNotesField = value;
		},
		get_postNotes: function() {
			return this.$2$PostNotesField;
		},
		set_postNotes: function(value) {
			this.$2$PostNotesField = value;
		},
		get_ties: function() {
			return this.$2$TiesField;
		},
		set_ties: function(value) {
			this.$2$TiesField = value;
		},
		finalizeGlyph: function(layout) {
			if (ss.isInstanceOfType(this.get_preNotes(), $AlphaTab_Rendering_Glyphs_ISupportsFinalize)) {
				this.get_preNotes().finalizeGlyph(layout);
			}
			if (ss.isInstanceOfType(this.get_onNotes(), $AlphaTab_Rendering_Glyphs_ISupportsFinalize)) {
				this.get_onNotes().finalizeGlyph(layout);
			}
			if (ss.isInstanceOfType(this.get_postNotes(), $AlphaTab_Rendering_Glyphs_ISupportsFinalize)) {
				this.get_postNotes().finalizeGlyph(layout);
			}
		},
		registerMaxSizes: function(sizes) {
			if (sizes.getPreNoteSize(this.get_beat().get_start()) < this.get_preNotes().get_width()) {
				sizes.setPreNoteSize(this.get_beat().get_start(), this.get_preNotes().get_width());
			}
			if (sizes.getOnNoteSize(this.get_beat().get_start()) < this.get_onNotes().get_width()) {
				sizes.setOnNoteSize(this.get_beat().get_start(), this.get_onNotes().get_width());
			}
			if (sizes.getPostNoteSize(this.get_beat().get_start()) < this.get_postNotes().get_width()) {
				sizes.setPostNoteSize(this.get_beat().get_start(), this.get_postNotes().get_width());
			}
		},
		applySizes: function(sizes) {
			var size;
			var diff;
			size = sizes.getPreNoteSize(this.get_beat().get_start());
			diff = size - this.get_preNotes().get_width();
			this.get_preNotes().set_x(0);
			if (diff > 0) {
				this.get_preNotes().applyGlyphSpacing(diff);
			}
			size = sizes.getOnNoteSize(this.get_beat().get_start());
			diff = size - this.get_onNotes().get_width();
			this.get_onNotes().set_x(this.get_preNotes().get_x() + this.get_preNotes().get_width());
			if (diff > 0) {
				this.get_onNotes().applyGlyphSpacing(diff);
			}
			size = sizes.getPostNoteSize(this.get_beat().get_start());
			diff = size - this.get_postNotes().get_width();
			this.get_postNotes().set_x(this.get_onNotes().get_x() + this.get_onNotes().get_width());
			if (diff > 0) {
				this.get_postNotes().applyGlyphSpacing(diff);
			}
			this.set_width(this.$calculateWidth());
		},
		$calculateWidth: function() {
			return this.get_postNotes().get_x() + this.get_postNotes().get_width();
		},
		doLayout: function() {
			this.get_preNotes().set_x(0);
			this.get_preNotes().set_index(0);
			this.get_preNotes().set_renderer(this.get_renderer());
			this.get_preNotes().set_container(this);
			this.get_preNotes().doLayout();
			this.get_onNotes().set_x(this.get_preNotes().get_x() + this.get_preNotes().get_width());
			this.get_onNotes().set_index(1);
			this.get_onNotes().set_renderer(this.get_renderer());
			this.get_onNotes().set_container(this);
			this.get_onNotes().doLayout();
			this.get_postNotes().set_x(this.get_onNotes().get_x() + this.get_onNotes().get_width());
			this.get_postNotes().set_index(2);
			this.get_postNotes().set_renderer(this.get_renderer());
			this.get_postNotes().set_container(this);
			this.get_postNotes().doLayout();
			var i = this.get_beat().get_notes().length - 1;
			while (i >= 0) {
				this.createTies(this.get_beat().get_notes()[i--]);
			}
			this.set_width(this.$calculateWidth());
		},
		createTies: function(n) {
		},
		paint: function(cx, cy, canvas) {
			// canvas.Color = new Color(200, 0, 0, 100);
			// canvas.FillRect(cx + x, cy + y + 15 * Beat.Voice.Index, width, 10);
			// canvas.Font = new Font("Arial", 10);
			// canvas.Color = new Color(0, 0, 0);
			// canvas.FillText(Beat.Voice.Index + ":" + Beat.Index, cx + X, cy + Y + 15 * Beat.Voice.Index);
			this.get_preNotes().paint(cx + this.get_x(), cy + this.get_y(), canvas);
			//canvas.Color = new Color(200, 0, 0, 100);
			//canvas.FillRect(cx + X + PreNotes.X, cy + Y + PreNotes.Y, PreNotes.Width, 10);
			this.get_onNotes().paint(cx + this.get_x(), cy + this.get_y(), canvas);
			//canvas.Color new Color(0, 200, 0, 100);
			//canvas.FillRect(cx + X + OnNotes.X, cy + Y + OnNotes.Y + 10, OnNotes.Width, 10);
			this.get_postNotes().paint(cx + this.get_x(), cy + this.get_y(), canvas);
			//canvas.Color = new Color(0, 0, 200, 100);
			//canvas.FillRect(cx + X + PostNotes.X, cy + Y + PostNotes.Y + 20, PostNotes.Width, 10);
			var $t1 = this.get_ties();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var t = $t1[$t2];
				t.set_renderer(this.get_renderer());
				t.paint(cx, cy + this.get_y(), canvas);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph, [$AlphaTab_Rendering_Glyphs_ISupportsFinalize]);
	ss.initClass($AlphaTab_Rendering_ScoreBeatContainerGlyph, $asm, {
		createTies: function(n) {
			// create a tie if any effect requires it
			if (n.get_isTieDestination() && ss.isValue(n.get_tieOrigin())) {
				var tie = new $AlphaTab_Rendering_Glyphs_ScoreTieGlyph(n.get_tieOrigin(), n, this);
				ss.add(this.get_ties(), tie);
			}
			else if (n.get_isHammerPullDestination()) {
				var tie1 = new $AlphaTab_Rendering_Glyphs_ScoreTieGlyph(n.get_hammerPullOrigin(), n, this);
				ss.add(this.get_ties(), tie1);
			}
			else if (n.get_slideType() === 2) {
				var tie2 = new $AlphaTab_Rendering_Glyphs_ScoreTieGlyph(n, n.get_slideTarget(), this);
				ss.add(this.get_ties(), tie2);
			}
			// TODO: depending on the type we have other positioning
			// we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
			if (n.get_slideType() !== 0) {
				var l = new $AlphaTab_Rendering_Glyphs_ScoreSlideLineGlyph(n.get_slideType(), n, this);
				ss.add(this.get_ties(), l);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_BeatContainerGlyph, [$AlphaTab_Rendering_Glyphs_ISupportsFinalize]);
	ss.initClass($AlphaTab_Rendering_ScoreRenderer, $asm, {
		get_canvas: function() {
			return this.$1$CanvasField;
		},
		set_canvas: function(value) {
			this.$1$CanvasField = value;
		},
		get_score: function() {
			return this.$1$ScoreField;
		},
		set_score: function(value) {
			this.$1$ScoreField = value;
		},
		get_tracks: function() {
			return this.$1$TracksField;
		},
		set_tracks: function(value) {
			this.$1$TracksField = value;
		},
		get_layout: function() {
			return this.$1$LayoutField;
		},
		set_layout: function(value) {
			this.$1$LayoutField = value;
		},
		get_renderingResources: function() {
			return this.$1$RenderingResourcesField;
		},
		set_renderingResources: function(value) {
			this.$1$RenderingResourcesField = value;
		},
		get_settings: function() {
			return this.$1$SettingsField;
		},
		set_settings: function(value) {
			this.$1$SettingsField = value;
		},
		$recreateLayout: function() {
			if (!ss.referenceEquals(this.$_currentLayoutMode, this.get_settings().get_layout().get_mode())) {
				if (ss.isNullOrUndefined(this.get_settings().get_layout()) || !$AlphaTab_Environment.layoutEngines.containsKey(this.get_settings().get_layout().get_mode())) {
					this.set_layout($AlphaTab_Environment.layoutEngines.get_item('default')(this));
				}
				else {
					this.set_layout($AlphaTab_Environment.layoutEngines.get_item(this.get_settings().get_layout().get_mode())(this));
				}
				this.$_currentLayoutMode = this.get_settings().get_layout().get_mode();
			}
		},
		render: function(track) {
			this.set_score(track.get_score());
			this.set_tracks([]);
			ss.add(this.get_tracks(), track);
			this.invalidate();
		},
		renderMultiple: function(tracks) {
			if (tracks.length === 0) {
				this.set_score(null);
			}
			else {
				this.set_score(tracks[0].get_score());
			}
			this.set_tracks(tracks);
			this.invalidate();
		},
		invalidate: function() {
			if (this.get_tracks().length === 0) {
				return;
			}
			if (this.get_renderingResources().get_scale() !== this.get_settings().get_scale()) {
				this.get_renderingResources().init(this.get_settings().get_scale());
				this.get_canvas().set_lineWidth(this.get_settings().get_scale());
			}
			this.$recreateLayout();
			this.get_canvas().clear();
			this.$doLayout();
			this.$paintScore();
			this.onRenderFinished();
		},
		$doLayout: function() {
			this.get_layout().doLayout();
			this.get_canvas().set_height(ss.Int32.trunc(this.get_layout().get_height() + this.get_renderingResources().get_copyrightFont().get_size() * 2));
			this.get_canvas().set_width(this.get_layout().get_width());
		},
		$paintScore: function() {
			this.paintBackground();
			this.get_layout().paintScore();
		},
		paintBackground: function() {
			// attention, you are not allowed to remove change this notice within any version of this library without permission!
			var msg = 'Rendered using alphaTab (http://www.alphaTab.net)';
			this.get_canvas().set_color(new $AlphaTab_Platform_Model_Color(62, 62, 62, 255));
			this.get_canvas().set_font(this.get_renderingResources().get_copyrightFont());
			this.get_canvas().set_textAlign(1);
			var x = ss.Int32.div(this.get_canvas().get_width(), 2);
			this.get_canvas().fillText(msg, x, this.get_canvas().get_height() - this.get_renderingResources().get_copyrightFont().get_size() * 2);
		},
		add_renderFinished: function(value) {
			this.$1$RenderFinishedField = ss.delegateCombine(this.$1$RenderFinishedField, value);
		},
		remove_renderFinished: function(value) {
			this.$1$RenderFinishedField = ss.delegateRemove(this.$1$RenderFinishedField, value);
		},
		onRenderFinished: function() {
			var handler = this.$1$RenderFinishedField;
			if (!ss.staticEquals(handler, null)) {
				handler();
			}
		},
		buildBoundingsLookup: function() {
			var lookup = new $AlphaTab_Rendering_Utils_BoundingsLookup();
			this.get_layout().buildBoundingsLookup(lookup);
			return lookup;
		}
	});
	ss.initClass($AlphaTab_Rendering_TabBarRenderer, $asm, {
		get_$lineOffset: function() {
			return 11 * this.get_scale();
		},
		getNoteX: function(note, onEnd) {
			var beat = this.getOnNotesPosition(note.get_beat().get_voice().get_index(), note.get_beat().get_index());
			if (ss.isValue(beat)) {
				return beat.get_container().get_x() + beat.get_x() + beat.get_noteNumbers().getNoteX(note, onEnd);
			}
			return this.get_postBeatGlyphsStart();
		},
		getBeatX: function(beat) {
			var bg = this.getPreNotesPosition(beat.get_voice().get_index(), beat.get_index());
			if (ss.isValue(bg)) {
				return bg.get_container().get_x() + bg.get_x();
			}
			return 0;
		},
		getNoteY: function(note) {
			var beat = this.getOnNotesPosition(note.get_beat().get_voice().get_index(), note.get_beat().get_index());
			if (ss.isValue(beat)) {
				return beat.get_noteNumbers().getNoteY(note);
			}
			return 0;
		},
		doLayout: function() {
			this.$_helpers = this.get_stave().get_staveGroup().get_helpers().get_helpers().get_item(this.get_bar().get_track().get_index()).get_item(this.get_bar().get_index());
			$AlphaTab_Rendering_GroupedBarRenderer.prototype.doLayout.call(this);
			this.set_height(ss.Int32.trunc(this.get_$lineOffset() * (this.get_bar().get_track().get_tuning().length - 1)) + this.get_numberOverflow() * 2);
			if (this.get_index() === 0) {
				this.get_stave().registerStaveTop(this.get_numberOverflow());
				this.get_stave().registerStaveBottom(this.get_height() - this.get_numberOverflow());
			}
		},
		createPreBeatGlyphs: function() {
			if (this.get_bar().get_masterBar().get_isRepeatStart()) {
				this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_RepeatOpenGlyph(0, 0, 1.5, 3));
			}
			// Clef
			if (this.get_isFirstOfLine()) {
				this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_TabClefGlyph(0, 0));
			}
			this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_BarNumberGlyph(0, this.getTabY(-1, -3), this.get_bar().get_index() + 1, !this.get_stave().get_isFirstInAccolade()));
			if (this.get_bar().get_isEmpty()) {
				this.addPreBeatGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(30 * this.get_scale()), false));
			}
		},
		createBeatGlyphs: function() {
			this.$createVoiceGlyphs(this.get_bar().get_voices()[0]);
		},
		$createVoiceGlyphs: function(v) {
			var $t1 = v.get_beats();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				var container = new $AlphaTab_Rendering_Glyphs_TabBeatContainerGlyph(b);
				container.set_preNotes(new $AlphaTab_Rendering_Glyphs_TabBeatPreNotesGlyph());
				container.set_onNotes(new $AlphaTab_Rendering_Glyphs_TabBeatGlyph());
				container.get_onNotes().set_beamingHelper(this.$_helpers.get_beamHelperLookup()[v.get_index()].get_item(b.get_index()));
				container.set_postNotes(new $AlphaTab_Rendering_Glyphs_TabBeatPostNotesGlyph());
				this.addBeatGlyph(container);
			}
		},
		createPostBeatGlyphs: function() {
			if (this.get_bar().get_masterBar().get_isRepeatEnd()) {
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_RepeatCloseGlyph(this.get_x(), 0));
				if (this.get_bar().get_masterBar().get_repeatCount() > 2) {
					var line = ((this.get_isLast() || this.get_isLastOfLine()) ? -1 : -4);
					this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_RepeatCountGlyph(0, this.getTabY(line, -3), this.get_bar().get_masterBar().get_repeatCount()));
				}
			}
			else if (this.get_bar().get_masterBar().get_isDoubleBar()) {
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_BarSeperatorGlyph(0, 0, false));
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(3 * this.get_scale()), false));
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_BarSeperatorGlyph(0, 0, false));
			}
			else if (ss.isNullOrUndefined(this.get_bar().get_nextBar()) || !this.get_bar().get_nextBar().get_masterBar().get_isRepeatStart()) {
				this.addPostBeatGlyph(new $AlphaTab_Rendering_Glyphs_BarSeperatorGlyph(0, 0, this.get_isLast()));
			}
		},
		get_topPadding: function() {
			return this.get_numberOverflow();
		},
		get_bottomPadding: function() {
			return this.get_numberOverflow();
		},
		getTabY: function(line, correction) {
			return ss.Int32.trunc(this.get_$lineOffset() * line + correction * this.get_scale());
		},
		get_numberOverflow: function() {
			var res = this.get_resources();
			return ss.Int32.trunc(res.get_tablatureFont().get_size() / 2 + res.get_tablatureFont().get_size() * 0.2);
		},
		paintBackground: function(cx, cy, canvas) {
			var res = this.get_resources();
			//
			// draw string lines
			//
			canvas.set_color(res.get_staveLineColor());
			var lineY = cy + this.get_y() + this.get_numberOverflow();
			for (var i = 0; i < this.get_bar().get_track().get_tuning().length; i++) {
				if (i > 0) {
					lineY += ss.Int32.trunc(this.get_$lineOffset());
				}
				canvas.beginPath();
				canvas.moveTo(cx + this.get_x(), lineY);
				canvas.lineTo(cx + this.get_x() + this.get_width(), lineY);
				canvas.stroke();
			}
			// Info guides for debugging
			//DrawInfoGuide(canvas, cx, cy, 0, new Color(255, 0, 0)); // top
			//DrawInfoGuide(canvas, cx, cy, stave.StaveTop, new Color(0, 255, 0)); // stavetop
			//DrawInfoGuide(canvas, cx, cy, stave.StaveBottom, new Color(0,255,0)); // stavebottom
			//DrawInfoGuide(canvas, cx, cy, Height, new Color(255, 0, 0)); // bottom
		}
	}, $AlphaTab_Rendering_GroupedBarRenderer);
	ss.initClass($AlphaTab_Rendering_TabBarRendererFactory, $asm, {
		create: function(bar) {
			return new $AlphaTab_Rendering_TabBarRenderer(bar);
		}
	}, $AlphaTab_Rendering_BarRendererFactory);
	ss.initClass($AlphaTab_Rendering_Effects_BeatVibratoEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return false;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_vibrato() !== 0;
		},
		get_sizingMode: function() {
			return 10;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(17 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_VibratoGlyph(0, ss.Int32.trunc(5 * renderer.get_scale()), 1.14999997615814);
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_ChordsEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return false;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_hasChord();
		},
		get_sizingMode: function() {
			return 3;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(20 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_TextGlyph(0, 0, beat.get_chord().get_name(), renderer.get_resources().get_effectFont());
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_CrescendoEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return false;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_crescendo() !== 0;
		},
		get_sizingMode: function() {
			return 8;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(17 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_CrescendoGlyph(0, 0, beat.get_crescendo());
		},
		canExpand: function(renderer, from, to) {
			return from.get_crescendo() === to.get_crescendo();
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_DummyEffectGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(20 * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_mainGlyphColor());
			canvas.strokeRect(cx + this.get_x(), cy + this.get_y(), this.get_width(), 20 * this.get_scale());
			canvas.set_font(res.get_tablatureFont());
			canvas.fillText(this.$_s, cx + this.get_x(), cy + this.get_y());
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Effects_DynamicsEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return false;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_voice().get_index() === 0 && (beat.get_index() === 0 && beat.get_voice().get_bar().get_index() === 0 || ss.isValue(beat.get_previousBeat()) && beat.get_dynamic() !== beat.get_previousBeat().get_dynamic());
		},
		get_sizingMode: function() {
			return 3;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(15 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_DynamicsGlyph(0, 0, beat.get_dynamic());
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_FadeInEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return false;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_fadeIn();
		},
		get_sizingMode: function() {
			return 3;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(20 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_FadeInGlyph(0, 0);
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_NoteEffectInfoBase, $asm, {
		get_hideOnMultiTrack: function() {
			return false;
		},
		shouldCreateGlyph: function(renderer, beat) {
			this.lastCreateInfo = [];
			var $t1 = beat.get_notes();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var n = $t1[$t2];
				if (this.shouldCreateGlyphForNote(renderer, n)) {
					ss.add(this.lastCreateInfo, n);
				}
			}
			return this.lastCreateInfo.length > 0;
		},
		shouldCreateGlyphForNote: null,
		get_sizingMode: null,
		getHeight: null,
		createNewGlyph: null,
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_FingeringEffectInfo, $asm, {
		shouldCreateGlyph: function(renderer, beat) {
			var result = $AlphaTab_Rendering_Effects_NoteEffectInfoBase.prototype.shouldCreateGlyph.call(this, renderer, beat);
			if (this.lastCreateInfo.length >= this.$_maxGlyphCount) {
				this.$_maxGlyphCount = this.lastCreateInfo.length;
			}
			return result;
		},
		shouldCreateGlyphForNote: function(renderer, note) {
			return note.get_leftHandFinger() !== -1 && note.get_leftHandFinger() !== -2 || note.get_rightHandFinger() !== -1 && note.get_rightHandFinger() !== -2;
		},
		getHeight: function(renderer) {
			return this.$_maxGlyphCount * ss.Int32.trunc(20 * renderer.get_scale());
		},
		get_sizingMode: function() {
			return 3;
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Effects_DummyEffectGlyph(0, 0, this.lastCreateInfo.length + 'fingering');
		}
	}, $AlphaTab_Rendering_Effects_NoteEffectInfoBase, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_LetRingEffectInfo, $asm, {
		shouldCreateGlyphForNote: function(renderer, note) {
			return note.get_isLetRing();
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(15 * renderer.get_scale());
		},
		get_sizingMode: function() {
			return 10;
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_LineRangedGlyph(0, 0, 'LetRing');
		}
	}, $AlphaTab_Rendering_Effects_NoteEffectInfoBase, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_MarkerEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return true;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_index() === 0 && beat.get_voice().get_bar().get_masterBar().get_isSectionStart();
		},
		get_sizingMode: function() {
			return 0;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(20 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_TextGlyph(0, 0, beat.get_voice().get_bar().get_masterBar().get_section().get_text(), renderer.get_resources().get_markerFont());
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_NoteVibratoEffectInfo, $asm, {
		shouldCreateGlyphForNote: function(renderer, note) {
			return note.get_vibrato() !== 0 || note.get_isTieDestination() && note.get_tieOrigin().get_vibrato() !== 0;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(15 * renderer.get_scale());
		},
		get_sizingMode: function() {
			return 10;
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_VibratoGlyph(0, ss.Int32.trunc(5 * renderer.get_scale()), 0.899999976158142);
		}
	}, $AlphaTab_Rendering_Effects_NoteEffectInfoBase, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_PalmMuteEffectInfo, $asm, {
		shouldCreateGlyphForNote: function(renderer, note) {
			return note.get_isPalmMute();
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(20 * renderer.get_scale());
		},
		get_sizingMode: function() {
			return 10;
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_LineRangedGlyph(0, 0, 'PalmMute');
		}
	}, $AlphaTab_Rendering_Effects_NoteEffectInfoBase, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_PickStrokeEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return false;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_pickStroke() !== 0;
		},
		get_sizingMode: function() {
			return 3;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(20 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_PickStrokeGlyph(0, 0, beat.get_pickStroke());
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_TapEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return false;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_slap() || beat.get_pop() || beat.get_tap();
		},
		get_sizingMode: function() {
			return 3;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(20 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			var res = renderer.get_resources();
			if (beat.get_slap()) {
				return new $AlphaTab_Rendering_Glyphs_TextGlyph(0, 0, 'S', res.get_effectFont());
			}
			if (beat.get_pop()) {
				return new $AlphaTab_Rendering_Glyphs_TextGlyph(0, 0, 'P', res.get_effectFont());
			}
			return new $AlphaTab_Rendering_Glyphs_TextGlyph(0, 0, 'T', res.get_effectFont());
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_TempoEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return true;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_index() === 0 && (ss.isValue(beat.get_voice().get_bar().get_masterBar().get_tempoAutomation()) || beat.get_voice().get_bar().get_index() === 0);
		},
		get_sizingMode: function() {
			return 0;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(25 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			var tempo;
			if (ss.isValue(beat.get_voice().get_bar().get_masterBar().get_tempoAutomation())) {
				tempo = ss.Int32.trunc(beat.get_voice().get_bar().get_masterBar().get_tempoAutomation().get_value());
			}
			else {
				tempo = beat.get_voice().get_bar().get_track().get_score().get_tempo();
			}
			return new $AlphaTab_Rendering_Glyphs_TempoGlyph(0, 0, tempo);
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_TextEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return false;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return !$AlphaTab_Platform_Std.isNullOrWhiteSpace(beat.get_text());
		},
		get_sizingMode: function() {
			return 3;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(20 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_TextGlyph(0, 0, beat.get_text(), renderer.get_resources().get_effectFont());
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_TrillEffectInfo, $asm, {
		shouldCreateGlyphForNote: function(renderer, note) {
			return note.get_isTrill();
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(20 * renderer.get_scale());
		},
		get_sizingMode: function() {
			return 4;
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Glyphs_TrillGlyph(0, 0, 0.899999976158142);
		}
	}, $AlphaTab_Rendering_Effects_NoteEffectInfoBase, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Effects_TripletFeelEffectInfo, $asm, {
		get_hideOnMultiTrack: function() {
			return true;
		},
		shouldCreateGlyph: function(renderer, beat) {
			return beat.get_index() === 0 && (beat.get_voice().get_bar().get_masterBar().get_index() === 0 && beat.get_voice().get_bar().get_masterBar().get_tripletFeel() !== 0) || beat.get_voice().get_bar().get_masterBar().get_index() > 0 && beat.get_voice().get_bar().get_masterBar().get_tripletFeel() !== beat.get_voice().get_bar().get_masterBar().get_previousMasterBar().get_tripletFeel();
		},
		get_sizingMode: function() {
			return 3;
		},
		getHeight: function(renderer) {
			return ss.Int32.trunc(20 * renderer.get_scale());
		},
		createNewGlyph: function(renderer, beat) {
			return new $AlphaTab_Rendering_Effects_DummyEffectGlyph(0, 0, 'TripletFeel');
		},
		canExpand: function(renderer, from, to) {
			return true;
		}
	}, null, [$AlphaTab_Rendering_IEffectBarRendererInfo]);
	ss.initClass($AlphaTab_Rendering_Glyphs_SvgGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			if (ss.isNullOrUndefined(this.$_svg)) {
				return;
			}
			this.$_xScale = this.$_xGlyphScale * this.get_scale();
			this.$_yScale = this.$_yGlyphScale * this.get_scale();
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_mainGlyphColor());
			var startX = this.get_x() + cx;
			var startY = this.get_y() + cy;
			this.$_currentX = startX;
			this.$_currentY = startY;
			canvas.set_color(new $AlphaTab_Platform_Model_Color(0, 0, 0, 255));
			// todo: Resources
			canvas.beginPath();
			var $t1 = this.$_svg.get_commands();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var c = $t1[$t2];
				this.$parseCommand(startX, startY, canvas, c);
			}
			canvas.fill();
		},
		$parseCommand: function(cx, cy, canvas, cmd) {
			var canContinue;
			// reusable flag for shorthand curves
			var i;
			switch (cmd.get_cmd()) {
				case 'M': {
					// absolute moveto
					this.$_currentX = cx + cmd.get_numbers()[0] * this.$_xScale;
					this.$_currentY = cy + cmd.get_numbers()[1] * this.$_yScale;
					canvas.moveTo(this.$_currentX, this.$_currentY);
					break;
				}
				case 'm': {
					// relative moveto
					this.$_currentX += cmd.get_numbers()[0] * this.$_xScale;
					this.$_currentY += cmd.get_numbers()[1] * this.$_yScale;
					canvas.moveTo(this.$_currentX, this.$_currentY);
					break;
				}
				case 'Z':
				case 'z': {
					canvas.closePath();
					break;
				}
				case 'L': {
					// absolute lineTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						this.$_currentX = cx + cmd.get_numbers()[i++] * this.$_xScale;
						this.$_currentY = cy + cmd.get_numbers()[i++] * this.$_yScale;
						canvas.lineTo(this.$_currentX, this.$_currentY);
					}
					break;
				}
				case 'l': {
					// relative lineTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						this.$_currentX += cmd.get_numbers()[i++] * this.$_xScale;
						this.$_currentY += cmd.get_numbers()[i++] * this.$_yScale;
						canvas.lineTo(this.$_currentX, this.$_currentY);
					}
					break;
				}
				case 'V': {
					// absolute verticalTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						this.$_currentY = cy + cmd.get_numbers()[i++] * this.$_yScale;
						canvas.lineTo(this.$_currentX, this.$_currentY);
					}
					break;
				}
				case 'v': {
					// relative verticalTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						this.$_currentY += cmd.get_numbers()[i++] * this.$_yScale;
						canvas.lineTo(this.$_currentX, this.$_currentY);
					}
					break;
				}
				case 'H': {
					// absolute horizontalTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						this.$_currentX = cx + cmd.get_numbers()[i++] * this.$_xScale;
						canvas.lineTo(this.$_currentX, this.$_currentY);
					}
					break;
				}
				case 'h': {
					// relative horizontalTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						this.$_currentX += cmd.get_numbers()[i++] * this.$_xScale;
						canvas.lineTo(this.$_currentX, this.$_currentY);
					}
					break;
				}
				case 'C': {
					// absolute cubicTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						var x1 = cx + cmd.get_numbers()[i++] * this.$_xScale;
						var y1 = cy + cmd.get_numbers()[i++] * this.$_yScale;
						var x2 = cx + cmd.get_numbers()[i++] * this.$_xScale;
						var y2 = cy + cmd.get_numbers()[i++] * this.$_yScale;
						var x3 = cx + cmd.get_numbers()[i++] * this.$_xScale;
						var y3 = cy + cmd.get_numbers()[i++] * this.$_yScale;
						this.$_lastControlX = x2;
						this.$_lastControlY = y2;
						this.$_currentX = x3;
						this.$_currentY = y3;
						canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
					}
					break;
				}
				case 'c': {
					// relative cubicTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						var x11 = this.$_currentX + cmd.get_numbers()[i++] * this.$_xScale;
						var y11 = this.$_currentY + cmd.get_numbers()[i++] * this.$_yScale;
						var x21 = this.$_currentX + cmd.get_numbers()[i++] * this.$_xScale;
						var y21 = this.$_currentY + cmd.get_numbers()[i++] * this.$_yScale;
						var x31 = this.$_currentX + cmd.get_numbers()[i++] * this.$_xScale;
						var y31 = this.$_currentY + cmd.get_numbers()[i++] * this.$_yScale;
						this.$_lastControlX = x21;
						this.$_lastControlY = y21;
						this.$_currentX = x31;
						this.$_currentY = y31;
						canvas.bezierCurveTo(x11, y11, x21, y21, x31, y31);
					}
					break;
				}
				case 'S': {
					// absolute shorthand cubicTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						var x12 = cx + cmd.get_numbers()[i++] * this.$_xScale;
						var y12 = cy + cmd.get_numbers()[i++] * this.$_yScale;
						canContinue = this.$_lastCmd === 'c' || this.$_lastCmd === 'C' || this.$_lastCmd === 'S' || this.$_lastCmd === 's';
						var x22 = (canContinue ? (this.$_currentX + (this.$_currentX - this.$_lastControlX)) : this.$_currentX);
						var y22 = (canContinue ? (this.$_currentY + (this.$_currentY - this.$_lastControlY)) : this.$_currentY);
						var x32 = cx + cmd.get_numbers()[i++] * this.$_xScale;
						var y32 = cy + cmd.get_numbers()[i++] * this.$_yScale;
						this.$_lastControlX = x22;
						this.$_lastControlY = y22;
						this.$_currentX = x32;
						this.$_currentY = y32;
						canvas.bezierCurveTo(x12, y12, x22, y22, x32, y32);
					}
					break;
				}
				case 's': {
					// relative shorthand cubicTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						var x13 = this.$_currentX + cmd.get_numbers()[i++] * this.$_xScale;
						var y13 = this.$_currentY + cmd.get_numbers()[i++] * this.$_yScale;
						canContinue = this.$_lastCmd === 'c' || this.$_lastCmd === 'C' || this.$_lastCmd === 'S' || this.$_lastCmd === 's';
						var x23 = (canContinue ? (this.$_currentX + (this.$_currentX - this.$_lastControlX)) : this.$_currentX);
						var y23 = (canContinue ? (this.$_currentY + (this.$_currentY - this.$_lastControlY)) : this.$_currentY);
						var x33 = this.$_currentX + cmd.get_numbers()[i++] * this.$_xScale;
						var y33 = this.$_currentY + cmd.get_numbers()[i++] * this.$_yScale;
						this.$_lastControlX = x23;
						this.$_lastControlY = y23;
						this.$_currentX = x33;
						this.$_currentY = y33;
						canvas.bezierCurveTo(x13, y13, x23, y23, x33, y33);
					}
					break;
				}
				case 'Q': {
					// absolute quadraticTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						var x14 = cx + cmd.get_numbers()[i++] * this.$_xScale;
						var y14 = cy + cmd.get_numbers()[i++] * this.$_yScale;
						var x24 = cx + cmd.get_numbers()[i++] * this.$_xScale;
						var y24 = cy + cmd.get_numbers()[i++] * this.$_yScale;
						this.$_lastControlX = x14;
						this.$_lastControlY = y14;
						this.$_currentX = x24;
						this.$_currentY = y24;
						canvas.quadraticCurveTo(x14, y14, x24, y24);
					}
					break;
				}
				case 'q': {
					// relative quadraticTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						var x15 = this.$_currentX + cmd.get_numbers()[i++] * this.$_xScale;
						var y15 = this.$_currentY + cmd.get_numbers()[i++] * this.$_yScale;
						var x25 = this.$_currentX + cmd.get_numbers()[i++] * this.$_xScale;
						var y25 = this.$_currentY + cmd.get_numbers()[i++] * this.$_yScale;
						this.$_lastControlX = x15;
						this.$_lastControlY = y15;
						this.$_currentX = x25;
						this.$_currentY = y25;
						canvas.quadraticCurveTo(x15, y15, x25, y25);
					}
					break;
				}
				case 'T': {
					// absolute shorthand quadraticTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						var x16 = cx + cmd.get_numbers()[i++] * this.$_xScale;
						var y16 = cy + cmd.get_numbers()[i++] * this.$_yScale;
						canContinue = this.$_lastCmd === 'q' || this.$_lastCmd === 'Q' || this.$_lastCmd === 't' || this.$_lastCmd === 'T';
						var cpx = (canContinue ? (this.$_currentX + (this.$_currentX - this.$_lastControlX)) : this.$_currentX);
						var cpy = (canContinue ? (this.$_currentY + (this.$_currentY - this.$_lastControlY)) : this.$_currentY);
						this.$_currentX = x16;
						this.$_currentY = y16;
						this.$_lastControlX = cpx;
						this.$_lastControlY = cpy;
						canvas.quadraticCurveTo(cpx, cpy, x16, y16);
					}
					break;
				}
				case 't': {
					// relative shorthand quadraticTo
					i = 0;
					while (i < cmd.get_numbers().length) {
						// TODO: buggy/incomplete
						var x17 = this.$_currentX + cmd.get_numbers()[i++] * this.$_xScale;
						var y17 = this.$_currentY + cmd.get_numbers()[i++] * this.$_yScale;
						canContinue = this.$_lastCmd === 'q' || this.$_lastCmd === 'Q' || this.$_lastCmd === 't' || this.$_lastCmd === 'T';
						var cpx1 = (canContinue ? (this.$_currentX + (this.$_currentX - this.$_lastControlX)) : this.$_currentX);
						var cpy1 = (canContinue ? (this.$_currentY + (this.$_currentY - this.$_lastControlY)) : this.$_currentY);
						this.$_lastControlX = cpx1;
						this.$_lastControlY = cpy1;
						canvas.quadraticCurveTo(cpx1, cpy1, x17, y17);
					}
					break;
				}
			}
			this.$_lastCmd = cmd.get_cmd();
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_AccentuationGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(9 * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_GlyphGroup, $asm, {
		doLayout: function() {
			var w = 0;
			for (var $t1 = 0; $t1 < this.glyphs.length; $t1++) {
				var g = this.glyphs[$t1];
				g.set_renderer(this.get_renderer());
				g.doLayout();
				w = Math.max(w, g.get_width());
			}
			this.set_width(w);
		},
		addGlyph: function(g) {
			ss.add(this.glyphs, g);
		},
		paint: function(cx, cy, canvas) {
			for (var $t1 = 0; $t1 < this.glyphs.length; $t1++) {
				var g = this.glyphs[$t1];
				g.set_renderer(this.get_renderer());
				g.paint(cx + this.get_x(), cy + this.get_y(), canvas);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_AccidentalGroupGlyph, $asm, {
		doLayout: function() {
			//
			// Determine Columns for accidentals
			//
			this.glyphs.sort(function(a, b) {
				return ss.compare(a.get_y(), b.get_y());
			});
			// defines the reserved y position of the columns
			var columns = [];
			ss.add(columns, $AlphaTab_Rendering_Glyphs_AccidentalGroupGlyph.$nonReserved);
			var accidentalSize = ss.Int32.trunc(21 * this.get_scale());
			for (var $t1 = 0; $t1 < this.glyphs.length; $t1++) {
				var g = this.glyphs[$t1];
				g.set_renderer(this.get_renderer());
				g.doLayout();
				// find column where glyph fits into
				// as long the glyph does not fit into the current column
				var gColumn = 0;
				while (columns[gColumn] > g.get_y()) {
					// move to next column
					gColumn++;
					// and create the new column if needed
					if (gColumn === columns.length) {
						ss.add(columns, $AlphaTab_Rendering_Glyphs_AccidentalGroupGlyph.$nonReserved);
					}
				}
				// temporary save column as X
				g.set_x(gColumn);
				columns[gColumn] = g.get_y() + accidentalSize;
			}
			//
			// Place accidentals in columns
			//
			var columnWidth = ss.Int32.trunc(8 * this.get_scale());
			if (this.glyphs.length === 0) {
				this.set_width(0);
			}
			else {
				this.set_width(columnWidth * columns.length);
			}
			for (var $t2 = 0; $t2 < this.glyphs.length; $t2++) {
				var g1 = this.glyphs[$t2];
				g1.set_x(this.get_width() - (g1.get_x() + 1) * columnWidth);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_GlyphGroup);
	ss.initClass($AlphaTab_Rendering_Glyphs_BarNumberGlyph, $asm, {
		doLayout: function() {
			var scoreRenderer = this.get_renderer().get_layout().get_renderer();
			scoreRenderer.get_canvas().set_font(scoreRenderer.get_renderingResources().get_barNumberFont());
			this.set_width(ss.Int32.trunc(10 * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			if (this.$_hidden) {
				return;
			}
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_barNumberColor());
			canvas.set_font(res.get_barNumberFont());
			canvas.fillText(this.$_number.toString(), cx + this.get_x(), cy + this.get_y());
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_BarSeperatorGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc((this.$_isLast ? 8 : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_barSeperatorColor());
			var blockWidth = 4 * this.get_scale();
			var top = cy + this.get_y() + this.get_renderer().get_topPadding();
			var bottom = cy + this.get_y() + this.get_renderer().get_height() - this.get_renderer().get_bottomPadding();
			var left = cx + this.get_x();
			var h = bottom - top;
			// line
			canvas.beginPath();
			canvas.moveTo(left, top);
			canvas.lineTo(left, bottom);
			canvas.stroke();
			if (this.$_isLast) {
				// big bar
				left += 3 * this.get_scale() + 0.5;
				canvas.fillRect(left, top, blockWidth, h);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_BeamGlyph, $asm, {
		doLayout: function() {
			this.set_width(0);
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_BeatGlyphBase, $asm, {
		get_container: function() {
			return this.$3$ContainerField;
		},
		set_container: function(value) {
			this.$3$ContainerField = value;
		},
		doLayout: function() {
			// left to right layout
			var w = 0;
			for (var $t1 = 0; $t1 < this.glyphs.length; $t1++) {
				var g = this.glyphs[$t1];
				g.set_x(w);
				g.set_renderer(this.get_renderer());
				g.doLayout();
				w += g.get_width();
			}
			this.set_width(w);
		},
		noteLoop: function(action) {
			for (var i = this.get_container().get_beat().get_notes().length - 1; i >= 0; i--) {
				action(this.get_container().get_beat().get_notes()[i]);
			}
		},
		get_beatDurationWidth: function() {
			switch (this.get_container().get_beat().get_duration()) {
				case 1: {
					return 103;
				}
				case 2: {
					return 45;
				}
				case 4: {
					return 29;
				}
				case 8: {
					return 19;
				}
				case 16: {
					return 11;
				}
				case 32: {
					return 11;
				}
				case 64: {
					return 11;
				}
				default: {
					throw new ss.ArgumentOutOfRangeException();
				}
			}
		}
	}, $AlphaTab_Rendering_Glyphs_GlyphGroup);
	ss.initClass($AlphaTab_Rendering_Glyphs_BendGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			var r = this.get_renderer();
			var res = this.get_renderer().get_resources();
			// calculate offsets per step
			var dX = ss.Int32.div(this.get_width(), $AlphaTab_Model_BendPoint.maxPosition);
			var maxValue = 0;
			for (var i = 0; i < this.$_note.get_bendPoints().length; i++) {
				if (this.$_note.get_bendPoints()[i].get_value() > maxValue) {
					maxValue = this.$_note.get_bendPoints()[i].get_value();
				}
			}
			var dY = ss.Int32.div(this.$_height, maxValue);
			var xx = cx + this.get_x();
			var yy = cy + this.get_y() + r.getNoteY(this.$_note);
			canvas.beginPath();
			for (var i1 = 0; i1 < this.$_note.get_bendPoints().length - 1; i1++) {
				var firstPt = this.$_note.get_bendPoints()[i1];
				var secondPt = this.$_note.get_bendPoints()[i1 + 1];
				// don't draw a line if there's no offset and it's the last point
				if (firstPt.get_value() === secondPt.get_value() && i1 === this.$_note.get_bendPoints().length - 2) {
					continue;
				}
				var x1 = xx + dX * firstPt.get_offset();
				var y1 = yy - dY * firstPt.get_value();
				var x2 = xx + dX * secondPt.get_offset();
				var y2 = yy - dY * secondPt.get_value();
				if (firstPt.get_value() === secondPt.get_value()) {
					// draw horizontal line
					canvas.moveTo(x1, y1);
					canvas.lineTo(x2, y2);
					canvas.stroke();
				}
				else {
					// draw bezier lien from first to second point
					var hx = x1 + (x2 - x1);
					var hy = yy - dY * firstPt.get_value();
					canvas.moveTo(x1, y1);
					canvas.bezierCurveTo(hx, hy, x2, y2, x2, y2);
					canvas.stroke();
				}
				// what type of arrow? (up/down)
				var arrowSize = 6 * this.get_scale();
				if (secondPt.get_value() > firstPt.get_value()) {
					canvas.beginPath();
					canvas.moveTo(x2, y2);
					canvas.lineTo(x2 - arrowSize * 0.5, y2 + arrowSize);
					canvas.lineTo(x2 + arrowSize * 0.5, y2 + arrowSize);
					canvas.closePath();
					canvas.fill();
				}
				else if (secondPt.get_value() !== firstPt.get_value()) {
					canvas.beginPath();
					canvas.moveTo(x2, y2);
					canvas.lineTo(x2 - arrowSize * 0.5, y2 - arrowSize);
					canvas.lineTo(x2 + arrowSize * 0.5, y2 - arrowSize);
					canvas.closePath();
					canvas.fill();
				}
				canvas.stroke();
				if (secondPt.get_value() !== 0) {
					var dV = secondPt.get_value() - firstPt.get_value();
					var up = dV > 0;
					dV = Math.abs(dV);
					// calculate label
					var s = '';
					// Full Steps
					if (dV === 4) {
						s = 'full';
						dV -= 4;
					}
					else if (dV > 4) {
						s += ss.Int32.div(dV, 4) + ' ';
						// Quaters
						dV -= ss.Int32.div(dV, 4);
					}
					if (dV > 0) {
						s += dV + '/4';
					}
					if (s !== '') {
						if (!up) {
							s = '-' + s;
						}
						// draw label
						canvas.set_font(res.get_tablatureFont());
						var size = canvas.measureText(s);
						var y = (up ? (y2 - res.get_tablatureFont().get_size() - 2 * this.get_scale()) : (y2 + 2 * this.get_scale()));
						var x = x2 - size / 2;
						canvas.fillText(s, x, y);
					}
				}
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_ChineseCymbalGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(9 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_CircleGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(this.$_size + 3 * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			canvas.beginPath();
			canvas.circle(cx + this.get_x(), cy + this.get_y(), this.$_size);
			canvas.fill();
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_ClefGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(28 * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_CrescendoGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			var height = 17 * this.get_scale();
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_mainGlyphColor());
			canvas.beginPath();
			if (this.$_crescendo === 1) {
				canvas.moveTo(cx + this.get_x() + this.get_width(), cy + this.get_y());
				canvas.lineTo(cx + this.get_x(), cy + this.get_y() + height / 2);
				canvas.lineTo(cx + this.get_x() + this.get_width(), cy + this.get_y() + height);
			}
			else {
				canvas.moveTo(cx + this.get_x(), cy + this.get_y());
				canvas.lineTo(cx + this.get_x() + this.get_width(), cy + this.get_y() + height / 2);
				canvas.lineTo(cx + this.get_x(), cy + this.get_y() + height);
			}
			canvas.stroke();
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_DeadNoteHeadGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(9 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_DiamondNoteHeadGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(9 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_DigitGlyph, $asm, {
		doLayout: function() {
			this.set_y(this.get_y() + ss.Int32.trunc(7 * this.get_scale()));
			this.set_width(ss.Int32.trunc(this.$getDigitWidth(this.$_digit) * this.get_scale()));
		},
		$getDigitWidth: function(digit) {
			switch (digit) {
				case 0:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9: {
					return 14;
				}
				case 1: {
					return 10;
				}
				default: {
					return 0;
				}
			}
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_DrumSticksGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(9 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_DynamicsGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_mainGlyphColor());
			var glyphs;
			switch (this.$_dynamics) {
				case 0: {
					glyphs = [this.get_$p(), this.get_$p(), this.get_$p()];
					break;
				}
				case 1: {
					glyphs = [this.get_$p(), this.get_$p()];
					break;
				}
				case 2: {
					glyphs = [this.get_$p()];
					break;
				}
				case 3: {
					glyphs = [this.get_$m(), this.get_$p()];
					break;
				}
				case 4: {
					glyphs = [this.get_$m(), this.get_$f()];
					break;
				}
				case 5: {
					glyphs = [this.get_$f()];
					break;
				}
				case 6: {
					glyphs = [this.get_$f(), this.get_$f()];
					break;
				}
				case 7: {
					glyphs = [this.get_$f(), this.get_$f(), this.get_$f()];
					break;
				}
				default: {
					return;
				}
			}
			var glyphWidth = 0;
			for (var $t1 = 0; $t1 < glyphs.length; $t1++) {
				var g = glyphs[$t1];
				glyphWidth += g.get_width();
			}
			var startX = ss.Int32.div(this.get_width() - glyphWidth, 2);
			for (var $t2 = 0; $t2 < glyphs.length; $t2++) {
				var g1 = glyphs[$t2];
				g1.set_x(startX);
				g1.set_y(0);
				g1.set_renderer(this.get_renderer());
				g1.paint(cx + this.get_x(), cy + this.get_y(), canvas);
				startX += g1.get_width();
			}
		},
		get_$p: function() {
			var p = new $AlphaTab_Rendering_Glyphs_SvgGlyph(0, 0, $AlphaTab_Rendering_Glyphs_MusicFont.dynamicP, $AlphaTab_Rendering_Glyphs_DynamicsGlyph.$glyphScale, $AlphaTab_Rendering_Glyphs_DynamicsGlyph.$glyphScale);
			p.set_width(ss.Int32.trunc(7 * this.get_scale()));
			return p;
		},
		get_$m: function() {
			var m = new $AlphaTab_Rendering_Glyphs_SvgGlyph(0, 0, $AlphaTab_Rendering_Glyphs_MusicFont.dynamicM, $AlphaTab_Rendering_Glyphs_DynamicsGlyph.$glyphScale, $AlphaTab_Rendering_Glyphs_DynamicsGlyph.$glyphScale);
			m.set_width(ss.Int32.trunc(7 * this.get_scale()));
			return m;
		},
		get_$f: function() {
			var f = new $AlphaTab_Rendering_Glyphs_SvgGlyph(0, 0, $AlphaTab_Rendering_Glyphs_MusicFont.dynamicF, $AlphaTab_Rendering_Glyphs_DynamicsGlyph.$glyphScale, $AlphaTab_Rendering_Glyphs_DynamicsGlyph.$glyphScale);
			f.set_width(ss.Int32.trunc(7 * this.get_scale()));
			return f;
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_FadeInGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			var size = ss.Int32.trunc(6 * this.get_scale());
			canvas.beginPath();
			canvas.moveTo(cx + this.get_x(), cy + this.get_y());
			canvas.quadraticCurveTo(cx + this.get_x() + ss.Int32.div(this.get_width(), 2), cy + this.get_y(), cx + this.get_x() + this.get_width(), cy + this.get_y() - size);
			canvas.moveTo(cx + this.get_x(), cy + this.get_y());
			canvas.quadraticCurveTo(cx + this.get_x() + ss.Int32.div(this.get_width(), 2), cy + this.get_y(), cx + this.get_x() + this.get_width(), cy + this.get_y() + size);
			canvas.stroke();
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_FlatGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(8 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_HiHatGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(9 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initInterface($AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph, $asm, { expandTo: null });
	ss.initClass($AlphaTab_Rendering_Glyphs_LazySvg, $asm, {
		get_commands: function() {
			if (ss.isNullOrUndefined(this.$_parsed)) {
				this.$parse();
			}
			return this.$_parsed;
		},
		$parse: function() {
			var parser = new $AlphaTab_Rendering_Utils_SvgPathParser(this.$_raw);
			parser.reset();
			this.$_parsed = [];
			while (!parser.get_eof()) {
				var command = new $AlphaTab_Rendering_Glyphs_SvgCommand();
				ss.add(this.$_parsed, command);
				command.set_cmd(parser.getString());
				switch (command.get_cmd()) {
					case 'M': {
						// absolute moveto
						command.set_numbers([]);
						ss.add(command.get_numbers(), parser.getNumber());
						ss.add(command.get_numbers(), parser.getNumber());
						break;
					}
					case 'm': {
						// relative moveto
						command.set_numbers([]);
						ss.add(command.get_numbers(), parser.getNumber());
						ss.add(command.get_numbers(), parser.getNumber());
						break;
					}
					case 'Z':
					case 'z': {
						break;
					}
					case 'L': {
						// absolute lineTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'l': {
						// relative lineTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'V': {
						// absolute verticalTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'v': {
						// relative verticalTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'H': {
						// absolute horizontalTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'h': {
						// relative horizontalTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'C': {
						// absolute cubicTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'c': {
						// relative cubicTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'S': {
						// absolute shorthand cubicTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 's': {
						// relative shorthand cubicTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'Q': {
						// absolute quadraticTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'q': {
						// relative quadraticTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 'T': {
						// absolute shorthand quadraticTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
					case 't': {
						// relative shorthand quadraticTo
						command.set_numbers([]);
						do {
							ss.add(command.get_numbers(), parser.getNumber());
							ss.add(command.get_numbers(), parser.getNumber());
						} while (parser.get_currentTokenIsNumber());
						break;
					}
				}
			}
			this.$_raw = null;
			// not needed anymore.
		}
	});
	ss.initClass($AlphaTab_Rendering_Glyphs_LineRangedGlyph, $asm, {
		expandTo: function(beat) {
			this.$_isExpanded = true;
		},
		paint: function(cx, cy, canvas) {
			var step = 11 * this.get_scale();
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_mainGlyphColor());
			canvas.set_font(res.get_effectFont());
			canvas.set_textAlign(0);
			var textWidth = canvas.measureText(this.$_label);
			canvas.fillText(this.$_label, cx + this.get_x(), cy + this.get_y());
			// check if we need lines
			if (this.$_isExpanded) {
				var lineSpacing = 3 * this.get_scale();
				var startX = cx + this.get_x() + textWidth + lineSpacing;
				var endX = cx + this.get_x() + this.get_width() - lineSpacing - lineSpacing;
				var lineY = cy + this.get_y() + 8 * this.get_scale();
				var lineSize = 8 * this.get_scale();
				if (endX > startX) {
					var lineX = startX;
					while (lineX < endX) {
						canvas.beginPath();
						canvas.moveTo(lineX, lineY);
						canvas.lineTo(Math.min(lineX + lineSize, endX), lineY);
						lineX += lineSize + lineSpacing;
						canvas.stroke();
					}
					canvas.beginPath();
					canvas.moveTo(endX, lineY - 6 * this.get_scale());
					canvas.lineTo(endX, lineY + 6 * this.get_scale());
					canvas.stroke();
				}
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph, [$AlphaTab_Rendering_Glyphs_IMultiBeatEffectGlyph]);
	ss.initClass($AlphaTab_Rendering_Glyphs_MusicFont, $asm, {});
	ss.initClass($AlphaTab_Rendering_Glyphs_NaturalizeGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(8 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_NoteHeadGlyph, $asm, {
		doLayout: function() {
			switch (this.$_duration) {
				case 1: {
					this.set_width(ss.Int32.trunc(14 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
					break;
				}
				default: {
					this.set_width(ss.Int32.trunc(9 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
					break;
				}
			}
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_NoteNumberGlyph, $asm, {
		doLayout: function() {
			var scoreRenderer = this.get_renderer().get_layout().get_renderer();
			scoreRenderer.get_canvas().set_font((this.$_isGrace ? scoreRenderer.get_renderingResources().get_graceFont() : scoreRenderer.get_renderingResources().get_tablatureFont()));
			this.set_width(ss.Int32.trunc(10 * this.get_scale()));
		},
		calculateWidth: function() {
			this.set_width(ss.Int32.trunc(this.get_renderer().get_layout().get_renderer().get_canvas().measureText(this.$_noteString)));
		},
		paint: function(cx, cy, canvas) {
			if (ss.isValue(this.$_noteString)) {
				canvas.fillText(this.$_noteString.toLowerCase(), cx + this.get_x() + 0 * this.get_scale(), cy + this.get_y());
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_NumberGlyph, $asm, {
		get_canScale: function() {
			return false;
		},
		doLayout: function() {
			var i = this.$_number;
			while (i > 0) {
				var num = i % 10;
				var gl = new $AlphaTab_Rendering_Glyphs_DigitGlyph(0, 0, num);
				ss.add(this.glyphs, gl);
				i = ss.Int32.div(i, 10);
			}
			this.glyphs.reverse();
			var cx = 0;
			for (var $t1 = 0; $t1 < this.glyphs.length; $t1++) {
				var g = this.glyphs[$t1];
				g.set_x(cx);
				g.set_y(0);
				g.set_renderer(this.get_renderer());
				g.doLayout();
				cx += g.get_width();
			}
			this.set_width(cx);
		}
	}, $AlphaTab_Rendering_Glyphs_GlyphGroup);
	ss.initClass($AlphaTab_Rendering_Glyphs_PickStrokeGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(9 * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_RepeatCloseGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc((this.get_renderer().get_isLast() ? 11 : 13) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_mainGlyphColor());
			var blockWidth = 4 * this.get_scale();
			var top = cy + this.get_y() + this.get_renderer().get_topPadding();
			var bottom = cy + this.get_y() + this.get_renderer().get_height() - this.get_renderer().get_bottomPadding();
			var left = cx + this.get_x();
			var h = bottom - top;
			//circles 
			var circleSize = 1.5 * this.get_scale();
			var middle = ss.Int32.div(top + bottom, 2);
			var dotOffset = 3;
			canvas.beginPath();
			canvas.circle(left, middle - circleSize * 3, circleSize);
			canvas.circle(left, middle + circleSize * 3, circleSize);
			canvas.fill();
			// line
			left += 4 * this.get_scale();
			canvas.beginPath();
			canvas.moveTo(left, top);
			canvas.lineTo(left, bottom);
			canvas.stroke();
			// big bar
			left += 3 * this.get_scale() + 0.5;
			canvas.fillRect(left, top, blockWidth, h);
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_RepeatCountGlyph, $asm, {
		doLayout: function() {
			this.set_width(0);
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_mainGlyphColor());
			canvas.set_font(res.get_barNumberFont());
			var s = 'x' + this.$_count;
			var w = ss.Int32.trunc(canvas.measureText(s) / 1.5);
			canvas.fillText(s, cx + this.get_x() - w, cy + this.get_y());
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_RepeatOpenGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(13 * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			canvas.set_color(res.get_mainGlyphColor());
			var blockWidth = 4 * this.get_scale();
			var top = cy + this.get_y() + this.get_renderer().get_topPadding();
			var bottom = cy + this.get_y() + this.get_renderer().get_height() - this.get_renderer().get_bottomPadding();
			var left = cx + this.get_x() + 0.5;
			// big bar
			var h = bottom - top;
			canvas.fillRect(left, top, blockWidth, h);
			// line
			left += blockWidth * 2 - 0.5;
			canvas.beginPath();
			canvas.moveTo(left, top);
			canvas.lineTo(left, bottom);
			canvas.stroke();
			//circles 
			left += 3 * this.get_scale();
			var circleSize = this.$_circleSize * this.get_scale();
			var middle = ss.Int32.div(top + bottom, 2);
			canvas.beginPath();
			canvas.circle(left, middle - circleSize * this.$_dotOffset, circleSize);
			canvas.circle(left, middle + circleSize * this.$_dotOffset, circleSize);
			canvas.fill();
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_RestGlyph, $asm, {
		doLayout: function() {
			switch (this.$_duration) {
				case 1:
				case 2:
				case 4:
				case 8:
				case 16: {
					this.set_width(ss.Int32.trunc(9 * this.get_scale()));
					break;
				}
				case 32: {
					this.set_width(ss.Int32.trunc(12 * this.get_scale()));
					break;
				}
				case 64: {
					this.set_width(ss.Int32.trunc(14 * this.get_scale()));
					break;
				}
			}
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_RideCymbalGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(9 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_ScoreBeatGlyph, $asm, {
		get_noteHeads: function() {
			return this.$4$NoteHeadsField;
		},
		set_noteHeads: function(value) {
			this.$4$NoteHeadsField = value;
		},
		get_restGlyph: function() {
			return this.$4$RestGlyphField;
		},
		set_restGlyph: function(value) {
			this.$4$RestGlyphField = value;
		},
		get_beamingHelper: function() {
			return this.$4$BeamingHelperField;
		},
		set_beamingHelper: function(value) {
			this.$4$BeamingHelperField = value;
		},
		finalizeGlyph: function(layout) {
			if (!this.get_container().get_beat().get_isRest()) {
				this.get_noteHeads().updateBeamingHelper(this.get_container().get_x() + this.get_x());
			}
		},
		applyGlyphSpacing: function(spacing) {
			$AlphaTab_Rendering_Glyphs_Glyph.prototype.applyGlyphSpacing.call(this, spacing);
			// TODO: we need to tell the beaming helper the position of rest beats
			if (!this.get_container().get_beat().get_isRest()) {
				this.get_noteHeads().updateBeamingHelper(this.get_container().get_x() + this.get_x());
			}
		},
		doLayout: function() {
			// create glyphs
			var sr = this.get_renderer();
			if (!this.get_container().get_beat().get_isEmpty()) {
				if (!this.get_container().get_beat().get_isRest()) {
					//
					// Note heads
					//
					this.set_noteHeads(new $AlphaTab_Rendering_Glyphs_ScoreNoteChordGlyph());
					this.get_noteHeads().set_beat(this.get_container().get_beat());
					this.get_noteHeads().set_beamingHelper(this.get_beamingHelper());
					this.noteLoop(ss.mkdel(this, this.$createNoteGlyph));
					this.addGlyph(this.get_noteHeads());
					//
					// Note dots
					//
					if (this.get_container().get_beat().get_dots() > 0) {
						this.addGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(5 * this.get_scale()), false));
						for (var i = 0; i < this.get_container().get_beat().get_dots(); i++) {
							var group = { $: new $AlphaTab_Rendering_Glyphs_GlyphGroup(0, 0, null) };
							this.noteLoop(ss.mkdel({ group: group, $this: this }, function(n) {
								this.$this.$createBeatDot(sr.getNoteLine(n), 2, this.group.$);
							}));
							this.addGlyph(group.$);
						}
					}
				}
				else {
					var dotLine = 0;
					var line = 0;
					var offset = 0;
					var dotOffset = 0;
					switch (this.get_container().get_beat().get_duration()) {
						case 1: {
							line = 4;
							dotLine = 4;
							break;
						}
						case 2: {
							line = 5;
							dotLine = 5;
							break;
						}
						case 4: {
							line = 7;
							offset = -2;
							dotLine = 4;
							dotOffset = 3;
							break;
						}
						case 8: {
							line = 8;
							dotLine = 4;
							dotOffset = 3;
							break;
						}
						case 16: {
							line = 10;
							dotLine = 4;
							dotOffset = 3;
							break;
						}
						case 32: {
							line = 10;
							dotLine = 2;
							dotOffset = 2;
							break;
						}
						case 64: {
							line = 12;
							dotLine = 2;
							dotOffset = 2;
							break;
						}
					}
					var y = sr.getScoreY(line, offset);
					this.addGlyph(new $AlphaTab_Rendering_Glyphs_RestGlyph(0, y, this.get_container().get_beat().get_duration()));
					//
					// Note dots
					//
					if (this.get_container().get_beat().get_dots() > 0) {
						this.addGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(5 * this.get_scale()), false));
						for (var i1 = 0; i1 < this.get_container().get_beat().get_dots(); i1++) {
							var group1 = new $AlphaTab_Rendering_Glyphs_GlyphGroup(0, 0, null);
							this.$createBeatDot(dotLine, dotOffset, group1);
							this.addGlyph(group1);
						}
					}
				}
			}
			$AlphaTab_Rendering_Glyphs_BeatGlyphBase.prototype.doLayout.call(this);
			if (ss.isValue(this.get_noteHeads())) {
				this.get_noteHeads().updateBeamingHelper(this.get_x());
			}
		},
		$createBeatDot: function(line, offset, group) {
			var sr = this.get_renderer();
			group.addGlyph(new $AlphaTab_Rendering_Glyphs_CircleGlyph(0, sr.getScoreY(line, offset + 2), 1.5 * this.get_scale()));
		},
		$createNoteHeadGlyph: function(n) {
			var isGrace = this.get_container().get_beat().get_graceType() !== 0;
			if (n.get_beat().get_voice().get_bar().get_track().get_isPercussion()) {
				var normalKeys = new (ss.makeGenericType($AlphaTab_Model_HashSet$1, [ss.Int32]))([32, 34, 35, 36, 38, 39, 40, 41, 43, 45, 47, 48, 50, 55, 56, 58, 60, 61]);
				var xKeys = new (ss.makeGenericType($AlphaTab_Model_HashSet$1, [ss.Int32]))([31, 33, 37, 42, 44, 54, 62, 63, 64, 65, 66]);
				var value = n.get_realValue();
				if (value <= 30 || value >= 67 || normalKeys.contains(value)) {
					return new $AlphaTab_Rendering_Glyphs_NoteHeadGlyph(0, 0, 4, isGrace);
				}
				if (xKeys.contains(value)) {
					return new $AlphaTab_Rendering_Glyphs_DrumSticksGlyph(0, 0, isGrace);
				}
				if (value === 46) {
					return new $AlphaTab_Rendering_Glyphs_HiHatGlyph(0, 0, isGrace);
				}
				if (value === 49 || value === 57) {
					return new $AlphaTab_Rendering_Glyphs_DiamondNoteHeadGlyph(0, 0, isGrace);
				}
				if (value === 52) {
					return new $AlphaTab_Rendering_Glyphs_ChineseCymbalGlyph(0, 0, isGrace);
				}
				if (value === 51 || value === 53 || value === 59) {
					return new $AlphaTab_Rendering_Glyphs_RideCymbalGlyph(0, 0, isGrace);
				}
				return new $AlphaTab_Rendering_Glyphs_NoteHeadGlyph(0, 0, 4, isGrace);
			}
			if (n.get_isDead()) {
				return new $AlphaTab_Rendering_Glyphs_DeadNoteHeadGlyph(0, 0, isGrace);
			}
			if (n.get_harmonicType() === 0) {
				return new $AlphaTab_Rendering_Glyphs_NoteHeadGlyph(0, 0, n.get_beat().get_duration(), isGrace);
			}
			return new $AlphaTab_Rendering_Glyphs_DiamondNoteHeadGlyph(0, 0, isGrace);
		},
		$createNoteGlyph: function(n) {
			var sr = this.get_renderer();
			var noteHeadGlyph = this.$createNoteHeadGlyph(n);
			// calculate y position
			var line = sr.getNoteLine(n);
			noteHeadGlyph.set_y(sr.getScoreY(line, -1));
			this.get_noteHeads().addNoteGlyph(noteHeadGlyph, n, line);
			if (n.get_isStaccato() && !this.get_noteHeads().get_beatEffects().containsKey('Staccato')) {
				this.get_noteHeads().get_beatEffects().set_item('Staccato', new $AlphaTab_Rendering_Glyphs_CircleGlyph(0, 0, 1.5));
			}
			if (n.get_accentuated() === 1 && !this.get_noteHeads().get_beatEffects().containsKey('Accent')) {
				this.get_noteHeads().get_beatEffects().set_item('Accent', new $AlphaTab_Rendering_Glyphs_AccentuationGlyph(0, 0, 1));
			}
			if (n.get_accentuated() === 2 && !this.get_noteHeads().get_beatEffects().containsKey('HAccent')) {
				this.get_noteHeads().get_beatEffects().set_item('HAccent', new $AlphaTab_Rendering_Glyphs_AccentuationGlyph(0, 0, 2));
			}
		}
	}, $AlphaTab_Rendering_Glyphs_BeatGlyphBase, [$AlphaTab_Rendering_Glyphs_ISupportsFinalize]);
	ss.initClass($AlphaTab_Rendering_Glyphs_ScoreBeatPostNotesGlyph, $asm, {
		doLayout: function() {
			this.addGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(this.get_beatDurationWidth() * this.get_scale()), true));
			$AlphaTab_Rendering_Glyphs_BeatGlyphBase.prototype.doLayout.call(this);
		}
	}, $AlphaTab_Rendering_Glyphs_BeatGlyphBase);
	ss.initClass($AlphaTab_Rendering_Glyphs_ScoreBeatPreNotesGlyph, $asm, {
		applyGlyphSpacing: function(spacing) {
			$AlphaTab_Rendering_Glyphs_Glyph.prototype.applyGlyphSpacing.call(this, spacing);
			// add spacing at the beginning, this way the elements are closer to the note head
			for (var $t1 = 0; $t1 < this.glyphs.length; $t1++) {
				var g = this.glyphs[$t1];
				g.set_x(g.get_x() + spacing);
			}
		},
		doLayout: function() {
			if (this.get_container().get_beat().get_brushType() !== 0) {
				this.addGlyph(new $AlphaTab_Rendering_Glyphs_ScoreBrushGlyph(this.get_container().get_beat()));
				this.addGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(4 * this.get_scale()), true));
			}
			if (!this.get_container().get_beat().get_isRest() && !this.get_container().get_beat().get_voice().get_bar().get_track().get_isPercussion()) {
				var accidentals = new $AlphaTab_Rendering_Glyphs_AccidentalGroupGlyph();
				this.noteLoop(ss.mkdel(this, function(n) {
					this.$createAccidentalGlyph(n, accidentals);
				}));
				this.addGlyph(accidentals);
			}
			// a small padding
			this.addGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(4 * ((this.get_container().get_beat().get_graceType() !== 0) ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()), true));
			$AlphaTab_Rendering_Glyphs_BeatGlyphBase.prototype.doLayout.call(this);
		},
		$createAccidentalGlyph: function(n, accidentals) {
			var sr = this.get_renderer();
			var noteLine = sr.getNoteLine(n);
			var accidental = sr.get_accidentalHelper().applyAccidental(n, noteLine);
			var isGrace = this.get_container().get_beat().get_graceType() !== 0;
			switch (accidental) {
				case 2: {
					accidentals.addGlyph(new $AlphaTab_Rendering_Glyphs_SharpGlyph(0, sr.getScoreY(noteLine, 0), isGrace));
					break;
				}
				case 3: {
					accidentals.addGlyph(new $AlphaTab_Rendering_Glyphs_FlatGlyph(0, sr.getScoreY(noteLine, 0), isGrace));
					break;
				}
				case 1: {
					accidentals.addGlyph(new $AlphaTab_Rendering_Glyphs_NaturalizeGlyph(0, sr.getScoreY(noteLine + 1, 0), isGrace));
					break;
				}
			}
		}
	}, $AlphaTab_Rendering_Glyphs_BeatGlyphBase);
	ss.initClass($AlphaTab_Rendering_Glyphs_ScoreBrushGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(10 * this.get_scale()));
		},
		paint: function(cx, cy, canvas) {
			var scoreBarRenderer = this.get_renderer();
			var lineSize = scoreBarRenderer.get_lineOffset();
			var res = this.get_renderer().get_resources();
			var startY = cy + this.get_y() + ss.Int32.trunc(scoreBarRenderer.getNoteY(this.$_beat.get_maxNote()) - lineSize / 2);
			var endY = cy + this.get_y() + scoreBarRenderer.getNoteY(this.$_beat.get_minNote()) + lineSize;
			var arrowX = cx + this.get_x() + ss.Int32.div(this.get_width(), 2);
			var arrowSize = 8 * this.get_scale();
			canvas.set_color(res.get_mainGlyphColor());
			if (this.$_beat.get_brushType() !== 0) {
				if (this.$_beat.get_brushType() === 3 || this.$_beat.get_brushType() === 4) {
					var size = ss.Int32.trunc(15 * this.get_scale());
					var steps = ss.Int32.trunc(Math.abs(endY - startY) / size);
					for (var i = 0; i < steps; i++) {
						var arrow = new $AlphaTab_Rendering_Glyphs_SvgGlyph(ss.Int32.trunc(3 * this.get_scale()), 0, $AlphaTab_Rendering_Glyphs_MusicFont.waveVertical, 1, 1);
						arrow.set_renderer(this.get_renderer());
						arrow.doLayout();
						arrow.paint(cx + this.get_x(), startY + i * size, canvas);
					}
				}
				if (this.$_beat.get_brushType() === 3) {
					canvas.beginPath();
					canvas.moveTo(arrowX, endY);
					canvas.lineTo(ss.Int32.trunc(arrowX + arrowSize / 2), ss.Int32.trunc(endY - arrowSize));
					canvas.lineTo(ss.Int32.trunc(arrowX - arrowSize / 2), ss.Int32.trunc(endY - arrowSize));
					canvas.closePath();
					canvas.fill();
				}
				else if (this.$_beat.get_brushType() === 4) {
					canvas.beginPath();
					canvas.moveTo(arrowX, startY);
					canvas.lineTo(ss.Int32.trunc(arrowX + arrowSize / 2), ss.Int32.trunc(startY + arrowSize));
					canvas.lineTo(ss.Int32.trunc(arrowX - arrowSize / 2), ss.Int32.trunc(startY + arrowSize));
					canvas.closePath();
					canvas.fill();
				}
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_ScoreNoteChordGlyph, $asm, {
		get_minNote: function() {
			return this.$2$MinNoteField;
		},
		set_minNote: function(value) {
			this.$2$MinNoteField = value;
		},
		get_maxNote: function() {
			return this.$2$MaxNoteField;
		},
		set_maxNote: function(value) {
			this.$2$MaxNoteField = value;
		},
		get_spacingChanged: function() {
			return this.$2$SpacingChangedField;
		},
		set_spacingChanged: function(value) {
			this.$2$SpacingChangedField = value;
		},
		get_upLineX: function() {
			return this.$2$UpLineXField;
		},
		set_upLineX: function(value) {
			this.$2$UpLineXField = value;
		},
		get_downLineX: function() {
			return this.$2$DownLineXField;
		},
		set_downLineX: function(value) {
			this.$2$DownLineXField = value;
		},
		get_beatEffects: function() {
			return this.$2$BeatEffectsField;
		},
		set_beatEffects: function(value) {
			this.$2$BeatEffectsField = value;
		},
		get_beat: function() {
			return this.$2$BeatField;
		},
		set_beat: function(value) {
			this.$2$BeatField = value;
		},
		get_beamingHelper: function() {
			return this.$2$BeamingHelperField;
		},
		set_beamingHelper: function(value) {
			this.$2$BeamingHelperField = value;
		},
		get_direction: function() {
			return this.get_beamingHelper().get_direction();
		},
		getNoteX: function(note, onEnd) {
			if (this.$_noteLookup.containsKey(note.get_string())) {
				var n = this.$_noteLookup.get_item(note.get_string());
				var pos = this.get_x() + n.get_x();
				if (onEnd) {
					pos += n.get_width();
				}
				return pos;
			}
			return 0;
		},
		getNoteY: function(note) {
			if (this.$_noteLookup.containsKey(note.get_string())) {
				return this.get_y() + this.$_noteLookup.get_item(note.get_string()).get_y();
			}
			return 0;
		},
		addNoteGlyph: function(noteGlyph, note, noteLine) {
			var info = new $AlphaTab_Rendering_Glyphs_ScoreNoteGlyphInfo(noteGlyph, noteLine);
			ss.add(this.$_infos, info);
			this.$_noteLookup.set_item(note.get_string(), noteGlyph);
			if (ss.isNullOrUndefined(this.get_minNote()) || this.get_minNote().get_line() > info.get_line()) {
				this.set_minNote(info);
			}
			if (ss.isNullOrUndefined(this.get_maxNote()) || this.get_maxNote().get_line() < info.get_line()) {
				this.set_maxNote(info);
			}
		},
		get_canScale: function() {
			return false;
		},
		updateBeamingHelper: function(cx) {
			this.get_beamingHelper().registerBeatLineX(this.get_beat(), cx + this.get_x() + this.get_upLineX(), cx + this.get_x() + this.get_downLineX());
		},
		get_hasTopOverflow: function() {
			return ss.isValue(this.get_minNote()) && this.get_minNote().get_line() < 0;
		},
		get_hasBottomOverflow: function() {
			return ss.isValue(this.get_maxNote()) && this.get_maxNote().get_line() > 8;
		},
		doLayout: function() {
			this.$_infos.sort(function(a, b) {
				return ss.compare(a.get_line(), b.get_line());
			});
			var padding = 0;
			// Std.int(4 * getScale());
			var displacedX = 0;
			var lastDisplaced = false;
			var lastLine = 0;
			var anyDisplaced = false;
			var w = 0;
			for (var i = 0; i < this.$_infos.length; i++) {
				var g = this.$_infos[i].get_glyph();
				g.set_renderer(this.get_renderer());
				g.doLayout();
				g.set_x(padding);
				if (i === 0) {
					displacedX = g.get_width() + padding;
				}
				else {
					// check if note needs to be repositioned
					if (Math.abs(lastLine - this.$_infos[i].get_line()) <= 1) {
						// reposition if needed
						if (!lastDisplaced) {
							g.set_x(ss.Int32.trunc(displacedX - this.get_scale()));
							anyDisplaced = true;
							lastDisplaced = true;
							// let next iteration know we are displace now
						}
						else {
							lastDisplaced = false;
							// let next iteration know that we weren't displaced now
						}
					}
					else {
						lastDisplaced = false;
					}
				}
				lastLine = this.$_infos[i].get_line();
				w = Math.max(w, g.get_x() + g.get_width());
			}
			if (anyDisplaced) {
				this.set_upLineX(displacedX);
				this.set_downLineX(displacedX);
			}
			else {
				this.set_upLineX(w);
				this.set_downLineX(padding);
			}
			var $t1 = ss.getEnumerator(this.get_beatEffects().get_values());
			try {
				while ($t1.moveNext()) {
					var e = $t1.current();
					e.set_renderer(this.get_renderer());
					e.doLayout();
				}
			}
			finally {
				$t1.dispose();
			}
			if (this.get_beat().get_isTremolo()) {
				var direction = this.get_beamingHelper().get_direction();
				var offset;
				var baseNote = ((direction === 0) ? this.get_minNote() : this.get_maxNote());
				var tremoloX = ((direction === 0) ? displacedX : 0);
				if (ss.isValue(this.get_beat().get_tremoloSpeed())) {
					var speed = this.get_beat().get_tremoloSpeed().get_value();
					switch (speed) {
						case 32: {
							offset = ((direction === 0) ? -15 : 10);
							break;
						}
						case 16: {
							offset = ((direction === 0) ? -12 : 10);
							break;
						}
						case 8: {
							offset = ((direction === 0) ? -10 : 10);
							break;
						}
						default: {
							offset = ((direction === 0) ? -15 : 15);
							break;
						}
					}
				}
				else {
					offset = ((direction === 0) ? -15 : 15);
				}
				this.$_tremoloPicking = new $AlphaTab_Rendering_Glyphs_TremoloPickingGlyph(tremoloX, baseNote.get_glyph().get_y() + ss.Int32.trunc(offset * this.get_scale()), this.get_beat().get_tremoloSpeed().get_value());
				this.$_tremoloPicking.set_renderer(this.get_renderer());
				this.$_tremoloPicking.doLayout();
			}
			this.set_width(w + padding);
		},
		paint: function(cx, cy, canvas) {
			var scoreRenderer = this.get_renderer();
			//
			// Note Effects only painted once
			//
			var effectY = ((this.get_beamingHelper().get_direction() === 0) ? scoreRenderer.getScoreY(this.get_maxNote().get_line(), 13) : scoreRenderer.getScoreY(this.get_minNote().get_line(), -9));
			// TODO: take care of actual glyph height
			var effectSpacing = ((this.get_beamingHelper().get_direction() === 0) ? ss.Int32.trunc(7 * this.get_scale()) : ss.Int32.trunc(-7 * this.get_scale()));
			var $t1 = ss.getEnumerator(this.get_beatEffects().get_values());
			try {
				while ($t1.moveNext()) {
					var g = $t1.current();
					g.set_y(effectY);
					g.set_x(ss.Int32.div(this.get_width(), 2));
					g.paint(cx + this.get_x(), cy + this.get_y(), canvas);
					effectY += effectSpacing;
				}
			}
			finally {
				$t1.dispose();
			}
			canvas.set_color(this.get_renderer().get_layout().get_renderer().get_renderingResources().get_staveLineColor());
			// TODO: Take care of beateffects in overflow
			var linePadding = ss.Int32.trunc(3 * this.get_scale());
			if (this.get_hasTopOverflow()) {
				var l = -1;
				while (l >= this.get_minNote().get_line()) {
					// + 1 Because we want to place the line in the center of the note, not at the top
					var lY = cy + this.get_y() + scoreRenderer.getScoreY(l + 1, -1);
					canvas.beginPath();
					canvas.moveTo(cx + this.get_x() - linePadding, lY);
					canvas.lineTo(cx + this.get_x() + this.get_width() + linePadding, lY);
					canvas.stroke();
					l -= 2;
				}
			}
			if (this.get_hasBottomOverflow()) {
				var l1 = 11;
				while (l1 <= this.get_maxNote().get_line()) {
					var lY1 = cy + this.get_y() + scoreRenderer.getScoreY(l1 + 1, -1);
					canvas.beginPath();
					canvas.moveTo(cx + this.get_x() - linePadding, lY1);
					canvas.lineTo(cx + this.get_x() + this.get_width() + linePadding, lY1);
					canvas.stroke();
					l1 += 2;
				}
			}
			if (ss.isValue(this.$_tremoloPicking)) {
				this.$_tremoloPicking.paint(cx + this.get_x(), cy + this.get_y(), canvas);
			}
			for (var $t2 = 0; $t2 < this.$_infos.length; $t2++) {
				var g1 = this.$_infos[$t2];
				g1.get_glyph().set_renderer(this.get_renderer());
				g1.get_glyph().paint(cx + this.get_x(), cy + this.get_y(), canvas);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_ScoreNoteGlyphInfo, $asm, {
		get_glyph: function() {
			return this.$1$GlyphField;
		},
		set_glyph: function(value) {
			this.$1$GlyphField = value;
		},
		get_line: function() {
			return this.$1$LineField;
		},
		set_line: function(value) {
			this.$1$LineField = value;
		}
	});
	ss.initClass($AlphaTab_Rendering_Glyphs_ScoreSlideLineGlyph, $asm, {
		doLayout: function() {
			this.set_width(0);
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			var r = this.get_renderer();
			var sizeX = ss.Int32.trunc(12 * this.get_scale());
			var offsetX = ss.Int32.trunc(1 * this.get_scale());
			var startX;
			var startY;
			var endX;
			var endY;
			switch (this.$_type) {
				case 1:
				case 2: {
					startX = cx + r.getNoteX(this.$_startNote, true) + offsetX;
					startY = cy + r.getNoteY(this.$_startNote) + 4;
					if (ss.isValue(this.$_startNote.get_slideTarget())) {
						endX = cx + r.getNoteX(this.$_startNote.get_slideTarget(), false) - offsetX;
						endY = cy + r.getNoteY(this.$_startNote.get_slideTarget()) + 4;
					}
					else {
						endX = cx + this.$_parent.get_x() + this.$_parent.get_postNotes().get_x() + this.$_parent.get_postNotes().get_width();
						endY = startY;
					}
					break;
				}
				case 3: {
					endX = cx + r.getNoteX(this.$_startNote, false) - offsetX;
					endY = cy + r.getNoteY(this.$_startNote) + 4;
					startX = endX - sizeX;
					startY = cy + r.getNoteY(this.$_startNote) + $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.noteHeadHeight;
					break;
				}
				case 4: {
					endX = cx + r.getNoteX(this.$_startNote, false) - offsetX;
					endY = cy + r.getNoteY(this.$_startNote) + 4;
					startX = endX - sizeX;
					startY = cy + r.getNoteY(this.$_startNote);
					break;
				}
				case 5: {
					startX = cx + r.getNoteX(this.$_startNote, true) + offsetX;
					startY = cy + r.getNoteY(this.$_startNote) + 4;
					endX = startX + sizeX;
					endY = cy + r.getNoteY(this.$_startNote);
					break;
				}
				case 6: {
					startX = cx + r.getNoteX(this.$_startNote, true) + offsetX;
					startY = cy + r.getNoteY(this.$_startNote) + 4;
					endX = startX + sizeX;
					endY = cy + r.getNoteY(this.$_startNote) + $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.noteHeadHeight;
					break;
				}
				default: {
					return;
				}
			}
			canvas.set_color(this.get_renderer().get_layout().get_renderer().get_renderingResources().get_mainGlyphColor());
			canvas.beginPath();
			canvas.moveTo(startX, startY);
			canvas.lineTo(endX, endY);
			canvas.stroke();
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_TieGlyph, $asm, {
		doLayout: function() {
			this.set_width(0);
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_ScoreTieGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			if (ss.isNullOrUndefined(this.endNote) || this.startNote.get_beat().get_index() !== this.endNote.get_beat().get_index()) {
				return;
			}
			var r = this.get_renderer();
			var parent = this.parent;
			var startX = cx + r.getNoteX(this.startNote, true);
			var endX = (ss.isNullOrUndefined(this.endNote) ? (cx + parent.get_x() + parent.get_postNotes().get_x() + parent.get_postNotes().get_width()) : (cx + r.getNoteX(this.endNote, false)));
			var startY = cy + r.getNoteY(this.startNote) + 4;
			var endY = (ss.isNullOrUndefined(this.endNote) ? startY : (cy + r.getNoteY(this.endNote) + 4));
			$AlphaTab_Rendering_Glyphs_TieGlyph.paintTie(canvas, this.get_scale(), startX, startY, endX, endY, r.getBeatDirection(this.startNote.get_beat()) === 1);
			canvas.set_color(this.get_renderer().get_layout().get_renderer().get_renderingResources().get_mainGlyphColor());
			canvas.fill();
		}
	}, $AlphaTab_Rendering_Glyphs_TieGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_SharpGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(8 * (this.$_isGrace ? $AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale : 1) * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_SpacingGlyph, $asm, {
		get_canScale: function() {
			return this.$_scaling;
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_SvgCommand, $asm, {
		get_cmd: function() {
			return this.$1$CmdField;
		},
		set_cmd: function(value) {
			this.$1$CmdField = value;
		},
		get_numbers: function() {
			return this.$1$NumbersField;
		},
		set_numbers: function(value) {
			this.$1$NumbersField = value;
		}
	});
	ss.initClass($AlphaTab_Rendering_Glyphs_TabBeatContainerGlyph, $asm, {
		createTies: function(n) {
			if (n.get_isHammerPullDestination() && ss.isValue(n.get_hammerPullOrigin())) {
				var tie = new $AlphaTab_Rendering_Glyphs_TabTieGlyph(n.get_hammerPullOrigin(), n, this);
				ss.add(this.get_ties(), tie);
			}
			else if (n.get_slideType() === 2) {
				var tie1 = new $AlphaTab_Rendering_Glyphs_TabTieGlyph(n, n.get_slideTarget(), this);
				ss.add(this.get_ties(), tie1);
			}
			if (n.get_slideType() !== 0) {
				var l = new $AlphaTab_Rendering_Glyphs_TabSlideLineGlyph(n.get_slideType(), n, this);
				ss.add(this.get_ties(), l);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_BeatContainerGlyph, [$AlphaTab_Rendering_Glyphs_ISupportsFinalize]);
	ss.initClass($AlphaTab_Rendering_Glyphs_TabBeatGlyph, $asm, {
		get_noteNumbers: function() {
			return this.$4$NoteNumbersField;
		},
		set_noteNumbers: function(value) {
			this.$4$NoteNumbersField = value;
		},
		get_beamingHelper: function() {
			return this.$4$BeamingHelperField;
		},
		set_beamingHelper: function(value) {
			this.$4$BeamingHelperField = value;
		},
		doLayout: function() {
			// create glyphs
			if (!this.get_container().get_beat().get_isRest()) {
				//
				// Note numbers
				this.set_noteNumbers(new $AlphaTab_Rendering_Glyphs_TabNoteChordGlyph(0, 0, this.get_container().get_beat().get_graceType() !== 0));
				this.get_noteNumbers().set_beat(this.get_container().get_beat());
				this.get_noteNumbers().set_beamingHelper(this.get_beamingHelper());
				this.noteLoop(ss.mkdel(this, this.$createNoteGlyph));
				this.addGlyph(this.get_noteNumbers());
				//
				// Whammy Bar
				if (this.get_container().get_beat().get_hasWhammyBar() && !this.get_noteNumbers().get_beatEffects().containsKey('Whammy')) {
					this.get_noteNumbers().get_beatEffects().set_item('Whammy', new $AlphaTab_Rendering_Glyphs_WhammyBarGlyph(this.get_container().get_beat(), this.get_container()));
				}
				//
				// Tremolo Picking
				if (this.get_container().get_beat().get_isTremolo() && !this.get_noteNumbers().get_beatEffects().containsKey('Tremolo')) {
					this.get_noteNumbers().get_beatEffects().set_item('Tremolo', new $AlphaTab_Rendering_Glyphs_TremoloPickingGlyph(0, 0, this.get_container().get_beat().get_tremoloSpeed().get_value()));
				}
			}
			// left to right layout
			var w = 0;
			for (var $t1 = 0; $t1 < this.glyphs.length; $t1++) {
				var g = this.glyphs[$t1];
				g.set_x(w);
				g.set_renderer(this.get_renderer());
				g.doLayout();
				w += g.get_width();
			}
			this.set_width(w);
		},
		finalizeGlyph: function(layout) {
			if (!this.get_container().get_beat().get_isRest()) {
				this.get_noteNumbers().updateBeamingHelper(this.get_container().get_x() + this.get_x());
			}
		},
		applyGlyphSpacing: function(spacing) {
			$AlphaTab_Rendering_Glyphs_Glyph.prototype.applyGlyphSpacing.call(this, spacing);
			// TODO: we need to tell the beaming helper the position of rest beats
			if (!this.get_container().get_beat().get_isRest()) {
				this.get_noteNumbers().updateBeamingHelper(this.get_container().get_x() + this.get_x());
			}
		},
		$createNoteGlyph: function(n) {
			var isGrace = this.get_container().get_beat().get_graceType() !== 0;
			var tr = this.get_renderer();
			var noteNumberGlyph = new $AlphaTab_Rendering_Glyphs_NoteNumberGlyph(0, 0, n, isGrace);
			var l = n.get_beat().get_voice().get_bar().get_track().get_tuning().length - n.get_string() + 1;
			noteNumberGlyph.set_y(tr.getTabY(l, -2));
			this.get_noteNumbers().addNoteGlyph(noteNumberGlyph, n);
		}
	}, $AlphaTab_Rendering_Glyphs_BeatGlyphBase, [$AlphaTab_Rendering_Glyphs_ISupportsFinalize]);
	ss.initClass($AlphaTab_Rendering_Glyphs_TabBeatPostNotesGlyph, $asm, {
		doLayout: function() {
			// note specific effects
			this.noteLoop(ss.mkdel(this, this.$createNoteGlyphs));
			this.addGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(this.get_beatDurationWidth() * this.get_scale()), true));
			$AlphaTab_Rendering_Glyphs_BeatGlyphBase.prototype.doLayout.call(this);
		},
		$createNoteGlyphs: function(n) {
			if (n.get_isTrill()) {
				this.addGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(4 * this.get_scale()), true));
				var trillNote = new $AlphaTab_Model_Note();
				trillNote.set_isGhost(true);
				trillNote.set_fret(n.get_trillFret());
				trillNote.set_string(n.get_string());
				var tr = this.get_renderer();
				var trillNumberGlyph = new $AlphaTab_Rendering_Glyphs_NoteNumberGlyph(0, 0, trillNote, true);
				var l = n.get_beat().get_voice().get_bar().get_track().get_tuning().length - n.get_string();
				trillNumberGlyph.set_y(tr.getTabY(l, 0));
				this.addGlyph(trillNumberGlyph);
			}
			if (n.get_hasBend()) {
				var bendHeight = ss.Int32.trunc(60 * this.get_scale());
				this.get_renderer().registerOverflowTop(bendHeight);
				this.addGlyph(new $AlphaTab_Rendering_Glyphs_BendGlyph(n, ss.Int32.trunc(this.get_beatDurationWidth() * this.get_scale()), bendHeight));
			}
		}
	}, $AlphaTab_Rendering_Glyphs_BeatGlyphBase);
	ss.initClass($AlphaTab_Rendering_Glyphs_TabBeatPreNotesGlyph, $asm, {
		doLayout: function() {
			if (this.get_container().get_beat().get_brushType() !== 0) {
				this.addGlyph(new $AlphaTab_Rendering_Glyphs_TabBrushGlyph(this.get_container().get_beat()));
				this.addGlyph(new $AlphaTab_Rendering_Glyphs_SpacingGlyph(0, 0, ss.Int32.trunc(4 * this.get_scale()), true));
			}
			$AlphaTab_Rendering_Glyphs_BeatGlyphBase.prototype.doLayout.call(this);
		}
	}, $AlphaTab_Rendering_Glyphs_BeatGlyphBase);
	ss.initClass($AlphaTab_Rendering_Glyphs_TabBrushGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(10 * this.get_scale()));
		},
		paint: function(cx, cy, canvas) {
			var tabBarRenderer = this.get_renderer();
			var res = this.get_renderer().get_resources();
			var startY = cy + this.get_x() + ss.Int32.trunc(tabBarRenderer.getNoteY(this.$_beat.get_maxNote()) - res.get_tablatureFont().get_size() / 2);
			var endY = cy + this.get_y() + tabBarRenderer.getNoteY(this.$_beat.get_minNote()) + res.get_tablatureFont().get_size() / 2;
			var arrowX = cx + this.get_x() + ss.Int32.div(this.get_width(), 2);
			var arrowSize = 8 * this.get_scale();
			canvas.set_color(res.get_mainGlyphColor());
			if (this.$_beat.get_brushType() !== 0) {
				if (this.$_beat.get_brushType() === 1 || this.$_beat.get_brushType() === 2) {
					canvas.beginPath();
					canvas.moveTo(arrowX, startY);
					canvas.lineTo(arrowX, endY);
					canvas.stroke();
				}
				else {
					var size = ss.Int32.trunc(15 * this.get_scale());
					var steps = ss.Int32.trunc(Math.abs(endY - startY) / size);
					for (var i = 0; i < steps; i++) {
						var arrow = new $AlphaTab_Rendering_Glyphs_SvgGlyph(ss.Int32.trunc(3 * this.get_scale()), 0, $AlphaTab_Rendering_Glyphs_MusicFont.waveVertical, 1, 1);
						arrow.set_renderer(this.get_renderer());
						arrow.doLayout();
						arrow.paint(cx + this.get_x(), startY + i * size, canvas);
					}
				}
				if (this.$_beat.get_brushType() === 1 || this.$_beat.get_brushType() === 3) {
					canvas.beginPath();
					canvas.moveTo(arrowX, endY);
					canvas.lineTo(arrowX + arrowSize / 2, endY - arrowSize);
					canvas.lineTo(arrowX - arrowSize / 2, endY - arrowSize);
					canvas.closePath();
					canvas.fill();
				}
				else {
					canvas.beginPath();
					canvas.moveTo(arrowX, startY);
					canvas.lineTo(arrowX + arrowSize / 2, startY + arrowSize);
					canvas.lineTo(arrowX - arrowSize / 2, startY + arrowSize);
					canvas.closePath();
					canvas.fill();
				}
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_TabClefGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(28 * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			//TabBarRenderer tabBarRenderer = (TabBarRenderer)Renderer;
			var track = this.get_renderer().get_bar().get_track();
			var res = this.get_renderer().get_resources();
			var startY = cy + this.get_y() + 10 * this.get_scale() * 0.600000023841858;
			//var endY = cy + Y + tabBarRenderer.GetTabY(track.Tuning.Count, -2);
			// TODO: Find a more generic way of calculating the font size but for now this works.
			var fontScale = 1;
			var correction = 0;
			switch (track.get_tuning().length) {
				case 4: {
					fontScale = 0.600000023841858;
					break;
				}
				case 5: {
					fontScale = 0.800000011920929;
					break;
				}
				case 6: {
					fontScale = 1.10000002384186;
					correction = 1;
					break;
				}
				case 7: {
					fontScale = 1.14999997615814;
					break;
				}
				case 8: {
					fontScale = 1.35000002384186;
					break;
				}
			}
			var font = res.get_tabClefFont().clone();
			font.set_size(font.get_size() * fontScale);
			canvas.set_color(res.get_mainGlyphColor());
			canvas.set_font(font);
			canvas.set_textAlign(1);
			canvas.fillText('T', cx + this.get_x() + ss.Int32.div(this.get_width(), 2), startY);
			canvas.fillText('A', cx + this.get_x() + ss.Int32.div(this.get_width(), 2), startY + font.get_size() - correction * this.get_scale());
			canvas.fillText('B', cx + this.get_x() + ss.Int32.div(this.get_width(), 2), startY + (font.get_size() - correction * this.get_scale()) * 2);
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_TabNoteChordGlyph, $asm, {
		get_beat: function() {
			return this.$2$BeatField;
		},
		set_beat: function(value) {
			this.$2$BeatField = value;
		},
		get_beamingHelper: function() {
			return this.$2$BeamingHelperField;
		},
		set_beamingHelper: function(value) {
			this.$2$BeamingHelperField = value;
		},
		get_beatEffects: function() {
			return this.$2$BeatEffectsField;
		},
		set_beatEffects: function(value) {
			this.$2$BeatEffectsField = value;
		},
		getNoteX: function(note, onEnd) {
			if (this.$_noteLookup.containsKey(note.get_string())) {
				var n = this.$_noteLookup.get_item(note.get_string());
				var pos = this.get_x() + n.get_x() + ss.Int32.trunc(0 * this.get_scale());
				if (onEnd) {
					n.calculateWidth();
					pos += n.get_width();
				}
				return pos;
			}
			return 0;
		},
		getNoteY: function(note) {
			if (this.$_noteLookup.containsKey(note.get_string())) {
				return this.get_y() + this.$_noteLookup.get_item(note.get_string()).get_y();
			}
			return 0;
		},
		doLayout: function() {
			var w = 0;
			for (var $t1 = 0; $t1 < this.$_notes.length; $t1++) {
				var g = this.$_notes[$t1];
				g.set_renderer(this.get_renderer());
				g.doLayout();
				if (g.get_width() > w) {
					w = g.get_width();
				}
			}
			var tabHeight = this.get_renderer().get_resources().get_tablatureFont().get_size();
			var effectY = ss.Int32.trunc(this.getNoteY(this.$_minNote) + tabHeight / 2);
			// TODO: take care of actual glyph height
			var effectSpacing = ss.Int32.trunc(7 * this.get_scale());
			var $t2 = ss.getEnumerator(this.get_beatEffects().get_values());
			try {
				while ($t2.moveNext()) {
					var g1 = $t2.current();
					g1.set_y(effectY);
					g1.set_x(ss.Int32.div(this.get_width(), 2));
					g1.set_renderer(this.get_renderer());
					effectY += effectSpacing;
					g1.doLayout();
				}
			}
			finally {
				$t2.dispose();
			}
			this.$_centerX = 0;
			this.set_width(w);
		},
		addNoteGlyph: function(noteGlyph, note) {
			ss.add(this.$_notes, noteGlyph);
			this.$_noteLookup.set_item(note.get_string(), noteGlyph);
			if (ss.isNullOrUndefined(this.$_minNote) || note.get_string() < this.$_minNote.get_string()) {
				this.$_minNote = note;
			}
		},
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			var old = canvas.get_textBaseline();
			canvas.set_textBaseline(2);
			canvas.set_color(res.get_mainGlyphColor());
			canvas.set_font((this.$_isGrace ? res.get_graceFont() : res.get_tablatureFont()));
			for (var $t1 = 0; $t1 < this.$_notes.length; $t1++) {
				var g = this.$_notes[$t1];
				g.set_renderer(this.get_renderer());
				g.paint(cx + this.get_x(), cy + this.get_y(), canvas);
			}
			canvas.set_textBaseline(old);
			var $t2 = ss.getEnumerator(this.get_beatEffects().get_values());
			try {
				while ($t2.moveNext()) {
					var g1 = $t2.current();
					g1.paint(cx + this.get_x(), cy + this.get_y(), canvas);
				}
			}
			finally {
				$t2.dispose();
			}
		},
		updateBeamingHelper: function(cx) {
			if (!this.get_beamingHelper().hasBeatLineX(this.get_beat())) {
				this.get_beamingHelper().registerBeatLineX(this.get_beat(), cx + this.get_x() + this.$_centerX, cx + this.get_x() + this.$_centerX);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_TabSlideLineGlyph, $asm, {
		doLayout: function() {
			this.set_width(0);
		},
		get_canScale: function() {
			return false;
		},
		paint: function(cx, cy, canvas) {
			var r = this.get_renderer();
			var sizeX = ss.Int32.trunc(12 * this.get_scale());
			var sizeY = ss.Int32.trunc(3 * this.get_scale());
			var startX;
			var startY;
			var endX;
			var endY;
			switch (this.$_type) {
				case 1:
				case 2: {
					var startOffsetY;
					var endOffsetY;
					if (ss.isNullOrUndefined(this.$_startNote.get_slideTarget())) {
						startOffsetY = 0;
						endOffsetY = 0;
					}
					else if (this.$_startNote.get_slideTarget().get_fret() > this.$_startNote.get_fret()) {
						startOffsetY = sizeY;
						endOffsetY = sizeY * -1;
					}
					else {
						startOffsetY = sizeY * -1;
						endOffsetY = sizeY;
					}
					startX = cx + r.getNoteX(this.$_startNote, true);
					startY = cy + r.getNoteY(this.$_startNote) + startOffsetY;
					if (ss.isValue(this.$_startNote.get_slideTarget())) {
						endX = cx + r.getNoteX(this.$_startNote.get_slideTarget(), false);
						endY = cy + r.getNoteY(this.$_startNote.get_slideTarget()) + endOffsetY;
					}
					else {
						endX = cx + this.$_parent.get_x() + this.$_parent.get_postNotes().get_x() + this.$_parent.get_postNotes().get_width();
						endY = startY;
					}
					break;
				}
				case 3: {
					endX = cx + r.getNoteX(this.$_startNote, false);
					endY = cy + r.getNoteY(this.$_startNote);
					startX = endX - sizeX;
					startY = cy + r.getNoteY(this.$_startNote) + sizeY;
					break;
				}
				case 4: {
					endX = cx + r.getNoteX(this.$_startNote, false);
					endY = cy + r.getNoteY(this.$_startNote);
					startX = endX - sizeX;
					startY = cy + r.getNoteY(this.$_startNote) - sizeY;
					break;
				}
				case 5: {
					startX = cx + r.getNoteX(this.$_startNote, true);
					startY = cy + r.getNoteY(this.$_startNote);
					endX = startX + sizeX;
					endY = cy + r.getNoteY(this.$_startNote) - sizeY;
					break;
				}
				case 6: {
					startX = cx + r.getNoteX(this.$_startNote, true);
					startY = cy + r.getNoteY(this.$_startNote);
					endX = startX + sizeX;
					endY = cy + r.getNoteY(this.$_startNote) + sizeY;
					break;
				}
				default: {
					return;
				}
			}
			canvas.set_color(this.get_renderer().get_layout().get_renderer().get_renderingResources().get_mainGlyphColor());
			canvas.beginPath();
			canvas.moveTo(startX, startY);
			canvas.lineTo(endX, endY);
			canvas.stroke();
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_TabTieGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			if (ss.isNullOrUndefined(this.endNote) || this.startNote.get_beat().get_index() !== this.endNote.get_beat().get_index()) {
				return;
			}
			var r = this.get_renderer();
			var parent = this.parent;
			var res = r.get_resources();
			var startX = cx + r.getNoteX(this.startNote, true);
			var endX = (ss.isNullOrUndefined(this.endNote) ? (cx + parent.get_x() + parent.get_postNotes().get_x() + parent.get_postNotes().get_width()) : (cx + r.getNoteX(this.endNote, false)));
			var down = this.startNote.get_string() > 3;
			var offset = res.get_tablatureFont().get_size() / 2;
			if (down) {
				offset *= -1;
			}
			var startY = cy + r.getNoteY(this.startNote) + offset;
			var endY = (ss.isNullOrUndefined(this.endNote) ? startY : (cy + r.getNoteY(this.endNote) + offset));
			$AlphaTab_Rendering_Glyphs_TieGlyph.paintTie(canvas, this.get_scale(), startX, startY, endX, endY, this.startNote.get_string() > 3);
			canvas.set_color(this.get_renderer().get_layout().get_renderer().get_renderingResources().get_mainGlyphColor());
			canvas.fill();
		}
	}, $AlphaTab_Rendering_Glyphs_TieGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_TempoGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			canvas.set_font(res.get_markerFont());
			canvas.set_color(res.get_mainGlyphColor());
			var symbol = new $AlphaTab_Rendering_Glyphs_SvgGlyph(0, 0, $AlphaTab_Rendering_Glyphs_MusicFont.tempo, 1, 1);
			symbol.set_renderer(this.get_renderer());
			symbol.paint(cx + this.get_x(), cy + this.get_y(), canvas);
			canvas.fillText('' + this.$_tempo, cx + this.get_x() + 30 * this.get_scale(), cy + this.get_x() + 7 * this.get_scale());
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_TextGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			canvas.set_font(this.$_font);
			canvas.set_color(res.get_mainGlyphColor());
			var old = canvas.get_textAlign();
			canvas.set_textAlign(0);
			canvas.fillText(this.$_text, cx + this.get_x(), cy + this.get_y());
			canvas.set_textAlign(old);
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_TimeSignatureGlyph, $asm, {
		get_canScale: function() {
			return false;
		},
		doLayout: function() {
			var numerator = new $AlphaTab_Rendering_Glyphs_NumberGlyph(0, 0, this.$_numerator);
			var denominator = new $AlphaTab_Rendering_Glyphs_NumberGlyph(0, ss.Int32.trunc(18 * this.get_scale()), this.$_denominator);
			ss.add(this.glyphs, numerator);
			ss.add(this.glyphs, denominator);
			$AlphaTab_Rendering_Glyphs_GlyphGroup.prototype.doLayout.call(this);
			for (var $t1 = 0; $t1 < this.glyphs.length; $t1++) {
				var g = this.glyphs[$t1];
				g.set_x(ss.Int32.div(this.get_width() - g.get_width(), 2));
			}
		}
	}, $AlphaTab_Rendering_Glyphs_GlyphGroup);
	ss.initClass($AlphaTab_Rendering_Glyphs_TremoloPickingGlyph, $asm, {
		doLayout: function() {
			this.set_width(ss.Int32.trunc(12 * this.get_scale()));
		},
		get_canScale: function() {
			return false;
		}
	}, $AlphaTab_Rendering_Glyphs_SvgGlyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_TrillGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			var res = this.get_renderer().get_resources();
			canvas.set_font(res.get_markerFont());
			canvas.set_color(res.get_mainGlyphColor());
			var textw = canvas.measureText('tr');
			canvas.fillText('tr', cx + this.get_x(), cy + this.get_y());
			var startX = textw;
			var endX = this.get_width() - startX;
			var step = 11 * this.get_scale() * this.$_scale;
			var loops = ss.Int32.trunc(Math.max(1, (endX - startX) / step));
			var loopX = ss.Int32.trunc(startX);
			for (var i = 0; i < loops; i++) {
				var glyph = new $AlphaTab_Rendering_Glyphs_SvgGlyph(loopX, 0, $AlphaTab_Rendering_Glyphs_MusicFont.waveHorizontal, this.$_scale, this.$_scale);
				glyph.set_renderer(this.get_renderer());
				glyph.paint(cx + this.get_x(), cy + this.get_y() + ss.Int32.trunc(res.get_markerFont().get_size() / 2), canvas);
				loopX += ss.Int32.trunc(step);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_VibratoGlyph, $asm, {
		paint: function(cx, cy, canvas) {
			var step = 11 * this.get_scale() * this.$_scale;
			var loops = ss.Int32.trunc(Math.max(1, this.get_width() / step));
			var loopX = 0;
			for (var i = 0; i < loops; i++) {
				var glyph = new $AlphaTab_Rendering_Glyphs_SvgGlyph(loopX, 0, $AlphaTab_Rendering_Glyphs_MusicFont.waveHorizontal, this.$_scale, this.$_scale);
				glyph.set_renderer(this.get_renderer());
				glyph.paint(cx + this.get_x(), cy + this.get_y(), canvas);
				loopX += ss.Int32.trunc(step);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initClass($AlphaTab_Rendering_Glyphs_VoiceContainerGlyph, $asm, {
		get_beatGlyphs: function() {
			return this.$3$BeatGlyphsField;
		},
		set_beatGlyphs: function(value) {
			this.$3$BeatGlyphsField = value;
		},
		get_voiceIndex: function() {
			return this.$3$VoiceIndexField;
		},
		set_voiceIndex: function(value) {
			this.$3$VoiceIndexField = value;
		},
		applyGlyphSpacing: function(spacing) {
			var glyphSpacing = ss.Int32.div(spacing, this.get_beatGlyphs().length);
			var gx = 0;
			var $t1 = this.get_beatGlyphs();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var g = $t1[$t2];
				g.set_x(ss.Int32.trunc(gx));
				gx += g.get_width() + glyphSpacing;
				g.applyGlyphSpacing(glyphSpacing);
			}
			this.set_width(ss.Int32.trunc(gx));
		},
		registerMaxSizes: function(sizes) {
			var $t1 = this.get_beatGlyphs();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				b.registerMaxSizes(sizes);
			}
		},
		applySizes: function(sizes) {
			this.set_width(0);
			for (var i = 0; i < this.get_beatGlyphs().length; i++) {
				this.get_beatGlyphs()[i].set_x(((i === 0) ? 0 : (this.get_beatGlyphs()[i - 1].get_x() + this.get_beatGlyphs()[i - 1].get_width())));
				this.get_beatGlyphs()[i].applySizes(sizes);
			}
			if (this.get_beatGlyphs().length > 0) {
				this.set_width(this.get_beatGlyphs()[this.get_beatGlyphs().length - 1].get_x() + this.get_beatGlyphs()[this.get_beatGlyphs().length - 1].get_width());
			}
		},
		addGlyph: function(g) {
			g.set_x(((this.get_beatGlyphs().length === 0) ? 0 : (this.get_beatGlyphs()[this.get_beatGlyphs().length - 1].get_x() + this.get_beatGlyphs()[this.get_beatGlyphs().length - 1].get_width())));
			g.set_index(this.get_beatGlyphs().length);
			g.set_renderer(this.get_renderer());
			g.doLayout();
			ss.add(this.get_beatGlyphs(), g);
			this.set_width(g.get_x() + g.get_width());
		},
		doLayout: function() {
		},
		finalizeGlyph: function(layout) {
			var $t1 = this.get_beatGlyphs();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				b.finalizeGlyph(layout);
			}
		},
		paint: function(cx, cy, canvas) {
			//canvas.Color = new Color((byte) Random.Next(255), (byte) Random.Next(255), (byte) Random.Next(255), 128);
			//canvas.FillRect(cx + X, cy + Y, Width, 100);
			var $t1 = this.get_beatGlyphs();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var g = $t1[$t2];
				g.paint(cx + this.get_x(), cy + this.get_y(), canvas);
			}
		}
	}, $AlphaTab_Rendering_Glyphs_GlyphGroup, [$AlphaTab_Rendering_Glyphs_ISupportsFinalize]);
	ss.initClass($AlphaTab_Rendering_Glyphs_WhammyBarGlyph, $asm, {
		doLayout: function() {
			$AlphaTab_Rendering_Glyphs_Glyph.prototype.doLayout.call(this);
			// 
			// Calculate the min and max offsets
			var minY = 0;
			var maxY = 0;
			var sizeY = ss.Int32.trunc(60 * this.get_scale());
			if (this.$_beat.get_whammyBarPoints().length >= 2) {
				var dy = ss.Int32.div(sizeY, $AlphaTab_Model_Beat.whammyBarMaxValue);
				var $t1 = this.$_beat.get_whammyBarPoints();
				for (var $t2 = 0; $t2 < $t1.length; $t2++) {
					var pt = $t1[$t2];
					var ptY = 0 - dy * pt.get_value();
					if (ptY > maxY) {
						maxY = ptY;
					}
					if (ptY < minY) {
						minY = ptY;
					}
				}
			}
			//
			// calculate the overflow 
			var tabBarRenderer = this.get_renderer();
			var track = this.get_renderer().get_bar().get_track();
			var tabTop = tabBarRenderer.getTabY(0, -2);
			var tabBottom = tabBarRenderer.getTabY(track.get_tuning().length, -2);
			var absMinY = this.get_y() + minY + tabTop;
			var absMaxY = this.get_y() + maxY - tabBottom;
			if (absMinY < 0) {
				tabBarRenderer.registerOverflowTop(Math.abs(absMinY));
			}
			if (absMaxY > 0) {
				tabBarRenderer.registerOverflowBottom(Math.abs(absMaxY));
			}
		},
		paint: function(cx, cy, canvas) {
			var tabBarRenderer = this.get_renderer();
			var res = this.get_renderer().get_resources();
			var startX = cx + this.get_x() + ss.Int32.div(this.$_parent.get_onNotes().get_width(), 2);
			var endX = ((ss.isNullOrUndefined(this.$_beat.get_nextBeat()) || !ss.referenceEquals(this.$_beat.get_voice(), this.$_beat.get_nextBeat().get_voice())) ? (cx + this.get_x() + ss.Int32.div(this.$_parent.get_onNotes().get_width(), 2) + this.$_parent.get_postNotes().get_width()) : (cx + tabBarRenderer.getBeatX(this.$_beat.get_nextBeat())));
			var startY = cy + this.get_x();
			var textOffset = ss.Int32.trunc(3 * this.get_scale());
			var sizeY = ss.Int32.trunc(60 * this.get_scale());
			canvas.set_textAlign(1);
			if (this.$_beat.get_whammyBarPoints().length >= 2) {
				var dx = ss.Int32.div(endX - startX, $AlphaTab_Model_Beat.whammyBarMaxPosition);
				var dy = ss.Int32.div(sizeY, $AlphaTab_Model_Beat.whammyBarMaxValue);
				canvas.beginPath();
				for (var i = 0; i < this.$_beat.get_whammyBarPoints().length - 1; i++) {
					var pt1 = this.$_beat.get_whammyBarPoints()[i];
					var pt2 = this.$_beat.get_whammyBarPoints()[i + 1];
					if (pt1.get_value() === pt2.get_value() && i === this.$_beat.get_whammyBarPoints().length - 2) {
						continue;
					}
					var pt1X = startX + dx * pt1.get_offset();
					var pt1Y = startY - dy * pt1.get_value();
					var pt2X = startX + dx * pt2.get_offset();
					var pt2Y = startY - dy * pt2.get_value();
					canvas.moveTo(pt1X, pt1Y);
					canvas.lineTo(pt2X, pt2Y);
					if (pt2.get_value() !== 0) {
						var dv = pt2.get_value() / 4;
						var up = pt2.get_value() - pt1.get_value() >= 0;
						var s = '';
						if (dv < 0) {
							s += '-';
						}
						if (dv >= 1 || dv <= -1) {
							s += ss.Int32.trunc(Math.abs(dv)) + ' ';
						}
						dv -= ss.Int32.trunc(dv);
						if (dv === 0.25) {
							s += '1/4';
						}
						else if (dv === 0.5) {
							s += '1/2';
						}
						else if (dv === 0.75) {
							s += '3/4';
						}
						canvas.set_font(res.get_graceFont());
						//var size = canvas.MeasureText(s);
						var sy = (up ? (pt2Y - res.get_graceFont().get_size() - textOffset) : (pt2Y + textOffset));
						var sx = pt2X;
						canvas.fillText(s, sx, sy);
					}
				}
				canvas.stroke();
			}
		}
	}, $AlphaTab_Rendering_Glyphs_Glyph);
	ss.initEnum($AlphaTab_Rendering_Layout_HeaderFooterElements, $asm, { none: 0, title: 1, subTitle: 2, artist: 4, album: 8, words: 16, music: 32, wordsAndMusic: 64, copyright: 128, pageNumber: 256, all: 511 });
	ss.initClass($AlphaTab_Rendering_Layout_ScoreLayout, $asm, {
		get_renderer: function() {
			return this.$1$RendererField;
		},
		set_renderer: function(value) {
			this.$1$RendererField = value;
		},
		get_width: function() {
			return this.$1$WidthField;
		},
		set_width: function(value) {
			this.$1$WidthField = value;
		},
		get_height: function() {
			return this.$1$HeightField;
		},
		set_height: function(value) {
			this.$1$HeightField = value;
		},
		doLayout: null,
		paintScore: null,
		buildBoundingsLookup: null,
		get_scale: function() {
			return this.get_renderer().get_settings().get_scale();
		},
		createEmptyStaveGroup: function() {
			var group = new $AlphaTab_Rendering_Staves_StaveGroup();
			group.set_layout(this);
			var isFirstTrack = true;
			var $t1 = this.get_renderer().get_tracks();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var track = $t1[$t2];
				var $t3 = this.get_renderer().get_settings().get_staves();
				for (var $t4 = 0; $t4 < $t3.length; $t4++) {
					var s = $t3[$t4];
					if ($AlphaTab_Environment.staveFactories.containsKey(s.id)) {
						var factory = $AlphaTab_Environment.staveFactories.get_item(s.id)(this);
						if (isFirstTrack || !factory.get_hideOnMultiTrack()) {
							group.addStave(track, new $AlphaTab_Rendering_Staves_Stave(factory));
						}
					}
				}
				isFirstTrack = false;
			}
			return group;
		}
	});
	ss.initClass($AlphaTab_Rendering_Layout_HorizontalScreenLayout, $asm, {
		doLayout: function() {
			if (this.get_renderer().get_settings().get_staves().length === 0) {
				return;
			}
			var score = this.get_renderer().get_score();
			var $t1 = this.get_renderer().get_settings().get_layout();
			var startIndex = $t1.get(ss.Int32).call($t1, 'start', 1);
			startIndex--;
			// map to array index
			startIndex = Math.min(score.get_masterBars().length - 1, Math.max(0, startIndex));
			var currentBarIndex = startIndex;
			var $t2 = this.get_renderer().get_settings().get_layout();
			var endBarIndex = $t2.get(ss.Int32).call($t2, 'count', score.get_masterBars().length);
			endBarIndex = startIndex + endBarIndex - 1;
			// map count to array index
			endBarIndex = Math.min(score.get_masterBars().length - 1, Math.max(0, endBarIndex));
			var x = $AlphaTab_Rendering_Layout_HorizontalScreenLayout.pagePadding[0];
			var y = $AlphaTab_Rendering_Layout_HorizontalScreenLayout.pagePadding[1];
			this.$_group = this.createEmptyStaveGroup();
			while (currentBarIndex <= endBarIndex) {
				this.$_group.addBars(this.get_renderer().get_tracks(), currentBarIndex);
				currentBarIndex++;
			}
			this.$_group.set_x(x);
			this.$_group.set_y(y);
			this.$_group.finalizeGroup(this);
			y += this.$_group.get_height() + ss.Int32.trunc(20 * this.get_scale());
			this.set_height(y + $AlphaTab_Rendering_Layout_HorizontalScreenLayout.pagePadding[3]);
			this.set_width(this.$_group.get_x() + this.$_group.get_width() + $AlphaTab_Rendering_Layout_HorizontalScreenLayout.pagePadding[2]);
		},
		paintScore: function() {
			this.$_group.paint(0, 0, this.get_renderer().get_canvas());
		},
		buildBoundingsLookup: function(lookup) {
			this.$_group.buildBoundingsLookup(lookup);
		}
	}, $AlphaTab_Rendering_Layout_ScoreLayout);
	ss.initClass($AlphaTab_Rendering_Layout_PageViewLayout, $asm, {
		doLayout: function() {
			this.$_groups = [];
			var score = this.get_renderer().get_score();
			var $t1 = this.get_renderer().get_settings().get_layout();
			var startIndex = $t1.get(ss.Int32).call($t1, 'start', 1);
			startIndex--;
			// map to array index
			startIndex = Math.min(score.get_masterBars().length - 1, Math.max(0, startIndex));
			var currentBarIndex = startIndex;
			var $t2 = this.get_renderer().get_settings().get_layout();
			var endBarIndex = $t2.get(ss.Int32).call($t2, 'count', score.get_masterBars().length);
			if (endBarIndex < 0) {
				endBarIndex = score.get_masterBars().length;
			}
			endBarIndex = startIndex + endBarIndex - 1;
			// map count to array index
			endBarIndex = Math.min(score.get_masterBars().length - 1, Math.max(0, endBarIndex));
			var x = $AlphaTab_Rendering_Layout_PageViewLayout.pagePadding[0];
			var y = $AlphaTab_Rendering_Layout_PageViewLayout.pagePadding[1];
			y = this.$doScoreInfoLayout(y);
			var $t3 = this.get_renderer().get_settings().get_layout();
			var autoSize = $t3.get(Boolean).call($t3, 'autoSize', true);
			if (autoSize || this.get_renderer().get_settings().get_width() <= 0) {
				this.set_width(ss.Int32.trunc(950 * this.get_scale()));
			}
			else {
				this.set_width(this.get_renderer().get_settings().get_width());
			}
			if (this.get_renderer().get_settings().get_staves().length > 0) {
				while (currentBarIndex <= endBarIndex) {
					var group = this.$createStaveGroup(currentBarIndex, endBarIndex);
					ss.add(this.$_groups, group);
					group.set_x(x);
					group.set_y(y);
					this.$fitGroup(group);
					group.finalizeGroup(this);
					y += group.get_height() + ss.Int32.trunc(20 * this.get_scale());
					currentBarIndex = group.get_lastBarIndex() + 1;
				}
			}
			this.set_height(y + $AlphaTab_Rendering_Layout_PageViewLayout.pagePadding[3]);
		},
		$doScoreInfoLayout: function(y) {
			// TODO: Check if it's a good choice to provide the complete flags as setting
			var $t1 = this.get_renderer().get_settings().get_layout();
			var flags = ($t1.get(Boolean).call($t1, 'hideInfo', false) ? 0 : 511);
			var score = this.get_renderer().get_score();
			var scale = this.get_scale();
			if (!ss.isNullOrEmptyString(score.get_title()) && (flags & 1) !== 0) {
				y += ss.Int32.trunc(35 * scale);
			}
			if (!ss.isNullOrEmptyString(score.get_subTitle()) && (flags & 2) !== 0) {
				y += ss.Int32.trunc(20 * scale);
			}
			if (!ss.isNullOrEmptyString(score.get_artist()) && (flags & 4) !== 0) {
				y += ss.Int32.trunc(20 * scale);
			}
			if (!ss.isNullOrEmptyString(score.get_album()) && (flags & 8) !== 0) {
				y += ss.Int32.trunc(20 * scale);
			}
			if (!ss.isNullOrEmptyString(score.get_music()) && ss.referenceEquals(score.get_music(), score.get_words()) && (flags & 64) !== 0) {
				y += ss.Int32.trunc(20 * scale);
			}
			else {
				if (!ss.isNullOrEmptyString(score.get_music()) && (flags & 32) !== 0) {
					y += ss.Int32.trunc(20 * scale);
				}
				if (!ss.isNullOrEmptyString(score.get_words()) && (flags & 16) !== 0) {
					y += ss.Int32.trunc(20 * scale);
				}
			}
			y += ss.Int32.trunc(20 * scale);
			// tuning info
			if (this.get_renderer().get_tracks().length === 1 && !this.get_renderer().get_tracks()[0].get_isPercussion()) {
				var tuning = $AlphaTab_Model_Tuning.findTuning(this.get_renderer().get_tracks()[0].get_tuning());
				if (ss.isValue(tuning)) {
					// Name
					y += ss.Int32.trunc(15 * scale);
					if (!tuning.get_isStandard()) {
						// Strings
						var stringsPerColumn = Math.ceil(this.get_renderer().get_tracks()[0].get_tuning().length / 2);
						y += ss.Int32.trunc(stringsPerColumn * ss.Int32.trunc(15 * scale));
					}
					y += ss.Int32.trunc(15 * scale);
				}
			}
			y += ss.Int32.trunc(40 * scale);
			return y;
		},
		paintScore: function() {
			var x = $AlphaTab_Rendering_Layout_PageViewLayout.pagePadding[0];
			var y = $AlphaTab_Rendering_Layout_PageViewLayout.pagePadding[1];
			y = this.$paintScoreInfo(x, y);
			for (var $t1 = 0; $t1 < this.$_groups.length; $t1++) {
				var g = this.$_groups[$t1];
				g.paint(0, 0, this.get_renderer().get_canvas());
			}
		},
		$drawCentered: function(text, font, y) {
			this.get_renderer().get_canvas().set_font(font);
			this.get_renderer().get_canvas().fillText(text, this.get_width() / 2, y);
		},
		$paintScoreInfo: function(x, y) {
			var $t1 = this.get_renderer().get_settings().get_layout();
			var flags = ($t1.get(Boolean).call($t1, 'hideInfo', false) ? 0 : 511);
			var score = this.get_renderer().get_score();
			var scale = this.get_scale();
			var canvas = this.get_renderer().get_canvas();
			var res = this.get_renderer().get_renderingResources();
			canvas.set_color(new $AlphaTab_Platform_Model_Color(0, 0, 0, 255));
			canvas.set_textAlign(1);
			var str;
			if (!ss.isNullOrEmptyString(score.get_title()) && (flags & 1) !== 0) {
				this.$drawCentered(score.get_title(), res.get_titleFont(), y);
				y += ss.Int32.trunc(35 * scale);
			}
			if (!ss.isNullOrEmptyString(score.get_subTitle()) && (flags & 2) !== 0) {
				this.$drawCentered(score.get_subTitle(), res.get_subTitleFont(), y);
				y += ss.Int32.trunc(20 * scale);
			}
			if (!ss.isNullOrEmptyString(score.get_artist()) && (flags & 4) !== 0) {
				this.$drawCentered(score.get_artist(), res.get_subTitleFont(), y);
				y += ss.Int32.trunc(20 * scale);
			}
			if (!ss.isNullOrEmptyString(score.get_album()) && (flags & 8) !== 0) {
				this.$drawCentered(score.get_album(), res.get_subTitleFont(), y);
				y += ss.Int32.trunc(20 * scale);
			}
			if (!ss.isNullOrEmptyString(score.get_music()) && ss.referenceEquals(score.get_music(), score.get_words()) && (flags & 64) !== 0) {
				this.$drawCentered('Music and Words by ' + score.get_words(), res.get_wordsFont(), y);
				y += ss.Int32.trunc(20 * scale);
			}
			else {
				canvas.set_font(res.get_wordsFont());
				if (!ss.isNullOrEmptyString(score.get_music()) && (flags & 32) !== 0) {
					canvas.set_textAlign(2);
					canvas.fillText('Music by ' + score.get_music(), this.get_width() - $AlphaTab_Rendering_Layout_PageViewLayout.pagePadding[2], y);
				}
				if (!ss.isNullOrEmptyString(score.get_words()) && (flags & 16) !== 0) {
					canvas.set_textAlign(0);
					canvas.fillText('Words by ' + score.get_music(), x, y);
				}
				y += ss.Int32.trunc(20 * scale);
			}
			y += ss.Int32.trunc(20 * scale);
			// tuning info
			if (this.get_renderer().get_tracks().length === 1 && !this.get_renderer().get_tracks()[0].get_isPercussion()) {
				canvas.set_textAlign(0);
				var tuning = $AlphaTab_Model_Tuning.findTuning(this.get_renderer().get_tracks()[0].get_tuning());
				if (ss.isValue(tuning)) {
					// Name
					canvas.set_font(res.get_effectFont());
					canvas.fillText(tuning.get_name(), x, y);
					y += ss.Int32.trunc(15 * scale);
					if (!tuning.get_isStandard()) {
						// Strings
						var stringsPerColumn = Math.ceil(this.get_renderer().get_tracks()[0].get_tuning().length / 2);
						var currentX = x;
						var currentY = y;
						for (var i = 0; i < this.get_renderer().get_tracks()[0].get_tuning().length; i++) {
							str = '(' + (i + 1) + ') = ' + $AlphaTab_Model_Tuning.getTextForTuning(this.get_renderer().get_tracks()[0].get_tuning()[i], false);
							canvas.fillText(str, currentX, currentY);
							currentY += ss.Int32.trunc(15 * scale);
							if (i === stringsPerColumn - 1) {
								currentY = y;
								currentX += ss.Int32.trunc(43 * scale);
							}
						}
						y += ss.Int32.trunc(stringsPerColumn * ss.Int32.trunc(15 * scale));
					}
				}
			}
			y += ss.Int32.trunc(25 * scale);
			return y;
		},
		$fitGroup: function(group) {
			// calculate additional space for each bar (can be negative!)
			var barSpace = 0;
			var freeSpace = this.get_$maxWidth() - group.get_width();
			if (freeSpace !== 0 && group.get_masterBars().length > 0) {
				barSpace = ss.Int32.div(freeSpace, group.get_masterBars().length);
			}
			if (group.get_isFull() || barSpace < 0) {
				// add it to the measures
				group.applyBarSpacing(barSpace);
			}
			this.set_width(Math.max(this.get_width(), group.get_width()));
		},
		$createStaveGroup: function(currentBarIndex, endIndex) {
			var group = this.createEmptyStaveGroup();
			group.set_index(this.$_groups.length);
			var $t1 = this.get_renderer().get_settings().get_layout();
			var barsPerRow = $t1.get(ss.Int32).call($t1, 'barsPerRow', -1);
			var maxWidth = this.get_$maxWidth();
			var end = endIndex + 1;
			for (var i = currentBarIndex; i < end; i++) {
				group.addBars(this.get_renderer().get_tracks(), i);
				var groupIsFull = false;
				// can bar placed in this line?
				if (barsPerRow === -1 && (group.get_width() >= maxWidth && group.get_masterBars().length !== 0)) {
					groupIsFull = true;
				}
				else if (group.get_masterBars().length === barsPerRow + 1) {
					groupIsFull = true;
				}
				if (groupIsFull) {
					group.revertLastBar();
					group.set_isFull(true);
					return group;
				}
				group.set_x(0);
			}
			return group;
		},
		get_$maxWidth: function() {
			var $t1 = this.get_renderer().get_settings().get_layout();
			var autoSize = $t1.get(Boolean).call($t1, 'autoSize', true);
			var width = (autoSize ? this.get_$sheetWidth() : this.get_renderer().get_settings().get_width());
			return width - $AlphaTab_Rendering_Layout_PageViewLayout.pagePadding[0] - $AlphaTab_Rendering_Layout_PageViewLayout.pagePadding[2];
		},
		get_$sheetWidth: function() {
			return ss.Int32.trunc(950 * this.get_scale());
		},
		buildBoundingsLookup: function(lookup) {
			for (var $t1 = 0; $t1 < this.$_groups.length; $t1++) {
				var g = this.$_groups[$t1];
				g.buildBoundingsLookup(lookup);
			}
		}
	}, $AlphaTab_Rendering_Layout_ScoreLayout);
	ss.initClass($AlphaTab_Rendering_Staves_BarSizeInfo, $asm, {
		get_fullWidth: function() {
			return this.$1$FullWidthField;
		},
		set_fullWidth: function(value) {
			this.$1$FullWidthField = value;
		},
		get_sizes: function() {
			return this.$1$SizesField;
		},
		set_sizes: function(value) {
			this.$1$SizesField = value;
		},
		get_preNoteSizes: function() {
			return this.$1$PreNoteSizesField;
		},
		set_preNoteSizes: function(value) {
			this.$1$PreNoteSizesField = value;
		},
		get_onNoteSizes: function() {
			return this.$1$OnNoteSizesField;
		},
		set_onNoteSizes: function(value) {
			this.$1$OnNoteSizesField = value;
		},
		get_postNoteSizes: function() {
			return this.$1$PostNoteSizesField;
		},
		set_postNoteSizes: function(value) {
			this.$1$PostNoteSizesField = value;
		},
		setSize: function(key, size) {
			this.get_sizes().set_item(key, size);
		},
		getSize: function(key) {
			if (this.get_sizes().containsKey(key)) {
				return this.get_sizes().get_item(key);
			}
			return 0;
		},
		getPreNoteSize: function(beat) {
			if (this.get_preNoteSizes().containsKey(beat)) {
				return this.get_preNoteSizes().get_item(beat);
			}
			return 0;
		},
		getOnNoteSize: function(beat) {
			if (this.get_onNoteSizes().containsKey(beat)) {
				return this.get_onNoteSizes().get_item(beat);
			}
			return 0;
		},
		getPostNoteSize: function(beat) {
			if (this.get_postNoteSizes().containsKey(beat)) {
				return this.get_postNoteSizes().get_item(beat);
			}
			return 0;
		},
		setPreNoteSize: function(beat, size) {
			this.get_preNoteSizes().set_item(beat, size);
		},
		setOnNoteSize: function(beat, size) {
			this.get_onNoteSizes().set_item(beat, size);
		},
		setPostNoteSize: function(beat, size) {
			this.get_postNoteSizes().set_item(beat, size);
		}
	});
	ss.initClass($AlphaTab_Rendering_Staves_Stave, $asm, {
		get_staveTrackGroup: function() {
			return this.$1$StaveTrackGroupField;
		},
		set_staveTrackGroup: function(value) {
			this.$1$StaveTrackGroupField = value;
		},
		get_staveGroup: function() {
			return this.$1$StaveGroupField;
		},
		set_staveGroup: function(value) {
			this.$1$StaveGroupField = value;
		},
		get_barRenderers: function() {
			return this.$1$BarRenderersField;
		},
		set_barRenderers: function(value) {
			this.$1$BarRenderersField = value;
		},
		get_x: function() {
			return this.$1$XField;
		},
		set_x: function(value) {
			this.$1$XField = value;
		},
		get_y: function() {
			return this.$1$YField;
		},
		set_y: function(value) {
			this.$1$YField = value;
		},
		get_height: function() {
			return this.$1$HeightField;
		},
		set_height: function(value) {
			this.$1$HeightField = value;
		},
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_staveTop: function() {
			return this.$1$StaveTopField;
		},
		set_staveTop: function(value) {
			this.$1$StaveTopField = value;
		},
		get_topSpacing: function() {
			return this.$1$TopSpacingField;
		},
		set_topSpacing: function(value) {
			this.$1$TopSpacingField = value;
		},
		get_bottomSpacing: function() {
			return this.$1$BottomSpacingField;
		},
		set_bottomSpacing: function(value) {
			this.$1$BottomSpacingField = value;
		},
		get_staveBottom: function() {
			return this.$1$StaveBottomField;
		},
		set_staveBottom: function(value) {
			this.$1$StaveBottomField = value;
		},
		get_isFirstInAccolade: function() {
			return this.$1$IsFirstInAccoladeField;
		},
		set_isFirstInAccolade: function(value) {
			this.$1$IsFirstInAccoladeField = value;
		},
		get_isLastInAccolade: function() {
			return this.$1$IsLastInAccoladeField;
		},
		set_isLastInAccolade: function(value) {
			this.$1$IsLastInAccoladeField = value;
		},
		get_isInAccolade: function() {
			return this.$_factory.get_isInAccolade();
		},
		registerStaveTop: function(offset) {
			this.set_staveTop(offset);
		},
		registerStaveBottom: function(offset) {
			this.set_staveBottom(offset);
		},
		addBar: function(bar) {
			var renderer = this.$_factory.create(bar);
			renderer.set_stave(this);
			renderer.set_index(this.get_barRenderers().length);
			renderer.doLayout();
			ss.add(this.get_barRenderers(), renderer);
		},
		revertLastBar: function() {
			ss.removeAt(this.get_barRenderers(), this.get_barRenderers().length - 1);
		},
		applyBarSpacing: function(spacing) {
			var $t1 = this.get_barRenderers();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				b.applyBarSpacing(spacing);
			}
		},
		get_topOverflow: function() {
			var m = 0;
			var $t1 = this.get_barRenderers();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var r = $t1[$t2];
				if (r.get_topOverflow() > m) {
					m = r.get_topOverflow();
				}
			}
			return m;
		},
		get_bottomOverflow: function() {
			var m = 0;
			var $t1 = this.get_barRenderers();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var r = $t1[$t2];
				if (r.get_bottomOverflow() > m) {
					m = r.get_bottomOverflow();
				}
			}
			return m;
		},
		finalizeStave: function(layout) {
			var x = 0;
			this.set_height(0);
			var topOverflow = this.get_topOverflow();
			var bottomOverflow = this.get_bottomOverflow();
			var isEmpty = true;
			for (var i = 0; i < this.get_barRenderers().length; i++) {
				this.get_barRenderers()[i].set_x(x);
				this.get_barRenderers()[i].set_y(this.get_topSpacing() + topOverflow);
				this.set_height(Math.max(this.get_height(), this.get_barRenderers()[i].get_height()));
				this.get_barRenderers()[i].finalizeRenderer(layout);
				x += this.get_barRenderers()[i].get_width();
				if (!this.get_barRenderers()[i].get_isEmpty()) {
					isEmpty = false;
				}
			}
			if (!isEmpty) {
				this.set_height(this.get_height() + (this.get_topSpacing() + topOverflow + bottomOverflow + this.get_bottomSpacing()));
			}
			else {
				this.set_height(0);
			}
		},
		paint: function(cx, cy, canvas) {
			if (this.get_height() === 0) {
				return;
			}
			var $t1 = this.get_barRenderers();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var r = $t1[$t2];
				r.paint(cx + this.get_x(), cy + this.get_y(), canvas);
			}
		}
	});
	ss.initClass($AlphaTab_Rendering_Staves_StaveGroup, $asm, {
		get_x: function() {
			return this.$1$XField;
		},
		set_x: function(value) {
			this.$1$XField = value;
		},
		get_y: function() {
			return this.$1$YField;
		},
		set_y: function(value) {
			this.$1$YField = value;
		},
		get_index: function() {
			return this.$1$IndexField;
		},
		set_index: function(value) {
			this.$1$IndexField = value;
		},
		get_accoladeSpacing: function() {
			return this.$1$AccoladeSpacingField;
		},
		set_accoladeSpacing: function(value) {
			this.$1$AccoladeSpacingField = value;
		},
		get_isFull: function() {
			return this.$1$IsFullField;
		},
		set_isFull: function(value) {
			this.$1$IsFullField = value;
		},
		get_width: function() {
			return this.$1$WidthField;
		},
		set_width: function(value) {
			this.$1$WidthField = value;
		},
		get_masterBars: function() {
			return this.$1$MasterBarsField;
		},
		set_masterBars: function(value) {
			this.$1$MasterBarsField = value;
		},
		get_staves: function() {
			return this.$1$StavesField;
		},
		set_staves: function(value) {
			this.$1$StavesField = value;
		},
		get_layout: function() {
			return this.$1$LayoutField;
		},
		set_layout: function(value) {
			this.$1$LayoutField = value;
		},
		get_helpers: function() {
			return this.$1$HelpersField;
		},
		set_helpers: function(value) {
			this.$1$HelpersField = value;
		},
		get_lastBarIndex: function() {
			return this.get_masterBars()[this.get_masterBars().length - 1].get_index();
		},
		addBars: function(tracks, barIndex) {
			if (tracks.length === 0) {
				return;
			}
			var score = tracks[0].get_score();
			var masterBar = score.get_masterBars()[barIndex];
			ss.add(this.get_masterBars(), masterBar);
			this.get_helpers().buildHelpers(tracks, barIndex);
			if (!this.$_accoladeSpacingCalculated && this.get_index() === 0) {
				this.$_accoladeSpacingCalculated = true;
				var canvas = this.get_layout().get_renderer().get_canvas();
				var res = this.get_layout().get_renderer().get_renderingResources().get_effectFont();
				canvas.set_font(res);
				for (var $t1 = 0; $t1 < tracks.length; $t1++) {
					var t = tracks[$t1];
					this.set_accoladeSpacing(ss.Int32.trunc(Math.max(this.get_accoladeSpacing(), canvas.measureText(t.get_shortName()))));
				}
				this.set_accoladeSpacing(this.get_accoladeSpacing() + 20);
				this.set_width(this.get_width() + this.get_accoladeSpacing());
			}
			// add renderers
			var maxSizes = new $AlphaTab_Rendering_Staves_BarSizeInfo();
			var $t2 = this.get_staves();
			for (var $t3 = 0; $t3 < $t2.length; $t3++) {
				var g = $t2[$t3];
				var $t4 = g.get_staves();
				for (var $t5 = 0; $t5 < $t4.length; $t5++) {
					var s = $t4[$t5];
					s.addBar(g.get_track().get_bars()[barIndex]);
					s.get_barRenderers()[s.get_barRenderers().length - 1].registerMaxSizes(maxSizes);
				}
			}
			// ensure same widths of new renderer
			var realWidth = 0;
			for (var $t6 = 0; $t6 < this.$_allStaves.length; $t6++) {
				var s1 = this.$_allStaves[$t6];
				s1.get_barRenderers()[s1.get_barRenderers().length - 1].applySizes(maxSizes);
				if (s1.get_barRenderers()[s1.get_barRenderers().length - 1].get_width() > realWidth) {
					realWidth = s1.get_barRenderers()[s1.get_barRenderers().length - 1].get_width();
				}
			}
			this.set_width(this.get_width() + realWidth);
		},
		$getStaveTrackGroup: function(track) {
			var $t1 = this.get_staves();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var g = $t1[$t2];
				if (ss.referenceEquals(g.get_track(), track)) {
					return g;
				}
			}
			return null;
		},
		addStave: function(track, stave) {
			var group = this.$getStaveTrackGroup(track);
			if (ss.isNullOrUndefined(group)) {
				group = new $AlphaTab_Rendering_Staves_StaveTrackGroup(this, track);
				ss.add(this.get_staves(), group);
			}
			stave.set_staveTrackGroup(group);
			stave.set_staveGroup(this);
			stave.set_index(this.$_allStaves.length);
			ss.add(this.$_allStaves, stave);
			ss.add(group.get_staves(), stave);
			if (stave.get_isInAccolade()) {
				if (ss.isNullOrUndefined(this.$_firstStaveInAccolade)) {
					this.$_firstStaveInAccolade = stave;
					stave.set_isFirstInAccolade(true);
				}
				if (ss.isNullOrUndefined(group.get_firstStaveInAccolade())) {
					group.set_firstStaveInAccolade(stave);
				}
				if (ss.isNullOrUndefined(this.$_lastStaveInAccolade)) {
					this.$_lastStaveInAccolade = stave;
					stave.set_isLastInAccolade(true);
				}
				if (ss.isValue(this.$_lastStaveInAccolade)) {
					this.$_lastStaveInAccolade.set_isLastInAccolade(false);
				}
				this.$_lastStaveInAccolade = stave;
				this.$_lastStaveInAccolade.set_isLastInAccolade(true);
				group.set_lastStaveInAccolade(stave);
			}
		},
		get_height: function() {
			return this.$_allStaves[this.$_allStaves.length - 1].get_y() + this.$_allStaves[this.$_allStaves.length - 1].get_height();
		},
		revertLastBar: function() {
			if (this.get_masterBars().length > 1) {
				ss.removeAt(this.get_masterBars(), this.get_masterBars().length - 1);
				var w = 0;
				for (var $t1 = 0; $t1 < this.$_allStaves.length; $t1++) {
					var s = this.$_allStaves[$t1];
					w = Math.max(w, s.get_barRenderers()[s.get_barRenderers().length - 1].get_width());
					s.revertLastBar();
				}
				this.set_width(this.get_width() - w);
			}
		},
		applyBarSpacing: function(spacing) {
			for (var $t1 = 0; $t1 < this.$_allStaves.length; $t1++) {
				var s = this.$_allStaves[$t1];
				s.applyBarSpacing(spacing);
			}
			this.set_width(this.get_width() + this.get_masterBars().length * spacing);
		},
		paint: function(cx, cy, canvas) {
			for (var $t1 = 0; $t1 < this.$_allStaves.length; $t1++) {
				var s = this.$_allStaves[$t1];
				s.paint(cx + this.get_x(), cy + this.get_y(), canvas);
			}
			var res = this.get_layout().get_renderer().get_renderingResources();
			if (this.get_staves().length > 0) {
				//
				// Draw start grouping
				// 
				if (ss.isValue(this.$_firstStaveInAccolade) && ss.isValue(this.$_lastStaveInAccolade)) {
					//
					// draw grouping line for all staves
					//
					var firstStart = cy + this.get_y() + this.$_firstStaveInAccolade.get_y() + this.$_firstStaveInAccolade.get_staveTop() + this.$_firstStaveInAccolade.get_topSpacing() + this.$_firstStaveInAccolade.get_topOverflow();
					var lastEnd = cy + this.get_y() + this.$_lastStaveInAccolade.get_y() + this.$_lastStaveInAccolade.get_topSpacing() + this.$_lastStaveInAccolade.get_topOverflow() + this.$_lastStaveInAccolade.get_staveBottom();
					var acooladeX = cx + this.get_x() + this.$_firstStaveInAccolade.get_x();
					canvas.set_color(res.get_barSeperatorColor());
					canvas.beginPath();
					canvas.moveTo(acooladeX, firstStart);
					canvas.lineTo(acooladeX, lastEnd);
					canvas.stroke();
				}
				//
				// Draw accolade for each track group
				// 
				canvas.set_font(res.get_effectFont());
				var $t2 = this.get_staves();
				for (var $t3 = 0; $t3 < $t2.length; $t3++) {
					var g = $t2[$t3];
					var firstStart1 = cy + this.get_y() + g.get_firstStaveInAccolade().get_y() + g.get_firstStaveInAccolade().get_staveTop() + g.get_firstStaveInAccolade().get_topSpacing() + g.get_firstStaveInAccolade().get_topOverflow();
					var lastEnd1 = cy + this.get_y() + g.get_lastStaveInAccolade().get_y() + g.get_lastStaveInAccolade().get_topSpacing() + g.get_lastStaveInAccolade().get_topOverflow() + g.get_lastStaveInAccolade().get_staveBottom();
					var acooladeX1 = cx + this.get_x() + g.get_firstStaveInAccolade().get_x();
					var barSize = ss.Int32.trunc(3 * this.get_layout().get_renderer().get_settings().get_scale());
					var barOffset = barSize;
					var accoladeStart = firstStart1 - barSize * 4;
					var accoladeEnd = lastEnd1 + barSize * 4;
					// text
					if (this.get_index() === 0) {
						canvas.fillText(g.get_track().get_shortName(), cx + this.get_x() + 10 * this.get_layout().get_scale(), firstStart1);
					}
					// rect
					canvas.fillRect(acooladeX1 - barOffset - barSize, accoladeStart, barSize, accoladeEnd - accoladeStart);
					var spikeStartX = acooladeX1 - barOffset - barSize;
					var spikeEndX = acooladeX1 + barSize * 2;
					// top spike
					canvas.beginPath();
					canvas.moveTo(spikeStartX, accoladeStart);
					canvas.bezierCurveTo(spikeStartX, accoladeStart, spikeStartX, accoladeStart, spikeEndX, accoladeStart - barSize);
					canvas.bezierCurveTo(acooladeX1, accoladeStart + barSize, spikeStartX, accoladeStart + barSize, spikeStartX, accoladeStart + barSize);
					canvas.closePath();
					canvas.fill();
					// bottom spike 
					canvas.beginPath();
					canvas.moveTo(spikeStartX, accoladeEnd);
					canvas.bezierCurveTo(spikeStartX, accoladeEnd, acooladeX1, accoladeEnd, spikeEndX, accoladeEnd + barSize);
					canvas.bezierCurveTo(acooladeX1, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize, spikeStartX, accoladeEnd - barSize);
					canvas.closePath();
					canvas.fill();
				}
			}
		},
		finalizeGroup: function(scoreLayout) {
			var currentY = 0;
			for (var i = 0; i < this.$_allStaves.length; i++) {
				this.$_allStaves[i].set_x(this.get_accoladeSpacing());
				this.$_allStaves[i].set_y(ss.Int32.trunc(currentY));
				this.$_allStaves[i].finalizeStave(scoreLayout);
				currentY += this.$_allStaves[i].get_height();
			}
		},
		buildBoundingsLookup: function(lookup) {
			var visualTop = this.get_y() + this.$_firstStaveInAccolade.get_y();
			var visualBottom = this.get_y() + this.$_lastStaveInAccolade.get_y() + this.$_lastStaveInAccolade.get_height();
			var realTop = this.get_y() + this.$_allStaves[0].get_y();
			var realBottom = this.get_y() + this.$_allStaves[this.$_allStaves.length - 1].get_y() + this.$_allStaves[this.$_allStaves.length - 1].get_height();
			var visualHeight = visualBottom - visualTop;
			var realHeight = realBottom - realTop;
			var $t1 = this.$_firstStaveInAccolade.get_barRenderers();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var b = $t1[$t2];
				b.buildBoundingsLookup(lookup, visualTop, visualHeight, realTop, realHeight, this.get_x());
			}
		}
	});
	ss.initClass($AlphaTab_Rendering_Staves_StaveTrackGroup, $asm, {
		get_track: function() {
			return this.$1$TrackField;
		},
		set_track: function(value) {
			this.$1$TrackField = value;
		},
		get_staveGroup: function() {
			return this.$1$StaveGroupField;
		},
		set_staveGroup: function(value) {
			this.$1$StaveGroupField = value;
		},
		get_staves: function() {
			return this.$1$StavesField;
		},
		set_staves: function(value) {
			this.$1$StavesField = value;
		},
		get_firstStaveInAccolade: function() {
			return this.$1$FirstStaveInAccoladeField;
		},
		set_firstStaveInAccolade: function(value) {
			this.$1$FirstStaveInAccoladeField = value;
		},
		get_lastStaveInAccolade: function() {
			return this.$1$LastStaveInAccoladeField;
		},
		set_lastStaveInAccolade: function(value) {
			this.$1$LastStaveInAccoladeField = value;
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_AccidentalHelper, $asm, {
		applyAccidental: function(note, noteLine) {
			// TODO: we need to check for note.swapAccidentals 
			var noteValue = note.get_realValue();
			var ks = note.get_beat().get_voice().get_bar().get_masterBar().get_keySignature();
			var ksi = ks + 7;
			var index = noteValue % 12;
			//var octave = (noteValue / 12);
			var accidentalToSet = $AlphaTab_Rendering_Utils_AccidentalHelper.$accidentalNotes[ksi][index];
			// if there is already an accidental registered, we check if we 
			// have a new accidental
			var updateAccidental = true;
			if (this.$_registeredAccidentals.containsKey(noteLine)) {
				var registeredAccidental = this.$_registeredAccidentals.get_item(noteLine);
				// we only need to do anything if we are changing the accidental
				if (registeredAccidental === accidentalToSet) {
					// we set the accidental to none, as the accidental is already set by a previous note
					accidentalToSet = 0;
					updateAccidental = false;
				}
				else if (accidentalToSet === 0) {
					accidentalToSet = 1;
				}
			}
			if (updateAccidental) {
				if (accidentalToSet === 0 || accidentalToSet === 1) {
					this.$_registeredAccidentals.remove(noteLine);
				}
				else {
					this.$_registeredAccidentals.set_item(noteLine, accidentalToSet);
				}
			}
			return accidentalToSet;
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_BarBoundings, $asm, {
		get_isFirstOfLine: function() {
			return this.$1$IsFirstOfLineField;
		},
		set_isFirstOfLine: function(value) {
			this.$1$IsFirstOfLineField = value;
		},
		get_isLastOfLine: function() {
			return this.$1$IsLastOfLineField;
		},
		set_isLastOfLine: function(value) {
			this.$1$IsLastOfLineField = value;
		},
		get_bar: function() {
			return this.$1$BarField;
		},
		set_bar: function(value) {
			this.$1$BarField = value;
		},
		get_bounds: function() {
			return this.$1$BoundsField;
		},
		set_bounds: function(value) {
			this.$1$BoundsField = value;
		},
		get_visualBounds: function() {
			return this.$1$VisualBoundsField;
		},
		set_visualBounds: function(value) {
			this.$1$VisualBoundsField = value;
		},
		get_beats: function() {
			return this.$1$BeatsField;
		},
		set_beats: function(value) {
			this.$1$BeatsField = value;
		},
		findBeatAtPos: function(x) {
			var index = 0;
			// move right as long we didn't pass our x-pos
			while (index < this.get_beats().length - 1 && x > this.get_beats()[index].get_bounds().get_x() + this.get_beats()[index].get_bounds().get_w()) {
				index++;
			}
			return this.get_beats()[index].get_beat();
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_BarHelpers, $asm, {
		get_beamHelpers: function() {
			return this.$1$BeamHelpersField;
		},
		set_beamHelpers: function(value) {
			this.$1$BeamHelpersField = value;
		},
		get_beamHelperLookup: function() {
			return this.$1$BeamHelperLookupField;
		},
		set_beamHelperLookup: function(value) {
			this.$1$BeamHelperLookupField = value;
		},
		get_tupletHelpers: function() {
			return this.$1$TupletHelpersField;
		},
		set_tupletHelpers: function(value) {
			this.$1$TupletHelpersField = value;
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_BarHelpersGroup, $asm, {
		get_helpers: function() {
			return this.$1$HelpersField;
		},
		set_helpers: function(value) {
			this.$1$HelpersField = value;
		},
		buildHelpers: function(tracks, barIndex) {
			for (var $t1 = 0; $t1 < tracks.length; $t1++) {
				var t = tracks[$t1];
				var h;
				if (!this.get_helpers().containsKey(t.get_index())) {
					h = new (ss.makeGenericType(ss.Dictionary$2, [ss.Int32, $AlphaTab_Rendering_Utils_BarHelpers]))();
					this.get_helpers().set_item(t.get_index(), h);
				}
				else {
					h = this.get_helpers().get_item(t.get_index());
				}
				if (!h.containsKey(barIndex)) {
					h.set_item(barIndex, new $AlphaTab_Rendering_Utils_BarHelpers(t.get_bars()[barIndex]));
				}
			}
		}
	});
	ss.initEnum($AlphaTab_Rendering_Utils_BeamBarType, $asm, { full: 0, partLeft: 1, partRight: 2 });
	ss.initEnum($AlphaTab_Rendering_Utils_BeamDirection, $asm, { up: 0, down: 1 });
	ss.initClass($AlphaTab_Rendering_Utils_BeamingHelper, $asm, {
		get_voice: function() {
			return this.$1$VoiceField;
		},
		set_voice: function(value) {
			this.$1$VoiceField = value;
		},
		get_beats: function() {
			return this.$1$BeatsField;
		},
		set_beats: function(value) {
			this.$1$BeatsField = value;
		},
		get_maxDuration: function() {
			return this.$1$MaxDurationField;
		},
		set_maxDuration: function(value) {
			this.$1$MaxDurationField = value;
		},
		get_firstMinNote: function() {
			return this.$1$FirstMinNoteField;
		},
		set_firstMinNote: function(value) {
			this.$1$FirstMinNoteField = value;
		},
		get_firstMaxNote: function() {
			return this.$1$FirstMaxNoteField;
		},
		set_firstMaxNote: function(value) {
			this.$1$FirstMaxNoteField = value;
		},
		get_lastMinNote: function() {
			return this.$1$LastMinNoteField;
		},
		set_lastMinNote: function(value) {
			this.$1$LastMinNoteField = value;
		},
		get_lastMaxNote: function() {
			return this.$1$LastMaxNoteField;
		},
		set_lastMaxNote: function(value) {
			this.$1$LastMaxNoteField = value;
		},
		get_minNote: function() {
			return this.$1$MinNoteField;
		},
		set_minNote: function(value) {
			this.$1$MinNoteField = value;
		},
		get_maxNote: function() {
			return this.$1$MaxNoteField;
		},
		set_maxNote: function(value) {
			this.$1$MaxNoteField = value;
		},
		$getValue: function(n) {
			if (this.$_track.get_isPercussion()) {
				return $AlphaTab_Rendering_Utils_PercussionMapper.mapValue(n);
			}
			else {
				return n.get_realValue();
			}
		},
		getBeatLineX: function(beat) {
			if (this.hasBeatLineX(beat)) {
				if (this.get_direction() === 0) {
					return this.$_beatLineXPositions.get_item(beat.get_index()).get_up();
				}
				return this.$_beatLineXPositions.get_item(beat.get_index()).get_down();
			}
			return 0;
		},
		hasBeatLineX: function(beat) {
			return this.$_beatLineXPositions.containsKey(beat.get_index());
		},
		registerBeatLineX: function(beat, up, down) {
			this.$_beatLineXPositions.set_item(beat.get_index(), new $AlphaTab_Rendering_Utils_BeatLinePositions(up, down));
		},
		get_direction: function() {
			// multivoice handling
			// the average key is used for determination
			//      key lowerequal than middle line -> up
			//      key higher than middle line -> down
			var avg = ss.Int32.div(this.$getValue(this.get_maxNote()) + this.$getValue(this.get_minNote()), 2);
			return ((avg <= $AlphaTab_Rendering_Utils_BeamingHelper.$scoreMiddleKeys[this.$_lastBeat.get_voice().get_bar().get_clef() - 1]) ? 0 : 1);
		},
		checkBeat: function(beat) {
			if (ss.isNullOrUndefined(this.get_voice())) {
				this.set_voice(beat.get_voice());
			}
			// allow adding if there are no beats yet
			var add = false;
			if (this.get_beats().length === 0) {
				add = true;
			}
			else if ($AlphaTab_Rendering_Utils_BeamingHelper.$canJoin(this.$_lastBeat, beat)) {
				add = true;
			}
			if (add) {
				this.$_lastBeat = beat;
				ss.add(this.get_beats(), beat);
				this.$checkNote(beat.get_minNote());
				this.$checkNote(beat.get_maxNote());
				if (this.get_maxDuration() < beat.get_duration()) {
					this.set_maxDuration(beat.get_duration());
				}
			}
			return add;
		},
		$checkNote: function(note) {
			var value = this.$getValue(note);
			// detect the smallest note which is at the beginning of this group
			if (ss.isNullOrUndefined(this.get_firstMinNote()) || note.get_beat().get_start() < this.get_firstMinNote().get_beat().get_start()) {
				this.set_firstMinNote(note);
			}
			else if (note.get_beat().get_start() === this.get_firstMinNote().get_beat().get_start()) {
				if (value < this.$getValue(this.get_firstMinNote())) {
					this.set_firstMinNote(note);
				}
			}
			// detect the biggest note which is at the beginning of this group
			if (ss.isNullOrUndefined(this.get_firstMaxNote()) || note.get_beat().get_start() < this.get_firstMaxNote().get_beat().get_start()) {
				this.set_firstMaxNote(note);
			}
			else if (note.get_beat().get_start() === this.get_firstMaxNote().get_beat().get_start()) {
				if (value > this.$getValue(this.get_firstMaxNote())) {
					this.set_firstMaxNote(note);
				}
			}
			// detect the smallest note which is at the end of this group
			if (ss.isNullOrUndefined(this.get_lastMinNote()) || note.get_beat().get_start() > this.get_lastMinNote().get_beat().get_start()) {
				this.set_lastMinNote(note);
			}
			else if (note.get_beat().get_start() === this.get_lastMinNote().get_beat().get_start()) {
				if (value < this.$getValue(this.get_lastMinNote())) {
					this.set_lastMinNote(note);
				}
			}
			// detect the biggest note which is at the end of this group
			if (ss.isNullOrUndefined(this.get_lastMaxNote()) || note.get_beat().get_start() > this.get_lastMaxNote().get_beat().get_start()) {
				this.set_lastMaxNote(note);
			}
			else if (note.get_beat().get_start() === this.get_lastMaxNote().get_beat().get_start()) {
				if (value > this.$getValue(this.get_lastMaxNote())) {
					this.set_lastMaxNote(note);
				}
			}
			if (ss.isNullOrUndefined(this.get_maxNote()) || value > this.$getValue(this.get_maxNote())) {
				this.set_maxNote(note);
			}
			if (ss.isNullOrUndefined(this.get_minNote()) || value < this.$getValue(this.get_minNote())) {
				this.set_minNote(note);
			}
		},
		calculateBeamY: function(stemSize, xCorrection, xPosition, scale, yPosition) {
			// create a line between the min and max note of the group
			var direction = this.get_direction();
			if (this.get_beats().length === 1) {
				if (direction === 0) {
					return yPosition(this.get_maxNote()) - stemSize;
				}
				return yPosition(this.get_minNote()) + stemSize;
			}
			// we use the min/max notes to place the beam along their real position        
			// we only want a maximum of 10 offset for their gradient
			var maxDistance = 10 * scale;
			// if the min note is not first or last, we can align notes directly to the position
			// of the min note
			if (direction === 1 && !ss.referenceEquals(this.get_minNote(), this.get_firstMinNote()) && !ss.referenceEquals(this.get_minNote(), this.get_lastMinNote())) {
				return yPosition(this.get_minNote()) + stemSize;
			}
			if (direction === 0 && !ss.referenceEquals(this.get_maxNote(), this.get_firstMaxNote()) && !ss.referenceEquals(this.get_maxNote(), this.get_lastMaxNote())) {
				return yPosition(this.get_maxNote()) - stemSize;
			}
			var startX = this.getBeatLineX(this.get_firstMinNote().get_beat()) + xCorrection;
			var startY = ((direction === 0) ? (yPosition(this.get_firstMaxNote()) - stemSize) : (yPosition(this.get_firstMinNote()) + stemSize));
			var endX = this.getBeatLineX(this.get_lastMaxNote().get_beat()) + xCorrection;
			var endY = ((direction === 0) ? (yPosition(this.get_lastMaxNote()) - stemSize) : (yPosition(this.get_lastMinNote()) + stemSize));
			// ensure the maxDistance
			if (direction === 1 && startY > endY && startY - endY > maxDistance) {
				endY = startY - maxDistance;
			}
			if (direction === 1 && endY > startY && endY - startY > maxDistance) {
				startY = endY - maxDistance;
			}
			if (direction === 0 && startY < endY && endY - startY > maxDistance) {
				endY = startY + maxDistance;
			}
			if (direction === 0 && endY < startY && startY - endY > maxDistance) {
				startY = endY + maxDistance;
			}
			// get the y position of the given beat on this curve
			// y(x)  = ( (y2 - y1) / (x2 - x1) )  * (x - x1) + y1;
			return ss.Int32.trunc((endY - startY) / (endX - startX) * (xPosition - startX) + startY);
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_BeatBoundings, $asm, {
		get_beat: function() {
			return this.$1$BeatField;
		},
		set_beat: function(value) {
			this.$1$BeatField = value;
		},
		get_bounds: function() {
			return this.$1$BoundsField;
		},
		set_bounds: function(value) {
			this.$1$BoundsField = value;
		},
		get_visualBounds: function() {
			return this.$1$VisualBoundsField;
		},
		set_visualBounds: function(value) {
			this.$1$VisualBoundsField = value;
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_BeatLinePositions, $asm, {
		get_up: function() {
			return this.$1$UpField;
		},
		set_up: function(value) {
			this.$1$UpField = value;
		},
		get_down: function() {
			return this.$1$DownField;
		},
		set_down: function(value) {
			this.$1$DownField = value;
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_BoundingsLookup, $asm, {
		get_bars: function() {
			return this.$1$BarsField;
		},
		set_bars: function(value) {
			this.$1$BarsField = value;
		},
		getBeatAtPos: function(x, y) {
			//
			// find a bar which matches in y-axis
			var bottom = 0;
			var top = this.get_bars().length - 1;
			var barIndex = -1;
			while (bottom <= top) {
				var middle = ss.Int32.div(top + bottom, 2);
				var bar = this.get_bars()[middle];
				// found?
				if (y >= bar.get_bounds().get_y() && y <= bar.get_bounds().get_y() + bar.get_bounds().get_h()) {
					barIndex = middle;
					break;
				}
				// search in lower half 
				if (y < bar.get_bounds().get_y()) {
					top = middle - 1;
				}
				else {
					bottom = middle + 1;
				}
			}
			// no bar found
			if (barIndex === -1) {
				return null;
			}
			// 
			// Find the matching bar in the row
			var currentBar = this.get_bars()[barIndex];
			// clicked before bar
			if (x < currentBar.get_bounds().get_x()) {
				// we move left till we either pass our x-position or are at the beginning of the line/score
				while (barIndex > 0 && x < this.get_bars()[barIndex].get_bounds().get_x() && !this.get_bars()[barIndex].get_isFirstOfLine()) {
					barIndex--;
				}
			}
			else {
				// we move right till we either pass our our x-position or are at the end of the line/score
				while (barIndex < this.get_bars().length - 1 && x > this.get_bars()[barIndex].get_bounds().get_x() + this.get_bars()[barIndex].get_bounds().get_w() && !this.get_bars()[barIndex].get_isLastOfLine()) {
					barIndex++;
				}
			}
			// 
			// Find the matching beat within the bar
			return this.get_bars()[barIndex].findBeatAtPos(x);
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_Bounds, $asm, {
		get_x: function() {
			return this.$1$XField;
		},
		set_x: function(value) {
			this.$1$XField = value;
		},
		get_y: function() {
			return this.$1$YField;
		},
		set_y: function(value) {
			this.$1$YField = value;
		},
		get_w: function() {
			return this.$1$WField;
		},
		set_w: function(value) {
			this.$1$WField = value;
		},
		get_h: function() {
			return this.$1$HField;
		},
		set_h: function(value) {
			this.$1$HField = value;
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_PercussionMapper, $asm, {});
	ss.initClass($AlphaTab_Rendering_Utils_SvgPathParser, $asm, {
		get_svg: function() {
			return this.$1$SvgField;
		},
		set_svg: function(value) {
			this.$1$SvgField = value;
		},
		get_lastCommand: function() {
			return this.$1$LastCommandField;
		},
		set_lastCommand: function(value) {
			this.$1$LastCommandField = value;
		},
		get_currentToken: function() {
			return this.$1$CurrentTokenField;
		},
		set_currentToken: function(value) {
			this.$1$CurrentTokenField = value;
		},
		reset: function() {
			this.$_currentIndex = 0;
			this.nextToken();
		},
		get_eof: function() {
			return this.$_currentIndex >= this.get_svg().length;
		},
		getString: function() {
			var t = this.get_currentToken();
			this.nextToken();
			return t;
		},
		getNumber: function() {
			return parseInt(this.getString());
		},
		get_currentTokenIsNumber: function() {
			return $AlphaTab_Rendering_Utils_SvgPathParser.$isStringNumber(this.get_currentToken(), true);
		},
		nextChar: function() {
			if (this.get_eof()) {
				return 0;
			}
			return this.get_svg().charCodeAt(this.$_currentIndex++);
		},
		peekChar: function() {
			if (this.get_eof()) {
				return 0;
			}
			return this.get_svg().charCodeAt(this.$_currentIndex);
		},
		nextToken: function() {
			var token = new ss.StringBuilder();
			var c;
			var skipChar;
			// skip leading spaces and separators
			do {
				c = this.nextChar();
				skipChar = $AlphaTab_Rendering_Utils_SvgPathParser.$isWhiteSpace(c) || c === 44;
			} while (!this.get_eof() && skipChar);
			// read token itself 
			if (!this.get_eof() || !skipChar) {
				token.appendChar(c);
				if ($AlphaTab_Rendering_Utils_SvgPathParser.$isCharNumber(c, true)) {
					c = this.peekChar();
					// get first upcoming character
					while (!this.get_eof() && ($AlphaTab_Rendering_Utils_SvgPathParser.$isCharNumber(c, false) || c === 46)) {
						token.appendChar(this.nextChar());
						// peek next character for check
						c = this.peekChar();
					}
				}
				else {
					this.set_lastCommand(token.toString());
				}
			}
			this.set_currentToken(token.toString());
		}
	});
	ss.initClass($AlphaTab_Rendering_Utils_TupletHelper, $asm, {
		get_beats: function() {
			return this.$1$BeatsField;
		},
		set_beats: function(value) {
			this.$1$BeatsField = value;
		},
		get_voiceIndex: function() {
			return this.$1$VoiceIndexField;
		},
		set_voiceIndex: function(value) {
			this.$1$VoiceIndexField = value;
		},
		get_tuplet: function() {
			return this.$1$TupletField;
		},
		set_tuplet: function(value) {
			this.$1$TupletField = value;
		},
		get_isFull: function() {
			return this.get_beats().length === this.get_tuplet();
		},
		finish: function() {
			this.$_isFinished = true;
		},
		check: function(beat) {
			if (this.get_beats().length === 0) {
				this.set_tuplet(beat.get_tupletNumerator());
			}
			else if (beat.get_voice().get_index() !== this.get_voiceIndex() || beat.get_tupletNumerator() !== this.get_tuplet() || this.get_isFull() || this.$_isFinished) {
				return false;
			}
			ss.add(this.get_beats(), beat);
			return true;
		}
	});
	ss.setMetadata($AlphaTab_Platform_Model_FontStyle, { enumFlags: true });
	ss.setMetadata($AlphaTab_Rendering_Layout_HeaderFooterElements, { enumFlags: true });
	$AlphaTab_Platform_Svg_FontSizes.timesNewRoman = new $AlphaTab_IO_ByteArray([3, 4, 5, 6, 6, 9, 9, 2, 4, 4, 6, 6, 3, 4, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 6, 5, 10, 8, 7, 7, 8, 7, 6, 7, 8, 4, 4, 8, 7, 10, 8, 8, 7, 8, 7, 5, 8, 8, 7, 11, 8, 8, 7, 4, 3, 4, 5, 6, 4, 5, 5, 5, 5, 5, 4, 5, 6, 3, 3, 6, 3, 9, 6, 6, 6, 5, 4, 4, 4, 5, 6, 7, 6, 6, 5, 5, 2, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 6, 6, 6, 6, 2, 5, 4, 8, 4, 6, 6, 0, 8, 6, 4, 6, 3, 3, 4, 5, 5, 4, 4, 3, 3, 6, 8, 8, 8, 5, 8, 8, 8, 8, 8, 8, 11, 7, 7, 7, 7, 7, 4, 4, 4, 4, 8, 8, 8, 8, 8, 8, 8, 6, 8, 8, 8, 8, 8, 8, 6, 5, 5, 5, 5, 5, 5, 5, 8, 5, 5, 5, 5, 5, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 6, 6]);
	$AlphaTab_Platform_Svg_FontSizes.arial11Pt = new $AlphaTab_IO_ByteArray([3, 2, 4, 6, 6, 10, 7, 2, 4, 4, 4, 6, 3, 4, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 11, 8, 7, 7, 7, 6, 6, 8, 7, 2, 5, 7, 6, 8, 7, 8, 6, 8, 7, 7, 6, 7, 8, 10, 7, 8, 7, 3, 3, 3, 5, 6, 4, 6, 6, 6, 6, 6, 4, 6, 6, 2, 2, 5, 2, 8, 6, 6, 6, 6, 4, 6, 3, 6, 6, 10, 6, 6, 6, 4, 2, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 6, 6, 7, 6, 2, 6, 4, 8, 4, 6, 6, 0, 8, 6, 4, 6, 4, 4, 4, 6, 6, 4, 4, 4, 5, 6, 9, 10, 10, 6, 8, 8, 8, 8, 8, 8, 11, 7, 6, 6, 6, 6, 2, 2, 2, 2, 8, 7, 8, 8, 8, 8, 8, 6, 8, 7, 7, 7, 7, 8, 7, 7, 6, 6, 6, 6, 6, 6, 10, 6, 6, 6, 6, 6, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]);
	$AlphaTab_Platform_Svg_FontSizes.controlChars = 32;
	$AlphaTab_Model_Tuning.tuningRegex = new RegExp('([a-g]b?)([0-9])', 'i');
	$AlphaTab_Model_Tuning.$_sevenStrings = null;
	$AlphaTab_Model_Tuning.$_sixStrings = null;
	$AlphaTab_Model_Tuning.$_fiveStrings = null;
	$AlphaTab_Model_Tuning.$_fourStrings = null;
	$AlphaTab_Audio_MidiUtils.quarterTime = 960;
	$AlphaTab_Audio_MidiUtils.percussionChannel = 9;
	$AlphaTab_Audio_MidiUtils.$minVelocity = 15;
	$AlphaTab_Audio_MidiUtils.$velocityIncrement = 16;
	$AlphaTab_Rendering_Utils_BeamingHelper.$scoreMiddleKeys = [48, 45, 38, 59];
	$AlphaTab_Rendering_Staves_StaveGroup.$accoladeLabelSpacing = 10;
	$AlphaTab_Rendering_Glyphs_VoiceContainerGlyph.keySizeBeat = 'Beat';
	$AlphaTab_Rendering_GroupedBarRenderer.keySizePre = 'Pre';
	$AlphaTab_Rendering_GroupedBarRenderer.keySizePost = 'Post';
	$AlphaTab_Rendering_Glyphs_MusicFont.clefF = new $AlphaTab_Rendering_Glyphs_LazySvg('M 545 -801c -53 49 -80 109 -80 179c 0 33 4 66 12 99c 8 33 38 57 89 74c 51 16 125 31 220 43c 95 12 159 53 192 124c 16 37 24 99 24 186c 0 95 -43 168 -130 220c -86 51 -186 77 -297 77c -128 0 -229 -28 -303 -86c -91 -70 -136 -169 -136 -297c 0 -115 23 -234 71 -356c 47 -121 118 -234 213 -337c 70 -74 163 -129 279 -164c 115 -35 233 -52 353 -52c 45 0 83 1 114 3c 31 2 81 9 151 21c 243 45 444 175 601 390c 144 198 217 409 217 632c 0 41 -2 72 -6 93c -33 281 -219 582 -558 905c -272 260 -591 493 -954 700c -330 190 -527 274 -589 254l -18 -68c 95 -33 197 -78 306 -136c 109 -57 218 -124 325 -198c 276 -198 477 -384 601 -558c 152 -210 252 -471 297 -781c 20 -128 31 -210 31 -248s 0 -68 0 -93c 0 -322 -109 -551 -328 -688c -99 -57 -200 -86 -303 -86c -78 0 -154 15 -226 46C 643 -873 586 -838 545 -801zM 2517 -783c 66 0 121 22 167 68c 45 45 68 101 68 167c 0 66 -22 121 -68 167c -45 45 -101 68 -167 68c -66 0 -122 -22 -167 -68c -45 -45 -68 -101 -68 -167c 0 -66 22 -121 68 -167C 2395 -760 2451 -783 2517 -783zM 2517 54c 66 0 121 22 167 68c 45 45 68 101 68 167c 0 66 -22 121 -68 167c -45 45 -101 68 -167 68c -66 0 -122 -22 -167 -68c -45 -45 -68 -101 -68 -167c 0 -66 22 -121 68 -167C 2395 77 2451 54 2517 54');
	$AlphaTab_Rendering_Glyphs_MusicFont.clefC = new $AlphaTab_Rendering_Glyphs_LazySvg('M 26 1736V -1924h 458v 3659H 26zM 641 1736V -1924h 150v 3659H 641zM 1099 153c -42 -53 -86 -100 -130 -140c -44 -40 -95 -75 -153 -106c 106 -58 200 -135 279 -233c 110 -135 180 -289 208 -460c 17 127 46 216 87 266c 65 73 170 110 313 110c 150 0 259 -81 324 -244c 50 -124 75 -291 75 -500c 0 -197 -25 -355 -75 -471c -69 -155 -179 -232 -330 -232c -89 0 -167 18 -234 55c -67 36 -101 72 -101 107c 0 19 23 25 69 17c 46 -7 97 6 153 43c 56 36 84 89 84 159c 0 69 -23 125 -69 168c -46 42 -108 63 -185 63c -73 0 -138 -24 -194 -72c -56 -48 -84 -105 -84 -171c 0 -112 56 -212 168 -301c 127 -100 282 -150 463 -150c 228 0 412 74 553 224c 141 149 211 334 211 555c 0 248 -86 458 -258 631c -172 172 -381 259 -629 259c -57 0 -104 -3 -139 -11c -54 -19 -98 -34 -133 -46c -15 49 -48 99 -98 149c -11 15 -48 43 -110 85c 38 19 75 52 110 99c 50 50 88 105 115 164c 65 -31 113 -50 142 -57c 28 -7 70 -11 124 -11c 247 0 457 85 629 257c 172 171 258 380 258 627c 0 211 -73 390 -219 534c -146 144 -332 216 -558 216c -183 0 -334 -47 -453 -142c -118 -94 -178 -198 -178 -310c 0 -69 28 -128 84 -176c 56 -48 120 -72 194 -72c 69 0 129 23 179 69c 50 46 75 104 75 174c 0 65 -28 116 -84 153c -56 36 -107 51 -153 43c -46 -7 -69 0 -69 23c 0 27 35 60 106 101c 70 40 147 60 229 60c 153 0 265 -77 335 -231c 51 -112 76 -268 76 -469c 0 -201 -25 -363 -75 -487c -65 -166 -172 -249 -319 -249c -143 0 -242 30 -298 92c -56 61 -93 156 -113 284C 1279 435 1211 286 1099 153');
	$AlphaTab_Rendering_Glyphs_MusicFont.restThirtySecond = new $AlphaTab_Rendering_Glyphs_LazySvg('M 717 -2195c 93 -30 174 -104 244 -220c 38 -65 65 -127 81 -185l 140 -604c -69 128 -196 191 -381 191c -50 0 -105 -7 -167 -23c -61 -15 -113 -46 -155 -92c -42 -46 -63 -108 -63 -185c 0 -65 23 -121 69 -168s 104 -69 173 -69c 65 0 123 25 173 75c 50 50 75 104 75 162c 0 31 -7 63 -23 98c -15 34 -44 63 -86 87c 23 11 48 21 75 28c 7 0 27 -3 57 -11c 73 -23 142 -80 208 -170c 57 -90 115 -180 173 -270h 40l -816 3503l -107 0l 318 -1316c -73 128 -196 192 -369 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -104 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -86 87c 46 15 71 23 74 23c 7 0 26 -3 57 -11c 92 -27 178 -108 259 -243c 11 -19 26 -50 46 -93l 161 -667c -73 128 -198 192 -375 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174s 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98s -44 65 -86 92c 23 7 46 15 69 23C 665 -2184 686 -2187 717 -2195');
	$AlphaTab_Rendering_Glyphs_MusicFont.restQuarter = new $AlphaTab_Rendering_Glyphs_LazySvg('M 272 -1668L 979 -850c -54 23 -137 114 -249 272c -127 177 -191 313 -191 405c 0 112 36 226 110 342c 73 115 160 206 260 272l -34 81c -23 -3 -56 -7 -101 -11c -44 -3 -76 -5 -95 -5c -104 0 -182 9 -234 28c -52 19 -88 45 -110 78c -21 32 -31 70 -31 113c 0 81 42 175 127 284c 69 88 115 137 139 145l -28 46c -27 7 -123 -61 -289 -208c -185 -162 -278 -299 -278 -411c 0 -92 35 -168 107 -226c 71 -57 159 -87 263 -87c 54 0 109 7 165 23c 55 15 110 42 165 81l -642 -829c 54 -30 120 -107 199 -229c 79 -121 139 -238 182 -350c 7 -15 11 -42 11 -81c 0 -92 -44 -210 -133 -353c -73 -115 -121 -181 -144 -197H 272');
	$AlphaTab_Rendering_Glyphs_MusicFont.graceUp = new $AlphaTab_Rendering_Glyphs_LazySvg('M 571 -1659h 53c 12 83 29 154 50 210c 21 56 46 105 74 145c 28 40 71 92 128 156c 56 63 102 118 138 162c 105 135 158 277 158 424c 0 151 -64 336 -193 554h -35c 16 -37 35 -82 57 -132s 40 -95 55 -136s 26 -81 35 -121s 12 -80 12 -119c 0 -62 -12 -125 -38 -188c -25 -63 -60 -121 -106 -175c -45 -53 -97 -97 -155 -130s -118 -51 -181 -55v 1245c 0 70 -21 134 -65 189c -43 55 -99 97 -167 127c -67 29 -135 44 -201 44c -64 0 -118 -16 -160 -48c -42 -32 -63 -79 -63 -140c 0 -65 21 -126 64 -181s 97 -99 163 -131c 65 -32 129 -48 191 -48c 85 0 147 16 184 50V -1082V -1659');
	$AlphaTab_Rendering_Glyphs_MusicFont.graceDown = new $AlphaTab_Rendering_Glyphs_LazySvg('M -17 335c 0 -69 23 -131 69 -186s 103 -98 173 -128c 69 -30 137 -45 203 -45c 133 0 203 63 211 189c 0 54 -21 110 -65 167c -43 56 -99 103 -168 139s -138 54 -208 54c -63 0 -118 -14 -164 -44v 1104c 90 -15 172 -50 244 -106s 128 -122 168 -200c 40 -78 60 -156 60 -233c -1 -91 -13 -169 -34 -233c -20 -64 -57 -155 -110 -272l 34 -13c 34 60 64 122 91 188c 27 65 48 131 64 199s 23 133 23 198c 0 96 -22 183 -68 259c -45 76 -113 166 -203 269c -89 103 -157 193 -203 271c -45 77 -68 165 -68 264h -50V 335');
	$AlphaTab_Rendering_Glyphs_MusicFont.trill = new $AlphaTab_Rendering_Glyphs_LazySvg('M 159 862l 148 -431h -291l 33 -97h 288l 61 -196l 190 -136h 56l -114 332c 40 0 100 -7 181 -22c 81 -15 143 -22 187 -22c 26 0 45 5 56 15c 11 10 16 29 16 57c 0 8 -3 37 -11 86c 72 -106 155 -160 246 -160c 72 8 110 50 114 126c 0 42 -9 73 -28 92s -40 28 -64 28c -48 0 -76 -29 -84 -87c 10 -22 16 -43 16 -64c 0 -11 -9 -17 -28 -17c -78 0 -147 86 -207 260l -131 406h -185l 34 -92c -21 9 -53 26 -94 51s -77 44 -108 58s -64 20 -100 20c -50 0 -95 -13 -133 -40c -38 -27 -59 -63 -61 -107c 1 -7 3 -18 5 -32S 157 867 159 862zM 658 837l 140 -412c 0 -4 0 -9 2 -16s 2 -10 2 -11c 0 -9 -7 -13 -22 -13c -34 0 -81 7 -140 21s -104 21 -136 21l -142 423c -6 23 -12 44 -17 64c 0 27 16 44 50 50C 444 958 532 916 658 837');
	$AlphaTab_Rendering_Glyphs_MusicFont.clefG = new $AlphaTab_Rendering_Glyphs_LazySvg('M 1431 -3070c 95 0 186 114 272 344c 86 229 129 434 129 612c 0 243 -36 471 -108 684c -103 300 -271 545 -504 735l 108 564c 68 -15 132 -22 193 -22c 284 0 504 109 659 329c 132 185 199 410 199 675c 0 204 -65 379 -195 525c -130 145 -299 243 -506 292l 154 816c 0 45 0 77 0 96c 0 152 -54 282 -162 390s -244 181 -407 219c -26 7 -62 11 -108 11c -155 0 -294 -62 -416 -188c -121 -125 -182 -252 -182 -381c 0 -22 1 -39 5 -51c 18 -106 64 -191 136 -253c 72 -62 161 -94 267 -94c 102 0 191 34 267 102c 76 68 113 152 113 250c 0 106 -35 198 -105 276c -70 77 -160 116 -270 116c -26 0 -45 0 -56 0c 42 36 82 63 120 82c 72 36 143 54 212 54c 114 0 235 -62 362 -187c 94 -98 142 -214 142 -347c 0 -19 -1 -55 -3 -108l -138 -776c -49 11 -104 19 -165 23c -61 3 -123 5 -188 5c -339 0 -635 -123 -886 -370c -251 -247 -377 -543 -377 -889c 0 -193 87 -429 262 -706c 117 -189 285 -402 501 -638c 159 -174 254 -271 285 -290c -19 -37 -44 -142 -77 -313c -32 -171 -52 -284 -59 -339c -7 -55 -11 -111 -11 -168c 0 -235 54 -475 163 -718C 1164 -2948 1289 -3070 1431 -3070zM 1247 -129l -96 -507c -41 30 -116 104 -222 222c -106 117 -190 216 -251 296c -110 140 -194 269 -251 387c -76 155 -114 307 -114 455c 0 79 11 159 34 239c 49 167 182 326 400 478c 175 121 360 182 554 182c 53 0 96 -3 127 -11c 30 -7 80 -23 150 -46l -281 -1343c -178 22 -312 106 -403 250c -72 113 -107 237 -107 370c 0 144 80 281 240 410c 137 110 248 165 332 165l -8 39c -106 -15 -227 -70 -364 -164c -186 -132 -298 -291 -336 -477c -11 -56 -17 -111 -17 -164c 0 -185 56 -351 168 -496C 911 12 1060 -83 1247 -129zM 1684 -2306c -19 -125 -34 -201 -46 -227c -34 -76 -92 -113 -172 -113c -76 0 -157 82 -241 247c -84 165 -143 344 -178 538c -7 49 -1 156 17 322c 19 165 36 272 52 322l 132 -113c 91 -45 197 -176 315 -393c 88 -159 132 -313 132 -461C 1695 -2213 1692 -2253 1684 -2306zM 1388 225l 262 1304c 157 -37 282 -114 375 -229c 92 -115 138 -250 138 -405c 0 -30 0 -52 0 -68c -19 -177 -93 -322 -224 -433c -130 -111 -281 -167 -453 -167C 1443 225 1411 225 1388 225');
	$AlphaTab_Rendering_Glyphs_MusicFont.num0 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 0 991c 0 -230 45 -422 135 -577c 104 -183 253 -275 448 -275c 187 0 333 91 437 275c 89 158 135 351 135 577c 0 230 -43 422 -129 577c -104 183 -252 275 -442 275c -187 0 -334 -91 -442 -275C 46 1411 0 1218 0 991zM 583 230c -100 0 -168 72 -202 218c -34 145 -51 326 -51 542c 0 270 23 464 70 583c 46 118 108 178 183 178c 93 0 162 -88 205 -264c 32 -133 48 -298 48 -496c 0 -273 -23 -468 -70 -585C 719 288 658 230 583 230');
	$AlphaTab_Rendering_Glyphs_MusicFont.num1 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 345 1688V 440l -216 410l -37 -32l 253 -685h 351v 1549c 0 32 27 57 81 75c 18 3 46 8 86 16v 75h -685v -70c 35 -7 62 -12 81 -16C 316 1745 345 1720 345 1688');
	$AlphaTab_Rendering_Glyphs_MusicFont.num2 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 427 257c -93 10 -153 37 -178 81c 7 14 14 27 21 37c 68 0 115 7 140 21c 54 28 81 86 81 172c 0 61 -21 113 -64 156s -93 64 -151 64c -61 0 -113 -19 -156 -59c -43 -39 -64 -91 -64 -156c 0 -118 50 -221 151 -307c 100 -86 214 -129 340 -129c 169 0 311 36 426 108c 136 86 205 203 205 351c 0 129 -78 244 -236 345c -132 75 -263 153 -391 232c -78 61 -146 129 -204 205c -25 35 -50 73 -75 113c 110 -64 211 -97 300 -97c 64 0 130 18 198 54c 39 18 87 52 145 102c 46 39 82 59 107 59c 82 0 137 -35 166 -105c 7 -21 12 -57 16 -110h 43c 0 120 -18 216 -54 288c -54 106 -147 160 -280 160c -100 0 -206 -37 -315 -110c -109 -73 -200 -110 -272 -110c -108 0 -178 27 -210 81c -14 64 -23 102 -27 113h -70c 3 -36 8 -70 16 -102c 7 -32 27 -79 59 -140c 46 -93 151 -221 313 -383c 313 -313 469 -505 469 -577C 876 376 726 257 427 257');
	$AlphaTab_Rendering_Glyphs_MusicFont.num3 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 414 1024v -59c 21 0 47 -5 76 -16c 113 -39 193 -77 240 -113c 72 -57 109 -129 109 -216c 0 -111 -35 -204 -106 -278c -70 -73 -149 -110 -237 -110c -112 0 -194 32 -245 97c 3 18 8 34 16 48c 72 0 120 16 145 48c 25 32 37 75 37 129c 0 118 -66 178 -199 178c -57 0 -102 -16 -135 -48c -32 -32 -48 -84 -48 -156c 0 -126 44 -223 132 -291c 88 -68 231 -102 429 -102c 133 0 251 47 353 143c 102 95 153 211 153 348c 0 100 -21 177 -64 229c -43 52 -111 98 -205 137c 86 35 149 77 189 124c 54 64 81 147 81 248c 0 133 -51 247 -153 342c -102 95 -220 143 -353 143c -194 0 -336 -34 -426 -102c -90 -68 -135 -165 -135 -291c 0 -75 15 -128 45 -159c 30 -30 78 -45 143 -45c 129 0 194 59 194 178c 0 57 -12 101 -37 132c -25 30 -75 45 -151 45c 3 21 8 45 16 70c 61 46 135 70 221 70c 82 0 160 -36 232 -108c 72 -72 108 -163 108 -275c 0 -82 -36 -153 -108 -210c -54 -43 -135 -82 -243 -118L 414 1024');
	$AlphaTab_Rendering_Glyphs_MusicFont.num4 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 897 133c -86 147 -174 296 -264 445c -90 149 -162 258 -216 326l -302 469h 448v -556l 378 -318v 874h 162v 75h -162c 0 39 0 81 2 124c 1 43 6 78 13 105c 7 27 39 53 97 78c 7 3 23 8 48 16v 75h -712v -75c 32 -10 55 -18 70 -21c 54 -21 82 -43 86 -64c 3 -18 6 -51 8 -99c 1 -48 4 -94 8 -137h -588v -75c 158 -111 279 -288 361 -529c 43 -237 88 -475 135 -712H 897');
	$AlphaTab_Rendering_Glyphs_MusicFont.num5 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 122 133c 10 7 63 18 159 35c 95 16 177 24 245 24c 89 0 171 -5 245 -16c 73 -10 139 -23 197 -37c 0 61 -8 112 -24 153c -16 41 -47 78 -94 110c -21 14 -62 27 -121 37c -59 10 -112 16 -159 16c -72 0 -145 -5 -221 -16c -75 -10 -117 -21 -124 -32v 475c 93 -104 197 -156 313 -156c 158 0 286 43 383 130c 97 86 145 198 145 336c 0 173 -61 325 -183 455c -122 130 -266 195 -432 195c -39 0 -68 -1 -86 -5c -86 -14 -154 -43 -205 -86c -72 -61 -108 -156 -108 -286c 0 -61 16 -109 48 -145c 32 -36 82 -54 151 -54c 136 0 205 64 205 194c 0 108 -43 169 -129 183c -25 10 -50 23 -75 37c 32 32 68 54 108 67c 39 12 79 18 118 18c 93 0 170 -45 232 -135c 61 -90 91 -219 91 -385c 0 -112 -27 -209 -81 -290c -54 -81 -127 -122 -221 -122c -118 0 -210 54 -275 162h -102V 133');
	$AlphaTab_Rendering_Glyphs_MusicFont.num6 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 871 305c -7 -11 -12 -22 -16 -34c -57 -52 -118 -79 -183 -79c -32 0 -63 7 -91 21c -64 36 -114 110 -148 224c -34 113 -51 227 -51 342c 0 165 19 253 59 264c 75 -108 185 -162 332 -162c 110 0 201 52 273 156c 60 89 91 190 91 302c 0 154 -47 278 -143 369c -95 91 -213 137 -353 137c -190 0 -341 -89 -450 -267c -109 -178 -164 -382 -164 -612c 0 -208 64 -399 194 -572c 129 -172 279 -259 448 -259c 158 0 273 49 345 147c 50 69 75 148 75 239c 0 54 -19 103 -59 147c -39 43 -79 65 -118 65c -68 0 -122 -16 -162 -48c -39 -32 -59 -86 -59 -162c 0 -68 21 -121 64 -159C 795 330 835 309 871 305zM 849 1391c 0 -129 -9 -221 -27 -275c -32 -93 -91 -140 -178 -140c -82 0 -137 38 -164 116c -27 77 -40 177 -40 299c 0 108 14 199 43 275c 28 75 82 113 162 113c 72 0 124 -39 156 -118C 833 1582 849 1492 849 1391');
	$AlphaTab_Rendering_Glyphs_MusicFont.num7 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 313 1850c 10 -86 23 -172 37 -259c 43 -172 118 -313 226 -421c 122 -118 217 -221 286 -307c 90 -111 142 -201 156 -270l 27 -124c -46 30 -96 56 -148 79c -52 22 -103 34 -153 34c -93 0 -206 -40 -340 -122c -64 -40 -120 -61 -167 -61c -57 0 -98 17 -121 51c -23 34 -42 65 -56 94h -64v -356h 54c 7 21 16 44 27 67c 10 23 30 35 59 35c 25 0 62 -16 113 -48c 108 -72 185 -108 232 -108c 75 0 149 26 221 78c 72 52 140 78 205 78c 46 0 82 -22 108 -67c 10 -18 19 -48 27 -89h 70v 340c 0 107 -17 206 -52 295c -10 25 -87 159 -231 403c -35 64 -60 142 -76 234c -15 91 -23 178 -23 260c 0 114 0 175 0 182H 313');
	$AlphaTab_Rendering_Glyphs_MusicFont.num8 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 795 905c 57 18 126 77 205 178c 64 79 97 151 97 216c 0 183 -57 324 -172 421c -97 82 -214 124 -351 124c -151 0 -276 -49 -375 -148c -99 -99 -148 -231 -148 -396c 0 -68 34 -138 102 -210c 50 -54 106 -93 167 -118c -72 -39 -127 -94 -167 -164c -39 -70 -59 -144 -59 -224c 0 -136 48 -244 145 -324c 97 -79 208 -118 334 -118c 133 0 245 40 337 121s 137 195 137 342c 0 57 -32 120 -97 189C 901 845 849 883 795 905zM 389 1040c -57 28 -102 61 -135 97c -46 54 -70 118 -70 194c 0 108 35 204 106 288c 71 84 165 126 282 126c 106 0 185 -24 238 -72s 79 -103 79 -164c 0 -39 -26 -88 -80 -145c -53 -57 -112 -106 -176 -145c -64 -39 -124 -81 -179 -124C 437 1079 415 1061 389 1040zM 708 835c 46 -18 89 -53 126 -105c 37 -52 56 -107 56 -164c 0 -100 -28 -183 -86 -248c -57 -64 -136 -97 -237 -97c -79 0 -145 26 -197 78c -52 52 -78 112 -78 180c 0 36 25 75 75 118c 25 21 72 54 143 97c 70 43 121 77 153 102C 676 808 690 820 708 835');
	$AlphaTab_Rendering_Glyphs_MusicFont.num9 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 333 1682c 3 10 9 21 16 32c 57 50 118 75 183 75c 32 0 62 -7 91 -21c 68 -36 117 -107 148 -213c 30 -106 45 -222 45 -348c 0 -169 -18 -259 -54 -270c -75 111 -185 167 -329 167c -111 0 -200 -48 -267 -146c -66 -97 -99 -202 -99 -315c 0 -155 47 -279 143 -372c 95 -92 215 -138 359 -138c 190 0 343 93 459 280c 100 165 151 365 151 599c 0 208 -64 399 -194 572s -279 259 -448 259c -158 0 -273 -48 -345 -145c -50 -68 -75 -147 -75 -237c 0 -54 19 -102 59 -145c 39 -43 86 -64 140 -64c 61 0 109 16 145 48c 35 32 54 86 54 162c 0 68 -25 124 -75 167C 405 1661 369 1679 333 1682zM 354 594c 0 130 8 222 27 277c 32 94 89 141 172 141c 82 0 138 -40 167 -122c 28 -81 43 -180 43 -296c 0 -112 -12 -199 -37 -261c -36 -86 -93 -130 -172 -130c -75 0 -127 38 -156 114C 369 393 354 486 354 594');
	$AlphaTab_Rendering_Glyphs_MusicFont.restSixteenth = new $AlphaTab_Rendering_Glyphs_LazySvg('M 494 -1275c 76 -27 149 -91 218 -191c 23 -31 51 -81 86 -151l 161 -667c -73 128 -198 192 -374 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174s 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98s -44 65 -86 92c 19 7 40 15 63 23c 15 0 38 -5 69 -17c 73 -23 140 -79 202 -167c 61 -88 121 -177 179 -267h 40l -602 2586l -106 0l 318 -1316c -73 128 -196 192 -369 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -104 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -86 87c 45 15 72 23 80 23C 465 -1269 482 -1271 494 -1275');
	$AlphaTab_Rendering_Glyphs_MusicFont.restEighth = new $AlphaTab_Rendering_Glyphs_LazySvg('M 247 -1725c 65 0 123 25 173 75c 50 50 75 104 75 162c 0 27 -9 60 -28 98c -19 38 -48 69 -86 92c 23 7 46 15 69 23c 15 0 38 -5 69 -17c 88 -31 175 -113 260 -246c 38 -62 77 -125 115 -188h 40l -382 1670l -112 0l 331 -1316c -73 128 -198 191 -375 191c -19 0 -38 0 -57 0c -27 -3 -69 -13 -127 -28c -57 -15 -106 -46 -147 -92c -40 -46 -60 -106 -60 -179c 0 -69 23 -127 69 -174S 178 -1725 247 -1725');
	$AlphaTab_Rendering_Glyphs_MusicFont.restWhole = new $AlphaTab_Rendering_Glyphs_LazySvg('M 1046 445H -25v -458h 1071V 445');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteWhole = new $AlphaTab_Rendering_Glyphs_LazySvg('M 0 437c 0 -109 40 -197 121 -265s 177 -115 290 -143s 216 -41 312 -41c 104 0 213 13 328 41s 214 74 298 141s 128 156 133 266c 0 110 -40 199 -121 268s -177 117 -290 145s -219 43 -319 43c -107 0 -218 -13 -332 -41s -211 -75 -293 -144S 2 550 0 437zM 450 361c 7 133 46 243 118 330s 158 130 259 130c 77 -8 131 -34 161 -77s 44 -117 44 -224c -10 -137 -51 -248 -123 -333s -159 -127 -262 -127c -72 11 -123 37 -152 78S 450 253 450 361');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteQuarter = new $AlphaTab_Rendering_Glyphs_LazySvg('M 658 800c -108 65 -216 98 -324 98c -119 0 -216 -42 -289 -127c -54 -57 -81 -129 -81 -214c 0 -92 29 -183 89 -272c 59 -88 136 -158 228 -208c 111 -69 223 -104 335 -104c 108 0 200 36 278 110c 57 57 86 131 86 220c 0 92 -31 185 -92 278C 827 673 750 746 658 800');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteHalf = new $AlphaTab_Rendering_Glyphs_LazySvg('M 669 818c -108 65 -216 98 -324 98c -119 0 -216 -42 -290 -127c -54 -57 -81 -129 -81 -214c 0 -92 29 -183 89 -272c 59 -88 136 -158 229 -208c 112 -69 224 -104 336 -104c 108 0 200 36 278 110c 57 57 87 131 87 220c 0 92 -31 185 -92 278C 839 691 762 764 669 818zM 95 754c 19 23 57 34 115 34c 65 0 132 -13 200 -40c 67 -27 134 -64 200 -113c 65 -48 127 -118 185 -208s 87 -169 87 -234c 0 -23 -5 -44 -17 -63c -11 -15 -34 -23 -69 -23c -46 0 -113 18 -200 55c -87 36 -164 77 -231 121c -67 44 -133 110 -197 197s -95 159 -95 217C 72 720 79 739 95 754');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteDead = new $AlphaTab_Rendering_Glyphs_LazySvg('M 482 345c 42 -15 70 -38 84 -69c 13 -30 20 -102 20 -214c 0 -30 0 -50 0 -57c 0 -3 0 -7 0 -11h 307v 313c -31 0 -54 0 -69 0c -38 0 -77 1 -115 2c -38 2 -72 8 -101 20c -28 11 -51 38 -66 81v 81c 15 42 38 70 69 84c 30 13 102 20 214 20c 30 0 50 0 57 0c 3 0 7 0 11 0v 313h -307c 0 -31 0 -54 0 -69c 0 -38 -1 -77 -2 -115c -2 -38 -8 -72 -20 -101c -11 -28 -38 -51 -81 -66h -104c -42 15 -70 38 -84 69c -13 30 -20 102 -20 214c 0 30 0 50 0 57c 0 3 0 7 0 11h -307V 595c 30 0 54 0 69 0c 38 0 77 -1 115 -2c 38 -2 72 -8 101 -20c 28 -11 51 -38 66 -81v -81c -15 -42 -38 -70 -69 -84c -31 -13 -102 -20 -214 -20c -31 0 -50 0 -57 0c -3 0 -7 0 -11 0v -313h 307c 0 31 0 54 0 69c 0 38 0 77 2 115c 1 38 8 72 20 101c 11 28 38 51 81 66H 482');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteHarmonic = new $AlphaTab_Rendering_Glyphs_LazySvg('M 116 453l 452 -452c 108 131 197 220 266 266l 261 202l -446 452c -38 -46 -81 -90 -127 -133c -46 -42 -90 -85 -133 -127c -42 -42 -98 -89 -168 -139C 182 496 147 472 116 453');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteRideCymbal = new $AlphaTab_Rendering_Glyphs_LazySvg('M 910 417C 763 561 616 695 469 840 384 691 261 576 126 473 79 438 29 407 -23 382 122 239 267 96 412 -46 502 92 628 203 754 310 803 350 853 388 910 417zM 465 696C 561 602 657 508 753 414 655 352 574 268 492 188 464 159 438 128 415 94 320 191 226 288 131 384c 113 55 203 147 285 241 17 22 33 45 48 70z');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteHiHat = new $AlphaTab_Rendering_Glyphs_LazySvg('M 484 6c -201 -2 -395 126 -471 312 -79 182 -38 409 101 552 134 144 355 197 540 129 191 -65 333 -253 341 -456 12 -199 -104 -398 -283 -485 -70 -35 -148 -53 -227 -53zm 0 101c 90 0 179 32 250 88 -83 80 -168 158 -250 240 -82 -82 -165 -165 -247 -247 70 -52 159 -81 247 -81zm -322 155c 83 83 167 167 250 250 -85 84 -172 166 -257 250 -100 -127 -113 -315 -26 -453 10 -16 21 -33 33 -48zm 647 6c 97 124 112 306 33 444 -14 23 -30 67 -52 24 -75 -75 -152 -149 -228 -225 81 -82 165 -162 247 -244zm -325 322c 83 83 170 164 254 247 -121 101 -303 121 -442 44 -22 -16 -86 -35 -42 -61 76 -76 153 -153 230 -230z');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteSideStick = new $AlphaTab_Rendering_Glyphs_LazySvg('M 0 0c -25 24 -51 48 -77 72 151 151 302 302 454 454 -144 142 -288 285 -433 427 25 25 51 51 77 77 142 -142 285 -285 427 -427 144 142 288 285 433 427 25 -25 51 -51 77 -77 -144 -142 -288 -285 -433 -427 151 -151 302 -302 454 -454 -25 -24 -51 -48 -77 -72 -151 149 -302 299 -454 449 -149 -149 -299 -299 -449 -449');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteHiHatHalf = new $AlphaTab_Rendering_Glyphs_LazySvg('M 449 22c 185 -2 364 116 434 288 73 168 35 377 -93 508 -123 133 -327 182 -498 119 -176 -60 -307 -233 -314 -420 -11 -183 96 -366 261 -447 64 -32 137 -49 209 -49zm 0 93c -82 0 -163 30 -228 81 177 176 354 352 531 528 99 -127 104 -319 7 -450 -70 -98 -189 -159 -310 -158zm -296 153c -75 93 -102 223 -64 338 46 160 209 278 377 267 77 -2 153 -30 215 -77 -176 -176 -352 -352 -528 -528z');
	$AlphaTab_Rendering_Glyphs_MusicFont.noteChineseCymbal = new $AlphaTab_Rendering_Glyphs_LazySvg('M 503 -450l 577 579l -64 66l -516 -514l -512 512l -68 -64L 503 -450zM 499 601l 316 314l 145 -143l -314 -316l 316 -312l -141 -141l -317 319l -317 -323l -136 136l 319 319l -326 326l 140 140L 499 601');
	$AlphaTab_Rendering_Glyphs_MusicFont.footerUpEighth = new $AlphaTab_Rendering_Glyphs_LazySvg('M 9 1032V -9h 87c 20 137 48 252 83 345s 75 172 122 238s 116 151 209 255s 168 193 225 265c 172 221 259 453 259 695c 0 248 -105 550 -317 907h -57c 27 -62 58 -134 94 -216s 65 -156 90 -223s 43 -133 57 -199s 21 -131 21 -196c 0 -102 -20 -204 -62 -308s -99 -199 -174 -287s -159 -159 -254 -213s -194 -84 -296 -90v 68H 9');
	$AlphaTab_Rendering_Glyphs_MusicFont.footerUpSixteenth = new $AlphaTab_Rendering_Glyphs_LazySvg('M 943 1912c 62 135 94 280 94 435c 0 202 -61 404 -183 605h -57c 108 -233 162 -430 162 -590c 0 -117 -26 -220 -78 -309c -52 -89 -118 -166 -198 -230c -80 -64 -187 -137 -322 -220s -220 -136 -257 -161v 72h -86V 8h 86c 6 108 28 200 65 276s 74 133 111 170s 109 106 218 206s 190 184 245 252c 87 109 151 216 191 319s 60 212 60 328C 994 1648 977 1764 943 1912zM 897 1815c 0 -17 0 -41 1 -72s 1 -53 1 -68c 0 -369 -266 -701 -798 -996c 3 120 31 229 83 327s 130 199 233 303s 195 195 276 273C 776 1659 843 1737 897 1815');
	$AlphaTab_Rendering_Glyphs_MusicFont.footerUpThirtySecond = new $AlphaTab_Rendering_Glyphs_LazySvg('M 14 1990V 10h 87c 11 121 35 216 70 283c 35 66 89 134 161 202c 72 68 174 164 307 288c 235 226 353 494 353 802c 0 106 -14 211 -43 317c 29 90 43 186 43 287c 0 79 -12 171 -36 274c 57 73 86 191 86 352c 0 112 -15 226 -46 342s -76 218 -137 308h -57c 108 -223 162 -418 162 -582c 0 -104 -20 -199 -62 -284s -99 -163 -172 -232c -73 -69 -153 -133 -239 -192s -215 -142 -389 -251v 64H 14zM 108 1292c 7 113 39 215 96 305c 56 89 129 176 218 259s 179 168 273 257c 93 88 160 168 199 240c 2 -19 3 -48 3 -87C 900 1904 636 1579 108 1292zM 115 666c 0 106 23 197 71 272s 129 166 247 274s 209 197 276 268s 129 168 187 288c 7 -42 10 -83 10 -122c 0 -146 -40 -280 -120 -401c -80 -121 -171 -221 -273 -300C 411 867 278 774 115 666');
	$AlphaTab_Rendering_Glyphs_MusicFont.footerUpSixtyFourth = new $AlphaTab_Rendering_Glyphs_LazySvg('M 21 2851V 564v -554h 86c 0 140 32 254 98 342c 65 87 173 200 322 339s 261 271 336 400s 113 292 113 490c 0 96 -12 208 -36 338c 43 83 65 188 65 316c 0 122 -21 237 -65 345c 48 109 72 223 72 342c 0 117 -24 222 -72 316c 57 85 86 205 86 360c 0 218 -53 443 -161 673h -65c 98 -280 147 -498 147 -652c 0 -115 -22 -210 -65 -284s -93 -130 -149 -170c -56 -39 -153 -100 -291 -183s -247 -156 -327 -221l 0 87L 21 2851zM 107 2001c 0 121 29 233 89 336s 138 203 236 301s 192 190 280 278c 88 87 149 166 181 235c 11 -60 17 -112 17 -155c 0 -212 -81 -405 -244 -578C 505 2246 318 2106 107 2001zM 114 668c 0 119 22 219 68 300s 127 176 245 286c 118 109 208 198 272 265c 63 66 128 163 195 290c 7 -46 10 -90 10 -133c 0 -166 -41 -313 -124 -439s -177 -229 -281 -308C 395 848 267 762 114 668zM 114 1338c 0 123 24 226 73 309s 133 176 252 282s 211 193 278 263s 128 164 183 283c 9 -45 14 -94 14 -147c 0 -138 -39 -270 -116 -395s -177 -236 -297 -334S 252 1413 114 1338');
	$AlphaTab_Rendering_Glyphs_MusicFont.footerDownEighth = new $AlphaTab_Rendering_Glyphs_LazySvg('M 9 -1032V 9h 87c 20 -137 48 -252 83 -345s 75 -172 122 -238s 116 -151 209 -255s 168 -193 225 -265c 172 -221 259 -453 259 -695c 0 -248 -105 -550 -317 -907h -57c 27 62 58 134 94 216s 65 156 90 223s 43 133 57 199s 21 131 21 196c 0 102 -20 204 -62 308s -99 199 -174 287s -159 159 -254 213s -194 84 -296 90v 68H 9');
	$AlphaTab_Rendering_Glyphs_MusicFont.footerDownSixteenth = new $AlphaTab_Rendering_Glyphs_LazySvg('M 943 -1912c 62 -135 94 -280 94 -435c 0 -202 -61 -404 -183 -605h -57c 108 233 162 430 162 590c 0 117 -26 220 -78 309c -52 89 -118 166 -198 230c -80 64 -187 137 -322 220s -220 136 -257 161v 72h -86V -8h 86c 6 -108 28 -200 65 -276s 74 -133 111 -170s 109 -106 218 -206s 190 -184 245 -252c 87 -109 151 -216 191 -319s 60 -212 60 -328C 994 -1648 977 -1764 943 -1912zM 897 -1815c 0 17 0 41 1 72s 1 53 1 68c 0 369 -266 701 -798 996c 3 -120 31 -229 83 -327s 130 -199 233 -303s 195 -195 276 -273C 776 -1659 843 -1737 897 -1815');
	$AlphaTab_Rendering_Glyphs_MusicFont.footerDownThirtySecond = new $AlphaTab_Rendering_Glyphs_LazySvg('M 14 -1990V -10h 87c 11 -121 35 -216 70 -283c 35 -66 89 -134 161 -202c 72 -68 174 -164 307 -288c 235 -226 353 -494 353 -802c 0 -106 -14 -211 -43 -317c 29 -90 43 -186 43 -287c 0 -79 -12 -171 -36 -274c 57 -73 86 -191 86 -352c 0 -112 -15 -226 -46 -342s -76 -218 -137 -308h -57c 108 223 162 418 162 582c 0 104 -20 199 -62 284s -99 163 -172 232c -73 69 -153 133 -239 192s -215 142 -389 251v 64H 14zM 108 -1292c 7 -113 39 -215 96 -305c 56 -89 129 -176 218 -259s 179 -168 273 -257c 93 -88 160 -168 199 -240c 2 19 3 48 3 87C 900 -1904 636 -1579 108 -1292zM 115 -666c 0 -106 23 -197 71 -272s 129 -166 247 -274s 209 -197 276 -268s 129 -168 187 -288c 7 42 10 83 10 122c 0 146 -40 280 -120 401c -80 121 -171 221 -273 300C 411 -867 278 -774 115 -666');
	$AlphaTab_Rendering_Glyphs_MusicFont.footerDownSixtyFourth = new $AlphaTab_Rendering_Glyphs_LazySvg('M 21 -2851V -564v -554h 86c 0 -140 32 -254 98 -342c 65 -87 173 -200 322 -339s 261 -271 336 -400s 113 -292 113 -490c 0 -96 -12 -208 -36 -338c 43 -83 65 -188 65 -316c 0 -122 -21 -237 -65 -345c 48 -109 72 -223 72 -342c 0 -117 -24 -222 -72 -316c 57 -85 86 -205 86 -360c 0 -218 -53 -443 -161 -673h -65c 98 280 147 498 147 652c 0 115 -22 210 -65 284s -93 130 -149 170c -56 39 -153 100 -291 183s -247 156 -327 221l 0 -87L 21 -2851zM 107 -2001c 0 -121 29 -233 89 -336s 138 -203 236 -301s 192 -190 280 -278c 88 -87 149 -166 181 -235c 11 60 17 112 17 155c 0 212 -81 405 -244 578C 505 -2246 318 -2106 107 -2001zM 114 -668c 0 -119 22 -219 68 -300s 127 -176 245 -286c 118 -109 208 -198 272 -265c 63 -66 128 -163 195 -290c 7 46 10 90 10 133c 0 166 -41 313 -124 439s -177 229 -281 308C 395 -848 267 -762 114 -668zM 114 -1338c 0 -123 24 -226 73 -309s 133 -176 252 -282s 211 -193 278 -263s 128 -164 183 -283c 9 45 14 94 14 147c 0 138 -39 270 -116 395s -177 236 -297 334S 252 -1413 114 -1338');
	$AlphaTab_Rendering_Glyphs_MusicFont.simileMark = new $AlphaTab_Rendering_Glyphs_LazySvg('M 413 1804l -446 3l 1804 -1806l 449 -3L 413 1804zM 331 434c 0 -53 20 -100 62 -142c 41 -41 91 -62 148 -62s 104 19 142 56c 38 38 56 87 56 148c 0 56 -19 105 -59 145c -39 39 -88 59 -145 59c -56 0 -105 -19 -145 -59C 351 540 331 491 331 434zM 1437 1380c 0 -56 18 -104 56 -142c 37 -37 87 -56 148 -56c 56 0 104 19 142 56c 38 38 56 85 56 142c 0 56 -19 104 -56 142c -38 38 -87 56 -148 56c -56 0 -104 -19 -142 -56C 1456 1485 1437 1437 1437 1380');
	$AlphaTab_Rendering_Glyphs_MusicFont.simileMark2 = new $AlphaTab_Rendering_Glyphs_LazySvg('M 414 1818l -446 3l 1809 -1809l 449 -6L 414 1818zM 340 439c 0 -56 18 -104 56 -142c 37 -37 87 -56 148 -56c 56 0 105 20 145 59c 39 39 59 88 59 145c 0 56 -19 104 -56 142c -38 38 -89 56 -153 56c -56 0 -104 -18 -142 -56C 359 549 340 500 340 439zM 1152 1815l -446 3l 1812 -1812l 446 -3L 1152 1815zM 2192 1391c 0 -56 18 -104 56 -142c 38 -37 87 -56 148 -56c 56 0 104 19 142 56c 37 38 56 85 56 142c 0 56 -19 104 -56 142c -38 38 -87 56 -148 56c -56 0 -104 -19 -142 -56C 2211 1495 2192 1448 2192 1391');
	$AlphaTab_Rendering_Glyphs_MusicFont.coda = new $AlphaTab_Rendering_Glyphs_LazySvg('M 697 1689v 299h -72v -299c -189 0 -349 -81 -478 -244c -129 -163 -193 -349 -193 -558h -248v -73h 248c 0 -216 63 -409 189 -581c 126 -171 287 -257 481 -257v -248h 72v 248c 189 0 345 84 467 254s 182 364 182 585h 284v 73h -284c 0 209 -60 395 -182 558C 1042 1608 887 1689 697 1689zM 624 813v -737c -126 14 -208 88 -244 222c -36 133 -54 305 -54 514H 624zM 324 886c 0 262 25 445 76 547s 125 158 222 167v -715H 324zM 697 813h 292c 0 -221 -12 -378 -36 -471c -43 -166 -129 -257 -255 -272V 813zM 989 886h -292v 715c 97 -9 170 -64 219 -164C 964 1338 989 1154 989 886');
	$AlphaTab_Rendering_Glyphs_MusicFont.segno = new $AlphaTab_Rendering_Glyphs_LazySvg('M 604 1150c -182 -112 -324 -222 -425 -329c -126 -131 -189 -256 -189 -372c 0 -116 42 -218 128 -306c 85 -87 194 -131 327 -131c 98 0 196 32 294 97c 98 64 147 141 147 229c 0 56 -9 104 -28 142c -18 38 -50 56 -94 56c -100 0 -155 -46 -164 -137c 0 -18 8 -45 25 -80c 17 -34 21 -63 11 -85c -22 -69 -86 -104 -192 -104c -67 0 -123 20 -168 61c -44 40 -67 84 -67 131c 0 135 64 248 193 339c 25 18 155 88 392 207l 571 -843l 148 0l -611 900c 196 121 334 223 415 304c 118 118 177 245 177 379c 0 112 -43 214 -130 304c -86 90 -193 136 -320 136c -102 0 -202 -34 -300 -102c -97 -68 -146 -152 -146 -251c 0 -37 13 -79 40 -125c 27 -46 57 -69 93 -69c 47 0 82 12 105 38c 22 25 38 65 47 120c 6 22 0 51 -16 87c -17 36 -22 65 -16 87c 9 31 35 56 78 75c 42 18 91 28 147 28c 58 0 105 -21 142 -65c 36 -43 55 -89 55 -139c 0 -139 -89 -263 -269 -371c -133 -68 -232 -117 -297 -148l -544 810l -152 -1L 604 1150zM 201 1091c 34 0 64 11 89 32s 37 51 37 89c 0 34 -12 64 -37 89c -25 25 -54 37 -89 37c -34 0 -64 -12 -89 -37c -25 -25 -37 -54 -37 -89C 74 1131 116 1091 201 1091zM 1291 696c 34 0 64 12 89 37c 25 25 37 54 37 89c 0 31 -12 59 -37 84c -25 25 -54 37 -89 37s -63 -11 -86 -35s -35 -52 -35 -87c 0 -34 10 -64 32 -89C 1224 708 1253 696 1291 696');
	$AlphaTab_Rendering_Glyphs_MusicFont.ottavaAbove = new $AlphaTab_Rendering_Glyphs_LazySvg('M 488 562c 78 9 147 45 206 110c 59 64 88 138 88 222c 0 95 -39 171 -118 227c -78 55 -175 83 -290 83c -112 0 -208 -28 -288 -85c -80 -56 -120 -134 -120 -233c 0 -41 5 -77 15 -107c 10 -29 29 -61 56 -94c 27 -32 77 -62 149 -89c 12 -3 28 -7 49 -13c -69 -12 -127 -48 -172 -107c -45 -59 -68 -123 -68 -190c 0 -88 37 -161 113 -217s 158 -84 249 -84c 96 0 185 29 265 87c 80 58 120 131 120 220c 0 73 -22 134 -68 183c -24 24 -62 47 -113 68C 547 545 521 553 488 562zM 279 588c -66 21 -118 57 -156 108c -37 51 -56 112 -56 181c 0 72 27 141 83 206c 56 65 130 97 224 97c 90 0 166 -36 226 -108c 51 -60 77 -124 77 -190c 0 -54 -21 -101 -63 -140c -30 -27 -68 -49 -113 -68L 279 588zM 460 547c 130 -39 195 -127 195 -263c 0 -66 -25 -129 -77 -188c -51 -59 -122 -88 -213 -88c -87 0 -155 28 -202 86c -47 57 -70 119 -70 186c 0 36 14 72 43 108c 28 36 68 63 120 81L 460 547zM 842 311l -13 -9l 68 -58c 24 -21 51 -28 81 -22c 27 3 40 24 40 63c 0 36 -15 100 -47 192c -31 92 -47 149 -47 170c 0 33 13 46 40 40c 42 -3 94 -47 156 -133c 61 -86 93 -156 93 -211c 0 -12 -7 -22 -22 -31c -18 -9 -28 -16 -31 -22c -15 -30 -7 -49 22 -59c 30 -12 52 9 68 63c 18 75 -12 167 -93 274c -80 107 -147 161 -201 161c -57 0 -86 -24 -86 -72c 0 -18 4 -37 13 -59c 9 -21 23 -65 43 -133c 19 -68 29 -120 29 -156c 0 -15 -1 -25 -4 -31c -9 -18 -24 -19 -45 -4L 842 311zM 1636 683l 81 -68l -72 83c -18 19 -36 29 -54 29c -15 0 -21 -15 -18 -45l 40 -167c -3 21 -28 59 -77 113c -57 66 -109 99 -154 99c -66 0 -99 -39 -99 -118c 0 -78 28 -159 86 -242c 57 -83 122 -124 195 -124c 39 0 74 15 104 45l 9 -45h 31l -95 407c -6 18 -7 30 -4 36S 1621 692 1636 683zM 1382 683c 51 0 107 -37 167 -111c 18 -24 43 -63 77 -115l 31 -134c -33 -34 -66 -51 -99 -51c -54 0 -105 40 -152 120c -46 80 -70 154 -70 222C 1336 660 1351 683 1382 683');
	$AlphaTab_Rendering_Glyphs_MusicFont.ottavaBelow = new $AlphaTab_Rendering_Glyphs_LazySvg('M 469 529c 75 6 143 41 202 107c 59 65 88 141 88 229c 0 97 -39 173 -118 229c -78 56 -175 84 -290 84c -112 0 -208 -28 -288 -86c -80 -57 -120 -136 -120 -236c 0 -33 6 -68 18 -104c 12 -36 31 -69 56 -97s 65 -55 120 -79c 18 -6 43 -15 77 -27c -69 -12 -126 -47 -170 -104s -65 -121 -65 -191c 0 -85 37 -156 113 -214c 75 -57 157 -86 245 -86c 93 0 182 28 265 86c 83 57 124 130 124 218c 0 72 -22 133 -68 182c -24 24 -62 47 -113 68C 528 512 502 520 469 529zM 251 563c -66 21 -118 57 -154 108c -36 51 -54 112 -54 181c 0 72 27 141 84 206c 55 65 130 97 224 97c 93 0 169 -36 226 -108c 48 -60 72 -124 72 -190c 0 -51 -21 -98 -63 -140c -30 -30 -66 -52 -108 -68L 251 563zM 432 522c 130 -39 195 -128 195 -265c 0 -67 -25 -130 -77 -189c -51 -59 -121 -89 -208 -89c -87 0 -155 29 -202 89c -47 59 -70 119 -70 180c 0 36 13 74 40 112s 66 66 118 84L 432 522zM 827 268h -13l 63 -45c 24 -27 52 -39 86 -36c 24 3 36 23 36 60c 0 34 -15 98 -45 191c -30 93 -45 154 -45 182c 0 34 13 49 40 46c 42 -3 94 -49 156 -138c 61 -89 93 -161 93 -218c 0 -12 -10 -25 -31 -37c -15 -6 -22 -12 -22 -18c -15 -30 -9 -50 18 -59c 33 -12 57 9 72 64c 18 76 -12 168 -93 277c -80 108 -146 162 -197 162c -63 0 -95 -28 -95 -84c 0 -8 3 -22 9 -40c 18 -47 35 -102 52 -164c 16 -62 24 -105 24 -129c 0 -17 -3 -29 -9 -35c -6 -6 -18 -4 -36 4L 827 268zM 1413 -13l -72 -9c 23 6 53 1 89 -15c 11 -3 30 -15 53 -35l -131 444c 30 -45 64 -81 102 -108c 38 -27 76 -40 116 -40c 39 0 68 11 86 34c 18 22 27 55 27 98c 0 79 -30 156 -90 231c -60 74 -137 112 -231 112c -30 0 -57 -8 -81 -24c -24 -16 -33 -36 -27 -62L 1413 -13zM 1294 635c 15 21 42 32 81 32c 78 0 146 -42 204 -128c 48 -73 72 -145 72 -215c 0 -30 -7 -50 -22 -59c -18 -9 -36 -13 -54 -13c -36 0 -77 17 -122 52c -45 35 -81 77 -108 126L 1294 635');
	$AlphaTab_Rendering_Glyphs_MusicFont.quindicesimaAbove = new $AlphaTab_Rendering_Glyphs_LazySvg('M 245 985V 270v -72c -9 -8 -30 -13 -61 -13c -25 0 -42 1 -52 4l -99 31l -4 -22l 317 -190v 980c 0 39 6 68 20 88c 13 19 31 34 52 43l 145 40v 9h -531l -4 -18l 149 -40c 24 -9 42 -24 54 -45C 241 1050 245 1024 245 985zM 685 338c 60 15 105 27 136 36c 96 27 167 53 213 77c 175 87 263 192 263 313c 0 72 -15 140 -47 204s -70 111 -115 142c -45 31 -87 53 -124 65c -37 12 -94 18 -170 18c -66 0 -128 -13 -186 -40c -57 -27 -86 -63 -86 -108c 0 -24 16 -36 49 -36c 18 0 41 5 70 15c 28 10 61 35 97 74c 36 39 69 59 99 59c 96 0 170 -39 222 -118c 42 -63 63 -131 63 -204c 0 -57 -18 -108 -56 -152c -37 -43 -79 -77 -124 -102c -45 -24 -125 -54 -240 -90c -36 -12 -87 -27 -154 -45l 154 -426h 426c 36 0 65 -4 86 -13l 45 -34l 22 -29h 9l -127 195h -449L 685 338zM 1806 561h -59l 145 -367c 0 -18 0 -30 0 -36c -6 -27 -21 -42 -45 -45c -24 -3 -51 13 -81 50c -3 6 -9 16 -18 31l -145 367h -68l 154 -379c -3 -15 -4 -26 -4 -32c -6 -21 -18 -34 -36 -37c -45 -6 -98 34 -158 121c -9 12 -21 34 -36 65h -18c 30 -47 54 -83 72 -106c 57 -71 111 -106 163 -106c 18 2 34 14 50 34c 2 5 9 17 18 34c 9 -17 16 -28 22 -34c 24 -22 60 -34 108 -34c 18 0 33 11 45 34c 2 5 7 18 13 38c 18 -21 31 -34 40 -40c 36 -27 74 -37 113 -31c 30 6 49 24 59 54c 3 9 6 25 9 49l -122 304c -3 15 -4 25 -4 31c 0 9 6 13 18 13c 18 0 39 -17 63 -52c 6 -11 16 -28 31 -52l 13 4c -15 29 -27 49 -36 61c -30 43 -56 65 -77 65c -51 0 -71 -20 -59 -62l 122 -306c 0 -17 0 -29 0 -35c -6 -23 -22 -35 -49 -35s -51 10 -72 31c -6 6 -15 18 -27 36L 1806 561zM 2555 525l 77 -63l -72 73c -18 17 -36 26 -54 26c -15 0 -21 -12 -18 -36l 40 -158c -6 31 -43 78 -113 138c -45 40 -84 60 -118 60c -66 0 -99 -38 -99 -114c 0 -79 28 -158 86 -235c 57 -77 122 -116 195 -116c 24 0 48 5 72 16c 6 2 16 9 31 20l 9 -36h 31l -95 395c -6 18 -7 30 -4 35C 2526 535 2537 534 2555 525zM 2292 525c 51 0 108 -35 172 -107c 21 -23 46 -61 77 -112l 27 -134c -30 -29 -63 -44 -99 -44c -54 0 -105 38 -152 116c -46 77 -70 149 -70 215C 2246 502 2262 525 2292 525');
	$AlphaTab_Rendering_Glyphs_MusicFont.quindicesimaBelow = new $AlphaTab_Rendering_Glyphs_LazySvg('M 2400 -200C 2376 -180 2358 -170 2346 -166C 2310 -150 2280 -144 2256 -150L 2328 -141L 2168 484C 2162 509 2172 530 2196 546C 2221 562 2247 571 2278 571C 2371 571 2448 534 2509 459C 2569 384 2600 307 2600 228C 2600 185 2590 151 2571 128C 2553 105 2526 93 2487 93C 2448 93 2409 107 2371 134C 2333 161 2299 198 2268 243L 2400 -200zM 1300 -57L 1278 -29L 1234 6C 1213 15 1183 21 1146 21L 721 21L 565 446C 632 464 685 481 721 493C 836 530 913 560 959 584C 1004 608 1046 640 1084 684C 1122 728 1143 780 1143 837C 1143 910 1120 980 1078 1043C 1026 1122 953 1159 856 1159C 825 1159 792 1139 756 1100C 719 1060 687 1035 659 1025C 630 1014 605 1009 587 1009C 554 1009 537 1022 537 1046C 537 1092 567 1129 625 1156C 682 1183 742 1196 809 1196C 884 1196 943 1190 981 1178C 1018 1166 1060 1144 1106 1112C 1151 1080 1190 1032 1221 968C 1253 905 1268 838 1268 765C 1268 644 1181 540 1006 453C 960 429 890 402 793 375C 763 365 716 352 656 337L 734 140L 1184 140L 1309 -57L 1300 -57zM 315 6L 0 196L 3 221L 103 190C 112 187 130 184 156 184C 187 184 206 187 215 196L 215 268L 215 984C 215 1023 212 1050 203 1065C 191 1086 171 1100 146 1109L 0 1150L 3 1168L 534 1168L 534 1159L 387 1118C 366 1109 351 1094 337 1075C 323 1055 315 1026 315 987L 315 6zM 1640 84C 1589 84 1535 119 1478 190C 1459 214 1436 249 1406 296L 1425 296C 1440 265 1450 246 1459 234C 1519 147 1573 106 1618 112C 1636 115 1650 128 1656 150C 1656 156 1656 165 1659 181L 1506 562L 1571 562L 1718 193C 1727 178 1734 168 1737 162C 1767 126 1794 109 1818 112C 1842 115 1856 129 1862 156L 1862 193L 1718 562L 1778 562L 1921 193C 1933 175 1943 162 1950 156C 1971 135 1994 125 2021 125C 2049 125 2065 138 2071 162L 2071 196L 1950 503C 1937 544 1957 565 2009 565C 2030 565 2057 543 2087 500C 2096 488 2106 466 2121 437L 2109 434C 2094 457 2084 475 2078 487C 2053 522 2030 537 2012 537C 2000 537 1996 534 1996 525C 1996 519 1997 508 2000 493L 2121 190C 2118 166 2115 149 2112 140C 2103 110 2083 90 2053 84C 2013 78 1976 88 1940 115C 1931 121 1918 135 1900 156C 1893 136 1890 124 1887 118C 1875 95 1858 84 1840 84C 1792 84 1755 96 1731 118C 1725 124 1718 136 1709 153C 1700 136 1693 124 1690 118C 1675 98 1658 87 1640 84zM 2490 121C 2508 121 2528 125 2546 134C 2562 143 2568 163 2568 193C 2568 264 2545 335 2496 409C 2439 495 2372 537 2293 537C 2254 537 2224 527 2209 506L 2259 300C 2286 251 2323 210 2368 175C 2414 139 2454 121 2490 121z');
	$AlphaTab_Rendering_Glyphs_MusicFont.fermataShort = new $AlphaTab_Rendering_Glyphs_LazySvg('M 60 694l -110 1l 660 -713l 656 713l -66 -1l -562 -611L 60 694zM 662 488c 29 0 54 10 74 30s 30 44 30 74c 0 29 -10 54 -30 74s -44 30 -74 30c -29 0 -54 -10 -74 -30s -30 -44 -30 -74c 0 -29 10 -54 30 -74S 633 488 662 488');
	$AlphaTab_Rendering_Glyphs_MusicFont.fermataNormal = new $AlphaTab_Rendering_Glyphs_LazySvg('M 871 230c -216 0 -405 69 -565 209c -160 139 -255 317 -284 531c -2 -16 -4 -32 -4 -48c 0 -21 0 -36 0 -44c 0 -228 84 -427 252 -599c 168 -171 368 -257 600 -257c 229 0 429 84 598 254c 169 169 254 370 254 603c 0 40 0 70 0 92c -26 -216 -119 -394 -278 -533C 1283 299 1093 230 871 230zM 869 767c 29 0 54 10 74 30s 30 44 30 74c 0 29 -9 53 -28 72c -18 18 -44 28 -76 28c -26 0 -50 -9 -72 -28c -21 -18 -32 -42 -32 -72c 0 -29 10 -54 30 -74S 839 767 869 767');
	$AlphaTab_Rendering_Glyphs_MusicFont.fermataLong = new $AlphaTab_Rendering_Glyphs_LazySvg('M 55 702h -68v -704h 1317v 704h -68v -500h -1180V 702zM 647 494c 29 0 54 10 74 30s 30 44 30 74c 0 29 -10 54 -30 74s -44 30 -74 30c -29 0 -54 -10 -74 -30s -30 -44 -30 -74c 0 -29 10 -54 30 -74S 618 494 647 494');
	$AlphaTab_Rendering_Glyphs_MusicFont.dynamicP = new $AlphaTab_Rendering_Glyphs_LazySvg('M 447 894l -146 415l 92 0v 50h -364v -50h 93l 310 -797c 7 -9 10 -16 10 -21c 7 -19 7 -33 0 -43c -14 -14 -27 -21 -39 -21c -38 0 -83 48 -133 144c -14 31 -34 79 -61 144h -25c 26 -72 48 -125 64 -158c 57 -108 116 -162 176 -162c 19 0 33 2 43 7c 12 4 21 18 28 39c 2 7 4 19 7 36c 16 -26 47 -52 90 -79c 43 -26 89 -39 137 -39c 19 0 45 5 77 16c 32 10 59 37 81 78c 21 41 32 89 32 141c 0 35 -2 64 -7 86c -4 21 -13 50 -25 86c -26 64 -71 123 -133 177s -119 80 -169 80C 528 1024 481 981 447 894zM 754 425c -33 -14 -73 5 -119 58c -36 43 -67 92 -93 145c -26 53 -39 113 -39 181c 0 48 9 78 28 90c 26 14 62 0 108 -41c 45 -42 81 -92 108 -150c 9 -24 19 -56 28 -96c 9 -40 14 -74 14 -103C 790 462 778 435 754 425');
	$AlphaTab_Rendering_Glyphs_MusicFont.dynamicF = new $AlphaTab_Rendering_Glyphs_LazySvg('M 951 406v 39h -194l -18 90c -48 194 -97 344 -147 447c -67 141 -154 245 -259 310c -33 21 -77 32 -129 32c -77 0 -127 -21 -151 -64c -14 -26 -21 -51 -21 -75c 0 -38 13 -71 41 -97c 27 -26 57 -37 88 -32c 55 9 83 36 83 79c 0 16 -3 32 -10 46c -9 33 -32 55 -68 64c -12 2 -16 7 -14 14c 4 19 22 28 54 28c 16 -2 36 -14 57 -36c 7 -7 22 -26 47 -57c 52 -79 102 -205 147 -378c 19 -77 38 -154 57 -231l 32 -140h -137v -39h 144c -14 -55 21 -139 108 -252c 65 -84 144 -139 238 -166c 28 -7 57 -10 86 -10c 60 0 109 15 148 46c 38 31 57 72 57 122c 0 48 -14 81 -43 99c -28 18 -56 21 -83 9c -31 -14 -46 -38 -46 -72c 0 -28 10 -52 32 -72c 7 -7 22 -12 46 -14c 24 -2 37 -8 39 -18c 7 -28 -16 -43 -72 -43c -33 0 -64 6 -93 18c -77 33 -132 102 -166 205c -9 33 -20 83 -32 148H 951');
	$AlphaTab_Rendering_Glyphs_MusicFont.dynamicM = new $AlphaTab_Rendering_Glyphs_LazySvg('M 553 1076l -165 1l 201 -502c 7 -12 11 -21 14 -28c 12 -26 18 -45 18 -57c 0 -21 -8 -33 -25 -36c -31 -7 -62 9 -93 50c -9 12 -22 33 -39 65l -199 508l -164 0l 212 -501c 4 -10 7 -17 7 -22c 4 -19 7 -37 7 -52c 0 -17 -3 -28 -10 -33c -9 -10 -22 -14 -39 -14c -50 0 -116 61 -198 183c -12 19 -30 47 -54 84h -18c 43 -73 78 -126 104 -160c 86 -106 165 -154 238 -142c 16 2 37 21 61 56c 7 10 18 28 32 56c 14 -26 28 -45 43 -57c 45 -40 101 -61 166 -61c 31 0 54 19 68 57c 2 12 6 32 10 61c 21 -30 39 -51 54 -62c 48 -39 101 -56 158 -49c 55 7 89 30 104 69c 2 11 3 30 3 55l -163 437c -12 19 -20 32 -22 39c -7 14 -4 22 7 25c 21 2 54 -20 97 -68c 14 -14 34 -39 61 -75h 21c -31 44 -56 78 -75 101c -62 67 -125 101 -188 101c -24 0 -43 -10 -57 -32c -14 -21 -16 -43 -7 -65l 169 -429c 4 -7 6 -11 6 -14c 10 -26 16 -47 16 -64c 0 -26 -10 -40 -32 -43c -28 -7 -58 9 -89 50c -9 12 -22 33 -39 64L 553 1076');
	$AlphaTab_Rendering_Glyphs_MusicFont.accentuation = new $AlphaTab_Rendering_Glyphs_LazySvg('M 748 286C 382 365 16 445 -350 525c 0 -23 0 -46 0 -69C -58 400 234 344 526 288 233 233 -58 178 -351 124c 0 -24 0 -49 0 -74 366 78 732 157 1099 236z');
	$AlphaTab_Rendering_Glyphs_MusicFont.heavyAccentuation = new $AlphaTab_Rendering_Glyphs_LazySvg('M -223 900L -275 900l 349 -1004l 353 1004l -128 0l -264 -750L -223 900');
	$AlphaTab_Rendering_Glyphs_MusicFont.waveHorizontal = new $AlphaTab_Rendering_Glyphs_LazySvg('M 1382 230c -43 32 -92 69 -146 111s -104 76 -149 105c -45 28 -89 51 -134 68s -86 26 -127 28c -47 -6 -87 -19 -119 -38s -79 -51 -143 -98c -64 -46 -117 -81 -160 -102c -42 -21 -90 -32 -141 -32c -79 0 -174 55 -285 166v -112c 132 -110 241 -193 327 -249s 166 -83 244 -83c 48 0 93 11 134 34c 40 22 88 56 144 101c 55 44 103 79 143 103c 40 24 85 37 135 40c 89 -7 182 -55 278 -146V 230');
	$AlphaTab_Rendering_Glyphs_MusicFont.waveVertical = new $AlphaTab_Rendering_Glyphs_LazySvg('M 165 4h 50c 47 44 86 85 115 122s 43 75 43 114c 0 31 -9 60 -28 85c -19 25 -47 55 -85 89s -66 64 -86 90c -19 26 -30 55 -31 88h 5c 0 31 9 60 27 86c 18 25 46 56 84 93s 66 68 86 95c 19 27 28 57 28 92c 0 33 -9 62 -28 89c -19 26 -47 57 -85 92c -37 35 -65 64 -84 89c -18 24 -27 51 -27 82c 0 17 22 59 67 127h -50c -59 -57 -100 -100 -124 -130c -23 -29 -35 -67 -35 -113c 0 -33 9 -62 27 -86c 18 -24 46 -53 85 -87c 38 -33 66 -63 85 -88c 18 -25 28 -55 28 -91c 0 -17 -8 -37 -26 -61s -42 -54 -73 -89c -31 -35 -53 -60 -64 -75c -41 -64 -61 -109 -61 -135c 1 -40 20 -80 56 -119c 35 -38 72 -77 110 -117c 38 -39 58 -76 60 -112c 0 -18 -4 -35 -13 -50C 210 72 192 44 165 4');
	$AlphaTab_Rendering_Glyphs_MusicFont.pickStrokeDown = new $AlphaTab_Rendering_Glyphs_LazySvg('M 0 -20h 816v 844h -74v -477h -672v 477H 0V -20');
	$AlphaTab_Rendering_Glyphs_MusicFont.pickStrokeUp = new $AlphaTab_Rendering_Glyphs_LazySvg('M 551 -7L 289 950l -264 -956h 66l 202 759l 193 -759H 551');
	$AlphaTab_Rendering_Glyphs_MusicFont.tremoloPickingThirtySecond = new $AlphaTab_Rendering_Glyphs_LazySvg('M -488 787v -250l 986 -505v 253L -488 787zM -488 1200v -250l 986 -505v 253L -488 1200zM -488 1612v -250l 986 -505v 261L -488 1612');
	$AlphaTab_Rendering_Glyphs_MusicFont.tremoloPickingSixteenth = new $AlphaTab_Rendering_Glyphs_LazySvg('M -488 787v -250l 986 -505v 253L -488 787zM -488 1200v -250l 986 -505v 253L -488 1200');
	$AlphaTab_Rendering_Glyphs_MusicFont.tremoloPickingEighth = new $AlphaTab_Rendering_Glyphs_LazySvg('M -488 787v -250l 986 -505v 253L -488 787');
	$AlphaTab_Rendering_Glyphs_MusicFont.upperMordent = new $AlphaTab_Rendering_Glyphs_LazySvg('M 16 714v -195l 425 -494c 34 -22 53 -33 56 -33c 19 0 33 6 39 20l 349 306c 17 17 36 28 56 33c 19 -6 33 -12 39 -19l 264 -307c 33 -22 53 -33 59 -33c 17 0 29 6 36 20l 349 306c 20 21 39 34 55 40c 20 -7 34 -16 40 -26l 224 -264v 194l -422 494c -32 22 -54 33 -66 33c -15 0 -26 -6 -33 -19l -346 -310c -15 -15 -37 -23 -66 -23c -16 0 -26 3 -29 9l -267 310c -25 22 -46 33 -62 33c -14 0 -25 -6 -33 -19l -346 -310c -18 -19 -40 -29 -66 -29c -14 0 -25 5 -32 16L 16 714');
	$AlphaTab_Rendering_Glyphs_MusicFont.lowerMordent = new $AlphaTab_Rendering_Glyphs_LazySvg('M -34 664v -195l 399 -458c 34 -37 58 -56 72 -56s 41 18 82 56l 352 310v -607h 99v 525l 191 -227c 38 -41 62 -62 72 -62c 10 0 38 16 82 50l 277 247c 64 53 99 80 102 82c 10 -2 24 -15 43 -38c 18 -23 33 -39 42 -50l 115 -142v 178l -349 412c -26 34 -51 52 -75 52c -12 0 -40 -19 -83 -59l -257 -230c -46 -46 -83 -69 -111 -69c -7 0 -12 1 -17 5c -4 3 -9 9 -16 17c -6 8 -11 14 -16 19v 607h -99v -492l -121 149c -31 34 -56 52 -75 52c -7 0 -15 -2 -22 -6c -7 -4 -18 -12 -32 -25c -14 -12 -25 -21 -33 -27l -290 -263c -35 -28 -57 -42 -66 -42c -15 0 -33 14 -56 42L -34 664');
	$AlphaTab_Rendering_Glyphs_MusicFont.turn = new $AlphaTab_Rendering_Glyphs_LazySvg('M 1141 739c -20 -17 -65 -56 -136 -115c -70 -60 -143 -117 -218 -172c -75 -54 -150 -100 -224 -136c -73 -36 -140 -54 -199 -54c -74 6 -138 45 -191 115s -82 143 -85 218c 8 119 77 179 208 179c 18 0 33 -3 45 -9c 11 -6 31 -20 59 -40c 28 -20 53 -35 75 -45c 22 -9 48 -14 79 -14c 89 0 146 39 170 117c 0 76 -31 132 -93 169c -62 36 -129 55 -202 55c -165 -8 -290 -53 -373 -135c -83 -82 -124 -182 -124 -301c 0 -85 22 -171 67 -255c 44 -84 107 -155 189 -213c 81 -57 174 -92 279 -105c 137 0 267 29 388 89c 121 59 240 137 356 232c 116 95 229 188 337 278c 42 35 97 69 165 101c 67 31 131 47 191 47c 92 -5 162 -35 210 -91c 47 -56 71 -121 71 -196c 0 -64 -18 -119 -55 -162c -36 -43 -85 -65 -146 -65c -21 0 -50 12 -89 38c -38 25 -68 43 -90 55c -22 11 -53 17 -93 17c -42 0 -79 -14 -113 -44c -33 -29 -50 -66 -50 -111c 0 -60 31 -104 95 -134c 63 -29 130 -44 200 -44c 102 0 192 24 269 72c 76 48 135 112 175 191c 40 78 60 161 60 249c 0 87 -20 168 -60 243c -40 74 -101 134 -184 179c -82 45 -185 68 -306 68c -116 0 -224 -22 -323 -66C 1375 894 1264 827 1141 739');
	$AlphaTab_Rendering_Glyphs_MusicFont.openNote = new $AlphaTab_Rendering_Glyphs_LazySvg('M 443 922c -124 0 -229 -45 -315 -135s -128 -197 -128 -322c 0 -130 42 -239 126 -326c 84 -87 189 -130 316 -130c 122 0 225 39 310 118c 84 78 130 177 138 295c 0 145 -41 263 -125 354S 575 915 443 922zM 426 96c -101 0 -182 35 -244 107c -61 71 -92 158 -92 260c 0 101 32 185 98 252s 150 100 254 100c 113 0 201 -36 264 -109s 94 -168 94 -288C 780 204 655 96 426 96');
	$AlphaTab_Rendering_Glyphs_MusicFont.stoppedNote = new $AlphaTab_Rendering_Glyphs_LazySvg('M 462 1009v -449h -445v -122h 445V -3h 118v 441h 452v 122h -452v 449H 462');
	$AlphaTab_Rendering_Glyphs_MusicFont.tempo = new $AlphaTab_Rendering_Glyphs_LazySvg('M 550 1578V 30l 43 8v 1679c 0 86 -41 160 -124 220s -173 90 -272 90c -114 0 -182 -46 -203 -139c 0 -84 41 -164 125 -239s 173 -112 270 -112C 457 1539 510 1552 550 1578zM 914 1686v -76h 540v 76H 914zM 914 1850h 540v 80h -540V 1850');
	$AlphaTab_Rendering_Glyphs_MusicFont.accidentalSharp = new $AlphaTab_Rendering_Glyphs_LazySvg('M 482 -275v -577h 93v 540l 135 -57v 343l -135 57v 551l 135 -62v 343l -135 57v 561h -93v -525l -223 93v 566h -93v -530l -135 52v -343l 135 -52v -551l -135 57v -348l 135 -52v -561h 93v 525L 482 -275zM 258 156v 551l 223 -93v -546L 258 156');
	$AlphaTab_Rendering_Glyphs_MusicFont.accidentalFlat = new $AlphaTab_Rendering_Glyphs_LazySvg('M -23 -1273h 93v 1300c 48 -27 86 -48 114 -62c 93 -41 176 -62 249 -62c 52 0 97 13 137 39c 39 26 70 70 91 132c 10 31 15 62 15 93c 0 100 -50 204 -150 311c -72 76 -157 143 -254 202c -41 24 -97 69 -166 135c -45 41 -88 84 -130 129V -1273zM 367 17c -7 -3 -13 -6 -20 -10c -17 -6 -33 -10 -46 -10c -27 0 -59 7 -93 23c -34 15 -79 46 -135 91v 644c 65 -65 131 -131 197 -197c 128 -156 192 -284 192 -384C 460 103 429 51 367 17');
	$AlphaTab_Rendering_Glyphs_MusicFont.accidentalNatural = new $AlphaTab_Rendering_Glyphs_LazySvg('M 38 472V -1283h 99v 792l 478 -132v 1738h -93v -775L 38 472zM 137 180l 385 -104v -429l -385 104V 180');
	$AlphaTab_Rendering_Glyphs_MusicFont.clefNeutral = new $AlphaTab_Rendering_Glyphs_LazySvg('M 915 1887v -1875h 337v 1875H 915zM 1477 1887v -1875h 337v 1875H 1477');
	$AlphaTab_Rendering_Glyphs_MusicFont.restSixtyFourth = new $AlphaTab_Rendering_Glyphs_LazySvg('M 705 -2202c 77 -26 144 -77 200 -150c 56 -73 101 -174 136 -305l 127 -547c -69 127 -197 191 -382 191c -46 0 -100 -7 -162 -23c -61 -15 -114 -46 -156 -92c -42 -46 -63 -108 -63 -185c 0 -65 23 -121 69 -168c 46 -46 104 -69 174 -69c 65 0 123 25 174 75c 50 50 75 104 75 162c 0 31 -7 63 -23 98c -15 34 -44 63 -87 87c 46 15 71 23 75 23c 7 0 27 -3 57 -11c 77 -23 148 -81 213 -174c 53 -73 86 -137 98 -191l 154 -638c -73 128 -198 192 -375 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174c 46 -46 104 -69 174 -69s 128 24 176 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98c -15 34 -42 65 -81 92c 19 7 40 15 63 23c 11 0 32 -3 63 -11c 73 -23 140 -80 202 -169c 61 -89 121 -179 179 -271l 41 0l -1032 4425l -107 0l 319 -1316c -73 128 -196 192 -370 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -105 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 171 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -87 87c 46 15 71 23 75 23c 7 0 26 -3 57 -11c 76 -23 150 -83 219 -180c 57 -77 86 -129 86 -156l 161 -667c -73 124 -198 186 -375 186c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -22c -69 -19 -125 -51 -167 -97c -42 -45 -63 -105 -63 -177c 0 -68 23 -126 69 -172c 46 -45 106 -68 179 -68c 65 0 122 23 171 71c 48 47 72 102 72 163c 0 30 -7 63 -23 97c -15 34 -44 65 -87 91c 23 7 46 14 69 21C 653 -2190 674 -2194 705 -2202');
	$AlphaTab_Rendering_Glyphs_MusicFont.accidentalDoubleFlat = new $AlphaTab_Rendering_Glyphs_LazySvg('M 67 25c 52 -27 93 -48 124 -62c 100 -45 176 -67 228 -67c 45 0 95 12 150 36V -1275h 88v 1300c 48 -27 88 -48 119 -62c 100 -45 183 -67 249 -67c 55 0 104 13 145 39c 41 26 72 71 93 137c 10 31 15 62 15 93c 0 107 -48 212 -145 316c -72 79 -163 143 -270 192c -34 17 -78 52 -132 104c -53 51 -108 107 -163 166v -529c -38 45 -72 83 -104 115c -55 55 -121 103 -197 141c -45 20 -102 68 -171 141c -41 41 -81 85 -119 131V -1275h 88V 25zM 369 15c -7 -3 -13 -6 -20 -10c -17 -6 -33 -10 -46 -10c -31 0 -64 7 -98 23c -34 15 -79 46 -135 91v 644c 65 -65 131 -131 197 -197c 131 -159 197 -287 197 -384C 462 101 431 49 369 15zM 962 15c -3 -3 -12 -6 -26 -10c -20 -6 -36 -10 -46 -10c -31 0 -63 7 -96 23c -33 15 -77 46 -132 91v 644c 65 -65 131 -131 197 -197c 131 -159 197 -287 197 -384C 1055 101 1024 49 962 15');
	$AlphaTab_Rendering_Glyphs_MusicFont.accidentalDoubleSharp = new $AlphaTab_Rendering_Glyphs_LazySvg('M 22 243c -32 -31 -48 -68 -48 -110c 0 -38 15 -71 45 -98c 30 -27 63 -40 98 -40c 38 0 70 14 96 43c 64 57 116 124 158 199c 41 75 62 146 62 213c -83 0 -172 -30 -268 -91C 99 317 51 278 22 243zM 18 872c 25 25 59 38 100 38c 38 0 70 -14 96 -43c 44 -38 86 -86 124 -144c 64 -96 96 -187 96 -273c -70 0 -140 18 -211 55c -70 36 -137 87 -201 151c -32 31 -48 70 -48 115C -26 810 -11 843 18 872zM 848 32c -25 -25 -60 -38 -105 -38c -41 0 -76 16 -105 48c -57 67 -94 113 -110 139c -60 96 -91 185 -91 268c 92 0 182 -28 268 -86c 79 -67 124 -105 134 -115c 31 -31 48 -72 48 -120C 886 96 874 64 848 32zM 838 656c 31 31 48 70 48 115c 0 38 -14 72 -43 100s -62 43 -100 43c -38 0 -73 -16 -105 -48c -51 -57 -88 -105 -110 -144c -60 -96 -91 -187 -91 -273c 105 0 211 41 316 124C 803 622 832 650 838 656');
	$AlphaTab_Model_MasterBar.maxAlternateEndings = 8;
	$AlphaTab_Rendering_AlternateEndingsBarRenderer.$padding = 3;
	$AlphaTab_Rendering_Glyphs_NoteHeadGlyph.graceScale = 0.699999988079071;
	$AlphaTab_Rendering_Glyphs_NoteHeadGlyph.noteHeadHeight = 9;
	$AlphaTab_Rendering_Glyphs_AccidentalGroupGlyph.$nonReserved = -3000;
	$AlphaTab_Rendering_Utils_AccidentalHelper.$accidentalNotes = [[1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1], [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1], [0, 0, 1, 0, 1, 0, 3, 1, 0, 1, 0, 1], [0, 3, 1, 0, 1, 0, 3, 1, 0, 1, 0, 1], [0, 3, 1, 0, 1, 0, 3, 1, 3, 1, 0, 1], [0, 3, 1, 3, 1, 0, 3, 1, 3, 1, 0, 1], [0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0], [0, 2, 0, 2, 0, 1, 2, 0, 2, 0, 2, 0], [1, 2, 0, 2, 0, 1, 2, 0, 2, 0, 2, 0], [1, 2, 0, 2, 0, 1, 2, 1, 2, 0, 2, 0], [1, 2, 1, 2, 0, 1, 2, 1, 2, 0, 2, 0], [1, 2, 1, 2, 0, 1, 2, 1, 2, 1, 2, 0], [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 0], [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1]];
	$AlphaTab_Rendering_ScoreBarRenderer.$stepsPerOctave = 7;
	$AlphaTab_Rendering_ScoreBarRenderer.$octaveSteps = [38, 32, 30, 26, 38];
	$AlphaTab_Rendering_ScoreBarRenderer.$sharpNoteSteps = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
	$AlphaTab_Rendering_ScoreBarRenderer.$flatNoteSteps = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6];
	$AlphaTab_Rendering_ScoreBarRenderer.$sharpKsSteps = [1, 4, 0, 3, 6, 2, 5];
	$AlphaTab_Rendering_ScoreBarRenderer.$flatKsSteps = [5, 2, 6, 3, 7, 4, 8];
	$AlphaTab_Rendering_ScoreBarRenderer.$lineSpacing = 8;
	$AlphaTab_Rendering_ScoreBarRenderer.noteStepCorrection = 1;
	$AlphaTab_Rendering_Glyphs_CrescendoGlyph.height = 17;
	$AlphaTab_Rendering_Glyphs_DynamicsGlyph.$glyphScale = 0.800000011920929;
	$AlphaTab_Rendering_Glyphs_LineRangedGlyph.$lineSpacing = 3;
	$AlphaTab_Rendering_Glyphs_LineRangedGlyph.$lineTopPadding = 8;
	$AlphaTab_Rendering_Glyphs_LineRangedGlyph.$lineTopOffset = 6;
	$AlphaTab_Rendering_Glyphs_LineRangedGlyph.$lineSize = 8;
	$AlphaTab_Rendering_Glyphs_NoteNumberGlyph.padding = 0;
	$AlphaTab_Model_Beat.whammyBarMaxPosition = 60;
	$AlphaTab_Model_Beat.whammyBarMaxValue = 24;
	$AlphaTab_Rendering_Glyphs_WhammyBarGlyph.$whammyMaxOffset = 60;
	$AlphaTab_Model_Note.$maxOffsetForSameLineSearch = 3;
	$AlphaTab_Model_BendPoint.maxPosition = 60;
	$AlphaTab_Model_BendPoint.maxValue = 12;
	$AlphaTab_Rendering_TabBarRenderer.lineSpacing = 10;
	$AlphaTab_Rendering_Layout_HorizontalScreenLayout.pagePadding = [20, 20, 20, 20];
	$AlphaTab_Rendering_Layout_HorizontalScreenLayout.groupSpacing = 20;
	$AlphaTab_Rendering_Layout_PageViewLayout.pagePadding = [40, 40, 40, 40];
	$AlphaTab_Rendering_Layout_PageViewLayout.widthOn100 = 950;
	$AlphaTab_Rendering_Layout_PageViewLayout.groupSpacing = 20;
	$AlphaTab_Environment.renderEngines = null;
	$AlphaTab_Environment.fileLoaders = null;
	$AlphaTab_Environment.layoutEngines = null;
	$AlphaTab_Environment.staveFactories = null;
	$AlphaTab_Environment.renderEngines = new (ss.makeGenericType(ss.Dictionary$2, [String, Function]))();
	$AlphaTab_Environment.fileLoaders = new (ss.makeGenericType(ss.Dictionary$2, [String, Function]))();
	$AlphaTab_Environment.layoutEngines = new (ss.makeGenericType(ss.Dictionary$2, [String, Function]))();
	$AlphaTab_Environment.staveFactories = new (ss.makeGenericType(ss.Dictionary$2, [String, Function]))();
	$AlphaTab_Environment.renderEngines.set_item('default', function(d) {
		return new $AlphaTab_Platform_JavaScript_Html5Canvas(d);
	});
	$AlphaTab_Environment.renderEngines.set_item('html5', function(d1) {
		return new $AlphaTab_Platform_JavaScript_Html5Canvas(d1);
	});
	$AlphaTab_Environment.fileLoaders.set_item('default', function() {
		return new $AlphaTab_Platform_JavaScript_JsFileLoader();
	});
	$AlphaTab_Environment.renderEngines.set_item('svg', function(d2) {
		return new $AlphaTab_Platform_Svg_SvgCanvas();
	});
	// default layout engines
	$AlphaTab_Environment.layoutEngines.set_item('default', function(r) {
		return new $AlphaTab_Rendering_Layout_PageViewLayout(r);
	});
	$AlphaTab_Environment.layoutEngines.set_item('page', function(r1) {
		return new $AlphaTab_Rendering_Layout_PageViewLayout(r1);
	});
	$AlphaTab_Environment.layoutEngines.set_item('horizontal', function(r2) {
		return new $AlphaTab_Rendering_Layout_HorizontalScreenLayout(r2);
	});
	// default staves 
	$AlphaTab_Environment.staveFactories.set_item('marker', function(l) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_MarkerEffectInfo());
	});
	//staveFactories.set("triplet-feel", functionl { return new EffectBarRendererFactory(new TripletFeelEffectInfo()); });
	$AlphaTab_Environment.staveFactories.set_item('tempo', function(l1) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_TempoEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('text', function(l2) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_TextEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('chords', function(l3) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_ChordsEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('trill', function(l4) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_TrillEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('beat-vibrato', function(l5) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_BeatVibratoEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('note-vibrato', function(l6) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_NoteVibratoEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('alternate-endings', function(l7) {
		return new $AlphaTab_Rendering_AlternateEndingsBarRendererFactory();
	});
	$AlphaTab_Environment.staveFactories.set_item('score', function(l8) {
		return new $AlphaTab_Rendering_ScoreBarRendererFactory();
	});
	$AlphaTab_Environment.staveFactories.set_item('crescendo', function(l9) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_CrescendoEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('dynamics', function(l10) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_DynamicsEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('tap', function(l11) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_TapEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('fade-in', function(l12) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_FadeInEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('let-ring', function(l13) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_LetRingEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('palm-mute', function(l14) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_PalmMuteEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('tab', function(l15) {
		return new $AlphaTab_Rendering_TabBarRendererFactory();
	});
	$AlphaTab_Environment.staveFactories.set_item('pick-stroke', function(l16) {
		return new $AlphaTab_Rendering_EffectBarRendererFactory(new $AlphaTab_Rendering_Effects_PickStrokeEffectInfo());
	});
	$AlphaTab_Environment.staveFactories.set_item('rhythm-up', function(l17) {
		return new $AlphaTab_Rendering_RhythmBarRendererFactory(0);
	});
	$AlphaTab_Environment.staveFactories.set_item('rhythm-down', function(l18) {
		return new $AlphaTab_Rendering_RhythmBarRendererFactory(1);
	});
	// staveFactories.set("fingering", functionl { return new EffectBarRendererFactory(new FingeringEffectInfo()); });   
	$AlphaTab_Audio_GeneralMidi.$_values = null;
	$AlphaTab_Audio_Generator_MidiFileHandler.defaultMetronomeKey = 37;
	$AlphaTab_Audio_Generator_MidiFileHandler.defaultDurationDead = 30;
	$AlphaTab_Audio_Generator_MidiFileHandler.defaultDurationPalmMute = 80;
	$AlphaTab_Audio_Generator_MidiFileHandler.restMessage = 0;
	$AlphaTab_Model_Track.$shortNameMaxLength = 10;
	$AlphaTab_IO_BitReader.$byteSize = 8;
	$AlphaTab_Importer_GpxFileSystem.headerBcFs = 'BCFS';
	$AlphaTab_Importer_GpxFileSystem.headerBcFz = 'BCFZ';
	$AlphaTab_Importer_GpxFileSystem.scoreGpif = 'score.gpif';
	$AlphaTab_Importer_GpxParser.$invalidId = '-1';
	$AlphaTab_Importer_GpxParser.$bendPointPositionFactor = 0.600000023841858;
	$AlphaTab_Importer_GpxParser.$bendPointValueFactor = 0.0399999991059303;
	$AlphaTab_Importer_Gp3To5Importer.$versionString = 'FICHIER GUITAR PRO ';
	$AlphaTab_Importer_Gp3To5Importer.$bendStep = 25;
	$AlphaTab_Importer_AlphaTexImporter.$eof = 0;
	$AlphaTab_Importer_AlphaTexImporter.$trackChannels = [0, 1];
})();
