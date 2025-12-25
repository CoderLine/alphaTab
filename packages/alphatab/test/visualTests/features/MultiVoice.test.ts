import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Settings } from '@coderline/alphatab/Settings';
import { TestPlatform } from 'test/TestPlatform';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

describe('MultiVoiceTests', () => {
    describe('displace', async () => {
        async function test(tex: string) {
            const settings = new Settings();
            settings.display.justifyLastSystem = true;
            settings.display.layoutMode = LayoutMode.Parchment;

            const fileName = TestPlatform.currentTestName.replaceAll(':', '_').replaceAll(',', '').replaceAll(' ', '_');
            await VisualTestHelper.runVisualTestTex(
                `
                \\track {defaultSystemsLayout 1}
                \\staff
                \\voiceMode barWise
                ${tex}
            `,
                `test-data/visual-tests/multivoice/${fileName}.png`,
                settings,
                o => {
                    o.runs[0].width = 600;
                }
            );
        }

        // v1 Quarter Single-v2 Quarter Single
        it('v1 Quarter Single-v2 Quarter Single-Automatic Stem', async () =>
            await test(
                `
                \\voice 
                E5*5
                \\voice 
                C5 D5 E5 F5 G5
            `
            ));
        it('v1 Quarter Single-v2 Quarter Single-Reversed Stem', async () =>
            await test(
                `
                \\voice 
                E5{beam down}*5 
                \\voice    
                C5{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            `
            ));
        it('v1 Quarter Single-v2 Quarter Single-Same Stem', async () =>
            await test(
                `  
                \\voice 
                E5{beam up}*5 
                \\voice   
                C5{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            `
            ));

        // v1 Quarter Chord-v2 Quarter Single
        it('v1 Quarter Chord-v2 Quarter Single-Automatic Stem', async () =>
            await test(
                `  
                \\voice 
                (E5 F5)*5  
                \\voice 
                C5 D5 E5 F5 G5
            `
            ));
        it('v1 Quarter Chord-v2 Quarter Single-Reversed Stem', async () =>
            await test(
                `
                \\voice 
                (E5 F5){beam down}*5  
                \\voice 
                C5{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));
        it('v1 Quarter Chord-v2 Quarter Single-Same Stem', async () =>
            await test(
                `
                \\voice 
                (E5 F5){beam up}*5  
                \\voice 
                C5{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));

        // v1 Quarter Chord-v2 Quarter Single
        it('v1 Quarter Chord-v2 Quarter Chord-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5)*5  
            \\voice 
            (C5 B4) (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            `
            ));
        it('v1 Quarter Chord-v2 Quarter Chord-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5){beam down}*5  
            \\voice 
            (C5 B4){beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));
        it('v1 Quarter Chord-v2 Quarter Chord-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5){beam up}*5  
            \\voice 
            (C5 B4){beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));

        // v1 Quarter Single-v2 Half Single
        it('v1 Quarter Single-v2 Half Single-Automatic Stem', async () =>
            await test(
                `
            \\ts (10 4)
            \\voice 
            E5.4 r E5.4 r E5.4 r E5.4 r E5.4 r 
            \\voice 
            C5.2 D5 E5 F5 G5
            `
            ));
        it('v1 Quarter Single-v2 Half Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            E5.4{beam down} r E5.4{beam down} r E5.4{beam down} r E5.4{beam down} r E5.4{beam down} r 
            \\voice   
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            `
            ));
        it('v1 Quarter Single-v2 Half Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            E5.4 r E5.4 r E5.4 r E5.4 r E5.4 r 
            \\voice   
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            `
            ));

        // v1 Quarter Chord, Half Single
        it('v1 Quarter Chord-Half Chord-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r
            \\voice 
            C5.2 D5 E5 F5 G5
            `
            ));
        it('v1 Quarter Chord-Half Chord-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r
            \\voice 
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));
        it('v1 Quarter Chord-Half Chord-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r
            \\voice 
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));

        // v1 Quarter Chord-v2 Half Chord
        it('v1 Quarter Chord-v2 Half Chord-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r (E5 F5).4 r
            \\voice 
            (C5 B4).2 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            `
            ));
        it('v1 Quarter Chord-v2 Half Chord-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).4{beam down} r (E5 F5).4{beam down} r (E5 F5).4{beam down} r (E5 F5).4{beam down} r (E5 F5).4{beam down} r
            \\voice 
            (C5 B4).2{beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));
        it('v1 Quarter Chord-v2 Half Chord-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).4{beam up} r (E5 F5).4{beam up} r (E5 F5).4{beam up} r (E5 F5).4{beam up} r (E5 F5).4 r{beam up}
            \\voice 
            (C5 B4).2{beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));

        // v1 8th Flag Single-v2 8th Flag Single
        it('v1 8th Flag Single-v2 8th Flag Single-Automatic Stem', async () =>
            await test(
                `
            \\ts (5 4)
            \\voice 
            E5.8 r E5 r E5 r E5 r E5 r
            \\voice 
            C5 r D5 r E5 r F5 r G5 r
            `
            ));
        it('v1 8th Flag Single-v2 8th Flag Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            E5.8{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r
            \\voice   
            C5{beam up} r D5{beam up} r E5{beam up} r F5{beam up} r G5 {beam up} r
            `
            ));
        it('v1 8th Flag Single-v2 8th Flag Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            E5.8{beam up} r E5{beam up} r E5{beam up} r E5{beam up} r E5{beam up} r
            \\voice   
            C5{beam up} r D5{beam up} r E5{beam up} r F5{beam up} r G5 {beam up} r
            `
            ));

        // v1 8th Flag Chord, V2 8th Flag Single
        it('v1 8th Flag Chord-V2 8th Flag Single-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r   
            \\voice 
            C5 r D5 r E5 r F5 r G5 r
            `
            ));
        it('v1 8th Flag Chord-V2 8th Flag Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r   
            \\voice 
            C5{beam up} r D5{beam up} r E5{beam up} r F5{beam up} r G5{beam up} r
            `
            ));
        it('v1 8th Flag Chord-V2 8th Flag Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r   
            \\voice 
            C5{beam up} r D5{beam up} r E5{beam up} r F5{beam up} r G5{beam up} r
            `
            ));

        // v1 8th Flag Chord, V2 8th Flag Chord
        it('v1 8th Flag Chord-V2 8th Flag Chord-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r   
            \\voice 
            (C5 B4) r (D5 C5) r (E5 D5) r (F5 E5) r (G5 F5) r 
            `
            ));
        it('v1 8th Flag Chord-V2 8th Flag Chord-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r   
            \\voice 
            (C5 B4){beam up} r (D5 C5){beam up} r (E5 D5){beam up} r (F5 E5){beam up} r (G5 F5){beam up} r
            `
            ));
        it('v1 8th Flag Chord-V2 8th Flag Chord-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r   
            \\voice 
            (C5 B4){beam up} r (D5 C5){beam up} r (E5 D5){beam up} r (F5 E5){beam up} r (G5 F5){beam up} r
            `
            ));

        // v1 8th Flag Single-v2 Quarter Single
        it('v1 8th Flag Single-v2 Quarter Single-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            E5.8 r E5 r E5 r E5 r E5 r
            \\voice 
            C5.4 D5 E5 F5 G5
            `
            ));
        it('v1 8th Flag Single-v2 Quarter Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            E5.8{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r
            \\voice   
            C5.4{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            `
            ));
        it('v1 8th Flag Single-v2 Quarter Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            E5.8{beam up} r E5{beam up} r E5{beam up} r E5{beam up} r E5{beam up} r
            \\voice   
            C5.4{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            `
            ));

        // v1 8th Flag Chord-v2 Quarter Single
        it('v1 8th Flag Chord-v2 Quarter Single-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r   
            \\voice 
            C5.4 D5 E5 F5 G5
            `
            ));
        it('v1 8th Flag Chord-v2 Quarter Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r   
            \\voice 
            C5.4{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));
        it('v1 8th Flag Chord-v2 Quarter Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r   
            \\voice 
            C5.4{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));

        // v1 8th Flag Chord-v2 Quarter Chord
        it('v1 8th Flag Chord-v2 Quarter Chord-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r   
            \\voice 
            (C5 B4).4 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            `
            ));
        it('v1 8th Flag Chord-v2 Quarter Chord-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam down}  r (E5 F5){beam down}  r (E5 F5){beam down}  r (E5 F5){beam down}  r (E5 F5){beam down}  r   
            \\voice 
            (C5 B4).4{beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));
        it('v1 8th Flag Chord-v2 Quarter Chord-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8 {beam up} r (E5 F5) {beam up} r (E5 F5) {beam up} r (E5 F5) {beam up} r (E5 F5) {beam up} r   
            \\voice 
            (C5 B4).4 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));

        // v1 8th Flag Single-v2 Half Single
        it('v1 8th Flag Single-v2 Half Single-Automatic Stem', async () =>
            await test(
                `
            \\ts (5 2)
            \\voice 
            E5.8 r r r E5 r r r E5 r r r E5 r r r E5 r r r
            \\voice 
            C5.2 D5 E5 F5 G5
            `
            ));
        it('v1 8th Flag Single-v2 Half Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            E5.8{beam down} r r r E5{beam down} r r r E5{beam down} r r r E5{beam down} r r r E5{beam down} r r r
            \\voice   
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            `
            ));
        it('v1 8th Flag Single-v2 Half Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            E5.8{beam up} r r r E5{beam up} r r r E5{beam up} r r r E5{beam up} r r r E5{beam up} r r r
            \\voice   
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5 {beam up}
            `
            ));

        // v1 8th Flag Chord-v2 Half Single
        it('v1 8th Flag Chord-v2 Half Single-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8 r r r (E5 F5) r r r (E5 F5) r r r (E5 F5) r r r (E5 F5) r r r
            \\voice 
            C5.2 D5 E5 F5 G5
            `
            ));
        it('v1 8th Flag Chord-v2 Half Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam down} r r r (E5 F5){beam down} r r r (E5 F5){beam down} r r r (E5 F5){beam down} r r r (E5 F5){beam down} r r r  
            \\voice 
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));
        it('v1 8th Flag Chord-v2 Half Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r
            \\voice 
            C5.2{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));

        // v1 8th Flag Chord-v2 Half Chord
        it('v1 8th Flag Chord-v2 Half Chord-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8 r r r (E5 F5) r r r (E5 F5) r r r (E5 F5) r r r (E5 F5) r r r   
            \\voice 
            (C5 B4).2 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            `
            ));
        it('v1 8th Flag Chord-v2 Half Chord-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam down}  r r r (E5 F5){beam down}  r r r (E5 F5){beam down}  r r r (E5 F5){beam down}  r r r (E5 F5){beam down}  r r r
            \\voice 
            (C5 B4).2{beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));
        it('v1 8th Flag Chord-v2 Half Chord-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).8{beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r (E5 F5){beam up} r r r  
            \\voice 
            (C5 B4).2 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));

        // v1 Full Single-v2 Full Single
        it('v1 Full Single-v2 Full Single-Automatic Stem', async () =>
            await test(
                `
            \\ts (5 1)
            \\voice 
            E5.1 E5 E5 E5 E5
            \\voice 
            C5.1 D5 E5 F5 G5
            `
            ));
        it('v1 Full Single-v2 Full Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            E5.1{beam down} E5{beam down} E5{beam down} E5{beam down} E5{beam down}
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));
        it('v1 Full Single-v2 Full Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            E5.1{beam up} E5{beam up} E5{beam up} E5{beam up} E5{beam up}
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));

        // v1 Full Chord-v2 Full Single
        it('v1 Full Chord-v2 Full Single-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).1 (E5 F5) (E5 F5) (E5 F5) (E5 F5)
            \\voice 
            C5.1 D5 E5 F5 G5
            `
            ));
        it('v1 Full Chord-v2 Full Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).1{beam down} (E5 F5){beam down} (E5 F5){beam down} (E5 F5){beam down} (E5 F5){beam down}
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));
        it('v1 Full Chord-v2 Full Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).1{beam up} (E5 F5){beam up} (E5 F5){beam up} (E5 F5){beam up} (E5 F5){beam up}
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));

        // v1 Full Chord-v2 Full Chord
        it('v1 Full Chord-v2 Full Chord-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).1 (E5 F5) (E5 F5) (E5 F5) (E5 F5)
            \\voice 
            (C5 B4).1 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            `
            ));
        it('v1 Full Chord-v2 Full Chord-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).1{beam down} (E5 F5){beam down} (E5 F5){beam down} (E5 F5){beam down} (E5 F5){beam down}
            \\voice 
            (C5 B4).1 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));
        it('v1 Full Chord-v2 Full Chord-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).1{beam up} (E5 F5){beam up} (E5 F5){beam up} (E5 F5){beam up} (E5 F5){beam up}
            \\voice 
            (C5 B4).1 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));

        ////

        // v1 Half Single-v2 Full Single
        it('v1 Half Single-v2 Full Single-Automatic Stem', async () =>
            await test(
                `
            \\ts (5 1)
            \\voice 
            E5.2 r E5 r E5 r E5 r E5 r
            \\voice 
            C5.1 D5 E5 F5 G5
            `
            ));
        it('v1 Half Single-v2 Full Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            E5.2{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r E5{beam down} r
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));
        it('v1 Half Single-v2 Full Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            E5.2{beam up} r E5{beam up} r E5{beam up} r E5{beam up} r E5{beam up} r
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));

        // v1 Half Chord-v2 Full Single
        it('v1 Half Chord-v2 Full Single-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).2 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r
            \\voice 
            C5.1 D5 E5 F5 G5
            `
            ));
        it('v1 Half Chord-v2 Full Single-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).2{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));
        it('v1 Half Chord-v2 Full Single-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).2{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r
            \\voice 
            C5.1{beam up} D5{beam up} E5{beam up} F5{beam up} G5{beam up}
            `
            ));

        // v1 Half Chord-v2 Full Chord
        it('v1 Half Chord-v2 Full Chord-Automatic Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).2 r (E5 F5) r (E5 F5) r (E5 F5) r (E5 F5) r
            \\voice 
            (C5 B4).1 (D5 C5) (E5 D5) (F5 E5) (G5 F5)
            `
            ));
        it('v1 Half Chord-v2 Full Chord-Reversed Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).2{beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r (E5 F5){beam down} r
            \\voice 
            (C5 B4).1 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));
        it('v1 Half Chord-v2 Full Chord-Same Stem', async () =>
            await test(
                `
            \\voice 
            (E5 F5).2{beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r (E5 F5){beam up} r
            \\voice 
            (C5 B4).1 {beam up} (D5 C5){beam up} (E5 D5){beam up} (F5 E5){beam up} (G5 F5){beam up}
            `
            ));

        it('v1 Eighth Single-v2 Eighth Single-Automatic-Stem', async () => await test(`
            \\voice 
            E5.8*10
            \\voice 
            C5*2 D5*2 E5*2 F5*2 G5*2
        `));

        it('v1 Eighth Chord-v2 Eighth Single-Automatic-Stem', async () => await test(`
            \\voice 
            (E5 F5).8*10
            \\voice 
            C5*2 D5*2 E5*2 F5*2 G5*2
        `));

        it('v1 Eighth Chord-v2 Eighth Chord-Automatic-Stem', async () => await test(`
            \\voice 
            (E5 F5).8*10
            \\voice 
            (C5 B4)*2 (D5 C5)*2 (E5 D5)*2 (F5 E5)*2 (G5 F5)*2
        `));

        it('v1 16th Single-v2 Eighth Single-Automatic-Stem', async () => await test(`
            \\voice 
            E5.16*20
            \\voice 
            C5.8*2 D5*2 E5*2 F5*2 G5*2
        `));

        it('v1 16th Chord-v2 Eighth Single-Automatic-Stem', async () => await test(`
            \\voice 
            (E5 F5).16*20
            \\voice 
            C5.8*2 D5*2 E5*2 F5*2 G5*2
        `));

        it('v1 16th Chord-v2 Eighth Chord-Automatic-Stem', async () => await test(`
            \\voice 
            (E5 F5).16*20
            \\voice 
            (C5 B4).8*2 (D5 C5)*2 (E5 D5)*2 (F5 E5)*2 (G5 F5)*2
        `));

        // Known issues: (beat counts refer to the beats which "overlap", not the rests or filler beats)

        // Accepted due to force of same stem instead of different directions for voices:
        // * Bar 3 Beat 2: the note heads should be swapped (lowest goes to the 'correct' side'), stem is also not long enough due to displace
        // * Bar 6 Beat 2: the note heads should be swapped (lowest goes to the 'correct' side'), stem is also not long enough due to displace
        // * Bar 9 Beat 3-5: Displace logic breaks
        // * Bar 12 beat 3: the note heads should be swapped (lowest goes to the 'correct' side'), stem is also not long enough due to displace
        // * Bar 15 Beat 2: the note heads should be swapped (lowest goes to the 'correct' side'), stem is also not long enough due to displace
        // * Bar 15 Beat 3: there is an overlap
        // * Bar 15 Beat 4: the half note is not visible (check for exact overlaps and try to go back to 'correct' side?)
        // * Bar 18 Beat 3: Displace logic breaks
        // * Bar 18 Beat 4: Displace logic breaks
        // * Bar 18 Beat 5: Displace logic breaks
        // * Bar 21 Beat 2: the note heads should be swapped (lowest goes to the 'correct' side'), stem is also not long enough due to displace
        // * Bar 24 Beat 2: the note heads should be swapped (lowest goes to the 'correct' side'), stem is also not long enough due to displace
        // * Bar 27 Beat 2: the note heads should be swapped (lowest goes to the 'correct' side'), stem is also not long enough due to displace
        // * Bar 27 Beat 3: Displace logic breaks
        // * Bar 27 Beat 4: the half note is not visible (check for exact overlaps and try to go back to 'correct' side?)
        // * Bar 30 Beat 2: the note heads should be swapped (lowest goes to the 'correct' side'), stem is also not long enough due to displace
        // * Bar 33 Beat 2: the note heads should be swapped (lowest goes to the 'correct' side'), stem is also not long enough due to displace
        // * Bar 33 Beat 4: one note head not visible (check for exact overlaps and try to go back to 'correct' side?)
        // * Bar 36 Beat 3: Displace logic breaks
        // * Bar 36 Beat 4: Displace logic breaks
        // * Bar 36 Beat 5: Displace logic breaks
        // * Bar 39 Beat 2: one note head not visible (check for exact overlaps and try to go back to 'correct' side?)
        // * Bar 42 Beat 2: one note head not visible (check for exact overlaps and try to go back to 'correct' side?)
        // * Bar 42 Beat 4: one note head not visible (check for exact overlaps and try to go back to 'correct' side?)
        // * Bar 45 Beat 3: Displace logic breaks
        // * Bar 45 Beat 4: Displace logic breaks
        // * Bar 45 Beat 5: Displace logic breaks
        // * Bar 51 Beat 3: one note head not visible (check for exact overlaps and try to go back to 'correct' side?)
        // * Bar 54 Beat 3: Displace logic breaks
        // * Bar 54 Beat 4: Displace logic breaks
        // * Bar 54 Beat 5: Displace logic breaks
        // * Bar 60 Beat 4: one note head not visible (check for exact overlaps and try to go back to 'correct' side?)
        // * Bar 63 Beat 3: Displace logic breaks
        // * Bar 63 Beat 4: Displace logic breaks
        // * Bar 63 Beat 5: Displace logic breaks
    });
});
