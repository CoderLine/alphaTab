import { GpifParser } from '@coderline/alphatab/importer/GpifParser';
import { Settings } from '@coderline/alphatab/Settings';
import { expect } from 'chai';

describe('GpifParser', () => {
    describe('drum string clamping', () => {
        it('clamps drum note string 6 to 5', () => {
            // Minimal GPIF with drum track and note with String 6 (0-based: 5 -> our string 6)
            const gpif = `<?xml version="1.0" encoding="utf-8"?>
<GPIF>
<GPRevision>1</GPRevision>
<Score><Title></Title><SubTitle></SubTitle><Artist></Artist><Album></Album><Words></Words><Music></Music><Copyright></Copyright><Tabber></Tabber><Instructions></Instructions><Notices></Notices></Score>
<MasterTrack><Tracks>0</Tracks></MasterTrack>
<Tracks>
<Track id="0">
<Name>Drums</Name>
<ShortName>Dr</ShortName>
<Color>0 0 0</Color>
<Instrument ref="drumkit"/>
<GeneralMidi table="Percussion"><Program>0</Program><Port>0</Port><PrimaryChannel>9</PrimaryChannel><SecondaryChannel>9</SecondaryChannel></GeneralMidi>
<Properties>
<Property name="Tuning"><Pitches>0 0 0 0 0 0</Pitches></Property>
</Properties>
</Track>
</Tracks>
<MasterBars>
<MasterBar><Bars>0</Bars><Key><AccidentalCount>0</AccidentalCount><Mode>Major</Mode></Key></MasterBar>
</MasterBars>
<Bars>
<Bar id="0"><Voices>0</Voices></Bar>
</Bars>
<Voices>
<Voice id="0"><Beats>0</Beats></Voice>
</Voices>
<Beats>
<Beat id="0"><Rhythm ref="0"/><Notes>0</Notes><Properties></Properties></Beat>
</Beats>
<Rhythms>
<Rhythm id="0"><NoteValue>Quarter</NoteValue></Rhythm>
</Rhythms>
<Notes>
<Note id="0">
<InstrumentArticulation>36</InstrumentArticulation>
<Properties>
<Property name="String"><String>5</String></Property>
<Property name="Fret"><Fret>36</Fret></Property>
</Properties>
</Note>
</Notes>
</GPIF>`;

            const parser = new GpifParser();
            parser.parseXml(gpif, new Settings());

            const staff = parser.score.tracks[0].staves[0];
            expect(staff.isPercussion).to.be.true;

            const note = parser.score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
            // GPIF String 5 = 0-based index 5 -> our string 6. Should be clamped to 5.
            expect(note.string).to.equal(5);
            expect(note.percussionArticulation).to.equal(36);
        });

        it('preserves drum note string 1-5', () => {
            const gpif = `<?xml version="1.0" encoding="utf-8"?>
<GPIF>
<GPRevision>1</GPRevision>
<Score><Title></Title><SubTitle></SubTitle><Artist></Artist><Album></Album><Words></Words><Music></Music><Copyright></Copyright><Tabber></Tabber><Instructions></Instructions><Notices></Notices></Score>
<MasterTrack><Tracks>0</Tracks></MasterTrack>
<Tracks>
<Track id="0">
<Name>Drums</Name>
<ShortName>Dr</ShortName>
<Color>0 0 0</Color>
<Instrument ref="drumkit"/>
<GeneralMidi table="Percussion"><Program>0</Program><Port>0</Port><PrimaryChannel>9</PrimaryChannel><SecondaryChannel>9</SecondaryChannel></GeneralMidi>
<Properties>
<Property name="Tuning"><Pitches>0 0 0 0 0 0</Pitches></Property>
</Properties>
</Track>
</Tracks>
<MasterBars>
<MasterBar><Bars>0</Bars><Key><AccidentalCount>0</AccidentalCount><Mode>Major</Mode></Key></MasterBar>
</MasterBars>
<Bars>
<Bar id="0"><Voices>0</Voices></Bar>
</Bars>
<Voices>
<Voice id="0"><Beats>0 1 2 3 4</Beats></Voice>
</Voices>
<Beats>
<Beat id="0"><Rhythm ref="0"/><Notes>0</Notes><Properties></Properties></Beat>
<Beat id="1"><Rhythm ref="0"/><Notes>1</Notes><Properties></Properties></Beat>
<Beat id="2"><Rhythm ref="0"/><Notes>2</Notes><Properties></Properties></Beat>
<Beat id="3"><Rhythm ref="0"/><Notes>3</Notes><Properties></Properties></Beat>
<Beat id="4"><Rhythm ref="0"/><Notes>4</Notes><Properties></Properties></Beat>
</Beats>
<Rhythms>
<Rhythm id="0"><NoteValue>Quarter</NoteValue></Rhythm>
</Rhythms>
<Notes>
<Note id="0"><InstrumentArticulation>36</InstrumentArticulation><Properties><Property name="String"><String>0</String></Property><Property name="Fret"><Fret>36</Fret></Property></Properties></Note>
<Note id="1"><InstrumentArticulation>36</InstrumentArticulation><Properties><Property name="String"><String>1</String></Property><Property name="Fret"><Fret>36</Fret></Property></Properties></Note>
<Note id="2"><InstrumentArticulation>36</InstrumentArticulation><Properties><Property name="String"><String>2</String></Property><Property name="Fret"><Fret>36</Fret></Property></Properties></Note>
<Note id="3"><InstrumentArticulation>36</InstrumentArticulation><Properties><Property name="String"><String>3</String></Property><Property name="Fret"><Fret>36</Fret></Property></Properties></Note>
<Note id="4"><InstrumentArticulation>36</InstrumentArticulation><Properties><Property name="String"><String>4</String></Property><Property name="Fret"><Fret>36</Fret></Property></Properties></Note>
</Notes>
</GPIF>`;

            const parser = new GpifParser();
            parser.parseXml(gpif, new Settings());

            const beats = parser.score.tracks[0].staves[0].bars[0].voices[0].beats;
            // GPIF String 0->4 = our strings 1->5
            expect(beats[0].notes[0].string).to.equal(1);
            expect(beats[1].notes[0].string).to.equal(2);
            expect(beats[2].notes[0].string).to.equal(3);
            expect(beats[3].notes[0].string).to.equal(4);
            expect(beats[4].notes[0].string).to.equal(5);
        });
    });
});
