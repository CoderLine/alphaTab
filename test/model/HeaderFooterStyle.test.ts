import { Score } from '@src/model/Score';
import { HeaderFooterStyle } from '@src/model/Score';
import { expect } from 'chai';

describe('HeaderFooterStyleTests', () => {
    it('buildTextSimple', () => {
        const score = new Score();
        score.title = 'Title';
        const style = new HeaderFooterStyle('%TITLE%');
        expect(style.buildText(score)).to.equal('Title');
    });

    it('buildTextMultiple', () => {
        const score = new Score();
        score.title = 'Title';
        const style = new HeaderFooterStyle('%TITLE% %TITLE%');
        expect(style.buildText(score)).to.equal('Title Title');
    });

    it('buildTextReuse', () => {
        const score = new Score();
        score.title = 'Title';
        const style = new HeaderFooterStyle('%TITLE% %TITLE%');
        expect(style.buildText(score)).to.equal('Title Title');
        expect(style.buildText(score)).to.equal('Title Title');
    });

    it('buildTextMultipleUnknown', () => {
        const score = new Score();
        score.title = 'Title';
        const style = new HeaderFooterStyle('%TITLE% %TITLE% %UNKNOWN% %INVALID%');
        expect(style.buildText(score)).to.equal('Title Title  ');
    });

    it('buildTextEmptyIfMissingPlaceholderValue', () => {
        const score = new Score();
        score.words = '';
        const style = new HeaderFooterStyle('Words by %WORDS%');
        expect(style.buildText(score)).to.equal('');
    });

    it('buildTextAll', () => {
        const score = new Score();
        score.title = 'Title';
        score.subTitle = 'Subtitle';
        score.artist = 'Artist';
        score.album = 'Album';
        score.words = 'Words';
        score.music = 'Music';
        score.tab = 'Tab';
        score.copyright = 'Copyright';

        const style = new HeaderFooterStyle('%TITLE% %SUBTITLE% %ARTIST% %ALBUM% %WORDS% %MUSIC% %TABBER% %COPYRIGHT%');
        expect(style.buildText(score)).to.equal('Title Subtitle Artist Album Words Music Tab Copyright');
    });
});
