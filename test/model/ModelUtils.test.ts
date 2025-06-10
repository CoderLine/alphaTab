import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { Settings } from '@src/Settings';
import { expect } from 'chai';

describe('ModelUtilsTests', () => {
    function trimTest(tex: string, expectedBars: number) {
        const importer = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());

        const score = importer.readScore();
        expect(score.masterBars.length).to.equal(expectedBars);
    }

    it('trimEmptyBarsAtEndFullyEmpty', () => {
        trimTest('. | | | | | ', 1);
    });

    it('trimEmptyBarsAtEndSomeSet', () => {
        trimTest('C4 | C4 | C4 | | | ', 3);
    });

    it('trimEmptyBarsAtEndMultiTrackMixed', () => {
        trimTest(
            `
            \\track T1
            C4 | C4 | C4 | C4 | | | |
            \\track T2
            C4 | C4 | C4 | C4 | C4 | | |    
        `,
            5
        );
    });

    it('trimEmptyBarsAtEndNonContentChange', () => {
        trimTest(
            `
            C4 | C4 | \\tempo 80 | \\ts 3 4 | | | |
        `,
            4
        );
    });
});
